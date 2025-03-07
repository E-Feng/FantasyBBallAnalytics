import json
import math
import pandas as pd

import consts
from util import (
  get_current_espn_league_year,
  calculate_gamescore, 
  format_stat_ratings,
  format_stats
)


def transform_raw_to_df(endpoint: list, raw_data: dict):
  """
  Index function for all endpoint transformations
  """
  # Temperory replacement until match supported in Python 3.10
  if endpoint == 'teams':
    df = transform_team_to_df(raw_data)
  elif endpoint == 'rosters':
    df = transform_roster_to_df(raw_data)    
  elif endpoint == 'scoreboard':
    df = transform_scoreboard_to_df(raw_data)
  elif endpoint == 'draft':
    df = transform_draft_to_df(raw_data)
  elif endpoint == 'players':
    df = transform_players_to_df(raw_data)
  elif endpoint == 'settings':
    df = transform_settings_to_df(raw_data)
  elif endpoint == 'daily':
    df = transform_daily_to_df(raw_data)
  else:
    df = pd.DataFrame()

  return df


def transform_team_to_df(team_info: dict):
  """
  Transforms team raw json data from ESPN API to pandas dataframe
  """

  data = team_info

  data_array = []

  # Iterate through all teams
  for team in data['teams']:
    row = {}

    row['teamId'] = team['id']
    row['fullTeamName'] = team["name"]
    row['abbrev'] = team['abbrev']
    row['seed'] = team['playoffSeed']
    row['wins'] = team['record']['overall']['wins']
    row['losses'] = team['record']['overall']['losses']

    # Getting first and last name from teams key
    row['firstName'] = 'Unknown'
    row['lastName'] = 'Unknown'
    for member in data['members']:
      if member['id'] == team.get('primaryOwner'):
        row['firstName'] = member.get('firstName', 'Unknown')
        row['lastName'] = member.get('lastName', 'Unknown')
  
    data_array.append(row)

  df = pd.DataFrame.from_records(data_array)

  #print(df.head(2))
  #print(df.tail(2))

  return df


def transform_roster_to_df(roster: dict):
  data = roster

  data_array = []

  for team in data["teams"]:
    for entry in team["roster"]["entries"]:
      row = {}

      row["teamId"] = team["id"]
      
      row["playerId"] = str(entry['playerId'])
      row["lineupSlotId"] = entry['lineupSlotId']
      row["acquisitionType"] = entry['acquisitionType']

      data_array.append(row)

  df = pd.DataFrame.from_records(data_array)

  return df


def transform_scoreboard_to_df(scoreboard: dict):
  """
  Transforms scoreboard raw json data from ESPN API to pandas dataframe
  """

  data = scoreboard['schedule']

  num_teams = len(scoreboard['teams'])
  num_byes = 0
  current_week = scoreboard['status'].get('currentMatchupPeriod', 0)

  data_array = []

  sides = ('home', 'away')

  # Going through all scoreboard data
  for match in data:
    # Check if both sides exist (bye weeks have no away)
    if (sides[0] in match) & (sides[1] in match):
      # Iterate both home and away scores in each matchup
      for side in sides:
        # Check if scheduled matchup has occured
        # if 'cumulativeScore' in match[side]:
        week = math.ceil((match['id'] - num_byes)/(num_teams/2))
        if week <= (current_week + 1):
          away = 'away' if (side == 'home') else 'home'

          row = {}

          row['teamId'] = match[side]['teamId']
          row['awayId'] = match[away]['teamId']
          row['week'] = week
          row['won'] = True if (match['winner'].lower() == side) else False

          # Category stats, using .get() for potential KeyErrors
          scores = match[side].get('cumulativeScore', {}).get('scoreByStat')

          if scores:
            scores = {} if scores is None else scores

            row['fgMade'] = scores.get(consts.FG_MADE, {}).get('score', 0)
            row['fgAtt'] = scores.get(consts.FG_ATT, {}).get('score', 0)
            row['fgPer'] = scores.get(consts.FG_PER, {}).get('score', 0)
            row['ftMade'] = scores.get(consts.FT_MADE, {}).get('score', 0)
            row['ftAtt'] = scores.get(consts.FT_ATT, {}).get('score', 0)
            row['ftPer'] = scores.get(consts.FT_PER, {}).get('score', 0)
            row['threes'] = scores.get(consts.THREES, {}).get('score', 0)
            row['threesAtt'] = scores.get(consts.THREE_ATT, {}).get('score', 0)
            row['threesPer'] = scores.get(consts.THREE_PER, {}).get('score', 0)
            row['orebs'] = scores.get(consts.OREBS, {}).get('score', 0)
            row['drebs'] = scores.get(consts.DREBS, {}).get('score', 0)
            row['rebs'] = scores.get(consts.REBS, {}).get('score', 0)
            row['asts'] = scores.get(consts.ASTS, {}).get('score', 0)
            row['astsToRatio'] = scores.get(consts.AST_TO_R, {}).get('score', 0)
            row['stls'] = scores.get(consts.STLS, {}).get('score', 0)
            row['blks'] = scores.get(consts.BLKS, {}).get('score', 0)
            row['tos'] = scores.get(consts.TOS, {}).get('score', 0)
            row['dqs'] = scores.get(consts.DQS, {}).get('score', 0)
            row['ejs'] = scores.get(consts.EJS, {}).get('score', 0)
            row['flags'] = scores.get(consts.FLAGS, {}).get('score', 0)
            row['pfs'] = scores.get(consts.PFS, {}).get('score', 0)
            row['techs'] = scores.get(consts.TECHS, {}).get('score', 0)
            row['dds'] = scores.get(consts.DDS, {}).get('score', 0)
            row['tds'] = scores.get(consts.TDS, {}).get('score', 0)
            row['qds'] = scores.get(consts.QDS, {}).get('score', 0)            
            row['pts'] = scores.get(consts.PTS, {}).get('score', 0)
            row['teamWins'] = scores.get(consts.TWS, {}).get('score', 0)
            row['fpts'] = match[side]['totalPoints']

            # Clean null values
            row = {k: v for k, v in row.items() if (type(v) == int or type(v) == float)}

          # Appending full match details into df
          data_array.append(row)

    # Adjusting id/week for byes
    elif (sides[0] in match) & (sides[1] not in match):
      num_byes += 0.5

  df = pd.DataFrame.from_records(data_array)

  #print(df.head(2))
  #print(df.tail(2))

  return df


def transform_draft_to_df(draft_info: dict):
  """
  Transforms draft detail raw json data from ESPN API to pandas dataframe
  """

  data = draft_info

  data_array = []

  # Iterate through all teams
  for pick in data['draftDetail']['picks']:
    row = {}

    row['pickNumber'] = pick['overallPickNumber']
    row['round'] = pick['roundId']
    row['teamId'] = pick['teamId']
    row['playerId'] = str(pick['playerId'])

    #print(row)
    data_array.append(row)

  df = pd.DataFrame.from_records(data_array)  

  #print(df.head(2))
  #print(df.tail(2))

  return df


def transform_players_to_df(ratings: dict):
  """
  Transforms players raw json data from ESPN API to pandas dataframe
  """

  period_mapping = {
    "Season": consts.SEASON,
    "Last7": consts.LAST7,
    "Last15": consts.LAST15,
    "Last30": consts.LAST30
  }

  data = ratings  

  data_array = []
  category_ids = []

  # Iterate through all players
  for player in data['players']:
    row = {}

    row['playerId'] = str(player['id'])
    row['playerName'] = player['player']['fullName']
    # row['onTeamId'] = player['onTeamId']
    row['injuryStatus'] = player['player'].get('injuryStatus', 'ACTIVE')
    row['proTeamId'] = player['player']['proTeamId']

    row['percentOwned'] = round(player['player'].get('ownership', {}).get('percentOwned', 0.0), 2)

    for period, key in period_mapping.items():
      # Check if ratings exist for player
      if player.get('ratings', {}).get(key, {}).get('statRankings', {}):
        row['totalRating' + period] = round(player['ratings'][key]['totalRating'], 2)
        row['totalRanking' + period] = player['ratings'][key]['totalRanking']

        row['statRatings' + period] = format_stat_ratings(player['ratings'][key]['statRankings'])

        if not category_ids:
          category_ids = list(row['statRatings' + period].keys())
          category_ids.append(consts.MINS)

          # Include fg/ft att/made if per exists
          if consts.FG_PER in category_ids:
            category_ids.extend([consts.FG_MADE, consts.FG_ATT])
          if consts.FT_PER in category_ids:
            category_ids.extend([consts.FT_MADE, consts.FT_ATT])

      # Stats, dynamic filtering out right dict that matches id field
      if player["player"].get("stats"):
        year = max([d["seasonId"] for d in player["player"]["stats"]])

        stats_period = [d for d in player['player']['stats'] if d.get('id') == f'0{key}{year}']

        if stats_period and stats_period[0].get('averageStats'):
          row['stats' + period] = stats_period[0]['averageStats']

          # Filtering category ids only
          if category_ids:
            filtered_stats = {k:stats_period[0]['averageStats'].get(k, 0) for k in category_ids}
            row['stats' + period] = format_stats(filtered_stats)


    data_array.append(row)


  df = pd.DataFrame.from_records(data_array) 
 
  # print(df.head(2))
  # print(df.tail(2))

  return df


def transform_daily_to_df(daily_score: dict):
  """
  Transforms daily score raw json data from ESPN API to pandas dataframe
  """

  data = daily_score

  data_array = []

  # Iterate through all teams
  for player in data['players']:
    # Check if player has played
    if len(player['player'].get('stats', [])) > 0:
      if len(player['player']['stats'][0]['stats']) > 0:
        row = {}

        row['playerId'] = str(player['id'])
        row['teamId'] = player['onTeamId']
        row['fullName'] = player['player']['fullName']

        stats = player['player']['stats'][0]['stats']

        row['fgPer'] = stats.get(consts.FG_PER, 0)
        row['ftPer'] = stats.get(consts.FT_PER, 0)
        row['fgAtt'] = stats.get(consts.FG_ATT, 0)
        row['fgMade'] = stats.get(consts.FG_MADE, 0)
        row['ftAtt'] = stats.get(consts.FT_ATT, 0)
        row['ftMade'] = stats.get(consts.FT_MADE, 0)
        row['threes'] = stats.get(consts.THREES, 0)
        row['threesAtt'] = stats.get(consts.THREE_ATT, 0)
        row['rebs'] = stats.get(consts.REBS, 0)
        row['asts'] = stats.get(consts.ASTS, 0)
        row['stls'] = stats.get(consts.STLS, 0)
        row['blks'] = stats.get(consts.BLKS, 0)
        row['tos'] = stats.get(consts.TOS, 0)
        row['ejs'] = stats.get(consts.EJS, 0)
        row['pts'] = stats.get(consts.PTS, 0)
        row['mins'] = stats.get(consts.MINS, 0)

        row['gs'] = calculate_gamescore(row)

        #print(row['name'], row['gs'])

        data_array.append(row)

  df = pd.DataFrame.from_records(data_array)

  # Sort by gamescore, then points      
  if not df.empty:
    df = df.sort_values(by=['gs', 'pts'], ascending=False)

    #print(df.head(2))
    #print(df.tail(2))

  return df


def transform_settings_to_df(settings: dict):
  """
  Transforms settings raw json data from ESPN API to pandas dataframe
  """
  data = settings

  data_array = []

  # Iterate through all category ids
  row = {}

  row['isActive'] = data["status"]["isActive"]
  row['currentWeek'] = data["status"]["currentMatchupPeriod"]

  row['categoryIds'] = [int(consts.MINS)]
  for category in data['settings']['scoringSettings']['scoringItems']:
    row['categoryIds'].append(category['statId'])

  scoring_type = data['settings']['scoringSettings']['scoringType']
  row['scoringType'] = scoring_type

  # Check if points league, fantasy points will be appended as -1
  if scoring_type == 'H2H_POINTS':
    row['categoryIds'].append(int(consts.FPTS))

  # Playoff matchup weeks
  row['matchupPeriods'] = data['settings']['scheduleSettings']['matchupPeriods']

  data_array.append(row)

  df = pd.DataFrame.from_records(data_array)

  #print(df.head(2))
  #print(df.tail(2))

  return df