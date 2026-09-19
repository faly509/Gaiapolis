'use strict';

// Daily educational balances. See docs/MODEL.md for units and assumptions.
// Explicit arguments allow comparisons and tests without changing the city.
function simulate(buildings=placed,tiles=terrain,weather=climate){
  let res=0,electric=0,heat=0,eC=0,heatNeed=0,wC=0,fP=0,cost=0,maint=0;
  let cf=0,eco=0,str=0,co2=0,n=0,structural=0,homes=0,tanks=0,recycling=0,batteries=0;
  const matCnt={};
  const inhabited=Object.values(buildings).some(b=>BLDGS[b.id]?.res>0);
  for(const [key,v] of Object.entries(buildings)){
    const d=BLDGS[v.id],t=tiles[key];
    if(!d||d.c==='erase'||!t)continue;
    const m=d.mat?MATS[v.mat]:null;
    n++;res+=d.res;
    const sf=d.oSun>0?clamp((t.sun??0)/d.oSun)*1.3:1;
    const wf=d.oWnd>0?clamp((t.wind??0)/d.oWnd)*1.4:1;
    const hf=d.oFlo>0?clamp((t.hydrologicalFlow??0)/d.oFlo*(v.id==='micro_hydro'?1+(t.slope??0)*.8:1))*1.1:0;
    const gf=d.oGeo>0?clamp((t.geothermalPotential??0)/d.oGeo*1.15):1;
    const pf=['solar_pv','solar_th'].includes(v.id)?sf:v.id==='wind'?wf:['hydro_t','micro_hydro'].includes(v.id)?hf:v.id==='geothermal'?gf:1;
    if(v.id==='solar_th')heat+=d.ep*pf;else electric+=d.ep*pf;
    const isHome=d.c===CAT.H;
    const consumption=d.ec*(isHome?(t.hdd??1)*clamp(1+(8-(m?.ins??8))*.06,.7,1.5):1);
    eC+=consumption;
    if(isHome){homes++;heatNeed+=consumption*.5;}
    wC+=d.wc;
    if(v.id==='rain_tank')tanks++;
    if(v.id==='greywater')recycling+=d.wp;
    if(v.id==='battery')batteries++;
    if(v.id==='garden'||v.id==='greenhouse'){
      const [r,c]=key.split(',').map(Number);
      const compost=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([rr,cc])=>buildings[`${rr},${cc}`]?.id==='compost');
      const ff=clamp((t.sun??0)*.4+(t.water??0)*.3+(t.fertility??0)*.3)*1.5;
      fP+=d.fp*ff*(compost&&inhabited?1.15:1);
    }
    cost+=d.cost*(m?.cost??1);maint+=d.maint;
    cf+=d.cf+(m?(m.cf-5)*.5:0);
    eco+=m?(d.eco+(m.eco*2-10))/2:d.eco;
    if(d.mat){
      structural++;
      str+=Math.max(0,(m?.str??d.str)*10-(t.slope??0)*25-(t.floodRisk??0)*18);
    }
    if(m){co2+=m.co2*800;matCnt[v.mat]=(matCnt[v.mat]||0)+1;}
  }
  wC+=res*120;
  const fN=res*2200;
  // Tanks share available roofs; extra tanks cannot invent catchment area.
  const rainArea=Math.min(tanks*100,homes*80);
  const rainWater=Math.max(0,weather.precip??0)*rainArea*.8;
  // Non-potable treated water cannot exceed the available feedstock.
  const greyWater=Math.min(recycling,res*120*.6*.8);
  const wP=rainWater+greyWater;
  const heatUsed=Math.min(heat,heatNeed),eP=electric+heatUsed;
  const eA=eC>0?clamp(eP/eC)*100:0,wA=wC>0?clamp(wP/wC)*100:0,fA=fN>0?clamp(fP/fN)*100:0;
  const cfP=n?clamp(cf/(n*8)+Math.min(15,res*2)/100)*100:0;
  const strP=structural?clamp(str/structural/100)*100:0;
  const ecoP=n?clamp((eco/n+10)/20)*100:0;
  const auto=res?clamp((wA*.25+fA*.2+eA*.2+strP*.15+ecoP*.12+cfP*.08)/100)*100:0;
  const storage=batteries*10,reserveHours=eC>0?storage*.9/(eC/24):0;
  const raw={res,eP,eC,eN:eP-eC,eA,electric,heat,heatUsed,wP,wC,wA,rainWater,greyWater,rainArea,
    fP,fN,fA,cost,maint,cfP,strP,ecoP,auto,co2,storage,reserveHours};
  return {...Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Math.round(v*10)/10])),matCnt};
}

function placeSc(t,d){
  let s=50;
  if(d.oSun>.01)s+=(t.sun??0)/d.oSun*20;
  if(d.oWnd>.01)s+=(t.wind??0)/d.oWnd*18;
  if(d.oFlo>.01)s+=(t.hydrologicalFlow??0)/d.oFlo*22;
  if(d.oGeo>.01)s+=(t.geothermalPotential??0)/d.oGeo*22;
  if(d.oWat>.01)s+=(t.water??0)/d.oWat*10;
  if(d.c===CAT.F)s+=(t.fertility??0)*12;
  s-=(t.floodRisk??0)*40+(t.slope??0)*20;
  return clamp(s,0,100);
}

function getAdvice(s=simulate()){
  if(!s.res)return{title:'Commence par un habitat',text:'Loge 4 habitants pour définir les besoins du territoire.',ids:['bioclimatic','simple_house']};
  const gaps=[{ratio:s.wA,title:'L’eau est prioritaire',text:`Il manque ${Math.max(0,Math.round(s.wC-s.wP))} L/j. Les citernes utilisent la pluie et les toitures; les eaux grises restent non potables.`,ids:['rain_tank','greywater']},
    {ratio:s.fA,title:'Développe les cultures',text:`Il manque ${Math.max(0,Math.round(s.fN-s.fP))} kcal/j. Un composteur voisin améliore les cultures.`,ids:['garden','greenhouse']},
    {ratio:s.eA,title:'Équilibre l’énergie',text:`Il manque ${Math.max(0,Math.round((s.eC-s.eP)*10)/10)} kWh/j. Compare les sources adaptées au terrain.`,ids:['solar_pv','wind','hydro_t','micro_hydro','geothermal']}].sort((a,b)=>a.ratio-b.ratio);
  if(gaps[0].ratio<100)return gaps[0];
  return{title:'Besoins quotidiens couverts',text:'Teste une semaine sèche ou peu ensoleillée. La couverture journalière ne garantit pas la continuité.',ids:['battery']};
}

function compareConditions(){
  const cases=[['Actuel',1,1,1],['Semaine sèche',0,1,1],['Peu de soleil',1,.35,1],['Vent faible',1,1,.25]];
  return cases.map(([name,rain,sun,wind])=>{
    const tiles=Object.fromEntries(Object.entries(terrain).map(([k,t])=>[k,{...t,sun:t.sun*sun,wind:t.wind*wind,water:t.water*(rain===0?.6:1),hydrologicalFlow:t.hydrologicalFlow*(rain===0?.6:1)}]));
    return{name,scores:simulate(placed,tiles,{...climate,precip:climate.precip*rain})};
  });
}
