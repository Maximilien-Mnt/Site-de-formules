import { describe, it, expect } from 'vitest'
import {
  parseNumericInput,
  checkNumeric,
  checkQcm,
  type NumericAnswer,
} from '@/lib/exercise-check'

describe('parseNumericInput — décimaux (virgule française, point, signes)', () => {
  it('accepte un entier, « 0 » et « 42 »', () => {
    expect(parseNumericInput('0').ok).toBe(true)
    expect((parseNumericInput('42') as { value: number }).value).toBe(42)
  })

  it('accepte la virgule décimale « 3,14 »', () => {
    const r = parseNumericInput('3,14')
    expect(r.ok).toBe(true)
    expect((r as { value: number }).value).toBeCloseTo(3.14, 10)
  })

  it('accepte le point décimal « 3.14 »', () => {
    expect((parseNumericInput('3.14') as { value: number }).value).toBeCloseTo(3.14, 10)
  })

  it('accepte la virgule terminale « 3, »', () => {
    expect((parseNumericInput('3,') as { value: number }).value).toBe(3)
  })

  it('accepte la virgule initiale « ,5 »', () => {
    expect((parseNumericInput(',5') as { value: number }).value).toBe(0.5)
  })

  it('accepte le signe moins typographique « −2,5 » (U+2212)', () => {
    expect((parseNumericInput('−2,5') as { value: number }).value).toBe(-2.5)
  })

  it('accepte le signe plus explicite « +4 »', () => {
    expect((parseNumericInput('+4') as { value: number }).value).toBe(4)
  })

  it('retire les espaces de début et de fin', () => {
    expect((parseNumericInput('  42  ') as { value: number }).value).toBe(42)
  })
})

describe('parseNumericInput — groupes de milliers par espace', () => {
  it('accepte « 1 000 »', () => {
    expect((parseNumericInput('1 000') as { value: number }).value).toBe(1000)
  })

  it('accepte « 1 000,5 »', () => {
    expect((parseNumericInput('1 000,5') as { value: number }).value).toBe(1000.5)
  })

  it('accepte « 12 345 »', () => {
    expect((parseNumericInput('12 345') as { value: number }).value).toBe(12345)
  })

  it('accepte les espaces fine et insécable (U+202F, U+00A0)', () => {
    expect((parseNumericInput('1\u202f000') as { value: number }).value).toBe(1000)
    expect((parseNumericInput('1\u00a0000') as { value: number }).value).toBe(1000)
  })

  it('rejette « 1 2 » (groupement invalide)', () => {
    expect(parseNumericInput('1 2').ok).toBe(false)
  })
})

describe('parseNumericInput — fractions simples', () => {
  it('accepte « 4/5 »', () => {
    expect((parseNumericInput('4/5') as { value: number }).value).toBe(0.8)
  })

  it('accepte les espaces autour du « / » : « 4 / 5 »', () => {
    expect((parseNumericInput('4 / 5') as { value: number }).value).toBe(0.8)
  })

  it('accepte « 10/4 » (fraction non simplifiée)', () => {
    expect((parseNumericInput('10/4') as { value: number }).value).toBe(2.5)
  })

  it('accepte une fraction décimale « 0,5/0,25 »', () => {
    expect((parseNumericInput('0,5/0,25') as { value: number }).value).toBe(2)
  })
describe('checkNumeric — tolérance', () => {
  const answer: NumericAnswer = { value: 36, tolerance: 0 }

  it('valide la valeur exacte et ses variantes françaises', () => {
    expect(checkNumeric('36', answer).ok).toBe(true)
    expect(checkNumeric('36,0', answer).ok).toBe(true)
    expect(checkNumeric('72/2', answer).ok).toBe(true)
  })

  it('rejette en dehors de la tolérance nulle', () => {
    const r = checkNumeric('35,9', answer)
    expect(r.ok).toBe(false)
    expect((r as { reason: string }).reason).toBe('wrong')
  })

  it('considère une entrée invalide comme « invalid » (pas « wrong »)', () => {
    const r = checkNumeric('abc', answer)
    expect(r.ok).toBe(false)
    expect((r as { reason: string }).reason).toBe('invalid')
  })

  it('accepte les bornes de la tolérance', () => {
    const tol: NumericAnswer = { value: 36, tolerance: 0.5 }
    expect(checkNumeric('35,5', tol).ok).toBe(true)
    expect(checkNumeric('36,5', tol).ok).toBe(true)
    expect(checkNumeric('35,4', tol).ok).toBe(false)
    expect(checkNumeric('36,51', tol).ok).toBe(false)
  })

  it('tolère une fraction dans la tolérance', () => {
    const r = checkNumeric('4/5', { value: 0.8, tolerance: 0.001 })
    expect(r.ok).toBe(true)
  })

  it('normalise une tolérance absente ou négative à 0', () => {
    expect(checkNumeric('9,9', { value: 10, tolerance: -1 }).ok).toBe(false)
    expect(checkNumeric('10', { value: 10, tolerance: 0 }).ok).toBe(true)
  })

  it('retourne la valeur analysée en cas de rejet « wrong »', () => {
    const r = checkNumeric('37', { value: 36, tolerance: 0 }) as { parsed?: number }
    expect(r.parsed).toBe(37)
  })
})

describe('checkQcm — sélection unique et multiple', () => {
  it('valide l’égalité exacte des ensembles', () => {
    expect(checkQcm(['a'], ['a'])).toBe(true)
    expect(checkQcm(['a', 'b'], ['a', 'b'])).toBe(true)
  })

  it('est insensible à l’ordre', () => {
    expect(checkQcm(['b', 'a'], ['a', 'b'])).toBe(true)
  })

  it('rejette les réponses manquantes ou en trop', () => {
    expect(checkQcm(['a'], ['a', 'b'])).toBe(false)
    expect(checkQcm(['a', 'b', 'c'], ['a', 'b'])).toBe(false)
    expect(checkQcm(['a', 'c'], ['a', 'b'])).toBe(false)
  })

  it('rejette une sélection vide', () => {
    expect(checkQcm([], ['a'])).toBe(false)
  })

  it('rejette les doublons dans la sélection', () => {
    expect(checkQcm(['a', 'a'], ['a'])).toBe(false)
  })
})

  it('accepte un numérateur ou dénominateur négatif « -3/2 » et « 1/-2 »', () => {
    expect((parseNumericInput('-3/2') as { value: number }).value).toBe(-1.5)
    expect((parseNumericInput('1/-2') as { value: number }).value).toBe(-0.5)
  })

  it('rejette le dénominateur nul « 4/0 » et « 0/0 »', () => {
    expect(parseNumericInput('4/0').ok).toBe(false)
    expect(parseNumericInput('0/0').ok).toBe(false)
  })
})

describe('parseNumericInput — entrées invalides', () => {
  const invalid = ['', '   ', 'abc', '3,14,15', '1/2/3', '/5', '4/', '12e3', '0x10', 'Infinity', 'NaN', '--3', '3..4', '3.14.15', '1 2,5']
  for (const input of invalid) {
    it(`rejette « ${input} »`, () => {
      expect(parseNumericInput(input).ok).toBe(false)
    })
  }
})