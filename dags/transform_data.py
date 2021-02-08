import json
import math
import pandas as pd

import consts


def transform_scoreboard_to_df(**context):
  """
  Transforms scoreboard raw json data from ESPN API to pandas dataframe
  """

  raw_json = context['ti'].xcom_pull(key='scoreboard_data', task_ids=['extract_scoreboard_info'])
  data = raw_json[0]['schedule']

  num_teams = len(raw_json[0]['teams'])

  df = pd.DataFrame()

  sides = ('home', 'away')

  # Going through all scoreboard data
  for match in data:
    # Iterate both home and away scores in each matchup
    for side in sides:
      # Check if scheduled matchup has occured
      if 'cumulativeScore' in match[side]:
        away = 'away' if (side == 'home') else 'home'

        row = {}

        row['teamId'] = match[side]['teamId']
        row['awayId'] = match[away]['teamId']
        row['week'] = math.ceil(match['id']/(num_teams/2))
        row['won'] = True if (match['winner'].lower() == side) else False
        row['fgPer'] = match[side]['cumulativeScore']['scoreByStat'][consts.FG_PER]['score']
        row['ftPer'] = match[side]['cumulativeScore']['scoreByStat'][consts.FT_PER]['score']
        row['threes'] = match[side]['cumulativeScore']['scoreByStat'][consts.THREES]['score']
        row['rebs'] = match[side]['cumulativeScore']['scoreByStat'][consts.REBS]['score']
        row['asts'] = match[side]['cumulativeScore']['scoreByStat'][consts.ASTS]['score']
        row['stls'] = match[side]['cumulativeScore']['scoreByStat'][consts.STLS]['score']
        row['blks'] = match[side]['cumulativeScore']['scoreByStat'][consts.BLKS]['score']
        row['tos'] = match[side]['cumulativeScore']['scoreByStat'][consts.TOS]['score']
        row['ejs'] = match[side]['cumulativeScore']['scoreByStat'][consts.EJS]['score']
        row['pts'] = match[side]['cumulativeScore']['scoreByStat'][consts.PTS]['score']

        # Appending full match details into df
        print(row)
        df = df.append(row, ignore_index = True)

  # Convert to json and push to xcom for next task
  scoreboard_json = df.to_json(orient='records')
  context['ti'].xcom_push(key='scoreboard_df', value=scoreboard_json)

def transform_team_to_df(**context):
  """
  Transforms team raw json data from ESPN API to pandas dataframe
  """

  raw_json = context['ti'].xcom_pull(key='team_data', task_ids=['extract_team_info'])
  data = raw_json[0]

  df = pd.DataFrame()

  # Iterate through all teams
  for team in data['teams']:
    row = {}

    row['teamId'] = team['id']
    row['location'] = team['location']
    row['teamName'] = team['nickname']
    row['abbrev'] = team['abbrev']
    row['seed'] = team['playoffSeed']
    row['wins'] = team['record']['overall']['wins']
    row['losses'] = team['record']['overall']['losses']

    row['fullTeamName'] = team['location'] + ' ' + team['nickname']

    # Getting first and last name from 'members' key
    for member in data['members']:
      if member['id'] == team['primaryOwner']:
        row['firstName'] = member['firstName']
        row['lastName'] = member['lastName']

    print(row)
    df = df.append(row, ignore_index=True)

  # Convert to json and push to xcom for next task
  team_json = df.to_json(orient='records')
  context['ti'].xcom_push(key='team_df', value=team_json)  