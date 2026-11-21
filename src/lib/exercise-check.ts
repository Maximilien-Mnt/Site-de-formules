// Vérification des réponses d'exercices — logique pure, sans DOM, testée par
// src/lib/exercise-check.test.ts.
//
// Formats numériques acceptés :
//   - décimaux à virgule « 3,14 » ou à point « 3.14 » (virgule terminale « 3, »,
//     virgule initiale « ,5 », signe moins typographique « − »)
//   - fractions simples « 4/5 », « 4 / 5 » (numérateur et dénominateur décimaux,
//     dénominateur non nul)
//   - groupes de milliers par espace « 1 000 » (espace normal, fine  ou insécable)
// Toute autre entrée est invalide (lettres, « 4/0 », « 1/2/3 », « 1 2 »,
// notation scientifique…).

export interface NumericAnswer {
  value: number
  tolerance: number
  unit?: string
}

export type ParseResult = { ok: true; value: number } | { ok: false }

export type NumericCheck =
  | { ok: true; parsed: number }
  | { ok: false; reason: 'invalid' | 'wrong'; parsed?: number }

// Espace normal, espace fine (U+2009), espace fine insécable (U+202F), espace insécable (U+00A0).
const SPACE_RE = /[\s\u2009\u202f\u00a0]/g

// Décimale : signe optionnel, partie entière (avec virgule finale possible),
// partie fractionnaire (avec virgule initiale possible).
const DECIMAL_RE = /^[+-]?\d+(\.\d*)?$|^[+-]?\.\d+$/

// Groupes de milliers : « 1 000 », « 12 345 », « 1 234,5 ».
const GROUPED_RE = /^[+-]?\d{1,3}(?:[ \u2009\u202f\u00a0]\d{3})+(?:\.\d+)?$/

/**
 * Analyse une réponse numérique libre. Renvoie `{ ok: true, value }` ou
 * `{ ok: false }` pour tout ce qui n'est pas un nombre reconnaissable.
 */
export function parseNumericInput(raw: string): ParseResult {
  const source = raw.trim()
  if (!source) return { ok: false }

  // Signe moins typographique « − » (U+2212) → « - ».
  let s = source.replace('−', '-')

  // Fraction simple : les espaces autour du « / » sont tolérés (« 4 / 5 »).
  if (s.includes('/')) {
    s = s.replace(SPACE_RE, '')
    const parts = s.split('/')
    if (parts.length !== 2) return { ok: false }
    const numerator = parseDecimalToken(parts[0])
    const denominator = parseDecimalToken(parts[1])
    if (numerator === null || denominator === null || denominator === 0) {
      return { ok: false }
    }
    const value = numerator / denominator
    if (!Number.isFinite(value)) return { ok: false }
    return { ok: true, value }
  }

  // Décimal simple : une seule virgule autorisée.
  if (s.split(',').length > 2) return { ok: false }
  s = s.replace(',', '.')

  // Espaces de groupement de milliers uniquement, puis aucun espace ne doit rester.
  if (GROUPED_RE.test(s)) s = s.replace(SPACE_RE, '')
  if (SPACE_RE.test(s)) return { ok: false }

  const value = parseDecimalToken(s)
  if (value === null) return { ok: false }
  return { ok: true, value }
}

/** Token numérique seul (partie entière ou fractionnaire d'une fraction). */
function parseDecimalToken(token: string): number | null {
  if (!token || token.split(',').length > 2) return null
  const s = token.replace(',', '.')
  if (!DECIMAL_RE.test(s)) return null
  const value = Number(s)
  return Number.isFinite(value) ? value : null
}

/**
 * Vérifie une réponse numérique : tolérance absolue (bornes incluses).
 * `tolerance` est normalisée à 0 si absente ou négative.
 */
export function checkNumeric(raw: string, answer: NumericAnswer): NumericCheck {
  const tolerance = Math.max(0, answer.tolerance ?? 0)
  const parsed = parseNumericInput(raw)
  if (!parsed.ok) return { ok: false, reason: 'invalid' }
  const within = Math.abs(parsed.value - answer.value) <= tolerance
  return within
    ? { ok: true, parsed: parsed.value }
    : { ok: false, reason: 'wrong', parsed: parsed.value }
}

/**
 * Vérifie un QCM : égalité exacte des ensembles de réponses (ordre indifférent,
 * ni réponse manquante ni réponse en trop).
 */
export function checkQcm(selected: readonly string[], correct: readonly string[]): boolean {
  if (selected.length !== correct.length) return false
  const set = new Set(selected)
  return correct.every((c) => set.has(c))
}