import pandas as pd
from datetime import datetime

import consts
from extract_espn import (
  extract_from_espn_api
)
from transform_data import (
  transform_raw_to_df
)
from upload_to_aws import (
  upload_league_data_to_dynamo_via_sqs
)


api_endpoints = {
  'settings': ['mSettings'],
  'teams': ['mTeam'],
  'scoreboard': ['mScoreboard'], 
  'draftRecap': ['mDraftDetail'],
  'ratings': ['kona_player_info', 'mStatRatings']
}

headers = {
  'ratings': '''{"players":{"limit":1000,"sortPercOwned":{"sortAsc":false,"sortPriority":1},"sortDraftRanks":{"sortPriority":100,"sortAsc":true,"value":"STANDARD"}}}'''
}

def lambda_handler(event, context):
  league_id = event["queryStringParameters"]['leagueId']
  cookie_espn = event["queryStringParameters"]['cookieEspnS2']
  cookie_swid = event["queryStringParameters"]['cookieSwid']

  league_years = []
  league_year_start = datetime.now().year + 1

  league_info = {
    "leagueId": league_id,
    "leagueYear": str(league_year_start),
    "cookieEspn": cookie_espn,
    "cookieSwid": cookie_swid 
  }

  year_check_failures = 0
  max_check_failures = 4
  while year_check_failures < max_check_failures:
    league_info['leagueYear'] = str(league_year_start)

    try:
      extract_from_espn_api(league_info, [''])
    except:
      year_check_failures += 1
    else:
      league_years.append(league_year_start)
    finally:
      league_year_start = league_year_start - 1


  for league_year in league_years:
    print(f"Starting data extraction for {league_year}...")

    league_info['leagueYear'] = league_year

    league_data = {
      'leagueId': league_id,
      'leagueYear': league_year,
      'allYears': league_years
    }

    for endpoint in api_endpoints.keys():
      view = api_endpoints[endpoint]

      header = {}
      if headers.get(endpoint):
        header = {'x-fantasy-filter': headers.get(endpoint)}

      data_endpoint = extract_from_espn_api(league_info, view, header)
      league_data[endpoint] = transform_raw_to_df(endpoint, data_endpoint)

    # Merging draft recap with ratings
    has_ejections_cat = int(consts.EJS) in league_data['settings'].iloc[0]['categoryIds']
    columns = ['pickNumber', 'round', 'playerName', 'teamId', 'ratingSeason', 'rankingSeason']
    if has_ejections_cat:
      columns.append('ratingEjsSeason')
      columns.append('rankingEjsSeason')

    full_draft_recap = pd.merge(league_data['draftRecap'], league_data['ratings'], how='left', on='playerId')

    league_data['draftRecap'] = full_draft_recap[columns]

    league_data.pop('ratings', None)

    # Data serialization and upload data to dynamo
    for key in league_data.keys():
      if isinstance(league_data[key], pd.DataFrame):
        league_data[key] = league_data[key].to_json(orient='records')
    upload_league_data_to_dynamo_via_sqs(league_data)

  print("Complete...")

  return {
    'statusCode': 200
  }

""" 
event = {
  "queryStringParameters": {
    "leagueId": '48375511',
    "cookieEspnS2": "AEANBh%2BD2CyE%2BH%2FBEYL2sJ%2B4nV9%2FOklCUoyYPiegbqwlFqzfE%2BnViiqW87jner2OdiFYVXKnHjjaSSx%2FJDbZWgyrFSCnaU8AxPJtsGXuMpDzFZw7B8YgcpTmCkSasag97Sd%2Fl1r6igCZh%2F1YyquO0H%2FyMVIXq8%2FUAarrXIFzeSx%2BBiB0ywQn6Iz6Smkiv63RWoJeNrzojIXfuoTbFw%2BVzXSnF6TH5MF4X7ooRKw%2FImPagScBbqIMjrq0EfPf6%2Bcm9XE%3D",
    "cookieSwid": "A746C402-08B1-42F4-86C4-0208B142F42A"
  }
}
context = None
lambda_handler(event, context) 
"""