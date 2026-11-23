// Progression locale — cœurs purs (testables en node) + store nanostores persistant.
//
// Le store est versionné : clé localStorage `formulo:progress:v2` + champ `version`
// validé par Zod. LocalStorage indisponible ou contenu invalide → repli sur l'état
// initial : l'application reste utilisable.
//
// v1 → v2 : le champ réservé `flashcards` devient un vrai map `Record<string, SrsCard>`
// (fiches FSRS, logique dans lib/srs.ts) et on ajoute `decks` (paquets de fiches).
// L'import/le décodage acceptent v1 et v2 et migrent automatiquement vers v2.

import { z } from 'zod'
import { persistentAtom } from '@nanostores/persistent'
import type { WritableAtom } from 'nanostores'
import { DIRECTIONS, type Deck, type Direction, type SrsCard } from '@/lib/srs'

export const PROGRESS_KEY = 'formulo:progress:v2'
export const PROGRESS_VERSION = 2

export type FormulaStatus = 'new' | 'learning' | 'mastered'
export type AttemptResult = 'correct' | 'wrong' | 'invalid'
export type ImportMode = 'merge' | 'replace'

export interface ExerciseAttempt {
  id: string
  exerciseId: string
  /** Horodatage ISO (Date.toISOString()). */
  date: string
  result: AttemptResult
  /** Tentative précédente qui a abouti à cet échec (optionnelle). */
  previousAttemptId?: string
}

export interface ErrorLogEntry {
  id: string
  exerciseId: string
  formulaId: string
  /** Horodatage ISO (Date.toISOString()). */
  date: string
  result: AttemptResult
  /** Tentative précédente qui a abouti à cet échec (optionnelle). */
  previousAttemptId?: string
}

export interface ProgressState {
  version: 2
  /** Statut par formule ; l'absence de cle = statut « new ». */
  formulas: Record<string, FormulaStatus>
  /** Tentatives d'exercices (log horodaté). */
  attempts: ExerciseAttempt[]
  /** Jours d'activité, « YYYY-MM-DD », triés et uniques. */
  activityDays: string[]
  /** Fiches FSRS : cle `cardKey(formuleId, direction)` → carte persistée. */
  flashcards: Record<string, SrsCard>
  /** Paquets de fiches créés depuis les filtres du catalogue. */
  decks: Record<string, Deck>
  /** Entrées de carnet d'erreurs : exercices qui ont échoué et qui seront reproposés. */
  errorLog: Record<string, ErrorLogEntry>
}

const FORMULA_STATUS = z.enum(['new', 'learning', 'mastered'])
const ATTEMPT_RESULT = z.enum(['correct', 'wrong', 'invalid'])

const attemptSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string(),
  date: z.string(),
  result: ATTEMPT_RESULT,
})

const cardSchema = z.object({
  due: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.number(),
  last_review: z.string().optional(),
})

const deckSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  createdAt: z.string(),
  formulaIds: z.array(z.string()),
  directions: z.array(z.enum(DIRECTIONS as [Direction, ...Direction[]])),
})

const errorLogEntrySchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string(),
  formulaId: z.string(),
  date: z.string(),
  result: ATTEMPT_RESULT,
  previousAttemptId: z.string().optional(),
})

// Schéma Zod de la version 2 (état courant).
export const progressSchema = z.object({
  version: z.literal(2),
  formulas: z.record(z.string(), FORMULA_STATUS).default({}),
  attempts: z.array(attemptSchema).default([]),
  activityDays: z.array(z.string()).default([]),
  flashcards: z.record(z.string(), cardSchema).default({}),
  decks: z.record(z.string(), deckSchema).default({}),
  errorLog: z.record(z.string(), errorLogEntrySchema).default({}),
})

// Forme acceptée pour l'import (v1 ou v2). v1 n'a ni flashcards typés ni decks.
const importSchema = z.union([
  progressSchema,
  z.object({
    version: z.literal(1),
    formulas: z.record(z.string(), FORMULA_STATUS).default({}),
    attempts: z.array(attemptSchema).default([]),
    activityDays: z.array(z.string()).default([]),
    flashcards: z.record(z.string(), z.unknown()).default({}),
  }),
])

export function initialState(): ProgressState {
  return {
    version: 2,
    formulas: {},
    attempts: [],
    activityDays: [],
    flashcards: {},
    decks: {},
    errorLog: {},
  }
}

/** Clé de jour « YYYY-MM-DD » du fuseau local. */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Décale un jour-cle de `delta` jours. Pure, indépendante du fuseau. */
export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10)
}

export function addActivityDay(days: readonly string[], day: string): string[] {
  if (days.includes(day)) return [...days]
  return [...days, day].sort()
}

/** Série actuelle : jours consécutifs d'activité jusqu'à `now`. */
export function getStreak(days: readonly string[], now: Date = new Date()): number {
  const set = new Set(days)
  let cursor = dayKey(now)
  if (!set.has(cursor)) {
    cursor = shiftDay(cursor, -1)
    if (!set.has(cursor)) return 0
  }
  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

function normalizeState(s: ProgressState): ProgressState {
  const formulas: Record<string, FormulaStatus> = {}
  for (const [id, status] of Object.entries(s.formulas)) {
    if (status === 'new') continue
    formulas[id] = status
  }
  const attempts = [...s.attempts].sort((a, b) => (a.date < b.date ? -1 : 1))
  const activityDays = [...new Set(s.activityDays)].sort()
  return {
    version: 2,
    formulas,
    attempts,
    activityDays,
    flashcards: s.flashcards ?? {},
    decks: s.decks ?? {},
    errorLog: s.errorLog ?? {},
  }
}

function makeAttemptId(): string {
  const c = globalThis.crypto
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function setFormulaStatus(id: string, status: FormulaStatus): void {
  const s = progressStore.get()
  const formulas = { ...s.formulas }
  if (status === 'new') delete formulas[id]
  else formulas[id] = status
  progressStore.set(
    normalizeState({
      ...s,
      formulas,
      activityDays: addActivityDay(s.activityDays, dayKey(new Date())),
    }),
  )
}

export function recordAttempt(input: {
  exerciseId: string
  result: AttemptResult
  date?: Date
}): void {
  const s = progressStore.get()
  const date = input.date ?? new Date()
  const attempt: ExerciseAttempt = {
    id: makeAttemptId(),
    exerciseId: input.exerciseId,
    date: date.toISOString(),
    result: input.result,
  }
  progressStore.set(
    normalizeState({
      ...s,
      attempts: [...s.attempts, attempt],
      activityDays: addActivityDay(s.activityDays, dayKey(date)),
    }),
  )
}

export function resetProgress(): void {
  progressStore.set(initialState())
}

export function addDeck(deck: Deck): void {
  const s = progressStore.get()
  progressStore.set(
    normalizeState({
      ...s,
      decks: { ...s.decks, [deck.id]: deck },
    }),
  )
}

export function removeDeck(id: string): void {
  const s = progressStore.get()
  const decks = { ...s.decks }
  delete decks[id]
  progressStore.set(normalizeState({ ...s, decks }))
}

/** Enregistre une carte FSRS et marque le jour courant d'activité. */
export function setFlashcard(key: string, card: SrsCard): void {
  const s = progressStore.get()
  progressStore.set(
    normalizeState({
      ...s,
      flashcards: { ...s.flashcards, [key]: card },
      activityDays: addActivityDay(s.activityDays, dayKey(new Date())),
    }),
  )
}


export type ImportOutcome =
  | { ok: true; mode: ImportMode; state: ProgressState }
  | { ok: false; reason: 'invalid-json' | 'schema' | 'version' }

export function serializeProgress(state: ProgressState): string {
  return JSON.stringify(normalizeState(state), null, 2)
}

/** Parse + validation Zod d'une chaîne JSON d'export (accepte v1 et migre). Pure. */
export function parseProgress(json: string): ProgressState {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('progress.invalidJson')
  }
  const state = toV2(parsed)
  if (!state) throw new Error('progress.invalidSchema')
  return state
}

export function applyImport(
  current: ProgressState,
  json: string,
  mode: ImportMode,
): ImportOutcome {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
  const imported = toV2(parsed)
  if (!imported) return { ok: false, reason: 'schema' }
  switch (mode) {
    case 'replace':
      return { ok: true, mode, state: imported }
    case 'merge': {
      const byId = new Map(current.attempts.map((a) => [a.id, a]))
      for (const a of imported.attempts) if (!byId.has(a.id)) byId.set(a.id, a)
      const state: ProgressState = normalizeState({
        version: 2,
        formulas: { ...current.formulas, ...imported.formulas },
        attempts: [...byId.values()],
        activityDays: [
          ...new Set([...current.activityDays, ...imported.activityDays]),
        ],
        flashcards: { ...current.flashcards, ...imported.flashcards },
        decks: { ...current.decks, ...imported.decks },
        errorLog: { ...current.errorLog, ...imported.errorLog },
      })
      return { ok: true, mode, state }
    }
  }
}

export async function importProgress(
  file: File,
  mode: ImportMode,
): Promise<ImportOutcome> {
  const text = await file.text()
  const outcome = applyImport(progressStore.get(), text, mode)
  if (outcome.ok) progressStore.set(outcome.state)
  return outcome
}

export function exportProgress(fileName?: string): string {
  const json = serializeProgress(progressStore.get())
  if (typeof document !== 'undefined') {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download =
      fileName ?? `formulo-progression-${dayKey(new Date())}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
  return json
}

function decodeProgress(raw: string): ProgressState {
  if (!raw) return initialState()
  try {
    const parsed: unknown = JSON.parse(raw)
    return toV2(parsed) ?? initialState()
  } catch {
    return initialState()
  }
}

function toV2(raw: unknown): ProgressState | null {
  const result = importSchema.safeParse(raw)
  if (!result.success) return null
  const d = result.data
  if (d.version === 2) return normalizeState(d)
  return normalizeState({
    version: 2,
    formulas: d.formulas ?? {},
    attempts: d.attempts ?? [],
    activityDays: d.activityDays ?? [],
    flashcards: {},
    decks: {},
    errorLog: {},
  })
}

export const progressStore: WritableAtom<ProgressState> = persistentAtom<ProgressState>(
  PROGRESS_KEY,
  initialState(),
  {
    encode: (value) => JSON.stringify(value),
    decode: decodeProgress,
  },
)

