'use strict';

/* ═══ D. RENDERER ═══════════════════════════════════════════ */

const BVIS = {
  simple_house:{ h:34,t:'#C4956A',l:'#8B5E3C',r:'#5A3A20' },
  bioclimatic: { h:28,t:'#A8D878',l:'#5A9030',r:'#3A6820' },
  solar_pv:    { h:8, t:'#4080D8',l:'#1848A8',r:'#0C2878' },
  solar_th:    { h:7, t:'#D89020',l:'#A06010',r:'#704008' },
  wind:        { h:52,t:'#B8C4B0',l:'#6A7A60',r:'#404A38' },
  hydro_t:     { h:20,t:'#30B8E8',l:'#1070A8',r:'#084878' },
  micro_hydro: { h:24,t:'#38A8D8',l:'#1860A0',r:'#0C4070' },
  geothermal:  { h:18,t:'#E89050',l:'#B85010',r:'#802000' },
  battery:     { h:14,t:'#5898C8',l:'#2060A0',r:'#103870' },
  rain_tank:   { h:20,t:'#50D0B0',l:'#189878',r:'#0A6050' },
  greywater:   { h:12,t:'#80C850',l:'#408020',r:'#285010' },
  garden:      { h:4, t:'#78D040',l:'#3A8010',r:'#205008' },
  greenhouse:  { h:24,t:'#B0E8A0',l:'#60B040',r:'#388020' },
  compost:     { h:6, t:'#C09040',l:'#887010',r:'#504808' },
  path:        { h:2, t:'#989080',l:'#706860',r:'#504840' },
  hall:        { h:40,t:'#D8C888',l:'#A89020',r:'#786008' },
};

const cvs = el('main-canvas'), ctx = cvs.getContext('2d');
const spc = el('spc'), sCtx = spc.getContext('2d');
let parts=[], windAng=0, wPh=0, gPh=0, hl={};

function resize() {
  const r=el('canvas-wrap').getBoundingClientRect();
  cvs.width=spc.width=r.width; cvs.height=spc.height=r.height-33;
  CW=cvs.width; CH=cvs.height;
}
new ResizeObserver(resize).observe(el('canvas-wrap'));

const iXY = (r,c) => ({ x:CW/2+(c-r)*(ISO.W/2), y:80+(c+r)*(ISO.H/2) });
function s2g(mx,my){ const ox=CW/2,oy=80,dx=mx-ox,dy=my-oy,W2=ISO.W/2,H2=ISO.H/2; return{r:~~((dy/H2-dx/W2)/2+.5),c:~~((dy/H2+dx/W2)/2+.5)}; }
const inG = (r,c) => r>=0&&r<ISO.R&&c>=0&&c<ISO.C;

function lrp(hex,t){ const v=parseInt(hex.replace('#','').padStart(6,'8'),16); return`rgb(${~~(((v>>16)&255)+(255-((v>>16)&255))*t)},${~~(((v>>8)&255)+(255-((v>>8)&255))*t)},${~~((v&255)+(255-(v&255))*t)})`; }
function rgba(hex,a){ const v=parseInt(hex.replace('#','').padStart(6,'8'),16); return`rgba(${(v>>16)&255},${(v>>8)&255},${v&255},${a})`; }
function blend(h1,h2,t){ const p=s=>parseInt(s.replace('#','').padStart(6,'0'),16),v1=p(h1),v2=p(h2),ch=(a,b)=>~~(a+(b-a)*t); return`rgb(${ch((v1>>16)&255,(v2>>16)&255)},${ch((v1>>8)&255,(v2>>8)&255)},${ch(v1&255,v2&255)})`; }
function poly(pts,col){ ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=.5;ctx.stroke(); }

function drawFrame() {
  ctx.clearRect(0,0,CW,CH);
  const order=[];for(let r=0;r<ISO.R;r++)for(let c=0;c<ISO.C;c++)order.push([r,c]);
  order.sort(([r1,c1],[r2,c2])=>(r1+c1)-(r2+c2));
  for(const[r,c]of order){
    const key=`${r},${c}`, t=terrain[key]||{};
    drawTile(r,c,t, r===hR&&c===hC, hl[key]);
    if(osmVisible&&t.terrainType==='existing_building') drawExistingBld(r,c);
    if(placed[key]) drawBuilding(r,c,placed[key].id,placed[key].mat,t);
  }
  drawParts();
}

function tileBase(t){
  if(osmVisible) switch(t.terrainType){
    case 'existing_building': return '#3A4250';
    case 'road':              return '#3A3A38';
    case 'river':             return '#123A55';
    case 'water':             return '#0C1F30';
  } else if(t.terrainType==='water'||t.terrainType==='river') return '#0C1F30';
  if(t.water>.82)return'#0C1F30';
  if(t.alt>.82)return'#252E1E';
  if(t.slope>.68)return'#242620';
  return'#111809';
}

function drawExistingBld(r,c){
  const {x,y}=iXY(r,c),W=ISO.W/2,H=ISO.H/2,bh=16;
  const pts={t:{x,y:y-H-bh},tr:{x:x+W,y:y-bh},tb:{x,y:y+H-bh},tl:{x:x-W,y:y-bh},br:{x:x+W,y},bb:{x,y:y+H},bl:{x:x-W,y}};
  poly([pts.t,pts.tr,pts.tb,pts.tl],'#5A6478');
  poly([pts.tr,pts.br,pts.bb,pts.tb],'#3A4250');
  poly([pts.tl,pts.tb,pts.bb,pts.bl],'#2A3040');
}

function drawTile(r,c,t,hover,h){
  const {x,y}=iXY(r,c),W=ISO.W/2,H=ISO.H/2;
  const base=tileBase(t);
  ctx.beginPath();ctx.moveTo(x,y-H);ctx.lineTo(x+W,y);ctx.lineTo(x,y+H);ctx.lineTo(x-W,y);ctx.closePath();
  ctx.fillStyle=hover?lrp(base,.38):base; ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.20)'; ctx.lineWidth=.5; ctx.stroke();
  for(const ld of LAYERS){
    if(!LYRON[ld.id]) continue;
    const raw=t[ld.fld]??0; if(raw<.04) continue;
    let a=raw*ld.a;
    if(ld.id==='water'||ld.id==='hydro') a*=.8+.2*Math.sin(wPh+(r+c)*.4);
    ctx.beginPath();ctx.moveTo(x,y-H);ctx.lineTo(x+W,y);ctx.lineTo(x,y+H);ctx.lineTo(x-W,y);ctx.closePath();
    ctx.fillStyle=rgba(ld.col,Math.min(.58,a)); ctx.fill();
  }
  if(h){
    const hA=.40+.22*Math.sin(gPh);
    ctx.beginPath();ctx.moveTo(x,y-H);ctx.lineTo(x+W,y);ctx.lineTo(x,y+H);ctx.lineTo(x-W,y);ctx.closePath();
    ctx.fillStyle=rgba(h.col,hA); ctx.fill();
    ctx.strokeStyle=rgba(h.col,1); ctx.lineWidth=2.5; ctx.stroke();
  }
  if(hover&&curTool&&curTool!=='__erase__'){
    const d=BLDGS[curTool]; if(!d) return;
    const chk=canPlaceBuilding(curTool,t,`${hR},${hC}`);
    ctx.beginPath();ctx.moveTo(x,y-H);ctx.lineTo(x+W,y);ctx.lineTo(x,y+H);ctx.lineTo(x-W,y);ctx.closePath();
    if(!chk.ok){
      ctx.fillStyle='rgba(242,112,96,.30)'; ctx.fill();
      ctx.strokeStyle='rgba(242,112,96,.75)'; ctx.lineWidth=2; ctx.stroke();
      return;
    }
    const sc=placeSc(t,d);
    if(sc>70){
      ctx.fillStyle='rgba(72,224,128,.24)'; ctx.fill();
      ctx.strokeStyle=`rgba(72,224,128,${.55+Math.sin(gPh*2)*.3})`; ctx.lineWidth=2; ctx.stroke();
    } else if(sc<28&&(t.floodRisk>.45||t.slope>.6)){
      ctx.fillStyle='rgba(242,112,96,.22)'; ctx.fill();
      ctx.strokeStyle='rgba(242,112,96,.58)'; ctx.lineWidth=1.5; ctx.stroke();
    } else {
      ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fill();
    }
  }
}

function drawBuilding(r,c,bid,mat,t){
  const v=BVIS[bid]; if(!v) return;
  const {x,y}=iXY(r,c),W=ISO.W/2,H=ISO.H/2,bh=v.h;
  const top=mat&&MATS[mat]?blend(v.t,MATS[mat].col,.25):v.t;
  const pts={
    t:{x,y:y-H-bh},tr:{x:x+W,y:y-bh},tb:{x,y:y+H-bh},tl:{x:x-W,y:y-bh},
    br:{x:x+W,y},bb:{x,y:y+H},bl:{x:x-W,y}
  };
  poly([pts.t,pts.tr,pts.tb,pts.tl],top);
  if(bid!=='path'){poly([pts.tr,pts.br,pts.bb,pts.tb],v.r);poly([pts.tl,pts.tb,pts.bb,pts.bl],v.l);}
  if(bid==='wind'||bid==='hydro_t'){
    const spd=bid==='wind'?(t?.wind||.5):.85;
    ctx.save();ctx.translate(x,y-H-bh-4);
    const bl=bid==='hydro_t'?9:13;
    for(let i=0;i<3;i++){
      ctx.save();ctx.rotate((windAng*(bid==='wind'?1:1.4)+i*120)*Math.PI/180);
      ctx.fillStyle=bid==='hydro_t'?'#32DEB8':'#C0CCBA';
      ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(-1,-bl*Math.min(1.5,.4+spd));ctx.lineTo(1,-bl*Math.min(1.5,.4+spd));ctx.lineTo(2,0);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='#555';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  if(bid==='solar_pv'||bid==='solar_th'){
    const sv=t?.sun||.5;
    ctx.globalAlpha=.25+sv*.55+Math.sin(gPh*1.5)*.12;
    ctx.fillStyle=bid==='solar_pv'?'#1848A8':'#804000';
    for(let i=0;i<3;i++)for(let j=0;j<2;j++) ctx.fillRect(x-11+i*8,y-H-bh+1+j*4,7,3);
    if(sv>.6){ctx.globalAlpha=(sv-.6)*(.32+Math.sin(gPh*2)*.2);ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(x-2,y-H-bh+2,3,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
  }
  if(bid==='garden'||bid==='compost'){
    ctx.fillStyle=bid==='compost'?'#886010':'#2A8010';
    [[-7,0],[0,-3],[7,0],[-3,4],[3,4]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx,y-H-bh+dy,2,0,Math.PI*2);ctx.fill();});
  }
  if(bid==='geothermal'){
    ctx.save();ctx.translate(x,y-H-bh);
    for(let i=0;i<3;i++){ctx.globalAlpha=.14+Math.abs(Math.sin(gPh*.7+i*.8))*.22;ctx.strokeStyle='#F27060';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,5+i*5,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;ctx.restore();
  }
  if(bid==='micro_hydro'){
    ctx.save();ctx.translate(x,y-H-bh);
    for(let i=0;i<2;i++){ctx.globalAlpha=.4+Math.sin(wPh*1.2+i*1.8)*.3;ctx.strokeStyle='#52C4FC';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-12,3*i);ctx.quadraticCurveTo(0,-5+3*i,12,3*i);ctx.stroke();}
    ctx.globalAlpha=1;ctx.restore();
  }
  if(bid==='rain_tank'){ctx.globalAlpha=.2+Math.sin(wPh*.7)*.12;ctx.fillStyle='#32DEB8';poly([pts.t,pts.tr,pts.tb,pts.tl],'rgba(50,222,184,.22)');ctx.globalAlpha=1;}
  if(bid==='greenhouse'){ctx.globalAlpha=.14+Math.sin(gPh*.9)*.08;poly([pts.t,pts.tr,pts.tb,pts.tl],'rgba(160,220,255,.2)');ctx.globalAlpha=1;}
}

function spawnParts(px,py,type){
  const n=type==='ok'?22:8;
  const cols=type==='ok'?['#48E080','#F4BC3A','#52C4FC','#FFFFFF','#BC88F4']:['#F27060','#F4BC3A','#BC88F4'];
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,sp=type==='ok'?1.5+Math.random()*3.5:.8+Math.random()*1.8;
    parts.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,
      decay:type==='ok'?.02+Math.random()*.025:.035+Math.random()*.04,
      r:type==='ok'?2+Math.random()*4:1.5+Math.random()*2.5,
      col:cols[~~(Math.random()*cols.length)],star:type==='ok'&&Math.random()>.5});
  }
}
function drawParts(){
  sCtx.clearRect(0,0,spc.width,spc.height);
  parts=parts.filter(p=>p.life>0);
  for(const p of parts){
    sCtx.globalAlpha=Math.pow(p.life,1.5);sCtx.fillStyle=p.col;
    if(p.star){sCtx.save();sCtx.translate(p.x,p.y);sCtx.beginPath();for(let i=0;i<5;i++){sCtx.rotate(Math.PI*.4);sCtx.lineTo(0,p.r*p.life);sCtx.lineTo(0,p.r*.4);}sCtx.closePath();sCtx.fill();sCtx.restore();}
    else{sCtx.beginPath();sCtx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);sCtx.fill();}
    p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life-=p.decay;
  }
  sCtx.globalAlpha=1;
}
function flashEffect(key,type){
  const[r,c]=key.split(',').map(Number),{x,y}=iXY(r,c);
  spawnParts(x,y-20,type);
  const f=el('flash');f.className='';
  requestAnimationFrame(()=>{f.className=type;f.style.opacity='1';setTimeout(()=>f.style.opacity='0',type==='ok'?420:360);});
}

/* ═══ E. TOOLTIP ════════════════════════════════════════════ */

function tileRecs(t){
  const tags=[];
  if(t.sun>.65)                       tags.push({c:'tag-ok',v:'☀️ Idéal solaire'});
  if(t.wind>.6)                       tags.push({c:'tag-ok',v:'💨 Idéal éolien'});
  if((t.hydrologicalFlow||0)>.45)     tags.push({c:'tag-ok',v:'🌊 Hydrolien possible'});
  if((t.geothermalPotential||0)>.6)   tags.push({c:'tag-ok',v:'🌋 Géothermie forte'});
  if(t.fScore>.7)                     tags.push({c:'tag-ok',v:'🌱 Bon potager'});
  if(t.bScore>.7)                     tags.push({c:'tag-ok',v:'🏠 Bon terrain à bâtir'});
  if(t.floodRisk>.45)                 tags.push({c:'tag-bd',v:'⚠️ Risque inondation'});
  if(t.slope>.55)                     tags.push({c:'tag-wn',v:'⚠️ Pente forte'});
  if(t.stability<.3)                  tags.push({c:'tag-bd',v:'⚠️ Sol instable'});
  if(!tags.length)                    tags.push({c:'tag-wn',v:'Terrain ordinaire'});
  return tags;
}

function showTip(mx,my,r,c){
  const key=`${r},${c}`,t=terrain[key];if(!t)return;
  const tip=el('tip');
  const pb=placed[key];
  const ttLbl={existing_building:'🏘️ Bâtiment existant (OSM)',road:'🛣️ Route existante',river:'🌊 Rivière',water:'💧 Plan d\'eau'};
  let blab=pb?`${BLDGS[pb.id]?.i||''} ${BLDGS[pb.id]?.l||''}`:(ttLbl[t.terrainType]||'Terrain libre');
  let extra='';
  if(t.terrainType==='existing_building'&&t.existingFeature){
    const est=estimateExistingBuildingScore(t.existingFeature,t,climate);
    const confLbl={low:'faible',medium:'moyenne',high:'forte'}[est.confidence];
    extra=`<div style="margin-top:6px;padding-top:6px;border-top:1px solid var(--b1);font-size:10px;color:var(--t2)">
      Éco: <b style="color:var(--gn)">${est.ecoScore}/100</b> · Autarcie: <b style="color:var(--am)">${est.autonomyScore}/100</b> · Confiance: ${confLbl}<br>
      <span style="color:var(--t3)">Clic pour détails — estimation éducative</span></div>`;
  } else if(t.terrainType&&t.terrainType!=='land'&&!pb){
    extra=`<div style="margin-top:6px;font-size:10px;color:var(--rd)">🚫 Non constructible</div>`;
  }
  const bar=(v,col)=>`<div class="tip-bar"><div class="tip-fill" style="width:${~~(v*100)}%;background:${col}"></div></div>`;
  const pct=v=>`${~~((v||0)*100)}%`;
  tip.innerHTML=`
    <div class="tip-title">${blab}${pb?.mat?` <span style="font-size:10px;font-weight:400;color:var(--t2)">— ${MATS[pb.mat]?.label||''}</span>`:''}</div>
    <div class="tip-grid">
      <div class="tip-row">☀️ Soleil ${bar(t.sun,'#F4BC3A')}<span class="tip-v">${pct(t.sun)}</span></div>
      <div class="tip-row">💨 Vent ${bar(t.wind,'#52C4FC')}<span class="tip-v">${pct(t.wind)}</span></div>
      <div class="tip-row">💧 Eau ${bar(t.water,'#32DEB8')}<span class="tip-v">${pct(t.water)}</span></div>
      <div class="tip-row">🌱 Fertilité ${bar(t.fertility,'#48E080')}<span class="tip-v">${pct(t.fertility)}</span></div>
      <div class="tip-row">🏗️ Stabilité ${bar(t.stability,'#C89850')}<span class="tip-v">${pct(t.stability)}</span></div>
      <div class="tip-row">🌋 Géothermie ${bar(t.geothermalPotential,'#F27060')}<span class="tip-v">${pct(t.geothermalPotential)}</span></div>
      <div class="tip-row">🌊 Débit ${bar(t.hydrologicalFlow,'#52C4FC')}<span class="tip-v">${pct(t.hydrologicalFlow)}</span></div>
      <div class="tip-row">⚠️ Inondation ${bar(t.floodRisk,'#BC88F4')}<span class="tip-v">${pct(t.floodRisk)}</span></div>
    </div>
    <div class="tip-tags">${tileRecs(t).map(g=>`<span class="tag ${g.c}">${g.v}</span>`).join('')}</div>${extra}`;
  const rect=cvs.getBoundingClientRect();
  tip.style.left=Math.min(mx+16,rect.width-272)+'px';
  tip.style.top =Math.max(4,Math.min(my-10,CH-220))+'px';
  tip.style.display='block';
}
