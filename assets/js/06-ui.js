'use strict';

/* ═══ F. UI ═════════════════════════════════════════════════ */

let curTool='simple_house', curMat='wood';

function buildTools(){
  const g=el('tool-grid');g.innerHTML='';
  TORDER.forEach(id=>{
    const d=BLDGS[id];if(!d)return;
    const b=document.createElement('button');b.className='tb'+(id===curTool?' on':'');b.dataset.t=id;
    b.innerHTML=`${d.dot?`<span class="dot ${d.dot}"></span>`:''}
      <span class="ico">${d.i}</span><span>${d.l}</span>
      ${d.cost?`<span class="cost">${d.cost>=1000?(d.cost/1000).toFixed(0)+'k':d.cost}€</span>`:''}`;
    b.title=d.desc;
    b.addEventListener('click',()=>setTool(id));
    g.appendChild(b);
  });
}
function setTool(id){ curTool=id; document.querySelectorAll('.tb').forEach(b=>b.classList.toggle('on',b.dataset.t===id)); $t('h-toolname',BLDGS[id]?.l||id); clearHL(); }

function buildLayers(){
  const g=el('lyr-list');g.innerHTML='';
  LAYERS.forEach(ld=>{
    const row=document.createElement('div');row.className='lyr-row';
    row.innerHTML=`<div class="ldot" style="background:${ld.col}"></div><span>${ld.lbl}</span><div class="ltog${LYRON[ld.id]?' on':''}" id="ltog-${ld.id}"></div>`;
    row.addEventListener('click',()=>{LYRON[ld.id]=!LYRON[ld.id];el('ltog-'+ld.id).classList.toggle('on',LYRON[ld.id]);});
    g.appendChild(row);
  });
}

const accOpen={tools:true,loc:true,lyr:false,obj:true};
window.acc=function(id){
  const body=el('ab-'+id),hdr=el('ah-'+id);if(!body||!hdr)return;
  accOpen[id]=!accOpen[id];
  hdr.classList.toggle('open',accOpen[id]);
  hdr.querySelector('.arrow')?.classList.toggle('open',accOpen[id]);
  if(accOpen[id]){body.classList.remove('shut');body.style.maxHeight=body.scrollHeight+'px';}
  else{body.classList.add('shut');body.style.maxHeight='0';}
};
function initAcc(){
  Object.keys(accOpen).forEach(id=>{
    const body=el('ab-'+id),hdr=el('ah-'+id);if(!body||!hdr)return;
    if(accOpen[id]){body.style.maxHeight=body.scrollHeight+'px';hdr.classList.add('open');}
    else{body.classList.add('shut');body.style.maxHeight='0';}
  });
}

let dlgMat='wood',pendPl=null;
function openMatDlg(key,bid){
  pendPl={key,bid};dlgMat=curMat;
  el('mat-sub').textContent=`Matériau pour : ${BLDGS[bid].i} ${BLDGS[bid].l}`;
  buildMatGrid();updateMatPrev(bid);
  el('mat-dlg').classList.add('open');
}
function buildMatGrid(){
  const g=el('mat-g');g.innerHTML='';
  Object.entries(MATS).forEach(([id,m])=>{
    const c=document.createElement('div');c.className='mc'+(id===dlgMat?' sel':'');c.dataset.m=id;
    c.innerHTML=`<span class="mi">${m.icon}</span><span class="mn">${m.label}</span><span class="ms">Éco:${m.eco}/10</span>`;
    c.addEventListener('click',()=>{dlgMat=id;document.querySelectorAll('.mc').forEach(x=>x.classList.toggle('sel',x.dataset.m===id));updateMatPrev(pendPl?.bid);});
    g.appendChild(c);
  });
}
function updateMatPrev(bid){
  const m=MATS[dlgMat],d=bid?BLDGS[bid]:null;if(!m)return;
  const cost=d?~~(d.cost*(d.mat?m.cost:1)):0;
  const bar=(v,col)=>`<div class="mp-bar"><div class="mp-fill" style="width:${v*10}%;background:${col}"></div></div>`;
  el('mat-prev').innerHTML=`
    <div class="mp-row"><span class="mp-lbl">${m.icon} ${m.label}</span><span class="mp-val" style="color:${m.co2<0?'var(--gn)':'var(--am)'}">${m.co2>0?'+':''}${m.co2.toFixed(2)} kg CO₂/kg</span></div>
    <div class="mp-row" style="font-size:10px;color:var(--t3);margin-bottom:8px">${m.tip}</div>
    <div class="mp-row"><span class="mp-lbl">Solidité</span><span class="mp-val">${m.str}/10</span></div>${bar(m.str,'var(--ea)')}
    <div class="mp-row"><span class="mp-lbl">Isolation</span><span class="mp-val">${m.ins}/10</span></div>${bar(m.ins,'var(--bl)')}
    <div class="mp-row"><span class="mp-lbl">Résistance humidité</span><span class="mp-val">${m.moist}/10</span></div>${bar(m.moist,'var(--tl)')}
    <div class="mp-row"><span class="mp-lbl">Score écologique</span><span class="mp-val">${m.eco}/10</span></div>${bar(m.eco,'var(--gn)')}
    ${d?`<div class="mp-row" style="margin-top:6px;border-top:1px solid var(--b1);padding-top:6px"><span class="mp-lbl">Coût total estimé</span><span class="mp-val" style="color:var(--am)">${cost.toLocaleString('fr-FR')} €</span></div>`:''}`;
}
window.closeMat=function(ok){
  el('mat-dlg').classList.remove('open');
  if(ok&&pendPl){doPlace(pendPl.key,pendPl.bid,dlgMat);curMat=dlgMat;}
  pendPl=null;
};

let hR=-1,hC=-1;
cvs.addEventListener('click',e=>{
  const rect=cvs.getBoundingClientRect(),{r,c}=s2g(e.clientX-rect.left,e.clientY-rect.top);
  if(!inG(r,c))return;
  const key=`${r},${c}`;
  const t=terrain[key]||{};
  if(t.terrainType==='existing_building'&&curTool!=='__erase__'){
    showExistingInfo(t);
    return;
  }
  if(curTool==='__erase__'){delete placed[key];updateAll();return;}
  const d=BLDGS[curTool];if(!d)return;
  const check=canPlaceBuilding(curTool,t,key);
  if(!check.ok){ toast('🚫 '+check.why,'warn'); flashEffect(key,'bd'); return; }
  if(check.warn) toast(check.warn,'warn');
  else if(t.floodRisk>.5) toast('⚠️ Zone inondable — risque de dégâts','warn');
  else if(t.slope>.6) toast('⚠️ Pente trop forte — solidité réduite','warn');
  if(d.mat) openMatDlg(key,curTool);
  else doPlace(key,curTool,null);
});

function showExistingInfo(t){
  const f=t.existingFeature||{};
  const est=estimateExistingBuildingScore(f,t,climate);
  const bt=f.tags?.building||'inconnu';
  const area=f.area?~~f.area+' m²':'?';
  const confLbl={low:'faible',medium:'moyenne',high:'forte'}[est.confidence];
  toast(`🏘️ Bâtiment existant (${bt}, ~${area}) — Éco: ${est.ecoScore}/100 · Autarcie: ${est.autonomyScore}/100 · Confiance: ${confLbl}`,'info');
  if(est.reasons.length) toast(est.reasons[0]+(est.reasons[1]?' · '+est.reasons[1]:''),'info');
  toast('ℹ️ Estimation éducative simplifiée — pas une évaluation certifiée','warn');
}

function doPlace(key,bid,mat){
  placed[key]={id:bid,mat};
  const d=BLDGS[bid],t=terrain[key]||{};
  const sc=placeSc(t,d);
  if(sc>72){
    flashEffect(key,'ok');
    const why=[];
    if(d.oSun>.01&&t.sun>.62)                         why.push('☀️ excellent soleil');
    if(d.oWnd>.01&&t.wind>.62)                        why.push('💨 vent idéal');
    if(d.oFlo>.01&&(t.hydrologicalFlow||0)>.42)       why.push('🌊 bon débit');
    if(d.oGeo>.01&&(t.geothermalPotential||0)>.62)    why.push('🌋 géothermie forte');
    if(d.c===CAT.F&&t.fertility>.62)                  why.push('🌱 sol fertile');
    toast(`✨ Emplacement optimal ! ${why.slice(0,2).join(' · ')}`,'ok');
  } else if(sc<28){
    flashEffect(key,'bd');
    const warn=[];
    if(t.floodRisk>.5)                                warn.push('zone inondable');
    if(t.slope>.6)                                    warn.push('pente trop forte');
    if(d.oSun>.4&&(t.sun||0)<.3)                     warn.push('trop peu de soleil');
    if(d.oWnd>.4&&(t.wind||0)<.3)                    warn.push('vent insuffisant');
    if(d.oFlo>.4&&(t.hydrologicalFlow||0)<.2)        warn.push('débit trop faible');
    if(d.oGeo>.4&&(t.geothermalPotential||0)<.25)    warn.push('géothermie faible');
    toast(`⚠️ Mauvais emplacement${warn.length?' — '+warn.slice(0,2).join(', '):''}`,'warn');
  } else {
    toast(`🏗️ ${d.l} construit (score ${~~sc}/100)`,'info');
  }
  updateAll();
  tutNext(bid);
}

cvs.addEventListener('mousemove',e=>{
  const rect=cvs.getBoundingClientRect(),{r,c}=s2g(e.clientX-rect.left,e.clientY-rect.top);
  hR=r;hC=c;
  if(inG(r,c)){showTip(e.clientX-rect.left,e.clientY-rect.top,r,c);}
  else el('tip').style.display='none';
  $t('hud-coord',inG(r,c)?`Tuile (${r},${c}) — ${terrain[`${r},${c}`]?.bScore>=.7?'🏠 Bon terrain':terrain[`${r},${c}`]?.eScore>=.7?'⚡ Bon potentiel':''}`:'Survole une tuile pour voir ses ressources');
});
cvs.addEventListener('mouseleave',()=>{hR=-1;hC=-1;el('tip').style.display='none';});
