import os
import json
import tempfile
import requests
import pandas as pd

from airflow.decorators import task
from airflow.models import Variable
from airflow.operators.python import get_current_context
from airflow.providers.google.cloud.transfers.local_to_gcs import LocalFilesystemToGCSOperator

from util import authed_session


CONN_ID = 'google_cloud_created'
LEAGUE_YEAR = Variable.get('LEAGUE_YEAR')
FIREBASE_URL = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/{LEAGUE_YEAR}/'


@task
def upload_to_firebase(data_df: str, name: str):
  """
  Uploads dataframe data as string/json to firebase
  """

  url = FIREBASE_URL + name + '.json'
  
  r = authed_session.put(url, data=data_df)

  if r.status_code == 200:
    print("Data successfully sent to firebase")
    return 


@task
def upload_to_gcs(data: str, file_path: str):
  """
  Convert string json dataframe to temp file then upload to gcs
  """
  context = get_current_context()

  data = json.loads(data)

  print("Data preview: ", type(data))
  print(data)

  with tempfile.NamedTemporaryFile() as fp:
    # do stuff with temp file
    full_path = fp.name

    for line in data:
      newline = json.dumps(line) + '\n'
      fp.write(newline.encode())

    print(full_path)
    fp.read()

    upload = LocalFilesystemToGCSOperator(
      task_id = f'gcs_upload_{file_path}',
      src = full_path,
      dst = file_path,
      bucket = 'fantasy-cc6ec.appspot.com',
      gcp_conn_id = CONN_ID
    )
    upload.execute(context)
