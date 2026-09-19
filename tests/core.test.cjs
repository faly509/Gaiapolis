const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function core(){
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id))elements.set(id,{value:'',style:{},textContent:'',innerHTML:'',open:false,classList:{add(){},remove(){},toggle(){}},querySelector(){return null},replaceChildren(){},append(){},setAttribute(){}});
    return elements.get(id);
  };
  const storage=new Map();
  const ctx=vm.createContext({console,Date,Math,JSON,Number,Object,Array,Set,Map,AbortController,setTimeout,clearTimeout,
    document:{getElementById:element},window:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    navigator:{},Blob,URL});
  for(const name of ['00-core','01-data','02-terrain','03-osm','04-simulation','06-storage'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',name+'.js'),'utf8'),ctx);
  vm.runInContext(`const inG=(r,c)=>r>=0&&r<ISO.R&&c>=0&&c<ISO.C;
    let tutStep=0,tutDone=false,curTool='simple_house',curMat='wood',pendPl=null;
    function toast(){} function setTool(v){curTool=v;} function buildLayers(){} function buildTut(){} function buildObjs(){} function clearHL(){} function updateAll(){} function initAcc(){} function closeMat(){};
    terrain=generateTerrain(18,18,42);`,ctx);
  return{ctx,storage,element,run:code=>vm.runInContext(code,ctx)};
}
const baseline=`({alt:.3,slope:.2,sun:.7,wind:.5,water:.6,fertility:.7,humidity:.5,stability:.8,floodRisk:0,geothermalPotential:.4,hydrologicalFlow:0,hdd:1,terrainType:'land',buildable:true,existingFeature:null,bScore:.8,fScore:.7,eScore:.6})`;
function flat(c){c.run(`terrain=Object.fromEntries(Object.keys(terrain).map(k=>[k,${baseline}]));`);}

test('solar radiation converts MJ to kWh; zero rain, wind and temperature survive',()=>{
  const c=core();const s=c.run(`climateFromForecast({daily:{shortwave_radiation_sum:[18,null],wind_speed_10m_max:[0,0],precipitation_sum:[0,0],temperature_2m_max:[0,0],temperature_2m_min:[0,0]}})`);
  assert.equal(s.radiation,5);assert.equal(s.precip,0);assert.equal(s.windMax,0);assert.equal(s.temp,0);
  assert.throws(()=>c.run('climateFromForecast({daily:{}})'),/incomplètes/);
});
test('empty terrain gives finite zero balances',()=>{const c=core(),s=c.run('simulate()');for(const [k,v]of Object.entries(s))if(k!=='matCnt')assert.equal(v,0);});
test('zero sun/wind/geothermal never produces fictitious energy',()=>{
  const c=core();flat(c);c.run(`terrain['0,0'].sun=0;placed={'0,0':{id:'solar_pv',mat:null}};`);assert.equal(c.run('simulate().eP'),0);
  c.run(`terrain['0,0'].wind=0;placed['0,0'].id='wind';`);assert.equal(c.run('simulate().eP'),0);
  c.run(`terrain['0,0'].geothermalPotential=0;placed['0,0'].id='geothermal';`);assert.equal(c.run('simulate().eP'),0);
});
test('solar thermal cannot satisfy unlimited electricity demand',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'bioclimatic',mat:'wood'},'0,1':{id:'solar_th'},'0,2':{id:'solar_th'}};`);
  const s=c.run('simulate()');assert.equal(s.electric,0);assert.equal(s.heatUsed,2.5);assert.ok(s.eA<50);
});
test('rain tanks need roofs and actual rain; duplicate tanks share roof area',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'rain_tank'}};`);assert.equal(c.run('simulate().wP'),0);
  c.run(`placed['0,1']={id:'simple_house',mat:'wood'};climate.precip=2;`);assert.equal(c.run('simulate().rainWater'),128);
  c.run(`placed['0,2']={id:'rain_tank'};`);assert.equal(c.run('simulate().rainWater'),128);
  c.run('climate.precip=0');assert.equal(c.run('simulate().rainWater'),0);
});
test('greywater is bounded by residents and never recycles itself',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'greywater'},'0,1':{id:'greywater'},'0,2':{id:'greywater'}};`);assert.equal(c.run('simulate().wP'),0);
  c.run(`placed['1,0']={id:'simple_house',mat:'wood'};`);assert.equal(c.run('simulate().greyWater'),230.4);
});
test('compost creates no food and boosts adjacent crops only with inhabitants',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'compost'}};`);assert.equal(c.run('simulate().fP'),0);
  c.run(`placed['0,1']={id:'garden'};`);const base=c.run('simulate().fP');
  c.run(`placed['1,1']={id:'simple_house',mat:'wood'};`);assert.equal(c.run('simulate().fP'),Math.round(base*1.15*10)/10);
});
test('insulation affects housing needs; battery changes reserve, not production',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'simple_house',mat:'concrete'}};`);const concrete=c.run('simulate().eC');
  c.run(`placed['0,0'].mat='straw';`);assert.ok(c.run('simulate().eC')<concrete);
  c.run(`placed['0,1']={id:'battery'};`);assert.equal(c.run('simulate().eP'),0);assert.equal(c.run('simulate().storage'),10);
});
test('global score and autonomy rewards need inhabitants',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'solar_pv'}};`);assert.equal(c.run('simulate().auto'),0);assert.equal(c.run(`OBJECTIVES.find(o=>o.id==='e50').chk(simulate())`),false);
});
test('placement rejects unknown tiles, buildings, occupied cells, roads and buildings',()=>{
  const c=core();flat(c);
  assert.equal(c.run(`canPlaceBuilding('wrong',terrain['0,0'],'0,0').ok`),false);
  assert.equal(c.run(`canPlaceBuilding('simple_house',undefined,'99,99').ok`),false);
  for(const type of ['road','existing_building','water'])assert.equal(c.run(`canPlaceBuilding('simple_house',{...terrain['0,0'],terrainType:'${type}'},'0,0').ok`),false);
  c.run(`placed['0,0']={id:'garden'};`);assert.equal(c.run(`canPlaceBuilding('solar_pv',terrain['0,0'],'0,0').ok`),false);
});
test('hydro requires water, flow and head; hidden OSM keeps placement constraints',()=>{
  const c=core();flat(c);c.run(`osmVisible=false;terrain['0,0'].hydrologicalFlow=.7;`);
  assert.equal(c.run(`canPlaceBuilding('hydro_t',terrain['0,0'],'0,0').ok`),false);
  c.run(`terrain['0,0'].terrainType='river';`);assert.equal(c.run(`canPlaceBuilding('micro_hydro',terrain['0,0'],'0,0').ok`),true);
  c.run(`terrain['0,0'].slope=0;`);assert.equal(c.run(`canPlaceBuilding('micro_hydro',terrain['0,0'],'0,0').ok`),false);
});
test('OSM fills polygon interiors and continuous long roads',()=>{
  const c=core();flat(c);
  c.run(`applyOSMToTerrain([{id:1,tags:{building:'house'},geometry:[{lat:-.002,lon:-.002},{lat:-.002,lon:.002},{lat:.002,lon:.002},{lat:.002,lon:-.002},{lat:-.002,lon:-.002}]}],0,0,500);`);
  assert.equal(c.run(`terrain['8,8'].terrainType`),'existing_building');
  flat(c);c.run(`applyOSMToTerrain([{tags:{highway:'residential'},geometry:[{lat:0,lon:-.0044},{lat:0,lon:.0044}]}],0,0,500);`);
  assert.ok(c.run(`Object.values(terrain).filter(t=>t.terrainType==='road').length`)>=17);
});
test('project round-trip preserves terrain, materials, climate and tutorial',()=>{
  const c=core();flat(c);c.run(`placed['1,1']={id:'simple_house',mat:'hemp'};tutDone=true;`);
  const p=c.run('validateProject(JSON.parse(JSON.stringify(projectSnapshot())))');
  assert.equal(p.placed['1,1'].mat,'hemp');assert.equal(Object.keys(p.terrain).length,324);assert.equal(p.tutorial.done,true);
});
test('incomplete, nonfinite, illegal and future saves reject without mutating current city',()=>{
  const c=core();flat(c);const original=c.run('JSON.stringify(terrain)');
  for(const edit of ["delete p.terrain['0,0']","p.terrain['0,0'].sun=NaN","p.placed['0,0']={id:'unknown'}","p.placed['99,99']={id:'garden'}","p.schemaVersion=99","p.climate.lat=91","p.placed['0,0']={id:'simple_house',mat:'__proto__'}"]){
    assert.throws(()=>c.run(`(()=>{const p=copy(projectSnapshot());${edit};return validateProject(p)})()`));
    assert.equal(c.run('JSON.stringify(terrain)'),original);
  }
});
test('legacy saves remain loadable and carry a climate migration notice',()=>{
  const c=core();flat(c);const p=c.run(`validateProject({placed:{},terrain,climate:{...DEFAULT_CLIMATE,lat:0,lon:0,source:undefined},osm:{loaded:false}})`);
  assert.equal(p.climate.source,'legacy');
});
test('corrupt autosave recovers from previous snapshot',()=>{
  const c=core();flat(c);const saved=c.run('JSON.stringify(projectSnapshot())');c.storage.set('gaiapolis:project:v3','broken');c.storage.set('gaiapolis:previous:v3',saved);
  assert.equal(c.run('loadSave()'),true);assert.equal(c.element('save-status').textContent,'Partie récupérée depuis la copie précédente');
});
test('changing map cannot lose the city if checkpoint storage fails',()=>{
  const c=core();flat(c);c.run(`placed['0,0']={id:'simple_house',mat:'wood'};localStorage.setItem=()=>{throw Error('quota')};`);
  assert.equal(c.run('checkpointCurrent()'),false);assert.equal(c.run('Object.keys(placed).length'),1);
});
test('scenarios compare without mutating the project and identify rain dependency',()=>{
  const c=core();flat(c);c.run(`placed={'0,0':{id:'simple_house',mat:'wood'},'0,1':{id:'rain_tank'},'0,2':{id:'solar_pv'}};`);
  const before=c.run('JSON.stringify({placed,terrain,climate})'),rows=c.run('compareConditions()');
  assert.equal(rows.length,4);assert.equal(rows[1].scores.rainWater,0);assert.ok(rows[2].scores.eP<rows[0].scores.eP);
  assert.equal(c.run('JSON.stringify({placed,terrain,climate})'),before);
});
test('failed geocode or weather leaves the current city and metadata intact',async()=>{
  const c=core();flat(c);c.run(`placed['0,0']={id:'simple_house',mat:'wood'};fetchJSON=async()=>{throw Error('offline')};`);
  c.element('loc-name').value='Montpellier';const before=c.run('JSON.stringify({placed,terrain,climate,osm})');
  await c.run('window.loadRealLocation()');assert.equal(c.run('JSON.stringify({placed,terrain,climate,osm})'),before);assert.equal(c.run('worldBusy'),false);
});
test('failed OSM refresh is transactional',async()=>{
  const c=core();flat(c);c.run(`climate.lat=0;climate.lon=0;terrain['0,0'].terrainType='road';fetchJSON=async()=>{throw Error('offline')};`);
  const before=c.run('JSON.stringify(terrain)');await c.run('window.reloadOSM()');assert.equal(c.run('JSON.stringify(terrain)'),before);
});

test('new town resolves fresh coordinates, commits only once, and checkpoints previous city',async()=>{
  const c=core();flat(c);c.run(`placed['0,0']={id:'simple_house',mat:'wood'};climate.lat=48;climate.lon=2;
    fetchJSON=async url=>url.includes('nominatim')?[{lat:'43.61',lon:'3.88',display_name:'Montpellier, France'}]:url.includes('open-meteo')?{daily:{shortwave_radiation_sum:[18],wind_speed_10m_max:[10],precipitation_sum:[0],temperature_2m_max:[24],temperature_2m_min:[16]}}:{elements:[]};`);
  c.element('loc-name').value='Montpellier';c.element('loc-lat').value='48';c.element('loc-lon').value='2';
  await c.run('window.loadRealLocation()');assert.equal(c.run('climate.lat'),43.61);assert.equal(c.run('climate.lon'),3.88);
  assert.equal(c.run('Object.keys(placed).length'),0);assert.equal(c.run('climate.precip'),0);
  assert.equal(JSON.parse(c.storage.get('gaiapolis:checkpoint:v3')).placed['0,0'].id,'simple_house');
});
test('concurrent load is ignored while a world transition is pending',async()=>{
  const c=core();c.run(`worldBusy=true;fetchJSON=async()=>{throw Error('must not run')};`);
  const before=c.run('JSON.stringify(terrain)');await c.run('window.loadRealLocation()');assert.equal(c.run('JSON.stringify(terrain)'),before);
});
test('saved unfinished tutorial retains its explicit progress',()=>{
  const c=core();flat(c);c.run(`placed['1,1']={id:'simple_house',mat:'wood'};tutStep=1;tutDone=false;`);
  const p=c.run('validateProject(copy(projectSnapshot()))');assert.equal(p.tutorial.done,false);assert.equal(p.tutorial.step,1);
});
