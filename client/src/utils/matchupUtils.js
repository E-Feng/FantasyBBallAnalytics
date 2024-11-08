export const calculateMatchup = (home, away, cats) => {
  let homeNetWins = 0;

  const scoringCats = cats.filter((cat) => cat.name !== 'mins');

  scoringCats.forEach((cat) => {
    const name = cat.name;
    const inverse = cat.inverse;

    let result = 0;

    if (home[name] > away[name]) {
      result = inverse ? -1 : 1;
    } else if (home[name] < away[name]) {
      result = inverse ? 1 : -1;
    }

    homeNetWins += result;
  });

  // Calculating overall win-loss, points is tiebreaker
  if (homeNetWins > 0) {
    return true;
  } else if (homeNetWins < 0) {
    return false;
  } else {
    if (home.pts > away.pts) {
      return true;
    } else {
      return false;
    }
  }
};
