'use strict';

/* ═══ G. OBJECTIVES ═════════════════════════════════════════ */

function buildObjs(){
  const list=el('obj-list');list.innerHTML='';
  OBJECTIVES.forEach(o=>{
    const d=document.createElement('div');d.className='obj';d.id='obj-'+o.id;
    d.innerHTML=`<span class="obj-ico">${o.ico}</span><span class="obj-txt">${o.txt}</span><span class="obj-prg" id="prg-${o.id}">—</span><span class="obj-chk">✅</span>`;
    list.appendChild(d);
  });
}
function updateObjs(s){
  OBJECTIVES.forEach(o=>{
    const row=el('obj-'+o.id),prg=el('prg-'+o.id);if(!row)return;
    if(prg)prg.textContent=o.prg(s);
    const done=o.chk(s);
    row.classList.toggle('done',done);
    if(done&&!doneSet.has(o.id)){doneSet.add(o.id);showReward(o.id);}
  });
}
function showReward(id){
  const rw=REWDS[id]||{e:'🎉',t:'Objectif atteint !',s:''};
  $t('rw-e',rw.e);$t('rw-t',rw.t);$t('rw-s',rw.s);
  const r=el('reward');r.classList.add('show');
  setTimeout(()=>r.classList.remove('show'),3400);
}

/* ═══ H. TUTORIAL ═══════════════════════════════════════════ */

const TUT = [
  { ico:'🏠', txt:'Place une <b>Maison simple</b> sur une tuile verte (sol stable). Elle logera 4 habitants.' },
  { ico:'☀️', txt:'Ajoute des <b>Panneaux PV</b> sur une tuile orange vif (soleil élevé).' },
  { ico:'💧', txt:'Place une <b>Citerne pluie</b> pour collecter l\'eau et améliorer l\'autonomie hydrique.' },
  { ico:'🏆', txt:'Atteins <b>50% d\'autonomie énergétique</b> pour terminer le tutoriel !' },
];
let tutStep=0, tutDone=false;

function buildTut(){
  el('tut-steps').innerHTML='';el('tut-pips').innerHTML='';
  TUT.forEach((s,i)=>{
    const cls=i<tutStep?'tn-done':i===tutStep?'tn-cur':'tn-next';
    const div=document.createElement('div');div.className='tut-row';
    div.innerHTML=`<div class="tut-num ${cls}">${i<tutStep?'✓':i+1}</div><div class="tut-txt">${s.ico} ${s.txt}</div>`;
    if(i===tutStep)el('tut-steps').appendChild(div);
    const pip=document.createElement('div');pip.className='tut-pip'+(i<tutStep?' done':i===tutStep?' cur':'');
    el('tut-pips').appendChild(pip);
  });
}
function tutNext(bid){
  if(tutDone)return;
  if(tutStep===0&&(bid==='simple_house'||bid==='bioclimatic')){tutStep=1;buildTut();}
  else if(tutStep===1&&(bid==='solar_pv'||bid==='solar_th'||bid==='wind')){tutStep=2;buildTut();}
  else if(tutStep===2&&(bid==='rain_tank'||bid==='greywater')){tutStep=3;buildTut();}
}
function checkTutScore(s){
  if(tutDone||tutStep<3)return;
  if(s.eA>=50){tutDone=true;el('tut').classList.add('gone');toast('🎓 Tutoriel terminé — explore librement !','ok');}
}
window.skipTut=function(){el('tut').classList.add('gone');tutDone=true;persistProject();};

/* ═══ I. OPTIMIZER ══════════════════════════════════════════ */

function findBest(){
  if(curTool==='__erase__'){toast('Sélectionne un bâtiment d\'abord','info');return;}
  const d=BLDGS[curTool];if(!d)return;
  const scored=Object.entries(terrain)
    .filter(([k,t])=>canPlaceBuilding(curTool,t,k).ok)
    .map(([key,t])=>{
      const sc=placeSc(t,d);
      const why=[];
      if(t.sun>.62&&d.oSun>.01)                    why.push(`☀️ soleil ${~~(t.sun*100)}%`);
      if(t.wind>.62&&d.oWnd>.01)                   why.push(`💨 vent ${~~(t.wind*100)}%`);
      if((t.hydrologicalFlow||0)>.42&&d.oFlo>.01)  why.push('🌊 débit fort');
      if((t.geothermalPotential||0)>.62&&d.oGeo>.01) why.push('🌋 géo fort');
      if(t.fertility>.65&&d.c===CAT.F)             why.push('🌱 sol fertile');
      if(t.bScore>.72&&(d.c===CAT.H||d.c===CAT.I)) why.push('🏠 terrain stable');
      if(t.floodRisk>.45)                          why.push('⚠️ inond.');
      return{key,sc,why:why.slice(0,2).join(' · ')||'Emplacement correct'};
    })
    .sort((a,b)=>b.sc-a.sc).slice(0,5);

  if(!scored.length){clearHL();toast('Aucun emplacement autorisé pour cet équipement','warn');return;}
  hl={};
  scored.forEach((b,i)=>{ hl[b.key]={col:i===0?'#48E080':'#F4BC3A', reason:b.why}; });
  const strip=el('hint');strip.classList.add('vis');
  $t('hint-txt',`${d.i} ${d.l} — vert=optimal, orange=bon · ${scored[0]?scored[0].why:''}`);
}
function clearHL(){hl={};el('hint').classList.remove('vis');}

/* ═══ J. DASHBOARD ══════════════════════════════════════════ */

let scores={};
function updateAll(){
  scores=simulate();
  const s=scores;
  setMet('e',s.eA,'var(--am)',`Prod: ${s.eP} · Conso: ${s.eC} kWh/j`);
  setMet('w',s.wA,'var(--bl)',`Prod: ${s.wP} · Conso: ${s.wC} L/j`);
  setMet('f',s.fA,'var(--gn)',`Prod: ${s.fP} · Besoin: ${s.fN} kcal/j`);
  setMet('eco',s.ecoP,'var(--gn)');
  setMet('str',s.strP,'var(--ea)');
  setMet('cf',s.cfP,'var(--pu)');
  const enet=el('kpi-enet');if(enet){const n=s.eN;enet.textContent=(n>=0?'+':'')+n;enet.style.color=n>=0?'var(--gn)':'var(--rd)';}
  $t('kpi-res',s.res);
  const co2=el('kpi-co2');if(co2){const cv=~~s.co2;co2.textContent=(cv>0?'+':'')+cv+' kg';co2.style.color=cv<=0?'var(--gn)':'var(--am)';}
  $t('kpi-maint',s.maint.toLocaleString('fr-FR'));
  $t('h-res',s.res);$t('h-cnt',Object.keys(placed).length);
  $t('h-cost',s.cost.toLocaleString('fr-FR')+' €');
  const pill=el('h-score');if(pill){const a=s.auto;pill.textContent=`Score ${~~a}%`;pill.className='h-pill '+(a>=60?'hp-g':a>=30?'hp-a':'hp-r');}
  drawRing(s.auto);
  $t('ring-pct',~~s.auto+'%');
  $t('score-lvl',!s.res?'Construis ton premier habitat':s.auto>=80?'Expert écologique 🏆':s.auto>=60?'EcoConstructeur 🌿':s.auto>=40?'Apprenti écologique 🌱':'Autonomie à développer');
  updateObjs(s);
  checkTutScore(s);
  updateAdvisor(s);
}
function setMet(id,v,col,sub){
  const f=el('mf-'+id);if(f)f.style.width=Math.min(100,v)+'%';
  const vv=el('mv-'+id);if(vv){vv.textContent=~~v+'%';vv.style.color=v>=60?'var(--gn)':v>=30?'var(--am)':'var(--rd)';}
  const ss=el('ms-'+id);if(ss&&sub)ss.textContent=sub;
}
function cssColor(name,fallback){
  const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v||fallback;
}
function drawRing(pct){
  const c=el('ring');if(!c)return;
  const cx=c.getContext('2d'),cx2=29,cy2=29,r=24;
  cx.clearRect(0,0,58,58);
  cx.beginPath();cx.arc(cx2,cy2,r,0,Math.PI*2);cx.strokeStyle=cssColor('--b1','#263320');cx.lineWidth=4;cx.stroke();
  if(pct>0){
    const ringColor=pct>=60?cssColor('--gn','#48E080'):pct>=30?cssColor('--am','#F4BC3A'):cssColor('--rd','#F27060');
    cx.beginPath();cx.arc(cx2,cy2,r,-Math.PI/2,-Math.PI/2+pct/100*Math.PI*2);cx.strokeStyle=ringColor;cx.lineWidth=4;cx.lineCap='round';cx.stroke();
  }
}

/* ═══ K. SAVE / RESET ═══════════════════════════════════════ */

window.resetMap=function(){
  if(worldBusy||!checkpointCurrent())return;
  climate={...DEFAULT_CLIMATE};terrainSeed=Math.floor(Math.random()*9999);
  placed={};terrain=generateTerrain(ISO.C,ISO.R,terrainSeed);
  osm={loaded:false,buildings:0,roads:0,waters:0,radius:0};
  resetProgress();refreshLocationUI();updateAll();updateHistoryButtons();persistProject();
  toast('Nouvelle carte — Retour carte restaure la précédente','info');
};

/* ═══ L. GAME LOOP & INIT ═══════════════════════════════════ */

function toast(msg,type='info'){
  const box=el('toasts'),t=document.createElement('div');t.className=`toast t-${type}`;t.textContent=msg;
  box.appendChild(t);setTimeout(()=>t.remove(),3200);
}

function updateAdvisor(s){
  const advice=getAdvice(s);$t('advice-title',advice.title);$t('advice-text',advice.text);
  const choices=el('advice-choices');if(!choices)return;choices.replaceChildren();
  for(const id of advice.ids){
    const candidates=Object.entries(terrain).filter(([k,t])=>canPlaceBuilding(id,t,k).ok);
    if(!candidates.length)continue;
    const [key]=candidates.sort((a,b)=>placeSc(b[1],BLDGS[id])-placeSc(a[1],BLDGS[id]))[0];
    const result=simulate({...placed,[key]:{id,mat:BLDGS[id].mat?curMat:null}});
    const delta=Math.round((result.auto-s.auto)*10)/10;
    const button=document.createElement('button');button.className='advice-option';
    button.textContent=`${BLDGS[id].i} ${BLDGS[id].l} · ${delta>=0?'+':''}${delta} pt`;
    button.title='Estimation à la meilleure tuile, matériau actuellement sélectionné';
    button.addEventListener('click',()=>{setTool(id);findBest();window.closeMobileDrawers?.();});choices.append(button);
  }
  $t('reserve-info',s.storage?`Stockage : ${s.storage} kWh · réserve théorique pleine : ${s.reserveHours} h`:'Stockage : aucune batterie');
  $t('water-detail',`Pluie : ${s.rainWater} L/j · eaux grises : ${s.greyWater} L/j (non potables)`);
  $t('energy-detail',`Électricité : ${s.electric} · chaleur utile : ${s.heatUsed} kWh/j`);
  $t('data-status',climate.source==='forecast'?`Météo : prévisions 7 jours${climate.fetchedAt?' du '+new Date(climate.fetchedAt).toLocaleDateString('fr-FR'):''} · OSM : ${osm.loaded?'chargé':'indisponible'}`:climate.source==='legacy'?'Ancien climat : recharge le lieu pour actualiser les unités':'Mode démonstration · ressources simulées');
  if(el('scenario-panel').open)renderScenarios();
}
function renderScenarios(){
  const body=el('scenario-body');body.replaceChildren();
  for(const item of compareConditions()){
    const tr=document.createElement('tr');
    for(const value of [item.name,`${Math.round(item.scores.eA)} %`,`${Math.round(item.scores.wA)} %`,`${Math.round(item.scores.fA)} %`]){
      const td=document.createElement('td');td.textContent=value;tr.append(td);
    }
    body.append(tr);
  }
}

let lastT=0;
function loop(ts){
  const dt=Math.min(ts-lastT,80);lastT=ts;
  if(document.hidden){requestAnimationFrame(loop);return;}
  const wk=Object.keys(placed).filter(k=>placed[k].id==='wind'||placed[k].id==='hydro_t');
  const aw=wk.length?wk.reduce((s,k)=>s+(terrain[k]?.wind||.5),0)/wk.length:.5;
  windAng=(windAng+dt*(0.05+aw*.22))%360;
  wPh=(wPh+dt*.001)%(Math.PI*2);
  gPh=(gPh+dt*.0014)%(Math.PI*2);
  drawFrame();
  requestAnimationFrame(loop);
}

function init(){
  buildTools();buildLayers();buildObjs();buildTut();
  terrain=generateTerrain(ISO.C,ISO.R,42);
  if(!loadSave())updateAll();
  resize();initAcc();updateHistoryButtons();
  setTimeout(()=>{initAcc();resize();},120);
  requestAnimationFrame(loop);
  setTimeout(()=>toast('🌍 Gaiapolis — construis un territoire autonome','info'),900);
}
init();
