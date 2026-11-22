// Tirage et correction de quiz — logique pure, sans DOM, testée par
// src/lib/quiz.test.ts.
// Les questions « open » sont exclues (seuls qcm et numeric sont jouables).
import { checkNumeric, checkQcm } from '@/lib/exercise-check'

export type QuizKind = 'qcm' | 'numeric'

export interface QuizQuestion {
  id: string
  title: string
  domain: string
  level: number
  difficulty: number
  kind: QuizKind
  statementHtml: string
  /** Choix QCM assemblés (libellés HTML rendus au build). */
  choices?: { id: string; html: string }[]
  /** Identifiants des bonnes réponses (ensemble). */
  correct: string[]
  /** Réponse attendue (numérique uniquement). */
  answer?: { value: number; tolerance: number; unit?: string }
  /** Solution rendue au build (affichée dans le détail des résultats). */
  solutionHtml?: string
  /** Formules liées à réviser en cas d'erreur. */
  formulas: { id: string; url: string; title: string }[]
  estimatedMinutes: number
}

export interface QuizDrawInput {
  exercises: QuizQuestion[]
  levels: number[]
  domains: string[]
  count: 5 | 10 | 20
  /** Générateur de nombres aléatoires injectable (tests déterministes). */
  rng?: () => number
}

export interface QuestionOutcome {
  questionId: string
  title: string
  kind: QuizKind
  correct: boolean
  parsed?: number // valeur saisie (numérique, si parsable)
  yourAnswerHtml?: string // représentation de la réponse de l'utilisateur
  correctAnswerHtml: string // représentation de la bonne réponse
  solutionHtml?: string
  formulas: { id: string; url: string; title: string }[]
}

export interface QuizResult {
  results: QuestionOutcome[]
  score: number
  total: number
}

const defaultRng = () => Math.random()

/**
 * Tire `count` questions au hasard parmi les exercices correspondant aux
 * critères (niveaux + domaines, kinds qcm/numeric uniquement).
 * Retourne au plus `count` questions (peut être < count si pas assez).
 * Mélange stable Fisher-Yates avec `rng` injectable.
 */
export function drawQuestions(input: QuizDrawInput): QuizQuestion[] {
  const { exercises, levels, domains, count, rng = defaultRng } = input
  const levelSet = new Set(levels)
  const domainSet = new Set(domains)

  const pool = exercises.filter(
    (e) =>
      (e.kind === 'qcm' || e.kind === 'numeric') &&
      levelSet.has(e.level) &&
      domainSet.has(e.domain),
  )

  // Mélange Fisher-Yates.
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Corrige un ensemble de réponses. `answers` mappe questionId -> choix sélectionnés
 * (qcm) ou chaîne brute (numeric). Les questions sans réponse sont marquées
 * non répondues (pas de tentative enregistrée par l'appelant).
 */
export function grade(
  questions: QuizQuestion[],
  answers: Record<string, string[] | string | undefined>,
): QuizResult {
  const results: QuestionOutcome[] = []
  let score = 0

  for (const q of questions) {
    const raw = answers[q.id]
    let correct = false
    let parsed: number | undefined
    let yourAnswerHtml: string | undefined

    if (q.kind === 'qcm') {
      const selected = Array.isArray(raw) ? raw : []
      correct = checkQcm(selected, q.correct)
      yourAnswerHtml =
        selected.length > 0
          ? selected.map((id) => q.choices?.find((c) => c.id === id)?.html ?? id).join(', ')
          : '(aucune)'
    } else {
      // numeric
      if (typeof raw === 'string' && raw.trim() !== '') {
        const res = checkNumeric(raw, q.answer ?? { value: 0, tolerance: 0 })
        correct = res.ok
        parsed = res.ok ? res.parsed : undefined
        if (!res.ok && parsed === undefined) {
          yourAnswerHtml = '(invalide)'
        } else if (parsed !== undefined) {
          yourAnswerHtml = String(parsed)
        }
      } else {
        yourAnswerHtml = '(aucune)'
      }
    }

    if (correct) score += 1

    results.push({
      questionId: q.id,
      title: q.title,
      kind: q.kind,
      correct,
      parsed,
      yourAnswerHtml,
      correctAnswerHtml: correctAnswerHtml(q),
      solutionHtml: undefined, // rempli par l'appelant si besoin (déjà rendu au build)
      formulas: q.formulas,
    })
  }

  return { results, score, total: questions.length }
}

function correctAnswerHtml(q: QuizQuestion): string {
  if (q.kind === 'qcm') {
    return q.correct
      .map((id) => q.choices?.find((c) => c.id === id)?.html ?? id)
      .join(', ')
  }
  // numeric : affiche la valeur attendue, formatée à la française.
  if (q.answer) {
    const { value, unit } = q.answer
    return `${String(value).replace('.', ',')}${unit ? ` ${unit}` : ''}`
  }
  return ''
}

/** Déduplique les formules liées aux questions échouées, préservant l'ordre. */
export function failedFormulas(questions: QuizQuestion[], answers: Record<string, string[] | string | undefined>): { id: string; url: string; title: string }[] {
  const seen = new Set<string>()
  const out: { id: string; url: string; title: string }[] = []
  const grading = grade(questions, answers)
  for (const r of grading.results) {
    if (r.correct) continue
    const q = questions.find((x) => x.id === r.questionId)
    if (!q) continue
    for (const f of q.formulas) {
      if (seen.has(f.id)) continue
      seen.add(f.id)
      out.push(f)
    }
  }
  return out
}