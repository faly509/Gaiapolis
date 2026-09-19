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
  function clampView(v){return Math.max(.18,Math.min(2.5,v));}

  function applyMapScale(scale,announce=false,anchor){
    const old=mobileScale;mobileScale=clampView(scale);view.scale=mobileScale;
    if(anchor){
      const ratio=mobileScale/old;
      view.x=anchor.x-CW/2-(anchor.x-CW/2-view.x)*ratio;
      view.y=anchor.y-60-(anchor.y-60-view.y)*ratio;
    }
    ISO.W=baseIso.w*mobileScale;ISO.H=baseIso.h*mobileScale;
    Object.entries(BVIS).forEach(([id,v])=>{v.h=baseHeights[id]*mobileScale;});
    if(announce)toast(`Zoom ${Math.round(mobileScale*100)} %`,'info');
  }
  function fitMap(){
    resize();
    const scale=Math.min((CW-24)/(ISO.C*baseIso.w),(CH-90)/(ISO.R*baseIso.h),1.3);
    applyMapScale(scale);view.x=0;view.y=Math.max(0,(CH-ISO.R*baseIso.h*mobileScale-80)/2);
  }
  window.fitMap=fitMap;

  function closeDrawers(){
    document.querySelector('.sb:not(.sb-r)')?.classList.remove('drawer-open');
    document.querySelector('.sb-r')?.classList.remove('drawer-open');
    el('mobile-backdrop')?.classList.remove('show');
    el('mobile-stats-btn')?.setAttribute('aria-expanded','false');el('mobile-menu-btn')?.setAttribute('aria-expanded','false');
  }

  window.closeMobileDrawers=closeDrawers;

  function openDrawer(side){
    closeDrawers();
    const drawer=side==='stats'?document.querySelector('.sb-r'):document.querySelector('.sb:not(.sb-r)');
    drawer?.classList.add('drawer-open');
    (side==='stats'?el('mobile-stats-btn'):el('mobile-menu-btn'))?.setAttribute('aria-expanded','true');
    drawer?.querySelector('button,input')?.focus();
    el('mobile-backdrop')?.classList.add('show');
  }

  function syncMobileTools(){
    document.querySelectorAll('.mobile-tool').forEach(b=>(b.classList.toggle('on',b.dataset.t===curTool),b.setAttribute('aria-pressed',String(b.dataset.t===curTool))));
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
    el('map-zoom-in').addEventListener('click',()=>applyMapScale(mobileScale*1.18,true,{x:CW/2,y:CH/2}));
    el('map-zoom-out').addEventListener('click',()=>applyMapScale(mobileScale/1.18,true,{x:CW/2,y:CH/2}));
    el('map-fit').addEventListener('click',()=>{fitMap();toast('🗺️ Carte ajustée à l’écran','info');});

    const oldSetTool=setTool;
    window.setTool=function(id){oldSetTool(id);syncMobileTools();};
    syncMobileTools();
  }

  function enableGestures(){
    const points=new Map();
    let start=null,last=null,pinch=null,longTimer=null,dragged=false,suppressUntil=0;
    const point=e=>{const rect=cvs.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top};};
    const cancelLong=()=>{clearTimeout(longTimer);longTimer=null;};
    cvs.addEventListener('pointerdown',e=>{
      if(e.button!==0&&e.pointerType==='mouse')return;
      const p=point(e);points.set(e.pointerId,p);cvs.setPointerCapture(e.pointerId);
      if(points.size===1){
        start=last=p;dragged=false;
        if(e.pointerType!=='mouse')longTimer=setTimeout(()=>{
          const {r,c}=s2g(p.x,p.y);if(inG(r,c))showTip(p.x,p.y,r,c);
          dragged=true;suppressUntil=Date.now()+800;
        },500);
      }else{
        cancelLong();dragged=true;
        const [a,b]=[...points.values()];
        pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale:mobileScale,center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
      }
    });
    cvs.addEventListener('pointermove',e=>{
      if(!points.has(e.pointerId))return;
      const p=point(e);points.set(e.pointerId,p);
      if(points.size===2&&pinch){
        const [a,b]=[...points.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
        const distance=Math.hypot(a.x-b.x,a.y-b.y);
        applyMapScale(pinch.scale*distance/Math.max(1,pinch.distance),false,pinch.center);
        view.x+=center.x-pinch.center.x;view.y+=center.y-pinch.center.y;
        pinch={distance,scale:mobileScale,center};suppressUntil=Date.now()+500;
      }else if(points.size===1&&start){
        if(Math.hypot(p.x-start.x,p.y-start.y)>8){dragged=true;cancelLong();}
        if(dragged){view.x+=p.x-last.x;view.y+=p.y-last.y;el('tip').style.display='none';suppressUntil=Date.now()+500;}
        last=p;
      }
    });
    const end=e=>{
      cancelLong();points.delete(e.pointerId);
      if(dragged||pinch||e.type==='pointercancel')suppressUntil=Date.now()+500;
      pinch=null;
      if(points.size===1){start=last=[...points.values()][0];dragged=true;}
      else{start=last=null;}
    };
    cvs.addEventListener('pointerup',end);cvs.addEventListener('pointercancel',end);
    cvs.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
    cvs.addEventListener('wheel',e=>{e.preventDefault();applyMapScale(mobileScale*Math.exp(-e.deltaY*.001),false,point(e));el('tip').style.display='none';},{passive:false});
    cvs.addEventListener('contextmenu',e=>{e.preventDefault();const p=point(e),{r,c}=s2g(p.x,p.y);if(inG(r,c))showTip(p.x,p.y,r,c);});
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
    if('serviceWorker' in navigator&&location.protocol==='https:'&&location.hostname==='faly509.github.io'&&location.pathname.startsWith('/Gaiapolis/')){
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
  }

  buildMobileShell();enableGestures();registerPWA();updateResponsiveMode();

  mq.addEventListener?.('change',updateResponsiveMode);
  window.addEventListener('resize',()=>{clearTimeout(window.__gaiapolisResize);window.__gaiapolisResize=setTimeout(updateResponsiveMode,120);});
  window.addEventListener('orientationchange',()=>setTimeout(updateResponsiveMode,180));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawers();});
})();
