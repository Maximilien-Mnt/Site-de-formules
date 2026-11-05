# Starter Formulo

Ce dossier se **copie par-dessus** un projet Astro vide (voir le guide pas à pas du plan). Il ne contient volontairement ni `package.json` ni pages : c'est Cline qui les crée, à partir des prompts de `docs/PROMPTS.md`.

| Élément | Rôle |
|---|---|
| `.clinerules/` | règles lues automatiquement par Cline à chaque tâche |
| `DESIGN.md` | design system complet (identité, couleurs, typo, composants, plans de pages) |
| `docs/ARCHITECTURE.md` | architecture, dossiers, flux de données, budgets de performance |
| `docs/ROADMAP.md` | phases et cases à cocher (tu y colles les fonctionnalités choisies) |
| `docs/CONTENT_GUIDE.md` | comment écrire/relire du contenu + prompts de contenu |
| `docs/PROMPTS.md` | la série de prompts pour Cline, avec le mode (Plan/Act) de chacun |
| `src/styles/tokens.css`, `tailwind-theme.css` | tokens de design (clair/sombre) et mapping Tailwind v4 |
| `src/data/taxonomy.ts` | matières, domaines, niveaux, sections |
| `src/content.config.ts` | schémas Zod des 4 collections de contenu |
| `src/content/` | contenu de départ : 4 formules (dont Pythagore = modèle de référence) + 5 exercices |
| `src/i18n/ui/fr.json` | toutes les chaînes d'interface (165 clés) |
| `scripts/check-content.mjs` | validation du contenu (références, sections, QCM) |
| `public/` | logo et favicon SVG |
| `wrangler.jsonc` | configuration Cloudflare Workers (static assets) |

Ordre : copier ce dossier → ouvrir dans VS Code → Cline → `docs/PROMPTS.md` (P0, P1, P2…).
