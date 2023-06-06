INSERT INTO leagueids(
    leagueid, created, lastupdated, lastviewed, platform, viewcount, active, allyears, cookieespns2)
VALUES (%(league_id)s, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, %(platform)s, 0, TRUE, %(all_years)s, %(cookie_espn)s)
ON CONFLICT (leagueid, platform) DO UPDATE SET
    lastupdated = NOW(), 
    viewCount = leagueids.viewCount + 1,
    allyears = EXCLUDED.allyears,
    cookieespns2 = EXCLUDED.cookieespns2