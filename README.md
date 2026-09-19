# 🌍 Gaiapolis — EcoCity Engine

**Prototype open source de simulation de ville écologique et d’habitat autonome**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.1--alpha-orange.svg)]()
[![Status](https://img.shields.io/badge/status-public%20prototype-yellow.svg)]()
[![Data](https://img.shields.io/badge/data-Open--Meteo%20%2B%20OpenStreetMap-blue.svg)]()
[![Validate static app](https://github.com/faly509/Gaiapolis/actions/workflows/validate.yml/badge.svg)](https://github.com/faly509/Gaiapolis/actions/workflows/validate.yml)

> *Et si concevoir un habitat autonome devenait aussi intuitif qu’un city-builder ?*

Gaiapolis est un simulateur écologique jouable dans le navigateur. Le joueur choisit un lieu, observe ses ressources, place des bâtiments, sélectionne des matériaux et améliore progressivement l’autonomie énergétique, hydrique et alimentaire de son habitat.

🎮 **Démo :** https://faly509.github.io/Gaiapolis/

> 🚧 **Statut :** prototype public expérimental. Les données, scores et recommandations sont des estimations simplifiées à but éducatif. Ce projet ne remplace pas une étude d’ingénierie, d’urbanisme ou de construction.

## ✨ Fonctionnalités v0.2.1-alpha

### Nouveautés : fiabilité et autonomie

- Sauvegarde automatique, copie de récupération, export/import JSON validé et retour à la carte précédente
- Annuler/rétablir les 40 dernières constructions ou suppressions (Ctrl+Z / Ctrl+Maj+Z)
- Déplacement de la carte, zoom à la molette ou au pincement, appui long / clic droit / mode Inspection
- Diagnostic de la ressource manquante et propositions de constructions avec gain estimé
- Comparaison de conditions sèches, peu ensoleillées et peu venteuses, sans modifier la partie
- Électricité et chaleur utile distinguées; eau de pluie limitée aux toits; eaux grises limitées aux habitants
- Compost voisin utile aux cultures; isolation prise en compte dans la demande énergétique
- Météo correctement convertie de MJ/m² en kWh/m²/j; valeurs zéro préservées
- Échec réseau : partie conservée, ou repli OSM explicitement signalé
- Icônes locales et cache PWA limité aux ressources de cette application
- Tests métier exécutables avec `node --test tests/*.test.cjs`

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

## 🧪 Vérifier les règles

```bash
node --test tests/*.test.cjs
```

La suite utilise uniquement le moteur de test intégré à Node.js, sans dépendance à installer. Les services externes sont simulés dans les tests d’échec; leur disponibilité n’est pas garantie par cette suite.

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

## 🔒 Sauvegarde et version de travail

Cette version part du prototype mobile `174ab03f640fd8b80f57b8e74325853257c66821`, avec deux points de retour créés avant modification :

- `backup/2026-09-19-main` : version publique `de1bbe0fb9e476adfc2a95739d9a70842b071da3`;
- `backup/2026-09-19-mobile` : prototype mobile `174ab03f640fd8b80f57b8e74325853257c66821`.

Les changements sont proposés dans une branche dédiée, sans modifier `main`. Les parties du navigateur utilisent une nouvelle clé; les anciennes clés `eco0151` et `eco015` sont conservées en lecture. Le fichier JSON exporté est le moyen de transférer une partie entre appareils. Le bouton **Retour carte** retrouve le dernier territoire remplacé par un import, un nouveau lieu ou une nouvelle carte (stockage local requis).

L’ancien modèle produisait des scores différents. Les constructions sont conservées lorsque valides, mais leurs résultats sont recalculés. Les données météo anciennes sont marquées « à recharger ».

Lire [l’analyse et le bilan](docs/AUDIT-2026-09-19.md) et [les hypothèses du modèle](docs/MODEL.md).

## 🧭 Prochaines priorités

- tests sur appareils physiques, notamment téléphone pliable;
- modèle horaire de stockage, potabilité et réseaux d’eau;
- données topographiques et climatiques historiques;
- paramètres de scénario, budget et objectifs éducatifs configurables;
- migration progressive vers TypeScript lorsque le moteur sera stabilisé.

Consulter [ROADMAP.md](ROADMAP.md) pour le détail.

## 📜 Licence

MIT — libre d’utilisation, de modification et de distribution selon les conditions de la licence.

**Auteur :** Norbert Randriamaitso — norbert.randri@gmail.com

*Gaiapolis — construire non pas seulement une maison, mais un système vivant.* 🌿
