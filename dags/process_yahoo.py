import pandas as pd

from extract_yahoo import extract_from_yahoo_api
from transform_raw_data_yahoo import transform_yahoo_raw_to_df
from upload_to_aws import upload_league_data_to_dynamo


league_api_endpoints = {
    'settings': ["league", "settings"],
    'teams': ["league", "teams", "standings"],
    'scoreboard': ["league", "scoreboard"],
    'draft': ["league", "draftresults"]
}

def process_yahoo_league(event, context):
    params = event["queryStringParameters"]

    league_id = params.get("leagueId")
    league_year = params.get("leagueYear")
    access_token = params.get("yahooAccessToken")
    all_league_keys = params.get("allLeagueKeys")

    print(f"Starting processing for {league_year}")

    league_data = {
        'leagueId': league_id,
        'leagueYear': league_year,
        'allLeagueKeys': all_league_keys,
        'platform': "yahoo"
    }
    for endpoint in league_api_endpoints:
        url_params = league_api_endpoints[endpoint]

        data_endpoint = extract_from_yahoo_api(access_token, league_id, url_params)
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