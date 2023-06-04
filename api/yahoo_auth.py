import boto3
import requests

from util import invoke_lambda


lambda_client = boto3.client("lambda", region_name="us-east-1")

yahoo_key = invoke_lambda(lambda_client, "get_secret", {"key": "yahoo_key"})
yahoo_secret = invoke_lambda(lambda_client, "get_secret", {"key": "yahoo_secret"})

url = "https://api.login.yahoo.com/oauth2/get_token"
headers = {"Content-Type": "application/x-www-form-urlencoded"}


def get_yahoo_access_token(event, context):
    yahoo_auth_code = event["queryStringParameters"].get("yahooAuthCode")
    yahoo_refresh_token = event["queryStringParameters"].get("yahooRefreshToken")

    if not yahoo_refresh_token:
        get_payload = f"client_id={yahoo_key}&grant_type=authorization_code&code={yahoo_auth_code}&redirect_uri=oob&client_secret={yahoo_secret}"

        res = requests.request("POST", url, headers=headers, data=get_payload)

    else:
        refresh_payload = f"client_id={yahoo_key}&grant_type=refresh_token&redirect_uri=oob&refresh_token={yahoo_refresh_token}&client_secret={yahoo_secret}"

        res = requests.request("POST", url, headers=headers, data=refresh_payload)

    if res.status_code == 200:
        yahoo_access_token = res.json()["access_token"]
        yahoo_refresh_token = res.json()["refresh_token"]

        return [yahoo_access_token, yahoo_refresh_token]
    
    return res.json()