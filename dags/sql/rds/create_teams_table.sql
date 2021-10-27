CREATE TABLE IF NOT EXISTS Teams (
  LeagueId VARCHAR(20),
  LeagueYear VARCHAR(4),
  TeamName VARCHAR(255),
  TeamId INTEGER,
  FullTeamName VARCHAR(255),
  FirstName VARCHAR(255),
  LastName VARCHAR(255),
  Location VARCHAR(255), 
  Abbrev VARCHAR(255),
  Seed INTEGER,
  Wins INTEGER,
  Losses INTEGER
)