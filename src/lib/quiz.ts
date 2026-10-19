export type QuizQuestion = {
  id: string
  topic: string
  answer: number
}

export function gradeQuiz(
  questions: QuizQuestion[],
  selected: Record<string, number>,
) {
  const missedTopics = questions
    .filter((question) => selected[question.id] !== question.answer)
    .map((question) => question.topic)
  return {
    score: questions.length - missedTopics.length,
    total: questions.length,
    missedTopics,
  }
}
