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
    return score
  except:
    return None


def format_stat_ratings(data: list):
  formatted = {}
  for stat in data:
    stat_id = stat['forStat']
    formatted[stat_id] = round(stat['rating'], 2)
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