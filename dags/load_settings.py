import os
import json
import requests


def get_scoring_period_id(default_league_info):
  """
  Gets the current scoring period to compute previous daily scores
  """
  league_id = default_league_info.get('leagueId')
  league_year = default_league_info.get('leagueYear')

  # Hardcoded URL very likely to work, my public league
  url = f'https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/{league_year}/segments/0/leagues/{league_id}?view=scoringperiodid'

  r = requests.get(url)

  if r.status_code == 200:
    data = r.json()

    scoring_period_id = str(data['scoringPeriodId'] - 1)

    return scoring_period_id
  else:
    print("Failed fetching data from ESPN")
    print(r.text)
    raise ValueError("Error obtaining data from ESPN API")
  

def get_last_posted_scoring_period(year):
  url = f"https://fantasy-cc6ec-default-rtdb.firebaseio.com/v1/{year}/common/scoring_period.json"

  r = requests.get(url)

  if r.status_code == 200:
    data = r.json()

    return data