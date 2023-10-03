WITH joinedleagueids AS (
  SELECT
    (NOW() - lastupdated) < INTERVAL '1 day',
    CASE WHEN platform = 'espn' THEN cookieespns2 ELSE yahoorefreshtoken END,
    platform,
    COALESCE(l2.linkedid, l1.leagueid) as leagueid
  FROM leagueids l1
  LEFT JOIN linkedids l2 ON l1.leagueid=l2.mainid
)
SELECT *
FROM joinedleagueids
WHERE leagueid ~ %(league_id_re)s