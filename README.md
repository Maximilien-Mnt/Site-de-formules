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

## Workers Builds

### Build command
```bash
npm run build
```
Runs `node scripts/build-search-index.mjs && astro build` to generate the static site into `./dist`.

### Preview + development
```bash
npm run preview
```
Runs `npm run build && npx wrangler dev` — first builds the Astro site, then starts Cloudflare Workers development server with the static assets.

### Deploy command
```bash
npx wrangler deploy
```
Deploy the Workers static assets to Cloudflare. This is done from the Cloudflare dashboard or CLI. **Do not run `wrangler deploy` as part of the build pipeline unless explicitly needed — the user handles deployment from the Cloudflare dashboard.**

### Environment variables
The following environment variables are available for the Workers deployment:

| Variable | Description |
|---|---|
| `SITE_URL` | The base URL of the site (e.g., `https://formulo.example.com`). Used for generating correct sitemap URLs and relative paths. |
| `PUBLIC_CF_BEACON_TOKEN` | Cloudflare analytics beacon token. When set, enables usage analytics tracking via the Cloudflare beacon. |

These variables can be set in the Cloudflare Workers dashboard under **Settings > Variables**, or locally in a `.env` file (prefixed with `PUBLIC_` to expose them to the client).

### Custom domain functioning
Custom domains work with Cloudflare Workers static assets as follows:

1. **Domain registration**: Register or use an existing domain through Cloudflare or an external registrar.
2. **DNS configuration**: Add the domain (and `www` subdomain if desired) to the Cloudflare project.
3. **DNS records**: Cloudflare automatically configures the necessary DNS records (CNAME or A records) pointing to the Workers static asset endpoint.
4. **SSL/TLS**: Cloudflare provides automatic HTTPS with TLS certificates managed by Cloudflare. No additional certificate configuration is needed.
5. **Routing**: All requests to the custom domain are routed to the Workers static assets. The `assets.not_found_handling: "404-page"` setting in `wrangler.jsonc` ensures that unknown paths serve the custom 404 page rather than a generic Workers error.
6. **Full URL handling**: The `SITE_URL` environment variable ensures that links, sitemaps, and canonical URLs are generated with the correct custom domain.

For detailed setup, refer to the [Cloudflare Workers documentation on custom domains](https://developers.cloudflare.com/workers/platform/custom-domains/).

Ordre : copier ce dossier → ouvrir dans VS Code → Cline → `docs/PROMPTS.md` (P0, P1, P2…).
