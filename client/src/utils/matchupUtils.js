/**
 * Calculates the winner between two inputted objects with category
 * stats.
 * @param {*} home
 * @param {*} away
 */
export const calculateMatchup = (home, away) => {
  // Stat category for matchup
  // key=id, value=higher value is win
  const categories = {
    fgPer: true,
    ftPer: true,
    threes: true,
    asts: true,
    rebs: true,
    stls: true,
    blks: true,
    tos: false,
    ejs: false,
    pts: true,
  };

  let winLoss = 0;

  for (const cat in categories) {
    let result;

    if (home[cat] > away[cat]) {
      result = 1;
    } else if (home[cat] < away[cat]) {
      result = -1;
    } else {
      continue;
    }

    // Reversing tos and ejs
    if (categories[cat]) {
      winLoss = winLoss + result;
    } else {
      winLoss = winLoss - result;
    }
  }

  // Calculating overall win-loss, points is tiebreaker
  if (winLoss > 0) {
    return true;
  } else if (winLoss < 0) {
    return false;
  } else {
    if (home.pts > away.pts) {
      return true;
    } else {
      return false;
    }
  }
};
