NBA_GAME_KEY = 418
NFL_GAME_KEY = 423

import requests


def get_valid_all_years(league_id, access_token):
    url = "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys/?format=json"
    headers = {"Authorization": f"Bearer {access_token}"}

    res = requests.get(url, headers=headers)

    if res.status_code == 200:
        data = res.json()

        games = data["fantasy_content"]["users"]["0"]["user"]