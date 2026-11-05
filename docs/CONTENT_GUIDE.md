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

## Règle d'or avec l'IA
Les modèles gratuits se trompent en maths et inventent de l'histoire. **Toujours** : (1) générer en `status: draft`, (2) faire une passe de relecture critique dans une conversation séparée (prompts C3), (3) vérifier à la main les calculs des exemples et les dates, (4) publier. Tu peux aussi me demander ici de rédiger ou relire des lots de formules.

## Prompts de contenu (à utiliser dans Cline)

### C1 — Mode : Plan — Choisir les formules d'un lot
~~~
Sans créer de fichier, propose la liste des formules à ajouter pour : sujet = math, domaine = <DOMAINE>, niveaux = <NIVEAUX>. Pour chacune : identifiant kebab-case, titre FR, niveau (1-7), difficulté (1-5), prérequis (ids existants ou à créer), et une ligne sur ce qu'elle permet de faire. Ne propose que des formules standard enseignées à ces niveaux. Évite les doublons avec src/content/formulas/. Tableau, 20 lignes max.
~~~

### C2 — Mode : Act — Écrire un lot
~~~
Crée les formules suivantes : <LISTE VALIDÉE>. Pour chacune : src/content/formulas/<id>.yaml et src/content/formula-texts/fr/<id>.mdx en suivant exactement le modèle pythagore (frontmatter, <Section kind="...">, <Callout>). Règles : status: draft ; n'écris que ce dont tu es sûr (aucune date ni attribution incertaine : omets la section history plutôt que d'inventer) ; LaTeX entre apostrophes dans les YAML ; exemples chiffrés vérifiés ligne par ligne. Puis lance `npm run check:content` et corrige.
~~~

### C3 — Mode : Plan — Relecture critique (idéalement avec un autre modèle)
~~~
Relis ces fichiers sans les modifier : <CHEMINS>. Pour chaque formule, liste : (1) erreurs mathématiques (formule, exemples, démonstration), (2) conditions de validité manquantes, (3) affirmations historiques douteuses ou non vérifiables, (4) passages trop difficiles/faciles pour le niveau, (5) erreurs fréquentes manquantes. Réponds par un tableau Fichier / Problème / Gravité (bloquant, important, mineur) / Correction proposée.
~~~

### C4 — Mode : Act — Appliquer les corrections
~~~
Applique les corrections « bloquant » et « important » du tableau validé, puis passe les fichiers concernés en status: published, lance `npm run check:content` et résume.
~~~

### C5 — Mode : Act — Exercices d'une formule
~~~
Pour la formule <id>, crée 5 exercices (mélange numeric/qcm/open, difficulté croissante, niveau cohérent avec la formule) : src/content/exercises/<id-formule>-<nn>.yaml et src/content/exercise-texts/fr/<même id>.yaml, selon les modèles existants. Chaque exercice : 2 indices progressifs et une solution rédigée. Vérifie chaque réponse numérique à la main. Pour les QCM, les mauvaises réponses doivent correspondre à des erreurs réelles d'élèves. status: draft, puis `npm run check:content`.
~~~
