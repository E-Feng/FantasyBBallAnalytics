import os
import json
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

LEAGUE_YEAR = '2023'
FIREBASE_URL = f'https://fantasy-cc6ec-default-rtdb.firebaseio.com/v1/{LEAGUE_YEAR}/common/'


def upload_to_firebase(type: str, payload: dict):
  auth_file_path = '/tmp/auth.json'

  auth_json = json.loads(os.environ['google_auth_json'])
  
  with open(auth_file_path, 'w') as outfile:
      json.dump(auth_json, outfile)

  scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/firebase.database"
  ]
  credentials = service_account.Credentials.from_service_account_file(
      auth_file_path, scopes=scopes)
  authed_session = AuthorizedSession(credentials)

  if type == 'alert':
    url = FIREBASE_URL + 'messageboard.json'

  r = authed_session.patch(url, data=json.dumps(payload))

  if r.status_code == 200:
    print("Data successfully sent to firebase")
  else:
    print(r.status_code, r.text)

  return