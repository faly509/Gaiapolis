'use strict';

const CACHE='gaiapolis-v020a1';
const APP_SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/css/base.css',
  './assets/css/game.css',
  './assets/css/mobile.css',
  './assets/js/00-core.js',
  './assets/js/01-data.js',
  './assets/js/02-terrain.js',
  './assets/js/03-osm.js',
  './assets/js/04-simulation.js',
  './assets/js/05-renderer.js',
  './assets/js/06-ui.js',
  './assets/js/07-game.js',
  './assets/js/08-mobile.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith(
    caches.match(request).then(cached=>{
      const network=fetch(request).then(response=>{
        if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
        return response;
      }).catch(()=>cached);
      return cached||network;
    })
  );
});
