import { describe, expect, it } from 'vitest'
import { completionPercentage, currentStreak, getActivityDays } from './analytics'

describe('learning analytics', () => {
  it('calculates completion without exceeding one hundred percent', () => {
    expect(completionPercentage(2, 4)).toBe(50)
    expect(completionPercentage(8, 4)).toBe(100)
    expect(completionPercentage(2, 0)).toBe(0)
  })

  it('counts actual activity events in the last seven calendar days', () => {
    const today = new Date(2026, 9, 19, 12)
    const activities = [
      { at: new Date(2026, 9, 19, 9).toISOString() },
      { at: new Date(2026, 9, 19, 10).toISOString() },
      { at: new Date(2026, 9, 18, 10).toISOString() },
    ]
    const week = getActivityDays(activities, today)
    expect(week).toHaveLength(7)
    expect(week.at(-1)?.total).toBe(2)
    expect(week.at(-2)?.total).toBe(1)
  })

  it('counts a consecutive streak and allows yesterday as the last active day', () => {
    const today = new Date(2026, 9, 19, 12)
    const activities = [
      { at: new Date(2026, 9, 18, 10).toISOString() },
      { at: new Date(2026, 9, 17, 10).toISOString() },
    ]
    expect(currentStreak(activities, today)).toBe(2)
    expect(currentStreak([], today)).toBe(0)
  })
})
