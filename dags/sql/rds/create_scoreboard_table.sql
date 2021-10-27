CREATE TABLE IF NOT EXISTS Scoreboard (
  LeagueId VARCHAR(20),
  LeagueYear VARCHAR(4),
  TeamId INTEGER,
  AwayId INTEGER,
  Week INTEGER,
  Won INTEGER,
  FgPer FLOAT8, 
  FtPer FLOAT8,
  Threes INTEGER,
  Rebs INTEGER,
  Asts INTEGER,
  Stls INTEGER,
  Blks INTEGER,
  Tos INTEGER,
  Ejs INTEGER,
  Pts INTEGER
)