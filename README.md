# 🌍 Gaiapolis — EcoCity Engine

**Prototype open source de simulation de ville écologique et d’habitat autonome**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.5.1--alpha-orange.svg)]()
[![Status](https://img.shields.io/badge/status-public%20prototype-yellow.svg)]()
[![Data](https://img.shields.io/badge/data-Open--Meteo%20%2B%20OpenStreetMap-blue.svg)]()

> *Et si concevoir un habitat autonome devenait aussi intuitif qu’un city-builder ?*

Gaiapolis est un simulateur écologique jouable dans le navigateur. Le joueur choisit un lieu, observe ses ressources, place des bâtiments, sélectionne des matériaux et améliore progressivement l’autonomie énergétique, hydrique et alimentaire de son habitat.

🎮 **Démo :** https://faly509.github.io/Gaiapolis/

> 🚧 **Statut :** prototype public expérimental. Les données, scores et recommandations sont des estimations simplifiées à but éducatif. Ce projet ne remplace pas une étude d’ingénierie, d’urbanisme ou de construction.

## ✨ Fonctionnalités v0.1.5.1

- Carte isométrique interactive 18×18
- 16 bâtiments et équipements, plus l’outil d’effacement
- 8 matériaux avec coût, solidité, isolation, humidité, CO₂ et écologie
- Simulation énergie, eau, nourriture, coût, entretien, confort et structure
- Recherche d’un lieu par Nominatim et climat sur 7 jours via Open-Meteo
- Couche expérimentale OpenStreetMap via Overpass : bâtiments, routes et eau
- Blocage des constructions sur routes, bâtiments existants et tuiles occupées
- Contraintes strictes : hydrolienne sur eau avec courant, micro-hydro avec eau, débit et pente
- Score écologique et d’autarcie estimé pour certains bâtiments OSM
- Optimiseur des cinq meilleurs emplacements autorisés
- Tutoriel, objectifs, récompenses et sauvegarde locale

## 🚀 Lancer le projet

```bash
git clone https://github.com/faly509/Gaiapolis.git
cd Gaiapolis
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

Un serveur local est recommandé pour que les appels réseau vers Open-Meteo, Nominatim et Overpass se comportent comme sur GitHub Pages.

## 🎮 Comment jouer

1. Charger un lieu réel ou garder le terrain simulé.
2. Examiner les couches de soleil, vent, eau, fertilité et risques.
3. Choisir un bâtiment dans le panneau gauche.
4. Survoler une tuile pour consulter ses ressources et contraintes.
5. Construire uniquement sur un emplacement autorisé.
6. Utiliser **Optimiser** pour afficher les cinq meilleures tuiles disponibles.
7. Équilibrer énergie, eau, nourriture, coût, écologie, structure et confort.

## 🌍 Données réelles et limites

Le prototype utilise :

- **Nominatim / OpenStreetMap** pour convertir un nom de lieu en coordonnées ;
- **Open-Meteo** pour la température, le vent, la pluie et le rayonnement à court terme ;
- **Overpass API / OpenStreetMap** pour récupérer des bâtiments, routes et éléments d’eau dans un rayon limité.

Les objets OpenStreetMap sont projetés approximativement sur une petite grille isométrique. Le terrain, la pente, l’hydrologie, la géothermie et les scores environnementaux ne représentent pas une étude locale exacte.

## 🗂️ Structure

```text
Gaiapolis/
├── index.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   └── game.css
│   └── js/
│       ├── 00-core.js
│       ├── 01-data.js
│       ├── 02-terrain.js
│       ├── 03-osm.js
│       ├── 04-simulation.js
│       ├── 05-renderer.js
│       ├── 06-ui.js
│       └── 07-game.js
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── LICENSE
```

## 🤝 Contribuer

Les contributions sont bienvenues. Pour limiter les régressions :

1. créer une branche dédiée ;
2. garder les règles de placement centralisées dans `canPlaceBuilding()` ;
3. documenter les hypothèses de calcul ;
4. tester le terrain simulé et le mode OSM ;
5. ouvrir une pull request décrivant les changements et limites.

```bash
git checkout -b feature/ma-fonctionnalite
```

## 🧭 Prochaines priorités

- interface réellement mobile-first ;
- PWA installable et fonctionnement hors ligne partiel ;
- caméra tactile avec déplacement et zoom ;
- tests automatisés des règles métier ;
- données topographiques et climatiques mieux adaptées à la planification ;
- séparation progressive du moteur, des services de données et de l’interface.

Consulter [ROADMAP.md](ROADMAP.md) pour le détail.

## 📜 Licence

MIT — libre d’utilisation, de modification et de distribution selon les conditions de la licence.

**Auteur :** Norbert Randriamaitso — norbert.randri@gmail.com

*Gaiapolis — construire non pas seulement une maison, mais un système vivant.* 🌿
