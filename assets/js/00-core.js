'use strict';

const APP_VERSION='0.2.1-alpha';
let worldBusy=false;

function el(id){ return document.getElementById(id); }
function $t(id,v){ const e=el(id); if(e) e.textContent=v; }

async function fetchJSON(url,options={},timeout=12000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    if(!response.ok)throw new Error(`Service indisponible (${response.status})`);
    return await response.json();
  }catch(error){
    if(error.name==='AbortError')throw new Error('Délai dépassé — réessaie dans un instant');
    throw error;
  }finally{clearTimeout(timer);}
}
