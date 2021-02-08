import { firebaseKey } from './config';

export const fetchFirebase = async ({ queryKey }) => {
  const fetchURL = `https://fantasy-cc6ec-default-rtdb.firebaseio.com/${firebaseKey}/`;

  const res = await fetch(fetchURL + queryKey[0]);
  return res.json();
};