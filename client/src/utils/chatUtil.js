export const hasProfanity = async (msg) => {
  const url = 'https://www.purgomalum.com/service/json';

  const fullUrl = `${url}?${new URLSearchParams({ text: msg })}`;

  const res = await fetch(fullUrl, { method: 'GET' });
  const data = await res.json();

  const filteredMsg = data.result;

  if (msg !== filteredMsg) {
    return true;
  }

  return false;
};
