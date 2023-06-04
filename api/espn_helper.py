import requests


year_url = "https://fantasy.espn.com/apis/v3/games/fba/seasons/"
base_url = "https://fantasy.espn.com/apis/v3/games/fba/seasons/{}/segments/0/leagues/{}?view=mSettings"


def get_current_espn_league_year():
    res = requests.get(year_url)

    data = res.json()
    league_year = data[0]["id"]

    return league_year

def get_espn_league_status(league_id, cookies):
    league_year = get_current_espn_league_year()

    url = base_url.format(league_year, league_id)

    res = requests.get(url, cookies=cookies)

    if res.status_code == 200:
        return "VALID"
    else:
        data = res.json()
        if data.get("details"):
            status = data["details"][0]["type"]
        else:
            status = "INVALID_LEAGUE_ID"

    return status