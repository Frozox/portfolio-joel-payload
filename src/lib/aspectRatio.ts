export const aspectRatioCalculatorFromWidth = (
  width: number,
  height: number,
  newWidth: number,
): number => {
  return (height / width) * newWidth
}

export const aspectRatioCalculatorFromHeight = (
  width: number,
  height: number,
  newHeight: number,
): number => {
  return (width / height) * newHeight
}
