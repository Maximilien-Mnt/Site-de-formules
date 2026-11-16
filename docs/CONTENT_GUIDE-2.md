# Guide du contenu

## Modèle de référence

`src/content/formula-texts/fr/pythagore.mdx` + `src/content/formulas/pythagore.yaml` = exemple complet (toutes les sections). Les autres formules du starter sont volontairement plus courtes. Toute nouvelle formule suit ce modèle.

## Niveaux (neutres, indépendants du pays)

1 début primaire · 2 fin primaire · 3 collège · 4 lycée (début) · 5 lycée (fin) · 6 université 1–2 · 7 université 3+.
Difficulté 1–5 = difficulté **à l'intérieur** du niveau.

## Qualité : checklist avant `status: published`

- [ ] La formule et chaque variante sont mathématiquement exactes (relire, tester sur un exemple numérique).
- [ ] Toutes les variables du LaTeX sont dans `variables` et décrites dans `variableNames`.
- [ ] Les conditions de validité sont écrites (ex. `a ≠ 0`, `cos θ ≠ 0`).
- [ ] Section `explanation` claire pour le niveau visé, avec un exemple chiffré ; `mistakes` présente.
- [ ] Histoire : uniquement des faits sûrs, formulations prudentes (« vers », « traditionnellement attribué à »).
- [ ] Ton : tutoiement, phrases courtes, vocabulaire du niveau.
- [ ] Au moins 2 exercices liés (créés ou prévus).
- [ ] `npm run check:content` passe.
- [ ] `npm run audit:content` passe (LaTeX valide, prérequis cohérents, au moins 2 exercices par formule, libellés des topics).
- [ ] Les dates et faits d'histoire sont vérifiés dans une source fiable (voir `docs/REVIEW_HISTORIQUE.md` pour le lot 1).

## Règle d'or avec l'IA

Les modèles gratuits se trompent en maths et inventent de l'histoire. **Toujours** : (1) générer en `status: draft`, (2) faire une passe de relecture critique dans une conversation séparée (prompts C3), (3) vérifier à la main les calculs des exemples et les dates, (4) publier. Tu peux aussi me demander ici de rédiger ou relire des lots de formules.

## Outils

- `npm run check:content` : structure, références entre fichiers, variables (script d'origine).
- `npm run audit:content` : LaTeX (KaTeX), pièges MDX, niveaux des prérequis, cycles, nombre d'exercices par formule, libellés des topics, typographie.
- `npm run content:status -- published thales pythagore` (ou `--all`, avec `--dry` pour simuler) : passe des formules **et de leurs exercices** en `published` ou `draft`.
- `docs/CATALOGUE.md` : liste maîtresse de toutes les formules prévues (lots 1 à 4). Le lot 1 est écrit ; les autres sont décrits (id, niveau, difficulté, formule).

## Exercices : formats

- `numeric` : `answer.value`, `answer.tolerance` (0 pour une valeur exacte, sinon l'écart accepté, par exemple 0.05 si l'élève peut utiliser $\pi \approx 3{,}14$), `answer.unit` facultative. Choisis des réponses simples à saisir (entier, décimal court).
- `qcm` : 4 choix `a` à `d`, une seule bonne réponse sauf indication, des distracteurs qui correspondent à de **vraies erreurs** (oubli d'un terme, mauvais signe, formule voisine). La solution explique pourquoi chaque mauvaise réponse est tentante.
- `open` : réservé aux exercices à correction guidée (pas de saisie vérifiée).
- Chaque exercice a au moins un indice (`hints`) qui oriente sans donner la réponse, et une solution rédigée.

## Prompts de contenu (à utiliser dans Cline)

Pipeline conseillé pour un lot : **C1** (choisir) → **C2** (écrire) → **C3** (relire avec un autre modèle) → **C4** (corriger) → **C5** (compléter les exercices) → publication avec `npm run content:status`.

### C1 — Mode : Plan — Choisir les formules d'un lot
~~~
Lis docs/CATALOGUE.md, docs/CONTENT_GUIDE.md et la liste des fichiers de src/content/formulas/.
Propose le prochain lot de 10 formules parmi les entrées « à rédiger » du catalogue (ou d'autres, si tu justifies). Critères : tous les prérequis existent déjà ou sont dans le lot, niveaux cohérents, domaines équilibrés.
Pour chaque formule, donne : id (kebab-case ASCII, en français), titre, domain, level (1 à 7), difficulty (1 à 5), formule LaTeX exacte et variantes, variables, prerequisites / related / confusedWith (ids existants ou du lot uniquement), originYear seulement si tu es certain (sinon rien), et 2 idées d'exercices.
Ne crée ni ne modifie aucun fichier. Réponds par un tableau, puis attends ma validation.
~~~

### C2 — Mode : Act — Écrire un lot
~~~
Lis .clinerules/20-content.md, docs/CONTENT_GUIDE.md et le modèle complet src/content/formulas/derivee-produit-quotient.yaml + src/content/formula-texts/fr/derivee-produit-quotient.mdx (et un exercice numérique et un QCM avec leurs textes).
Écris le lot validé : pour chaque formule, src/content/formulas/<id>.yaml et src/content/formula-texts/fr/<id>.mdx, toujours en status: draft.
Règles : tutoiement et phrases courtes ; sections intuition, explanation (avec un exemple chiffré dont tu recalcules le résultat), proof (seulement si une démonstration courte existe), history, methods, applications, mistakes ; conditions de validité écrites ; histoire = faits sûrs avec « vers » ou « traditionnellement attribué à », sinon n'écris rien ; summary de 220 caractères maximum et sans « : » ; aucun « { » ni « < » brut hors formule ; décimales avec virgule dans le texte ({,} en LaTeX) ; toutes les variables du LaTeX dans variables et variableNames.
Après chaque groupe de 3 formules : npm run check:content && npm run audit:content, et corrige. Ne passe jamais en published. Termine par la liste des fichiers créés.
~~~

### C3 — Mode : Plan — Relecture critique (idéalement avec un autre modèle)
~~~
Lis les fichiers de ces formules : LOT = <liste d'ids> (src/content/formulas/<id>.yaml, src/content/formula-texts/fr/<id>.mdx, et les exercices dont formulas contient l'id, avec leurs textes dans src/content/exercise-texts/fr/). Ne modifie rien.
Pour chaque formule : 1) refais tous les calculs des exemples et de chaque réponse d'exercice (écris le calcul) ; 2) vérifie l'exactitude de la formule, des variantes et des conditions de validité ; 3) classe chaque affirmation historique en « sûre », « à vérifier » ou « à retirer » ; 4) vérifie la cohérence du niveau, de la difficulté et des prérequis ; 5) pour les QCM : une seule bonne réponse, distracteurs plausibles ; 6) relève les fautes de français et les phrases trop difficiles pour le niveau.
Réponds par un tableau : Id | Fichier | Problème | Gravité (bloquant ou mineur) | Correction exacte proposée. Écris « RAS » si une formule n'a aucun problème.
~~~

### C4 — Mode : Act — Appliquer les corrections
~~~
Applique uniquement les corrections suivantes (je les ai validées, ignore tout le reste) : <colle ici les lignes du tableau C3 retenues>.
Fais le changement minimal dans chaque fichier, sans reformuler le reste. Puis npm run check:content && npm run audit:content et corrige les erreurs mécaniques. Liste ce que tu as modifié, fichier par fichier.
~~~

### C5 — Mode : Act — Exercices d'une formule
~~~
Pour la formule <id> : lis son yaml et son mdx, et les exercices qui la référencent déjà. Crée 2 ou 3 nouveaux exercices (src/content/exercises/<id>-<thème>-<nn>.yaml + src/content/exercise-texts/fr/<même nom>.yaml), en status: draft : au moins un numeric et un qcm, de difficultés différentes, qui ne répètent pas les exemples du texte.
Numeric : réponse simple à saisir, tolerance adaptée. QCM : 4 choix a à d, une seule bonne réponse, chaque mauvais choix correspond à une erreur réelle. Chaque exercice a au moins un indice et une solution rédigée qui explique les pièges. Recalcule chaque réponse avant de l'écrire. Puis npm run check:content && npm run audit:content.
~~~
