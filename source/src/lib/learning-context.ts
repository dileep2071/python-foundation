import { createContext, useContext } from 'react'
import type { LearningContextValue } from './learning-store'

// This module intentionally exports the context hook alongside the context object.
// oxlint-disable react/only-export-components
export const LearningContext = createContext<LearningContextValue | null>(null)

export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) throw new Error('useLearning must be used inside LearningProvider.')
  return context
}
