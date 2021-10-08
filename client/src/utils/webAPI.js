const awsURL =
  'https://p5v5a0pnfi.execute-api.us-east-1.amazonaws.com/v1/data?';
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
  const data = res.json()

  console.log(data)

  return data;
};

export const fetchDynamo = async ({ queryKey }) => {
  console.log("Fetching from dynamo with key: ", queryKey);
  const [leagueId, leagueYear] = queryKey;

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

  return data;
};
