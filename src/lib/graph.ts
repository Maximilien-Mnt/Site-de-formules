// Graphes interactifs (P8) : logique pure (types, normalisation, géométrie, formatage).
// Aucune dépendance DOM ici — testable avec Vitest (voir graph.test.ts).

export interface GraphParam {
  name: string
  min: number
  max: number
  step: number
  default: number
}

export interface GraphViewport {
  x: [number, number]
  y: [number, number]
}

export interface FunctionGraphConfig {
  kind: 'function'
  expressions: string[]
  params: GraphParam[]
  viewport: GraphViewport
}

export type GraphPresetKind = 'right-triangle' | 'unit-circle'

export interface PresetGraphConfig {
  kind: 'preset'
  preset: GraphPresetKind
}

export type GraphConfig = FunctionGraphConfig | PresetGraphConfig

/** Type du module mathjs chargé dynamiquement — type uniquement, aucun import à l'exécution. */
export type MathJs = typeof import('mathjs')

const PRESETS: readonly string[] = ['right-triangle', 'unit-circle']

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isPair(v: unknown): v is [number, number] {
  return Array.isArray(v) && v.length === 2 && isFiniteNumber(v[0]) && isFiniteNumber(v[1])
}

/**
 * Normalise le `graph` brut d'une formule YAML (même forme que le schéma Zod
 * de content.config.ts) et applique les défauts (step 0.1, params []).
 * Retourne undefined si le graph est absent ou inutilisable : la page reste intègre.
 */
export function normalizeGraph(raw: unknown): GraphConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>

  if (r.kind === 'function') {
    const vp = (r.viewport ?? {}) as Record<string, unknown>
    const x = vp.x
    const y = vp.y
    if (!isPair(x) || !isPair(y) || x[0] >= x[1] || y[0] >= y[1]) return undefined
    const expressions = Array.isArray(r.expressions)
      ? r.expressions.filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
      : []
    if (expressions.length === 0) return undefined
    const params: GraphParam[] = Array.isArray(r.params)
      ? r.params.map(normalizeParam).filter((p): p is GraphParam => p !== undefined)
      : []
    return { kind: 'function', expressions, params, viewport: { x, y } }
  }

  if (r.kind === 'preset' && typeof r.preset === 'string' && PRESETS.includes(r.preset)) {
    return { kind: 'preset', preset: r.preset as GraphPresetKind }
  }

  return undefined
}

function normalizeParam(raw: unknown): GraphParam | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Record<string, unknown>
  if (typeof p.name !== 'string' || p.name.length === 0) return undefined
  if (!isFiniteNumber(p.min) || !isFiniteNumber(p.max) || !isFiniteNumber(p.default)) return undefined
  if (p.max <= p.min || p.default < p.min || p.default > p.max) return undefined
  return {
    name: p.name,
    min: p.min,
    max: p.max,
    step: isFiniteNumber(p.step) && p.step > 0 ? p.step : 0.1,
    default: p.default,
  }
}

export type Vec2 = [number, number]

/** Sommets d'un polygone fermé, dans l'ordre. */
export type PolygonPoints = Vec2[]

export interface RightTriangleGeometry {
  /** Longueur de l'hypoténuse. */
  c: number
  /** Sommets du triangle rectangle : O = angle droit, A = côté a (axe x), B = côté b (axe y). */
  o: Vec2
  a: Vec2
  b: Vec2
  /** Carré d'aire a² construit sous le côté a. */
  squareA: PolygonPoints
  /** Carré d'aire b² construit à gauche du côté b. */
  squareB: PolygonPoints
  /** Carré d'aire c² construit à l'extérieur du triangle, sur l'hypoténuse. */
  squareC: PolygonPoints
}

/**
 * Géométrie du preset « right-triangle » : O(0,0), A(a,0), B(0,b) et les trois
 * carrés a², b², c². a² est sous l'axe x, b² à gauche de l'axe y, c² s'appuie
 * sur l'hypoténuse et s'étend vers le nord-est (aire c² = a² + b²).
 */
export function rightTriangleGeometry(a: number, b: number): RightTriangleGeometry {
  const c = Math.sqrt(a * a + b * b)
  return {
    c,
    o: [0, 0],
    a: [a, 0],
    b: [0, b],
    squareA: [
      [0, 0],
      [a, 0],
      [a, -a],
      [0, -a],
    ],
    squareB: [
      [0, 0],
      [0, b],
      [-b, b],
      [-b, 0],
    ],
    // Normale extérieure au triangle : n = (b, a)/c. Les quatre sommets sont
    // A, B, B + n·c, A + n·c — le carré est du côté opposé à l'angle droit.
    squareC: [
      [a, 0],
      [0, b],
      [b, b + a],
      [a + b, a],
    ],
  }
}

export interface UnitCirclePoint {
  x: number
  y: number
  cos: number
  sin: number
}

/** Point du cercle unité pour un angle θ exprimé en degrés. */
export function unitCirclePoint(thetaDeg: number): UnitCirclePoint {
  const rad = (thetaDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: cos, y: sin, cos, sin }
}

/** Isobarycentre d'un polygone — position des étiquettes de carrés. */
export function polygonCenter(points: PolygonPoints): Vec2 {
  let x = 0
  let y = 0
  for (const [px, py] of points) {
    x += px
    y += py
  }
  return [x / points.length, y / points.length]
}

/** Convertit une valeur de scope mathjs en nombre fini utilisable (Complex/∞ → NaN). */
export function toFiniteNumber(value: unknown): number {
  return isFiniteNumber(value) ? value : NaN
}

/**
 * Pas « rond » de grille adapté à une étendue : environ `target` lignes primaires.
 * Retourne 1 si le span est inutilisable.
 */
export function niceStep(span: number, target = 9): number {
  if (!isFiniteNumber(span) || span <= 0) return 1
  const raw = span / target
  const exp = Math.floor(Math.log10(raw))
  const base = Math.pow(10, exp)
  for (const m of [1, 2, 2.5, 5, 10]) {
    const cand = m * base
    if (cand >= raw) return cand
  }
  return 10 * base
}

/** Formate un nombre pour l'affichage (virgule décimale selon la langue), « — » si non fini. */
export function formatNumber(lang: string, value: number, maxDigits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(lang, { maximumFractionDigits: maxDigits }).format(value)
}