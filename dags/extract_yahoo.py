import json
import boto3
import requests

from consts import YAHOO_SEASON_GAME_IDS


base_url = "https://fantasysports.yahooapis.com/fantasy/v2/{}?format=json_f"


def extract_from_yahoo_api(access_token: str, league_key: str, endpoint: str, url_params: list):
    yahoo_game_id = int(YAHOO_SEASON_GAME_IDS['2024'])

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
          print(res.text)
          raise ValueError(f"Error obtaining {url_params} from Yahoo API")
    
    # Handling player data, grabbing from ESPN process. Only for 2024-2025 onward
    elif int(league_key[0:3].replace(".", "")) >= yahoo_game_id:
        s3 = boto3.resource("s3")

        if endpoint == "players":
            try:
                obj = s3.Object("nba-player-stats", "espn_players.json")
                players = json.loads(obj.get()["Body"].read().decode("utf-8"))
            except:
                players = []

            return players
        
        elif endpoint == "players_id_map":
            obj = s3.Object("nba-player-stats", "yahoo_players_map.json")
            players_id_map = json.loads(obj.get()["Body"].read().decode("utf-8"))

            return players_id_map
        
        elif endpoint == "daily":
            try:
                obj = s3.Object("nba-player-stats", "daily.json")
                daily = json.loads(obj.get()["Body"].read().decode("utf-8"))
            except:
                daily = []

            return daily

    else:
       return {}