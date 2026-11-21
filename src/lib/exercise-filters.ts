// Filtres, tris et recherche du catalogue d'exercices.
// Même logique que le catalogue de formules (lib/filters.ts) : état dans
// l'URL, logique pure testable, aucun DOM.
import { parseLevelRange, type LevelRange, type Sort } from './filters'

export type ExerciseKind = 'numeric' | 'qcm' | 'open'

export interface SearchExercise {
  id: string
  title: string
  statement: string
  subject: string
  domain: string
  level: number
  difficulty: number
  kind: ExerciseKind
  estimatedMinutes: number
  url: string
}

export interface ExerciseFilterState {
  q: string
  subject: string[]
  domain: string[]
  level: LevelRange | null
  difficulty: number[]
  kind: ExerciseKind[]
  sort: Sort
}

export const EXERCISE_KINDS: readonly ExerciseKind[] = ['numeric', 'qcm', 'open']

export const defaultExerciseState: ExerciseFilterState = {
  q: '',
  subject: [],
  domain: [],
  level: null,
  difficulty: [],
  kind: [],
  sort: 'alpha',
}

const VALID_SORTS: Sort[] = ['alpha', 'levelAsc', 'levelDesc', 'difficulty']

export function parseExerciseFilters(searchParams: URLSearchParams): ExerciseFilterState {
  const state: ExerciseFilterState = { ...defaultExerciseState, kind: [], difficulty: [], subject: [], domain: [] }

  state.q = searchParams.get('q') ?? ''

  const subject = searchParams.get('subject')
  state.subject = subject ? subject.split(',').filter(Boolean) : []

  const domain = searchParams.get('domain')
  state.domain = domain ? domain.split(',').filter(Boolean) : []

  state.level = parseLevelRange(searchParams.get('level'))

  const difficulty = searchParams.get('difficulty')
  state.difficulty = difficulty ? difficulty.split(',').map(Number).filter((n) => Number.isFinite(n)) : []

  const kind = searchParams.get('kind')
  state.kind = kind
    ? (kind.split(',').filter((k) => EXERCISE_KINDS.includes(k as ExerciseKind)) as ExerciseKind[])
    : []

  const sort = searchParams.get('sort')
  state.sort = VALID_SORTS.includes(sort as Sort) ? (sort as Sort) : 'alpha'

  return state
}

export function serializeExerciseFilters(state: ExerciseFilterState): string {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.subject.length) params.set('subject', state.subject.join(','))
  if (state.domain.length) params.set('domain', state.domain.join(','))
  if (state.level && !(state.level.min === 1 && state.level.max === 7)) {
    params.set(
      'level',
      state.level.min === state.level.max ? String(state.level.min) : `${state.level.min}-${state.level.max}`,
    )
  }
  if (state.difficulty.length) params.set('difficulty', state.difficulty.join(','))
  if (state.kind.length) params.set('kind', state.kind.join(','))
  if (state.sort !== 'alpha') params.set('sort', state.sort)
  return params.toString()
}

export function filterExercises(exercises: readonly SearchExercise[], state: ExerciseFilterState): SearchExercise[] {
  return exercises.filter((e) => {
    if (state.subject.length && !state.subject.includes(e.subject)) return false
    if (state.domain.length && !state.domain.includes(e.domain)) return false
    if (state.level && (e.level < state.level.min || e.level > state.level.max)) return false
    if (state.difficulty.length && !state.difficulty.includes(e.difficulty)) return false
    if (state.kind.length && !state.kind.includes(e.kind)) return false
    return true
  })
}

export function sortExercises(exercises: readonly SearchExercise[], sort: Sort): SearchExercise[] {
  const out = [...exercises]
  switch (sort) {
    case 'alpha':
      out.sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
      break
    case 'levelAsc':
      out.sort((a, b) => a.level - b.level || a.title.localeCompare(b.title, 'fr'))
      break
    case 'levelDesc':
      out.sort((a, b) => b.level - a.level || a.title.localeCompare(b.title, 'fr'))
      break
    case 'difficulty':
      out.sort((a, b) => a.difficulty - b.difficulty || a.level - b.level || a.title.localeCompare(b.title, 'fr'))
      break
  }
  return out
}