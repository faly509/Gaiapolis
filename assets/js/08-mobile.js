'use strict';

/* Gaiapolis v0.2.0-alpha — mobile controls, responsive map and PWA bootstrap */
(() => {
  const MOBILE_QUERY='(max-width: 900px)';
  const mq=window.matchMedia(MOBILE_QUERY);
  const baseIso={w:ISO.W,h:ISO.H};
  const baseHeights=Object.fromEntries(Object.entries(BVIS).map(([id,v])=>[id,v.h]));
  let mobileScale=1;
  let deferredInstall=null;

  function isMobile(){return mq.matches;}
  function clampView(v){return Math.max(.38,Math.min(1.25,v));}

  function applyMapScale(scale,announce=false){
    mobileScale=isMobile()?clampView(scale):1;
    ISO.W=baseIso.w*mobileScale;
    ISO.H=baseIso.h*mobileScale;
    Object.entries(BVIS).forEach(([id,v])=>{v.h=baseHeights[id]*mobileScale;});
    resize();
    if(announce) toast(`🔎 Zoom ${Math.round(mobileScale*100)}%`,'info');
  }

  function fitMap(){
    if(!isMobile()){applyMapScale(1);return;}
    const available=Math.max(280,window.innerWidth-18);
    const scale=clampView(available/(ISO.C*baseIso.w));
    applyMapScale(scale);
  }

  function closeDrawers(){
    document.querySelector('.sb:not(.sb-r)')?.classList.remove('drawer-open');
    document.querySelector('.sb-r')?.classList.remove('drawer-open');
    el('mobile-backdrop')?.classList.remove('show');
  }

  function openDrawer(side){
    closeDrawers();
    const drawer=side==='stats'?document.querySelector('.sb-r'):document.querySelector('.sb:not(.sb-r)');
    drawer?.classList.add('drawer-open');
    el('mobile-backdrop')?.classList.add('show');
  }

  function syncMobileTools(){
    document.querySelectorAll('.mobile-tool').forEach(b=>b.classList.toggle('on',b.dataset.t===curTool));
  }

  function buildMobileShell(){
    if(el('mobile-tool-dock'))return;

    const menu=document.createElement('button');
    menu.id='mobile-menu-btn';menu.className='mobile-only mobile-head-btn';menu.type='button';menu.setAttribute('aria-label','Ouvrir les outils');menu.innerHTML='☰';
    menu.addEventListener('click',()=>openDrawer('tools'));
    el('hdr').prepend(menu);

    const stats=document.createElement('button');
    stats.id='mobile-stats-btn';stats.className='mobile-only mobile-head-btn';stats.type='button';stats.setAttribute('aria-label','Ouvrir les statistiques');stats.innerHTML='📊';
    stats.addEventListener('click',()=>openDrawer('stats'));
    el('hdr').append(stats);

    const install=document.createElement('button');
    install.id='install-app';install.className='mobile-only mobile-head-btn';install.type='button';install.setAttribute('aria-label','Installer Gaiapolis');install.innerHTML='⬇';
    install.addEventListener('click',async()=>{
      if(!deferredInstall)return;
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall=null;install.classList.remove('visible');
    });
    el('hdr').append(install);

    const backdrop=document.createElement('div');backdrop.id='mobile-backdrop';
    backdrop.addEventListener('click',closeDrawers);el('app').append(backdrop);

    const dock=document.createElement('nav');dock.id='mobile-tool-dock';dock.setAttribute('aria-label','Outils de construction rapides');
    TORDER.forEach(id=>{
      const d=BLDGS[id];if(!d)return;
      const b=document.createElement('button');b.type='button';b.className='mobile-tool'+(id==='__erase__'?' erase':'');b.dataset.t=id;b.title=d.desc;
      b.innerHTML=`<span class="ico">${d.i}</span><span>${d.l.replace('Maison simple','Maison').replace('Solaire thermique','Thermique').replace('Micro-centrale','Micro-hydro').replace('Recyclage eau','Eaux grises').replace('Salle commune','Commune')}</span>`;
      b.addEventListener('click',()=>{setTool(id);syncMobileTools();});dock.appendChild(b);
    });
    el('app').append(dock);

    const controls=document.createElement('div');controls.id='mobile-map-controls';
    controls.innerHTML='<button class="map-ctl" id="map-zoom-in" aria-label="Zoom avant">+</button><button class="map-ctl" id="map-zoom-out" aria-label="Zoom arrière">−</button><button class="map-ctl" id="map-fit" aria-label="Ajuster la carte">⌂</button>';
    el('canvas-wrap').append(controls);
    el('map-zoom-in').addEventListener('click',()=>applyMapScale(mobileScale*1.18,true));
    el('map-zoom-out').addEventListener('click',()=>applyMapScale(mobileScale/1.18,true));
    el('map-fit').addEventListener('click',()=>{fitMap();toast('🗺️ Carte ajustée à l’écran','info');});

    const oldSetTool=setTool;
    window.setTool=function(id){oldSetTool(id);syncMobileTools();};
    syncMobileTools();
  }

  function enableTouchTilePreview(){
    let lastPointerTile='';
    cvs.addEventListener('pointermove',e=>{
      if(e.pointerType==='mouse')return;
      const rect=cvs.getBoundingClientRect();
      const x=e.clientX-rect.left,y=e.clientY-rect.top;
      const {r,c}=s2g(x,y);hR=r;hC=c;
      if(!inG(r,c)){el('tip').style.display='none';return;}
      const key=`${r},${c}`;
      if(key!==lastPointerTile){lastPointerTile=key;showTip(x,y,r,c);}
    },{passive:true});
    cvs.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse'){hR=-1;hC=-1;el('tip').style.display='none';}});
  }

  function enablePinchZoom(){
    const points=new Map();
    let pinchStart=0,startScale=1,suppressClickUntil=0;
    cvs.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse')return;
      points.set(e.pointerId,{x:e.clientX,y:e.clientY});
      try{cvs.setPointerCapture(e.pointerId);}catch{}
      if(points.size===2){const [a,b]=[...points.values()];pinchStart=Math.hypot(a.x-b.x,a.y-b.y);startScale=mobileScale;suppressClickUntil=Date.now()+700;}
    });
    cvs.addEventListener('pointermove',e=>{
      if(!points.has(e.pointerId))return;
      points.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(points.size===2&&pinchStart>0){const [a,b]=[...points.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y);suppressClickUntil=Date.now()+700;applyMapScale(startScale*(dist/pinchStart));}
    });
    const end=e=>{points.delete(e.pointerId);if(points.size<2)pinchStart=0;};
    cvs.addEventListener('pointerup',end);cvs.addEventListener('pointercancel',end);
    cvs.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  }

  function updateResponsiveMode(){
    document.body.classList.toggle('mobile-mode',isMobile());
    closeDrawers();
    fitMap();
    setTimeout(resize,60);
  }

  function registerPWA(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;el('install-app')?.classList.add('visible');});
    window.addEventListener('appinstalled',()=>{deferredInstall=null;el('install-app')?.classList.remove('visible');toast('✅ Gaiapolis installé','ok');});
    if('serviceWorker' in navigator&&location.protocol==='https:'&&location.hostname.endsWith('github.io')){
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
  }

  buildMobileShell();enableTouchTilePreview();enablePinchZoom();registerPWA();updateResponsiveMode();
  setTimeout(()=>{document.querySelectorAll('.toast').forEach(t=>{if(t.textContent.includes('v0.1.5.1'))t.remove();});toast('🌍 Gaiapolis v0.2.0-alpha — interface mobile et installation PWA','info');},980);
  mq.addEventListener?.('change',updateResponsiveMode);
  window.addEventListener('resize',()=>{clearTimeout(window.__gaiapolisResize);window.__gaiapolisResize=setTimeout(updateResponsiveMode,120);});
  window.addEventListener('orientationchange',()=>setTimeout(updateResponsiveMode,180));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawers();});
})();
