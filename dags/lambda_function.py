import pandas as pd
from datetime import datetime

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
    "league_id": league_id,
    "league_year": str(league_year_start),
    "cookie_espn": cookie_espn,
    "cookie_swid": cookie_swid 
  }

  year_check_failures = 0
  while year_check_failures < 3:
    league_info['league_year'] = str(league_year_start)

    try:
      year_check_data = extract_from_espn_api(league_info, [''])
    except:
      year_check_failures += 1
    else:
      print(type(year_check_data))
      print(year_check_data)

  while False:
    print(f"Starting data extraction for {league_year_start}...")

    league_data = []

    league_years.append(league_year_start)

    for endpoint in api_endpoints.keys():
      view = api_endpoints[endpoint]

      header = {}
      if headers.get(endpoint):
        header = {'x-fantasy-filter': headers.get(endpoint)}

      data_endpoint = extract_from_espn_api(league_info, view, header)
      df_endpoint = transform_raw_to_df(endpoint, data_endpoint)

    fetch_data = False