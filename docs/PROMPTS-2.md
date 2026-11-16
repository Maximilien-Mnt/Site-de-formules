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

## Contenu — Lot 1 : formules et exercices (à faire juste après P5, avant P6a)

Pourquoi ici : le catalogue (P6), la page de formule (P7), les graphiques (P8) et les exercices (P9) ont besoin de vraies données. Ce lot ajoute **41 formules** (niveaux 1 à 7), **84 exercices**, met à jour les relations des 4 formules du starter, ajoute 2 scripts et les libellés des thèmes. Tout est livré en `status: draft` ; la liste complète des formules prévues est dans `docs/CATALOGUE.md`.

### P5.0 — Sans Cline — Installer les fichiers du lot
1. Dézippe `lot-1-formules.zip` **à la racine du dépôt** (là où se trouve `package.json`). Accepte le remplacement de : `src/content/formulas/{pythagore,aire-disque,identite-trigonometrique,discriminant-trinome}.yaml`, `docs/PROMPTS.md` et `docs/CONTENT_GUIDE.md`. Fais d'abord `git status` : si tu avais modifié l'un de ces fichiers, compare avec `git diff` après coup.
2. `git add -A && git commit -m "content: lot 1 (draft)"`.
3. Ne lance Cline qu'ensuite. Chaque prompt ci-dessous = une nouvelle tâche.

### P5.1 — Mode : Act — Intégrer et valider le lot 1
~~~
Le lot 1 de contenu vient d'être copié dans le dépôt : 41 nouvelles formules, 84 nouveaux exercices, 4 formules existantes mises à jour, scripts/audit-content.mjs, scripts/content-status.mjs, src/i18n/ui/fr.topics.json, docs/CATALOGUE.md. Lis docs/CATALOGUE.md, docs/CONTENT_GUIDE.md et .clinerules/20-content.md, puis :
1) Fusionne src/i18n/ui/fr.topics.json dans src/i18n/ui/fr.json (clés plates « topic.<slug> » ; conserve le format et l'ordre du fichier ; ne modifie aucune clé existante), puis supprime fr.topics.json. Ne touche pas aux autres langues.
2) Montre-moi le script "check" actuel de package.json. Ajoute "audit:content": "node scripts/audit-content.mjs" et "content:status": "node scripts/content-status.mjs", puis ajoute `npm run audit:content` à la fin du script "check". Vérifie que `yaml` et `katex` sont dans les dépendances ; sinon installe-les (`yaml` en devDependency).
3) Lance npm run check:content puis npm run audit:content. Attendu : 0 erreur ; 5 avertissements « publiée mais l'exercice … est encore en draft » sont normaux à ce stade. Corrige uniquement les problèmes mécaniques (chemin, indentation, clé manquante). Ne change JAMAIS le sens mathématique ni l'histoire d'un texte : signale-le moi.
4) Lance npm run check et npm run build. Dans docs/ROADMAP.md (Phase 4), ajoute la ligne « - [x] Lot 1 : 41 formules et 84 exercices intégrés (draft) » sans toucher aux cases déjà cochées.
5) Résume en 10 lignes : comptes avant/après, problèmes rencontrés, fichiers modifiés.
~~~

### P5.2 — Mode : Plan — Relecture critique d'un lot (à répéter pour les 8 groupes, une tâche chacun)
Utilise de préférence un autre modèle que celui qui t'a servi pour P5.1. Remplace `LOT` par un groupe :
- **arithmétique et dénombrement** : commutativite, division-euclidienne, pourcentage, coefficient-binomial, somme-premiers-entiers
- **géométrie** : perimetre-rectangle, aire-rectangle, aire-triangle, perimetre-cercle, thales, volume-cylindre, distance-plan
- **trigonométrie** : trigonometrie-triangle-rectangle, loi-des-cosinus
- **algèbre** : identites-remarquables, regles-puissances, fonction-affine, forme-canonique-trinome, viete-somme-produit, binome-newton, euler-formule
- **analyse A (dérivation, suites)** : nombre-derive, derivees-usuelles, derivee-produit-quotient, suite-arithmetique, suite-geometrique
- **analyse B (exp, ln, intégrales, séries)** : exponentielle-proprietes, logarithme-proprietes, theoreme-fondamental-analyse, integration-par-parties, taylor, serie-geometrique, integrale-gaussienne
- **probabilités et statistiques** : moyenne-arithmetique, probabilite-equiprobable, variance-ecart-type, probabilite-conditionnelle, loi-binomiale, theoreme-de-bayes
- **algèbre linéaire** : determinant-inverse-2x2, produit-matriciel
~~~
Lis les fichiers de ces formules : LOT = <ids du groupe> (src/content/formulas/<id>.yaml, src/content/formula-texts/fr/<id>.mdx, et les exercices dont formulas contient l'id, avec leurs textes dans src/content/exercise-texts/fr/). Ne modifie rien.
Pour chaque formule : 1) refais tous les calculs des exemples et de chaque réponse d'exercice (écris le calcul) ; 2) vérifie l'exactitude de la formule, des variantes et des conditions de validité ; 3) classe chaque affirmation historique en « sûre », « à vérifier » ou « à retirer » ; 4) vérifie la cohérence du niveau, de la difficulté et des prérequis ; 5) pour les QCM : une seule bonne réponse, distracteurs plausibles ; 6) relève les fautes de français et les phrases trop difficiles pour le niveau.
Réponds par un tableau : Id | Fichier | Problème | Gravité (bloquant ou mineur) | Correction exacte proposée. Écris « RAS » si une formule n'a aucun problème.
~~~
Vérifie toi-même les points « à vérifier » avec `docs/REVIEW_HISTORIQUE.md` (coche les cases au fur et à mesure).

### P5.3 — Mode : Act — Appliquer les corrections de la relecture
~~~
Applique uniquement les corrections suivantes (je les ai validées, ignore tout le reste) : <colle ici les lignes retenues du tableau de P5.2>.
Fais le changement minimal dans chaque fichier, sans reformuler le reste. Puis npm run check:content && npm run audit:content et corrige les erreurs mécaniques. Liste ce que tu as modifié, fichier par fichier.
~~~

### P5.4 — Mode : Act — Publier le lot
À faire seulement quand P5.2 et P5.3 sont terminés pour les 8 groupes.
~~~
Je valide la publication du lot 1. Exécute `npm run content:status -- published --all --dry` et montre le résultat, puis exécute la même commande sans --dry. Lance ensuite npm run check:content et npm run audit:content (0 erreur et 0 avertissement attendus), puis npm run check et npm run build. Démarre npm run dev et donne-moi 5 URLs de pages de formules générées pour que je les ouvre. Ne modifie rien d'autre.
~~~

### P5.5 — Mode : Act — Vérifier la page d'accueil avec les vraies données
~~~
Le contenu contient maintenant 45 formules publiées (niveaux 1 à 7, domaines : arithmétique, algèbre, géométrie, trigonométrie, analyse, probabilités, statistiques, algèbre linéaire, maths discrètes). Relis src/views/Home.astro et vérifie avec ces données :
1) « Par niveau » : 7 cartes avec les bons comptes (le niveau 7 contient 1 formule).
2) « Par domaine » : chaque domaine présent a une icône Lucide (ajoute celles qui manquent dans la table d'icônes) ; les domaines sans formule (théorie des nombres) restent masqués.
3) « Formule vivante » : ne retenir que les formules dont tous les symboles ont un variableNames, de préférence avec un LaTeX court (60 caractères maximum).
4) « Formule du jour » : choix déterministe par date UTC, jamais une formule en draft.
Corrige ce qui ne va pas, ajoute des tests Vitest (comptes par niveau et par domaine, choix déterministe), puis npm run check && npm run build.
~~~

### P5.6 — Mode : Act — Tests de contenu automatiques
~~~
Ajoute src/lib/content-audit.test.ts (Vitest) : 1) exécute `node scripts/audit-content.mjs` avec child_process.execFileSync et vérifie que le code de sortie est 0 ; 2) trois tests sur scripts/content-status.mjs : un statut invalide → code de sortie 1 ; un identifiant de formule inconnu → code de sortie 1 ; `published --all --dry` ne modifie aucun fichier (compare le hash des fichiers de src/content avant et après).
S'il existe un dossier .github/workflows/, ajoute l'étape `npm run audit:content` au workflow de vérification. Puis npm run check.
~~~

### P5.7 — Mode : Plan — Préparer les lots suivants
~~~
Lis docs/CATALOGUE.md et docs/CONTENT_GUIDE.md. Sans modifier de fichier : 1) propose l'ordre des lots 2, 3 et 4 en tenant compte des prérequis déjà couverts, de l'équilibre des niveaux et de ce qui rend le site utile le plus tôt (programmes de collège puis de lycée) ; 2) applique le prompt C1 pour le lot 2 (10 formules) ; 3) liste les risques (formules sans graphique possible, notions sans exercice numérique). 30 lignes maximum, puis attends ma validation.
~~~
Pour écrire les lots suivants : C1 → C2 → C3 → C4 → C5 (`docs/CONTENT_GUIDE.md`), ou demande-moi de rédiger le lot dans cette conversation (les contenus que je rédige sont recalculés et compilés avant livraison, mais leurs dates et faits d'histoire restent à vérifier).

---

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
Voir `docs/CONTENT_GUIDE.md` (C1 à C5, avec leur mode) et `docs/CATALOGUE.md` (liste de toutes les formules prévues).
