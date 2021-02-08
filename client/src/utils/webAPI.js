export const fetchFirebase = async ({ queryKey }) => {
  const key = '39709C01072F7AF9A6A2D7AB20D17734F95296A8';
  const fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/${key}/`;

  const res = await fetch(fetchURL + queryKey[0]);
  return res.json();
};
