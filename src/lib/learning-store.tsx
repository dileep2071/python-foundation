import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LearningContext } from './learning-context'

const STORAGE_KEY = 'python-foundation-learning-v1'

export type Profile = {
  name: string
  experience: string
  goal: string
  dailyGoal: number
}

export type Activity = {
  type: 'lesson_started' | 'lesson_completed' | 'project_completed' | 'quiz_submitted' | 'exercise_run' | 'snippet_saved'
  itemId: string
  at: string
}

export type QuizAttempt = {
  score: number
  total: number
  at: string
  missedTopics: string[]
}

export type SavedSnippet = {
  id: string
  title: string
  code: string
  savedAt: string
}

export type LearningState = {
  profile: Profile | null
  completedLessons: string[]
  completedProjects: string[]
  bookmarks: string[]
  notes: Record<string, string>
  attempts: QuizAttempt[]
  activities: Activity[]
  snippets: SavedSnippet[]
  theme: 'light' | 'dark'
}

const initialState: LearningState = {
  profile: null,
  completedLessons: [],
  completedProjects: [],
  bookmarks: [],
  notes: {},
  attempts: [],
  activities: [],
  snippets: [],
  theme: 'light',
}

function loadLearningState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return {
      state: stored ? parseStoredState(stored) : initialState,
      error: null,
      persistenceEnabled: true,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown browser storage error.'
    return {
      state: initialState,
      error: `Saved progress could not be loaded (${detail}). It has not been overwritten.`,
      persistenceEnabled: false,
    }
  }
}

function createActivity(type: Activity['type'], itemId: string, at = new Date().toISOString()): Activity {
  return { type, itemId, at }
}

export type LearningContextValue = {
  state: LearningState
  storageError: string | null
  saveProfile: (profile: Profile) => void
  markLessonComplete: (lessonId: string) => void
  markProjectComplete: (projectId: string) => void
  toggleBookmark: (lessonId: string) => void
  saveNote: (lessonId: string, note: string) => void
  saveAttempt: (attempt: QuizAttempt) => void
  saveSnippet: (snippet: Omit<SavedSnippet, 'id' | 'savedAt'>) => void
  recordActivity: (type: Activity['type'], itemId: string) => void
  setTheme: (theme: LearningState['theme']) => void
  setDailyGoal: (minutes: number) => void
  clearProgress: () => void
  clearProfile: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuizAttempt(value: unknown): value is QuizAttempt {
  return (
    isRecord(value) &&
    typeof value.score === 'number' &&
    typeof value.total === 'number' &&
    value.total > 0 &&
    value.score >= 0 &&
    value.score <= value.total &&
    typeof value.at === 'string' &&
    Array.isArray(value.missedTopics) &&
    value.missedTopics.every((topic) => typeof topic === 'string')
  )
}

function isActivity(value: unknown): value is Activity {
  return (
    isRecord(value) &&
    ['lesson_started', 'lesson_completed', 'project_completed', 'quiz_submitted', 'exercise_run', 'snippet_saved'].includes(
      String(value.type),
    ) &&
    typeof value.itemId === 'string' &&
    typeof value.at === 'string'
  )
}

function isSavedSnippet(value: unknown): value is SavedSnippet {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.code === 'string' &&
    typeof value.savedAt === 'string'
  )
}

function parseStoredState(raw: string): LearningState {
  const parsed: unknown = JSON.parse(raw)
  if (!isRecord(parsed)) {
    throw new TypeError('Saved learning data is not a valid object.')
  }

  const profileValue = parsed.profile
  const profile =
    isRecord(profileValue) &&
    typeof profileValue.name === 'string' &&
    typeof profileValue.experience === 'string' &&
    typeof profileValue.goal === 'string' &&
    typeof profileValue.dailyGoal === 'number'
      ? {
          name: profileValue.name,
          experience: profileValue.experience,
          goal: profileValue.goal,
          dailyGoal: profileValue.dailyGoal,
        }
      : null

  return {
    ...initialState,
    profile,
    completedLessons: Array.isArray(parsed.completedLessons)
      ? parsed.completedLessons.filter((value): value is string => typeof value === 'string')
      : [],
    completedProjects: Array.isArray(parsed.completedProjects)
      ? parsed.completedProjects.filter((value): value is string => typeof value === 'string')
      : [],
    bookmarks: Array.isArray(parsed.bookmarks)
      ? parsed.bookmarks.filter((value): value is string => typeof value === 'string')
      : [],
    notes: isRecord(parsed.notes)
      ? Object.fromEntries(
          Object.entries(parsed.notes).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        )
      : {},
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts.filter(isQuizAttempt) : [],
    activities: Array.isArray(parsed.activities) ? parsed.activities.filter(isActivity) : [],
    snippets: Array.isArray(parsed.snippets) ? parsed.snippets.filter(isSavedSnippet) : [],
    theme: parsed.theme === 'dark' ? 'dark' : 'light',
  }
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadLearningState)
  const [state, setState] = useState<LearningState>(loaded.state)
  const [storageError, setStorageError] = useState<string | null>(loaded.error)
  const [persistenceEnabled, setPersistenceEnabled] = useState(loaded.persistenceEnabled)

  useEffect(() => {
    if (!persistenceEnabled) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown browser storage error.'
      // Browser storage is an external system; make write failures visible in the app.
      // oxlint-disable-next-line react/set-state-in-effect
      setStorageError(`Progress could not be saved (${detail}). Check this browser's storage settings.`)
    }
  }, [persistenceEnabled, state])

  const recordActivity = useCallback((type: Activity['type'], itemId: string) => {
    setState((previous) => ({
      ...previous,
      activities: [createActivity(type, itemId), ...previous.activities].slice(0, 500),
    }))
  }, [])

  const value = useMemo<LearningContextValue>(
    () => ({
      state,
      storageError,
      saveProfile: (profile) => {
        setState((previous) => ({ ...previous, profile }))
      },
      markLessonComplete: (lessonId) => {
        setState((previous) => ({
          ...previous,
          completedLessons: previous.completedLessons.includes(lessonId)
            ? previous.completedLessons
            : [...previous.completedLessons, lessonId],
          activities: [
            createActivity('lesson_completed', lessonId),
            ...previous.activities,
          ].slice(0, 500),
        }))
      },
      markProjectComplete: (projectId) => {
        setState((previous) => ({
          ...previous,
          completedProjects: previous.completedProjects.includes(projectId)
            ? previous.completedProjects
            : [...previous.completedProjects, projectId],
          activities: [
            createActivity('project_completed', projectId),
            ...previous.activities,
          ].slice(0, 500),
        }))
      },
      toggleBookmark: (lessonId) => {
        setState((previous) => ({
          ...previous,
          bookmarks: previous.bookmarks.includes(lessonId)
            ? previous.bookmarks.filter((item) => item !== lessonId)
            : [...previous.bookmarks, lessonId],
        }))
      },
      saveNote: (lessonId, note) => {
        setState((previous) => ({
          ...previous,
          notes: { ...previous.notes, [lessonId]: note },
        }))
      },
      saveAttempt: (attempt) => {
        setState((previous) => ({
          ...previous,
          attempts: [attempt, ...previous.attempts].slice(0, 100),
          activities: [
            createActivity('quiz_submitted', 'foundation-quiz', attempt.at),
            ...previous.activities,
          ].slice(0, 500),
        }))
      },
      saveSnippet: (snippet) => {
        const savedAt = new Date().toISOString()
        const id = `snippet-${Date.now()}`
        setState((previous) => ({
          ...previous,
          snippets: [{ ...snippet, id, savedAt }, ...previous.snippets].slice(0, 100),
          activities: [createActivity('snippet_saved', id, savedAt), ...previous.activities].slice(0, 500),
        }))
      },
      recordActivity,
      setTheme: (theme) => setState((previous) => ({ ...previous, theme })),
      setDailyGoal: (minutes) => {
        setState((previous) =>
          previous.profile
            ? { ...previous, profile: { ...previous.profile, dailyGoal: minutes } }
            : previous,
        )
      },
      clearProgress: () => {
        setState(initialState)
        setStorageError(null)
        setPersistenceEnabled(true)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'Unknown browser storage error.'
          setStorageError(`Local progress could not be cleared (${detail}).`)
        }
      },
      clearProfile: () => {
        setState((previous) => ({ ...previous, profile: null }))
      },
    }),
    [recordActivity, state, storageError],
  )

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}
