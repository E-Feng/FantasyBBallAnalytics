export const mean = arr => {
  if (arr.length === 0) return null

  const newArr = []

  // Filtering out non numbers
  arr.forEach(val => {
    const float = parseFloat(val)

    if (!isNaN(float)) {
      newArr.push(float)
    }
  })

  if (newArr.length === 0) return null

  return newArr.reduce((a, b) => a + b) / newArr.length;
}