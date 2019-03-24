const supportedIntervals = []
for (var i = 0; i < 7; i++) {
  const multiplier = Math.pow(10, i)
  supportedIntervals.push(1 * multiplier)
  supportedIntervals.push(2 * multiplier)
  //supportedIntervals.push(3 * multiplier)
  supportedIntervals.push(5 * multiplier)
}

export function getCountInterval(maxY) {
  return supportedIntervals.filter(i => maxY / i < 7)[0]
}
