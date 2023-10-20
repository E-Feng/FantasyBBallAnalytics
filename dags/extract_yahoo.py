import json
import boto3
import requests

from util import get_default_league_info


base_url = "https://fantasysports.yahooapis.com/fantasy/v2/{}?format=json_f"

def extract_from_yahoo_api(access_token: str, league_key: str, endpoint: str, url_params: list):
    if url_params:
        url_suffix = ""
        for param in url_params:
          url_suffix += f"{param}/"

          if param == "league":
              url_suffix += f"{league_key}/"

        url = base_url.format(url_suffix)
        headers = {"Authorization": f"Bearer {access_token}"}

        res = requests.get(url, headers=headers)
        
        if res.status_code == 200:
          data = res.json()

          print(f"Successfully fetched {url_params} from Yahoo API")
          return data
        else:
          print(f"Failed {url_params} code:{res.status_code}")
          raise ValueError(f"Error obtaining {url_params} from Yahoo API")
    
    # Handling player data, grabbing from ESPN process. Only for 2024
    elif int(league_key[0:3]) >= 428:
        if endpoint == "players":
            league_info = get_default_league_info()
            league_id = league_info["leagueId"]
            league_year = league_info["leagueYear"]

            dynamodb = boto3.resource('dynamodb')
            table = dynamodb.Table("fantasyLeagueData")

            league_data = table.get_item(Key={"leagueId": league_id, "leagueYear": league_year})

            players = league_data["Item"]["players"]

            return players
        
        elif endpoint == "players_id_map":
            s3 = boto3.resource("s3")
            obj = s3.Object("nba-player-stats", "yahoo_players_map.json")
            players_id_map = json.loads(obj.get()["Body"].read().decode("utf-8"))

            return players_id_map
    else:
       return {}