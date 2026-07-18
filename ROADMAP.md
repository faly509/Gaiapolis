# 🗺️ Feuille de route — Gaiapolis / EcoCity Engine

Les priorités peuvent évoluer selon les tests et les contributions.

## ✅ v0.1.5.1 — Territoire réel expérimental

- [x] Carte isométrique 18×18
- [x] Simulation énergie, eau, nourriture, coût, CO₂, structure et confort
- [x] Huit matériaux et seize équipements constructibles
- [x] Recherche de lieu avec Nominatim
- [x] Données météo à court terme avec Open-Meteo
- [x] Bâtiments, routes et eau OpenStreetMap via Overpass
- [x] Contraintes centralisées avec `canPlaceBuilding()`
- [x] Blocage des routes, bâtiments existants et tuiles occupées
- [x] Hydrolienne et micro-hydro soumises à des contraintes strictes
- [x] Optimiseur limité aux emplacements autorisés
- [x] Code séparé en fichiers CSS et JavaScript spécialisés

## 📱 v0.2.0-alpha — Mobile-first et PWA (version en test)

### Interface
- [x] Carte prioritaire en plein écran sur smartphone
- [x] Barre de construction tactile en bas
- [x] Panneaux coulissants pour lieu, couches et tableau de bord
- [x] Boutons et textes adaptés au tactile
- [x] Mode portrait utilisable et paysage optimisé

### Caméra et interactions
- [ ] Déplacement libre de la carte au doigt et à la souris
- [x] Zoom par boutons et pincement tactile
- [ ] Appui long pour consulter une tuile sans construire
- [x] Ajustement/recentrage de la carte à l’écran
- [ ] Zoom ancré précisément autour du geste ou du pointeur

### PWA
- [x] `manifest.webmanifest`
- [x] Service worker et cache des ressources locales
- [x] Installation sur écran d’accueil quand le navigateur le permet
- [x] Mode hors ligne partiel pour le terrain simulé après une première visite
- [ ] Icônes et polices entièrement locales hors ligne

### Fiabilité
- [ ] Tests automatiques de `canPlaceBuilding()`
- [ ] Tests des scores et sauvegardes
- [x] Gestion explicite des conflits après rechargement OSM
- [x] Vérifications de syntaxe dans GitHub Actions
- [ ] Tests de rendu et d’interaction sur plusieurs tailles d’écran

## 🌍 v0.3.0 — Données territoriales améliorées

- [ ] Vraie caméra cartographique avec MapLibre ou Leaflet
- [ ] Polygones OSM mieux rasterisés sur la grille
- [ ] Relief et pente issus d’un modèle numérique de terrain
- [ ] Données solaires historiques adaptées à la planification
- [ ] Hydrologie et risques mieux documentés
- [ ] Niveau de confiance visible pour chaque donnée
- [ ] Export JSON du projet
- [ ] Partage d’une ville par URL

## 🏗️ v0.4.0 — Simulation de l’habitat

- [ ] Température intérieure et besoins de chauffage/refroidissement
- [ ] Matériaux par composant du bâtiment
- [ ] Durée de vie et maintenance pluriannuelle
- [ ] Comparaison de deux conceptions
- [ ] Saisons, pluie dynamique, sécheresse et canicule
- [ ] Rapport environnemental simplifié

## 🎮 v0.5.0 — Gameplay et progression

- [ ] Budget initial et contraintes de scénario
- [ ] Déblocage progressif des technologies
- [ ] Défis d’autonomie énergétique, hydrique et alimentaire
- [ ] Tempêtes, inondations et événements climatiques
- [ ] Habitants et réactions visuelles

## 🏙️ v0.6.0 — Ville circulaire

- [ ] Accessibilité par réseau de chemins
- [ ] Déchets organiques vers compost et agriculture
- [ ] Méthanisation
- [ ] Réseaux énergétiques et hydriques
- [ ] Score d’économie circulaire
- [ ] Échelle écovillage puis quartier

## 🚀 v1.0 — Version stable

- [ ] Architecture TypeScript documentée
- [ ] Couverture de tests satisfaisante
- [ ] Interface ordinateur et smartphone stable
- [ ] PWA installable et hors ligne de manière fiable
- [ ] Traductions principales
- [ ] Scénarios éducatifs
- [ ] Documentation des hypothèses et limites scientifiques

## 💡 Backlog

- Mode Projet Venus et économie basée sur les ressources
- Export de rapports PDF
- Import/export de scénarios communautaires
- Mode collaboratif
- Réalité augmentée
- Export vers des formats d’architecture ou de SIG

*Construire avec la nature, sans prétendre remplacer l’expertise de terrain.*
