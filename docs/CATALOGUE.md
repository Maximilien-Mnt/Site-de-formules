# Catalogue des formules

Liste maîtresse de toutes les formules prévues pour le site : **117 formules** en 4 lots. Le lot 1 est écrit et fourni dans le dépôt (en `status: draft` tant que tu ne l'as pas relu) ; les lots 2 à 4 sont à rédiger (pipeline C1 → C4 de `docs/CONTENT_GUIDE.md`, ou demande-moi de les écrire).

## Vue d'ensemble

| Lot | Contenu | Niveaux | Formules | État |
|---|---|---|---|---|
| 1 | Socle toutes matières + 4 formules du starter | 1 à 7 | 45 | ✅ écrit (draft), 89 exercices |
| 2 | Fondamentaux primaire et collège | 1 à 3 | 22 | ⏳ à rédiger |
| 3 | Lycée (début et fin) | 4 et 5 | 34 | ⏳ à rédiger |
| 4 | Université | 6 et 7 | 16 | ⏳ à rédiger |

Répartition par niveau (lot 1 / lot 2 / lot 3 / lot 4) :

| Niveau | Lot 1 | Lot 2 | Lot 3 | Lot 4 | Total |
|---|---|---|---|---|---|
| 1 | 2 | 3 | 0 | 0 | 5 |
| 2 | 4 | 3 | 0 | 0 | 7 |
| 3 | 11 | 16 | 0 | 0 | 27 |
| 4 | 15 | 0 | 18 | 0 | 33 |
| 5 | 9 | 0 | 16 | 0 | 25 |
| 6 | 3 | 0 | 0 | 9 | 12 |
| 7 | 1 | 0 | 0 | 7 | 8 |

## Informations fournies pour chaque formule du lot 1

Chaque formule a 2 fichiers de contenu (`src/content/formulas/<id>.yaml` et `src/content/formula-texts/fr/<id>.mdx`) et au moins 2 exercices (`src/content/exercises/` + `src/content/exercise-texts/fr/`). Elles contiennent : domaine, thèmes (`topics`), niveau, difficulté, date d'origine approximative (si elle est sûre), formule LaTeX et variantes, variables avec leur description, prérequis / formules liées / « à ne pas confondre », graphique interactif quand il est pertinent, et le texte en sections (intuition, explication avec exemple chiffré, démonstration quand elle est courte, histoire, méthodes, applications, erreurs classiques).

## Lot 1 — écrit

| # | id | Titre | Domaine | Niv. | Diff. | Formule | Exos | Prérequis |
|---|---|---|---|---|---|---|---|---|
| 1 | `commutativite` | Commutativité de l'addition et de la multiplication | Arithmétique | 1 | 1 | `a + b = b + a \qquad a \times b = b \times a` | 2 | — |
| 2 | `perimetre-rectangle` | Périmètre d'un rectangle | Géométrie | 1 | 1 | `P = 2 \times (L + \ell)` | 3 | — |
| 3 | `division-euclidienne` | Division euclidienne | Arithmétique | 2 | 2 | `a = b \times q + r \quad\text{avec}\quad 0 \leq r < b` | 2 | — |
| 4 | `pourcentage` | Calculer avec des pourcentages | Arithmétique | 2 | 2 | `V = \dfrac{p}{100} \times T` | 2 | — |
| 5 | `aire-rectangle` | Aire d'un rectangle | Géométrie | 2 | 1 | `A = L \times \ell` | 2 | — |
| 6 | `aire-triangle` | Aire d'un triangle | Géométrie | 2 | 2 | `A = \dfrac{b \times h}{2}` | 2 | aire-rectangle |
| 7 | `fonction-affine` | Fonction affine | Algèbre | 3 | 2 | `f(x) = ax + b` | 2 | — |
| 8 | `identites-remarquables` | Identités remarquables | Algèbre | 3 | 2 | `(a + b)^{2} = a^{2} + 2ab + b^{2}` | 2 | — |
| 9 | `regles-puissances` | Règles de calcul sur les puissances | Algèbre | 3 | 2 | `a^{m} \times a^{n} = a^{m+n}` | 2 | — |
| 10 | `aire-disque` | Aire d'un disque * | Géométrie | 3 | 1 | `A = \pi r^{2}` | 3 | — |
| 11 | `perimetre-cercle` | Périmètre d'un cercle | Géométrie | 3 | 1 | `P = 2 \pi r` | 2 | — |
| 12 | `pythagore` | Théorème de Pythagore * | Géométrie | 3 | 2 | `a^{2} + b^{2} = c^{2}` | 4 | — |
| 13 | `volume-cylindre` | Volume d'un cylindre | Géométrie | 3 | 2 | `V = \pi r^{2} h` | 2 | aire-disque |
| 14 | `thales` | Théorème de Thalès | Géométrie | 3 | 3 | `\dfrac{AM}{AB} = \dfrac{AN}{AC} = \dfrac{MN}{BC}` | 2 | — |
| 15 | `probabilite-equiprobable` | Probabilité dans une situation équiprobable | Probabilités | 3 | 1 | `P(A) = \dfrac{\text{nombre de cas favorables}}{\text{nombre de cas possibles}}` | 2 | — |
| 16 | `moyenne-arithmetique` | Moyenne arithmétique | Statistiques | 3 | 1 | `\bar{x} = \dfrac{x_{1} + x_{2} + \dots + x_{n}}{n}` | 2 | — |
| 17 | `trigonometrie-triangle-rectangle` | Sinus, cosinus et tangente dans un triangle rectangle | Trigonométrie | 3 | 2 | `\sin\alpha = \dfrac{\text{opposé}}{\text{hypoténuse}} \qquad \cos\alpha = \dfrac{\text{adjacent}}{\text{hypoténuse}} \qquad \tan\alpha = \dfrac{\text{opposé}}{\text{adjacent}}` | 2 | pythagore |
| 18 | `discriminant-trinome` | Discriminant et racines d'un trinôme du second degré * | Algèbre | 4 | 2 | `\Delta = b^{2} - 4ac` | 2 | identites-remarquables |
| 19 | `forme-canonique-trinome` | Forme canonique d'un trinôme du second degré | Algèbre | 4 | 3 | `ax^{2} + bx + c = a\,(x - \alpha)^{2} + \beta` | 2 | discriminant-trinome, identites-remarquables |
| 20 | `viete-somme-produit` | Somme et produit des racines | Algèbre | 4 | 3 | `x_{1} + x_{2} = -\dfrac{b}{a} \qquad x_{1}\,x_{2} = \dfrac{c}{a}` | 2 | discriminant-trinome |
| 21 | `derivees-usuelles` | Dérivées des fonctions usuelles | Analyse | 4 | 2 | `(x^{n})^{\prime} = n\,x^{n-1}` | 3 | nombre-derive, regles-puissances |
| 22 | `suite-arithmetique` | Suite arithmétique | Analyse | 4 | 2 | `u_{n} = u_{0} + n \times r` | 3 | fonction-affine |
| 23 | `suite-geometrique` | Suite géométrique | Analyse | 4 | 2 | `u_{n} = u_{0} \times q^{n}` | 2 | regles-puissances |
| 24 | `derivee-produit-quotient` | Dérivée d'un produit et d'un quotient | Analyse | 4 | 3 | `(uv)^{\prime} = u^{\prime}v + uv^{\prime}` | 2 | derivees-usuelles |
| 25 | `nombre-derive` | Nombre dérivé et tangente | Analyse | 4 | 3 | `f^{\prime}(a) = \lim_{h \to 0} \dfrac{f(a + h) - f(a)}{h}` | 2 | fonction-affine |
| 26 | `somme-premiers-entiers` | Somme des premiers entiers | Math. discrètes | 4 | 2 | `1 + 2 + 3 + \dots + n = \dfrac{n(n+1)}{2}` | 2 | — |
| 27 | `coefficient-binomial` | Coefficients binomiaux et triangle de Pascal | Math. discrètes | 4 | 3 | `\binom{n}{k} = \dfrac{n!}{k!\,(n - k)!}` | 4 | — |
| 28 | `distance-plan` | Distance entre deux points du plan | Géométrie | 4 | 2 | `AB = \sqrt{(x_{B} - x_{A})^{2} + (y_{B} - y_{A})^{2}}` | 2 | pythagore |
| 29 | `probabilite-conditionnelle` | Probabilité conditionnelle | Probabilités | 4 | 3 | `P_{A}(B) = \dfrac{P(A \cap B)}{P(A)}` | 3 | probabilite-equiprobable |
| 30 | `variance-ecart-type` | Variance et écart type | Statistiques | 4 | 3 | `V = \dfrac{1}{n}\sum_{i=1}^{n}\left(x_{i} - \bar{x}\right)^{2} \qquad \sigma = \sqrt{V}` | 2 | moyenne-arithmetique |
| 31 | `identite-trigonometrique` | Relation fondamentale de la trigonométrie * | Trigonométrie | 4 | 2 | `\cos^{2}\theta + \sin^{2}\theta = 1` | 2 | pythagore, trigonometrie-triangle-rectangle |
| 32 | `loi-des-cosinus` | Loi des cosinus (théorème d'Al-Kashi) | Trigonométrie | 4 | 3 | `a^{2} = b^{2} + c^{2} - 2bc\cos A` | 2 | pythagore, trigonometrie-triangle-rectangle |
| 33 | `binome-newton` | Formule du binôme de Newton | Algèbre | 5 | 3 | `(a + b)^{n} = \sum_{k=0}^{n}\binom{n}{k}\,a^{\,n-k}\,b^{\,k}` | 2 | coefficient-binomial, identites-remarquables |
| 34 | `euler-formule` | Formule d'Euler | Algèbre | 5 | 3 | `e^{i\theta} = \cos\theta + i\sin\theta` | 2 | identite-trigonometrique, exponentielle-proprietes |
| 35 | `exponentielle-proprietes` | Fonction exponentielle et ses propriétés | Analyse | 5 | 2 | `e^{a + b} = e^{a} \times e^{b}` | 3 | regles-puissances, derivees-usuelles |
| 36 | `logarithme-proprietes` | Logarithme népérien et ses propriétés | Analyse | 5 | 2 | `\ln(ab) = \ln a + \ln b` | 2 | exponentielle-proprietes |
| 37 | `theoreme-fondamental-analyse` | Théorème fondamental de l'analyse | Analyse | 5 | 3 | `\int_{a}^{b} f(x)\,dx = F(b) - F(a)` | 2 | derivees-usuelles |
| 38 | `integration-par-parties` | Intégration par parties | Analyse | 5 | 4 | `\int_{a}^{b} u(x)\,v^{\prime}(x)\,dx = \Big[u(x)\,v(x)\Big]_{a}^{b} - \int_{a}^{b} u^{\prime}(x)\,v(x)\,dx` | 2 | theoreme-fondamental-analyse, derivee-produit-quotient |
| 39 | `determinant-inverse-2x2` | Déterminant et inverse d'une matrice 2×2 | Algèbre linéaire | 5 | 2 | `\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc` | 2 | — |
| 40 | `loi-binomiale` | Loi binomiale | Probabilités | 5 | 3 | `P(X = k) = \binom{n}{k}\,p^{k}\,(1 - p)^{n-k}` | 2 | coefficient-binomial, probabilite-equiprobable |
| 41 | `theoreme-de-bayes` | Théorème de Bayes | Probabilités | 5 | 3 | `P_{B}(A) = \dfrac{P_{A}(B)\,P(A)}{P(B)}` | 2 | probabilite-conditionnelle |
| 42 | `serie-geometrique` | Série géométrique | Analyse | 6 | 3 | `\sum_{k=0}^{\infty} q^{k} = \dfrac{1}{1 - q} \quad (\|q\| < 1)` | 2 | suite-geometrique |
| 43 | `taylor` | Formule de Taylor | Analyse | 6 | 4 | `f(x) = \sum_{k=0}^{n}\dfrac{f^{(k)}(a)}{k!}\,(x - a)^{k} + R_{n}(x)` | 2 | derivees-usuelles, exponentielle-proprietes |
| 44 | `produit-matriciel` | Produit matriciel | Algèbre linéaire | 6 | 3 | `(AB)_{ij} = \sum_{k=1}^{n} a_{ik}\,b_{kj}` | 2 | determinant-inverse-2x2 |
| 45 | `integrale-gaussienne` | Intégrale de Gauss et loi normale | Analyse | 7 | 4 | `\int_{-\infty}^{+\infty} e^{-x^{2}}\,dx = \sqrt{\pi}` | 2 | theoreme-fondamental-analyse, exponentielle-proprietes |

\* formule du starter (déjà publiée), dont seules les relations (`related`, `confusedWith`, `prerequisites`) sont mises à jour.

## Lot 2 — fondamentaux (niveaux 1 à 3), à rédiger

| # | id | Titre | Domaine | Niv. | Diff. | Formule |
|---|---|---|---|---|---|---|
| 1 | `associativite` | Associativité de l'addition et de la multiplication | Arithmétique | 1 | 1 | `(a+b)+c = a+(b+c)` |
| 2 | `relation-addition-soustraction` | Addition et soustraction, opérations inverses | Arithmétique | 1 | 1 | `a+b=c \iff c-b=a` |
| 3 | `perimetre-polygone` | Périmètre d'un polygone | Géométrie | 1 | 1 | `P = a_1 + a_2 + \dots + a_n` |
| 4 | `distributivite` | Distributivité de la multiplication | Algèbre | 2 | 2 | `k(a+b) = ka + kb` |
| 5 | `aire-parallelogramme` | Aire d'un parallélogramme | Géométrie | 2 | 2 | `A = b \times h` |
| 6 | `volume-pave` | Volume d'un pavé droit et d'un cube | Géométrie | 2 | 2 | `V = L \times \ell \times h` |
| 7 | `equation-premier-degre` | Équation du premier degré | Algèbre | 3 | 1 | `ax+b=0 \iff x=-\dfrac{b}{a}` |
| 8 | `double-distributivite` | Double distributivité | Algèbre | 3 | 2 | `(a+b)(c+d)=ac+ad+bc+bd` |
| 9 | `racine-carree-regles` | Règles sur les racines carrées | Algèbre | 3 | 2 | `\sqrt{ab}=\sqrt a\sqrt b` |
| 10 | `fractions-equivalentes` | Fractions égales | Arithmétique | 3 | 1 | `\dfrac{a}{b} = \dfrac{k\,a}{k\,b}` |
| 11 | `vitesse-moyenne` | Vitesse moyenne | Arithmétique | 3 | 1 | `v = \dfrac{d}{t}` |
| 12 | `evolution-pourcentage` | Évolution en pourcentage | Arithmétique | 3 | 2 | `V_f = V_i\left(1+\dfrac{t}{100}\right)` |
| 13 | `notation-scientifique` | Notation scientifique | Arithmétique | 3 | 2 | `x = a \times 10^{n},\ 1\le a<10` |
| 14 | `operations-fractions` | Additionner et multiplier des fractions | Arithmétique | 3 | 2 | `\dfrac{a}{b}+\dfrac{c}{d} = \dfrac{ad+bc}{bd}` |
| 15 | `produit-en-croix` | Égalité de deux quotients (produit en croix) | Arithmétique | 3 | 2 | `\dfrac{a}{b}=\dfrac{c}{d} \iff ad = bc` |
| 16 | `aire-losange` | Aire d'un losange | Géométrie | 3 | 1 | `A = \dfrac{D \times d}{2}` |
| 17 | `somme-angles-triangle` | Somme des angles d'un triangle | Géométrie | 3 | 1 | `\hat A + \hat B + \hat C = 180^\circ` |
| 18 | `aire-trapeze` | Aire d'un trapèze | Géométrie | 3 | 2 | `A = \dfrac{(B+b)\,h}{2}` |
| 19 | `somme-angles-polygone` | Somme des angles d'un polygone convexe | Géométrie | 3 | 2 | `(n-2)\times 180^\circ` |
| 20 | `volume-cone-pyramide` | Volume d'un cône et d'une pyramide | Géométrie | 3 | 3 | `V = \dfrac{1}{3}\,B\,h` |
| 21 | `volume-sphere` | Volume et aire d'une sphère | Géométrie | 3 | 3 | `V = \dfrac{4}{3}\pi r^3 \quad S = 4\pi r^2` |
| 22 | `frequence` | Fréquence et proportion | Statistiques | 3 | 1 | `f = \dfrac{n}{N}` |

## Lot 3 — lycée (niveaux 4 et 5), à rédiger

| # | id | Titre | Domaine | Niv. | Diff. | Formule |
|---|---|---|---|---|---|---|
| 1 | `arrangements-permutations` | Arrangements et permutations | Math. discrètes | 4 | 2 | `A_n^k=\dfrac{n!}{(n-k)!}` |
| 2 | `inclusion-exclusion` | Cardinal d'une réunion | Math. discrètes | 4 | 2 | `\lvert A\cup B\rvert=\lvert A\rvert+\lvert B\rvert-\lvert A\cap B\rvert` |
| 3 | `somme-carres` | Somme des carrés des premiers entiers | Math. discrètes | 4 | 3 | `\sum_{k=1}^{n}k^2=\dfrac{n(n+1)(2n+1)}{6}` |
| 4 | `milieu-segment` | Milieu d'un segment | Géométrie | 4 | 1 | `M\left(\tfrac{x_A+x_B}{2};\tfrac{y_A+y_B}{2}\right)` |
| 5 | `colinearite-vecteurs` | Colinéarité de deux vecteurs | Géométrie | 4 | 2 | `xy^{\prime}-x^{\prime}y=0` |
| 6 | `equation-cercle` | Équation d'un cercle | Géométrie | 4 | 2 | `(x-a)^2+(y-b)^2=r^2` |
| 7 | `equation-droite-cartesienne` | Équation cartésienne d'une droite | Géométrie | 4 | 2 | `ax+by+c=0` |
| 8 | `longueur-arc-aire-secteur` | Longueur d'un arc et aire d'un secteur | Géométrie | 4 | 2 | `L=r\theta \quad A=\tfrac12 r^2\theta` |
| 9 | `aire-triangle-sinus` | Aire d'un triangle avec un sinus | Géométrie | 4 | 3 | `A=\tfrac12\,ab\sin C` |
| 10 | `formule-heron` | Formule de Héron | Géométrie | 4 | 3 | `A=\sqrt{p(p-a)(p-b)(p-c)}` |
| 11 | `produit-scalaire` | Produit scalaire | Géométrie | 4 | 3 | `\vec u\cdot\vec v=\lVert\vec u\rVert\lVert\vec v\rVert\cos\theta=xx^{\prime}+yy^{\prime}` |
| 12 | `pgcd-euclide` | Algorithme d'Euclide | Théorie des nombres | 4 | 2 | `\gcd(a,b)=\gcd(b,\ a \bmod b)` |
| 13 | `probabilite-reunion` | Probabilité d'une réunion | Probabilités | 4 | 2 | `P(A\cup B)=P(A)+P(B)-P(A\cap B)` |
| 14 | `conversion-radians-degres` | Radians et degrés | Trigonométrie | 4 | 1 | `\alpha_{rad} = \alpha_{deg}\times\dfrac{\pi}{180}` |
| 15 | `angles-remarquables` | Valeurs remarquables du sinus et du cosinus | Trigonométrie | 4 | 2 | `\cos\tfrac{\pi}{3}=\tfrac12,\ \sin\tfrac{\pi}{3}=\tfrac{\sqrt3}{2}` |
| 16 | `formules-addition-trigo` | Formules d'addition | Trigonométrie | 4 | 3 | `\cos(a+b)=\cos a\cos b-\sin a\sin b` |
| 17 | `formules-duplication` | Formules de duplication | Trigonométrie | 4 | 3 | `\cos 2a = \cos^2 a-\sin^2 a` |
| 18 | `loi-des-sinus` | Loi des sinus | Trigonométrie | 4 | 3 | `\dfrac{a}{\sin A}=\dfrac{b}{\sin B}=\dfrac{c}{\sin C}` |
| 19 | `module-complexe` | Module et conjugué d'un nombre complexe | Algèbre | 5 | 2 | `\lvert z\rvert^2=a^2+b^2=z\bar z` |
| 20 | `forme-trigonometrique-moivre` | Forme trigonométrique et formule de Moivre | Algèbre | 5 | 3 | `(\cos\theta+i\sin\theta)^n=\cos n\theta+i\sin n\theta` |
| 21 | `racines-nieme-unite` | Racines n-ièmes de l'unité | Algèbre | 5 | 4 | `z_k=e^{2ik\pi/n}` |
| 22 | `derivees-exp-ln-trigo` | Dérivées de exp, ln, sin et cos | Analyse | 5 | 2 | `(\sin x)^{\prime}=\cos x` |
| 23 | `limite-suite-geometrique` | Limite d'une suite géométrique | Analyse | 5 | 2 | `\lvert q\rvert<1\Rightarrow q^n\to 0` |
| 24 | `primitives-usuelles` | Primitives usuelles | Analyse | 5 | 2 | `\int e^{x}\,dx=e^{x}+C` |
| 25 | `derivee-composee` | Dérivée d'une fonction composée | Analyse | 5 | 3 | `(g\circ f)^{\prime}=f^{\prime}\times g^{\prime}\circ f` |
| 26 | `equation-differentielle-ordre-1` | Équation différentielle y' = ay + b | Analyse | 5 | 3 | `y=Ce^{ax}-\dfrac{b}{a}` |
| 27 | `limites-usuelles` | Limites usuelles et croissances comparées | Analyse | 5 | 3 | `\lim_{x\to+\infty}\dfrac{e^x}{x^n}=+\infty` |
| 28 | `valeur-moyenne` | Valeur moyenne d'une fonction | Analyse | 5 | 3 | `\mu=\dfrac{1}{b-a}\int_a^b f(x)\,dx` |
| 29 | `distance-point-droite` | Distance d'un point à une droite | Géométrie | 5 | 3 | `d=\dfrac{\lvert ax_0+by_0+c\rvert}{\sqrt{a^2+b^2}}` |
| 30 | `congruences` | Congruences | Théorie des nombres | 5 | 3 | `a\equiv b\ [n]\iff n\mid a-b` |
| 31 | `identite-bezout` | Identité de Bézout | Théorie des nombres | 5 | 3 | `au+bv=\gcd(a,b)` |
| 32 | `esperance-variance-discrete` | Espérance et variance d'une variable discrète | Probabilités | 5 | 3 | `E(X)=\sum x_i p_i` |
| 33 | `loi-uniforme-exponentielle` | Lois uniforme et exponentielle | Probabilités | 5 | 3 | `P(X\le t)=1-e^{-\lambda t}` |
| 34 | `intervalle-fluctuation` | Intervalle de fluctuation | Statistiques | 5 | 3 | `\left[p-\tfrac{1}{\sqrt n};\ p+\tfrac{1}{\sqrt n}\right]` |

## Lot 4 — université (niveaux 6 et 7), à rédiger

| # | id | Titre | Domaine | Niv. | Diff. | Formule |
|---|---|---|---|---|---|---|
| 1 | `equation-differentielle-ordre-2` | Équation différentielle linéaire d'ordre 2 | Analyse | 6 | 3 | `r^2+pr+q=0` |
| 2 | `gradient` | Gradient et dérivées partielles | Analyse | 6 | 3 | `\nabla f=\left(\tfrac{\partial f}{\partial x},\tfrac{\partial f}{\partial y}\right)` |
| 3 | `inegalite-triangulaire` | Inégalité triangulaire | Algèbre linéaire | 6 | 3 | `\lVert u+v\rVert\le\lVert u\rVert+\lVert v\rVert` |
| 4 | `produit-vectoriel` | Produit vectoriel | Algèbre linéaire | 6 | 3 | `\lVert u\times v\rVert=\lVert u\rVert\lVert v\rVert\sin\theta` |
| 5 | `cauchy-schwarz` | Inégalité de Cauchy-Schwarz | Algèbre linéaire | 6 | 4 | `\lvert\langle u,v\rangle\rvert\le\lVert u\rVert\lVert v\rVert` |
| 6 | `valeurs-propres` | Valeurs propres et polynôme caractéristique | Algèbre linéaire | 6 | 4 | `\det(A-\lambda I)=0` |
| 7 | `petit-theoreme-fermat` | Petit théorème de Fermat | Théorie des nombres | 6 | 4 | `a^{p-1}\equiv 1\ [p]` |
| 8 | `inegalite-tchebychev` | Inégalité de Bienaymé-Tchebychev | Probabilités | 6 | 3 | `P(\lvert X-E(X)\rvert\ge a)\le\dfrac{V(X)}{a^2}` |
| 9 | `loi-grands-nombres` | Loi des grands nombres | Probabilités | 6 | 4 | `\bar X_n\longrightarrow E(X)` |
| 10 | `changement-variables-jacobien` | Changement de variables dans une intégrale double | Analyse | 7 | 4 | `dx\,dy=\lvert J\rvert\,du\,dv` |
| 11 | `fonction-gamma` | Fonction Gamma | Analyse | 7 | 4 | `\Gamma(n)=(n-1)!` |
| 12 | `formule-stirling` | Formule de Stirling | Analyse | 7 | 4 | `n!\sim\sqrt{2\pi n}\left(\tfrac{n}{e}\right)^n` |
| 13 | `serie-fourier` | Série de Fourier | Analyse | 7 | 4 | `f(x)=\sum_{n}c_n e^{inx}` |
| 14 | `theoreme-du-rang` | Théorème du rang | Algèbre linéaire | 7 | 4 | `\dim E=\dim\ker f+\operatorname{rg} f` |
| 15 | `theoreme-euler-indicatrice` | Théorème d'Euler et indicatrice | Théorie des nombres | 7 | 4 | `a^{\varphi(n)}\equiv 1\ [n]` |
| 16 | `theoreme-central-limite` | Théorème central limite | Probabilités | 7 | 4 | `\dfrac{\bar X_n-\mu}{\sigma/\sqrt n}\to\mathcal N(0,1)` |

## Règles pour ajouter ou déplacer une formule

- L'identifiant est en kebab-case ASCII et en français (`loi-des-sinus`). Il ne change plus une fois publié (c'est l'URL).
- Les prérequis doivent avoir un niveau inférieur ou égal à la formule (vérifié par `npm run audit:content`).
- Un lot est cohérent : toutes les formules citées dans `prerequisites`, `related` et `confusedWith` existent déjà ou font partie du lot.
- Les dates (`originYear`) sont approximatives et ne sont renseignées que si elles sont sûres.
