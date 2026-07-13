'use strict';

/* ═══ C. SIMULATION ═════════════════════════════════════════ */

function simulate() {
  let res=0,eP=0,eC=0,wP=0,wC=0,fP=0,cost=0,maint=0,cf=0,eco=0,str=0,co2=0,n=0;
  const matCnt={};
  for(const [k,v] of Object.entries(placed)) {
    const d=BLDGS[v.id]; if(!d||d.c==='erase') continue;
    const t=terrain[k]||{hdd:1}; n++;
    // Production factors — each energy source uses its specific terrain parameter
    const sf = d.oSun>.01 ? clamp((t.sun||.5)/d.oSun)*1.3  : 1; // solar
    const wf = d.oWnd>.01 ? clamp((t.wind||.5)/d.oWnd)*1.4 : 1; // wind
    // Hydro uses hydrologicalFlow AND slope bonus for micro-hydro
    const hf = d.oFlo>.01 ? clamp(
      (t.hydrologicalFlow||0)/d.oFlo * (v.id==='micro_hydro'?1+(t.slope||0)*0.8:1)
    )*1.1 : 0;
    // Geothermal uses geothermalPotential directly
    const gf = d.oGeo>.01 ? clamp((t.geothermalPotential||.3)/d.oGeo*1.15) : 1;
    const pf = (v.id==='solar_pv'||v.id==='solar_th') ? sf
             : v.id==='wind'                           ? wf
             : (v.id==='hydro_t'||v.id==='micro_hydro')? hf
             : v.id==='geothermal'                     ? gf : 1;
    // Energy — housing consumption scales with HDD climate factor
    const hdd = (v.id==='simple_house'||v.id==='bioclimatic') ? (t.hdd||1) : 1;
    eP += d.ep*pf;
    eC += d.ec*hdd;
    // Water — rain tank yields more in wet tiles
    wP += d.wp*(v.id==='rain_tank'?(t.water||.5)*1.5:1);
    wC += d.wc;
    // Food — yield depends on sun, water, fertility
    const ff=['garden','greenhouse','compost'].includes(v.id)
      ? clamp((t.sun||.5)*.4+(t.water||.5)*.3+(t.fertility||.5)*.3)*1.5 : 1;
    fP += d.fp*ff;
    // Finance
    const mMult = v.mat&&MATS[v.mat]?MATS[v.mat].cost:1;
    cost  += d.cost*(d.mat?mMult:1);
    maint += d.maint;
    res   += d.res;
    // Comfort — material bonus
    cf  += d.cf + (v.mat&&MATS[v.mat]?(MATS[v.mat].cf-5)*.5:0);
    eco += d.eco;
    // Structure — material strength, penalised by slope and flood
    const mStr = v.mat&&MATS[v.mat]?MATS[v.mat].str:d.str;
    str += Math.max(0, mStr*10 - (t.slope||0)*25 - (t.floodRisk||0)*18);
    // CO₂
    if(v.mat) { co2+=(MATS[v.mat].co2||0)*800; matCnt[v.mat]=(matCnt[v.mat]||0)+1; }
  }
  wC += res*120;                    // 120 L/resident/day
  const fN = res*2200;              // 2200 kcal/resident/day
  const R = v => Math.round(v*10)/10;
  const eA = eC>0?clamp(eP/eC)*100:0;
  const wA = wC>0?clamp(wP/wC)*100:0;
  const fA = fN>0?clamp(fP/fN)*100:0;
  const cfP  = n>0?Math.min(100,clamp(cf/(n*8))*100+(res>0?Math.min(15,res*2):0)):0;
  const strP = n>0?Math.min(100,str/n):0;
  const ecoP = n>0?clamp((eco/n+10)/20)*100:0;
  // Weighted global score: water>food>energy>structure>ecology>comfort
  const auto = clamp((wA*.25+fA*.2+eA*.2+strP*.15+ecoP*.12+cfP*.08)/100)*100;
  return { eP:R(eP),eC:R(eC),eN:R(eP-eC),eA:R(eA),
    wP:R(wP),wC:R(wC),wA:R(wA),fP:R(fP),fN:R(fN),fA:R(fA),
    cost:R(cost),maint:R(maint),res,cfP:R(cfP),strP:R(strP),ecoP:R(ecoP),
    auto:R(auto),co2:R(co2),matCnt };
}

/* Placement score — how well does building fit this tile? */
function placeSc(t, d) {
  let s = 50;
  if(d.oSun>.01) s += (t.sun||.5)/d.oSun * 20;
  if(d.oWnd>.01) s += (t.wind||.5)/d.oWnd * 18;
  if(d.oFlo>.01) s += (t.hydrologicalFlow||0)/d.oFlo * 22;
  if(d.oGeo>.01) s += (t.geothermalPotential||0)/d.oGeo * 22;
  if(d.oWat>.01) s += (t.water||.5)/d.oWat * 10;
  // BOTH flood and slope are penalties (v0.1.3 fix confirmed)
  s -= (t.floodRisk||0)*40 + (t.slope||0)*20;
  return clamp(s, 0, 100);
}
