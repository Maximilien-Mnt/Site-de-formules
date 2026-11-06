import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import YAML from 'yaml'
import { DEFAULT_LANG } from '@/i18n/config'
import {
  SECTION_KINDS,
  type SectionKind,
  type Subject,
  type Domain,
} from '@/data/taxonomy'

const CONTENT_ROOT = join(process.cwd(), 'src', 'content')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormulaLight {
  id: string
  subject: Subject
  domain: Domain
  topics: string[]
  level: number
  difficulty: number
  latex: string
  status: 'draft' | 'published'
}

export interface FormulaText {
  title: string
  summary: string
  aliases: string[]
  keywords: string[]
  variableNames: Record<string, string>
  variantLabels: Record<string, string>
  body: string // corps MDX
}

export interface FormulaView extends FormulaLight {
  originYear?: number
  variants: { id: string; latex: string }[]
  variables: { symbol: string; unit?: string }[]
  text: FormulaText | undefined
  lang: string
  isFallback: boolean
  sections: { kind: SectionKind }[]
  body: string
  exercises: ExerciseView[]
  prerequisites: FormulaLight[]
  related: FormulaLight[]
  confusedWith: FormulaLight[]
}

export interface ExerciseLight {
  id: string
  subject: Subject
  domain: Domain
  level: number
  difficulty: number
  formulas: string[]
  kind: 'numeric' | 'qcm' | 'open'
  estimatedMinutes: number
  status: 'draft' | 'published'
}

export interface ExerciseText {
  title: string
  statement: string
  choices?: Record<string, string>
  hints: string[]
  solution: string
}

export interface ExerciseView extends ExerciseLight {
  text: ExerciseText | undefined
  lang: string
  isFallback: boolean
}

// ---------------------------------------------------------------------------
// Lecteurs système de fichiers (même approche que scripts/check-content.mjs)
// ---------------------------------------------------------------------------

function list(dir: string, ext: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === ext) : []
}

function readYaml(p: string): Record<string, unknown> {
  return YAML.parse(readFileSync(p, 'utf8')) ?? {}
}

function readMdx(p: string): { data: Record<string, unknown>; body: string } {
  const raw = readFileSync(p, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  return { data: (YAML.parse(m[1]) ?? {}), body: m[2] }
}

// Données partagées (indépendantes de la langue)
interface FormulaShared extends FormulaLight {
  originYear?: number
  variants: { id: string; latex: string }[]
  variables: { symbol: string; unit?: string }[]
  prerequisites: string[]
  related: string[]
  confusedWith: string[]
}

interface ExerciseShared extends ExerciseLight {
  answer?: { value: number; tolerance: number; unit?: string }
  choices?: string[]
  correct?: string[]
}

let formulasById: Map<string, FormulaShared> | null = null
function getFormulasShared(): Map<string, FormulaShared> {
  if (!formulasById) {
    formulasById = new Map()
    for (const f of list(join(CONTENT_ROOT, 'formulas'), '.yaml')) {
      const id = basename(f, '.yaml')
      const d = readYaml(join(CONTENT_ROOT, 'formulas', f)) as unknown as FormulaShared
      d.id = id
      formulasById.set(id, d)
    }
  }
  return formulasById
}

let exercisesById: Map<string, ExerciseShared> | null = null
function getExercisesShared(): Map<string, ExerciseShared> {
  if (!exercisesById) {
    exercisesById = new Map()
    for (const f of list(join(CONTENT_ROOT, 'exercises'), '.yaml')) {
      const id = basename(f, '.yaml')
      const d = readYaml(join(CONTENT_ROOT, 'exercises', f)) as unknown as ExerciseShared
      d.id = id
      exercisesById.set(id, d)
    }
  }
  return exercisesById
}

// Index inversé : id de formule -> ids d'exercices qui y font référence
let exerciseIndex: Map<string, string[]> | null = null
function getExerciseIndex(): Map<string, string[]> {
  if (!exerciseIndex) {
    exerciseIndex = new Map()
    for (const ex of getExercisesShared().values()) {
      for (const fid of ex.formulas) {
        const arr = exerciseIndex.get(fid) ?? []
        arr.push(ex.id)
        exerciseIndex.set(fid, arr)
      }
    }
  }
  return exerciseIndex
}
// ---------------------------------------------------------------------------
// Textes localisés avec repli sur 'fr'
// ---------------------------------------------------------------------------

function loadFormulaText(lang: string, id: string): FormulaText | undefined {
  const p = join(CONTENT_ROOT, 'formula-texts', lang, `${id}.mdx`)
  if (!existsSync(p)) return undefined
  const { data, body } = readMdx(p)
  return {
    title: String(data.title ?? ''),
    summary: String(data.summary ?? ''),
    aliases: Array.isArray(data.aliases) ? (data.aliases as string[]) : [],
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    variableNames:
      data.variableNames && typeof data.variableNames === 'object'
        ? (data.variableNames as Record<string, string>)
        : {},
    variantLabels:
      data.variantLabels && typeof data.variantLabels === 'object'
        ? (data.variantLabels as Record<string, string>)
        : {},
    body,
  }
}

function loadExerciseText(lang: string, id: string): ExerciseText | undefined {
  const p = join(CONTENT_ROOT, 'exercise-texts', lang, `${id}.yaml`)
  if (!existsSync(p)) return undefined
  const d = readYaml(p)
  return {
    title: String(d.title ?? ''),
    statement: String(d.statement ?? ''),
    choices:
      d.choices && typeof d.choices === 'object'
        ? (d.choices as Record<string, string>)
        : undefined,
    hints: Array.isArray(d.hints) ? (d.hints as string[]) : [],
    solution: String(d.solution ?? ''),
  }
}

interface TextResult<T> {
  value: T | undefined
  lang: string
  isFallback: boolean
}

function resolveText<T>(
  load: (lang: string) => T | undefined,
  lang: string,
): TextResult<T> {
  if (lang === DEFAULT_LANG) {
    return { value: load(DEFAULT_LANG), lang: DEFAULT_LANG, isFallback: false }
  }
  const direct = load(lang)
  if (direct) return { value: direct, lang, isFallback: false }
  const fallback = load(DEFAULT_LANG)
  return { value: fallback, lang: DEFAULT_LANG, isFallback: true }
}

const SECTION_RE = /<Section\s+kind="([a-z]+)"/g

function detectSections(body: string): { kind: SectionKind }[] {
  const seen = new Set<SectionKind>()
  const out: { kind: SectionKind }[] = []
  for (const m of body.matchAll(SECTION_RE)) {
    const k = m[1] as SectionKind
    if (SECTION_KINDS.includes(k) && !seen.has(k)) {
      seen.add(k)
      out.push({ kind: k })
    }
  }
  return out
}
function toFormulaLight(f: FormulaShared): FormulaLight {
  return {
    id: f.id,
    subject: f.subject,
    domain: f.domain,
    topics: f.topics,
    level: f.level,
    difficulty: f.difficulty,
    latex: f.latex,
    status: f.status,
  }
}

function buildFormulaView(
  f: FormulaShared,
  lang: string,
  index: Map<string, string[]>,
): FormulaView {
  const textResult = resolveText(
    (l) => loadFormulaText(l, f.id),
    lang,
  )
  const sections = detectSections(textResult.value?.body ?? '')
  const exerciseIds = index.get(f.id) ?? []
  const exercises = exerciseIds.map((eid) =>
    buildExerciseView(getExercisesShared().get(eid)!, lang),
  )
  const resolveRefs = (ids: string[]): FormulaLight[] =>
    ids
      .map((rid) => getFormulasShared().get(rid))
      .filter((r): r is FormulaShared => !!r)
      .map(toFormulaLight)

  return {
    ...toFormulaLight(f),
    originYear: f.originYear,
    variants: f.variants,
    variables: f.variables,
    text: textResult.value,
    lang: textResult.lang,
    isFallback: textResult.isFallback,
    sections,
    body: textResult.value?.body ?? '',
    exercises,
    prerequisites: resolveRefs(f.prerequisites),
    related: resolveRefs(f.related),
    confusedWith: resolveRefs(f.confusedWith),
  }
}

function buildExerciseView(e: ExerciseShared, lang: string): ExerciseView {
  const textResult = resolveText(
    (l) => loadExerciseText(l, e.id),
    lang,
  )
  return {
    id: e.id,
    subject: e.subject,
    domain: e.domain,
    level: e.level,
    difficulty: e.difficulty,
    formulas: e.formulas,
    kind: e.kind,
    estimatedMinutes: e.estimatedMinutes,
    status: e.status,
    text: textResult.value,
    lang: textResult.lang,
    isFallback: textResult.isFallback,
  }
}

function isPublished(d: { status: string }): boolean {
  return d.status === 'published'
}

function isProd(): boolean {
  return (import.meta as { env?: { PROD?: boolean } }).env?.PROD === true
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

export function getFormulas(lang: string): FormulaView[] {
  const shared = getFormulasShared()
  const index = getExerciseIndex()
  const out: FormulaView[] = []
  for (const f of shared.values()) {
    if (isProd() && !isPublished(f)) continue
    out.push(buildFormulaView(f, lang, index))
  }
  return out
}

export function getFormula(lang: string, id: string): FormulaView | undefined {
  const f = getFormulasShared().get(id)
  if (!f) return undefined
  if (isProd() && !isPublished(f)) return undefined
  return buildFormulaView(f, lang, getExerciseIndex())
}

export function getExercises(lang: string): ExerciseView[] {
  const out: ExerciseView[] = []
  for (const e of getExercisesShared().values()) {
    if (isProd() && !isPublished(e)) continue
    out.push(buildExerciseView(e, lang))
  }
  return out
}

export function getExercise(
  lang: string,
  id: string,
): ExerciseView | undefined {
  const e = getExercisesShared().get(id)
  if (!e) return undefined
  if (isProd() && !isPublished(e)) return undefined
  return buildExerciseView(e, lang)
}