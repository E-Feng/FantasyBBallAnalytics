import pandas as pd


def merge_roster_into_teams(teams: pd.DataFrame, roster: pd.DataFrame):
  teams = teams.merge(roster, left_on="teamId", right_on="teamId")

  return teams