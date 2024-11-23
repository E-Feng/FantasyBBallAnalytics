const awsURL = 'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/';
const firebaseURL = 'https://fantasy-cc6ec-default-rtdb.firebaseio.com/v1/';

export const fetchFirebase = async ({ queryKey }) => {
  const leagueYear = queryKey[0];

  let fetchURL;
  if (queryKey.includes('common')) {
    fetchURL = firebaseURL + `${leagueYear}/common.json`;
  } else {
    fetchURL = firebaseURL + `${leagueYear}/sample.json`;
  }

  const res = await fetch(fetchURL);
  const data = res.json();

  return data;
};

export const fetchDynamo = async ({ queryKey }) => {
  console.log('Fetching from dynamo with key: ', queryKey);
  const [leagueId, leagueYear] = queryKey;

  const fullURL =
    awsURL +
    'data?' +
    new URLSearchParams({
      leagueId: leagueId,
      leagueYear: leagueYear,
    });

  const res = await fetch(fullURL, {
    method: 'GET',
    mode: 'cors',
  });
  const data = await res.json();

  if (leagueId === '00000001') {
    anonymizeTeams(data);
  }

  return data;
};

export const requestLeagueId = async (payload) => {
  const fullURL = awsURL + 'leagues?' + new URLSearchParams(payload);

  const res = await fetch(fullURL, {
    method: 'GET',
  });

  if (res.status !== 200) {
    return ["SERVER_ERROR"]
  }

  const data = await res.json();
  const values = data.split(":");

  if (data.includes(".l.")) {
    // Temp mapping
    const yearMap = {
      353: 2016,
      364: 2017,
      375: 2018,
      385: 2019,
      395: 2020,
      402: 2021,
      410: 2022,
      418: 2023,
      428: 2024,
      454: 2025
    }
    const prefix = values[1].split(".l.")[0]
    values.push(yearMap[prefix]) 
  }

  return values;
};

const anonymizeTeams = (data) => {
  const anonTeams = [
    ['AAAA', 'One', 'Albert'],
    ['BBBB', 'Two', 'Beth'],
    ['CCCC', 'Three', 'Charlie'],
    ['DDDD', 'Four', 'Delilah'],
    ['EEEE', 'Five', 'Evan'],
    ['FFFF', 'Six', 'Faith'],
    ['GGGG', 'Seven', 'Greg'],
    ['HHHH', 'Eight', 'Hailey'],
    ['IIII', 'Nine', 'Ian'],
    ['JJJJ', 'Ten', 'Jennifer'],
    ['KKKK', 'Eleven', 'Kevin'],
    ['LLLL', 'Twelve', 'Layla'],
    ['MMMM', 'Thirteen', 'Mike'],
    ['NNNN', 'Fourteen', 'Nina'],
  ];
  
  data.teams.forEach((team, i) => {
    team.abbrev = anonTeams[i][0];
    team.fullTeamName = `Team ${anonTeams[i][1]}`;
    team.firstName = anonTeams[i][2];
    team.lastName = anonTeams[i][2];
  })
};