/**
 * Returns a HSL color string for use in CSS with 100% Saturation and
 * 50% Lightness. Start-end of 10-110 for red > yellow > green
 * @param {*} percent
 * @param {*} start
 * @param {*} end
 */
export const getHSLColor = (val, start, end, inverse) => {
  if (val == null) {
    return null;
  }

  const hueA = 10;
  const hueB = 110;

  if (start === end) {
    return `hsl(60, 100%, 50%)`;
  }

  val = Math.min(val, end);
  val = Math.max(val, start);

  let mappedVal = hueA + ((hueB - hueA) / (end - start)) * (val - start);

  if (inverse) {
    mappedVal = hueA + hueB - mappedVal;
  }

  // Return a CSS HSL string
  return `hsl(${mappedVal}, 100%, 50%)`;
};
