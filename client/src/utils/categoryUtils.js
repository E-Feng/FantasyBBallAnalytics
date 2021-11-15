export const categoryDetails = [
  {
    name: 'fgPer',
    display: 'FG%',
    espnId: 19,
    digits: 4,
  },
  {
    name: 'ftPer',
    display: 'FT%',
    espnId: 20,
    digits: 4,
  },
  {
    name: 'threes',
    display: '3PM',
    espnId: 17,
    digits: 0,
  },
  {
    name: 'rebs',
    display: 'REB',
    espnId: 6,
    digits: 0,
  },
  {
    name: 'asts',
    display: 'AST',
    espnId: 3,
    digits: 0,
  },
  {
    name: 'stls',
    display: 'STL',
    espnId: 2,
    digits: 0,
  },
  {
    name: 'blks',
    display: 'BLK',
    espnId: 1,
    digits: 0,
  },
  {
    name: 'tos',
    display: 'TO',
    espnId: 11,
    inverse: true,
    digits: 0,
  },
  {
    name: 'ejs',
    display: 'EJ',
    espnId: 7,
    inverse: true,
    digits: 0,
  },
  {
    name: 'pts',
    display: 'PTS',
    espnId: 0,
    digits: 0,
  },
  {
    name: 'all',
    display: 'ALL',
    espnId: -1,
    digits: 0,
  }
];

export const getCatInverse = (cat) => {
  return categoryDetails.filter((o) => o.name === cat).inverse
  ? true
  : false;
}

export const determineWinner = (a, b, cat) => {
  const inverse = getCatInverse(cat)

  let isWinner;

  if (inverse) {
    const compareValue = Math.min(b);
    isWinner = a < compareValue;
  } else {
    const compareValue = Math.max(b);
    isWinner = a > compareValue;
  }

  return isWinner;
};
