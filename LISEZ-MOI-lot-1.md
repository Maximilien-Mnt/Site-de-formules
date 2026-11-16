# Lot 1 — formules et exercices (à dézipper à la racine du dépôt)

Contenu : 41 nouvelles formules (niveaux 1 à 7), 84 exercices, 4 formules du starter mises à jour (relations), 2 scripts, les libellés des thèmes, le catalogue complet (117 formules prévues) et les nouveaux prompts Cline (P5.0 à P5.7, à placer après P5).

## Où va chaque fichier

| Dans le zip | Destination | Action |
|---|---|---|
| `src/content/formulas/*.yaml` | idem | 41 nouveaux fichiers + 4 remplacés (pythagore, aire-disque, identite-trigonometrique, discriminant-trinome) |
| `src/content/formula-texts/fr/*.mdx` | idem | 41 nouveaux fichiers |
| `src/content/exercises/*.yaml` | idem | 84 nouveaux fichiers |
| `src/content/exercise-texts/fr/*.yaml` | idem | 84 nouveaux fichiers |
| `src/i18n/ui/fr.topics.json` | idem (temporaire) | à fusionner dans `fr.json` par le prompt P5.1, puis supprimé |
| `scripts/audit-content.mjs` | idem | nouveau (`npm run audit:content`) |
| `scripts/content-status.mjs` | idem | nouveau (`npm run content:status`) |
| `docs/CATALOGUE.md` | idem | nouveau : liste de toutes les formules (lots 1 à 4) |
| `docs/REVIEW_HISTORIQUE.md` | idem | nouveau : faits d'histoire à vérifier |
| `docs/PROMPTS.md` | idem | **remplace** : ajoute P5.0 à P5.7 entre P5 et P6a |
| `docs/CONTENT_GUIDE.md` | idem | **remplace** : prompts C1 à C5 maintenant écrits |

Tout est en `status: draft` (sauf les 4 formules du starter, déjà publiées). Suite : ouvre `docs/PROMPTS.md`, section « Contenu — Lot 1 ».
