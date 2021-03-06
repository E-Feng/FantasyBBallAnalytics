import os
import json
import mysql.connector
import sqlalchemy 
import pymongo
import pandas as pd
import numpy as np
import numpy.matlib
from operator import add
from datetime import datetime
from dataScraper import DataScraper


# Initializing parameters and database for MySQL
MYSQL_USER = os.environ["MYSQL_USER"]
MYSQL_PASS = os.environ["MYSQL_PASS"]
MYSQL_HOST = "localhost"
MYSQL_DB = "fantasybball"

league_id = 48375511
league_year = 2020

mysqldb = mysql.connector.connect(
    host = MYSQL_HOST,
    user = MYSQL_USER,
    passwd = MYSQL_PASS,
    database = MYSQL_DB
)

cookie = {
    "swid_cookie": os.environ["swid_cookie"],
    "espn_cookie": os.environ["espn_cookie"],
}

engine = sqlalchemy.create_engine("mysql+mysqlconnector://"+MYSQL_USER+":"+MYSQL_PASS+"@"+MYSQL_HOST+"/"+MYSQL_DB)

# Initializing parameters and database for MongoDB
myclient = pymongo.MongoClient('localhost', 27017)

mymongodb = myclient["fantasybball"]

# Creating dict with both db's
dbs = {"MySQL": mysqldb, "MongoDB": mymongodb}

data_scraper = DataScraper(dbs, league_id, league_year, cookie)
data_scraper.init_sql_tables()
data_scraper.get_team_data()
data_scraper.get_scoreboard_data()
data_scraper.get_player_data()
print("All tables initialized and loaded with data")

# Obtaining tables from MySQL
teams_raw = pd.read_sql_table("teams", engine)
sch_home_raw = pd.read_sql_table("schedules", engine)
sb_raw = pd.read_sql_table("scoreboard", engine)
player_info_raw = pd.read_sql_table("player_info", engine)
player_stats_raw = pd.read_sql_table("player_stats", engine)

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

standings_res = teams_raw[["id", "seed", "team_name", "wins", "losses"]].sort_values("seed", ascending=True)
for col in list(sb_raw)[1:]:
    standings_res[col] = "0-0-0"

# Creating array for win/loss timeline
wins_timeline = np.zeros((num_teams, num_weeks+1))

# Looking through schedule and matchups
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

        # Adding on mean/mode stats
        mean = away_stats_raw.mean()
        mean[2:] = mean[2:].round()
        away_stats_raw = away_stats_raw.append(mean, ignore_index=True)

        weekly_matchups = weekly_matchups.append({"team_name": "Mean", "first_name": ""}, ignore_index=True)


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
            wins_timeline[home_team-1][week:] += 1

        # Cleaning up before joining df
        weekly_matchups = weekly_matchups.reset_index(drop=True)
        weekly_matchups = weekly_matchups.drop(columns=["week", "home_id", "away_id", "home_team", "away_team"])

        away_final_sub = pd.concat([weekly_matchups, away_stats_sub], axis=1)
        away_final_raw = pd.concat([weekly_matchups, away_stats_raw], axis=1)

        matchup_res[week][home_team]["away_name"] = away_name
        matchup_res[week][home_team]["home_stats"] = home_stats.to_json(orient="table", index=False)
        matchup_res[week][home_team]["away_raw"] = away_final_raw.to_json(orient="table", index=False)
        matchup_res[week][home_team]["away_sub"] = away_final_sub.to_json(orient="table", index=False)

# Looking through players for current injuries
injury_list = []
for index, row in player_info_raw.sort_values("team_id").iterrows():
    # Check if player is currently rostered and not active
    if not np.isnan(row["team_id"]):
        if not row["state"] == "ACTIVE":
            player = {
                "name": row["first_name"] + " " + row["last_name"],
                "state": row["state"],
                "team": row["team_id"],
            }
            injury_list.append(player)

# Getting best/worse ranked players for each
player_stats_merge = player_stats_raw[["player_id", "period", "zscore"]]
player_info_merge = player_info_raw[["player_id", "team_id", "first_name", "last_name"]]
zscores = pd.merge(player_stats_merge, player_info_merge, how="left", on="player_id")

best_players = []

periods = ["002020", "012020", "022020", "032020"]
for team_id in range(1, num_teams+1):
    for period in periods:
        subset = zscores.loc[(zscores["team_id"] == team_id) & (zscores["period"] == period)]
        sorted = subset.sort_values(by=["zscore"], ascending=False)
        
        best_player = sorted.head(1)
        best_player["rank"] = "best"
        worst_player = sorted.tail(1)
        worst_player["rank"] = "worse"

        best_players.append(best_player.to_dict(orient="records")[0])
        best_players.append(worst_player.to_dict(orient="records")[0])

# All raw stats
all_stats = pd.merge(player_stats_raw, player_info_raw, how="left", on="player_id")
all_stats_json = all_stats.to_json(orient="records")

# Teams data to json file
teams_json = teams_raw.to_json(orient="records")

# Standings data to json file
standings_res = standings_res.drop(columns="id")

standings_json = standings_res.to_json(orient="records")

# Timeline data to json file, adding offset to make neater graph
r = 0.25
offset = np.matlib.repmat(np.linspace(0, r, num_teams).transpose(), num_weeks+1, 1)
index = wins_timeline.sum(axis=1).argsort()
ranks = index.argsort()
wins_timeline = wins_timeline + offset[:,ranks].transpose()
wins_timeline_list = wins_timeline.transpose().tolist()

# Misc Data
misc_data = {}
# Last updated time
now = datetime.now()
dt_string = now.strftime("%m/%d/%Y %I:%M:%S %p")
misc_data["time"] = dt_string

# Saving all results to json files
json_files = {"wins_timeline": wins_timeline_list,
              "injury_list": injury_list,
              "matchup_data": matchup_res,
              "standings_data": standings_json,
              "team_data": teams_json,
              "best_players": best_players,
              "misc_data": misc_data,
              "all_stats": all_stats_json}

for file_name, data in json_files.items():
    path = "C:\\Users\\Elvin\\Desktop\\JSONStorage\\"
    file_name = path + file_name + ".json"

    with open(file_name, "w") as fp:
        json.dump(data, fp)

# Run commit and push shell script to update
os.system(path + "commitAndPush.sh")
print('Updated')