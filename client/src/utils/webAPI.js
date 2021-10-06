const commonData = ['messageboard'];

const awsURL =
  'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/data?';
const firebaseURL = 'https://fantasy-cc6ec-default-rtdb.firebaseio.com/v1/data';

export const fetchFirebase = async ({ queryKey }) => {
  // const leagueId = queryKey[0];
  // const leagueYear = queryKey[1];
  // let fetchURL;
  // if (queryKey[0] === 'messageboard') {
  //   fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/messageboard.json`;
  // } else {
  //   fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/${seasonYear}/${key}.json`;
  // }
  // const res = await fetch(fetchURL);
  // return res.json();
};

export const fetchDynamo = async (leagueKey, setLeagueQueryData) => {
  const [leagueId, leagueYear] = leagueKey;

  const fullURL =
    awsURL +
    new URLSearchParams({
      leagueId: leagueId,
      leagueYear: leagueYear,
    });

  const res = await fetch(fullURL, {
    method: 'GET',
    mode: 'cors',
  });
  const data = await res.json();

  setLeagueQueryData(data)

  return data
};