'use strict';

// Provenance, not a statistical confidence score. Reading this never changes a city.
function dataContext(weather=climate,map=osm,now=Date.now()){
  const validTime=v=>Number.isFinite(v)&&v>0&&v<=now;
  const date=v=>new Date(v).toLocaleDateString('fr-FR',{timeZone:'UTC'});
  const days=(weather.period||[]).filter(v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))).sort();
  const forecast=weather.source==='forecast',legacy=weather.source==='legacy';
  const expired=forecast&&days.length>0&&now>=Date.parse(days.at(-1)+'T00:00:00Z')+86400000;
  const old=forecast&&validTime(weather.fetchedAt)&&now-weather.fetchedAt>86400000;
  const undated=forecast&&(!validTime(weather.fetchedAt)||!days.length);
  const notice=legacy?'Ancienne météo : unités à actualiser.':expired?'Prévisions expirées : les calculs utilisent encore la météo enregistrée.':undated?'Météo enregistrée : dates incomplètes, actualité non vérifiable.':old?'Prévisions enregistrées depuis plus de 24 h : elles ne sont pas actualisées automatiquement.':'';
  const period=days.length?`Période du ${date(days[0]+'T00:00:00Z')} au ${date(days.at(-1)+'T00:00:00Z')} (dates du lieu).`:'Période non renseignée.';
  return{notice,rows:[
    {title:'Météo du secteur',status:legacy?'À actualiser':forecast?(expired?'Expirée':undated?'Dates incomplètes':old?'À actualiser':'Prévisions enregistrées'):'Simulée',
      detail:forecast?`Open-Meteo · ${period} ${validTime(weather.fetchedAt)?'Chargée le '+date(weather.fetchedAt)+' (UTC).':'Date de chargement inconnue.'} Moyennes à court terme, pas un climat annuel.`:legacy?'Ancienne sauvegarde : les unités météo doivent être rechargées avant de comparer les résultats.':'Valeurs de démonstration, sans prévisions locales chargées.'},
    {title:'Bâtiments, routes et eau',status:map.loaded?'OSM partiel':'Simulés',
      detail:map.loaded?`OpenStreetMap via Overpass · rayon ${map.radius} m. ${map.buildings} bâtiments, ${map.roads} routes, ${map.waters} objets d’eau projetés sur la grille. ${validTime(map.fetchedAt)?'Chargés le '+date(map.fetchedAt)+' (UTC).':'Date de chargement inconnue.'} Sélection limitée : une tuile libre ne prouve pas que le terrain est vide ou constructible.`:'Aucune couche OSM chargée. Les formes de terrain et les obstacles proviennent de la démonstration.'},
    {title:'Soleil et vent par tuile',status:forecast?'Prévisions + simulation':'Simulés',
      detail:'Les variations entre tuiles sont générées par le jeu. Aucun ombrage de bâtiment ni vent mesuré sur la parcelle.'},
    {title:'Relief, sol et risques',status:'Simulés',
      detail:'Altitude, pente, fertilité, stabilité et risque d’inondation sont générés. Aucun relevé topographique, géologique ou zonage réglementaire chargé.'},
    {title:'Débit et géothermie',status:'Simulés',
      detail:'Le débit est un indice de jeu, y compris sur les rivières OSM. Le potentiel géothermique ne provient pas d’une mesure locale.'},
    {title:'Autonomie et recommandations',status:'Modèle pédagogique',
      detail:'Bilans journaliers simplifiés. Les conseils héritent des limites ci-dessus. Potabilité, stockage heure par heure et faisabilité technique ne sont pas évalués.'}
  ]};
}

function renderDataContext(){
  const report=dataContext(),list=el('data-sources');
  if(!list)return;
  list.replaceChildren();
  el('sources-summary').textContent='Origine et limites des données'+(report.notice?' · météo à vérifier':'');
  const notice=el('data-notice');notice.textContent=report.notice;notice.hidden=!report.notice;
  for(const row of report.rows){
    const card=document.createElement('div');card.className='source-item';
    const heading=document.createElement('h3');heading.textContent=row.title;
    const status=document.createElement('span');status.className='source-status';status.textContent=row.status;
    const detail=document.createElement('p');detail.textContent=row.detail;
    card.append(heading,status,detail);list.append(card);
  }
}
