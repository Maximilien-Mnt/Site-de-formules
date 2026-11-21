import { describe, it, expect } from 'vitest'
import { getNextExercise } from '@/lib/exercise-next'

const exercises = [
  { id: 'geo-1', domain: 'geometry', level: 1, title: 'Alpha' },
  { id: 'geo-2', domain: 'geometry', level: 2, title: 'Bêta' },
  { id: 'geo-3', domain: 'geometry', level: 2, title: 'Gamma' },
  { id: 'alg-1', domain: 'algebra', level: 2, title: 'Delta' },
  { id: 'alg-2', domain: 'algebra', level: 3, title: 'Epsilon' },
]

describe('getNextExercise', () => {
  it('privilégie le même domaine ET le même niveau', () => {
    const next = getNextExercise(exercises, 'geo-2')
    expect(next?.id).toBe('geo-3')
  })

  it('choisit le premier candidat dans un ordre stable (titre)', () => {
    const next = getNextExercise(exercises, 'geo-3')
    // geo-3 est le seul du domaine+niveau 2 restant… on tombe donc sur le
    // repli « même domaine » et on refuse d'être l'exercice courant.
    expect(next?.id).not.toBe('geo-3')
  })

  it('s’appuie sur le même domaine si aucun même niveau', () => {
    const next = getNextExercise([...exercises.filter((e) => e.domain !== 'algebra'), { id: 'geo-9', domain: 'geometry', level: 9, title: 'Oméga' }], 'geo-9')
    // geo-9 : aucun même niveau ni même domaine+niveau → même domaine (géométrie).
    expect(next?.domain).toBe('geometry')
  })

  it('s’appuie sur le même niveau si aucun même domaine', () => {
    const singleDomain = exercises.filter((e) => e.domain === 'algebra')
    const next = getNextExercise(singleDomain, 'alg-1')
    // alg-1 : aucun autre domaine algèbre de niveau 2 → même domaine algèbre (alg-2).
    expect(next?.id).toBe('alg-2')
  })

  it('ne renvoie jamais l’exercice courant', () => {
    const next = getNextExercise([exercises[1]], 'geo-2')
    expect(next).toBeUndefined()
  })

  it('renvoie undefined pour un identifiant inconnu', () => {
    expect(getNextExercise(exercises, 'introuvable')).toBeUndefined()
  })

  it('renvoie undefined quand il n’y a aucun candidat', () => {
    expect(getNextExercise([exercises[0]], 'geo-1')).toBeUndefined()
  })

  it('tri stabilise par niveau puis titre (locale fr)', () => {
    const pool = [
      { id: 'x', domain: 'geometry', level: 1, title: 'Zulu' },
      { id: 'y', domain: 'geometry', level: 1, title: 'Alpha' },
      { id: 'cur', domain: 'geometry', level: 1, title: 'Courant' },
    ]
    expect(getNextExercise(pool, 'cur')?.id).toBe('y')
  })
})