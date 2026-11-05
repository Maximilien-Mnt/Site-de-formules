# Conventions de code

- TypeScript strict, pas de `any` (sauf commentaire justifié). Imports absolus via l'alias `@/` (= `src/`).
- Fichiers : composants en PascalCase, utilitaires en camelCase/kebab-case, un composant par fichier.
- `src/components/ui/` : composants Astro statiques. `src/components/islands/` : composants React interactifs. `src/components/math/` : rendu de formules.
- `src/views/` : composants de page partagés entre langues. `src/pages/<lang>/...` : fichiers fins qui appellent une vue (voir 30-i18n.md).
- `src/lib/` : logique pure (sans DOM) = testable avec Vitest. Toute logique non triviale (filtres, SRS, correction d'exercices) y vit et a des tests.
- État client : nanostores. Persistance : localStorage avec clé versionnée (`formulo:<nom>:v<N>`) et try/catch (stockage indisponible = l'app reste utilisable).
- Pas de `dangerouslySetInnerHTML` sauf sur du HTML produit par renderMd() depuis notre contenu.
- CSS : classes Tailwind avec tokens (`bg-surface`, `text-muted`…). Propriétés logiques (`ms-4`, `ps-4`, `text-start`) plutôt que left/right (RTL futur).
- Commits : un par tâche, message impératif court (`feat: catalogue de formules`).
