import json
import math
import pandas as pd

from airflow.decorators import task

import consts
from util import calculate_gamescore


@task
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

  # Convert to json and push to xcom for next task
  team_json = df.to_json(orient='records')
  return team_json


@task
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

    # Adjusting id/week for byes
    elif (sides[0] in match) & (sides[1] not in match):
      num_byes += 0.5


  # Convert to json and push to xcom for next task
  scoreboard_json = df.to_json(orient='records')
  return scoreboard_json


@task
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
    row['playerId'] = pick['playerId']

    #print(row)
    df = df.append(row, ignore_index=True)
  
  print(df.to_string())

  # Convert to json and push to xcom for next task
  draft_json = df.to_json(orient='records')
  return draft_json


@task
def transform_ratings_to_df(ratings: dict):
  """
  Transforms rankings raw json data from ESPN API to pandas dataframe
  """

  data = ratings  

  df = pd.DataFrame()

  # Iterate through all players
  for player in data['players']:
    row = {}

    row['id'] = player['id']
    row['playerName'] = player['player']['fullName']
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

  # Convert to json and push to xcom for next task
  ratings_json = df.to_json(orient='records')
  return ratings_json

@task
def transform_daily_score_to_df(daily_score: dict):
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

        row['id'] = player['id']
        row['teamId'] = player['onTeamId']
        row['name'] = player['player']['fullName']

        stats = player['player']['stats'][0]['stats']

        row['fgPer'] = stats[consts.FG_PER]
        row['ftPer'] = stats[consts.FT_PER]
        row['fgAtt'] = stats[consts.FGA]
        row['fgMade'] = stats[consts.FGM]
        row['ftAtt'] = stats[consts.FTA]
        row['ftMade'] = stats[consts.FTM]
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
  df = df.sort_values(by=['gs', 'pts'], ascending=False)
  print('\n' + df.to_string())

  # Convert to json and push to xcom for next task
  daily_score_json = df.to_json(orient='records')
  return daily_score_json