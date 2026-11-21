import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import YAML from 'yaml'
import { fileURLToPath } from 'node:url'

// Génère l'index de recherche du catalogue (un JSON par langue) à partir des collections.
// Écrit dans public/search/<lang>/index.json pour être fetché par l'îlot CatalogApp.
// Usage : node scripts/build-search-index.mjs   (à lancer avant `astro build`)

const ROOT = fileURLToPath(new URL('../src/content', import.meta.url))
const PUBLIC = fileURLToPath(new URL('../public', import.meta.url))
const LANG = 'fr'

const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === ext) : [])
const readYaml = (p) => YAML.parse(readFileSync(p, 'utf8')) ?? {}

function readFrontmatter(p) {
  const raw = readFileSync(p, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] }
}

// Données partagées (indépendantes de la langue)
const formulas = {}
for (const f of list(join(ROOT, 'formulas'), '.yaml')) {
  const id = basename(f, '.yaml')
  formulas[id] = readYaml(join(ROOT, 'formulas', f))
}

// Index inversé : id de formule -> ids d'exercices qui y font référence.
const exercises = {}
for (const f of list(join(ROOT, 'exercises'), '.yaml')) {
  const e = readYaml(join(ROOT, 'exercises', f))
  for (const fid of e.formulas ?? []) {
    ;(exercises[fid] ??= []).push(e.id)
  }
}

const index = []
for (const [id, d] of Object.entries(formulas)) {
  if (d.status !== 'published') continue

  const textPath = join(ROOT, 'formula-texts', LANG, `${id}.mdx`)
  let title = id
  let summary = ''
  let keywords = []
  let aliases = []
  let hasProof = false
  let hasHistory = false

  if (existsSync(textPath)) {
    const { data, body } = readFrontmatter(textPath)
    title = data.title ?? id
    summary = data.summary ?? ''
    keywords = data.keywords ?? []
    aliases = data.aliases ?? []
    hasProof = /<Section\s+kind="proof"/.test(body)
    hasHistory = /<Section\s+kind="history"/.test(body)
  }

  index.push({
    id,
    title,
    summary,
    keywords,
    aliases,
    subject: d.subject,
    domain: d.domain,
    level: d.level,
    difficulty: d.difficulty,
    topics: d.topics ?? [],
    latex: d.latex,
    originYear: d.originYear === undefined ? undefined : d.originYear,
    graph: !!d.graph,
    hasProof,
    hasHistory,
    hasExercises: (exercises[id] ?? []).length > 0,
    url: `/${LANG}/formules/${id}/`,
  })
}

index.sort((a, b) => a.title.localeCompare(b.title, 'fr'))

const outDir = join(PUBLIC, 'search', LANG)
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'index.json'), JSON.stringify(index, null, 2))

console.log(`${index.length} formules indexées dans public/search/${LANG}/index.json`)