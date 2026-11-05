# Formulo (nom de travail) — contexte projet

Site public d'apprentissage et de révision de formules. Maths d'abord ; physique, chimie, etc. plus tard. Niveaux : début du primaire → université. Langue initiale : français ; d'autres langues viendront (l'i18n est un prérequis, pas une option).

## Fonctionnalités cœur
- Catalogue de formules (filtres, tris, recherche) + une page de détail par formule : intuition, explication, démonstration, histoire, graphiques, méthodes, applications, erreurs fréquentes.
- Catalogue d'exercices lié aux formules (liens dans les deux sens).
- Révision : fiches à répétition espacée (FSRS), quiz, exercices, progression locale.
- Pas de compte, pas d'authentification, pas de backend en v1.

## Stack figée (ne rien ajouter sans demander)
Astro (sortie statique) + TypeScript strict + MDX + React (îlots interactifs uniquement) + Tailwind CSS + KaTeX (au build) + nanostores (+persistent) + MiniSearch + ts-fsrs + mathjs (pages à graphes seulement) + Lucide via astro-icon. Hébergement : Cloudflare Workers (static assets). Contenu = fichiers YAML/MDX dans le repo.

## Règles de travail
1. Une tâche = un changement petit et vérifiable. Au-delà de ~8 fichiers, propose de découper.
2. Lis DESIGN.md avant toute tâche d'UI, docs/ARCHITECTURE.md avant toute tâche de structure.
3. Après chaque tâche : `npm run check` puis `npm run build` doivent passer. Corrige avant de conclure.
4. Aucun texte visible en dur dans les composants : tout passe par t() (voir 30-i18n.md).
5. Aucune valeur brute de couleur/espacement/rayon : uniquement les tokens (voir 40-design.md).
6. Pas de nouvelle dépendance sans me demander. Pas de code mort. Signale tout TODO laissé.
7. Accessibilité : clavier, focus visible, contrastes, `prefers-reduced-motion`, textes alternatifs.
8. Performance : 0 JS par défaut ; un îlot React doit être justifié (`client:visible` ou `client:idle` si possible).
9. Information manquante → pose une question. Ne jamais inventer de faits mathématiques ou historiques.
10. Termine chaque tâche par un résumé de 5 lignes max : fichiers touchés, commandes lancées, reste à faire.
