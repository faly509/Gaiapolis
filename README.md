# 🌍 EcoCity Engine

**Open-source ecological city-building simulation prototype**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.4--alpha-orange.svg)]()
[![Status](https://img.shields.io/badge/status-public%20prototype-yellow.svg)]()
[![Data](https://img.shields.io/badge/data-Open--Meteo%20%2B%20Nominatim-blue.svg)]()

> *"Et si construire une maison autonome était aussi satisfaisant qu'un city-builder ?"*

EcoCity Engine est un simulateur de construction écologique open-source. Le joueur place des bâtiments sur une carte isométrique, choisit les matériaux, gère l'énergie, l'eau et la nourriture — et peut charger un vrai lieu géographique pour obtenir un terrain influencé par les données climatiques réelles.

---

## ✨ Fonctionnalités v0.1.4

| Fonctionnalité | État |
|----------------|------|
| 🗺️ Carte isométrique 18×18 interactive | ✅ |
| 🌡️ 8 couches environnementales activables | ✅ |
| 🏗️ 17 bâtiments avec données réelles | ✅ |
| 🧱 8 matériaux avec propriétés détaillées | ✅ |
| ⚡ Simulation énergie / eau / nourriture | ✅ |
| 💰 Calcul des coûts en temps réel | ✅ |
| 🌊 Hydrolienne + micro-centrale + géothermie | ✅ |
| 📍 Mode terrain réel (Nominatim + Open-Meteo) | ✅ |
| 🎯 Optimiseur de placement | ✅ |
| 🏆 6 objectifs avec récompenses animées | ✅ |
| ✨ Effets particules / feedback visuel | ✅ |
| 🎓 Tutoriel 4 étapes | ✅ |
| 💾 Sauvegarde locale (localStorage) | ✅ |

---

## 🚀 Démarrage rapide

### Option 1 — Fichier local (le plus simple)

```bash
git clone https://github.com/VOTRE_USERNAME/ecocity-engine.git
cd ecocity-engine
```

> ⚠️ Les modules ES6 et les appels API nécessitent un serveur HTTP local (pas `file://`).

```bash
# Python 3 (intégré)
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code → Extension "Live Server"
```

Puis ouvrir : **http://localhost:8080**

### Option 2 — GitHub Pages (aucune installation)

1. Fork ce dépôt
2. Settings → Pages → Source: `main` / `/ (root)`
3. Le jeu est en ligne en 2 minutes

---

## 🎮 Comment jouer

1. **Observer** — les couches colorées montrent les ressources (orange = soleil, bleu = vent, vert = eau)
2. **Sélectionner un outil** dans le panneau gauche
3. **Survoler** une tuile pour voir ses données (ensoleillement, vent, eau, fertilité, risques…)
4. **Cliquer** pour placer un bâtiment — feedback immédiat (✨ optimal / ⚠️ mauvais)
5. **Optimiser** — bouton "Trouver les meilleurs emplacements" pour voir les 5 meilleures tuiles
6. **Mode lieu réel** — entrer "Montpellier" ou des coordonnées lat/lon

### Boucle de jeu

```
Choisir un terrain → Observer les ressources → Construire une maison
→ Produire de l'énergie → Gérer l'eau → Produire de la nourriture
→ Améliorer les matériaux → Augmenter le score d'autonomie → Remplir les objectifs
```

---

## 🏗️ Catalogue des bâtiments

| Bâtiment | Catégorie | Coût | Production |
|----------|-----------|------|-----------|
| 🏠 Maison simple | Logement | 120 000 € | 4 résidents |
| 🏡 Bioclimatique | Logement | 160 000 € | 4 résidents, -70% énergie |
| ☀️ Panneaux PV | Énergie | 8 000 € | 12 kWh/j |
| 🌡️ Solaire thermique | Énergie | 5 000 € | 8 kWh thermique/j |
| 💨 Éolienne | Énergie | 15 000 € | 20 kWh/j |
| 🌊 Hydrolienne | Énergie | 18 000 € | 15 kWh/j (débit requis) |
| ⚡ Micro-centrale | Énergie | 25 000 € | 30 kWh/j (débit+pente) |
| 🌋 Géothermie | Énergie | 35 000 € | 18 kWh/j (stable) |
| 🔋 Batterie | Stockage | 10 000 € | Buffer 24h |
| 💧 Citerne pluie | Eau | 3 000 € | 150 L/j |
| ♻️ Recyclage eau | Eau | 4 500 € | 100 L/j |
| 🌱 Potager | Nourriture | 500 € | 800 kcal/j |
| 🏗️ Serre | Nourriture | 8 000 € | 2 000 kcal/j |
| 🍂 Composteur | Déchets | 600 € | Booste potagers |
| 🛤️ Chemin | Infra | 300 € | +confort |
| 🏛️ Salle commune | Infra | 40 000 € | +confort social |

---

## 🧱 Matériaux disponibles

| Matériau | Solidité | Isolation | CO₂ | Coût relatif |
|----------|----------|-----------|-----|-------------|
| 🪵 Bois | 6/10 | 8/10 | -1.5 kg/kg | Standard |
| 🏢 Béton | 10/10 | 2/10 | +0.9 kg/kg | -30% |
| 🪨 Pierre | 9/10 | 3/10 | +0.1 kg/kg | +30% |
| 🏺 Terre crue | 4/10 | 7/10 | +0.01 kg/kg | -70% |
| 🌿 Chanvre | 3/10 | 9/10 | -0.8 kg/kg | +10% |
| 🌾 Paille | 2/10 | 10/10 | -0.5 kg/kg | -80% |
| 🎋 Bambou | 6/10 | 5/10 | -1.0 kg/kg | -20% |
| ♻️ Recyclé | 5/10 | 6/10 | -0.3 kg/kg | -50% |

---

## 🌍 Mode terrain réel

Entrer un nom de lieu ou des coordonnées :

```
Montpellier       → biome méditerranéen, fort soleil
Reykjavik         → biome subarctique, vent fort
Paris             → tempéré océanique
Nairobi           → tropical humide
```

Le jeu appelle :
- **Nominatim (OpenStreetMap)** pour convertir le nom en coordonnées
- **Open-Meteo** pour les données climatiques (rayonnement, vent, pluie, température)

Le terrain généré est ensuite influencé par ces valeurs réelles.

> ⚠️ Le terrain est une simulation simplifiée — pas une carte topographique exacte.
> Sources : Open-Meteo.com (CC BY 4.0) · Nominatim/OSM (ODbL)

---

## 🗂️ Structure du dépôt

```
ecocity-engine/
├── index.html        # Jeu complet (HTML + CSS + JS)
├── README.md         # Ce fichier
├── ROADMAP.md        # Versions futures planifiées
├── CHANGELOG.md      # Historique des versions
├── LICENSE           # MIT License
└── screenshots/      # Captures d'écran
```

---

## 🤝 Contribuer

Les contributions sont bienvenues ! Voir les sections dans le code pour ajouter :

- **Un bâtiment** → copier une entrée dans `BLDGS` + ajouter dans `BVIS` + `TORDER`
- **Un matériau** → ajouter dans `MATS`
- **Une formule améliorée** → modifier `simulate()` ou `placeSc()`
- **Une couche terrain** → ajouter dans `LAYERS` + activer dans `LYRON`

```bash
# Ouvrir une issue, fork, créer une branche, pull request
git checkout -b feature/ma-fonctionnalite
```

---

## 📜 Licence

MIT — libre d'utilisation, modification et distribution.

**Auteur** : Norbert Randriamaitso — norbert.randri@gmail.com

**Dépendances** :
- [Tabler Icons](https://tabler-icons.io) (MIT)
- [Open-Meteo](https://open-meteo.com) (CC BY 4.0)
- [Nominatim / OpenStreetMap](https://nominatim.org) (ODbL)

---

*EcoCity Engine — Construire non pas seulement une maison, mais un système vivant.* 🌿
