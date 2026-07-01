# Changelog — EcoCity Engine

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)

---

## [0.1.4] — 2025 — Premier prototype public

### Refonte complète (réécriture depuis v0.1.3)

**Architecture**
- Code réorganisé en 12 sections commentées (DATA / TERRAIN / SIMULATION / RENDERER / TOOLTIP / UI / OBJECTIVES / TUTORIAL / OPTIMIZER / DASHBOARD / SAVE / LOOP)
- Suppression de toute duplication de logique
- Nommage unifié et cohérent dans tout le fichier

**Corrections de bugs (tous les bugs v0.1.3 corrigés)**
- `showLocCard()` : utilise `$t()` partout — les champs lieu/coords/biome/temp/rad/vent/pluie s'affichent correctement
- `placeSc()` : formule corrigée — `s -= floodRisk*40 + slope*20` (les deux sont des pénalités)
- CO₂ : affichage correct avec valeur numérique (`+720 kg` / `-180 kg`)
- Optimiseur : filtre uniquement les tuiles libres (`!placed[k]`)
- Simulation hydrolienne : dépend réellement de `hydrologicalFlow`
- Simulation micro-centrale : dépend de `hydrologicalFlow` × bonus `slope`
- Simulation géothermie : dépend de `geothermalPotential`
- Fallback robuste si API externes indisponibles

**Nouvelles fonctionnalités**
- Panneau lieu réel complet : lieu, coords, biome, temp, rayonnement, vent, pluie + mini-barres
- Disclaimer prototype visible + attribution sources (Open-Meteo / Nominatim)
- Tooltip étendu : 8 indicateurs + tags de recommandation colorés
- Material dialog avec description courte de chaque matériau
- Métriques colorées (vert/orange/rouge selon valeur)
- Score ring animé avec couleur selon niveau
- Tutoriel 4 étapes reconstruit
- Feedback placement enrichi : raisons spécifiques pour optimal et mauvais placement
- Overlays de couches 15% plus intenses (meilleure lisibilité)

**Design**
- Redesign complet du design system (couleurs, espacements, typographie)
- Header épuré avec outil courant et score global
- Sidebar droite avec scroll indépendant
- Objectives avec animation de complétion (shimmer + scale)
- KPI CO₂ avec unité affichée

---

## [0.1.3] — 2025 — Stabilisation

### Corrections
- `showLocInfo()` : `$t()` au lieu de `$()` pour les champs lieu
- `placeSc()` : pénalité pente corrigée
- CO₂ : valeur numérique affichée
- Système de particules (sparkle) ajouté
- Overlays de couches renforcés (alpha +40%)
- Objectifs : badges de progression animés
- En-tête MIT, licence, avertissement prototype

---

## [0.1.2] — 2025 — Terrain réel + animations

### Ajouté
- Mode lieu réel : Nominatim + Open-Meteo
- 8 couches environnementales activables
- Tooltip intelligent avec 8 indicateurs et recommandations
- Animations bâtiments : turbines, panneaux solaires brillants, eau animée
- Tutoriel 4 étapes
- Effets de placement (vert = bon, rouge = mauvais)
- 2 nouvelles énergies : hydrolienne, micro-centrale

---

## [0.1.1] — 2025 — MVP étendu

### Ajouté
- Système de matériaux : 8 matériaux avec propriétés
- Dialog de sélection de matériau
- Nouvelles énergies : hydrolienne, micro-centrale, géothermie améliorée
- Dashboard enrichi (CO₂, solidité, confort, entretien)
- 6 objectifs avec récompenses
- Optimiseur de placement

---

## [0.1.0] — 2025 — Prototype initial

### Ajouté
- Carte isométrique 18×18
- Génération de terrain procédurale
- 13 bâtiments de base
- Simulation énergie / eau / nourriture
- Score d'autonomie global
- Sauvegarde localStorage
- Architecture modulaire (engine / ui / data)
