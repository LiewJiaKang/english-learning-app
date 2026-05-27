export function getTipOfTheDay(tips: string[]): string {
  const today = new Date()
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % tips.length
  }
  return tips[Math.abs(hash)]
}
