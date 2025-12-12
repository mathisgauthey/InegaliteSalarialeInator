# Inégalité Salariale Inator - Angular 17

![inegalitesalarialeinator.png](inegalitesalarialeinator.png)

Cette application Angular 17 analyse la répartition salariale dans une ESN avec une distribution [log-normale](https://fr.wikipedia.org/wiki/Loi_log-normale#Esp%C3%A9rance_et_%C3%A9cart-type) réaliste.

En effet, la loi normale classique n'est pas adaptée aux salaires, dont la distribution est asymétrique avec une longue queue vers les hauts salaires. Cette application permet de visualiser cette inégalité salariale via un graphique interactif et des métriques clés que l'on peut obtenir dans les documents officiels.

## 🚀 Caractéristiques

- **Distribution log-normale** des salaires (plus réaliste que la normale)
- **Ajustement dynamique** via deux paramètres :
  - **Asymétrie** : Contrôle l'asymétrie de la distribution (0.2-1.0)
  - **Écart-type** : Contrôle la dispersion des salaires (0.1-0.8)
- **Graphique interactif** avec canvas HTML5
- **Calcul en temps réel** des métriques et percentiles
- **Tableau des déciles** pour visualiser les tranches salariales
- **Interface moderne** avec Tailwind CSS

## 📦 Installation des dépendances

```bash
npm install
```

## 🏃 Lancer l'application

```bash
npm start
```

L'application sera disponible sur `http://localhost:4200/`

## 🎯 Utilisation

### Paramètres ajustables

1. **Moyenne ESN** : Salaire moyen dans l'entreprise
2. **Médiane ESN** : Salaire médian (50e percentile)
3. **Mon Salaire** : Votre salaire pour comparaison
4. **Asymétrie** : 
   - Valeurs faibles (0.2-0.4) : Distribution plus symétrique
   - Valeurs élevées (0.6-1.0) : Distribution plus asymétrique avec une longue queue vers les hauts salaires
5. **Écart-type** :
   - Valeurs faibles (0.1-0.3) : Salaires plus concentrés
   - Valeurs élevées (0.4-0.8) : Salaires plus dispersés

### Lecture du graphique

- **Ligne rouge** : Votre salaire
- **Ligne bleue pointillée** : Médiane
- **Ligne verte pointillée** : Moyenne
- **Lignes grises pointillées** : Déciles (D1-D9)

La courbe montre la densité de probabilité : plus elle est haute, plus il y a de salariés à ce niveau.

## 🏗️ Architecture

### Structure du projet

```
src/
├── app/
│   ├── app.component.ts          # Composant principal avec logique métier
│   ├── app.component.html         # Template du composant principal
│   ├── app.component.css          # Styles du composant principal
│   └── salary-chart/
│       ├── salary-chart.component.ts    # Composant graphique avec Canvas
│       ├── salary-chart.component.html  # Template du graphique
│       └── salary-chart.component.css   # Styles du graphique
├── index.html                     # Page HTML principale
├── main.ts                        # Point d'entrée Angular
└── styles.css                     # Styles globaux avec Tailwind
```

### Composants standalone

L'application utilise les **composants standalone d'Angular 17** :
- Pas besoin de `NgModule`
- Import direct des dépendances dans chaque composant
- Plus simple et moderne

### Technologies

- **Angular 17** : Framework frontend
- **TypeScript** : Langage typé
- **Tailwind CSS** : Framework CSS utility-first
- **Canvas API** : Graphique personnalisé sans bibliothèque externe
- **Reactive Forms** : Gestion des formulaires avec `[(ngModel)]`

## 📊 Formule mathématique

La densité de probabilité d'une [loi log-normale](https://fr.wikipedia.org/wiki/Loi_log-normale) est définie par :

$$
f_{X}(x;\mu ,\sigma ) = \frac{1}{x\sigma \sqrt{2\pi}} \exp\left(-\frac{(\ln x-\mu )^{2}}{2\sigma ^{2}}\right) = \frac{1}{x} f_{Y}(\ln(x);\mu ,\sigma )
$$

Où :
- `x` = salaire
- `μ` = éspérance du logarithme des salaires
- `σ` = écart-type du logarithme des salaires

Mais comme :

$$
\begin{array}{rcl}
\text{Médiane} & = & \mathrm{e}^{\mu} \\
\text{Espérance} & = & \mathrm{e}^{\mu + \sigma^{2}/2}
\end{array}
$$

Alors, on obtient immédiatement :

$$
\begin{cases}
\mu = \ln(\text{Médiane}) \\[0.5em]
\sigma = \sqrt{2 \times \ln\left(\dfrac{\text{Moyenne}}{\text{Médiane}}\right)}
\end{cases}
$$

Notons que l'asymétrie vaut :

$$
{\displaystyle (\mathrm {e} ^{\sigma ^{2}}\!\!+2){\sqrt {\mathrm {e} ^{\sigma ^{2}}\!\!-1}}}
$$

La variance est quant à elle :

$$
{\displaystyle (\mathrm {e} ^{\sigma ^{2}}\!\!-1)\mathrm {e} ^{2\mu +\sigma ^{2}}}
$$

## 📄 Licence

MIT

