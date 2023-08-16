NBA_GAME_KEY = 418
NFL_GAME_KEY = 423

import requests
import pandas as pd

from extract_yahoo import extract_from_yahoo_api
from transform_raw_data_yahoo import transform_yahoo_raw_to_df
from upload_to_aws import upload_league_data_to_dynamo

def get_all_league_games(league_id, access_token):
    url = "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys/?format=json_f"
    headers = {"Authorization": f"Bearer {access_token}"}

    league_games = []

    res = requests.get(url, headers=headers)

    if res.status_code == 200:
        data = res.json()

        games = data["fantasy_content"]["users"][0]["user"]["games"]

        for game in games:
            if game["game"]["code"] == "nfl":
                game_key = game["game"]["game_key"]
                league_key = f"{game_key}.l.{league_id}"
                league_year = int(game["game"]["season"]) + 1

                league_games.append([league_key, league_year])

    return league_games

week_list = list(range(1, 25))
week_params = ";week=" + ",".join(map(str, week_list))

league_api_endpoints = {
    'settings': ["league", "settings"],
    'teams': ["league", "teams", "standings"],
    'scoreboard': ["league", f"scoreboard{week_params}"],
    'draft': ["league", "draftresults"]
}


def process_yahoo_league(event, context):
    params = event["queryStringParameters"]

    league_id = params.get("leagueId")
    access_token = params.get("yahooAccessToken")

    league_games = get_all_league_games(league_id, access_token)
    print(league_games)

    for league_game in league_games:
        league_key = league_game[0]
        league_year = league_game[1]

        print(f"Starting processing for {league_year}")

        league_data = {
            'leagueId': league_id,
            'leagueYear': league_year,
            'allYears': [x[1] for x in league_games]
        }
        for endpoint in league_api_endpoints:
            url_params = league_api_endpoints[endpoint]

            data_endpoint = extract_from_yahoo_api(access_token, league_key, url_params)
            league_data[endpoint] = transform_yahoo_raw_to_df(endpoint, data_endpoint)

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