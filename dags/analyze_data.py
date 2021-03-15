import os
import json
import requests
from datetime import datetime
import pandas as pd

from util import authed_session


def calculate_and_upload_daily_alert(**context):
  """
  Calculates which daily stats to put in the alert, high gamescore, leading stat categories
  and posts it to firebase
  """
  gamescore_cutoff = 32.5
  date = context['ti'].start_date.strftime('%Y-%m-%d')
  #date = '2021-02-16'

  json = context['ti'].xcom_pull(key='daily_score_df', task_ids=['transform_daily_score_to_df'])
  df = pd.read_json(json[0], orient='records')

  team_json = context['ti'].xcom_pull(key='team_df', task_ids=['transform_team_to_df'])
  team_df = pd.read_json(team_json[0], orient='records')

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