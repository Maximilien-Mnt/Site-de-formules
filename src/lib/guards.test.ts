import { describe, it, expect } from 'vitest'
import {
  validateNumericValue,
  validateQCMQuestion,
  validateOpenExerciseStatement,
  type GuardResult,
  type NumericGuardContext,
} from '@/lib/guards'

describe('validateNumericValue', () => {
  it('valeur dans une plage bornée', () => {
    const result = validateNumericValue(5, { constraints: { range: [1, 10] } })
    expect(result.valid).toBe(true)
  })

  it('valeur hors plage', () => {
    const result = validateNumericValue(15, { constraints: { range: [1, 10] } })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('hors intervalle')
  })

  it('valeur interdite (dénominateur nul)', () => {
    const result = validateNumericValue(0, { constraints: { forbiddenValues: [0] } })
    expect(result.valid).toBe(false)
  })

  it('valeur positive stricte', () => {
    const result = validateNumericValue(-5, { constraints: { positive: true } })
    expect(result.valid).toBe(false)
    expect(result.correctedValue).toBe(5)
  })

  it('valeur non-négative', () => {
    const result = validateNumericValue(-3, { constraints: { nonNegative: true } })
    expect(result.valid).toBe(false)
  })

  it('valeur supérieure à une borne', () => {
    const result = validateNumericValue(10, { constraints: { lessThan: 5 } })
    expect(result.valid).toBe(false)
  })

  it('valeur inférieure à une borne', () => {
    const result = validateNumericValue(2, { constraints: { greaterThan: 5 } })
    expect(result.valid).toBe(false)
  })

  it('avec formule et contraintes de variable', () => {
    const result = validateNumericValue(3, {
      formula: { variables: [{ symbol: 'a' }] },
      constraints: { range: [1, 5] },
    })
    expect(result.valid).toBe(true)
  })
})

describe('validateQCMQuestion', () => {
  it('QCM valide avec une bonne réponse', () => {
    const result = validateQCMQuestion(['a', 'b', 'c'], ['a'])
    expect(result.valid).toBe(true)
  })

  it('QCM invalide - bonne réponse manquante', () => {
    const result = validateQCMQuestion(['a', 'b'], ['c'])
    expect(result.valid).toBe(false)
  })

  it('QCM invalide - doublons dans les choix', () => {
    const result = validateQCMQuestion(['a', 'a', 'c'], ['a'])
    expect(result.valid).toBe(false)
  })

  it('QCM avec contraintes mathématiques', () => {
    const result = validateQCMQuestion(['3', '5', '7'], ['3'], {
      variables: [{ symbol: 'a' }],
      constraints: { forbiddenValues: [0] },
    })
    expect(result.valid).toBe(true)
  })
})

describe('validateOpenExerciseStatement', () => {
  it('énoncé sans problème mathématique', () => {
    const result = validateOpenExerciseStatement(
      'Calcule la valeur de x',
      {}
    )
    expect(result.valid).toBe(true)
  })

  it('racine carrée de nombre négatif', () => {
    const result = validateOpenExerciseStatement(
      'Calculer sqrt(x)',
      { x: -5 }
    )
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Racine carrée')
  })

  it('logarithme d\'argument non positif', () => {
    const result = validateOpenExerciseStatement(
      'Calculer log(x)',
      { x: 0 }
    )
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Logarithme')
  })

  it('division par zéro', () => {
    const result = validateOpenExerciseStatement(
      'Diviser par x',
      { x: 0 }
    )
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Division par zéro')
  })

  it('énoncé valide sans variables problématiques', () => {
    const result = validateOpenExerciseStatement(
      'Calculer 2 + 3',
      {}
    )
    expect(result.valid).toBe(true)
  })
})