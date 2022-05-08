import pandas as pd
from datetime import datetime

import consts
from extract_espn import (
  extract_from_espn_api
)
from transform_data import (
  transform_raw_to_df
)


api_endpoints = {
  'settings': ['mSettings'],
  'teams': ['mTeam'],
  'scoreboard': ['mScoreboard'], 
  'draft_recap': ['mDraftDetail'],
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
    "league_id": league_id,
    "league_year": str(league_year_start),
    "cookie_espn": cookie_espn,
    "cookie_swid": cookie_swid 
  }

  year_check_failures = 0
  while year_check_failures < 3:
    league_info['league_year'] = str(league_year_start)

    try:
      extract_from_espn_api(league_info, [''])
    except:
      year_check_failures += 1
    else:
      league_years.append(league_year_start)
    finally:
      league_year_start = league_year_start - 1

  print("Active years ", league_years)

  for league_year in league_years:
    print(f"Starting data extraction for {league_year}...")

    league_info['league_year'] = league_year

    league_data = []

    for endpoint in api_endpoints.keys():
      view = api_endpoints[endpoint]

      header = {}
      if headers.get(endpoint):
        header = {'x-fantasy-filter': headers.get(endpoint)}

      data_endpoint = extract_from_espn_api(league_info, view, header)
      league_data[endpoint] = transform_raw_to_df(endpoint, data_endpoint)

  has_ejections_cat = int(consts.EJS) in league_data['settings']['categoryIds']
  print("has ejections ", has_ejections_cat)

  full_draft_recap = pd.merge(league_data['draft_recap'], league_data['ratings'], how='left', on='playerId')

