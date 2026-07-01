# 🗺️ Feuille de route — EcoCity Engine

Ce document liste les évolutions planifiées par version.
Les priorités peuvent changer selon les contributions de la communauté.

---

## ✅ v0.1.4 — Prototype public (actuel)

- [x] Carte isométrique 18×18 interactive
- [x] 8 couches environnementales animées
- [x] 17 bâtiments, 8 matériaux avec données réelles
- [x] Simulation énergie / eau / nourriture / CO₂
- [x] Énergies renouvelables : PV, thermique, éolien, hydrolien, micro-hydro, géothermie
- [x] Mode lieu réel (Nominatim + Open-Meteo, sans clé API)
- [x] Optimiseur de placement (top 5 tuiles)
- [x] 6 objectifs avec récompenses animées
- [x] Tutoriel 4 étapes
- [x] Effets particules / feedback visuel
- [x] Sauvegarde localStorage
- [x] Licence MIT, README GitHub

---

## 🔧 v0.2 — Construction écologique (3–6 mois)

### Matériaux
- [ ] Sélection de matériau par face/composant du bâtiment
- [ ] Empreinte carbone totale du projet en kg CO₂
- [ ] Comparaison entre deux designs (panneau côte à côte)

### Météo et saisons
- [ ] Simulation par saison (printemps / été / automne / hiver)
- [ ] Variation soleil selon la saison et l'hémisphère
- [ ] Pluie dynamique → remplissage citernes
- [ ] Événement : canicule (hausse conso), sécheresse (pénurie eau)

### Structure
- [ ] Score de solidité par bâtiment + terrain
- [ ] Alerte si pente ou sol instable
- [ ] Dégradation simplifiée sur 10 ans simulés

### Confort
- [ ] Température intérieure simulée (isolation × climat)
- [ ] Indice de confort affiché par bâtiment
- [ ] Habitants qui réagissent visuellement

---

## 🌍 v0.3 — Données réelles avancées (6–12 mois)

### Import GIS
- [ ] PVGIS API pour irradiation solaire réelle
- [ ] SRTM / OpenTopoData pour le relief (altitude, pente)
- [ ] OpenStreetMap Overpass pour l'hydrologie
- [ ] Biome MODIS simplifié

### Carte de terrain
- [ ] Représentation partielle du relief réel (collines, rivières)
- [ ] Superposition terrain réel + bâtiments du joueur

### Export
- [ ] Export JSON du plan de ville
- [ ] Export rapport PDF simplifié
- [ ] Partage de ville via URL encodée

---

## 🎮 v0.4 — Gameplay et progression (12–18 mois)

### Système de progression
- [ ] Niveaux de technologie (1→5)
- [ ] Budget de départ limité
- [ ] Déblocages progressifs de bâtiments

### Mode défi
- [ ] "Construire une maison autonome à 80% avec 50 000 €"
- [ ] "Survivre à une sécheresse de 30 jours"
- [ ] "Nourrir 20 habitants sans béton"
- [ ] "100% énergie renouvelable"

### Événements
- [ ] Tempête (dommages si résistance insuffisante)
- [ ] Inondation (zones à risque submergées)
- [ ] Bonus de bonne saison (surplus alimentaire)

---

## 🏙️ v0.5 — Ville circulaire (18–24 mois)

- [ ] Réseau de chemins avec accessibilité calculée
- [ ] Flux de déchets organiques → compost → potagers
- [ ] Méthanisation (déchets → énergie)
- [ ] Score économie circulaire
- [ ] Connexions énergétiques entre bâtiments (réseau virtuel)

---

## 🚀 v1.0 — Version stable

- [ ] Tests unitaires complets
- [ ] Documentation API interne
- [ ] Traductions (EN, ES, DE)
- [ ] Mode PWA (hors-ligne)
- [ ] Marketplace de bâtiments communautaires
- [ ] Version éducative pour écoles

---

## 💡 Idées futures (backlog)

- Réalité augmentée (AR sur terrain réel)
- Export IFC pour logiciels d'architecture
- Simulation multi-années avec dégradation
- Mode multijoueur collaboratif
- Génération automatique de plans de construction
- Comparaison de plusieurs designs côte à côte
- Mode Projet Venus (économie basée sur les ressources)

---

*Feuille de route mise à jour à chaque release. Proposer des modifications via une issue ou une discussion GitHub.*
