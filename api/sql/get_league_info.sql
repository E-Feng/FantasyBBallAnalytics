SELECT
  (NOW() - lastupdated) < INTERVAL '1 day',
  CASE WHEN platform = 'espn' THEN cookieespns2 ELSE yahoorefreshtoken END,
  platform,
  leagueid
FROM leagueids
WHERE leagueid ~ %(league_id_re)s