import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  niceStep,
  normalizeGraph,
  polygonCenter,
  rightTriangleGeometry,
  toFiniteNumber,
  unitCirclePoint,
} from '@/lib/graph'

/** Aire orientée d'un polygone simple (formule du lacet) — outil de test. */
function polygonArea(points: [number, number][][]): number {
  let s = 0
  for (const pts of points) {
    let acc = 0
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[(i + 1) % pts.length]
      acc += x1 * y2 - x2 * y1
    }
    s += Math.abs(acc) / 2
  }
  return s
}

describe('normalizeGraph', () => {
  it('normalise un graph fonction valide et applique les défauts (params, step)', () => {
    const g = normalizeGraph({
      kind: 'function',
      expressions: ['exp(k*x)'],
      params: [{ name: 'k', min: -2, max: 2, default: 1 }],
      viewport: { x: [-4, 4], y: [-1, 8] },
    })
    expect(g).toMatchObject({
      kind: 'function',
      expressions: ['exp(k*x)'],
      viewport: { x: [-4, 4], y: [-1, 8] },
    })
    expect(g && g.kind === 'function' ? g.params : []).toEqual([
      { name: 'k', min: -2, max: 2, step: 0.1, default: 1 },
    ])
  })

  it('ignore les expressions vides et conserve un step explicite', () => {
    const g = normalizeGraph({
      kind: 'function',
      expressions: ['', 'x^2', '   '],
      params: [{ name: 'a', min: 0, max: 3, step: 0.5, default: 1 }],
      viewport: { x: [0, 4], y: [0, 4] },
    })
    expect(g && g.kind === 'function' ? g.expressions : []).toEqual(['x^2'])
    expect(g && g.kind === 'function' ? g.params : []).toEqual([
      { name: 'a', min: 0, max: 3, step: 0.5, default: 1 },
    ])
  })

  it('retourne undefined si le viewport est invalide ou absent', () => {
    expect(normalizeGraph({ kind: 'function', expressions: ['x'] })).toBeUndefined()
    expect(
      normalizeGraph({ kind: 'function', expressions: ['x'], viewport: { x: [0, 'a'], y: [0, 1] } }),
    ).toBeUndefined()
  })

  it('retourne undefined si aucune expression valide', () => {
    expect(
      normalizeGraph({ kind: 'function', expressions: [], viewport: { x: [0, 1], y: [0, 1] } }),
    ).toBeUndefined()
  })

  it('retourne undefined pour un paramètre inutilisable (défaut hors bornes)', () => {
    const g = normalizeGraph({
      kind: 'function',
      expressions: ['a*x'],
      params: [{ name: 'a', min: 0, max: 1, default: 5 }],
      viewport: { x: [0, 1], y: [0, 1] },
    })
    expect(g && g.kind === 'function' ? g.params : []).toEqual([])
  })

  it('accepte un preset connu, rejette un preset inconnu et les non-objets', () => {
    expect(normalizeGraph({ kind: 'preset', preset: 'right-triangle' })).toEqual({
      kind: 'preset',
      preset: 'right-triangle',
    })
    expect(normalizeGraph({ kind: 'preset', preset: 'parabola' })).toBeUndefined()
    expect(normalizeGraph(null)).toBeUndefined()
    expect(normalizeGraph('graph')).toBeUndefined()
  })
})

describe('rightTriangleGeometry', () => {
  it('calcule c = √(a² + b²) pour le triangle 3-4-5', () => {
    const g = rightTriangleGeometry(3, 4)
    expect(g.c).toBeCloseTo(5, 10)
    expect(g.a).toEqual([3, 0])
    expect(g.b).toEqual([0, 4])
  })

  it("les trois carrés ont pour aires a², b² et c² = a² + b²", () => {
    const g = rightTriangleGeometry(3, 4)
    expect(polygonArea([g.squareA])).toBeCloseTo(9, 6)
    expect(polygonArea([g.squareB])).toBeCloseTo(16, 6)
    expect(polygonArea([g.squareC])).toBeCloseTo(25, 6)
  })

  it('le carré c² partage l\'hypoténuse et s\'étend vers le nord-est', () => {
    const g = rightTriangleGeometry(3, 4)
    expect(g.squareC[0]).toEqual([3, 0])
    expect(g.squareC[1]).toEqual([0, 4])
    expect(g.squareC[2][0]).toBeGreaterThan(0)
    expect(g.squareC[3][1]).toBeGreaterThan(0)
  })

  it('polygonCenter fournit le centre d\'un carré (étiquette)', () => {
    const g = rightTriangleGeometry(3, 4)
    expect(polygonCenter(g.squareA)).toEqual([1.5, -1.5])
    expect(polygonCenter(g.squareB)).toEqual([-2, 2])
    expect(polygonCenter(g.squareC)).toEqual([3.5, 3.5])
  })
})

describe('unitCirclePoint', () => {
  it('place le point à (1, 0) pour θ = 0°', () => {
    const p = unitCirclePoint(0)
    expect(p.x).toBeCloseTo(1, 10)
    expect(p.y).toBeCloseTo(0, 10)
  })

  it('place le point en haut du cercle pour θ = 90°', () => {
    const p = unitCirclePoint(90)
    expect(p.x).toBeCloseTo(0, 10)
    expect(p.y).toBeCloseTo(1, 10)
  })

  it('θ = 45° donne cos = sin = √2/2', () => {
    const p = unitCirclePoint(45)
    expect(p.cos).toBeCloseTo(Math.SQRT1_2, 10)
    expect(p.sin).toBeCloseTo(Math.SQRT1_2, 10)
  })

  it('cos² + sin² = 1 pour tout angle', () => {
    for (const deg of [0, 30, 135, 210, 300, 359]) {
      const p = unitCirclePoint(deg)
      expect(p.cos * p.cos + p.sin * p.sin).toBeCloseTo(1, 10)
    }
  })
})

describe('toFiniteNumber / niceStep / formatNumber', () => {
  it('ne garde que les nombres finis', () => {
    expect(toFiniteNumber(2.5)).toBe(2.5)
    expect(Number.isNaN(toFiniteNumber(Infinity))).toBe(true)
    expect(Number.isNaN(toFiniteNumber('x'))).toBe(true)
    expect(Number.isNaN(toFiniteNumber({ re: 0, im: 1 }))).toBe(true)
  })

  it('choisit un pas rond adapté à l\'étendue', () => {
    expect(niceStep(12)).toBe(2)
    expect(niceStep(3.2)).toBe(0.5)
    expect(niceStep(2.6)).toBe(0.5)
    expect(niceStep(120)).toBe(20)
    expect(niceStep(0)).toBe(1)
  })

  it('formate en français (virgule décimale) et en nombre de chiffres', () => {
    expect(formatNumber('fr', 12.25)).toBe('12,25')
    expect(formatNumber('fr', 3)).toBe('3')
    expect(formatNumber('fr', 1 / 3, 3)).toBe('0,333')
    expect(formatNumber('fr', Number.NaN)).toBe('—')
  })
})