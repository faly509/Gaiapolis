# Modèle pédagogique de Gaiapolis 0.2.1

Le jeu explore des compromis d’autonomie territoriale. Il ne dimensionne pas une installation réelle. Les chiffres suivants sont des **hypothèses de jeu**, modifiables et testables, pas des références techniques validées.

## Provenance

| Élément | Origine et portée |
| --- | --- |
| Nom et coordonnées | Nominatim / OpenStreetMap |
| Température, vent, pluie, rayonnement | Moyennes des prévisions Open-Meteo à 7 jours; aucune normale climatique annuelle |
| Bâtiments, routes, eau | OpenStreetMap via Overpass, rayon 500 m; rasterisation approximative sur 18 × 18 tuiles |
| Relief, pente, fertilité, stabilité, débit, géothermie | Génération procédurale; la présence d’une rivière OSM augmente un indice de débit **simulé** |
| Productions, coûts, confort, scores | Modèle pédagogique; aucune validation d’ingénierie |

La réponse Open-Meteo fournit `shortwave_radiation_sum` en MJ/m². La conversion en kWh/m²/j divise par 3,6. Les valeurs zéro sont conservées; les données absentes ne sont pas remplacées arbitrairement. Source : [documentation Open-Meteo, paramètres journaliers](https://open-meteo.com/en/docs).

Les objets OSM sont conservateurs pour la constructibilité : les cases traversées et l’intérieur des polygones sont bloqués. Une petite construction peut donc occuper une case beaucoup plus grande qu’elle. Les relations multipolygones et les emprises précises ne sont pas gérées. Masquer la couche ne supprime pas ses contraintes.

## Bilans et unités

| Indicateur | Hypothèse |
| --- | --- |
| Énergie | kWh/j. Production dépend des indices de ressource. Les facteurs peuvent atteindre 1,3 ou 1,4 fois la valeur nominale de jeu. |
| Solaire thermique | Chaleur utile, plafonnée à 50 % de la demande des logements; ne remplace pas toute l’électricité. |
| Isolation | Demande des logements multipliée par `1 + (8 − isolation) × 0,06`, bornée entre 0,7 et 1,5, puis par le facteur de température. |
| Batterie | 10 kWh par équipement; 90 % utilisables dans la réserve théorique affichée **si pleine**. Pas de charge/décharge chronologique ni de production ajoutée. |
| Eau | Consommation des équipements, plus 120 L/habitant/j. Les postes fixes des logements sont des usages supplémentaires du modèle. |
| Citerne | Pluie (mm/j) × surface collectrice (m²) × 0,8. Surface limitée au minimum de 100 m²/citerne et 80 m²/logement. Pas de stockage d’eau temporel. |
| Eaux grises | Minimum de la capacité des équipements et de `habitants × 120 × 0,6 × 0,8` L/j. Eau non potable; aucun recyclage récursif. |
| Alimentation | Besoin 2 200 kcal/habitant/j. Potager/serre selon soleil, eau et fertilité. Irrigation et travail non alloués heure par heure. |
| Compost | Ne produit aucune calorie. Bonus unique de 15 % aux cultures voisines orthogonales si la ville compte des habitants. |
| Structure | Moyenne des bâtiments à matériau; les jardins ne font plus mécaniquement baisser la solidité des maisons. |
| CO₂ matériau | Coefficient illustratif × 800 kg par bâtiment à matériau. Ni bilan complet du bâti, ni bilan d’exploitation, ni analyse de cycle de vie. Les valeurs négatives ne garantissent aucune neutralité réelle. |
| Coût | Investissement ponctuel et entretien annuel; pas d’inflation, fiscalité, transport, stock de ressources ou contrainte budgétaire bloquante. |

Les valeurs d’énergie, eau et nourriture sont des **couvertures moyennes quotidiennes**, plafonnées à 100 %. Elles ne prouvent ni la continuité nocturne, ni la potabilité, ni une alimentation équilibrée. Le taux d’eau inclut les eaux grises pour les usages non potables, sans modéliser les réseaux séparés : ne pas l’interpréter comme de l’autonomie en eau potable.

Le **score global estimé** est un indicateur composite : eau 25 %, alimentation 20 %, énergie 20 %, structure 15 %, écologie 12 %, confort 8 %. Il reste nul sans habitants. Il ne doit pas être présenté comme un pourcentage d’autonomie physique.

## Suggestions et scénarios

Le diagnostic privilégie la ressource la moins couverte. Il propose des technologies uniquement si une case est autorisée. Le gain affiché correspond à une construction sur la meilleure case selon le score de placement, avec le matériau sélectionné. Ce n’est pas une optimisation globale de toutes les configurations, ni une garantie de meilleure solution économique. Une suggestion peut afficher un gain nul lorsque les ressources sont insuffisantes.

Les comparaisons gardent les constructions intactes :

- semaine sèche : pluie zéro, indices d’eau et de débit × 0,6;
- peu de soleil : indice solaire × 0,35;
- vent faible : indice de vent × 0,25.

Ces facteurs sont des chocs de jeu, pas des prévisions météorologiques ni des probabilités. Les batteries ne compensent pas ces déficits dans les bilans quotidiens : seul leur potentiel théorique est affiché.

## Persistance et compatibilité

- Format `gaiapolis-project`, schéma 3; contrôle de toute la grille, du climat, des matériaux et de la constructibilité avant application.
- Lecture des clés historiques `eco0151` et `eco015` sans les supprimer.
- La météo historique garde son terrain mais est marquée à recharger, car l’ancien rayonnement avait une unité erronée.
- Autosauvegarde `gaiapolis:project:v3`, copie précédente `gaiapolis:previous:v3`, carte remplacée `gaiapolis:checkpoint:v3`.
- En cas de quota/stockage interdit, l’interface propose l’export; une carte construite n’est pas remplacée si le point de retour ne peut pas être écrit.
- Le JSON ne contient ni code exécutable ni dépendance extérieure. Les textes importés sont affichés comme texte; les valeurs utilisées dans les styles sont bornées.

## Prochaines étapes structurantes

Un moteur horaire, des réseaux potables/non potables, des stocks d’eau et de nourriture, du relief mesuré et des séries climatiques historiques doivent précéder toute prétention à un outil de planification réel. Une migration TypeScript ou MapLibre reste envisageable après stabilisation des interfaces du moteur; elle n’a pas été imposée dans cette révision.
