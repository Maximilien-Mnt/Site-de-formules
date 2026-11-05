# Architecture

## Principes
1. **Statique d'abord** : tout le catalogue est généré au build (HTML + KaTeX), servi par le CDN Cloudflare. Pas de serveur, pas de base de données en v1.
2. **Le contenu est du code** : YAML + MDX versionnés dans Git → relecture par PR, validation automatique, aucune dépendance à un service.
3. **Interactif = îlots** : React uniquement pour filtres, exercices, fiches, graphes, palette. Chaque îlot est chargé à la demande (`client:visible` / `client:idle`).
4. **Local-first** : la progression vit dans le navigateur (localStorage, schéma versionné) avec export/import JSON. Pas de compte requis.
5. **i18n dès le départ** : données partagées vs textes localisés ; aucune chaîne en dur.
6. **Multi-matières** : `subject` + `domain` dans le modèle ; ajouter la physique = ajouter des valeurs de taxonomie + du contenu.

## Arborescence cible
```
src/
  components/
    ui/          composants Astro statiques (Button, Chip, Card, Callout, Section, LevelDots…)
    islands/     composants React interactifs (CatalogApp, ExercisePlayer, FlashcardSession, FunctionGraph, CommandPalette…)
    math/        FormulaDisplay (KaTeX au build)
  content/       formulas/ formula-texts/<lang>/ exercises/ exercise-texts/<lang>/
  data/          taxonomy.ts
  i18n/          config.ts  index.ts  ui/<lang>.json
  layouts/       BaseLayout.astro
  lib/           content.ts  md.ts  search-index.ts  progress.ts  srs.ts  exercise-check.ts  (+ *.test.ts)
  pages/         index.astro (→ /fr/)  <lang>/… fichiers fins qui appellent une vue
  views/         Home, FormulaCatalog, FormulaDetail, ExerciseCatalog, ExerciseDetail, Review, Progress, About, Legal, Privacy
  styles/        global.css  tokens.css  tailwind-theme.css
scripts/         check-content.mjs
```

## Routes (fr)
`/fr/` · `/fr/formules/` · `/fr/formules/<id>/` · `/fr/exercices/` · `/fr/exercices/<id>/` · `/fr/reviser/` · `/fr/reviser/fiches/` · `/fr/reviser/quiz/` · `/fr/progression/` · `/fr/a-propos/` · mentions légales · confidentialité · 404.
Les segments sont localisés via `routeSegments` (i18n/config.ts) ; les identifiants sont communs à toutes les langues.

## Flux de données
```
YAML/MDX ──(Content Layer + Zod)──► lib/content.ts ──► pages statiques (HTML, KaTeX)
                                         │
                                         ├──► /<lang>/search-index.json (MiniSearch : id, titre, aliases, mots-clés, domaine, niveau, flags)
                                         └──► props des îlots (catalogue, exercices, fiches)
Navigateur : nanostores (+persistent) ◄──► localStorage `formulo:progress:v1`
```
- **Index de recherche** : un JSON par langue, champs minimaux ; chargé par le catalogue et la palette.
- **Filtres** : état dans l'URL (`?q=&domain=&level=2-4&difficulty=&sort=`), logique pure dans `lib/` (testée).
- **Liens formule ↔ exercices** : calculés (index inversé) depuis `exercises[].formulas`.
- **Exercices** : correction côté client (`lib/exercise-check.ts`) ; textes Markdown rendus au build par `renderMd()`.
- **Fiches (FSRS)** : `ts-fsrs` ; une carte = (formule, sens) ; état stocké dans le store de progression.

## Budgets de performance (à tenir)
- Page de formule : ≤ 30 ko de JS (hors graphe) ; page statique par défaut sans îlot bloquant.
- Catalogue : JS ≤ 90 ko gzip, index de recherche ≤ 150 ko gzip par langue pour ~1 000 formules.
- Graphes (mathjs + tracé) chargés uniquement sur les pages concernées, à l'entrée dans le viewport.
- LCP < 2,0 s sur mobile milieu de gamme ; CLS < 0,05 ; polices variables auto-hébergées, `font-display: swap`.

## Évolutions prévues (hors v1)
- Comptes et synchronisation : Supabase (auth + table de progression), derrière une interface `ProgressStorage` (local par défaut) pour ne pas réécrire l'UI.
- Nouvelles langues : fichier d'UI + dossiers de textes ; aucun changement de code attendu.
- Nouvelle matière : valeurs de taxonomie + contenu ; couleur `--subject-*`.
