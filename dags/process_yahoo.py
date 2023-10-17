import boto3
import psycopg2
import pandas as pd

from extract_yahoo import extract_from_yahoo_api
from transform_raw_data_yahoo import transform_yahoo_raw_to_df
from transform_data_yahoo import (
  merge_roster_into_teams,
  adjust_player_ratings,
  truncate_and_map_player_ids
)
from yahoo_helper import (
  get_yahoo_access_token,
  get_all_league_ids
)
from upload_to_aws import upload_league_data_to_dynamo
from util import invoke_lambda


week_list = list(range(1, 25))
week_params = ";week=" + ",".join(map(str, week_list))

league_api_endpoints = {
    'settings': ["league", "settings"],
    'teams': ["league", "teams", "standings"],
    'roster': ["league", "teams", "roster"],
    'scoreboard': ["league", f"scoreboard{week_params}"],
    'draft': ["league", "draftresults"],
    'players': [],
    'players_id_map': []
}


def process_yahoo_league(event, context):
    params = event["queryStringParameters"]

    league_id = params.get("leagueId")
    league_year = params.get("leagueYear")
    access_token = params.get("yahooAccessToken")
    all_league_keys = params.get("allLeagueKeys")

    print(f"Starting processing for {league_id} {league_year}")

    league_data = {
        'leagueId': league_id,
        'leagueYear': league_year,
        'allLeagueKeys': all_league_keys,
        'platform': "yahoo"
    }
    for endpoint in league_api_endpoints:
        url_params = league_api_endpoints[endpoint]

        data_endpoint = extract_from_yahoo_api(access_token, league_id, endpoint, url_params)
        league_data[endpoint] = transform_yahoo_raw_to_df(endpoint, data_endpoint)

    # Transforms
    league_data["teams"] = merge_roster_into_teams(league_data)
    league_data["players"] = adjust_player_ratings(league_data)
    league_data["players"] = truncate_and_map_player_ids(league_data)

    league_data.pop("roster", None)
    league_data.pop("players_id_map", None)

    # Data serialization and upload data to dynamo, cleaning nan values
    for key in league_data.keys():
        if isinstance(league_data[key], pd.DataFrame):
            dict_raw = league_data[key].to_dict(orient='records')
            dict_clean = [{k:v for k, v in x.items() if v == v } for x in dict_raw]
            
            league_data[key] = dict_clean

    upload_league_data_to_dynamo(league_data)

    print("Complete...")
    
    return {
        'statusCode': 200,
        'body': 'Success'
    }


def process_all_yahoo_leagues(event, context):
    lambda_client = boto3.client('lambda', region_name='us-east-1')

    db_pass = invoke_lambda(lambda_client, 'get_secret', {'key': 'supabase_password'})
    conn = psycopg2.connect(
        host='db.lsygyiijbumuybwyuvrn.supabase.co',
        port='5432',
        database='postgres',
        user='postgres',
        password=db_pass
    )
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT l2.linkedid, l1.yahoorefreshtoken
        FROM leagueids l1
        LEFT JOIN linkedids l2
            ON l1.leagueid=l2.mainid
        WHERE active
            AND platform = 'yahoo'
            AND (NOW() - LastViewed < INTERVAL '7 day')
            AND l2.linkedid LIKE (SELECT MAX(SUBSTRING(linkedid, 1, 3)) FROM linkedids) || '%' 
        """
    )
    res_query = cursor.fetchall()

    num_leagues = len(res_query)
    num_failed = 0

    for league_info in res_query:
        league_id = league_info[0]
        access_token = get_yahoo_access_token(league_info[1])["yahoo_access_token"]

        process_payload = {
            "queryStringParameters": {
                "leagueId": league_id,
                "leagueYear": 2024,
                "allLeagueKeys": get_all_league_ids(access_token),
                "yahooAccessToken": access_token,
            }
        }
        process_res = invoke_lambda(lambda_client, 'process_yahoo_league', process_payload)

        if not process_res:
            num_failed += 1
            print(f"League {league_id.ljust(11)} failed")
        else:
            update_payload = {
                "queryStringParameters": {
                    "leagueId": league_id,
                    "method": "lastUpdated"
                }
            }
            invoke_lambda(lambda_client, "update_league_info", update_payload)

    print(f"Successfully updated, {num_failed}/{num_leagues} failed...")

    return {
        'statusCode': 200,
        'body': "Test response"
    }