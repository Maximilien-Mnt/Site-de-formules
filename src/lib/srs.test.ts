import { describe, expect, it } from 'vitest'
import { Rating, State } from 'ts-fsrs'
import {
  cardKey,
  deckSize,
  dueForDeck,
  isDue,
  newCard,
  review,
  type Deck,
  type SrsCard,
} from '@/lib/srs'

/** Horodatages simulés — le moteur étant déterministe (fuzz désactivé). */
const t0 = new Date('2026-01-10T09:00:00.000Z')
const later = new Date('2026-01-12T09:00:00.000Z')

function makeDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'd1',
    name: 'Algèbre',
    createdAt: t0.toISOString(),
    formulaIds: ['a', 'b'],
    directions: ['nameToFormula', 'formulaToName'],
    ...overrides,
  }
}

describe('nouvelle carte', () => {
  it('est crée à l échéance now et considérée due', () => {
    const c = newCard(t0)
    expect(c.state).toBe(State.New)
    expect(c.due).toBe(t0.toISOString())
    expect(isDue(c, t0)).toBe(true)
  })

  it('dueForDeck inclut les cartes absentes (neuves, sens × formules)', () => {
    const items = dueForDeck(makeDeck(), {}, t0)
    expect(items).toHaveLength(4) // 2 formules × 2 sens
    expect(items.map((i) => i.key)).toEqual([
      cardKey('a', 'nameToFormula'),
      cardKey('a', 'formulaToName'),
      cardKey('b', 'nameToFormula'),
      cardKey('b', 'formulaToName'),
    ])
  })

  it('deckSize compte formule × sens', () => {
    expect(deckSize(makeDeck())).toBe(4)
  })
})

describe('isDue (échéances simulées)', () => {
  it('une carte future n est pas due, une carte passée l est', () => {
    const future = newCard(later)
    expect(isDue(future, t0)).toBe(false)
    const past: SrsCard = { ...newCard(t0), state: State.Review }
    expect(isDue(past, later)).toBe(true)
  })
})

describe('review (notation FSRS à dates fixes)', () => {
  it('Again sur carte neuve la passe en Learning avec échéance rapprochée', () => {
    const c = newCard(t0)
    const after = review(c, Rating.Again, t0)
    expect(after.state).toBe(State.Learning)
    expect(after.reps).toBe(1)
    expect(new Date(after.due).getTime()).toBeGreaterThan(t0.getTime())
    expect(new Date(after.due).getTime()).toBeLessThan(later.getTime())
  })

  it('Good produit une échéance plus longue que Again (carte neuve identique)', () => {
    const again = review(newCard(t0), Rating.Again, t0)
    const good = review(newCard(t0), Rating.Good, t0)
    expect(new Date(good.due).getTime()).toBeGreaterThan(new Date(again.due).getTime())
  })

  it('Easy donne une échéance plus longue que Good', () => {
    const good = review(newCard(t0), Rating.Good, t0)
    const easy = review(newCard(t0), Rating.Easy, t0)
    expect(new Date(easy.due).getTime()).toBeGreaterThan(new Date(good.due).getTime())
  })

  it('stabilité et difficulté restent bornées après une série de revues', () => {
    let c = newCard(t0)
    for (let i = 0; i < 5; i++) c = review(c, Rating.Good, later)
    expect(c.stability).toBeGreaterThan(0)
    expect(c.difficulty).toBeGreaterThan(1)
    expect(c.difficulty).toBeLessThan(10)
    expect(c.lapses).toBe(0)
  })
})

describe('dueForDeck avec cartes existantes', () => {
  it('inclut uniquement les cartes dues ou neuves', () => {
    const deck = makeDeck()
    const cards: Record<string, SrsCard> = {
      [cardKey('a', 'nameToFormula')]: { ...newCard(t0), state: State.Review, due: t0.toISOString() }, // due
      [cardKey('a', 'formulaToName')]: { ...newCard(later), state: State.Review }, // future, pas due
    }
    const items = dueForDeck(deck, cards, t0)
    expect(items).toHaveLength(3) // a:name (due) + b:name (neuve) + b:formula (neuve)
  })

  it('trie les nouvelles en premier, puis les échéances croissantes', () => {
    const deck = makeDeck()
    const older = '2026-01-09T09:00:00.000Z'
    const newer = '2026-01-11T09:00:00.000Z'
    const cards: Record<string, SrsCard> = {
      [cardKey('a', 'nameToFormula')]: { ...newCard(t0), state: State.Review, due: newer },
      [cardKey('a', 'formulaToName')]: { ...newCard(t0), state: State.Review, due: older },
    }
    const items = dueForDeck(deck, cards, t0)
    // b:name et b:formula sont neuves → en tête ; a:formula est due ; a:name
    // a une échéance future (plus tard que now) donc exclue.
    const keys = items.map((i) => i.key)
    expect(keys).toHaveLength(3)
    expect(new Set(keys.slice(0, 2))).toEqual(
      new Set([cardKey('b', 'nameToFormula'), cardKey('b', 'formulaToName')]),
    )
    expect(keys[2]).toBe(cardKey('a', 'formulaToName')) // échéance la plus ancienne
  })
})

describe('cardKey', () => {
  it('combine formule et sens', () => {
    expect(cardKey('pythagore', 'nameToFormula')).toBe('pythagore:nameToFormula')
  })
})