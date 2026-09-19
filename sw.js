'use strict';
// A versioned, immutable shell avoids mixing JavaScript from different releases.
const PREFIX='gaiapolis:'+new URL(self.registration.scope).pathname+':';
const CACHE=PREFIX+'v021a1';
const APP_SHELL=[
  './','./index.html','./manifest.webmanifest','./assets/icon.svg',
  './assets/css/base.css','./assets/css/game.css','./assets/css/mobile.css','./assets/css/icons.css','./assets/css/experience.css',
  './assets/js/00-core.js','./assets/js/01-data.js','./assets/js/02-terrain.js','./assets/js/03-osm.js',
  './assets/js/04-simulation.js','./assets/js/05-renderer.js','./assets/js/06-ui.js',
  './assets/js/06-storage.js','./assets/js/07-game.js','./assets/js/08-mobile.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    if(cached)return cached;
    try{return await fetch(request);}
    catch{return request.mode==='navigate'?(await cache.match('./index.html'))||Response.error():Response.error();}
  })());
});
