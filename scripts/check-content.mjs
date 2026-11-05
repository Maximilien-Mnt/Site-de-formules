// Valide la cohérence du contenu : références, textes manquants, sections, QCM.
// Usage : npm run check:content   (nécessite le paquet « yaml » en devDependency)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));
const LANGS = ['fr']; // ajouter les langues ici quand elles existent
const REF_LANG = 'fr'; // langue de référence : erreurs ; autres langues : avertissements
const SECTION_KINDS = ['intuition', 'explanation', 'proof', 'history', 'methods', 'applications', 'mistakes', 'further'];
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const issue = (lang) => (lang === REF_LANG ? err : warn);

const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === ext) : []);
const readYaml = (p) => YAML.parse(readFileSync(p, 'utf8')) ?? {};

function readFrontmatter(p) {
  const raw = readFileSync(p, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    err(`${p}: frontmatter manquant`);
    return { data: {}, body: raw };
  }
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

// --- Chargement ---
const formulas = new Map();
for (const f of list(join(ROOT, 'formulas'), '.yaml')) {
  const id = basename(f, '.yaml');
  if (!ID.test(id)) err(`formulas/${f}: identifiant invalide (kebab-case ASCII)`);
  formulas.set(id, readYaml(join(ROOT, 'formulas', f)));
}
const exercises = new Map();
for (const f of list(join(ROOT, 'exercises'), '.yaml')) {
  const id = basename(f, '.yaml');
  if (!ID.test(id)) err(`exercises/${f}: identifiant invalide (kebab-case ASCII)`);
  exercises.set(id, readYaml(join(ROOT, 'exercises', f)));
}

// --- Formules ---
for (const [id, d] of formulas) {
  for (const k of ['subject', 'domain', 'level', 'difficulty', 'latex', 'variables']) {
    if (d[k] === undefined) err(`formulas/${id}: champ requis manquant « ${k} »`);
  }
  if (!(d.level >= 1 && d.level <= 7)) err(`formulas/${id}: level doit être entre 1 et 7`);
  if (!(d.difficulty >= 1 && d.difficulty <= 5)) err(`formulas/${id}: difficulty doit être entre 1 et 5`);
  for (const k of ['prerequisites', 'related', 'confusedWith']) {
    for (const ref of d[k] ?? []) {
      if (ref === id) err(`formulas/${id}: ${k} contient la formule elle-même`);
      else if (!formulas.has(ref)) err(`formulas/${id}: ${k} → « ${ref} » n'existe pas`);
    }
  }
  const vids = (d.variants ?? []).map((v) => v.id);
  if (new Set(vids).size !== vids.length) err(`formulas/${id}: identifiants de variantes en double`);
  const symbols = (d.variables ?? []).map((v) => v.symbol);

  for (const lang of LANGS) {
    const p = join(ROOT, 'formula-texts', lang, `${id}.mdx`);
    if (!existsSync(p)) {
      issue(lang)(`formula-texts/${lang}/${id}.mdx manquant`);
      continue;
    }
    const { data, body } = readFrontmatter(p);
    const where = `formula-texts/${lang}/${id}.mdx`;
    if (!data.title) err(`${where}: title manquant`);
    if (!data.summary) err(`${where}: summary manquant`);
    for (const s of symbols) if (!data.variableNames?.[s]) warn(`${where}: variableNames sans « ${s} »`);
    for (const k of Object.keys(data.variableNames ?? {})) {
      if (!symbols.includes(k)) err(`${where}: variableNames « ${k} » absent de variables du fichier partagé`);
    }
    for (const v of d.variants ?? []) if (!data.variantLabels?.[v.id]) warn(`${where}: variantLabels sans « ${v.id} »`);
    const kinds = [...body.matchAll(/<Section\s+kind="([a-z]+)"/g)].map((m) => m[1]);
    for (const k of kinds) if (!SECTION_KINDS.includes(k)) err(`${where}: section inconnue « ${k} »`);
    if (!kinds.includes('explanation')) err(`${where}: section « explanation » obligatoire`);
    if (new Set(kinds).size !== kinds.length) err(`${where}: section dupliquée`);
  }
}

// --- Exercices ---
for (const [id, d] of exercises) {
  for (const k of ['subject', 'domain', 'level', 'difficulty', 'formulas', 'kind']) {
    if (d[k] === undefined) err(`exercises/${id}: champ requis manquant « ${k} »`);
  }
  for (const ref of d.formulas ?? []) if (!formulas.has(ref)) err(`exercises/${id}: formulas → « ${ref} » n'existe pas`);
  if (d.kind === 'numeric' && typeof d.answer?.value !== 'number') err(`exercises/${id}: answer.value numérique requis`);
  if (d.kind === 'qcm') {
    if (!Array.isArray(d.choices) || d.choices.length < 2) err(`exercises/${id}: au moins 2 choices`);
    for (const c of d.correct ?? []) if (!(d.choices ?? []).includes(c)) err(`exercises/${id}: correct « ${c} » absent de choices`);
    if (!d.correct?.length) err(`exercises/${id}: correct requis`);
  }
  if (!['numeric', 'qcm', 'open'].includes(d.kind)) err(`exercises/${id}: kind invalide « ${d.kind} »`);

  for (const lang of LANGS) {
    const p = join(ROOT, 'exercise-texts', lang, `${id}.yaml`);
    if (!existsSync(p)) {
      issue(lang)(`exercise-texts/${lang}/${id}.yaml manquant`);
      continue;
    }
    const t = readYaml(p);
    const where = `exercise-texts/${lang}/${id}.yaml`;
    for (const k of ['title', 'statement', 'solution']) if (!t[k]) err(`${where}: « ${k} » manquant`);
    if (d.kind === 'qcm') {
      for (const c of d.choices ?? []) if (!t.choices?.[c]) err(`${where}: libellé du choix « ${c} » manquant`);
    }
  }
}

// --- Textes orphelins ---
for (const lang of LANGS) {
  for (const f of list(join(ROOT, 'formula-texts', lang), '.mdx')) {
    if (!formulas.has(basename(f, '.mdx'))) err(`formula-texts/${lang}/${f}: aucune formule partagée correspondante`);
  }
  for (const f of list(join(ROOT, 'exercise-texts', lang), '.yaml')) {
    if (!exercises.has(basename(f, '.yaml'))) err(`exercise-texts/${lang}/${f}: aucun exercice partagé correspondant`);
  }
}

// --- Rapport ---
for (const w of warnings) console.warn(`⚠  ${w}`);
for (const e of errors) console.error(`✖  ${e}`);
console.log(`\n${formulas.size} formules, ${exercises.size} exercices — ${errors.length} erreur(s), ${warnings.length} avertissement(s).`);
process.exit(errors.length ? 1 : 0);
