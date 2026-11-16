// Change le statut (draft / published) de formules ET de leurs exercices, en conservant les commentaires YAML.
// Usage :
//   node scripts/content-status.mjs published --all            publie tout
//   node scripts/content-status.mjs published thales pythagore publie ces formules (+ leurs exercices)
//   node scripts/content-status.mjs draft --all --dry          simule sans écrire
// Un exercice est modifié seulement si toutes les formules qu'il référence sont dans la sélection.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));
const [status, ...rest] = process.argv.slice(2);
const dry = rest.includes('--dry');
const all = rest.includes('--all');
const ids = rest.filter((a) => !a.startsWith('--'));

if (!['draft', 'published'].includes(status) || (!all && ids.length === 0)) {
  console.error('Usage : node scripts/content-status.mjs <draft|published> (--all | id1 id2 …) [--dry]');
  process.exit(1);
}

const files = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === '.yaml') : []);
const formulaIds = files(join(ROOT, 'formulas')).map((f) => basename(f, '.yaml'));
const selected = new Set(all ? formulaIds : ids);
for (const id of selected) if (!formulaIds.includes(id)) { console.error(`Formule inconnue : ${id}`); process.exit(1); }

function setStatus(path) {
  const src = readFileSync(path, 'utf8');
  if (!/^status: .*$/m.test(src)) { console.warn(`⚠ pas de champ status dans ${path}`); return false; }
  const out = src.replace(/^status: .*$/m, `status: ${status}`);
  if (out === src) return false;
  if (!dry) writeFileSync(path, out);
  return true;
}

let nf = 0, ne = 0;
for (const id of selected) if (setStatus(join(ROOT, 'formulas', `${id}.yaml`))) nf++;
for (const f of files(join(ROOT, 'exercises'))) {
  const p = join(ROOT, 'exercises', f);
  const refs = (YAML.parse(readFileSync(p, 'utf8')).formulas ?? []);
  if (refs.length && refs.every((r) => selected.has(r)) && setStatus(p)) ne++;
}
console.log(`${dry ? '[simulation] ' : ''}${nf} formule(s) et ${ne} exercice(s) passés en « ${status} ».`);
