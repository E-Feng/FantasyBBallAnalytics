export const categoryDetails = {
  fgPer: {
    display: 'FG%',
    digits: 4,
  },
  ftPer: {
    display: 'FT%',
    digits: 4,
  },
  threes: {
    display: '3PM',
  },
  rebs: {
    display: 'REB',
  },
  asts: {
    display: 'AST',
  },
  stls: {
    display: 'STL',
  },
  blks: {
    display: 'BLK',
  },
  tos: {
    display: 'TO',
    inverse: true,
  },
  ejs: {
    display: 'EJ',
    inverse: true,
  },
  pts: {
    display: 'PTS',
  },
};

export const determineWinner = (a, b, cat) => {
  const inverse = categoryDetails[cat].inverse ? true : false;

  let isWinner;

  if (inverse) {
    const compareValue = Math.min(b)
    isWinner = a < compareValue;
  } else {
    const compareValue = Math.max(b)
    isWinner = a > compareValue;
  }

  return isWinner;
}