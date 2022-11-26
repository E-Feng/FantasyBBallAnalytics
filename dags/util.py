import json


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