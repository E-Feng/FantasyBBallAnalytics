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
  const data = await res.json();
  const values = data.split(":")

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
    team.location = 'Team';
    team.teamName = anonTeams[i][1];
    team.fullTeamName = `${team.location} ${team.teamName}`;
    team.firstName = anonTeams[i][2];
    team.lastName = anonTeams[i][2];
  })
};
