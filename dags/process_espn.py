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
  transform_unrostered_daily
)
from upload_to_aws import (
  upload_league_data_to_dynamo, upload_data_to_s3
)
from util import (
  invoke_lambda,
  get_current_espn_league_year,
  get_default_league_info
)
from load_settings import (
  get_scoring_period_id,
  get_last_posted_scoring_period
)
from upload_to_cloud import (
  upload_to_firebase
)

current_year = get_current_espn_league_year()
default_league_info = get_default_league_info()

scoring_period = get_scoring_period_id(default_league_info)

league_api_endpoints = {
  'settings': ['mSettings'],
  'teams': ['mTeam'],
  'rosters': ['mRoster'],
  'scoreboard': ['mScoreboard'],
  'draft': ['mDraftDetail'],
  'players': ['kona_player_info', 'mStatRatings'],
  'daily': ['kona_playercard']
}
league_headers = {
  'players': '''{"players":{"limit":1000,"sortPercOwned":{"sortAsc":false,"sortPriority":1},"sortDraftRanks":{"sortPriority":100,"sortAsc":true,"value":"STANDARD"}}}''',
  'daily':   '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId":{"value":[%s]},"sortStatIdForScoringPeriodId":{"additionalValue":%s,"sortAsc":false,"sortPriority":2,"value":0},"limit":250}}''' % (scoring_period, scoring_period),
}


def process_espn_league(event, context):
  params = event["queryStringParameters"]

  league_id = params.get('leagueId')
  cookie_espn = params.get('cookieEspnS2')
  process_only_current = params.get('processOnlyCurrent')
  updated_at = params.get('updatedAt', datetime.utcnow().isoformat())

  league_info = {
    "leagueId": league_id,
    "leagueYear": current_year,
    "cookieEspn": cookie_espn,
  }

  print(f"Processing league {league_id}...")
  
  league_settings = extract_from_espn_api(league_info, ['mSettings'])
  previous_years = sorted(league_settings["status"]["previousSeasons"], reverse=True)

  # Quickly check valid years
  all_league_keys = [[league_id, current_year]]
  for test_year in previous_years:
    league_info['leagueYear'] = test_year
    try: 
      extract_from_espn_api(league_info, ['mSettings'])
      all_league_keys.append([league_id, test_year])
    except:
      continue

  process_keys = [[league_id, current_year]] if process_only_current else all_league_keys

  for league_key in process_keys:
    print(f"Starting process for {league_key} | {cookie_espn}")
    league_year = league_key[1]

    league_info['leagueYear'] = league_year

    league_data = {
      'leagueId': league_id,
      'leagueYear': league_year,
      'allLeagueKeys': all_league_keys,
      'platform': "espn",
      'updatedAt': updated_at
    }

    for endpoint in league_api_endpoints.keys():
      view = league_api_endpoints[endpoint]

      header = {}
      if league_headers.get(endpoint):
        header = {'x-fantasy-filter': league_headers.get(endpoint)}

      data_endpoint = extract_from_espn_api(league_info, view, header)
      league_data[endpoint] = transform_raw_to_df(endpoint, data_endpoint)

    # Complex transforms
    # league_data['draftRecap'] = transform_draft_recap(
    #   league_data['draft'], 
    #   league_data['players'],
    #   league_data['settings']
    # )

    league_data['players'] = transform_players_truncate(league_data)
    league_data['daily'] = transform_unrostered_daily(league_data)

    # Removing unneeded league data
    #league_data.pop('draft', None)
    #league_data.pop('players', None)

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


def process_espn_common():
  last_scoring_period = get_last_posted_scoring_period(current_year)

  if int(scoring_period) <= int(last_scoring_period):
    return

  common_api_endpoints = {
    'players': ['kona_player_info'],
    'players_yahoo': ['kona_player_info', 'mStatRatings'],
    'daily': ['kona_playercard'],
  }
  common_headers = {
    'players': '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId": {"value": [0]}, "sortPercOwned": {"sortPriority": 2, "sortAsc": false}, "limit": 250}}''',
    'players_yahoo': '''{"players":{"limit":1000,"sortPercOwned":{"sortAsc":false,"sortPriority":1},"sortDraftRanks":{"sortPriority":100,"sortAsc":true,"value":"STANDARD"}}}''',
    'daily':   '''{"players":{"filterStatsForCurrentSeasonScoringPeriodId":{"value":[%s]},"sortStatIdForScoringPeriodId":{"additionalValue":%s,"sortAsc":false,"sortPriority":2,"value":0},"limit":250}}''' % (scoring_period, scoring_period),
  }

  league_info = default_league_info

  today = date.today().strftime("%Y-%m-%d")
  bucket_name = 'nba-player-stats'

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

      upload_data_to_s3(player_data_dict, filename, bucket_name)

    elif k == 'players_yahoo':
      data = common_data[k]

      data_df = transform_raw_to_df('players', data)
      data_dict = data_df.to_dict(orient='records')
      data_clean = [{k:v for k, v in x.items() if v == v } for x in data_dict]

      filename = "espn_players.json"
      bucket_name = "nba-player-stats"

      upload_data_to_s3(data_clean, filename, bucket_name)

    # Upload daily data to firebase
    elif k == 'daily':
      minimum_display = 4
      minutes_cutoff = 20
      studs_gs_cutoff = 30
      scrubs_gs_cutoff = 0

      df = transform_raw_to_df(k, v)

      if df.empty:
        continue

      top_studs = df[(df['mins'] > minutes_cutoff) & (df['gs'] >= studs_gs_cutoff)]
      top_scrubs = df[(df['mins'] > minutes_cutoff) & (df['gs'] <= scrubs_gs_cutoff)]

      if top_studs.shape[0] < minimum_display:
        top_studs = df[df['mins'] > minutes_cutoff].head(minimum_display)

      if top_scrubs.shape[0] < minimum_display:
        top_scrubs = df[df['mins'] > minutes_cutoff].tail(minimum_display)

      top_studs_list  = top_studs.to_dict(orient = 'records')
      top_scrubs_list = top_scrubs.to_dict(orient = 'records')
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

      daily_json = df.to_dict(orient='records')
      upload_data_to_s3(daily_json, "daily.json", bucket_name)

      upload_to_firebase('alert', alert_data)   
      upload_to_firebase('scoring_period', {"scoring_period": scoring_period})    

  return {
    'statusCode': 200,
    'body': "Test response"
  }


def update_espn_leagues(event, context):
  print(event)
  lambda_client = boto3.client('lambda', region_name='us-east-1')

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
      AND platform = 'espn'
      AND (NOW() - lastviewed < INTERVAL '7 day')
      and (NOW() - lastupdated) > interval '2 hour'
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
        "processOnlyCurrent": True,
        "updatedAt": datetime.utcnow().isoformat()
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

      invoke_lambda(lambda_client, "update_league_info", update_payload)

  print(f"Successfully updated, {num_failed}/{num_leagues} failed...")

  return {
    'statusCode': 200,
    'body': "Test response"
  }
