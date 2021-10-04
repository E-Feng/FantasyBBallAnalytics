export const filterNaN = (arr) => {
  const newArr = [];

  // Filtering out non numbers
  arr.forEach((val) => {
    const float = parseFloat(val);

    if (!isNaN(float)) {
      newArr.push(float);
    }
  });
  return newArr;
};

export const mean = (arr) => {
  const newArr = filterNaN(arr);
  if (newArr.length === 0) return null;

  return newArr.reduce((a, b) => a + b) / newArr.length;
};

export const stdev = (arr) => {
  const newArr = filterNaN(arr);
  if (newArr.length === 0) return null;

  const n = newArr.length;
  const meanVal = mean(newArr);

  return Math.sqrt(
    newArr.map((x) => Math.pow(x - meanVal, 2)).reduce((a, b) => a + b) / n
  );
};
