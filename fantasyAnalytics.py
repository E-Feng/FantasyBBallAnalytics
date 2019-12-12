import json
import mysql.connector
import sqlalchemy 
import pandas as pd
import numpy as np
from operator import add
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
print("All tables initialized and loaded with data")

# Obtaining tables from MySQL
teams_raw = pd.read_sql_table("teams", engine)
sch_home_raw = pd.read_sql_table("schedules", engine)
sb_raw = pd.read_sql_table("scoreboard", engine)

num_teams = teams_raw.shape[0]
num_weeks = sch_home_raw["week"].iloc[-1]

# Creating dataframe for home teams and concatenating
sch_away_raw = sch_home_raw.copy()
sch_away_raw = sch_away_raw.rename(columns={"away_id":"home_id", "home_id":"away_id", "away_team":"home_team", "home_team":"away_team"})
sch_away_raw.loc[(sch_away_raw["won"] == 1), "won"] = 3
sch_away_raw.loc[(sch_away_raw["won"] == 0), "won"] = 1
sch_away_raw.loc[(sch_away_raw["won"] == 3), "won"] = 0

schedule = sch_home_raw.append(sch_away_raw, sort=False).sort_values("id")
schedule = schedule.reset_index()

schedule = pd.merge(schedule, teams_raw[["id", "team_name", "first_name"]], how="left", left_on="away_team", right_on="id")
schedule = schedule.drop(columns=["index", "id_x", "id_y"])

matchup_res = {}

standings_res = teams_raw[["id", "team_name", "wins", "losses"]].sort_values("wins", ascending=False)
for col in list(sb_raw)[1:]:
    standings_res[col] = "0-0-0"

# Creating array for win/loss timeline
wins_timeline = np.zeros((num_teams, num_weeks))
losses_timeline = np.zeros((num_teams, num_weeks))

for index, row in schedule.iterrows():
    home_id = row["home_id"]
    home_team = row["home_team"]
    away_team = row["away_team"]
    week = row["week"]

    away_name = teams_raw.loc[teams_raw["id"] == away_team, "first_name"].values[0]
    if week not in matchup_res: matchup_res[week] = {}

    # Check schedule stat has occured
    if not pd.isna(home_id):
        matchup_res[week][home_team] = {}

        # Obtaining stats for the home team and matchups
        home_stats = sb_raw.loc[sb_raw["scores_id"] == home_id].drop(columns="scores_id")
        weekly_matchups = schedule.loc[(schedule["week"] == week) & (schedule["away_id"] != row["home_id"])]
        weekly_matchups = weekly_matchups.drop(columns="won")

        # Obtaining stats for all other matchups and calculating difference
        away_stats_raw = pd.merge(weekly_matchups["away_id"], sb_raw, left_on="away_id", right_on="scores_id")
        away_stats_raw = away_stats_raw.drop(columns=["away_id", "scores_id"])

        away_stats_sub = away_stats_raw.sub(home_stats.values)
        away_stats_sub["tos"] *= -1
        away_stats_sub["ejs"] *= -1

        # Updating standings with individual category wins/losses
        cat_wins = (away_stats_sub < 0).sum()
        cat_losses = (away_stats_sub > 0).sum()
        cat_ties = (away_stats_sub == 0).sum()

        for cat, val in cat_wins.items():
            cur_str = standings_res.loc[standings_res["id"] == home_team, cat].values[0]
            cur_list = list(map(int, cur_str.split('-')))

            cat_vals = [val, cat_losses[cat], cat_ties[cat]]
            new_list = list(map(add, cur_list, cat_vals))
            new_str = list(map(str, new_list))
            new_str = new_str[0] + "-" + new_str[1] + "-" + new_str[2]

            standings_res.loc[standings_res["id"] == home_team, cat] = new_str

        # Adding on most category win/losses
        total_wins = (away_stats_sub < 0).sum(axis=1)
        total_losses = (away_stats_sub > 0).sum(axis=1)
        away_stats_sub["wins"] = total_wins
        away_stats_sub["losses"] = total_losses

        # Adding to win/loss timeline
        if row["won"]:
            wins_timeline[home_team-1][week-1:] += 1
        else:
            losses_timeline[home_team-1][week-1:] += 1

        # Cleaning up before joining df
        weekly_matchups = weekly_matchups.reset_index(drop=True)
        weekly_matchups = weekly_matchups.drop(columns=["week", "home_id", "away_id", "home_team", "away_team"])

        away_final_sub = pd.concat([weekly_matchups, away_stats_sub], axis=1)
        away_final_raw = pd.concat([weekly_matchups, away_stats_raw], axis=1)

        matchup_res[week][home_team]["away_name"] = away_name
        matchup_res[week][home_team]["home_stats"] = home_stats.to_json(orient="table", index=False)
        matchup_res[week][home_team]["away_raw"] = away_final_raw.to_json(orient="table", index=False)
        matchup_res[week][home_team]["away_sub"] = away_final_sub.to_json(orient="table", index=False)

# Teams data to json file
teams_json = {}
teams_json["teams"] = teams_raw.to_json(orient="table", index=False)

# Standings data to json file
standings_res = standings_res.drop(columns="id")
standings_res.reset_index(inplace=True, drop=True)
standings_res.index += 1

standings_json = standings_res.to_json(orient="table")

# Timeline data to json file
homepage_json = {}

per_timeline = wins_timeline / (wins_timeline + losses_timeline)
per_timeline[per_timeline == np.inf] = 0
homepage_json["per_timeline"] = per_timeline.tolist()


# Saving final dict to json file
file_name = "json/matchup_data.json"

with open(file_name, "w") as fp:
    json.dump(matchup_res, fp)

file_name = "json/team_data.json"

with open(file_name, "w") as fp:
    json.dump(teams_json, fp)

file_name = "json/standings_data.json"

with open(file_name, "w") as fp:
    json.dump(standings_json, fp)

file_name = "json/homepage_data.json"

with open(file_name, "w") as fp:
    json.dump(homepage_json, fp)