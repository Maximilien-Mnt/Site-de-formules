# Règles de design (résumé — la source de vérité est DESIGN.md)

- Style : minimaliste, éditorial scientifique, clair par défaut + mode sombre. Bordures fines plutôt qu'ombres. Un seul accent chaud, utilisé avec parcimonie.
- Tokens uniquement (`src/styles/tokens.css`) : couleurs, espacements, rayons, ombres, durées. Jamais de hex/px bruts dans les composants.
- Polices auto-hébergées (@fontsource) : Source Serif 4 (titres + lecture), Inter (interface), JetBrains Mono (code). Aucune police chargée depuis Google.
- Largeur de lecture 68ch ; mise en page max 1200 px ; grille 4 px.
- Animations : 120/200/320 ms, courbe `--ease-out`, jamais décoratives ; toutes désactivées par `prefers-reduced-motion`.
- Icônes : Lucide, trait 1.5, 20 px, via astro-icon (vérifier que le nom d'icône existe).
- Jamais la couleur seule pour porter une information (ajouter icône + texte).
- À éviter : dégradés violet-bleu, glassmorphism généralisé, emojis comme icônes, cartes toutes identiques, texte centré partout.
