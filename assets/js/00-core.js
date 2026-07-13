'use strict';

function el(id){ return document.getElementById(id); }
function $t(id,v){ const e=el(id); if(e) e.textContent=v; }
