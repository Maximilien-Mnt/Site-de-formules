# Modèle de contenu

Le contenu est séparé en **données partagées** (indépendantes de la langue) et **textes localisés**. Le nom de fichier = l'identifiant (kebab-case ASCII, ex. `pythagore`, `second-loi-newton`).

| Collection | Fichier | Contenu |
|---|---|---|
| formulas | `src/content/formulas/<id>.yaml` | subject, domain, topics, level (1-7), difficulty (1-5), latex, variants[{id,latex}], variables[{symbol,unit?}], prerequisites[], related[], confusedWith[], originYear?, graph?, status |
| formulaTexts | `src/content/formula-texts/<lang>/<id>.mdx` | frontmatter : title, summary, aliases, keywords, variableNames{symbole→texte}, variantLabels{id→texte} ; corps MDX en sections |
| exercises | `src/content/exercises/<id>.yaml` | subject, domain, level, difficulty, formulas[] (≥1), kind (numeric/qcm/open), estimatedMinutes, answer / choices+correct |
| exerciseTexts | `src/content/exercise-texts/<lang>/<id>.yaml` | title, statement, choices{id→texte}, hints[], solution (champs en Markdown + LaTeX) |

## Règles
- Les liens formule → exercices ne sont PAS stockés : ils sont calculés depuis `exercises[].formulas` (source unique).
- Corps MDX d'une formule : sections via `<Section kind="...">` avec kind ∈ intuition, explanation, proof, history, methods, applications, mistakes, further. `explanation` est obligatoire. Les titres de section viennent de l'i18n, pas du contenu.
- Composants MDX disponibles sans import : `Section`, `Callout` (type = tip | warning | note, title). Ils sont passés via `<Content components={...} />`.
- LaTeX : `$...$` inline, `$$...$$` en bloc. Dans les YAML, mettre le LaTeX entre apostrophes simples (pas de doublement des antislashs).
- Dans le MDX hors maths : écrire `&lt;` pour `<` et `\{` pour `{`.
- Décimaux en français : virgule (`3{,}14` en LaTeX, `3,14` en texte).
- `status: draft` tant que le contenu n'est pas relu ; seules les entrées `published` sont générées en production.
- Histoire : ne rien affirmer d'incertain comme un fait ; utiliser « traditionnellement attribué à », « vers », « selon les historiens ».
- Après toute modification de contenu : `npm run check:content`.
