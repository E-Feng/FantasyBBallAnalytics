export const calculateMatchup = (home, away, cats) => {
  let homeWins = 0;
  let awayWins = 0;

  if (!home || !away) {
    return {
      homeWins,
      awayWins,
    };
  }

  const scoringCats = cats.filter((cat) => !cat.isDisplayOnly);

  scoringCats.forEach((cat) => {
    const name = cat.name;
    const inverse = cat.inverse;
    const homeVal = home[name];
    const awayVal = away[name];

    if (typeof homeVal !== 'number' || typeof awayVal !== 'number') {
      return;
    }

    if (homeVal > awayVal) {
      if (inverse) {
        awayWins++;
      } else {
        homeWins++;
      }
    } else if (homeVal < awayVal) {
      if (inverse) {
        homeWins++;
      } else {
        awayWins++;
      }
    }
  });

  return {
    homeWins,
    awayWins,
  };
};

export const isHomeTeamWinner = (home, away, cats) => {
  if (!home || !away) return false;

  const matchupResult = calculateMatchup(home, away, cats);

  if (matchupResult.homeWins > matchupResult.awayWins) return true;
  if (matchupResult.awayWins > matchupResult.homeWins) return false;

  // Tie-breaker logic
  return (home.pts || 0) > (away.pts || 0);
};
