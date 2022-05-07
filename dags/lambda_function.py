import pandas as pd

from extract_espn import (
  extract_from_espn_api
)
from transform_data import (
  transform_raw_to_df
)

def lambda_handler(event, context):
  league_id = event["queryStringParameters"]['leagueId']
  cookie_espn = event["queryStringParameters"]['cookieEspnS2']
  cookie_swid = event["queryStringParameters"]['cookieSwid']

  league_years = []
  league_year_start = 2022

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

  fetch_data = True

  while fetch_data:
    league_years.append(league_year_start)

    league_info = {
      "league_id": league_id,
      "league_year": str(league_year_start),
      "cookie_espn": cookie_espn,
      "cookie_swid": cookie_swid 
    }

    for endpoint in api_endpoints.keys():
      view = api_endpoints[endpoint]
      header = headers.get(endpoint, {})

      data_endpoint = extract_from_espn_api(league_info, view, header)
      df_endpoint = transform_raw_to_df(endpoint, data_endpoint)