export type ActivityDate = { at: string }

export type ActivityDay = {
  key: string
  day: string
  total: number
}

export function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getActivityDays(activities: ActivityDate[], today = new Date()): ActivityDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = dateKey(date)
    const total = activities.filter((item) => dateKey(new Date(item.at)) === key).length
    return { key, day: date.toLocaleDateString('en-US', { weekday: 'short' }), total }
  })
}

export function currentStreak(activities: ActivityDate[], today = new Date()) {
  const activeDays = new Set(activities.map((item) => dateKey(new Date(item.at))))
  let streak = 0
  for (let offset = 0; offset < 366; offset += 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - offset)
    if (!activeDays.has(dateKey(day))) {
      if (offset === 0) continue
      break
    }
    streak += 1
  }
  return streak
}

export function completionPercentage(completed: number, total: number) {
  if (total <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, completed / total)) * 100)
}
