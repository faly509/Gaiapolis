# 🗺️ Feuille de route — Gaiapolis / EcoCity Engine

Les priorités peuvent évoluer selon les tests et les contributions.

## ✅ v0.1.5.1 — Territoire réel expérimental (actuel)

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

## 📱 v0.2.0 — Mobile-first et qualité technique

### Interface
- [ ] Carte prioritaire en plein écran sur smartphone
- [ ] Barre de construction tactile en bas
- [ ] Panneaux coulissants pour lieu, couches et tableau de bord
- [ ] Boutons et textes adaptés au tactile
- [ ] Mode portrait utilisable et paysage optimisé

### Caméra et interactions
- [ ] Déplacement de la carte au doigt et à la souris
- [ ] Zoom molette et pincement tactile
- [ ] Appui long pour consulter une tuile
- [ ] Recentrage de la carte

### PWA
- [ ] `manifest.webmanifest`
- [ ] Service worker et cache des ressources locales
- [ ] Installation sur écran d’accueil
- [ ] Mode hors ligne pour le terrain simulé

### Fiabilité
- [ ] Tests automatiques de `canPlaceBuilding()`
- [ ] Tests des scores et sauvegardes
- [ ] Gestion explicite des conflits après rechargement OSM
- [ ] Vérifications de syntaxe dans GitHub Actions

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
- [ ] PWA installable
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
