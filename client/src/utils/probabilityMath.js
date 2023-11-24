import { erf } from 'mathjs';

import { mean, stdev } from './arrayMath';

export const getCatWinProbability = (dataA, dataB, inverse) => {
  // Generated from ChatGPT (no knowledge on this)
  const meanA = mean(dataA);
  const stdDevA = stdev(dataA);
  const meanB = mean(dataB);
  const stdDevB = stdev(dataB);

  if (meanA === null || meanB === null) {
    return 0.5;
  } else if (stdDevA === 0 && stdDevB === 0) {
    if (meanA === meanB) {
      return 0.5;
    } else if (meanA > meanB) {
      return 1.0;
    } else {
      return 0;
    }
  }

  const zScore = (meanA - meanB) / Math.sqrt(stdDevA ** 2 + stdDevB ** 2);
  const probability = 0.5 * (1 + erf(zScore / Math.sqrt(2)));

  const fixedProb = Math.min(Math.max(probability, 0.01), 0.99);
  const finalProb = inverse ? 1 - fixedProb : fixedProb;

  return finalProb;
};

export function getMatchupWinProbability(numWin, probabilities) {
  // Montecarlo simulation, true probability too complicated
  const n = 10000;
  let nWins = 0;

  const isLessThanOne = mean(probabilities) < 1;

  for (let i = 0; i < n; i++) {
    let catWins = 0;

    probabilities.forEach((p) => {
      const p1 = isLessThanOne ? p : p / 100;

      const r = Math.random();
      catWins += r < p1 ? 1 : 0;
    });

    nWins += catWins >= numWin ? 1 : 0;
  }
  const probability = nWins / n;
  const realisticProb = Math.min(Math.max(probability, 0.01), 0.99);

  return realisticProb;
}
