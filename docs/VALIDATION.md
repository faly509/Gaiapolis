# Validation de Gaiapolis 0.2.1-alpha

## Tests automatiques

**27 tests réussis**, sans dépendance supplémentaire, avec :

```bash
node --test tests/*.test.cjs
```

Les tests couvrent :

- conversion du rayonnement, valeurs zéro et données météo absentes;
- énergie, chaleur utile, dépendances pluie/toitures, limites des eaux grises, compost, isolation et batterie;
- score et objectifs conditionnés par les habitants;
- terrain occupé, obstacles OSM, eau, débit et pente;
- intérieur des polygones et continuité des routes;
- aller-retour de sauvegarde, matériaux, tutoriel, formats invalides et futures versions;
- récupération d’une sauvegarde abîmée, refus d’un changement de carte si le stockage de secours échoue;
- conservation de l’état après échec réseau, nouvelles coordonnées, protection contre les chargements concurrents;
- scénarios sans modification de la partie;
- liste des ressources hors ligne, isolation du cache et navigation sans réseau.

La validation GitHub Actions a également réussi sur le commit de code `0099d7bedab6e8fe5a77b2f9ea197edf8bc0f60b` : exécution n° 3, workflow **Validate static app**. Elle vérifie les tests, la syntaxe JavaScript, le manifeste et la présence des fichiers référencés.

## Vérifications dans Chromium

Parcours réalisés sur l’aperçu du code :

- chargement du jeu et rendu de la carte;
- sélection d’une suggestion, ouverture du choix de matériau et construction d’un logement bioclimatique en chanvre;
- mise à jour du diagnostic, de la population, du coût et des bilans;
- annulation puis rétablissement de la construction;
- rechargement de la page et restauration effective de la partie;
- ouverture du tableau de comparaison des conditions;
- déplacement de la carte à la souris sans construction involontaire;
- panneaux mobiles, sélection d’une suggestion et retour à la carte;
- accès aux commandes du projet et au mode Inspection sur écran étroit.

Mises en page inspectées : ordinateur 1365 × 936, cadres 390 × 844, 340 × 740 et 844 × 390. La page `tests/ui-preview.html` reproduit ces dimensions pour le contrôle de l’interface.

Un défaut de focus faisait défiler horizontalement le conteneur après fermeture d’un tiroir mobile. La correction rend les tiroirs fermés inertes, maîtrise le focus et conserve le défilement horizontal à zéro. Le retour à la carte et le format paysage ont été revérifiés après correction.

## Limites de cette validation

- Les cadres responsives ne sont pas des téléphones physiques. Le pincement multitactile, l’appui long natif, iOS et le changement d’écran d’un téléphone pliable restent à essayer sur appareil.
- Le service worker est testé avec des caches contrôlés. L’installation PWA réelle et son cycle de mise à jour n’ont pas été validés sur les appareils de l’utilisateur; l’aperçu n’active pas le service worker réservé au domaine GitHub Pages officiel.
- Les tests d’API utilisent des réponses contrôlées. Ils vérifient le comportement de l’application, pas la disponibilité de Nominatim, Open-Meteo et Overpass.
- La validation JSON est testée; le téléchargement et le choix d’un fichier à travers chaque navigateur ne sont pas certifiés sur tous les appareils.
- Le modèle reste éducatif et quotidien, avec les hypothèses décrites dans `MODEL.md`.

## Essai conseillé

1. Construire un logement et quelques équipements.
2. Déplacer et zoomer la carte; utiliser **Inspecter** avant de construire.
3. Lire le diagnostic, puis **Tester la résilience**.
4. Essayer **Annuler**, **Rétablir**, **Exporter**, puis **Importer** ce fichier.
5. Créer une nouvelle carte, puis vérifier **Retour carte**.
6. Ouvrir sur téléphone en portrait et paysage.

Les deux branches de sauvegarde initiales sont documentées dans `AUDIT-2026-09-19.md`. La PR #3 reste proposée à la revue; `main` n’a pas été fusionnée ni déployée automatiquement.
