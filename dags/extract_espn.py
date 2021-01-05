import os
import requests
import json


# Initializing API URLs from ESPN and cookies
league_year = 2021
league_id = 48375511

base_url = 'https://fantasy.espn.com/apis/v3/games/fba/seasons/{}/segments/0/leagues/{}'
league_url = base_url.format(league_year, league_id)

cookie_espn = os.environ['COOKIE_ESPN_S2']
cookie_swid = os.environ['COOKIE_SWID']

cookies = {"swid": cookie_swid, "espn_s2": cookie_espn}


def extract_team_info():
  """
  Extracts team data from ESPN API
  """

  r = requests.get(league_url,
                   params = {"view": "mTeam"},
                   cookies = cookies)

  return r

extract_team_info()