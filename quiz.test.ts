import { describe, expect, it } from 'vitest'
import { gradeQuiz } from './quiz'

describe('quiz scoring', () => {
  const questions = [
    { id: 'one', topic: 'Types', answer: 1 },
    { id: 'two', topic: 'Loops', answer: 0 },
  ]

  it('scores only submitted correct answers and returns missed topics', () => {
    expect(gradeQuiz(questions, { one: 1, two: 2 })).toEqual({
      score: 1,
      total: 2,
      missedTopics: ['Loops'],
    })
  })

  it('does not award points for unanswered questions', () => {
    expect(gradeQuiz(questions, { one: 1 })).toEqual({
      score: 1,
      total: 2,
      missedTopics: ['Loops'],
    })
  })
})
