const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
function worker(){
  const handlers={},deleted=[],cached=new Map();let fetches=0;
  const ctx=vm.createContext({URL,Response,self:{registration:{scope:'https://example.test/Gaiapolis/'},location:{origin:'https://example.test'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}},skipWaiting:async()=>{}},caches:{keys:async()=>['another-app','gaiapolis:/Elsewhere/:v1','gaiapolis:/Gaiapolis/:old'],delete:async k=>deleted.push(k),open:async()=>({match:async r=>cached.get(typeof r==='string'?r:r.url),addAll:async()=>{}})},fetch:async()=>{fetches++;throw Error('offline')}});
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),ctx);
  return{ctx,handlers,deleted,cached,get fetches(){return fetches}};
}
test('worker precaches every local resource and the UI has no external font dependency',()=>{
  const w=worker(),shell=vm.runInContext('APP_SHELL',w.ctx),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const ref of [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(ref=>ref.startsWith('assets/')||ref==='manifest.webmanifest')){
    assert.ok(fs.existsSync(path.join(root,ref)),ref);assert.ok(shell.includes('./'+ref),ref);
  }
  assert.ok(!html.includes('cdn.jsdelivr.net'));
});
test('activation leaves other applications caches untouched',async()=>{
  const w=worker();let promise;w.handlers.activate({waitUntil:p=>promise=p});await promise;
  assert.deepEqual(w.deleted,['gaiapolis:/Gaiapolis/:old']);
});
test('cached shell works without network; offline navigation falls back to index',async()=>{
  const w=worker();const response=new Response('app');w.cached.set('https://example.test/Gaiapolis/assets/js/00-core.js',response);w.cached.set('./index.html',new Response('index'));
  let result;w.handlers.fetch({request:{url:'https://example.test/Gaiapolis/assets/js/00-core.js',method:'GET'},respondWith:p=>result=p});assert.equal(await(await result).text(),'app');assert.equal(w.fetches,0);
  w.handlers.fetch({request:{url:'https://example.test/Gaiapolis/unknown',method:'GET',mode:'navigate'},respondWith:p=>result=p});assert.equal(await(await result).text(),'index');
});
test('worker does not intercept external APIs or another project',()=>{
  const w=worker();for(const url of ['https://api.open-meteo.com/v1/forecast','https://example.test/AnotherProject/'])w.handlers.fetch({request:{url,method:'GET'},respondWith:()=>assert.fail('unrelated request intercepted')});
});
