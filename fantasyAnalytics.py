import json
import mysql.connector
import sqlalchemy 
import pandas as pd
from dataScraper import DataScraper


# Initializing parameters and database
MYSQL_USER = "root"
MYSQL_PASS = "123456"
MYSQL_HOST = "localhost"
MYSQL_DB = "fantasybball"

league_id = 48375511
league_year = 2020

mydb = mysql.connector.connect(
    host = MYSQL_HOST,
    user = MYSQL_USER,
    passwd = MYSQL_PASS,
    database = MYSQL_DB
)

engine = sqlalchemy.create_engine("mysql+mysqlconnector://"+MYSQL_USER+":"+MYSQL_PASS+"@"+MYSQL_HOST+"/"+MYSQL_DB)

data_scraper = DataScraper(mydb, league_id, league_year)
data_scraper.init_tables()
data_scraper.get_team_data()
data_scraper.get_scoreboard_data()
data_scraper.get_player_data()

# Obtaining tables from MySQL
teams = pd.read_sql_table("teams", engine)
schedule_home = pd.read_sql_table("schedules", engine)
scoreboard = pd.read_sql_table("scoreboard", engine)

num_teams = teams.shape[0]

# Creating dataframe for home teams and concatenating
schedule_away = schedule_home.copy()
schedule_away = schedule_away.rename(columns={"away_id":"home_id", "home_id":"away_id", "away_team":"home_team", "home_team":"away_team"})

schedule = schedule_home.append(schedule_away, sort=False).sort_values("id")
schedule = schedule.reset_index()

schedule = pd.merge(schedule, teams[["id", "location", "nickname", "first_name"]], how="left", left_on="away_team", right_on="id")
schedule = schedule.drop(columns=["index", "id_x", "id_y"])

matchup_analytics = {}

for index, row in schedule.iterrows():
    home_id = row["home_id"]
    home_team = row["home_team"]
    away_team = row["away_team"]
    week = row["week"]

    away_name = teams.loc[teams["id"] == away_team, "first_name"].values[0]
    if week not in matchup_analytics: matchup_analytics[week] = {}

    # Check schedule stat has occured
    if not pd.isna(home_id):
        matchup_analytics[week][home_team] = {}

        # Obtaining stats for the home team and matchups
        home_stats = scoreboard.loc[scoreboard["scores_id"] == home_id].drop(columns="scores_id")
        weekly_matchups = schedule.loc[(schedule["week"] == week) & (schedule["away_id"] != row["home_id"])]

        # Obtaining stats for all other matchups and calculating difference
        away_stats_raw = pd.merge(weekly_matchups["away_id"], scoreboard, left_on="away_id", right_on="scores_id")
        away_stats_raw = away_stats_raw.drop(columns=["away_id", "scores_id"])

        away_stats_sub = away_stats_raw.sub(home_stats.values)
        away_stats_sub["tos"] *= -1
        away_stats_sub["ejs"] *= -1

        wins = (away_stats_sub < 0).sum(axis=1)
        losses = (away_stats_sub > 0).sum(axis=1)
        away_stats_sub["wins"] = wins
        away_stats_sub["losses"] = losses

        # Cleaning up before joining df
        weekly_matchups = weekly_matchups.reset_index(drop=True)
        weekly_matchups = weekly_matchups.drop(columns=["week", "home_id", "away_id", "home_team", "away_team"])

        away_final_sub = pd.concat([weekly_matchups, away_stats_sub], axis=1)
        away_final_raw = pd.concat([weekly_matchups, away_stats_raw], axis=1)

        matchup_analytics[week][home_team]["away_name"] = away_name
        matchup_analytics[week][home_team]["home_stats"] = home_stats.to_json(orient="table", index=False)
        matchup_analytics[week][home_team]["away_raw"] = away_final_raw.to_json(orient="table", index=False)
        matchup_analytics[week][home_team]["away_sub"] = away_final_sub.to_json(orient="table", index=False)

teams_json = {}
teams_json["teams"] = teams.to_json(orient="table", index=False)

# Saving final dict to json file
file_name = "matchup_data.json"

with open(file_name, "w") as fp:
    json.dump(matchup_analytics, fp)

file_name = "team_data.json"

with open(file_name, "w") as fp:
    json.dump(teams_json, fp)