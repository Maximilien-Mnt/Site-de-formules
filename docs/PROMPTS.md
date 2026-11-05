# Prompts pour Cline

## Mode d'emploi
- **Mode Plan** : Cline réfléchit, lit les fichiers, discute, mais ne modifie rien. **Mode Act** : Cline écrit, exécute des commandes, modifie. Chaque prompt ci-dessous indique le mode à activer (bascule en bas du panneau Cline) **avant** de l'envoyer.
- Un prompt = une **nouvelle tâche** Cline (bouton « New task »), pour garder le contexte léger : indispensable avec les modèles gratuits.
- Après chaque prompt Act : vérifier `npm run check` + `npm run build`, regarder le résultat dans le navigateur (`npm run dev`), puis **commit** (`git add -A && git commit -m "…"`). Ne passe au prompt suivant que si tout est vert.
- Si le modèle boucle ou fait n'importe quoi après 2 essais : nouvelle tâche, même prompt réduit à la moitié (une seule étape), ou change de modèle FREE dans les réglages de Cline. Les modèles gratuits changent régulièrement et ont un quota.
- Les paires « Plan puis Act » : lis la proposition du mode Plan, corrige-la en discutant, puis passe en Act et envoie le prompt Act (le contexte de la tâche est conservé si tu restes dans la même tâche).

---

## P0 — Mode : Plan — Audit du starter
~~~
Lis dans l'ordre : .clinerules/, docs/ARCHITECTURE.md, DESIGN.md, docs/ROADMAP.md, src/content.config.ts, src/data/taxonomy.ts, scripts/check-content.mjs, puis un exemple complet de contenu (src/content/formulas/pythagore.yaml, src/content/formula-texts/fr/pythagore.mdx, un exercice et son texte).
Ne modifie aucun fichier. Réponds en 15 lignes maximum :
1) ce que tu as compris du projet ; 2) les incohérences ou risques que tu vois dans le starter ; 3) comment tu vas gérer le Markdown/LaTeX dans les champs YAML des exercices ; 4) tes questions (5 maximum).
~~~

## P1 — Mode : Act — Setup technique
Pré-requis : le projet Astro vide existe déjà et le starter est copié dessus.
~~~
Fais le setup technique, étape par étape, en lançant `npm run build` à la fin de chaque étape :
1. Ajoute les intégrations officielles Astro : react, mdx, sitemap (`npx astro add <nom> --yes`), puis Tailwind CSS via la méthode officielle correspondant à la version d'Astro installée.
2. Installe : katex remark-math rehype-katex nanostores @nanostores/react @nanostores/persistent minisearch ts-fsrs mathjs @fontsource-variable/inter @fontsource-variable/source-serif-4 @fontsource-variable/jetbrains-mono astro-icon @iconify-json/lucide. En devDependencies : yaml eslint prettier prettier-plugin-astro vitest.
3. astro.config.mjs : `site` lu depuis la variable SITE_URL (défaut https://example.com), i18n (voir .clinerules/30-i18n.md), MDX avec remark-math + rehype-katex, intégrations installées.
4. Crée src/styles/global.css qui importe dans l'ordre : tailwindcss, tokens.css, tailwind-theme.css (adapte-le si la version de Tailwind l'exige, en gardant les mêmes noms de classes), les polices @fontsource, et katex/dist/katex.min.css. Styles de base : fond/texte via tokens, police serif pour h1-h3, focus visible, `prefers-reduced-motion`.
5. Scripts npm : `check` (astro check + eslint + check:content), `check:content` (node scripts/check-content.mjs), `test` (vitest run), `format` (prettier). Alias TypeScript `@/` → `src/`.
6. Vérifie que wrangler.jsonc est à la racine et que `npm run build` produit dist/.
Crée uniquement src/pages/index.astro (page de test minimale qui utilise les tokens et affiche la formule de Pythagore en KaTeX). Ne crée aucune autre page.
~~~

## P2 — Mode : Act — Fondation i18n
~~~
Mets en place l'i18n selon .clinerules/30-i18n.md :
- src/i18n/config.ts : langues supportées (['fr']), langue par défaut, direction et nom natif par langue, table routeSegments (formulas, exercises, review, progress, about… → segments localisés).
- src/i18n/index.ts : t(lang, key, vars?) typé sur les clés de src/i18n/ui/fr.json, interpolation {var}, pluriels (.one/.other via Intl.PluralRules), repli sur fr ; getLangFromUrl ; localizedPath(lang, routeKey, params).
- src/pages/index.astro redirige vers /fr/.
- src/layouts/BaseLayout.astro minimal : <html lang dir>, <head> (title, description, canonical, hreflang pour chaque langue disponible, viewport, favicon), script inline anti-flash du thème (data-theme depuis localStorage 'theme', sinon prefers-color-scheme), slot.
- Tests Vitest pour t() et localizedPath().
~~~

## P3 — Mode : Act — Couche de contenu
~~~
Lis .clinerules/20-content.md et src/content.config.ts. 1) Fais compiler les collections (adapte les imports à la version d'Astro installée). 2) Écris src/lib/content.ts :
- getFormulas(lang) et getFormula(lang, id) → données partagées + texte localisé + sections détectées (regex sur <Section kind="…"> du corps MDX) + exercices liés (index inversé depuis exercises[].formulas) + prérequis/liées/« ne pas confondre » résolus ; en production, seulement status 'published' ;
- getExercises(lang), getExercise(lang, id) avec le texte localisé ;
- repli sur 'fr' si la langue demandée n'a pas de texte (drapeau isFallback).
3) src/lib/md.ts : renderMd(source, { inline? }) → HTML (remark-math + rehype-katex) pour les champs Markdown des exercices YAML.
4) Lance `npm run check:content` ; corrige le contenu seed s'il y a des erreurs (ne modifie le script que pour un bug évident).
5) Tests Vitest : index inversé, repli de langue, renderMd (formule inline).
~~~

## P4 — Mode : Act — Layout et composants du design system
~~~
Lis DESIGN.md en entier. Implémente :
- BaseLayout complet : Header (logo public/logo-mark.svg + « site.name », navigation, bouton de recherche, ThemeToggle, LanguageSwitcher masqué s'il n'y a qu'une langue, menu mobile), Footer, lien d'évitement, transitions de page (View Transitions, fondu 150 ms).
- Composants Astro dans src/components/ui : Button, Chip, LevelDots, DifficultyMark, Callout (tip/warning/note), Card, Breadcrumb, Section (utilisé par le MDX : <section id={kind}> + h2 depuis t('section.<kind>') + ancre), EmptyState. React seulement si indispensable (ThemeToggle).
- src/components/math/FormulaDisplay.astro : rend du LaTeX avec katex au build (displayMode), bloc stylé selon DESIGN.md, bouton « Copier le LaTeX » (petit îlot), défilement horizontal en cas de débordement.
- Page /fr/design (visible uniquement en dev) affichant tous les composants dans tous leurs états, en clair et en sombre.
Uniquement des tokens, aucune valeur brute. Tous les textes via t().
~~~
→ Après P4 : premier déploiement Cloudflare (voir le guide du plan).

## P5 — Mode : Act — Page d'accueil
~~~
Lis DESIGN.md (Pages > Accueil). Construis src/views/Home.astro + src/pages/fr/index.astro :
- Hero : titre, sous-titre, champ de recherche (redirige vers le catalogue avec ?q=), et une carte « formule vivante » qui fait défiler les formules du contenu avec la révélation de termes décrite dans DESIGN.md (désactivée si prefers-reduced-motion).
- « Par niveau » : 7 cartes (niveau, libellé level.<n>.range, nombre de formules). « Par domaine » : tuiles avec icône Lucide et compte (domaines sans formule masqués).
- « Formule du jour » : choix déterministe selon la date UTC.
- « Comment réviser » : 4 cartes (fiches, quiz, exercices, progression) ; les destinations qui n'existent pas encore sont désactivées avec le badge t('common.soon').
Textes via t(). JavaScript uniquement pour la carte animée et le champ de recherche.
~~~

## P6a — Mode : Plan — Architecture du catalogue
~~~
Sans modifier de fichier, propose l'architecture de la page catalogue (DESIGN.md > Catalogue de formules) : (1) format et génération de l'index de recherche à partir des collections (un JSON par langue, champs minimaux), (2) schéma de l'état des filtres synchronisé avec l'URL, (3) découpage des composants (îlot React CatalogApp, FilterPanel, ResultsGrid, FormulaCard), (4) stratégie de rendu (cartes pré-rendues pour le SEO vs rendu client), (5) plan de tests Vitest de la logique de filtrage/tri. 40 lignes maximum, puis attends ma validation.
~~~

## P6b — Mode : Act — Catalogue de formules
~~~
Implémente le plan validé. Exigences : recherche texte MiniSearch (insensible aux accents et à la casse, préfixes, champs title/aliases/keywords/summary pondérés) ; filtres matière, domaine, niveau (plage), difficulté, contenu (graphique, démonstration, histoire, exercices) et « mon avancement » (masqué tant que le store de progression n'existe pas) ; tris : alphabétique, niveau ↑/↓, difficulté, date d'origine ; chips des filtres actifs + « Tout effacer » ; compteur (pluriel via t) ; état vide ; panneau de filtres en tiroir sur mobile ; navigation clavier ; état dans l'URL. Fichiers : src/views/FormulaCatalog.astro, src/pages/fr/formules/index.astro, src/components/islands/, src/lib/. Tests Vitest de la logique de filtrage et de tri.
~~~

## P7 — Mode : Act — Page de détail d'une formule
~~~
Lis DESIGN.md (Pages > Détail d'une formule). Implémente src/views/FormulaDetail.astro + src/pages/fr/formules/[slug].astro (getStaticPaths depuis getFormulas). Contenu : fil d'Ariane ; titre ; métadonnées (domaine, niveau, difficulté) ; FormulaDisplay principal avec onglets pour les variantes (libellés = variantLabels) ; légende des variables (variableNames) ; corps MDX rendu avec components={{ Section, Callout }} ; rail droit collant : sommaire (sections présentes), exercices liés, prérequis, formules liées, « ne pas confondre » ; précédent/suivant dans le même domaine. JSON-LD (LearningResource) et méta SEO. Boutons « Marquer comme maîtrisée » et « Ajouter aux fiches » présents mais désactivés (badge « Bientôt »). CSS d'impression propre. Si le texte manque dans la langue demandée : repli fr + bandeau fallback.notice. Le bloc graphique est un emplacement vide pour P8.
~~~

## P8 — Mode : Act — Graphiques interactifs
~~~
Implémente les graphiques en îlots React chargés avec client:visible :
1) FunctionGraph : trace graph.expressions (mathjs, import dynamique), curseurs pour graph.params, viewport de graph.viewport, axes et grille discrets (tokens), erreur d'expression gérée sans crash. Bibliothèque de tracé : Mafs ; si elle est incompatible avec la version de React installée, utilise JSXGraph et dis-le moi (demande avant d'ajouter une dépendance).
2) Presets : « right-triangle » (côtés a et b réglables par curseurs ; affiche c et les trois carrés a², b², c² avec leurs aires) et « unit-circle » (point mobile sur le cercle unité ; affiche cos θ, sin θ et cos² + sin² = 1).
Intègre-les dans FormulaDetail sous la formule (titre t('formula.graph')). Couleurs depuis les tokens, accessibilité clavier des curseurs, prefers-reduced-motion respecté.
~~~

## P9 — Mode : Act — Exercices
~~~
Lis .clinerules/20-content.md (exercices). Implémente :
(a) /fr/exercices : catalogue (réutilise la logique du catalogue de formules : filtres matière/domaine/niveau/difficulté/type, tri, recherche ; cartes avec titre, type, durée, niveau) ;
(b) /fr/exercices/[slug] : énoncé (renderMd), îlot ExercisePlayer : QCM (sélection unique ou multiple selon correct[]), numérique (accepte la virgule décimale et les fractions simples comme « 4/5 », tolérance, unité optionnelle), ouvert (auto-évaluation), indices progressifs un par un, solution repliée, retour visuel ET textuel, bouton « Exercice suivant » (même domaine/niveau) ;
(c) liens formules ↔ exercices dans les deux sens (FormulaDetail doit afficher les exercices liés) ;
(d) logique de vérification pure dans src/lib/exercise-check.ts avec tests Vitest exhaustifs (virgule, fractions, tolérance, espaces, entrées invalides).
~~~

## P10 — Mode : Act — Progression locale
~~~
Implémente src/lib/progress.ts (nanostores + @nanostores/persistent, clé « formulo:progress:v1 », schéma versionné, stockage indisponible toléré) : statut par formule (new/learning/mastered), tentatives d'exercices (date, résultat), jours d'activité (pour la série), emplacement réservé pour les fiches. Fonctions : setFormulaStatus, recordAttempt, getStreak, exportProgress() (JSON téléchargeable), importProgress(file) (validation Zod ; fusion ou remplacement au choix), resetProgress(). Branche : le bouton « Marquer comme maîtrisée » (FormulaDetail), le résultat d'un exercice (ExercisePlayer), le filtre « Mon avancement » (catalogue). Page /fr/progression : anneau global, barres par niveau et par domaine, calendrier d'activité de 12 semaines, série, export/import/réinitialisation avec confirmation, message progress.localNotice. Tests Vitest : export/import/série.
~~~

## P11a — Mode : Plan — Conception des fiches (FSRS)
~~~
Sans modifier de fichier, conçois le module de fiches à répétition espacée avec ts-fsrs : modèle de données d'une carte (formule + sens), stockage dans le store de progression (migration v1 → v2 si nécessaire), calcul des cartes dues, paramètres FSRS par défaut, sens des cartes (Nom → Formule, Formule → Nom, Variables → Formule), création d'un paquet depuis les filtres du catalogue, UI de session (DESIGN.md > Réviser), raccourcis clavier, plan de tests avec dates simulées. 40 lignes maximum, puis attends ma validation.
~~~

## P11b — Mode : Act — Fiches de révision
~~~
Implémente le plan validé : src/lib/srs.ts (logique pure + tests Vitest avec dates simulées), page /fr/reviser (hub : fiches dues, paquets, modes), /fr/reviser/fiches (session : carte retournable animée 320 ms, notation 1–4 avec raccourcis clavier, barre de progression, écran de fin avec bilan). Branche « Ajouter aux fiches » (FormulaDetail) et « Créer un paquet depuis ces filtres » (catalogue). Aucun nouveau paquet npm.
~~~

## P12 — Mode : Act — Quiz
~~~
Implémente /fr/reviser/quiz : le visiteur choisit niveau(x), domaine(s), nombre de questions (5/10/20) et chronomètre optionnel ; le quiz tire au sort dans les exercices QCM et numériques correspondants (pas « open »), affiche une question à la fois, corrige à la fin avec le détail et les liens vers les formules à revoir, et enregistre les tentatives dans le store de progression. Moins de 5 exercices disponibles : EmptyState clair. Logique de tirage pure et testée (Vitest).
~~~

## P13 — Mode : Act — Palette de recherche globale
~~~
Implémente la palette de recherche (Ctrl/⌘ + K et clic sur le bouton de recherche du header) : îlot React chargé à l'ouverture (import dynamique), index MiniSearch partagé avec le catalogue (formules + exercices), résultats groupés, navigation clavier (↑ ↓ Entrée Échap), piège de focus, annonce ARIA du nombre de résultats, historique des 5 dernières recherches (localStorage). Aucun nouveau paquet.
~~~

## P14 — Mode : Act — SEO, accessibilité, performance, pages légales
~~~
Passe qualité :
1) SEO : sitemap, robots.txt, canonical/hreflang, Open Graph/Twitter (image par défaut dans public/), JSON-LD formules et exercices.
2) Accessibilité : lien d'évitement, landmarks, focus visibles, contrastes (vérifie les tokens), prefers-reduced-motion partout, labels ARIA des îlots, vérification axe (demande-moi avant d'ajouter un outil).
3) Performance : mesure le JS envoyé par page (build + analyse de dist/) et compare aux budgets de docs/ARCHITECTURE.md ; corrige les écarts.
4) Pages : À propos, Mentions légales, Confidentialité (aucune donnée personnelle, stockage local uniquement, mesure d'audience sans cookie), 404 — contenu provisoire marqué [À COMPLÉTER].
5) Snippet Cloudflare Web Analytics piloté par PUBLIC_CF_BEACON_TOKEN (variable absente = rien n'est chargé).
Termine par la liste de ce qui reste.
~~~

## P15 — Mode : Act — Préparation du déploiement
~~~
Prépare le déploiement Cloudflare Workers (static assets) : vérifie wrangler.jsonc (name, compatibility_date, assets.directory = ./dist, not_found_handling = 404-page) ; ajoute `npm run preview` (build + wrangler dev) ; documente dans README.md la procédure Workers Builds (commande de build : npm run build ; commande de déploiement : npx wrangler deploy), les variables d'environnement (SITE_URL, PUBLIC_CF_BEACON_TOKEN) et le fonctionnement du domaine personnalisé. Ne lance pas `wrangler deploy` toi-même : je le fais depuis le dashboard Cloudflare.
~~~

## P16 — Mode : Plan — Audit global et suite
~~~
Sans modifier de fichier, audite le projet : cohérence avec .clinerules et DESIGN.md, dette technique, accessibilité, performance, couverture de tests, contenu (`npm run check:content`). Propose un plan priorisé de 10 tâches maximum pour la suite, en y intégrant les fonctionnalités de docs/ROADMAP.md (Phase 5) que j'ai sélectionnées. Format : tableau Priorité / Tâche / Effort (S, M, L) / Risque.
~~~

---

## Prompts de contenu
Voir `docs/CONTENT_GUIDE.md` (C1 à C5, avec leur mode).
