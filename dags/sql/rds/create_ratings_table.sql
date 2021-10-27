CREATE TABLE IF NOT EXISTS Ratings (
  PlayerId VARCHAR(255),
  PlayerName VARCHAR(255),
  RatingSeason FLOAT8,
  RatingLast7 FLOAT8,
  RatingLast15 FLOAT8,
  RatingLast30 FLOAT8,
  RankingSeason INTEGER,
  RankingLast7 INTEGER,
  RankingLast15 INTEGER,
  RankingLast30 INTEGER,
  RatingNoEjsSeason FLOAT8
)