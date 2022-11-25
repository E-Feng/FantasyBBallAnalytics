import pandas as pd

import consts


def transform_players_truncate(players: pd.DataFrame):
  is_owned = players['onTeamId'] > 0

  all_cond = is_owned

  return players[all_cond]

def transform_players_no_ejections(players: pd.DataFrame):
  def calculate_ratings_no_ejections(ratings: dict):
    if pd.notnull(ratings):
      ratings.pop(consts.EJS, None)
      return sum(ratings.values())
    return None

  players['totalRatingSeasonNoEjs'] = players['statRatingsSeason'].apply(calculate_ratings_no_ejections)

  players['totalRankingSeasonNoEjs'] = players['totalRatingSeasonNoEjs'].rank(method='min', na_option='top', ascending=False)

  return players

def transform_draft_recap(draft: pd.DataFrame, players: pd.DataFrame, settings: pd.DataFrame):
  has_ejections_cat = int(consts.EJS) in settings.iloc[0]['categoryIds']

  columns = ['pickNumber', 'round', 'playerName', 'teamId', 'ratingSeason', 'rankingSeason']
  if has_ejections_cat:
    columns.append('ratingEjsSeason')
    columns.append('rankingEjsSeason')

  draft_recap_full = pd.merge(draft, players, how='left', on='playerId')

  draft_recap_full.rename(columns={
    'totalRatingSeason': 'ratingEjsSeason',
    'totalRankingSeason': 'rankingEjsSeason',
    'totalRatingSeasonNoEjs': 'ratingSeason',
    'totalRankingSeasonNoEjs': 'rankingSeason',
  }, inplace=True)

  draft_recap = draft_recap_full[columns]

  return draft_recap