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

export const getPercentageRange = (data, percent) => {
  const sortedData = filterNaN(data).sort((a, b) => a - b);

  const minIndex = Math.floor(sortedData.length * percent);
  const maxIndex = Math.ceil(sortedData.length * (1 - percent)) - 1;

  return [sortedData[minIndex], sortedData[maxIndex]];
};

export const getStdRange = (data, nStd) => {
  const meanVal = mean(data)
  const stdVal = stdev(data)

  return [meanVal - nStd*stdVal, meanVal + nStd*stdVal];
}

export const getWinProbability = (mean1, stdev1, mean2, stdev2) => {
  // Generated from ChatGPT (no knowledge on this)
  const meanDifference = mean1 - mean2;
  const pooledStdev = Math.sqrt((stdev1 ** 2 + stdev2 ** 2) / 2);

  const zScore = meanDifference / pooledStdev;

  const probability = 0.5 * (1 + Math.sign(zScore) * (1 - Math.exp(-2 * zScore * zScore / Math.PI)));

  return probability;
}