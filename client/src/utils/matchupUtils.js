export const calculateMatchup = (home, away, cats) => {
  let homeWins = 0;
  let awayWins = 0;

  const scoringCats = cats.filter((cat) => !cat.isDisplayOnly);

  scoringCats.forEach((cat) => {
    const name = cat.name;
    const inverse = cat.inverse;

    if (home[name] > away[name]) {
      if (inverse) {
        awayWins++;
      } else {
        homeWins++;
      }
    } else if (home[name] < away[name]) {
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
  const matchupResult = calculateMatchup(home, away, cats);

  if (matchupResult.homeWins > matchupResult.awayWins) return true;
  if (matchupResult.awayWins > matchupResult.homeWins) return false;

  // Tie-breaker logic
  return home.pts > away.pts;
};
