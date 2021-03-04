import os
import json
import tempfile
import requests
import pandas as pd

from util import authed_session


def upload_scoreboard_to_firebase(**context):
  """
  Convert string json of scoreboard dataframe to temp file then upload to firebase realtime
  database
  """
  url = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/scoreboard.json'

  raw_json = context['ti'].xcom_pull(key='scoreboard_df', task_ids='transform_scoreboard_to_df')
  
  r = authed_session.put(url, data=raw_json)

  if r.status_code == 200:
    print("Scoreboard successfully sent to firebase")
    return 


def upload_team_to_firebase(**context):
  """
  Convert string json of team dataframe to temp file then upload to firebase realtime
  database
  """
  url = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/team.json'

  raw_json = context['ti'].xcom_pull(key='team_df', task_ids='transform_team_to_df')
  
  r = authed_session.put(url, data=raw_json)

  if r.status_code == 200:
    print("Team successfully sent to firebase")
    return 

# Can't use operator until update to airflow 2.0
#from airflow.providers.google.cloud.transfers.local_to_gcs import LocalFilesystemToGCSOperator
#
#
# def upload_scoreboard_to_gcs(**context):
#   """
#   Convert string json of scoreboard dataframe to temp file then upload to gcs
#   """
#   raw_json = context['ti'].xcom_pull(key='scoreboard_df', task_ids=['transform_scoreboard_to_df'])

#   fd, path = tempfile.mkstemp()
#   try:
#       with os.fdopen(fd, 'w') as tmp:
#           # do stuff with temp file
#           tmp.write(raw_json)

#           upload = LocalFilesystemToGCSOperator(
#             task='upload_file',
#             src=path,
#             dst='scoreboard.json',
#             bucket='elvinfeng_fantasy'
#           )
#           upload.execute()
#   finally:
#       os.remove(path)
