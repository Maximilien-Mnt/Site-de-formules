import { beforeEach, describe, expect, it } from 'vitest'
import {
  addDeck,
  applyImport,
  dayKey,
  getStreak,
  initialState,
  parseProgress,
  progressStore,
  recordAttempt,
  resetProgress,
  serializeProgress,
  setFlashcard,
  setFormulaStatus,
  type ProgressState,
} from '@/lib/progress'
import { cardKey, newCard, type Deck } from '@/lib/srs'

// Chaque test repart d'un store vierge (le store est un module singleton).
beforeEach(() => {
  resetProgress()
})

/** Paquet minimal réutilisable. */
function sampleDeck(id = 'd1'): Deck {
  return { id, name: 'Géométrie', createdAt: '2026-01-10T00:00:00.000Z', formulaIds: ['pythagore'], directions: ['nameToFormula'] }
}

describe('serie (getStreak)', () => {
  it('compte les jours consecutifs jusqua aujourd hui', () => {
    const now = new Date(2026, 0, 15)
    const days = ['2026-01-15', '2026-01-14', '2026-01-13', '2026-01-11']
    expect(getStreak(days, now)).toBe(3)
  })

  it('reprend a la veille si aujourd hui est inactif mais hier actif', () => {
    const now = new Date(2026, 0, 15)
    const days = ['2026-01-14', '2026-01-13', '2026-01-12']
    expect(getStreak(days, now)).toBe(3)
  })

  it('renvoie 0 quand la serie est rompue ou vide', () => {
    const now = new Date(2026, 0, 15)
    expect(getStreak(['2026-01-10'], now)).toBe(0)
    expect(getStreak([], now)).toBe(0)
  })
})

describe('export (serialisation)', () => {
  it('round-trip serialize vers parse preserve l etat', () => {
    setFormulaStatus('pythagore', 'mastered')
    setFormulaStatus('aire-rectangle', 'learning')
    recordAttempt({ exerciseId: 'ex-a', result: 'correct', date: new Date(2026, 0, 14, 10) })
    addDeck(sampleDeck())
    const json = serializeProgress(progressStore.get())
    expect(parseProgress(json)).toEqual(progressStore.get())
  })

  it('retire les statuts new de la sortie et trie les jours', () => {
    setFormulaStatus('a', 'new')
    setFormulaStatus('b', 'mastered')
    const parsed = parseProgress(serializeProgress(progressStore.get()))
    expect(parsed.formulas).toEqual({ b: 'mastered' })
  })

  it('rejette un JSON invalide ou de version inconnue', () => {
    expect(() => parseProgress('{ pas du json')).toThrow()
    expect(() => parseProgress(JSON.stringify({ version: 9 }))).toThrow()
  })
})

describe('migration v1 -> v2', () => {
  it('parse un export v1 et migre vers v2 en conservant formules/exos/jours', () => {
    const v1 = JSON.stringify({
      version: 1,
      formulas: { 'aire-rectangle': 'learning' },
      attempts: [{ id: 't1', exerciseId: 'x', date: '2026-01-10T00:00:00.000Z', result: 'correct' }],
      activityDays: ['2026-01-10'],
    })
    const state = parseProgress(v1)
    expect(state.version).toBe(2)
    expect(state.formulas).toEqual({ 'aire-rectangle': 'learning' })
    expect(state.attempts).toHaveLength(1)
    expect(state.activityDays).toEqual(['2026-01-10'])
    expect(state.flashcards).toEqual({})
    expect(state.decks).toEqual({})
  })

  it('import v1 accepte (role merge) et produit un etat v2', () => {
    const json = JSON.stringify({ version: 1, formulas: { b: 'mastered' }, activityDays: ['2026-01-11'] })
    const out = applyImport(initialState(), json, 'merge')
    if (!out.ok) throw new Error('import v1 attendu comme valide')
    expect(out.state.version).toBe(2)
    expect(out.state.decks).toEqual({})
  })
})

describe('fiches et paquets dans le store', () => {
  it('setFlashcard enregistre une carte FSRS et alimente le jour', () => {
    const key = cardKey('pythagore', 'nameToFormula')
    const card = newCard(new Date(2026, 0, 14))
    setFlashcard(key, card)
    const s = progressStore.get()
    expect(s.flashcards[key]).toEqual(card)
    expect(s.activityDays).toContain(dayKey(new Date()))
  })

  it('addDeck ajoute un paquet et ecrase le paquet meme id', () => {
    addDeck(sampleDeck())
    expect(progressStore.get().decks['d1']).toMatchObject({ id: 'd1', formulaIds: ['pythagore'] })
    expect(Object.keys(progressStore.get().decks)).toEqual(['d1'])
  })
})

describe('import (validation + fusion / remplacement)', () => {
  it('remplace l etat courant', () => {
    setFormulaStatus('a', 'mastered')
    const file = JSON.stringify({
      version: 2,
      formulas: { b: 'learning' },
      activityDays: ['2026-01-01'],
    })
    const out = applyImport(progressStore.get(), file, 'replace')
    if (!out.ok) throw new Error('import attendu comme valide')
    expect(out.state.formulas).toEqual({ b: 'learning' })
  })

  it('fusionne formules, jours, paquets et dedoublonne les tentatives par id', () => {
    const date = new Date(2026, 0, 10).toISOString()
    const current: ProgressState = {
      version: 2,
      formulas: { a: 'mastered' },
      attempts: [{ id: 't1', exerciseId: 'x', date, result: 'correct' }],
      activityDays: ['2026-01-10'],
      flashcards: {},
      decks: { d1: sampleDeck() },
    }
    const file = JSON.stringify({
      version: 2,
      formulas: { b: 'mastered' },
      attempts: [{ id: 't1', exerciseId: 'x', date, result: 'wrong' }],
      activityDays: ['2026-01-11'],
      decks: { d2: sampleDeck('d2') },
    })
    const out = applyImport(current, file, 'merge')
    if (!out.ok) throw new Error('import attendu comme valide')
    expect(out.state.formulas).toEqual({ a: 'mastered', b: 'mastered' })
    expect(out.state.attempts).toHaveLength(1)
    expect(out.state.activityDays).toEqual(['2026-01-10', '2026-01-11'])
    expect(Object.keys(out.state.decks).sort()).toEqual(['d1', 'd2'])
  })

  it('signale les erreurs json et de schema', () => {
    expect(applyImport(initialState(), 'import non-json', 'merge').ok).toBe(false)
    expect(applyImport(initialState(), JSON.stringify({ version: 9 }), 'merge').ok).toBe(false)
  })
})

describe('statut et tentatives alimentent les jours d activite', () => {
  it('marque le jour courant pour une formule et reflete le statut', () => {
    setFormulaStatus('aire-rectangle', 'mastered')
    const s = progressStore.get()
    expect(s.formulas).toEqual({ 'aire-rectangle': 'mastered' })
    expect(s.activityDays).toContain(dayKey(new Date()))
    setFormulaStatus('aire-rectangle', 'new')
    expect(progressStore.get().formulas).toEqual({})
  })

  it('recordAttempt ajoute une tentative horodatee', () => {
    recordAttempt({ exerciseId: 'ex-c', result: 'wrong' })
    const s = progressStore.get()
    expect(s.attempts).toHaveLength(1)
    expect(s.attempts[0].exerciseId).toBe('ex-c')
    expect(s.attempts[0].result).toBe('wrong')
  })
})