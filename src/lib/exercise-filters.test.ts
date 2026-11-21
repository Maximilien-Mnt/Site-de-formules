import { describe, it, expect } from 'vitest'
import {
  parseExerciseFilters,
  serializeExerciseFilters,
  filterExercises,
  sortExercises,
  type SearchExercise,
} from '@/lib/exercise-filters'

const exercises: SearchExercise[] = [
  { id: 'a', title: 'Aire', statement: 'rectangle', subject: 'math', domain: 'geometry', level: 2, difficulty: 1, kind: 'numeric', estimatedMinutes: 2, url: '/fr/exercices/a/' },
  { id: 'b', title: 'Binomiale', statement: 'loi', subject: 'math', domain: 'probability', level: 5, difficulty: 4, kind: 'qcm', estimatedMinutes: 5, url: '/fr/exercices/b/' },
  { id: 'c', title: 'Cosinus', statement: 'triangle', subject: 'math', domain: 'trigonometry', level: 4, difficulty: 2, kind: 'open', estimatedMinutes: 3, url: '/fr/exercices/c/' },
  { id: 'd', title: 'Dérivée', statement: 'vitesse', subject: 'math', domain: 'calculus', level: 3, difficulty: 3, kind: 'numeric', estimatedMinutes: 4, url: '/fr/exercices/d/' },
]

describe('parseExerciseFilters / serializeExerciseFilters', () => {
  it('parse une recherche simple avec tri', () => {
    const state = parseExerciseFilters(new URLSearchParams('q=aire&sort=levelDesc'))
    expect(state.q).toBe('aire')
    expect(state.sort).toBe('levelDesc')
  })

  it('parse les filtres multi-valeurs et la plage de niveaux', () => {
    const state = parseExerciseFilters(new URLSearchParams('domain=geometry,calculus&level=2-4&kind=numeric,qcm'))
    expect(state.domain).toEqual(['geometry', 'calculus'])
    expect(state.level).toEqual({ min: 2, max: 4 })
    expect(state.kind).toEqual(['numeric', 'qcm'])
  })

  it('ignore les valeurs de type invalide', () => {
    const state = parseExerciseFilters(new URLSearchParams('kind=open,inconnu&sort=truc'))
    expect(state.kind).toEqual(['open'])
    expect(state.sort).toBe('alpha')
  })

  it('est stable par sérialisation (round-trip)', () => {
    const state = parseExerciseFilters(new URLSearchParams('q=cos&level=3-5&kind=numeric&difficulty=2,3'))
    const again = parseExerciseFilters(new URLSearchParams(serializeExerciseFilters(state)))
    expect(again).toEqual(state)
  })
})

describe('filterExercises', () => {
  it('filtre par domaine et niveau', () => {
    const state = parseExerciseFilters(new URLSearchParams('domain=geometry&level=2-4'))
    expect(filterExercises(exercises, state).map((e) => e.id)).toEqual(['a'])
  })

  it('filtre par type et difficulté', () => {
    const state = parseExerciseFilters(new URLSearchParams('kind=numeric&difficulty=1,3'))
    expect(filterExercises(exercises, state).map((e) => e.id)).toEqual(['a', 'd'])
  })

  it('combine tous les filtres', () => {
    const state = parseExerciseFilters(new URLSearchParams('subject=math&domain=calculus&level=3&kind=numeric&difficulty=3'))
    expect(filterExercises(exercises, state).map((e) => e.id)).toEqual(['d'])
  })

  it('ne retourne rien si aucun ne correspond', () => {
    const state = parseExerciseFilters(new URLSearchParams('kind=open&domain=calculus'))
    expect(filterExercises(exercises, state)).toEqual([])
  })

  it('état par défaut : aucun filtre', () => {
    expect(filterExercises(exercises, parseExerciseFilters(new URLSearchParams(''))).length).toBe(4)
  })
})

describe('sortExercises', () => {
  it('tri alphabétique (insensible à la casse)', () => {
    expect(sortExercises([exercises[3], exercises[0], exercises[2], exercises[1]], 'alpha').map((e) => e.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('tri par niveau croissant puis titre', () => {
    const sorted = sortExercises(exercises, 'levelAsc').map((e) => e.id)
    expect(sorted[0]).toBe('a')
  })

  it('tri par difficulté', () => {
    expect(sortExercises(exercises, 'difficulty').map((e) => e.id)).toEqual(['a', 'c', 'd', 'b'])
  })
})