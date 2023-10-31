export const categoryDetails = [
  {
    name: 'fgMade',
    display: 'FGM',
    espnId: 13,
    digits: 0,
  },{
    name: 'fgAtt',
    display: 'FGA',
    espnId: 16,
    digits: 0,
    inverse: true,
  },
  {
    name: 'fgPer',
    display: 'FG%',
    espnId: 19,
    digits: 4,
  },
  {
    name: 'ftMade',
    display: 'FTM',
    espnId: 15,
    digits: 0,
  },
  {
    name: 'ftAtt',
    display: 'FTA',
    espnId: 14,
    digits: 0,
    inverse: true,
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
    name: 'orebs',
    display: 'OREB',
    espnId: 4,
    digits: 0,
  },  
  {
    name: 'drebs',
    display: 'DREB',
    espnId: 5,
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
    name: 'dqs',
    display: 'DQ',
    espnId: 12,
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
    name: 'flags',
    display: 'FF',
    espnId: 8,
    inverse: true,
    digits: 0,
  },
  {
    name: 'pfs',
    display: 'PF',
    espnId: 9,
    inverse: true,
    digits: 0,
  },
  {
    name: 'techs',
    display: 'TF',
    espnId: 10,
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
    name: 'fpts',
    display: 'FPTS',
    espnId: -1,
    digits: 0,
  },
  {
    name: 'all',
    display: 'ALL',
    espnId: -2,
    digits: 0,
  }
];

export const getCatInverse = (cat) => {
  return categoryDetails.filter((o) => o.name === cat)[0].inverse;
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

export const checkLeagueHasEjections = (categoryIds) => {
  const ejectionId = categoryDetails.filter(o => o.name === 'ejs')[0].espnId;

  return categoryIds.includes(ejectionId)
}