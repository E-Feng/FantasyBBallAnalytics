import json
import requests
import unicodedata

from consts import ESPN_DATA_FETCH_LEAGUE_ID


def invoke_lambda(client, function_name, payload):
  if not isinstance(payload, str):
    payload = json.dumps(payload)
  
  res = client.invoke(
    FunctionName=function_name,
    InvocationType='RequestResponse',
    Payload=payload
  )

  if res['StatusCode'] != 200 or res.get('FunctionError', False):
    return []

  data = json.loads(res['Payload'].read().decode())['body']

  return data


def get_current_espn_league_year():
    year_url = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/"

    res = requests.get(year_url)

    data = res.json()
    league_year = int(data[0]["id"])

    return league_year


def get_current_yahoo_league_year():
  espn_year = get_current_espn_league_year()

  return str(espn_year - 1)


def get_default_league_info():
  league_id = ESPN_DATA_FETCH_LEAGUE_ID

  league_info = {
    "leagueId": league_id,
    "leagueYear": get_current_espn_league_year()
  }
  return league_info


def calculate_gamescore(player):
  """
  Calculates fantasy gamescore, differing from the real gamescore by omitting
  player fouls and merging offensive and defensive rebounds
  """

  try:
    score = player['pts'] + 0.4*player['fgMade'] - 0.7*player['fgAtt'] - \
              0.4*(player['ftAtt'] - player['ftMade']) + 0.5*player['rebs'] + \
              player['stls'] + 0.7*player['asts'] + 0.7*player['blks'] - \
              player['tos']
    
    score = round(score, 1)
    return score
  except:
    return None


def format_stat_ratings(data: list):
  formatted = {}
  for stat in data:
    stat_id = str(stat['forStat'])
    formatted[stat_id] = round(stat['rating'], 2)
  return formatted


def format_stats(data: dict):
  formatted = {}
  for id in data:
    val = data[id]

    if val == "Infinity":
      formatted[id] = 0
    else:
      formatted[id] = round(float(val), 2)
  
  return formatted


def capitalize_dict_keys(data):
  """
  Capitalizes keys from case-insensitive RDS queries for compatibility
  with front-end
  """
  capitalize_keys = {
    'picknumber': 'pickNumber', 'playername': 'playerName',
    'teamid': 'teamId', 'ratingseason': 'ratingSeason',
    'ratingnoejsseason': 'ratingNoEjsSeason', 'rankingseason': 'rankingSeason',
    'rankingnoejsseason': 'rankingNoEjsSeason', 'fgmade': 'fgMade',
    'fgatt': 'fgAtt', 'ftmade': 'ftMade', 'ftatt': 'ftAtt', 'threesatt': 'threesAtt',
    'fullname': 'fullName'
  }

  new_data = []

  # Loop over list first, data=(list of dicts)
  for i in range(len(data)):
    new_dict = {}

    old_dict = data[i]
    keys = old_dict.keys()

    for key in keys:
      if key in capitalize_keys.keys():
        new_dict[capitalize_keys[key]] = old_dict[key]
      else:
        new_dict[key] = old_dict[key]

    new_data.append(new_dict)

  return new_data


def strip_character_accents(s):
    nfkd_form = unicodedata.normalize('NFKD', s)
    return ''.join([c for c in nfkd_form if not unicodedata.combining(c)])