'use strict';

const ISO={W:50,H:25,C:18,R:18};
let CW=800,CH=560;
let terrain={},placed={};
let climate={sun:.55,wind:.45,rain:.50,temp:15,radiation:4.4,windMax:18,precip:2.5,name:'',lat:null,lon:null,biome:'Tempéré'};
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const nx=(x,y,f,p=0)=>Math.sin(x*f+p)*.3+Math.cos(y*f*1.3+p*.7)*.2;

function generateTerrain(cols,rows,seed=42){
  const g={},s=seed*.01,{sun:cS,wind:cW,rain:cR,temp:cT}=climate;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const cx=c/cols,cy=r/rows;
    const alt=clamp(.5+nx(cx,cy,5.1+s,2.1)+nx(cx,cy,2.2,.9));
    const hum=clamp(cR*.5+.2+nx(cx,cy,2.5+s,.3)*.38+nx(cx,cy,5.8,4.1)*.28);
    const sun=clamp(cS*.6+.2+nx(cx,cy,4.2+s,1.1)*.34+nx(cx,cy,2.1,3.3)*.19-alt*.08);
    const wind=clamp(cW*.5+.25+nx(cx,cy,3.7+s,.8)*.34+nx(cx,cy,6.1,2.1)*.19+alt*.14);
    const water=clamp(hum*.6+(1-alt)*.28+nx(cx,cy,3.3+s,1.8)*.18);
    const slope=clamp(Math.abs(nx(cx,cy,8+s,3.3)));
    const fertility=clamp(water*.35+hum*.3+(1-slope)*.25+sun*.1);
    const floodRisk=clamp(water>.72?(water-.72)*3.5:0);
    const stability=clamp(1-slope*.7-floodRisk*.3);
    const geothermalPotential=clamp(alt*.35+nx(cx,cy,1.5+s,5.1)*.3+.2);
    const hydrologicalFlow=clamp(water>.55?(water-.55)*slope*2.2+nx(cx,cy,3+s,7.2)*.12:0);
    const hdd=cT<5?1.5:cT<12?1.2:cT>28?1.15:1;
    g[`${r},${c}`]={alt,slope,sun,wind,water,fertility,humidity:hum,stability,floodRisk,geothermalPotential,hydrologicalFlow,hdd,terrainType:water>.82?'water':'land',buildable:water<=.82,existingFeature:null,bScore:clamp((1-slope)*.4+(1-floodRisk)*.25+sun*.2+(1-hum*.5)*.15),fScore:clamp(fertility*.45+sun*.3+water*.25),eScore:clamp(sun*.38+wind*.32+hydrologicalFlow*.18+geothermalPotential*.12)};
  }
  return g;
}

async function geocodeName(name){
  const r=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`,{headers:{'Accept-Language':'fr'}});
  if(!r.ok)throw new Error('Nominatim inaccessible');
  const d=await r.json();
  if(!d.length)throw new Error('Lieu introuvable — essaie un nom plus précis');
  return{lat:parseFloat(d[0].lat),lon:parseFloat(d[0].lon),name:d[0].display_name.split(',')[0]};
}

async function fetchClimate(lat,lon){
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,cloud_cover&daily=shortwave_radiation_sum,wind_speed_10m_max,precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const r=await fetch(url);if(!r.ok)throw new Error('Open-Meteo inaccessible');
  const d=await r.json(),avg=a=>a&&a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const radiation=avg(d.daily.shortwave_radiation_sum)||3.5,windMax=avg(d.daily.wind_speed_10m_max)||15,precip=avg(d.daily.precipitation_sum)||2;
  const temp=((avg(d.daily.temperature_2m_max)||20)+(avg(d.daily.temperature_2m_min)||10))/2;
  return{sun:clamp(radiation/8),wind:clamp(windMax/40),rain:clamp(precip/8),temp,radiation,windMax,precip,biome:classifyBiome(temp,clamp(precip/8))};
}
function classifyBiome(temp,rain){
  if(temp>24&&rain>.7)return'Tropical humide 🌴';
  if(temp>20&&rain<.3)return'Aride / désertique 🏜️';
  if(temp>16&&rain>.4)return'Méditerranéen ☀️';
  if(temp>10&&rain>.5)return'Tempéré océanique ☁️';
  if(temp>8)return'Tempéré continental 🍂';
  if(temp>0)return'Subarctique 🏔️';
  return'Polaire ❄️';
}
function hashStr(s){let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h;}
