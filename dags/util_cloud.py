from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

### Setting up authorized firebase session with service account
file_name = 'fantasy-cc6ec.json'
file_path = f'/opt/airflow/config/{file_name}'
scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/firebase.database"
]
credentials = service_account.Credentials.from_service_account_file(
    file_path, scopes=scopes)
authed_session = AuthorizedSession(credentials)

