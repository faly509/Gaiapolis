'use strict';

const SAVE_KEY='gaiapolis:project:v3',PREVIOUS_KEY='gaiapolis:previous:v3',CHECKPOINT_KEY='gaiapolis:checkpoint:v3';
const undoStack=[],redoStack=[];
const copy=value=>JSON.parse(JSON.stringify(value));

function projectSnapshot(){
  return{format:'gaiapolis-project',schemaVersion:3,appVersion:APP_VERSION,at:Date.now(),
    terrainSeed,terrain,placed,climate,osm,osmVisible,layers:{...LYRON},curTool,curMat,
    tutorial:{step:tutStep,done:tutDone},achievements:[...doneSet]};
}

// All validation precedes mutation. Never trust imported JSON or localStorage.
function validateProject(input){
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const number=(v,min,max,label)=>{
    if(!Number.isFinite(v)||v<min||v>max)throw new Error(`Valeur invalide : ${label}`);
    return v;
  };
  if(!object(input)||!object(input.terrain)||!object(input.placed))throw new Error('Ce fichier ne contient pas une partie Gaiapolis');
  if(input.schemaVersion!==undefined&&(input.schemaVersion!==3||input.format!=='gaiapolis-project'))throw new Error('Format de sauvegarde non pris en charge');
  const tiles={},buildings={};
  const fields=['alt','slope','sun','wind','water','fertility','humidity','stability','floodRisk','geothermalPotential','hydrologicalFlow','bScore','fScore','eScore'];
  const types=['land','water','river','road','existing_building'];
  if(Object.keys(input.terrain).length!==ISO.R*ISO.C)throw new Error('Carte incomplète');
  for(let r=0;r<ISO.R;r++)for(let c=0;c<ISO.C;c++){
    const key=`${r},${c}`,t=input.terrain[key];
    if(!object(t))throw new Error('Tuile manquante');
    const tile=Object.fromEntries(fields.map(f=>[f,number(t[f],0,1,f)]));
    tile.hdd=number(t.hdd??1,0,5,'chauffage');
    tile.terrainType=t.terrainType??(t.water>.82?'water':'land');
    if(!types.includes(tile.terrainType))throw new Error('Type de terrain inconnu');
    tile.buildable=tile.terrainType==='land';tile.existingFeature=null;
    if(object(t.existingFeature)){
      const feature=t.existingFeature,tags={};
      for(const [k,v] of Object.entries(feature.tags||{}).slice(0,100)){
        if(typeof v==='string'&&k.length<100&&k!=='__proto__')tags[k]=v.slice(0,500);
      }
      tile.existingFeature={id:Number.isFinite(feature.id)?feature.id:0,tags,area:number(feature.area??0,0,1e12,'surface')};
    }
    tiles[key]=tile;
  }
  if(Object.keys(input.placed).length>ISO.R*ISO.C)throw new Error('Trop de constructions');
  for(const [key,v] of Object.entries(input.placed)){
    if(!tiles[key]||!object(v)||!Object.hasOwn(BLDGS,v.id)||BLDGS[v.id].c==='erase')throw new Error('Construction inconnue');
    const d=BLDGS[v.id];
    if(d.mat&&!Object.hasOwn(MATS,v.mat))throw new Error('Matériau inconnu');
    if(!canPlaceBuilding(v.id,tiles[key],key,buildings).ok)throw new Error('Construction incompatible avec le terrain');
    buildings[key]={id:v.id,mat:d.mat?v.mat:null};
  }
  const cl={...DEFAULT_CLIMATE},source=input.climate||{};
  for(const k of ['sun','wind','rain'])cl[k]=number(source[k]??cl[k],0,1,k);
  for(const [k,min,max] of [['temp',-100,100],['radiation',0,200],['windMax',0,600],['precip',0,2000]])cl[k]=number(source[k]??cl[k],min,max,k);
  cl.name=typeof source.name==='string'?source.name.slice(0,120):'';
  cl.biome=typeof source.biome==='string'?source.biome.slice(0,100):cl.biome;
  if(source.lat!=null||source.lon!=null){cl.lat=number(source.lat,-90,90,'latitude');cl.lon=number(source.lon,-180,180,'longitude');}
  cl.source=['forecast','simulated','legacy'].includes(source.source)?source.source:(cl.lat!=null?'legacy':'simulated');
  cl.fetchedAt=Number.isFinite(source.fetchedAt)?source.fetchedAt:null;
  cl.period=Array.isArray(source.period)?source.period.filter(v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)).slice(0,7):[];
  const os=input.osm||{},osmState={loaded:os.loaded===true};
  for(const [k,max] of [['buildings',1e6],['roads',1e6],['waters',1e6],['radius',800]])osmState[k]=number(os[k]??0,0,max,k);
  const layers=Object.fromEntries(Object.keys(LYRON).map(k=>[k,typeof input.layers?.[k]==='boolean'?input.layers[k]:LYRON[k]]));
  const seed=Number.isInteger(input.terrainSeed)&&input.terrainSeed>=0?input.terrainSeed:42;
  return{terrain:tiles,placed:buildings,climate:cl,osm:osmState,terrainSeed:seed,layers,
    osmVisible:input.osmVisible!==false,curTool:Object.hasOwn(BLDGS,input.curTool)?input.curTool:'simple_house',curMat:Object.hasOwn(MATS,input.curMat)?input.curMat:'wood',
    tutorial:{step:Number.isInteger(input.tutorial?.step)?clamp(input.tutorial.step,0,3):0,done:input.tutorial?input.tutorial.done===true:Object.keys(buildings).length>0},
    achievements:Array.isArray(input.achievements)?input.achievements.filter(id=>OBJECTIVES.some(o=>o.id===id)):[]};
}

function persistProject(announce=false){
  try{
    const raw=JSON.stringify(projectSnapshot()),old=localStorage.getItem(SAVE_KEY);
    if(old){try{validateProject(JSON.parse(old));localStorage.setItem(PREVIOUS_KEY,old);}catch{/* Never replace recovery with corrupt data. */}}
    localStorage.setItem(SAVE_KEY,raw);
    $t('save-status','Enregistré sur cet appareil');
    if(announce)toast('💾 Partie sauvegardée — Exporter permet de la garder dans un fichier','ok');
    return true;
  }catch{
    $t('save-status','Stockage indisponible — exporte la partie');
    if(announce)toast('Sauvegarde locale impossible — utilise Exporter','warn');
    return false;
  }
}
function checkpointCurrent(){
  if(!Object.keys(placed).length)return true;
  try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(projectSnapshot()));return true;}
  catch{toast('Exporte la partie avant de changer de carte : le stockage local est indisponible','warn');return false;}
}
function applyProject(project){
  terrain=project.terrain;placed=project.placed;climate=project.climate;osm=project.osm;terrainSeed=project.terrainSeed;
  osmVisible=project.osmVisible;Object.assign(LYRON,project.layers);
  curMat=project.curMat;setTool(project.curTool);
  tutStep=project.tutorial.step;tutDone=project.tutorial.done;
  doneSet.clear();project.achievements.forEach(id=>doneSet.add(id));
  // Historical progress is not replayed as a burst of reward messages.
  const state=simulate();OBJECTIVES.forEach(o=>{if(o.chk(state))doneSet.add(o.id);});
  pendPl=null;el('mat-dlg').classList.remove('open');
  undoStack.length=redoStack.length=0;
  buildLayers();buildTut();el('tut').classList.toggle('gone',tutDone);
  refreshLocationUI();clearHL();updateAll();updateHistoryButtons();
}
function loadSave(){
  let failed=false;
  for(const key of [SAVE_KEY,PREVIOUS_KEY,'eco0151','eco015']){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const project=validateProject(JSON.parse(raw));applyProject(project);
      $t('save-status',failed?'Partie récupérée depuis la copie précédente':'Partie restaurée');
      if(failed)setTimeout(()=>toast('💾 Sauvegarde abîmée : copie précédente récupérée','warn'),500);
      return true;
    }catch{failed=true;}
  }
  if(failed)$t('save-status','Sauvegarde illisible ou stockage indisponible');
  return false;
}
window.saveGame=()=>persistProject(true);
window.restoreCheckpoint=function(){
  if(worldBusy)return;
  try{
    const raw=localStorage.getItem(CHECKPOINT_KEY);
    if(!raw){toast('Aucune carte précédente à restaurer','info');return;}
    const project=validateProject(JSON.parse(raw));
    const current=JSON.stringify(projectSnapshot());
    localStorage.setItem(CHECKPOINT_KEY,current);
    applyProject(project);persistProject();toast('↩ Carte précédente restaurée','ok');
  }catch{toast('Le point de retour ne peut pas être restauré','warn');}
};
window.exportProject=function(){
  const blob=new Blob([JSON.stringify(projectSnapshot(),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`gaiapolis-${new Date().toISOString().slice(0,10)}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast('📤 Export de la partie lancé','ok');
};
window.importProject=async function(file){
  if(!file||worldBusy)return;
  try{
    if(file.size>3*1024*1024)throw new Error('Fichier trop volumineux (maximum 3 Mo)');
    const project=validateProject(JSON.parse(await file.text()));
    if(worldBusy)return;
    if(!checkpointCurrent())return;
    applyProject(project);persistProject();toast('📥 Partie importée','ok');
  }catch(error){toast(`Import refusé : ${error.message}`,'warn');}
  finally{el('import-file').value='';}
};
function recordEdit(){undoStack.push(copy(placed));if(undoStack.length>40)undoStack.shift();redoStack.length=0;}
function updateHistoryButtons(){
  if(el('undo-btn'))el('undo-btn').disabled=!undoStack.length||worldBusy;
  if(el('redo-btn'))el('redo-btn').disabled=!redoStack.length||worldBusy;
}
function finishEdit(){clearHL();updateAll();updateHistoryButtons();persistProject();}
window.undoEdit=function(){
  if(worldBusy||!undoStack.length)return;
  closeMat(false);redoStack.push(copy(placed));placed=undoStack.pop();finishEdit();
};
window.redoEdit=function(){
  if(worldBusy||!redoStack.length)return;
  closeMat(false);undoStack.push(copy(placed));placed=redoStack.pop();finishEdit();
};
