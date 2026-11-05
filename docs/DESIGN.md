# DESIGN.md — Formulo (nom de travail)

> Direction choisie sans référence à des sites réels (pas d'outil de recherche de designs connecté) : elle s'appuie sur les principes ci-dessous et sur les contraintes du projet. Les valeurs sont dans `src/styles/tokens.css` ; ce document explique leurs rôles.

## 1. Identité

**Promesse** : « Comprends, retiens, maîtrise chaque formule. »
**Personnalité** : calme, précis, chaleureux. Un cahier de maths bien tenu, pas un jeu vidéo. Sérieux sans être scolaire.
**Principes**
1. La formule est la vedette : grande, nette, jamais noyée dans des décorations.
2. Lisibilité d'abord : longues lectures confortables, hiérarchie claire, beaucoup d'air.
3. Une couleur d'action (bleu encre), un accent chaud (jaune « surligneur ») pour ce qui compte.
4. Interface rapide et silencieuse : animations courtes, utiles, désactivables.
5. Même qualité du CP à l'université : le design ne doit être ni enfantin ni intimidant.

**Ton de voix** : tutoiement, phrases courtes, verbes d'action, zéro jargon inutile, zéro emoji. Encourageant sans infantiliser. Exemples : « Essaie encore » (pas « Raté ! »), « Tes progrès restent sur cet appareil. », « Aucune formule ne correspond. Retire un filtre ? »

## 2. Logo et favicon

- Marque : carré arrondi bleu (`--primary`) contenant un radical blanc « √ » tracé en un seul trait (voir `public/logo-mark.svg`, `public/favicon.svg`).
- Logotype : « Formulo » en Source Serif 4, graisse 600, espacement -0.01em, précédé de la marque (taille marque = 1.4 × hauteur de x du texte).
- Zone de protection : la hauteur du radical autour. Taille minimale de la marque : 20 px.
- Le nom est un nom de travail : il vit dans `src/i18n/ui/fr.json` (`site.name`) et le fichier SVG. Rien d'autre à changer.

## 3. Couleurs

Neutres chauds (papier) + un bleu encre. Contrastes mesurés ≥ 4.5:1 pour le texte courant. Chaque couleur a un rôle ; on n'invente pas de couleur.

| Token | Clair | Sombre | Rôle |
|---|---|---|---|
| `--bg` | #FAFAF8 | #111113 | fond de page |
| `--surface` | #FFFFFF | #1A1A1E | cartes, panneaux, champs |
| `--surface-2` | #F3F2EE | #232328 | blocs de formule, zones discrètes, survol |
| `--border` | #E4E2DB | #2E2E34 | bordures par défaut |
| `--border-strong` | #CFCBC0 | #43434B | bordures de champs, séparateurs forts |
| `--text` | #1B1B1F | #ECEBE6 | texte principal |
| `--text-muted` | #5C5B57 | #A3A19A | texte secondaire, légendes |
| `--text-subtle` | #8A877F | #75736C | décor / grands textes uniquement (< 4.5:1) |
| `--primary` | #2347D9 | #7C98FF | actions principales, liens, focus |
| `--primary-hover` | #1B38B0 | #9BB0FF | survol de l'action principale |
| `--primary-soft` | #E8ECFC | #1C2442 | fond de chip actif, sélection |
| `--on-primary` | #FFFFFF | #0B1230 | texte sur fond primary |
| `--accent` | #F5B700 | #F5C542 | surligneur : mise en évidence de termes, série (streak) |
| `--accent-soft` | #FFF4CC | #3A2F0C | fond de mise en évidence |
| `--success` / `-soft` | #1F7A4D / #E3F3EA | #4CC38A / #12301F | bonne réponse, maîtrisée |
| `--warning` / `-soft` | #A15C00 / #FCEBD0 | #F0A24B / #36260F | attention, erreur fréquente |
| `--danger` / `-soft` | #C0362C / #FBE4E1 | #F2766B / #3B1815 | mauvaise réponse, destructif |

Règles : l'accent n'est jamais un fond de texte long. Les états « réussi/raté » s'accompagnent toujours d'une icône et d'un texte. Teintes par matière (réservées, à activer avec la physique/chimie) : `--subject-math` = primary, `--subject-physics` = #0F766E, `--subject-chemistry` = #B4236B.

## 4. Typographie

Polices auto-hébergées via @fontsource (pas de Google Fonts, RGPD).

| Usage | Famille | Graisses |
|---|---|---|
| Titres, texte long (explications) | Source Serif 4 (variable) | 500–700 |
| Interface (nav, boutons, labels, tableaux) | Inter (variable) | 400–600 |
| Code / LaTeX copié | JetBrains Mono (variable) | 400–500 |
| Formules | KaTeX (Computer Modern) — s'harmonise avec la serif | — |

Échelle (rem, ligne) : xs .75/1.1 · sm .875/1.4 · base 1/1.55 · md 1.125/1.65 (lecture) · lg 1.25/1.4 · xl 1.5/1.3 · 2xl 1.875/1.2 · 3xl 2.25/1.15 · 4xl fluide `clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)`/1.05. Corps de lecture : 1.125rem, 68ch maximum. Titres : serif, léger crénage négatif. Labels/overlines : Inter 600, majuscules, 0.04em, `xs`.
Taille KaTeX : formule principale d'une page = 1.8–2.2× le corps ; dans une carte de catalogue = 1.25×.

## 5. Espacement et grille

- Unité 4 px. Échelle : 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (`--space-1` … `--space-10`).
- Largeurs : lecture `68ch` ; contenu max `1200px` ; padding horizontal de page 16 (mobile) / 24 (tablette) / 32 (desktop).
- Sections de page : 64 px (mobile) / 96 px (desktop) entre blocs majeurs.
- Grille catalogue : 1 colonne < 640 px, 2 colonnes ≥ 640, 3 colonnes ≥ 1024 (avec panneau de filtres 280 px), 4 sans panneau ≥ 1440.
- Breakpoints : 640 / 768 / 1024 / 1280 / 1440.

## 6. Forme et profondeur

- Rayons : `--r-sm` 6 (champs, chips) · `--r-md` 10 (cartes, boutons) · `--r-lg` 16 (grands panneaux, formule vedette) · `--r-full` (pastilles).
- Bordure 1 px `--border` partout ; **les ombres sont rares** : `--shadow-sm` (0 1px 2px / 4 %) pour cartes survolées, `--shadow-md` (0 8px 24px -8px / 12 %) pour menus, palette, tiroirs.
- Pas de dégradés, pas de verre dépoli, sauf l'en-tête collant (fond `--bg` à 85 % + flou 8 px, un seul endroit).

## 7. Mouvement

| Token | Valeur | Usage |
|---|---|---|
| `--dur-fast` | 120 ms | survols, focus, boutons |
| `--dur-base` | 200 ms | apparitions de panneaux, onglets |
| `--dur-slow` | 320 ms | retournement de fiche, anneau de progression |
| `--ease-out` | cubic-bezier(.2,.7,.2,1) | par défaut |

Animations signatures (sobres) : (1) **révélation de formule** sur l'accueil : chaque terme apparaît en fondu + décalage 8 px, délai 40 ms entre termes ; (2) **carte de catalogue** : survol = bordure `--border-strong` + ombre sm + élévation 2 px ; (3) **fiche de révision** : retournement 3D 320 ms ; (4) **anneau de progression** : remplissage 320 ms ; (5) **transition de page** : fondu 150 ms (View Transitions). `prefers-reduced-motion: reduce` → toutes les durées à 0 et aucune translation.

## 8. Icônes et illustrations

- Icônes : Lucide, trait 1.5, 20 px (16 px en ligne), `currentColor`. Associations proposées (vérifier l'existence des noms) : arithmetic `calculator`, algebra `variable`, geometry `triangle-right`, trigonometry `circle-dashed`, calculus `chart-line`, probability `dices`, statistics `chart-column`, linear-algebra `grid-3x3`, discrete `network`, number-theory `hash`.
- Niveau = 7 points (●●●○○○○), jamais une couleur seule. Difficulté = 5 petits losanges.
- Illustrations : uniquement géométriques (formes, courbes, grille fine), 1.5 px de trait, couleurs tokens. Pas de mascotte, pas d'images de stock.

## 9. Composants

| Composant | Spécification |
|---|---|
| **Button** | primary (fond `--primary`, texte `--on-primary`), secondary (bordure `--border-strong`, fond `--surface`), quiet (sans bordure, survol `--surface-2`). Hauteur 40 (sm 32, lg 48), rayon md, padding 16. États : hover, focus-visible (anneau 2 px `--focus-ring` + offset 2), active (translateY 1 px), disabled (50 % + `aria-disabled`), loading. |
| **Chip** | pastille 32 px, bordure `--border`, rayon full ; sélectionnée : fond `--primary-soft`, bordure `--primary`, icône ✓ (Lucide `check`). |
| **Input / Select** | 44 px de haut, bordure `--border-strong`, rayon sm ; focus = bordure `--primary` + anneau ; label visible toujours (pas de placeholder seul). |
| **FormulaCard** | surface, bordure, rayon md, padding 20. Haut : formule KaTeX centrée dans un bloc `--surface-2` (hauteur min 96). Puis titre (serif xl), résumé 2 lignes (`--text-muted`), pied : domaine (icône + label), points de niveau, statut de progression (icône + texte). Lien englobant unique. |
| **FormulaDisplay** | bloc `--surface-2`, rayon lg, padding 32, formule centrée à 2×. Onglets de variantes dessous (style soulignement). Actions discrètes en haut à droite : copier le LaTeX, plein écran. Défilement horizontal si débordement (jamais de coupure). |
| **VariableLegend** | tableau 2 colonnes : symbole KaTeX (aligné à droite, serif) / description. Survol d'une ligne = surlignage `--accent-soft` (étendu au surlignage dans la formule en option). |
| **Section (MDX)** | `<section id>`, titre H2 serif 2xl, ancre au survol, séparation 48 px. Titre issu de l'i18n. |
| **Callout** | bordure gauche 3 px (tip = primary, warning = warning, note = border-strong), fond `-soft`, icône + titre, rayon md. |
| **Tabs** | liste soulignée, flèches gauche/droite pour naviguer (ARIA tabs). |
| **Accordion/Details** | pour démonstrations longues : chevron animé 120 ms, replié par défaut. |
| **LevelDots / DifficultyMark** | 7 points / 5 losanges, `aria-label` complet (« Niveau 3 sur 7 : collège »). |
| **ProgressRing** | anneau SVG 4 px, couleur `--success`, valeur au centre. |
| **FlashCard** | 560×340 max, rayon lg, recto/verso, flèche « retourner » + Espace. Notation 4 boutons (À revoir / Difficile / Bien / Facile) sous la carte, touches 1–4. |
| **Toast** | bas centré, 4 s, `role="status"`, jamais seul porteur d'information. |
| **CommandPalette** | modale 640 px, champ en haut, résultats groupés (Formules / Exercices), flèches + Entrée, Échap ferme. |
| **EmptyState** | forme géométrique fine + titre + conseil + action. |

## 10. Pages (plans)

### Accueil
```
[Header : logo | Formules Exercices Réviser Progression | 🔍 ⌘K  ◐ thème]
Hero (2 colonnes ≥ 1024) : gauche : H1 serif 4xl, sous-titre, champ de recherche large, 3 liens rapides
                           droite : grande carte « formule vivante » (4 formules en rotation, révélation des termes)
Par niveau   : bande de 7 cartes (n°, libellé, nb de formules), défilement horizontal en mobile
Par domaine  : grille de tuiles (icône, nom, nb de formules)
Formule du jour (carte large) | À réviser aujourd'hui (n fiches + bouton)
Comment réviser : 4 cartes (Fiches, Quiz, Exercices, Progression)
Footer : navigation, à propos, mentions légales, confidentialité, « Signaler une erreur »
```

### Catalogue de formules
```
Titre + compteur | recherche | tri | bascule grille/liste
Chips des filtres actifs  [Tout effacer]
┌ Filtres (280 px, sticky) ┐ ┌ Résultats (grille) ─────────────┐
│ Matière                  │ │ FormulaCard  FormulaCard  ...    │
│ Domaine (cases + comptes)│ │                                  │
│ Niveau (plage 1–7)       │ │ pagination / « Charger plus »    │
│ Difficulté (1–5)         │ └──────────────────────────────────┘
│ Contenu (graph/preuve…)  │  Mobile : bouton « Filtres » → tiroir plein écran
│ Mon avancement           │
└──────────────────────────┘
```
L'état est dans l'URL (`?q=&domain=&level=2-4&sort=`), partageable.

### Détail d'une formule
```
Fil d'Ariane (Formules › Géométrie › Théorème de Pythagore)
H1 serif 4xl | chips : domaine · niveau · difficulté
Actions : Marquer maîtrisée · Ajouter aux fiches · Copier LaTeX · Imprimer
FormulaDisplay (+ onglets de variantes)
VariableLegend
┌ Contenu (68ch) ─────────────────────┐ ┌ Rail sticky (280 px) ───────────┐
│ Intuition · Explication · Démonstr. │ │ Sur cette page (sommaire)       │
│ Graphique interactif · Histoire     │ │ Exercices liés (3 max + voir +) │
│ Méthodes · Applications · Erreurs   │ │ À connaître avant               │
│ Pour aller plus loin                │ │ Formules liées / Ne pas confondre│
└─────────────────────────────────────┘ └─────────────────────────────────┘
Précédent / Suivant dans le domaine
```
Mobile : le rail passe sous le contenu ; le sommaire devient un menu déroulant collant.

### Exercice
Fil d'Ariane, chips (type, durée, niveau) ; énoncé ; zone de réponse (QCM / champ numérique / auto-évaluation) ; bouton Vérifier ; indices un par un ; solution repliée ; retour (icône + texte + couleur) ; « Exercice suivant » ; formules liées en chips.

### Réviser
Hub : carte « À réviser aujourd'hui » (n fiches, bouton Commencer) ; modes (Fiches, Quiz, + modes futurs) ; paquets. Session de fiches : plein écran sobre, barre de progression en haut, carte centrée, notation en bas, bilan final (réussite, temps, prochaines échéances).

### Progression
Anneau global ; barres par niveau et domaine ; calendrier d'activité 12 semaines (carrés 12 px, 4 intensités de `--primary`) ; série ; export / import / réinitialisation (confirmation) ; rappel « stocké sur cet appareil ».

## 11. Accessibilité (WCAG 2.2 AA minimum)

Contrastes ≥ 4.5:1 (3:1 grands textes et composants) ; navigation clavier complète ; focus toujours visible ; cibles ≥ 44 px sur mobile ; landmarks (`header`, `nav`, `main`, `footer`) ; lien d'évitement ; une seule `h1` par page ; formules KaTeX avec leur annotation MathML (conservée par KaTeX, ne pas la masquer) ; images/figures avec alternative ; états non portés par la couleur seule ; respect de `prefers-reduced-motion` et `prefers-color-scheme` ; zoom 200 % sans perte.

## 12. À éviter

Dégradés bleu-violet, verre dépoli partout, emojis comme icônes, trois cartes identiques en rang d'oignons sans hiérarchie, texte centré sur toute la page, ombres lourdes, animations d'entrée sur chaque élément, polices externes, couleurs « inventées » hors tokens, popups modales au chargement.
