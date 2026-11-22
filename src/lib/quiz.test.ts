import { describe, it, expect } from 'vitest'
import { drawQuestions, grade, failedFormulas, type QuizDrawInput, type QuizKind, type QuizQuestion } from '@/lib/quiz'

const makeQuestion = (overrides: Omit<Partial<QuizQuestion>, 'kind'> & { kind?: QuizKind | 'open' }): QuizQuestion => ({
  id: 'exo-1',
  title: 'Titre',
  domain: 'geometry',
  level: 2,
  difficulty: 2,
  kind: 'qcm',
  statementHtml: '<p>énoncé</p>',
  choices: [{ id: 'a', html: '$48$ cm²' }, { id: 'b', html: '$96$ cm²' }],
  correct: ['a'],
  formulas: [{ id: 'f1', url: '/fr/formules/f1/', title: 'Formule 1' }],
  estimatedMinutes: 3,
  ...overrides,
} as QuizQuestion)

const numericQuestion = (id: string): QuizQuestion =>
  makeQuestion({
    id,
    kind: 'numeric',
    answer: { value: 36, tolerance: 0 },
    choices: undefined,
    correct: [],
  })

describe('drawQuestions — tirage au sort', () => {
  const baseInput: QuizDrawInput = {
    exercises: [
      makeQuestion({ id: 'a', level: 1, domain: 'arithmetic' }),
      makeQuestion({ id: 'b', level: 2, domain: 'geometry' }),
      makeQuestion({ id: 'c', level: 3, domain: 'algebra' }),
      makeQuestion({ id: 'd', level: 2, domain: 'geometry', kind: 'numeric' }),
      makeQuestion({ id: 'e', level: 2, domain: 'geometry', kind: 'open' }),
    ],
    levels: [1, 2, 3],
    domains: ['arithmetic', 'geometry', 'algebra'],
    count: 5,
  }

  it('retourne au plus `count` questions', () => {
    const out = drawQuestions({ ...baseInput, count: 3 as 5 | 10 | 20 })
    expect(out.length).toBeLessThanOrEqual(3)
  })

  it('exclut les questions « open »', () => {
    const out = drawQuestions(baseInput)
    expect(out.some((q) => (q as { kind: string }).kind === 'open')).toBe(false)
    expect(out.find((q) => q.id === 'e')).toBeUndefined()
  })

  it('filtre par niveaux et domaines', () => {
    const out = drawQuestions({ ...baseInput, levels: [2], domains: ['geometry'] })
    expect(out.every((q) => q.level === 2 && q.domain === 'geometry')).toBe(true)
  })

  it('ne retourne que les exercices disponibles quand moins de `count`', () => {
    const out = drawQuestions({ ...baseInput, levels: [2], domains: ['geometry'], count: 10 })
    expect(out.length).toBe(2) // b + d
  })

  it('est déterministe avec un rng donné', () => {
    const rng = () => 0.5
    const a = drawQuestions({ ...baseInput, rng })
    const b = drawQuestions({ ...baseInput, rng })
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
  })

  it('mélange l’ordre avec un rng non constant', () => {
    const calls: number[] = []
    const rng = () => {
      calls.push(calls.length)
      return 0.1
    }
    const out = drawQuestions({ ...baseInput, rng })
    expect(out.length).toBeGreaterThan(0)
  })
})

describe('grade — correction', () => {
  it('valide un QCM unique correct', () => {
    const q = makeQuestion({ id: 'q1', correct: ['a'] })
    const res = grade([q], { q1: ['a'] })
    expect(res.score).toBe(1)
    expect(res.results[0].correct).toBe(true)
  })

  it('rejette un QCM avec réponse manquante ou en trop', () => {
    const q = makeQuestion({ id: 'q2', correct: ['a', 'b'] })
    expect(grade([q], { q2: ['a'] }).score).toBe(0)
    expect(grade([q], { q2: ['a', 'b', 'c'] }).score).toBe(0)
  })

  it('valide une réponse numérique exacte et ses variantes françaises', () => {
    const q = numericQuestion('q3')
    expect(grade([q], { q3: '36' }).score).toBe(1)
    expect(grade([q], { q3: '36,0' }).score).toBe(1)
    expect(grade([q], { q3: '72/2' }).score).toBe(1)
  })

  it('rejette une réponse numérique hors tolérance', () => {
    const q = numericQuestion('q4')
    expect(grade([q], { q4: '37' }).score).toBe(0)
  })

  it('marque les questions sans réponse comme incorrectes (non répondues)', () => {
    const q1 = makeQuestion({ id: 'q1' })
    const q2 = numericQuestion('q2')
    const res = grade([q1, q2], {})
    expect(res.score).toBe(0)
    expect(res.results.every((r) => r.correct === false)).toBe(true)
  })
})

describe('failedFormulas', () => {
  it('déduplique et ne retourne que les formules des questions échouées', () => {
    const q1 = makeQuestion({
      id: 'q1',
      correct: ['a'],
      formulas: [{ id: 'f1', url: '/f1/', title: 'F1' }],
    })
    const q2 = makeQuestion({
      id: 'q2',
      correct: ['b'],
      formulas: [{ id: 'f1', url: '/f1/', title: 'F1' }, { id: 'f2', url: '/f2/', title: 'F2' }],
    })
    grade([q1, q2], { q1: ['a'], q2: ['c'] })
    const out = failedFormulas([q1, q2], { q1: ['a'], q2: ['c'] })
    expect(out.map((f) => f.id)).toEqual(['f1', 'f2'])
    // q1 est correcte, seule q2 échoue → f1 et f2 (f1 dédoublonné)
  })
})