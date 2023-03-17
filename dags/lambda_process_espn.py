import json
import boto3
import psycopg2
import pandas as pd
from datetime import datetime, date

from extract_espn import (
  extract_from_espn_api
)
from transform_raw_data import (
  transform_raw_to_df
)
from transform_data import (
  transform_players_truncate,
  transform_draft_recap
)
from upload_to_aws import (
  upload_league_data_to_dynamo, upload_data_to_s3
)
from util import (
  invoke_lambda
)
from load_settings import (
  get_scoring_period_id
)
from upload_to_cloud import (
  upload_to_firebase
)

default_league_info = {
  'leagueId': '1978554631',
  'leagueYear': '2023',
}

scoring_period = get_scoring_period_id(default_league_info)

league_api_endpoints = {
  'settings': ['mSettings'],
  'teams': ['mTeam'],
  'scoreboard': ['mScoreboard'],
  'draft': ['mDraftDetail'],
  'players': ['kona_player_info', 'mStatRatings']
}

league_headers = {
  'players': '''{"players":{"limit":1000,"sortPercOwned":{"sortAsc":false,"sortPriority":1},"sortDraftRanks":{"sortPriority":100,"sortAsc":true,"value":"STANDARD"}}}'''
}

common_api_endpoints = {
  'players': ['kona_player_info'],
  'daily': ['kona_playercard']

}

common_headers = {
  'players': '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId": {"value": [0]}, "sortPercOwned": {"sortPriority": 2, "sortAsc": false}, "limit": 250}}''',
  'daily':   '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId":{"value":[%s]},"sortStatIdForScoringPeriodId":{"additionalValue":%s,"sortAsc":false,"sortPriority":2,"value":0},"limit":250}}''' % (scoring_period, scoring_period)
}

def process_espn_league(event, context):
  league_id = event["queryStringParameters"].get('leagueId')
  cookie_espn = event["queryStringParameters"].get('cookieEspnS2')
  cookie_swid = event["queryStringParameters"].get('cookieSwid')
  league_year = event["queryStringParameters"].get('leagueYear')

  is_initial_process = True

  league_info = {
    "leagueId": league_id,
    "cookieEspn": cookie_espn,
    "cookieSwid": cookie_swid
  }

  print(f"Processing league {league_id}...")

  if league_year:
    is_initial_process = False
    league_years = [league_year]
  else:
    league_years = []
    league_year_start = datetime.now().year + 1

    league_info["leagueYear"] = league_year_start

    year_check_failures = 0
    max_check_failures = 4
    while year_check_failures < max_check_failures:
      league_info['leagueYear'] = league_year_start

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
    }

    if is_initial_process:
      league_data['allYears'] = league_years

    for endpoint in league_api_endpoints.keys():
      view = league_api_endpoints[endpoint]

      header = {}
      if league_headers.get(endpoint):
        header = {'x-fantasy-filter': league_headers.get(endpoint)}

      data_endpoint = extract_from_espn_api(league_info, view, header)
      league_data[endpoint] = transform_raw_to_df(endpoint, data_endpoint)

    # Complex transforms
    league_data['draftRecap'] = transform_draft_recap(
      league_data['draft'], 
      league_data['players'],
      league_data['settings']
    )

    league_data['players'] = transform_players_truncate(
      league_data['players']
    )

    # Removing unneeded league data
    #league_data.pop('draft', None)
    league_data.pop('players', None)

    # Data serialization and upload data to dynamo
    for key in league_data.keys():
        if isinstance(league_data[key], pd.DataFrame):
            league_data[key] = league_data[key].to_dict(orient='records')

    with open('C:\\Users\\Elvin\\Desktop\\data.json', 'w') as f:
      json.dump(league_data, f)
      
    upload_league_data_to_dynamo(league_data)

  print("Complete...")

  return {
    'statusCode': 200,
    'body': league_years
  }


def process_espn_common():
  league_info = {
    "leagueId": '1978554631',
    "leagueYear": 2023
  }

  today = date.today().strftime("%Y-%m-%d")

  common_data = {}

  for endpoint in common_api_endpoints.keys():
    view = common_api_endpoints[endpoint]

    header = {}
    if common_headers.get(endpoint):
      header = {'x-fantasy-filter': common_headers.get(endpoint)}

    data_endpoint = extract_from_espn_api(league_info, view, header)

    common_data[endpoint] = data_endpoint

  # Data serialization
  for k, v in common_data.items():

    # Upload player data to S3
    if k == 'players':

      player_data_dict = common_data.copy()
      player_data_dict.pop('daily', '')

      filename = f"nba-player-stats-{today}.json"

      bucket_name = 'nba-player-stats'
      upload_data_to_s3(player_data_dict, filename, bucket_name)

    # Upload daily data to firebase
    elif k == 'daily':

      df = transform_raw_to_df(k, v)
      game_minutes_minimum = 20

      top_studs_list  = df[df['mins'] > game_minutes_minimum].head().to_dict(orient = 'records')
      top_scrubs_list = df[df['mins'] > game_minutes_minimum].tail().to_dict(orient = 'records')
      ejections       = df[df['ejs'] > 0].to_dict(orient = 'records')
      
      player_daily_alerts = {}
      player_daily_alerts['studs'] = top_studs_list
      player_daily_alerts['scrubs'] = top_scrubs_list
      player_daily_alerts['ejections'] = ejections

      alert_data = {}
      alert_data[today] = {}

      for alert_type in player_daily_alerts.keys():
        for i, scoreline in enumerate(player_daily_alerts[alert_type]):

          scoreline['user'] = 'BOT'
          scoreline['time'] = str(datetime.now().time())

          if alert_type == 'ejections':
            scoreline['type'] = 'ejection'
          else:
            scoreline['type'] = 'stat'
          
          alert_data[today][f'!{alert_type}_stat{i}'] = scoreline

      upload_to_firebase('alert', alert_data)     


  return {
    'statusCode': 200,
    'body': "Test response"
  }

lambda_client = boto3.client('lambda', region_name='us-east-1')

def update_espn_leagues(event, context):
  print(event)

  process_espn_common()

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
    SELECT leagueid, cookieswid, cookieespns2
    FROM leagueids  
    WHERE active
      AND (NOW() - LastViewed < INTERVAL '7 day')
    """
  )
  res_query = cursor.fetchall()

  num_leagues = len(res_query)
  num_failed = 0

  for league_info in res_query:
    league_id = league_info[0]

    process_payload = {
      "queryStringParameters": {
        "leagueId": league_id,
        "cookieSwid": league_info[1],
        "cookieEspnS2": league_info[2],
        "leagueYear": 2023
      }
    }

    process_res = invoke_lambda(lambda_client, 'process_espn_league', process_payload)

    if not process_res:
      num_failed += 1
      print(f"League {league_id.ljust(11)} failed")
    else:
      update_payload = {
        "queryStringParameters": {
          "leagueId": league_id,
          "method": 'lastUpdated'
        }
      }

      process_res = invoke_lambda(lambda_client, 'updateLastViewedLeague', update_payload)


  print(f"Successfully updated, {num_failed}/{num_leagues} failed...")

  return {
    'statusCode': 200,
    'body': "Test response"
  }
