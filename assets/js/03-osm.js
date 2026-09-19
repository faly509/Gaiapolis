'use strict';

let osm={loaded:false,buildings:0,roads:0,waters:0,radius:0};
let osmVisible=true;

window.toggleOSMVisible=function(){
  osmVisible=!osmVisible;
  el('ltog-osm')?.classList.toggle('on',osmVisible);
  persistProject();
  toast(osmVisible?'🗺️ Données OSM affichées':'🗺️ Données OSM masquées (règles toujours actives)','info');
};

window.reloadOSM=async function(){
  if(worldBusy)return;
  if(climate.lat==null||climate.lon==null){toast('Charge d’abord un lieu réel','warn');return;}
  if(Object.keys(placed).length){toast('Le secteur contient des constructions. Exporte la partie avant de repartir sur une carte vierge.','warn');return;}
  worldBusy=true;updateHistoryButtons();locSt('Rechargement OSM…',true);
  try{
    const elements=await fetchOSM(climate.lat,climate.lon,500);
    const nextTerrain=generateTerrain(ISO.C,ISO.R,terrainSeed,climate);
    const nextOSM=applyOSMToTerrain(elements,climate.lat,climate.lon,500,nextTerrain);
    terrain=nextTerrain;osm=nextOSM;clearHL();showOSMInfo();updateAll();persistProject();
    locSt('Secteur rechargé ✓',false);toast('Secteur OSM actualisé','ok');
  }catch(error){locSt('Échec — carte conservée',false);toast(error.message,'warn');}
  finally{worldBusy=false;updateHistoryButtons();}
};

async function fetchOSM(lat,lon,radius=500){
  radius=Math.min(800,Math.max(300,radius));
  const q=`[out:json][timeout:20];(
way["building"](around:${radius},${lat},${lon});
way["highway"~"^(primary|secondary|tertiary|residential|unclassified)$"](around:${radius},${lat},${lon});
way["waterway"~"^(river|stream|canal)$"](around:${radius},${lat},${lon});
way["natural"="water"](around:${radius},${lat},${lon});
);out geom;`;
  const data=await fetchJSON('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}},25000);
  if(!Array.isArray(data.elements)||data.remark)throw new Error('Réponse OSM incomplète');
  return data.elements;
}

function llToTile(lat,lon,cLat,cLon,radius){
  const mLat=111320,mLon=111320*Math.cos(cLat*Math.PI/180),dx=(lon-cLon)*mLon,dy=(cLat-lat)*mLat,span=radius*2;
  return{c:Math.round((dx/span+.5)*(ISO.C-1)),r:Math.round((dy/span+.5)*(ISO.R-1))};
}

function applyOSMToTerrain(elements,cLat,cLon,radius,target=terrain){
  let buildings=0,roads=0,waters=0;
  const priority={existing_building:3,road:2,river:1,water:1,land:0};
  for(const e of elements){
    if(!Array.isArray(e.geometry)||!e.geometry.length)continue;
    const tags=e.tags||{};
    const type=tags.building?'existing_building':tags.highway?'road':tags.waterway?'river':tags.natural==='water'?'water':null;
    if(!type)continue;
    const pts=e.geometry.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
    if(pts.length!==e.geometry.length)continue;
    const grid=pts.map(p=>({c:((p.lon-cLon)*111320*Math.cos(cLat*Math.PI/180)/(radius*2)+.5)*(ISO.C-1),r:((cLat-p.lat)*111320/(radius*2)+.5)*(ISO.R-1)}));
    const touched=new Set();
    for(let i=0;i<grid.length;i++){
      const a=grid[i],b=grid[i+1]||a;
      const steps=Math.min(1024,Math.max(1,Math.ceil(Math.max(Math.abs(b.r-a.r),Math.abs(b.c-a.c))*2)));
      for(let j=0;j<=steps;j++){
        const r=Math.round(a.r+(b.r-a.r)*j/steps),c=Math.round(a.c+(b.c-a.c)*j/steps);
        if(inG(r,c))touched.add(`${r},${c}`);
      }
    }
    // Fill closed building and water polygons, not only their outline.
    if((type==='existing_building'||type==='water')&&grid.length>=4&&pts[0].lat===pts.at(-1).lat&&pts[0].lon===pts.at(-1).lon){
      for(let r=0;r<ISO.R;r++)for(let c=0;c<ISO.C;c++){
        let inside=false;
        for(let i=0,j=grid.length-1;i<grid.length;j=i++){
          const a=grid[i],b=grid[j];
          if((a.r>r)!==(b.r>r)&&c<(b.c-a.c)*(r-a.r)/(b.r-a.r)+a.c)inside=!inside;
        }
        if(inside)touched.add(`${r},${c}`);
      }
    }
    if(!touched.size)continue;
    if(type==='existing_building')buildings++;else if(type==='road')roads++;else waters++;
    const feature=type==='existing_building'?{tags,id:e.id,area:estArea(pts)}:null;
    for(const key of touched){
      const t=target[key];
      if(!t||priority[type]<priority[t.terrainType])continue;
      t.terrainType=type;t.buildable=false;t.existingFeature=feature;
      if(type==='river'){t.hydrologicalFlow=Math.max(t.hydrologicalFlow,.65);t.water=Math.max(t.water,.8);}
      if(type==='water')t.water=Math.max(t.water,.85);
    }
  }
  const result={loaded:true,buildings,roads,waters,radius};
  if(target===terrain)osm=result;
  return result;
}

function estArea(geom){
  if(!geom||geom.length<3)return 0;
  const mLat=111320,mLon=111320*Math.cos(geom[0].lat*Math.PI/180);let a=0;
  for(let i=0;i<geom.length;i++){const j=(i+1)%geom.length;a+=(geom[i].lon*mLon)*(geom[j].lat*mLat)-(geom[j].lon*mLon)*(geom[i].lat*mLat);}
  return Math.abs(a/2);
}

function estimateExistingBuildingScore(feature,tile){
  let eco=35,autonomy=15,confidence='low';const reasons=[],tags=feature?.tags||{},area=feature?.area||0;
  if(area>150&&(tile?.sun||0)>.55){eco+=12;autonomy+=15;reasons.push('☀️ Grand toit et bon soleil');}
  else if((tile?.sun||0)>.6){autonomy+=8;reasons.push('☀️ Bon ensoleillement local');}
  if(tags['generator:source']==='solar'||tags.solar==='yes'){eco+=20;autonomy+=25;confidence='high';reasons.push('✅ Solaire déclaré dans OSM');}
  if(tags.green_roof==='yes'){eco+=15;confidence='medium';reasons.push('🌿 Toiture végétalisée déclarée');}
  if(tags['building:material']){confidence=confidence==='low'?'medium':confidence;const m=tags['building:material'];if(/wood|timber/.test(m))eco+=12;if(/concrete/.test(m))eco-=8;reasons.push(`🧱 Matériau : ${m}`);}else reasons.push('❓ Matériau inconnu');
  if((tile?.water||0)>.5){eco+=5;autonomy+=5;}
  if((tile?.fertility||0)>.6)eco+=4;
  if(['house','detached'].includes(tags.building))autonomy+=5;
  if(tags.building==='apartments')eco+=5;
  if(['industrial','warehouse'].includes(tags.building))eco-=10;
  return{ecoScore:clamp(eco,0,100)|0,autonomyScore:clamp(autonomy,0,100)|0,confidence,reasons};
}

function canPlaceBuilding(bid,tile,key,buildings=placed){
  const d=Object.hasOwn(BLDGS,bid)?BLDGS[bid]:null;
  if(!d||!tile)return{ok:false,why:'Bâtiment ou tuile inconnus'};
  if(d.c==='erase')return{ok:true};
  if(key!==undefined&&buildings[key])return{ok:false,why:'Construction impossible : cette tuile est déjà occupée'};
  const tt=tile?.terrainType||'land',water=tt==='water'||tt==='river';
  if(tt==='existing_building')return{ok:false,why:'Construction impossible : bâtiment existant'};
  if(tt==='road')return{ok:false,why:'Construction impossible : route existante'};
  switch(bid){
    case'simple_house':case'bioclimatic':case'hall':
      if(water)return{ok:false,why:'Construction impossible : pas de maison sur l’eau'};
      if((tile?.stability??1)<.25)return{ok:false,why:'Construction impossible : sol instable'};
      if((tile?.slope||0)>.75)return{ok:false,why:'Construction impossible : pente trop forte'};break;
    case'garden':case'greenhouse':case'compost':if(water)return{ok:false,why:'Construction impossible : pas de culture sur l’eau'};break;
    case'hydro_t':
      if(!water)return{ok:false,why:'Construction impossible : hydrolienne uniquement sur rivière ou plan d’eau'};
      if((tile?.hydrologicalFlow||0)<.35)return{ok:false,why:'Construction impossible : débit hydraulique insuffisant'};break;
    case'micro_hydro':
      if(!water)return{ok:false,why:'Construction impossible : micro-centrale uniquement sur rivière ou plan d’eau'};
      if((tile?.hydrologicalFlow||0)<.3)return{ok:false,why:'Construction impossible : débit hydraulique insuffisant'};
      if((tile?.slope||0)<.1)return{ok:false,why:'Construction impossible : dénivelé insuffisant'};break;
    case'geothermal':
      if(water)return{ok:false,why:'Construction impossible : géothermie sur terre uniquement'};
      if((tile?.geothermalPotential||0)<.25)return{ok:false,why:'Construction impossible : potentiel géothermique trop faible'};break;
    case'solar_pv':case'solar_th':case'wind':case'battery':case'rain_tank':case'greywater':case'path':if(water)return{ok:false,why:`Construction impossible : ${d.l} sur terre uniquement`};break;
  }
  if((tile?.floodRisk||0)>.6)return{ok:true,warn:'⚠️ Zone fortement inondable — construction très risquée'};
  return{ok:true};
}

window.loadRealLocation=async function(){
  if(worldBusy)return;
  let lat=Number.parseFloat(el('loc-lat').value),lon=Number.parseFloat(el('loc-lon').value),name=el('loc-name').value.trim();
  worldBusy=true;closeMat(false);updateHistoryButtons();locSt('Recherche du lieu…',true);
  try{
    // A new name always resolves fresh coordinates, never the previous town's.
    if(name){const g=await geocodeName(name);lat=g.lat;lon=g.lon;name=g.name;}
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Latitude : −90 à 90; longitude : −180 à 180');
    locSt('Météo sur 7 jours…',true);
    const nextClimate={...await fetchClimate(lat,lon),lat,lon,name:name||`${lat.toFixed(2)}, ${lon.toFixed(2)}`};
    const seed=hashStr(`${lat.toFixed(5)},${lon.toFixed(5)}`);
    const nextTerrain=generateTerrain(ISO.C,ISO.R,seed,nextClimate);
    let nextOSM={loaded:false,buildings:0,roads:0,waters:0,radius:0};
    try{locSt('Carte OpenStreetMap…',true);nextOSM=applyOSMToTerrain(await fetchOSM(lat,lon,500),lat,lon,500,nextTerrain);}
    catch{toast('OSM indisponible : relief simulé avec la météo du lieu','info');}
    if(!checkpointCurrent()){locSt('Chargement annulé — exporte la partie',false);return;}
    climate=nextClimate;terrain=nextTerrain;terrainSeed=seed;osm=nextOSM;placed={};
    resetProgress();refreshLocationUI();updateAll();persistProject();
    locSt('Lieu chargé ✓',false);toast(`🗺️ ${climate.name} — météo à court terme`,'ok');
  }catch(error){locSt('Échec — partie conservée',false);toast(error.message,'warn');}
  finally{worldBusy=false;updateHistoryButtons();}
};

function resetProgress(){
  doneSet.clear();undoStack.length=redoStack.length=0;tutStep=0;tutDone=false;
  pendPl=null;el('mat-dlg').classList.remove('open');
  buildObjs();buildTut();clearHL();el('tut').classList.remove('gone');
}
function refreshLocationUI(){
  $t('h-loc',climate.name||'Terrain simulé');
  el('loc-name').value=climate.name||'';
  el('loc-lat').value=climate.lat??'';el('loc-lon').value=climate.lon??'';
  if(climate.lat!=null)showLocCard();else el('loc-card').classList.remove('vis');
  el('ltog-osm')?.classList.toggle('on',osmVisible);
  showOSMInfo();
  if(typeof initAcc==='function')initAcc();
}

window.geolocate=function(){
  if(!navigator.geolocation){toast('Géolocalisation non disponible','warn');return;}
  navigator.geolocation.getCurrentPosition(p=>{el('loc-name').value='';el('loc-lat').value=p.coords.latitude.toFixed(5);el('loc-lon').value=p.coords.longitude.toFixed(5);toast('📍 Position récupérée','ok');},()=>toast('Position refusée','warn'));
};
function locSt(msg,spinning){el('loc-st').classList.add('vis');$t('loc-msg',msg);el('loc-ico').className=spinning?'ti ti-loader spin':'ti ti-check';}
function showLocCard(){
  el('loc-card').classList.add('vis');$t('lc-name',climate.name||'—');$t('lc-coords',climate.lat!=null?`${climate.lat.toFixed(4)}, ${climate.lon.toFixed(4)}`:'—');$t('lc-biome',climate.biome||'—');$t('lc-temp',`${climate.temp?.toFixed(1)??'—'} °C`);$t('lc-rad',climate.source==='legacy'?'À recharger':`${climate.radiation?.toFixed(1)??'—'} kWh/m²/j`);$t('lc-wind',`${climate.windMax?.toFixed(0)??'—'} km/h`);$t('lc-rain',`${climate.precip?.toFixed(1)??'—'} mm`);
  const bars=[['☀️',climate.sun,'#F4BC3A'],['💨',climate.wind,'#52C4FC'],['🌧️',climate.rain,'#32DEB8'],['🌡️',clamp((climate.temp+10)/50),'#F27060']];
  el('lc-bars').innerHTML=bars.map(([l,v,c])=>`<div class="lc-bar-row"><span>${l}</span><div class="b"><div class="bf" style="width:${~~(v*100)}%;background:${c}"></div></div></div>`).join('');el('loc-disc').classList.add('vis');el('loc-src').classList.add('vis');initAcc();
}
function showOSMInfo(){
  const o=el('osm-info'),ctrl=el('osm-controls');if(!osm.loaded){o.style.display='none';if(ctrl)ctrl.style.display='none';return;}o.style.display='block';if(ctrl)ctrl.style.display='flex';o.innerHTML=`🗺️ <b>Territoire réel chargé</b> (${osm.radius} m)<br>🏘️ ${osm.buildings} bâtiments · 🛣️ ${osm.roads} routes · 💧 ${osm.waters} zones d’eau`;
}
