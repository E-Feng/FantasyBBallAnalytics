import json
import math
import pandas as pd

from airflow.decorators import task

import consts
from util import calculate_gamescore


@task
def transform_raw_to_df(endpoint: list, raw_data: dict):
  """
  Index function for all endpoint transformations
  """
  # Temperory replacement until match supported in Python 3.10
  if endpoint == 'teams':
    df = transform_team_to_df(raw_data)
  elif endpoint == 'scoreboard':
    df = transform_scoreboard_to_df(raw_data)
  elif endpoint == 'draftRecap':
    df = transform_draft_to_df(raw_data)
  elif endpoint == 'ratings':
    df = transform_ratings_to_df(raw_data)
  elif endpoint == 'settings':
    df = transform_settings_to_df(raw_data)
  elif endpoint == 'daily':
    df = transform_daily_to_df(raw_data)
  else:
    df = pd.DataFrame()

  # Convert to json and push to xcom for next task
  json = df.to_json(orient='records')

  return json


def transform_team_to_df(team_info: dict):
  """
  Transforms team raw json data from ESPN API to pandas dataframe
  """

  data = team_info

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

    #print(row)
    df = df.append(row, ignore_index=True)
  
  print(df.to_string())

  return df


def transform_scoreboard_to_df(scoreboard: dict):
  """
  Transforms scoreboard raw json data from ESPN API to pandas dataframe
  """

  data = scoreboard['schedule']

  num_teams = len(scoreboard['teams'])

  num_byes = 0

  df = pd.DataFrame()

  sides = ('home', 'away')

  # Going through all scoreboard data
  for match in data:
    # Check if both sides exist (bye weeks have no away)
    if (sides[0] in match) & (sides[1] in match):
      # Iterate both home and away scores in each matchup
      for side in sides:
        # Check if scheduled matchup has occured
        if 'cumulativeScore' in match[side]:
          away = 'away' if (side == 'home') else 'home'

          row = {}

          row['teamId'] = match[side]['teamId']
          row['awayId'] = match[away]['teamId']
          row['week'] = math.ceil((match['id'] - num_byes)/(num_teams/2))
          row['won'] = True if (match['winner'].lower() == side) else False

          # Category stats, using .get() for potential KeyErrors
          scores = match[side]['cumulativeScore']['scoreByStat']

          if scores:
            row['fgMade'] = scores.get(consts.FG_MADE, {}).get('score')
            row['fgAtt'] = scores.get(consts.FG_ATT, {}).get('score')
            row['fgPer'] = scores.get(consts.FG_PER, {}).get('score')
            row['ftMade'] = scores.get(consts.FT_MADE, {}).get('score')
            row['ftAtt'] = scores.get(consts.FT_ATT, {}).get('score')
            row['ftPer'] = scores.get(consts.FT_PER, {}).get('score')
            row['threes'] = scores.get(consts.THREES, {}).get('score')
            row['orebs'] = scores.get(consts.OREBS, {}).get('score')
            row['drebs'] = scores.get(consts.DREBS, {}).get('score')
            row['rebs'] = scores.get(consts.REBS, {}).get('score')
            row['asts'] = scores.get(consts.ASTS, {}).get('score')
            row['stls'] = scores.get(consts.STLS, {}).get('score')
            row['blks'] = scores.get(consts.BLKS, {}).get('score')
            row['tos'] = scores.get(consts.TOS, {}).get('score')
            row['dqs'] = scores.get(consts.DQS, {}).get('score')
            row['ejs'] = scores.get(consts.EJS, {}).get('score')
            row['flags'] = scores.get(consts.FLAGS, {}).get('score')
            row['pfs'] = scores.get(consts.PFS, {}).get('score')
            row['techs'] = scores.get(consts.TECHS, {}).get('score')
            row['pts'] = scores.get(consts.PTS, {}).get('score')
            row['fpts'] = match[side]['totalPoints']

            # Clean null values
            row = {k: v for k, v in row.items() if (type(v) == int or type(v) == float)}

            # Appending full match details into df
            print(row)
            df = df.append(row, ignore_index = True)

    # Adjusting id/week for byes
    elif (sides[0] in match) & (sides[1] not in match):
      num_byes += 0.5

  print(df.to_string())

  return df


def transform_draft_to_df(draft_info: dict):
  """
  Transforms draft detail raw json data from ESPN API to pandas dataframe
  """

  data = draft_info

  df = pd.DataFrame()

  # Iterate through all teams
  for pick in data['draftDetail']['picks']:
    row = {}

    row['pickNumber'] = pick['overallPickNumber']
    row['round'] = pick['roundId']
    row['teamId'] = pick['teamId']
    row['playerId'] = str(pick['playerId'])

    #print(row)
    df = df.append(row, ignore_index=True)
  
  print(df.to_string())

  return df


def transform_ratings_to_df(ratings: dict):
  """
  Transforms rankings raw json data from ESPN API to pandas dataframe
  """

  data = ratings  

  df = pd.DataFrame()

  # Iterate through all players
  for player in data['players']:
    row = {}

    row['playerId'] = str(player['id'])
    row['playerName'] = player['player']['fullName']

    # Check if ratings exist for player
    if 'ratings' in player:
      row['ratingSeason'] = player['ratings']['0']['totalRating']
      row['rankingSeason'] = player['ratings']['0']['totalRanking']

      # Calculating rating without ejections
      rating = 0
      for stat in player['ratings']['0']['statRankings']:
        if stat['forStat'] != int(consts.EJS):
          rating = rating + stat['rating']

      row['ratingNoEjsSeason'] = rating

    #print(row)
    df = df.append(row, ignore_index=True)
  
  print(df.to_string())

  return df


def transform_daily_to_df(daily_score: dict):
  """
  Transforms daily score raw json data from ESPN API to pandas dataframe
  """

  data = daily_score

  df = pd.DataFrame()

  # Iterate through all teams
  for player in data['players']:
    # Check if player has played
    if len(player['player']['stats']) > 0:
      if len(player['player']['stats'][0]['stats']) > 0:
        row = {}

        row['playerId'] = player['id']
        row['teamId'] = player['onTeamId']
        row['fullName'] = player['player']['fullName']

        stats = player['player']['stats'][0]['stats']

        row['fgPer'] = stats[consts.FG_PER]
        row['ftPer'] = stats[consts.FT_PER]
        row['fgAtt'] = stats[consts.FG_ATT]
        row['fgMade'] = stats[consts.FG_MADE]
        row['ftAtt'] = stats[consts.FT_ATT]
        row['ftMade'] = stats[consts.FT_MADE]
        row['threes'] = stats[consts.THREES]
        row['threesAtt'] = stats[consts.THREEA]
        row['rebs'] = stats[consts.REBS]
        row['asts'] = stats[consts.ASTS]
        row['stls'] = stats[consts.STLS]
        row['blks'] = stats[consts.BLKS]
        row['tos'] = stats[consts.TOS]
        row['ejs'] = stats[consts.EJS]
        row['pts'] = stats[consts.PTS]
        row['mins'] = stats[consts.MINS]

        row['gs'] = calculate_gamescore(row)

        #print(row['name'], row['gs'])

        df = df.append(row, ignore_index=True)

  # Sort by gamescore, then points      
  if not df.empty:
    df = df.sort_values(by=['gs', 'pts'], ascending=False)
    print('\n' + df.to_string())

  return df


def transform_settings_to_df(settings: dict):
  """
  Transforms settings raw json data from ESPN API to pandas dataframe
  """
  data = settings

  df = pd.DataFrame()

  # Iterate through all category ids
  row = {}
  row['categoryIds'] = []
  for category in data['settings']['scoringSettings']['scoringItems']:
    row['categoryIds'].append(category['statId'])

  # Check if points league, fantasy points will be appended as -1
  if data['settings']['scoringSettings']['scoringType'] == 'H2H_POINTS':
    row['categoryIds'].append(-1)

  df = df.append(row, ignore_index=True)

  print(df.to_string())

  return df