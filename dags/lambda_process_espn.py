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
  transform_draft_recap
)
from upload_to_aws import (
  upload_league_data_to_dynamo, upload_data_to_s3
)

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
  'players': ['kona_player_info']
}

common_headers = {
  'players': '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId": {"value": [0]}, "sortPercOwned": {"sortPriority": 2, "sortAsc": false}, "limit": 250}}'''
}

def process_espn_league(event, context):
  league_id = event["queryStringParameters"].get('leagueId')
  cookie_espn = event["queryStringParameters"].get('cookieEspnS2')
  cookie_swid = event["queryStringParameters"].get('cookieSwid')
  league_year = event["queryStringParameters"].get('leagueYear')

  is_initial_process = True
  method = 'PUT'

  league_info = {
    "leagueId": league_id,
    "cookieEspn": cookie_espn,
    "cookieSwid": cookie_swid
  }

  print(f"Processing league {league_id}...")

  if league_year:
    is_initial_process = False
    method = 'PATCH'
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

    # Removing unneeded league data
    league_data.pop('players', None)

    # Data serialization and upload data to dynamo
    for key in league_data.keys():
        if isinstance(league_data[key], pd.DataFrame):
            league_data[key] = league_data[key].to_json(orient='records')

    upload_league_data_to_dynamo(league_data, method)

  print("Complete...")

  return {
    'statusCode': 200,
    'body': "Test response"
  }


def process_espn_common():
  league_info = {
    "leagueId": '891817951',
    "leagueYear": 2023
  }

  common_data = {}

  for endpoint in common_api_endpoints.keys():
    view = common_api_endpoints[endpoint]

    header = {}
    if common_headers.get(endpoint):
      header = {'x-fantasy-filter': common_headers.get(endpoint)}

    data_endpoint = extract_from_espn_api(league_info, view, header)

    common_data[endpoint] = data_endpoint

    # Data serialization and upload data to S3
    for key in common_data.keys():
      if isinstance(common_data[key], pd.DataFrame):
        common_data[key] = common_data[key].to_json(orient='records')

    today = date.today().strftime("%Y-%m-%d")
    filename = f"nba-player-stats-{today}.json"

    bucket_name = 'nba-player-stats'
    upload_data_to_s3(common_data, filename, bucket_name)

  return {
    'statusCode': 200,
    'body': "Test response"
  }


lambda_client = boto3.client('lambda', region_name='us-east-1')

def update_espn_leagues(event, context):
  print(event)

  process_espn_common()

  password_res = lambda_client.invoke(
    FunctionName='get_secret',
    InvocationType='RequestResponse',
    Payload=json.dumps({'key': 'supabase_password'})
  )

  conn = psycopg2.connect(
    host='db.lsygyiijbumuybwyuvrn.supabase.co',
    port='5432',
    database='postgres',
    user='postgres',
    password=json.loads(password_res['Payload'].read())['body']
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
        "cookieEspnS2": league_info[1],
        "cookieSwid": league_info[2],
        "leagueYear": 2023
      }
    }

    process_res = lambda_client.invoke(
      FunctionName='process_espn_league',
      InvocationType='RequestResponse',
      Payload=json.dumps(process_payload)
    )

    lambda_error = process_res.get('FunctionError', False)
    status = process_res['StatusCode']

    if status != 200 or lambda_error:
      num_failed += 1
      print(f"League {league_id.ljust(11)} failed, {lambda_error}/{status}")
    else:
      update_payload = {
        "queryStringParameters": {
          "leagueId": league_id,
          "method": 'lastUpdated'
        }
      }

      update_res = lambda_client.invoke(
        FunctionName='updateLastViewedLeague',
        InvocationType='RequestResponse',
        Payload=json.dumps(update_payload)
      )

  print(f"Successfully updated, {num_failed}/{num_leagues} failed...")

  return {
    'statusCode': update_res['StatusCode'],
    'body': "Test response"
  }
