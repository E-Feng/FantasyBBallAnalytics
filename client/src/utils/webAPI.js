export const fetchFirebase = async ({ queryKey }) => {
  const seasonYear = queryKey[0];
  const key = queryKey[1];

  let fetchURL;
  if (queryKey[0] === 'messageboard') {
    fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/messageboard.json`;
  } else {
    fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/data/${seasonYear}/${key}.json`;
  }

  const res = await fetch(fetchURL);
  return res.json();
};