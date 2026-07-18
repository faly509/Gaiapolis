'use strict';

const MATS = {
  wood:{icon:'🪵',label:'Bois',cost:1,str:6,ins:8,fire:4,moist:4,eco:9,co2:-1.5,life:50,cf:7,col:'#8B5E3C',tip:'Renouvelable, bonne isolation. Sensible au feu sans traitement.'},
  concrete:{icon:'🏢',label:'Béton',cost:.7,str:10,ins:2,fire:9,moist:8,eco:2,co2:.9,life:80,cf:4,col:'#7A7A7A',tip:'Très solide et durable. Fort impact carbone, mauvaise isolation.'},
  stone:{icon:'🪨',label:'Pierre',cost:1.3,str:9,ins:3,fire:10,moist:9,eco:7,co2:.1,life:200,cf:6,col:'#9A9090',tip:'Très durable, faible CO₂. Coûteuse, isolation à compléter.'},
  earth:{icon:'🏺',label:'Terre crue',cost:.3,str:4,ins:7,fire:7,moist:2,eco:10,co2:.01,life:40,cf:6,col:'#C09050',tip:'Écologique et peu coûteuse. Sensible à l’humidité.'},
  hemp:{icon:'🌿',label:'Chanvre',cost:1.1,str:3,ins:9,fire:5,moist:6,eco:10,co2:-.8,life:50,cf:8,col:'#5A8A30',tip:'Excellente isolation, CO₂ négatif. Besoin d’une ossature.'},
  straw:{icon:'🌾',label:'Paille',cost:.2,str:2,ins:10,fire:2,moist:2,eco:10,co2:-.5,life:30,cf:7,col:'#D4A830',tip:'Isolation exceptionnelle, très écolo. Fragile, protection requise.'},
  bamboo:{icon:'🎋',label:'Bambou',cost:.8,str:6,ins:5,fire:3,moist:5,eco:9,co2:-1,life:30,cf:7,col:'#5A8A20',tip:'Très renouvelable, léger et résistant.'},
  recycled:{icon:'♻️',label:'Recyclé',cost:.5,str:5,ins:6,fire:5,moist:5,eco:9,co2:-.3,life:25,cf:5,col:'#7A7A5A',tip:'Bonne circularité, faible coût. Qualité variable.'}
};

const CAT={H:'house',E:'energy',W:'water',F:'food',I:'infra'};
const BLDGS={
  simple_house:{l:'Maison simple',i:'🏠',c:CAT.H,cost:120000,maint:2000,ep:0,ec:15,wp:0,wc:200,fp:0,res:4,cf:5,eco:-2,str:7,oSun:.4,oWnd:0,oWat:.2,oGeo:0,oFlo:0,mat:true,dot:'dot-h',desc:'Logement standard, 4 résidents.'},
  bioclimatic:{l:'Bioclimatique',i:'🏡',c:CAT.H,cost:160000,maint:1200,ep:0,ec:5,wp:0,wc:180,fp:0,res:4,cf:8,eco:7,str:7,oSun:.6,oWnd:.2,oWat:.2,oGeo:0,oFlo:0,mat:true,dot:'dot-h',desc:'Isolation passive optimale.'},
  solar_pv:{l:'Panneaux PV',i:'☀️',c:CAT.E,cost:8000,maint:150,ep:12,ec:.1,wp:0,wc:0,fp:0,res:0,cf:0,eco:6,str:3,oSun:.7,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:'dot-e',desc:'Production solaire photovoltaïque.'},
  solar_th:{l:'Solaire thermique',i:'🌡️',c:CAT.E,cost:5000,maint:100,ep:8,ec:.2,wp:0,wc:0,fp:0,res:0,cf:1,eco:7,str:3,oSun:.65,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:'dot-e',desc:'Chauffe l’eau grâce au soleil.'},
  wind:{l:'Éolienne',i:'💨',c:CAT.E,cost:15000,maint:400,ep:20,ec:.2,wp:0,wc:0,fp:0,res:0,cf:-1,eco:5,str:6,oSun:0,oWnd:.6,oWat:0,oGeo:0,oFlo:0,mat:false,dot:'dot-e',desc:'Production dépendante du vent.'},
  hydro_t:{l:'Hydrolienne',i:'🌊',c:CAT.E,cost:18000,maint:500,ep:15,ec:.3,wp:0,wc:0,fp:0,res:0,cf:0,eco:6,str:7,oSun:0,oWnd:0,oWat:.7,oGeo:0,oFlo:.6,mat:false,dot:'dot-e',desc:'Turbine dans un courant d’eau.'},
  micro_hydro:{l:'Micro-centrale',i:'⚡',c:CAT.E,cost:25000,maint:600,ep:30,ec:.5,wp:0,wc:0,fp:0,res:0,cf:0,eco:5,str:9,oSun:0,oWnd:0,oWat:.7,oGeo:0,oFlo:.5,mat:false,dot:'dot-e',desc:'Nécessite eau, débit et dénivelé.'},
  geothermal:{l:'Géothermie',i:'🌋',c:CAT.E,cost:35000,maint:500,ep:18,ec:1,wp:0,wc:10,fp:0,res:0,cf:0,eco:8,str:9,oSun:0,oWnd:0,oWat:0,oGeo:.6,oFlo:0,mat:false,dot:'dot-e',desc:'Énergie continue avec potentiel suffisant.'},
  battery:{l:'Batterie',i:'🔋',c:CAT.E,cost:10000,maint:200,ep:0,ec:.5,wp:0,wc:0,fp:0,res:0,cf:0,eco:2,str:5,oSun:0,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:'dot-e',desc:'Stocke l’énergie excédentaire.'},
  rain_tank:{l:'Citerne pluie',i:'💧',c:CAT.W,cost:3000,maint:100,ep:0,ec:.2,wp:150,wc:0,fp:0,res:0,cf:0,eco:6,str:6,oSun:0,oWnd:0,oWat:.5,oGeo:0,oFlo:0,mat:false,dot:'dot-w',desc:'Collecte l’eau de pluie.'},
  greywater:{l:'Recyclage eau',i:'♻️',c:CAT.W,cost:4500,maint:200,ep:0,ec:.5,wp:100,wc:0,fp:0,res:0,cf:0,eco:7,str:5,oSun:0,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:'dot-w',desc:'Traite les eaux grises.'},
  garden:{l:'Potager',i:'🌱',c:CAT.F,cost:500,maint:100,ep:0,ec:0,wp:0,wc:50,fp:800,res:0,cf:2,eco:8,str:1,oSun:.6,oWnd:.1,oWat:.4,oGeo:0,oFlo:0,mat:false,dot:'dot-f',desc:'Production selon soleil, eau et fertilité.'},
  greenhouse:{l:'Serre',i:'🏗️',c:CAT.F,cost:8000,maint:400,ep:0,ec:2,wp:0,wc:80,fp:2000,res:0,cf:1,eco:6,str:4,oSun:.7,oWnd:0,oWat:.4,oGeo:0,oFlo:0,mat:false,dot:'dot-f',desc:'Production protégée toute l’année.'},
  compost:{l:'Composteur',i:'🍂',c:CAT.F,cost:600,maint:50,ep:0,ec:0,wp:0,wc:5,fp:200,res:0,cf:0,eco:9,str:1,oSun:.3,oWnd:.1,oWat:.3,oGeo:0,oFlo:0,mat:false,dot:'dot-f',desc:'Valorise les déchets organiques.'},
  path:{l:'Chemin',i:'🛤️',c:CAT.I,cost:300,maint:20,ep:0,ec:0,wp:0,wc:0,fp:0,res:0,cf:1,eco:4,str:2,oSun:0,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:null,desc:'Améliore l’accessibilité.'},
  hall:{l:'Salle commune',i:'🏛️',c:CAT.I,cost:40000,maint:1500,ep:0,ec:8,wp:0,wc:100,fp:0,res:0,cf:5,eco:3,str:8,oSun:.5,oWnd:0,oWat:.2,oGeo:0,oFlo:0,mat:true,dot:'dot-h',desc:'Améliore le confort collectif.'},
  __erase__:{l:'Effacer',i:'🧹',c:'erase',cost:0,maint:0,ep:0,ec:0,wp:0,wc:0,fp:0,res:0,cf:0,eco:0,str:0,oSun:0,oWnd:0,oWat:0,oGeo:0,oFlo:0,mat:false,dot:null,desc:'Supprime un bâtiment du joueur.'}
};
const TORDER=['simple_house','bioclimatic','solar_pv','solar_th','wind','hydro_t','micro_hydro','geothermal','battery','rain_tank','greywater','garden','greenhouse','compost','path','hall','__erase__'];

const LAYERS=[
{id:'sun',lbl:'Ensoleillement',col:'#F4BC3A',fld:'sun',a:.50},
{id:'wind',lbl:'Vent',col:'#52C4FC',fld:'wind',a:.42},
{id:'water',lbl:'Eau / pluie',col:'#32DEB8',fld:'water',a:.46},
{id:'fert',lbl:'Fertilité',col:'#48E080',fld:'fertility',a:.44},
{id:'stab',lbl:'Stabilité sol',col:'#C89850',fld:'stability',a:.42},
{id:'geo',lbl:'Géothermie',col:'#F27060',fld:'geothermalPotential',a:.50},
{id:'flood',lbl:'Risque inond.',col:'#BC88F4',fld:'floodRisk',a:.54},
{id:'hydro',lbl:'Courants eau',col:'#52C4FC',fld:'hydrologicalFlow',a:.50}
];
const LYRON={sun:true,wind:true,water:true,fert:false,stab:false,geo:false,flood:false,hydro:false};

const OBJECTIVES=[
{id:'home',ico:'🏠',txt:'Loger 4 habitants',chk:s=>s.res>=4,prg:s=>`${s.res}/4`},
{id:'e50',ico:'⚡',txt:'50% autonomie énergétique',chk:s=>s.eA>=50,prg:s=>`${~~s.eA}%`},
{id:'w50',ico:'💧',txt:'50% autonomie en eau',chk:s=>s.wA>=50,prg:s=>`${~~s.wA}%`},
{id:'food',ico:'🌱',txt:'Produire de la nourriture',chk:s=>s.fP>0,prg:s=>s.fP>0?'✓':'0'},
{id:'budget',ico:'💰',txt:'Budget ≤ 200 000 €',chk:s=>s.cost>0&&s.cost<=200000,prg:s=>`${~~(s.cost/1000)}k€`},
{id:'g60',ico:'🏆',txt:'Score global ≥ 60%',chk:s=>s.auto>=60,prg:s=>`${~~s.auto}%`}
];
const REWDS={
home:{e:'🏠',t:'Premier foyer !',s:'4 habitants logés'},
e50:{e:'⚡',t:'Énergie autonome !',s:'50% des besoins couverts'},
w50:{e:'💧',t:'Autonomie hydrique !',s:'50% de l’eau produite localement'},
food:{e:'🌱',t:'Premier repas !',s:'La ville produit de la nourriture'},
budget:{e:'💰',t:'Budget maîtrisé !',s:'Projet sous 200 000 €'},
g60:{e:'🏆',t:'EcoConstructeur !',s:'60% d’autonomie globale'}
};
const doneSet=new Set();
