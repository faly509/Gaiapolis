'use strict';

let osm={loaded:false,buildings:0,roads:0,waters:0,radius:0};
let osmVisible=true;

window.toggleOSMVisible=function(){
  osmVisible=!osmVisible;
  el('ltog-osm')?.classList.toggle('on',osmVisible);
  toast(osmVisible?'🗺️ Données OSM affichées':'🗺️ Données OSM masquées (règles toujours actives)','info');
};

function resetOSMTyping(){
  for(const t of Object.values(terrain)){
    t.terrainType=t.water>.82?'water':'land';
    t.buildable=t.water<=.82;
    t.existingFeature=null;
  }
}

window.reloadOSM=async function(){
  if(climate.lat==null||climate.lon==null){toast('⚠️ Charge d’abord un lieu réel','warn');return;}
  if(Object.keys(placed).length){toast('⚠️ Rechargement refusé : efface d’abord les constructions du joueur','warn');return;}
  locSt('Rechargement OSM…',true);
  try{
    resetOSMTyping();
    const elements=await fetchOSM(climate.lat,climate.lon,500);
    const st=applyOSMToTerrain(elements,climate.lat,climate.lon,500);
    showOSMInfo();updateAll();locSt('Secteur rechargé ✓',false);
    toast(`🔄 OSM : ${st.buildings} bâtiments · ${st.roads} routes · ${st.waters} zones d’eau`,'ok');
  }catch(e){locSt('⚠️ Overpass indisponible',false);toast('⚠️ Rechargement OSM impossible','warn');}
};

async function fetchOSM(lat,lon,radius=500){
  radius=Math.min(800,Math.max(300,radius));
  const q=`[out:json][timeout:20];(
way["building"](around:${radius},${lat},${lon});
way["highway"~"^(primary|secondary|tertiary|residential|unclassified)$"](around:${radius},${lat},${lon});
way["waterway"~"^(river|stream|canal)$"](around:${radius},${lat},${lon});
way["natural"="water"](around:${radius},${lat},${lon});
);out geom;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}});
  if(!r.ok)throw new Error('Overpass inaccessible');
  return(await r.json()).elements||[];
}

function llToTile(lat,lon,cLat,cLon,radius){
  const mLat=111320,mLon=111320*Math.cos(cLat*Math.PI/180),dx=(lon-cLon)*mLon,dy=(cLat-lat)*mLat,span=radius*2;
  return{c:Math.round((dx/span+.5)*(ISO.C-1)),r:Math.round((dy/span+.5)*(ISO.R-1))};
}

function applyOSMToTerrain(elements,cLat,cLon,radius){
  let buildings=0,roads=0,waters=0;
  for(const e of elements){
    if(!e.geometry)continue;
    const tags=e.tags||{};let type=null;
    if(tags.building){type='existing_building';buildings++;}
    else if(tags.highway){type='road';roads++;}
    else if(tags.waterway){type='river';waters++;}
    else if(tags.natural==='water'){type='water';waters++;}
    if(!type)continue;
    const pts=e.geometry;
    for(let i=0;i<pts.length;i++){
      const steps=i<pts.length-1?3:1;
      for(let s=0;s<steps;s++){
        const f=s/steps,la=i<pts.length-1?pts[i].lat+(pts[i+1].lat-pts[i].lat)*f:pts[i].lat,lo=i<pts.length-1?pts[i].lon+(pts[i+1].lon-pts[i].lon)*f:pts[i].lon;
        const{r,c}=llToTile(la,lo,cLat,cLon,radius);if(!inG(r,c))continue;
        const t=terrain[`${r},${c}`];if(!t)continue;
        const prio={existing_building:3,road:2,river:1,water:1,land:0};
        if((prio[type]||0)>=(prio[t.terrainType]||0)){
          t.terrainType=type;t.buildable=false;
          if(type==='existing_building')t.existingFeature={tags,id:e.id,area:estArea(e.geometry)};
          if(type==='river'){t.hydrologicalFlow=Math.max(t.hydrologicalFlow,.65);t.water=Math.max(t.water,.8);}
          if(type==='water')t.water=Math.max(t.water,.85);
        }
      }
    }
  }
  osm={loaded:true,buildings,roads,waters,radius};return osm;
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

function canPlaceBuilding(bid,tile,key){
  const d=BLDGS[bid];if(!d||d.c==='erase')return{ok:true};
  if(key!==undefined&&placed[key])return{ok:false,why:'Construction impossible : cette tuile est déjà occupée'};
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
  let lat=parseFloat(el('loc-lat').value),lon=parseFloat(el('loc-lon').value),name=el('loc-name').value.trim();locSt('Géocodage…',true);
  try{
    if(name&&(isNaN(lat)||isNaN(lon))){const g=await geocodeName(name);lat=g.lat;lon=g.lon;name=g.name;el('loc-lat').value=lat.toFixed(4);el('loc-lon').value=lon.toFixed(4);}
    if(isNaN(lat)||isNaN(lon))throw new Error('Entrer un lieu ou des coordonnées valides');
    locSt('Données climatiques…',true);const cl=await fetchClimate(lat,lon);climate={...cl,lat,lon,name:name||`${lat.toFixed(2)},${lon.toFixed(2)}`};
    placed={};terrain=generateTerrain(ISO.C,ISO.R,Math.round(Math.abs(lat*lon))%9999||42);
    try{locSt('Données OSM…',true);const st=applyOSMToTerrain(await fetchOSM(lat,lon,500),lat,lon,500);toast(`🏘️ OSM : ${st.buildings} bâtiments · ${st.roads} routes · ${st.waters} zones d’eau`,'info');}
    catch{osm={loaded:false,buildings:0,roads:0,waters:0,radius:0};toast('ℹ️ Overpass indisponible — terrain simulé seul','info');}
    updateAll();showLocCard();showOSMInfo();$t('h-loc',climate.name);locSt('Chargé ✓',false);toast(`🗺️ ${climate.name} — ${climate.biome}`,'ok');
  }catch(e){locSt('⚠️ '+e.message,false);toast('⚠️ '+e.message,'warn');if(name){climate.name=name;terrain=generateTerrain(ISO.C,ISO.R,hashStr(name));updateAll();}}
};

window.geolocate=function(){
  if(!navigator.geolocation){toast('Géolocalisation non disponible','warn');return;}
  navigator.geolocation.getCurrentPosition(p=>{el('loc-lat').value=p.coords.latitude.toFixed(5);el('loc-lon').value=p.coords.longitude.toFixed(5);toast('📍 Position récupérée','ok');},()=>toast('Position refusée','warn'));
};
function locSt(msg,spinning){el('loc-st').classList.add('vis');$t('loc-msg',msg);el('loc-ico').className=spinning?'ti ti-loader spin':'ti ti-check';}
function showLocCard(){
  el('loc-card').classList.add('vis');$t('lc-name',climate.name||'—');$t('lc-coords',climate.lat!=null?`${climate.lat.toFixed(4)}, ${climate.lon.toFixed(4)}`:'—');$t('lc-biome',climate.biome||'—');$t('lc-temp',`${climate.temp?.toFixed(1)??'—'} °C`);$t('lc-rad',`${climate.radiation?.toFixed(1)??'—'} kWh/m²`);$t('lc-wind',`${climate.windMax?.toFixed(0)??'—'} km/h`);$t('lc-rain',`${climate.precip?.toFixed(1)??'—'} mm`);
  const bars=[['☀️',climate.sun,'#F4BC3A'],['💨',climate.wind,'#52C4FC'],['🌧️',climate.rain,'#32DEB8'],['🌡️',clamp((climate.temp+10)/50),'#F27060']];
  el('lc-bars').innerHTML=bars.map(([l,v,c])=>`<div class="lc-bar-row"><span>${l}</span><div class="b"><div class="bf" style="width:${~~(v*100)}%;background:${c}"></div></div></div>`).join('');el('loc-disc').classList.add('vis');el('loc-src').classList.add('vis');
}
function showOSMInfo(){
  const o=el('osm-info'),ctrl=el('osm-controls');if(!osm.loaded){o.style.display='none';if(ctrl)ctrl.style.display='none';return;}o.style.display='block';if(ctrl)ctrl.style.display='flex';o.innerHTML=`🗺️ <b>Territoire réel chargé</b> (${osm.radius} m)<br>🏘️ ${osm.buildings} bâtiments · 🛣️ ${osm.roads} routes · 💧 ${osm.waters} zones d’eau`;
}
