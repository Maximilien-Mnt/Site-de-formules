// Audit approfondi du contenu. Complète scripts/check-content.mjs (qui vérifie les références et la structure).
// Vérifie : LaTeX valide (KaTeX), pièges MDX, niveaux des prérequis, cycles, nombre d'exercices par formule,
// libellés i18n des topics, cohérence des statuts, typographie française de base.
// Usage : npm run audit:content   (nécessite katex et yaml, déjà dans le projet)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import katex from 'katex';

const ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));
const UI = fileURLToPath(new URL('../src/i18n/ui/fr.json', import.meta.url));
const LANGS = ['fr'];
const MIN_EXERCISES = 2;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === ext) : []);
const readYaml = (p) => YAML.parse(readFileSync(p, 'utf8')) ?? {};

// --- LaTeX ---------------------------------------------------------------
function checkTex(tex, display, where) {
  try {
    katex.renderToString(tex, { throwOnError: true, displayMode: display, strict: 'ignore' });
  } catch (e) {
    err(`${where}: LaTeX invalide « ${tex.slice(0, 60)} » → ${String(e.message).split('\n')[0]}`);
  }
}

// Retire les maths d'un texte et les vérifie au passage. Renvoie le texte sans maths.
function stripAndCheckMath(text, where) {
  let rest = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    checkTex(tex, true, where);
    return '¤';
  });
  rest = rest.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    checkTex(tex, false, where);
    return '¤';
  });
  if (rest.includes('$')) err(`${where}: « $ » orphelin (formule mal fermée ?)`);
  return rest;
}

function collectStrings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectStrings(x, out));
  return out;
}

function checkTypography(rest, where) {
  if (/\d\.\d/.test(rest)) warn(`${where}: point décimal dans le texte (utiliser la virgule : 3,14)`);
  if (/ ,|\( | \)/.test(rest)) warn(`${where}: espace mal placée avant une virgule ou autour d'une parenthèse`);
}

// --- Chargement ------------------------------------------------------------
const formulas = new Map();
for (const f of list(join(ROOT, 'formulas'), '.yaml')) formulas.set(basename(f, '.yaml'), readYaml(join(ROOT, 'formulas', f)));
const exercises = new Map();
for (const f of list(join(ROOT, 'exercises'), '.yaml')) exercises.set(basename(f, '.yaml'), readYaml(join(ROOT, 'exercises', f)));
const ui = existsSync(UI) ? JSON.parse(readFileSync(UI, 'utf8')) : {};

// --- Formules --------------------------------------------------------------
const exercisesOf = new Map([...formulas.keys()].map((id) => [id, []]));
for (const [eid, e] of exercises) for (const fid of e.formulas ?? []) exercisesOf.get(fid)?.push(eid);

const usedTopics = new Set();
for (const [id, d] of formulas) {
  const w = `formulas/${id}`;
  checkTex(d.latex ?? '', true, `${w}: latex`);
  for (const v of d.variants ?? []) checkTex(v.latex ?? '', true, `${w}: variante « ${v.id} »`);
  for (const t of d.topics ?? []) {
    usedTopics.add(t);
    if (!ui[`topic.${t}`]) err(`${w}: topic « ${t} » sans libellé « topic.${t} » dans src/i18n/ui/fr.json`);
  }
  if (!ui[`domain.${d.domain}`]) err(`${w}: domaine « ${d.domain} » sans libellé i18n`);
  for (const p of d.prerequisites ?? []) {
    const pd = formulas.get(p);
    if (pd && pd.level > d.level) warn(`${w}: le prérequis « ${p} » (niveau ${pd.level}) est plus avancé que la formule (niveau ${d.level})`);
  }
  const n = exercisesOf.get(id).length;
  if (n < MIN_EXERCISES) (d.status === 'published' ? err : warn)(`${w}: ${n} exercice(s) lié(s) (minimum ${MIN_EXERCISES})`);
  if (d.status === 'published') {
    for (const eid of exercisesOf.get(id)) {
      if (exercises.get(eid).status !== 'published') warn(`${w}: publiée mais l'exercice « ${eid} » est encore en draft`);
    }
  }

  for (const lang of LANGS) {
    const p = join(ROOT, 'formula-texts', lang, `${id}.mdx`);
    if (!existsSync(p)) continue;
    const where = `formula-texts/${lang}/${id}.mdx`;
    const raw = readFileSync(p, 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) continue;
    const fm = YAML.parse(m[1]) ?? {};
    if ((fm.summary ?? '').length > 220) err(`${where}: summary > 220 caractères (${fm.summary.length})`);
    for (const key of ['aliases', 'keywords']) {
      for (const item of fm[key] ?? []) {
        if (typeof item !== 'string') err(`${where}: ${key} contient « ${item} » qui n'est pas du texte (une virgule dans un élément ? mets-le entre apostrophes)`);
      }
    }
    const rest = stripAndCheckMath(m[2], where);
    for (const s of collectStrings(fm)) stripAndCheckMath(s, `${where} (frontmatter)`);
    // Pièges MDX : balise ou accolade brute hors maths
    const noTags = rest.replace(/<\/?(Section|Callout)\b[^>]*>/g, ' ');
    if (/<[^\s]|<\s/.test(noTags) || /(?<!\\)\{/.test(noTags)) err(`${where}: « < » ou « { » brut hors formule (écrire &lt; ou \\{)`);
    checkTypography(noTags, where);
    const kinds = [...m[2].matchAll(/<Section\s+kind="([a-z]+)"/g)].map((x) => x[1]);
    if (!kinds.includes('mistakes')) warn(`${where}: section « mistakes » absente`);
    if (kinds.length < 4) warn(`${where}: seulement ${kinds.length} sections`);
  }
}

// --- Exercices -------------------------------------------------------------
for (const [id, e] of exercises) {
  for (const fid of e.formulas ?? []) {
    const fd = formulas.get(fid);
    if (fd && e.status === 'published' && fd.status !== 'published') warn(`exercises/${id}: publié mais la formule « ${fid} » est en draft`);
  }
  if (e.kind === 'numeric' && e.answer?.tolerance === undefined) warn(`exercises/${id}: tolerance absente (0 par défaut)`);
  for (const lang of LANGS) {
    const p = join(ROOT, 'exercise-texts', lang, `${id}.yaml`);
    if (!existsSync(p)) continue;
    const t = readYaml(p);
    const where = `exercise-texts/${lang}/${id}.yaml`;
    if (!t.hints?.length) warn(`${where}: aucun indice`);
    for (const s of collectStrings(t)) checkTypography(stripAndCheckMath(s, where), where);
  }
}

// --- Cycles de prérequis -----------------------------------------------------
const state = new Map();
function visit(id, path) {
  if (state.get(id) === 2) return;
  if (state.get(id) === 1) return err(`prérequis : cycle ${[...path, id].join(' → ')}`);
  state.set(id, 1);
  for (const p of formulas.get(id)?.prerequisites ?? []) if (formulas.has(p)) visit(p, [...path, id]);
  state.set(id, 2);
}
for (const id of formulas.keys()) visit(id, []);

// --- Rapport ---------------------------------------------------------------
const by = (key) => {
  const c = {};
  for (const d of formulas.values()) c[d[key]] = (c[d[key]] ?? 0) + 1;
  return Object.entries(c).sort(([a], [b]) => String(a).localeCompare(String(b), 'fr', { numeric: true })).map(([k, v]) => `${k}:${v}`).join('  ');
};
for (const w of warnings) console.warn(`⚠  ${w}`);
for (const e of errors) console.error(`✖  ${e}`);
console.log(`\n${formulas.size} formules · ${exercises.size} exercices · ${usedTopics.size} topics`);
console.log(`Par niveau : ${by('level')}`);
console.log(`Par domaine : ${by('domain')}`);
console.log(`Par statut : ${by('status')}`);
console.log(`${errors.length} erreur(s), ${warnings.length} avertissement(s).`);
process.exit(errors.length ? 1 : 0);
