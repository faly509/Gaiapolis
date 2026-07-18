# 🌍 Gaiapolis — EcoCity Engine

**Prototype open source de simulation de ville écologique et d’habitat autonome**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0--alpha-orange.svg)]()
[![Status](https://img.shields.io/badge/status-public%20prototype-yellow.svg)]()
[![Data](https://img.shields.io/badge/data-Open--Meteo%20%2B%20OpenStreetMap-blue.svg)]()
[![Validate static app](https://github.com/faly509/Gaiapolis/actions/workflows/validate.yml/badge.svg)](https://github.com/faly509/Gaiapolis/actions/workflows/validate.yml)

> *Et si concevoir un habitat autonome devenait aussi intuitif qu’un city-builder ?*

Gaiapolis est un simulateur écologique jouable dans le navigateur. Le joueur choisit un lieu, observe ses ressources, place des bâtiments, sélectionne des matériaux et améliore progressivement l’autonomie énergétique, hydrique et alimentaire de son habitat.

🎮 **Démo :** https://faly509.github.io/Gaiapolis/

> 🚧 **Statut :** prototype public expérimental. Les données, scores et recommandations sont des estimations simplifiées à but éducatif. Ce projet ne remplace pas une étude d’ingénierie, d’urbanisme ou de construction.

## ✨ Fonctionnalités v0.2.0-alpha

### Simulation et territoire

- Carte isométrique interactive 18×18
- 16 bâtiments et équipements, plus l’outil d’effacement
- 8 matériaux avec coût, solidité, isolation, humidité, CO₂ et écologie
- Simulation énergie, eau, nourriture, coût, entretien, confort et structure
- Recherche d’un lieu par Nominatim et climat sur 7 jours via Open-Meteo
- Couche expérimentale OpenStreetMap via Overpass : bâtiments, routes et eau
- Contraintes centralisées avec `canPlaceBuilding()`
- Optimiseur des cinq meilleurs emplacements autorisés

### Smartphone et PWA

- Carte prioritaire en plein écran sur smartphone
- Barre de construction tactile et défilable en bas
- Panneaux coulissants pour les outils et les statistiques
- Interface compatible portrait et paysage
- Ajustement automatique de la carte à la largeur disponible
- Zoom par boutons et pincement à deux doigts
- Tooltip tactile présenté comme une fiche en bas de l’écran
- Manifeste PWA, installation sur l’écran d’accueil et cache local de l’application
- Respect des zones sûres des téléphones avec encoche ou barre système

### Qualité technique

- Code séparé en fichiers CSS et JavaScript spécialisés
- Validation GitHub Actions de la syntaxe JavaScript, du manifeste et des fichiers référencés
- Sauvegarde locale compatible avec les versions précédentes

## 🚀 Lancer le projet

```bash
git clone https://github.com/faly509/Gaiapolis.git
cd Gaiapolis
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

Un serveur local est recommandé pour que les appels réseau vers Open-Meteo, Nominatim et Overpass se comportent comme sur GitHub Pages. Le service worker est volontairement activé uniquement sur le site GitHub Pages officiel afin d’éviter les caches gênants en développement local.

## 🎮 Comment jouer

1. Charger un lieu réel ou garder le terrain simulé.
2. Examiner les couches de soleil, vent, eau, fertilité et risques.
3. Choisir un bâtiment dans le panneau gauche ou la barre tactile.
4. Consulter les ressources et contraintes d’une tuile.
5. Construire uniquement sur un emplacement autorisé.
6. Utiliser **Optimiser** pour afficher les cinq meilleures tuiles disponibles.
7. Équilibrer énergie, eau, nourriture, coût, écologie, structure et confort.

Sur smartphone, le bouton `☰` ouvre les outils, `📊` ouvre le tableau de bord et `⌂` réajuste la carte à l’écran.

## 🌍 Données réelles et limites

Le prototype utilise :

- **Nominatim / OpenStreetMap** pour convertir un nom de lieu en coordonnées ;
- **Open-Meteo** pour la température, le vent, la pluie et le rayonnement à court terme ;
- **Overpass API / OpenStreetMap** pour récupérer des bâtiments, routes et éléments d’eau dans un rayon limité.

Les objets OpenStreetMap sont projetés approximativement sur une petite grille isométrique. Le terrain, la pente, l’hydrologie, la géothermie et les scores environnementaux ne représentent pas une étude locale exacte.

Le mode hors ligne permet de rouvrir l’application et d’utiliser le terrain simulé après une première visite réussie. Les données réelles nécessitent toujours une connexion réseau.

## 🗂️ Structure

```text
Gaiapolis/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .github/workflows/validate.yml
├── assets/
│   ├── icon.svg
│   ├── css/
│   │   ├── base.css
│   │   ├── game.css
│   │   └── mobile.css
│   └── js/
│       ├── 00-core.js ... 07-game.js
│       └── 08-mobile.js
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── LICENSE
```

## 🤝 Contribuer

Pour limiter les régressions :

1. créer une branche dédiée ;
2. garder les règles de placement centralisées dans `canPlaceBuilding()` ;
3. documenter les hypothèses de calcul ;
4. tester ordinateur, smartphone, terrain simulé et mode OSM ;
5. ouvrir une pull request décrivant les changements et limites.

## 🧭 Prochaines priorités

- déplacement réel de la caméra au doigt et à la souris ;
- appui long pour inspecter sans construire ;
- tests automatiques des règles métier et des sauvegardes ;
- icônes locales totalement disponibles hors ligne ;
- données topographiques et climatiques mieux adaptées à la planification ;
- migration progressive vers TypeScript lorsque le moteur sera stabilisé.

Consulter [ROADMAP.md](ROADMAP.md) pour le détail.

## 📜 Licence

MIT — libre d’utilisation, de modification et de distribution selon les conditions de la licence.

**Auteur :** Norbert Randriamaitso — norbert.randri@gmail.com

*Gaiapolis — construire non pas seulement une maison, mais un système vivant.* 🌿
