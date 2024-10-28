import boto3
import requests

from util import invoke_lambda, strip_character_accents
from upload_to_aws import upload_data_to_s3


lambda_client = boto3.client("lambda", region_name="us-east-1")

yahoo_key = invoke_lambda(lambda_client, "get_secret", {"key": "yahoo_key"})
yahoo_secret = invoke_lambda(lambda_client, "get_secret", {"key": "yahoo_secret"})


def get_yahoo_access_token(league_auth_code):
    url = "https://api.login.yahoo.com/oauth2/get_token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    is_initial_auth_code = len(league_auth_code) < 10

    tokens = {}

    if is_initial_auth_code:
        get_payload = f"client_id={yahoo_key}&grant_type=authorization_code&code={league_auth_code}&redirect_uri=oob&client_secret={yahoo_secret}"

        res = requests.request("POST", url, headers=headers, data=get_payload)

    else:
        refresh_payload = f"client_id={yahoo_key}&grant_type=refresh_token&redirect_uri=oob&refresh_token={league_auth_code}&client_secret={yahoo_secret}"

        res = requests.request("POST", url, headers=headers, data=refresh_payload)

    data = res.json()
    if res.status_code == 200:
        tokens["yahoo_access_token"] = data["access_token"]
        tokens["yahoo_refresh_token"] = data["refresh_token"]

        return tokens
    
    tokens["error"] = data["error"]
    
    return tokens


def get_all_league_ids(access_token):
    url = "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/leagues/?format=json_f"
    headers = {"Authorization": f"Bearer {access_token}"}

    league_games = []

    res = requests.get(url, headers=headers)

    if res.status_code == 200:
        data = res.json()

        users = data["fantasy_content"]["users"]

        for user in users:
            games = user["user"]["games"]

            for game in games:
                if game.get("game", {}).get("code", "") == "nba":
                    leagues = game["game"]["leagues"]

                    for league in leagues:
                        league_year = int(league["league"]["season"]) + 1
                        league_key = league["league"]["league_key"]

                        league_games.append([league_key, league_year])

    # Sort hack to get highest year but lowest league id
    league_games.sort(key=lambda x: x[1]/int(league_key.split('.l.')[1]), reverse=True)

    return league_games


def update_player_list():
    refresh_token = invoke_lambda(lambda_client, "get_secret", {"key": "yahoo_refresh_token"})
    access_token = get_yahoo_access_token(refresh_token)["yahoo_access_token"]

    url = "https://fantasysports.yahooapis.com/fantasy/v2/league/454.l.52531/players;start=%s/?format=json_f"
    headers = {"Authorization": f"Bearer {access_token}"}

    inc = 25
    start = 0
    cont = True

    players_data = []
    while cont:
        url = f"https://fantasysports.yahooapis.com/fantasy/v2/league/454.l.52531/players;start={start}/?format=json_f"

        res = requests.get(url=url, headers=headers)

        if res.status_code == 200:
            data = res.json()

            players = data["fantasy_content"]["league"]["players"]

            if players:
                for player in players:
                    row = {}
                    player = player["player"]

                    row["playerId"] = player["player_id"]
                    row["playerName"] = strip_character_accents(player["name"]["full"])

                    players_data.append(row)
            else:
                cont = False

        start += inc

    upload_data_to_s3(players_data, "yahoo_players_map.json", "nba-player-stats")