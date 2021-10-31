import os
import json
import requests
from datetime import datetime
import pandas as pd

from rds_operations import rds_run_query
pd.options.mode.chained_assignment = None

from airflow.decorators import task
from airflow.operators.python import get_current_context

from util import authed_session


@task
def create_common_daily_alert():
  """
  Create daily alert for common data (eg. no league specific free agents) by 
  highest gamescore, ejections
  """
  # Getting best gamescore alerts
  gamescore_cutoff = 32.5
  min_alerts = 3

  best_gamescores_sql = """
    (SELECT fullname, pts, rebs, asts, stls, blks, tos, fgmade, fgatt, threes, threesatt, ftmade, ftatt, mins, gs
    FROM daily
    WHERE gs >= %s)
    UNION
      (SELECT fullname, pts, rebs, asts, stls, blks, tos, fgmade, fgatt, threes, threesatt, ftmade, ftatt, mins, gs
      FROM daily
      ORDER BY gs DESC
      LIMIT %s)
    ORDER BY gs DESC
  """
  best_gamescores = rds_run_query(-1, best_gamescores_sql, (gamescore_cutoff, min_alerts))

  # Getting ejections
  ejections_sql = """
    SELECT fullname
    FROM daily
    WHERE ejs > 0
  """
  ejections = rds_run_query(-1, ejections_sql)

  # Creating daily alert json object
  context = get_current_context()
  date = context['data_interval_end'].to_date_string()

  alert_data = {}
  alert_data[date] = {}

  for i, gamescore in enumerate(best_gamescores):
    gamescore['type'] = 'stat'
    gamescore['user'] = 'BOT'
    gamescore['time'] = str(datetime.now().time())
    alert_data[date][f'!stat{i}'] = gamescore

  for i, ejection in enumerate(ejections):
    ejection['type'] = 'ejection'
    ejection['user'] = 'BOT'
    ejection['time'] = str(datetime.now().time())
    alert_data[date][f'!ejection{i}'] = ejection

  return alert_data


@task
def calculate_and_upload_daily_alert(daily_score_df: str, team_info_df: str):
  """
  Calculates which daily stats to put in the alert, high gamescore, leading stat categories
  and posts it to firebase
  """
  gamescore_cutoff = 32.5

  ti = get_current_context()['ti']
  date = ti.start_date.strftime('%Y-%m-%d')
  #date = '2021-02-16'

  df = pd.read_json(daily_score_df, orient='records')
  team_df = pd.read_json(team_info_df, orient='records')

  ### Checking for notable games by gamescore and best free agent game (unowned player)
  best_free_agent_game = df[df.teamId == 0].iloc[0]
  notable_games = df.loc[(df.gs > gamescore_cutoff) & (df.id != best_free_agent_game['id'])]
  if notable_games.empty:
    notable_games = df.iloc[[df['gs'].idxmax()]]

  notable_games = notable_games.append(best_free_agent_game)

  print(date)
  print('\n' + notable_games.to_string())
  
  for i in range(len(notable_games.index)):
    time = str(datetime.now().time())
    time = time.replace('.', '-')
    url = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/messageboard/{date}/!stat{i}.json'

    data = notable_games.iloc[i]
    data['type'] = 'stat'
    data['user'] = 'BOT'
    data['time'] = time

    data['abbrev'] = 'WAIVER' if data['teamId'] == 0 else team_df.loc[team_df.teamId == data.teamId].iloc[0]['abbrev']

    r = authed_session.put(url, data=data.to_json())

    print(r.status_code)


  ### Checking for ejections
  ejections = df.loc[df.ejs == 1]

  print('Ejections')
  print('\n' + ejections.to_string())

  if not ejections.empty:
    for i in range(len(ejections.index)):
      time = str(datetime.now().time())
      time = time.replace('.', '-')    
      url = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/messageboard/{date}/!ejection{i}.json'

      data = ejections.iloc[i]
      data['type'] = 'ejection'
      data['user'] = 'BOT'
      data['time'] = time

      data['abbrev'] = 'WAIVER' if data['teamId'] == 0 else team_df.loc[team_df.teamId == data.teamId].iloc[0]['abbrev']

      r = authed_session.put(url, data=data.to_json())

      print(r.status_code)