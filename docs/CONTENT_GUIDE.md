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

### C2 — Mode : Act — Écrire un lot

### C3 — Mode : Plan — Relecture critique (idéalement avec un autre modèle)

### C4 — Mode : Act — Appliquer les corrections

### C5 — Mode : Act — Exercices d'une formule
