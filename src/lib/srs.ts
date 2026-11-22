// Fiches à répétition espacée — logique pure (sans DOM), testable en node.
//
// Le moteur est ts-fsrs. On persiste un modèle minimal (SrsCard) avec des dates
// en ISO : il est convertible en CardInput de ts-fsrs sans autre transformation.
// Le fuzz est désactivé : les échéances sont déterministes et testables.
//
// Une « carte » est identifiée par (formule, sens) : `cardKey(id, direction)`.
// Un « paquet » (Deck) est une liste d'ids de formules + un ensemble de sens ;
// il est stocké dans le store de progression (voir progress.ts).

import { createEmptyCard, fsrs, type Card, type CardInput, type Grade } from 'ts-fsrs'

export type Direction = 'nameToFormula' | 'formulaToName' | 'variablesToFormula'

export const DIRECTIONS: readonly Direction[] = [
  'nameToFormula',
  'formulaToName',
  'variablesToFormula',
]

/** Carte persistée dans le store (dates ISO, state sous forme numérique). */
export interface SrsCard {
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number
  last_review?: string
}

/** Paquet de fiches créé depuis les filtres du catalogue. */
export interface Deck {
  id: string
  name: string
  createdAt: string
  formulaIds: string[]
  directions: Direction[]
}

// Instance partagée : fsrs est sans état persistant entre appels (repeat/_card sont purs).
// Fuzz désactivé pour des échéances déterministes.
const f = fsrs({ enable_fuzz: false })

export function cardKey(formulaId: string, direction: Direction): string {
  return `${formulaId}:${direction}`
}

function toPersisted(card: Card): SrsCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  }
}

/** Carte neuve (État New, due à `now`). */
export function newCard(now: Date = new Date()): SrsCard {
  return toPersisted(createEmptyCard(now))
}

/** Applique une notation FSRS (Again=1, Hard=2, Good=3, Easy=4) et renvoie la carte résultat. */
export function review(card: SrsCard, rating: Grade, now: Date = new Date()): SrsCard {
  const record = f.repeat(card as unknown as CardInput, now)
  return toPersisted(record[rating].card)
}

/** Une carte est due si son échéance est passée (les cartes absentes/neuves sont gérées par dueForDeck). */
export function isDue(card: SrsCard, now: Date = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime()
}

export interface DueItem {
  key: string
  formulaId: string
  direction: Direction
  card?: SrsCard
}

/**
 * Cartes dues d'un paquet : pour chaque (formule × sens), la carte est incluse
 * si absente (nouvelle) ou si son échéance est passée. Les nouvelles arrivent
 * d'abord, puis les échéances du plus ancien au plus récent.
 */
export function dueForDeck(deck: Deck, cards: Record<string, SrsCard>, now: Date = new Date()): DueItem[] {
  const items: DueItem[] = []
  for (const formulaId of deck.formulaIds) {
    for (const direction of deck.directions) {
      const key = cardKey(formulaId, direction)
      const card = cards[key]
      if (!card || isDue(card, now)) items.push({ key, formulaId, direction, card })
    }
  }
  items.sort((a, b) => {
    const da = a.card ? new Date(a.card.due).getTime() : 0
    const db = b.card ? new Date(b.card.due).getTime() : 0
    return da - db
  })
  return items
}

/** Nombre réel de cartes (formule × sens) que contient un paquet. */
export function deckSize(deck: Deck): number {
  return deck.formulaIds.length * deck.directions.length
}