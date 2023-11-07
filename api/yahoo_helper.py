import requests


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