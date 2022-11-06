import pandas as pd

import consts

def transform_draft_recap(draft: pd.DataFrame, players: pd.DataFrame, settings:pd.DataFrame):
  has_ejections_cat = int(consts.EJS) in settings.iloc[0]['categoryIds']

  columns = ['pickNumber', 'round', 'playerName', 'teamId', 'ratingSeason', 'rankingSeason']
  if has_ejections_cat:
    columns.append('ratingEjsSeason')
    columns.append('rankingEjsSeason')

  draft_recap_full = pd.merge(draft, players, how='left', on='playerId')

  draft_recap = draft_recap_full[columns]

  return draft_recap