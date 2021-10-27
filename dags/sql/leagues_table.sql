CREATE TABLE IF NOT EXISTS leagues (
    LeagueId VARCHAR(10) PRIMARY KEY UNIQUE NOT NULL,
    LeagueYear VARCHAR(4),
    LastYear VARCHAR(4),
    LastUpdated TIMESTAMP,
    CookieEspnS2 VARCHAR(255),
    CookieSwid VARCHAR(255)
)

INSERT INTO leagues(league_id, league_year)
VALUES ('976410188', '2021')