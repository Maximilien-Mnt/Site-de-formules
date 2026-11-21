export type Sort = 'alpha' | 'levelAsc' | 'levelDesc' | 'difficulty' | 'oldest'

export type LevelRange = { min: number; max: number }

export interface FilterState {
  q: string
  subject: string[]
  domain: string[]
  level: LevelRange | null
  difficulty: number[]
  hasGraph: boolean
  hasProof: boolean
  hasHistory: boolean
  hasExercises: boolean
  progress: boolean
  sort: Sort
}

export interface SearchFormula {
  id: string
  title: string
  summary: string
  keywords: string[]
  aliases: string[]
  subject: string
  domain: string
  level: number
  difficulty: number
  topics: string[]
  latex: string
  originYear?: number
  graph: boolean
  hasProof: boolean
  hasHistory: boolean
  hasExercises: boolean
  url: string
}

const defaultState: FilterState = {
  q: '',
  subject: [],
  domain: [],
  level: null,
  difficulty: [],
  hasGraph: false,
  hasProof: false,
  hasHistory: false,
  hasExercises: false,
  progress: false,
  sort: 'alpha',
}

const VALID_SORTS: Sort[] = ['alpha', 'levelAsc', 'levelDesc', 'difficulty', 'oldest']
const FULL_LEVEL_RANGE: LevelRange = { min: 1, max: 7 }

export function parseLevelRange(value: string | null): LevelRange | null {
  if (!value) return null
  const parts = value.split(',')
  let min: number
  let max: number
  if (parts.length === 2) {
    // Forme héritée « min,max » ou plage explicite « min-max » avec virgule
    min = Number(parts[0])
    max = Number(parts[1])
  } else {
    const dash = value.split('-')
    if (dash.length === 2) {
      min = Number(dash[0])
      max = Number(dash[1])
    } else {
      min = Number(value)
      max = Number(value)
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  min = Math.max(1, Math.min(7, min))
  max = Math.max(1, Math.min(7, max))
  if (min > max) return null
  return { min, max }
}

export function parseFilters(searchParams: URLSearchParams): FilterState {
  const state: FilterState = { ...defaultState }

  state.q = searchParams.get('q') ?? ''

  const subject = searchParams.get('subject')
  state.subject = subject ? subject.split(',').filter(Boolean) : []

  const domain = searchParams.get('domain')
  state.domain = domain ? domain.split(',').filter(Boolean) : []

  state.level = parseLevelRange(searchParams.get('level'))

  const difficulty = searchParams.get('difficulty')
  state.difficulty = difficulty ? difficulty.split(',').map(Number).filter((n) => Number.isFinite(n)) : []

  state.hasGraph = searchParams.get('graph') === '1'
  state.hasProof = searchParams.get('proof') === '1'
  state.hasHistory = searchParams.get('history') === '1'
  state.hasExercises = searchParams.get('exercises') === '1'
  state.progress = searchParams.get('progress') === '1'

  const sort = searchParams.get('sort')
  state.sort = VALID_SORTS.includes(sort as Sort) ? (sort as Sort) : 'alpha'

  return state
}

export function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.subject.length) params.set('subject', state.subject.join(','))
  if (state.domain.length) params.set('domain', state.domain.join(','))
  if (state.level && !(state.level.min === FULL_LEVEL_RANGE.min && state.level.max === FULL_LEVEL_RANGE.max)) {
    params.set(
      'level',
      state.level.min === state.level.max ? String(state.level.min) : `${state.level.min}-${state.level.max}`,
    )
  }
  if (state.difficulty.length) params.set('difficulty', state.difficulty.join(','))
  if (state.hasGraph) params.set('graph', '1')
  if (state.hasProof) params.set('proof', '1')
  if (state.hasHistory) params.set('history', '1')
  if (state.hasExercises) params.set('exercises', '1')
  if (state.progress) params.set('progress', '1')
  if (state.sort !== 'alpha') params.set('sort', state.sort)
  return params.toString()
}

export function filterFormulas(formulas: SearchFormula[], state: FilterState): SearchFormula[] {
  return formulas.filter((f) => {
    if (state.subject.length && !state.subject.includes(f.subject)) return false
    if (state.domain.length && !state.domain.includes(f.domain)) return false
    if (state.level && (f.level < state.level.min || f.level > state.level.max)) return false
    if (state.difficulty.length && !state.difficulty.includes(f.difficulty)) return false
    if (state.hasGraph && !f.graph) return false
    if (state.hasProof && !f.hasProof) return false
    if (state.hasHistory && !f.hasHistory) return false
    if (state.hasExercises && !f.hasExercises) return false
    // Le filtre « progression » nécessite le store de progression (lot P10) :
    // tant qu'il n'existe pas, le contrôle est masqué et ne filtre rien.
    return true
  })
}

export function sortFormulas(formulas: SearchFormula[], sort: Sort): SearchFormula[] {
  const out = [...formulas]
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
    case 'oldest':
      out.sort((a, b) => {
        const ay = a.originYear ?? Infinity
        const by = b.originYear ?? Infinity
        return ay - by || a.title.localeCompare(b.title, 'fr')
      })
      break
  }
  return out
}

export { defaultState, FULL_LEVEL_RANGE }