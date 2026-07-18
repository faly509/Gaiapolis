# Changelog — Gaiapolis / EcoCity Engine

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [0.2.0-alpha] — 2026 — Mobile-first et PWA

### Ajouté
- Interface smartphone avec carte prioritaire en plein écran.
- Barre de construction tactile et défilable en bas de l’écran.
- Panneaux coulissants pour les outils et le tableau de bord.
- Boutons de zoom, ajustement automatique de la carte et pincement à deux doigts.
- Fiche de tuile adaptée au tactile.
- Prise en charge des zones sûres et des orientations portrait/paysage.
- `manifest.webmanifest`, icône d’application et installation PWA.
- Service worker mettant en cache les ressources locales pour un usage hors ligne partiel.
- Workflow GitHub Actions vérifiant JavaScript, manifeste et références de fichiers.

### Modifié
- Version affichée `v0.2.0-alpha`.
- Taille de la grille et des bâtiments ajustée dynamiquement à la largeur du smartphone.
- Documentation mise à jour pour distinguer le mode hors ligne simulé des données réelles nécessitant Internet.

### Limites connues
- La caméra ne se déplace pas encore librement au doigt ou à la souris.
- Le pincement zoome autour du centre de la carte, sans point d’ancrage précis.
- Les icônes Tabler externes peuvent manquer hors ligne, sans bloquer les fonctions principales.

## [0.1.5.1] — 2026 — Stabilisation OSM

### Corrigé
- Blocage des constructions sur une tuile déjà occupée par le joueur.
- Hydrolienne limitée aux rivières ou plans d’eau avec courant suffisant.
- Micro-centrale limitée à l’eau avec débit et dénivelé suffisants.
- Optimiseur aligné sur les mêmes règles centralisées de placement.
- Anneau du score Canvas : résolution correcte des couleurs CSS.
- Sauvegarde migrée vers la clé `eco0151`, avec lecture de compatibilité `eco015`.

### Ajouté
- Interrupteur d’affichage des données OpenStreetMap.
- Rechargement du secteur réel autour du lieu courant.
- Structure de code séparée en fichiers CSS et JavaScript spécialisés.

## [0.1.5] — 2026 — Territoire réel expérimental

### Ajouté
- Intégration Overpass API dans un rayon limité autour du lieu choisi.
- Projection simplifiée des bâtiments, routes, rivières et plans d’eau OpenStreetMap sur la grille.
- Types de tuiles `land`, `water`, `river`, `road` et `existing_building`.
- Bâtiments existants affichés comme volumes gris-bleu non constructibles.
- Fonction centrale `canPlaceBuilding()` pour les contraintes de construction.
- Score écologique, score d’autarcie et confiance estimés pour les bâtiments OSM.
- Statistiques du secteur réel et fallback vers le terrain simulé si Overpass échoue.

## [0.1.4] — 2025 — Premier prototype public

### Modifié
- Réorganisation du prototype en sections fonctionnelles cohérentes.
- Refonte du design, du tableau de bord, du tutoriel et des objectifs.

### Corrigé
- Affichage du lieu et des données climatiques.
- Pénalités de pente et d’inondation dans le score de placement.
- Affichage numérique du CO₂.
- Dépendance des productions hydro et géothermique aux ressources de la tuile.

### Ajouté
- Panneau de lieu réel et attribution des sources.
- Tooltip environnemental détaillé.
- Feedback de placement et effets de particules.

## [0.1.3] — 2025 — Stabilisation

- Corrections de localisation, pente et CO₂.
- Renforcement des couches environnementales.
- En-tête MIT et avertissement prototype.

## [0.1.2] — 2025 — Terrain climatique et animations

- Mode lieu réel avec Nominatim et Open-Meteo.
- Huit couches environnementales.
- Animations des équipements et tutoriel quatre étapes.
- Hydrolienne et micro-centrale.

## [0.1.1] — 2025 — MVP étendu

- Huit matériaux avec propriétés.
- Tableau de bord enrichi.
- Objectifs, récompenses et optimiseur de placement.

## [0.1.0] — 2025 — Prototype initial

- Carte isométrique 18×18.
- Terrain procédural.
- Simulation énergie, eau et nourriture.
- Score d’autonomie et sauvegarde locale.
