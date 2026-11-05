# Formulo — Plan complet du projet

*Site d'apprentissage et de révision de formules · nom de travail « Formulo » · version du 5 novembre 2026*

Ce document est le plan maître. Les fichiers prêts à l'emploi sont dans l'archive `formulo-starter.zip` (règles Cline, design system complet, tokens, schémas, contenu de départ, prompts). Ici : les décisions, la stack, les fonctionnalités à choisir, et tout ce que **toi** tu dois faire, pas à pas.

## 1. Vision en bref

Un site public, sans compte, où l'on **comprend** (intuition, explication, démonstration, histoire, graphiques), **s'exerce** (catalogue d'exercices lié aux formules) et **retient** (fiches à répétition espacée, quiz, suivi de progression). Mathématiques d'abord, du début du primaire à l'université ; physique, chimie et d'autres langues ensuite, sans refonte.

## 2. Décisions clés (et pourquoi)

| Sujet | Décision | Raison |
| --- | --- | --- |
| Type de site | Site **statique** généré au build | Rapide, gratuit à héberger, excellent pour le SEO (une page par formule), très simple pour une IA à maintenir |
| Contenu | Fichiers **YAML + MDX dans Git**, pas de base de données | Relisible, versionné, validable par script, facile à générer par lots, traduisible |
| Données partagées vs textes | Un fichier de **données** par formule (niveau, LaTeX, variables, liens) + un **texte par langue** | Ajouter l'anglais = ajouter des textes, sans toucher au code ni dupliquer les formules |
| Progression des visiteurs | **Locale** (navigateur) + export/import JSON | Pas d'authentification requise, pas de données personnelles (public potentiellement mineur) |
| Comptes / backend | **Reportés** (Supabase prévu en phase 2 derrière une interface de stockage) | Tu as déjà 2 projets Supabase : inutile d'en consommer un pour la v1 |
| Hébergement | **Cloudflare Workers** (fichiers statiques) | Cloudflare recommande Workers pour les nouveaux projets ; les fichiers statiques sont servis gratuitement ; déploiement à chaque push GitHub |
| Mesure d'audience | **Cloudflare Web Analytics** (sans cookie) | Pas de bandeau cookies ; PostHog reste possible plus tard |
| Niveaux | Échelle **neutre de 1 à 7** + équivalents affichés par langue | Évite de lier le modèle à un système scolaire (français aujourd'hui, autres demain) |
| IA de code | Cline, **prompts petits, un par tâche**, modes Plan/Act explicites | Les modèles gratuits ont un contexte limité et un quota qui tourne |

## 3. Stack définitive

| Couche | Choix | Rôle |
| --- | --- | --- |
| Framework | **Astro** (sortie statique) + TypeScript strict | Pages, routage, i18n, collections de contenu validées |
| Contenu | **MDX** + YAML, schémas Zod | Textes riches avec composants (`Section`, `Callout`) |
| Interactivité | **React** en îlots (`client:visible`) | Filtres, exercices, fiches, graphes, palette de recherche |
| Style | **Tailwind CSS** + tokens CSS (clair/sombre) | Design system appliqué par noms de classes |
| Maths | **KaTeX** (au build) + remark-math / rehype-katex | Formules nettes, sans JavaScript pour le contenu statique |
| Graphiques | **Mafs** (repli : JSXGraph) + **mathjs** | Courbes à curseurs, triangle rectangle, cercle unité |
| Recherche | **MiniSearch** (index JSON par langue) | Recherche sans accents, préfixes, pondération |
| État | **nanostores** + persistance localStorage | Partage d'état entre îlots, progression locale |
| Révision | **ts-fsrs** | Algorithme de répétition espacée FSRS |
| Icônes / polices | Lucide (astro-icon) · Source Serif 4, Inter, JetBrains Mono (auto-hébergées) | Cohérence, RGPD (pas de Google Fonts) |
| Qualité | Vitest, ESLint, Prettier, `astro check`, script `check:content` | Détecter vite les erreurs de code **et de contenu** |
| Hébergement | Cloudflare Workers (static assets) via Workers Builds | Build et déploiement automatiques depuis GitHub |

## 4. Modèle de contenu

| Collection | Fichier | Contient |
| --- | --- | --- |
| `formulas` | `src/content/formulas/<id>.yaml` | matière, domaine, niveau 1–7, difficulté 1–5, LaTeX, variantes, variables, prérequis, formules liées, « ne pas confondre », année d'origine, graphique |
| `formulaTexts` | `src/content/formula-texts/<langue>/<id>.mdx` | titre, résumé, alias, mots-clés, noms des variables, puis sections : intuition, explication, démonstration, histoire, méthodes, applications, erreurs fréquentes, pour aller plus loin |
| `exercises` | `src/content/exercises/<id>.yaml` | type (calcul, QCM, ouvert), niveau, difficulté, formules liées, réponse attendue |
| `exerciseTexts` | `src/content/exercise-texts/<langue>/<id>.yaml` | titre, énoncé, choix, indices progressifs, solution |

Les liens formule ↔ exercices sont **calculés** à partir des exercices (source unique) : pas de liens à maintenir des deux côtés. Chaque fiche « formule » affiche automatiquement ses exercices, et chaque exercice ses formules.

## 5. Identité et design (résumé — détail complet dans `DESIGN.md`)

- **Promesse** : « Comprends, retiens, maîtrise chaque formule. » **Personnalité** : calme, précis, chaleureux ; un cahier de maths bien tenu.
- **Nom de travail** : Formulo (à vérifier : domaine, marque). Il ne vit qu'à deux endroits (fichier de textes + logo) : changer de nom est trivial.
- **Logo** : carré arrondi bleu avec un radical « √ » blanc tracé d'un seul trait ; logotype en serif.
- **Couleurs** : neutres chauds « papier » (`#FAFAF8`), **bleu encre** `#2347D9` pour les actions, **jaune surligneur** `#F5B700` en accent rare ; mode sombre complet ; contrastes ≥ 4.5:1.
- **Typographie** : Source Serif 4 (titres et lecture, en harmonie avec les formules KaTeX), Inter (interface), JetBrains Mono (code).
- **Forme** : rayons 6/10/16 px, bordures fines plutôt qu'ombres, aucun dégradé.
- **Mouvement** : 120/200/320 ms, cinq animations signatures sobres (révélation des termes d'une formule, survol de carte, retournement de fiche, anneau de progression, fondu de page), toutes coupées par `prefers-reduced-motion`.
- **Pages** : accueil (hero avec « formule vivante », par niveau, par domaine, formule du jour), catalogue (filtres à gauche, résultats en grille, état dans l'URL), détail de formule (formule vedette + variantes + légende, contenu à 68 caractères de large, rail collant avec sommaire, exercices et formules liées), exercice, hub de révision, progression.
- **Voix** : tutoiement, phrases courtes, zéro emoji, encourageant (« Essaie encore », jamais « Raté »).

## 6. Fonctionnalités

### 6.1 Incluses dans la v1

Catalogue de formules avec recherche, filtres (matière, domaine, niveau, difficulté, contenu, avancement) et tris · pages de détail complètes · graphiques interactifs · catalogue d'exercices lié · fiches à répétition espacée (R1) · quiz (R2) · progression locale avec export/import · palette de recherche Ctrl+K (N1) · mode sombre (X1) · impression soignée (X4) · SEO et accessibilité · i18n prête.

### 6.2 Menu à choisir (effort : S < 1 prompt, M = 2–4, L = 5+ ; valeur sur 5)

**Révision**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| R3 | Exercices **paramétrés illimités** (nombres tirés au hasard, correction automatique) | L | 5 |
| R4 | « **Complète la formule** » : termes masqués à retrouver | M | 4 |
| R5 | Jeu d'association nom ↔ formule | S | 3 |
| R6 | Sprint chronométré de 60 secondes | S | 3 |
| R7 | **Examen blanc** par niveau ou chapitre (sans aide, note finale) | M | 4 |
| R8 | **Parcours guidés** (programme d'une classe, d'un examen, d'un semestre) | L | 5 |
| R9 | **Carnet d'erreurs** : exercices ratés reproposés automatiquement | M | 4 |
| R10 | **Fiche-résumé imprimable / PDF** de ses formules (« anti-sèche » personnalisée) | M | 4 |
| R11 | Export Anki (CSV) | S | 3 |
| R12 | Démonstrations pas à pas à révéler | M | 3 |
| R13 | « Ne pas confondre » : quiz sur les paires de formules qu'on mélange | M | 4 |
| R14 | Défi du jour + série (streak) | S | 3 |
| R15 | Astuces mnémotechniques par formule | S | 3 |

**Navigation et découverte**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| N2 | **Carte des prérequis** : graphe interactif de dépendances entre formules | L | 5 |
| N3 | Frise chronologique de l'histoire des formules | M | 3 |
| N4 | Recherche par symbole (taper ∑, √, ∫…) | M | 3 |
| N5 | « À voir ensuite » : recommandations selon ce qui est maîtrisé | S | 3 |
| N6 | Favoris et listes personnelles | S | 3 |
| N7 | Glossaire des symboles et notations | M | 3 |

**Contenu enrichi**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| E1 | Animations vidéo de démonstrations (type Manim) | L | 3 |
| E2 | Démonstrations visuelles interactives (« preuves sans mots ») | L | 4 |
| E3 | Collections par programme ou examen (Brevet, Bac, SAT, A-level…) | M | 4 |
| E4 | Version anglaise | L | 4 |
| E5 | Extension physique / chimie | L | 4 |

**Outils**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| T1 | **Calculatrice de formule** : on saisit les variables, on obtient le résultat et les étapes | M | 5 |
| T2 | Convertisseur d'unités | S | 3 |
| T3 | Grapheur libre | M | 3 |
| T4 | Constantes usuelles (π, e, g…) | S | 2 |

**Confort et partage**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| X2 | **PWA / hors-ligne** (réviser sans réseau) | M | 4 |
| X3 | Accessibilité renforcée : police Atkinson Hyperlegible, taille de texte réglable, contraste élevé | M | 4 |
| X5 | Partager une formule (lien + image de carte) | M | 3 |
| X6 | Mode focus de lecture | S | 2 |

**Plateforme**

| ID | Fonctionnalité | Effort | Valeur |
| --- | --- | --- | --- |
| P1 | Comptes + synchronisation entre appareils (Supabase) | L | 4 |
| P2 | **« Signaler une erreur »** (lien GitHub pré-rempli sur chaque page) | S | 5 |
| P3 | Mode enseignant : feuilles d'exercices imprimables, paquets partageables | L | 4 |
| P4 | Tuteur IA (explique une étape, vérifie un raisonnement) — coût et modération à prévoir | L | 3 |
| P5 | Contributions communautaires (guide + pull requests) | M | 3 |
| P6 | Analytics produit PostHog (nécessite un consentement) | S | 2 |

**Ma sélection si je devais choisir pour une v1.1** : P2, R9, R4, R3, T1, N2, X2, R8. Elles transforment le site de « bibliothèque » en « entraîneur », avec des effets forts pour un effort raisonnable. Une fois tes choix faits, colle les identifiants dans la Phase 5 de `docs/ROADMAP.md` et demande à Cline (mode Plan) de les découper.

## 7. Autres chantiers pour le site

| Chantier | Contenu | Quand |
| --- | --- | --- |
| SEO | Une page statique par formule, titres et descriptions en français, sitemap, JSON-LD, hreflang | Prompt P14 |
| Accessibilité | WCAG 2.2 AA : clavier, focus, contrastes, MathML de KaTeX, réduction des animations | Dès P4, audit P14 |
| Performance | Budgets définis dans `docs/ARCHITECTURE.md` (JS par page, LCP < 2 s) | P14 |
| Pages légales | À propos, mentions légales, confidentialité (aucune donnée personnelle ; stockage local ; audience sans cookie) | P14 — à compléter par toi |
| Qualité du contenu | Script `check:content` + checklist de publication + relecture critique en deux passes | Continu |
| Sécurité | En-têtes HTTP (CSP, etc.) via un fichier `_headers` ; aucune donnée sensible côté site | P14 |
| Intégration continue | GitHub Actions : `npm run check` + `npm run build` sur chaque pull request | Après P15 |
| Retour des utilisateurs | Bouton « Signaler une erreur » (P2) | Dès que possible |
| Licence | Choisir celle du contenu (par exemple CC BY-SA 4.0) et celle du code | Avant la publication |
| Sauvegarde | Git = historique complet du code **et** du contenu | Automatique |

## 8. Ce que tu dois faire — pas à pas

### A. Installer les outils (une fois)

1. **Node.js** : installe la dernière version LTS (nodejs.org). Vérifie : `node -v` et `npm -v` dans un terminal.
2. **Git** : git-scm.com. Vérifie : `git --version`. Configure ton nom : `git config --global user.name "Ton Nom"` et `git config --global user.email "ton@email"`.
3. **VS Code** (code.visualstudio.com), puis l'extension **Cline** (onglet Extensions, recherche « Cline »).

### B. Créer le dépôt GitHub

1. Sur github.com : **New repository**, nom `formulo`, **sans** README ni .gitignore (vide), public ou privé (privé au début est très bien).
2. Garde l'URL du dépôt (`https://github.com/<toi>/formulo.git`).

### C. Créer le projet Astro vide

1. Dans un terminal, dans le dossier où tu ranges tes projets : `npm create astro@latest formulo`.
2. Réponses : modèle **Empty / minimal**, TypeScript **Strict**, installer les dépendances **oui**, initialiser Git **oui**.
3. `cd formulo` puis `git remote add origin <URL du dépôt>` et `git branch -M main`.

### D. Copier le starter

1. Dézippe `formulo-starter.zip`.
2. Copie **tout le contenu** du dossier `formulo-starter` (y compris `.clinerules`, dossier caché) dans le dossier `formulo` ; accepte la fusion.
3. Commit et envoi : `git add -A`, `git commit -m "chore: starter"`, `git push -u origin main`.

### E. Configurer Cline

1. Ouvre le dossier `formulo` dans VS Code, puis le panneau Cline.
2. Connecte-toi avec un compte Cline. Fournisseur : **Cline** ; dans la liste des modèles, choisis un modèle portant l'étiquette **FREE**. Les modèles gratuits tournent régulièrement et ont un quota ; Cline indique l'heure de remise à zéro quand il est atteint. Les données d'usage des modèles gratuits peuvent servir à les améliorer : sans conséquence ici puisque le code sera public, mais évite d'y coller des informations personnelles.
3. Au début, laisse l'approbation **manuelle** des commandes et des modifications.
4. Vérifie que Cline voit les règles du projet (`.clinerules`). **Plan / Act** : la bascule est en bas du panneau ; chaque prompt indique quel mode utiliser.

### F. Travailler avec les prompts

1. Ouvre `docs/PROMPTS.md` et suis l'ordre : P0 (Plan), P1, P2, P3, P4…
2. Pour chaque prompt : **nouvelle tâche** Cline → bon mode → colle le prompt → relis ce que fait Cline → `npm run dev` pour regarder → `npm run check` et `npm run build` doivent passer → commit.
3. Si le modèle s'égare deux fois : nouvelle tâche avec la moitié du prompt, ou autre modèle FREE.

### G. Premier déploiement Cloudflare (après P4, quand `npm run build` passe)

1. `git push` ton travail.
2. Dashboard Cloudflare → **Workers & Pages** → **Create** → importer un dépôt Git (Workers Builds) → autorise GitHub → choisis `formulo`.
3. Commande de build : `npm run build`. Commande de déploiement : `npx wrangler deploy`. Enregistre et déploie.
4. Tu obtiens une adresse en `*.workers.dev`. Ensuite, chaque `git push` sur `main` redéploie.
5. Dans les variables de build, ajoute `SITE_URL` avec l'adresse finale (à mettre à jour quand tu auras un domaine).
6. Les intitulés du dashboard évoluent : si tu ne trouves pas un menu, cherche « Workers Builds » dans la documentation Cloudflare.

### H. Mesure d'audience sans cookie (après P14)

1. Dashboard → **Web Analytics** → ajoute ton site (nom d'hôte) → copie le **jeton** du snippet.
2. Ajoute-le en variable de build `PUBLIC_CF_BEACON_TOKEN`, puis redéploie. Sans variable, rien n'est chargé.

### I. Nom, domaine, légal

1. Valide le nom (Formulo ou autre) : disponibilité du domaine, des comptes de réseaux sociaux, et recherche rapide de marques existantes (base TMview de l'EUIPO).
2. Achète le domaine (le registrar de Cloudflare vend au prix coûtant ; vérifie le prix à l'achat), puis dans ton Worker : **Settings → Domains & Routes → Add → Custom domain**. Mets à jour `SITE_URL`.
3. Complète les pages « Mentions légales » et « Confidentialité » (marquées \[À COMPLÉTER\]). Vérifie les obligations d'éditeur de site au Luxembourg et dans l'UE ; ceci n'est pas un avis juridique.

### J. Produire et relire le contenu (en continu)

1. Utilise les prompts C1 à C5 de `docs/CONTENT_GUIDE.md` (chacun indique son mode).
2. **Toujours** : contenu en `status: draft` → relecture critique (C3, idéalement avec un autre modèle) → vérification à la main des calculs et des dates → `published`.
3. Tu peux aussi me demander ici d'écrire ou de relire des lots de formules et d'exercices, avec un niveau de fiabilité supérieur à celui des modèles gratuits.
4. Fais relire un échantillon par un enseignant ou un camarade avant le lancement public.

### K. Plus tard (pas nécessaire en v1)

Supabase et PostHog : tu as déjà 2 projets Supabase et 1 projet PostHog. Avant d'en créer un nouveau, vérifie les limites de ton offre gratuite ; sinon, réutilise un projet existant avec un schéma ou un espace dédié.

## 9. Contenu de l'archive `formulo-starter.zip`

| Fichier / dossier | À quoi il sert |
| --- | --- |
| `.clinerules/` (5 fichiers) | Contexte, stack, conventions, modèle de contenu, i18n, règles de design : lus par Cline à chaque tâche |
| `DESIGN.md` | Design system complet : identité, couleurs, typographie, espacement, composants, plans de pages |
| `docs/ARCHITECTURE.md` | Architecture, flux de données, budgets de performance |
| `docs/ROADMAP.md` | Phases et cases à cocher |
| `docs/CONTENT_GUIDE.md` | Guide de contenu + prompts C1 à C5 |
| `docs/PROMPTS.md` | Prompts P0 à P16 avec le mode de chacun |
| `src/styles/tokens.css`, `tailwind-theme.css` | Tokens clair/sombre et mapping Tailwind v4 |
| `src/data/taxonomy.ts`, `src/content.config.ts` | Matières, domaines, niveaux ; schémas Zod des 4 collections |
| `src/content/` | 4 formules (Pythagore = modèle de référence complet) et 5 exercices, validés par le script |
| `src/i18n/ui/fr.json` | 165 chaînes d'interface |
| `scripts/check-content.mjs` | Validation du contenu (testé : détecte les références cassées) |
| `public/` | Logo et favicon SVG |
| `wrangler.jsonc` | Configuration Cloudflare Workers |

Non fournis volontairement : `package.json` et pages. Ils sont créés par Astro (étape C) et par les prompts. Le fichier `content.config.ts` est un brouillon : le prompt P3 l'adapte à la version d'Astro installée (par exemple l'import de `z`).

## 10. Série de prompts (texte complet dans `docs/PROMPTS.md`)

| Prompt | Mode | Objectif |
| --- | --- | --- |
| P0 | **Plan** | Audit du starter, questions |
| P1 | **Act** | Setup technique : intégrations, dépendances, polices, scripts |
| P2 | **Act** | Fondation i18n et layout de base |
| P3 | **Act** | Couche de contenu : requêtes, index inversé, rendu Markdown |
| P4 | **Act** | Layout complet et composants du design system |
| P5 | **Act** | Page d'accueil |
| P6a / P6b | **Plan** puis **Act** | Catalogue de formules : architecture, puis implémentation |
| P7 | **Act** | Page de détail d'une formule |
| P8 | **Act** | Graphiques interactifs |
| P9 | **Act** | Catalogue d'exercices et lecteur d'exercice |
| P10 | **Act** | Progression locale, export/import, page de progression |
| P11a / P11b | **Plan** puis **Act** | Fiches à répétition espacée |
| P12 | **Act** | Quiz |
| P13 | **Act** | Palette de recherche globale |
| P14 | **Act** | SEO, accessibilité, performance, pages légales, audience |
| P15 | **Act** | Préparation du déploiement |
| P16 | **Plan** | Audit global et plan de la suite |
| C1 à C5 | Plan / Act | Production de contenu (formules, exercices, relecture) |

## 11. Roadmap

| Phase | Contenu | Jalon |
| --- | --- | --- |
| 0 | Préparation (étapes A à E) | Starter dans le dépôt, Cline prêt |
| 1 | P0 à P8 | Site navigable : accueil, catalogue filtrable, pages de formules avec graphiques, déployé |
| 2 | P9 à P13 | Exercices, progression, fiches, quiz, recherche globale |
| 3 | P14 à P16 | Qualité, légal, déploiement final, audit |
| 4 | Contenu en continu | 100 formules (niveaux 1–7) et 100 exercices avant un lancement large |
| 5 | Fonctionnalités choisies (section 6.2) | v1.1 |

« Un bon stade » = fin de la phase 2 : un site complet, utilisable pour réviser, avec un contenu de départ à étoffer.

## 12. Risques et garde-fous

| Risque | Garde-fou |
| --- | --- |
| Erreurs mathématiques ou historiques dans le contenu généré par IA | `draft` par défaut, relecture critique en deux passes, vérification manuelle des exemples, formulations prudentes en histoire, retour utilisateur (P2) |
| Modèles gratuits instables ou limités | Prompts courts, tâches séparées, commits fréquents, possibilité de changer de modèle, règles dans `.clinerules` |
| Dérive de design | Tokens uniquement, page `/fr/design` de contrôle, `DESIGN.md` comme source de vérité |
| Données de jeunes utilisateurs | Aucun compte, aucune donnée personnelle, stockage local, audience sans cookie |
| Dépendances qui évoluent (Astro, Tailwind, Mafs) | Prompts qui demandent d'adapter à la version installée ; repli JSXGraph prévu ; pas d'ajout sans validation |
| Quotas des offres gratuites | Architecture statique (peu de requêtes dynamiques) ; vérifie les limites dans les dashboards avant d'ajouter des services |
| Dette de traduction | Contenu séparé de l'interface, repli automatique sur le français avec bandeau |

## 13. Décisions à prendre

| Décision | Ma suggestion |
| --- | --- |
| Nom définitif | Garder « Formulo » le temps du développement, vérifier domaine et marque avant le lancement |
| Première langue ajoutée | Anglais (portée maximale, utile pour tes projets) |
| Dépôt | Privé pendant le développement, public au lancement si tu veux des contributions |
| Licence du contenu | CC BY-SA 4.0 |
| Fonctionnalités | Valider ou modifier la sélection de la section 6.2 |
| Relecture du contenu | Désigner un relecteur (enseignant, camarade) pour un échantillon |
| Premier lot de contenu | Niveaux 3 et 4, domaines géométrie et algèbre |
