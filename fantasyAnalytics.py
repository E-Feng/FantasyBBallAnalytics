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
schedule_away = pd.read_sql_table("schedules", engine)
scoreboard = pd.read_sql_table("scoreboard", engine)

num_teams = teams.shape[0]

# Creating dataframe for home teams and concatenating
schedule_home = schedule_away.copy()
schedule_home = schedule_home.rename(columns={"away_id":"home_id", "home_id":"away_id", "away_team":"home_team", "home_team":"away_team"})

schedule = schedule_away.append(schedule_home, sort=False).sort_values("id")

