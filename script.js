var firebaseConfig = {
  apiKey: "AIzaSyBJtmNQV6dUYQ7qBesXrl0zPrlHP2zjngo",
  authDomain: "famofi-empresas.firebaseapp.com",
  projectId: "famofi-empresas",
  storageBucket: "famofi-empresas.firebasestorage.app",
  messagingSenderId: "960254126953",
  appId: "1:960254126953:web:dbeb3be6f02c97288e6bf8"
};
firebase.initializeApp(firebaseConfig);
var _auth = firebase.auth();
var _db = firebase.firestore();
var _storage = firebase.storage();
var _REF = _db.collection('famofi').doc('main');
var _ROLES_REF = _db.collection('famofi').doc('roles');


// ── i18n ──────────────────────────────────────────────────────────────────────
var TT = {
  en: {
    overview:'Overview', companies:'Companies', shareholders:'Shareholders',
    investments:'Investments', orgcharts:'Org Charts', network:'Network',
    addCompany:'+ Add Company', search:'Search...', allJurisdictions:'All Jurisdictions',
    allStatus:'All Status', name:'Legal Name', jurisdiction:'Jurisdiction',
    purpose:'Company Purpose', yearFounded:'Year / Date Founded', fiscalId:'Company ID / Fiscal #',
    ein:'EIN', irs:'IRS Classification', director:'Director / Administrador',
    registeredAgent:'Registered Agent', address:'Address', status:'Status', tags:'Tags',
    active:'Active', liquidated:'Liquidated', liquidation:'In Liquidation',
    bankName:'Bank', accountNo:'Account #', routing:'Routing / ABA', swift:'SWIFT',
    bankAddress:'Bank Address', currency:'Currency', accountType:'Account Type',
    shareholders2:'Shareholders', ownership:'Ownership %', shareClass:'Share Class',
    type:'Type', addShareholder:'+ Shareholder', addBank:'+ Bank Account',
    addField:'+ Custom Field', fieldName:'Field Name', fieldValue:'Value',
    save:'Save', cancel:'Cancel', export:'Export CSV', exportPDF:'Print / PDF',
    totalCompanies:'Total Companies', activeCompanies:'Active', jurisdictions:'Jurisdictions',
    totalShareholders:'Shareholders', totalInvestments:'Investments',
    byJurisdiction:'By Jurisdiction', byStatus:'By Status', byPurpose:'By Purpose',
    byFund:'By Family Fund', byType:'By Investment Type',
    noData:'No data yet.', holdingIn:'Holdings in', companies2:'companies', pct:'avg',
    customFields:'Custom Fields', banking:'Banking', details:'Details',
    subsidiaries:'Subsidiaries', orgChart:'Org Chart', documents:'Documents',
    confirmDelete:'Delete this company? Cannot be undone.',
    noCompanies:'No companies yet.', noShareholders:'No shareholders recorded.',
    allShareholders:'All Shareholders', searchShareholder:'Search shareholder...',
    notes:'Notes', importTitle:'Import Companies', networkTitle:'Ownership Network',
    editCompany:'Edit', delete:'Delete', bulkDelete:'Delete Selected',
    invName:'Investment Name', invFund:'Family Fund', invFamily:'Family',
    invType:'Investment Type', invCommit:'Total Commitment', invCalls:'Capital Calls',
    invDist:'Distributions', invExpenses:'Expenses / Fees', invMV:'Market Value', invStatus:'Status',
    invNotes:'Notes', invCompany:'Company',
    addInvestment:'+ Add Investment', allFunds:'All Funds', allTypes:'All Types',
    individual:'Individual', company:'Company', ownerType:'Owner Type',
    ownedBy:'Owned by', dateHelp:'E.g.: 2015, Mar 2015, 15/03/2015',
    editShareholder:'Edit Shareholder', readOnly:'View-only access',
    uploadDoc:'Upload Document', noDocuments:'No documents uploaded yet.',
    printChart:'Print Chart', printConfigTitle:'Print Configuration', printScope:'What to print', printScopeFull:'Entire chart', printScopeBranch:'Selected company and its branch only', printScopeSelected:'Only selected nodes', printInclude:'Include in printout', printOptColors:'Colors and backgrounds', printOptLabels:'Type labels', printOptSub:'Details (percent / jurisdiction)', printOptLegend:'Legend', printSelectNodes:'Select nodes to include', printPreview:'Live preview', printPreviewNote:'This preview shows how the printed pages will look. Cards and branches stay intact and are not split across pages.', selectCompany:'Select a company to view its org chart'
  },
  es: {
    overview:'Resumen', companies:'Empresas', shareholders:'Accionistas',
    investments:'Inversiones', orgcharts:'Organigrama', network:'Red',
    addCompany:'+ Agregar Empresa', search:'Buscar...', allJurisdictions:'Todas las Jurisdicciones',
    allStatus:'Todos los Estados', name:'Razon Social', jurisdiction:'Jurisdiccion',
    purpose:'Proposito de la Empresa', yearFounded:'Ano / Fecha', fiscalId:'ID Fiscal',
    ein:'EIN', irs:'Clasificacion IRS', director:'Director',
    registeredAgent:'Agente Registrado', address:'Direccion', status:'Estado', tags:'Etiquetas',
    active:'Activa', liquidated:'Liquidada', liquidation:'En Liquidacion',
    bankName:'Banco', accountNo:'# Cuenta', routing:'Routing / ABA', swift:'SWIFT',
    bankAddress:'Dir. Banco', currency:'Moneda', accountType:'Tipo',
    shareholders2:'Accionistas', ownership:'% Participacion', shareClass:'Clase',
    type:'Tipo', addShareholder:'+ Accionista', addBank:'+ Cuenta',
    addField:'+ Campo', fieldName:'Campo', fieldValue:'Valor',
    save:'Guardar', cancel:'Cancelar', export:'Exportar CSV', exportPDF:'Imprimir / PDF',
    totalCompanies:'Total Empresas', activeCompanies:'Activas', jurisdictions:'Jurisdicciones',
    totalShareholders:'Accionistas', totalInvestments:'Inversiones',
    byJurisdiction:'Por Jurisdiccion', byStatus:'Por Estado', byPurpose:'Por Proposito',
    byFund:'Por Fondo Familiar', byType:'Por Tipo',
    noData:'Sin datos.', holdingIn:'Participacion en', companies2:'empresas', pct:'promedio',
    customFields:'Campos', banking:'Banca', details:'Datos',
    subsidiaries:'Subsidiarias', orgChart:'Organigrama', documents:'Documentos',
    confirmDelete:'Eliminar empresa? No se puede deshacer.',
    noCompanies:'Sin empresas.', noShareholders:'Sin accionistas.',
    allShareholders:'Todos los Accionistas', searchShareholder:'Buscar accionista...',
    notes:'Notas', importTitle:'Importar Empresas', networkTitle:'Red de Propiedad',
    editCompany:'Editar', delete:'Eliminar', bulkDelete:'Eliminar Seleccionados',
    invName:'Nombre Inversion', invFund:'Fondo Familiar', invFamily:'Familia',
    invType:'Tipo de Inversion', invCommit:'Compromiso Total', invCalls:'Capital Calls',
    invDist:'Distribuciones', invExpenses:'Gastos / Comisiones', invMV:'Valor de Mercado', invStatus:'Estado',
    invNotes:'Notas', invCompany:'Empresa',
    addInvestment:'+ Agregar Inversion', allFunds:'Todos los Fondos', allTypes:'Todos los Tipos',
    individual:'Persona', company:'Empresa', ownerType:'Tipo de Propietario',
    ownedBy:'Propiedad de', dateHelp:'Ej: 2015, Mar 2015, 15/03/2015',
    editShareholder:'Editar Accionista', readOnly:'Solo lectura',
    uploadDoc:'Subir Documento', noDocuments:'Sin documentos subidos.',
    printChart:'Imprimir Grafico', printConfigTitle:'Configuracion de Impresion', printScope:'Que imprimir', printScopeFull:'Organigrama completo', printScopeBranch:'Solo la empresa seleccionada y su rama', printScopeSelected:'Solo los nodos seleccionados', printInclude:'Incluir en la impresion', printOptColors:'Colores y fondos', printOptLabels:'Etiquetas de tipo', printOptSub:'Detalles (porcentaje / jurisdiccion)', printOptLegend:'Leyenda', printSelectNodes:'Selecciona los nodos a incluir', printPreview:'Vista previa en vivo', printPreviewNote:'Esta vista previa muestra como se veran las paginas impresas. Las tarjetas y ramas se mantienen intactas y no se dividen entre paginas.', selectCompany:'Selecciona una empresa para ver su organigrama'
  }
};
var lang = localStorage.getItem('fm_lang') || 'en';
function t(k){ return TT[lang][k] || k; }
function toggleLang(){
  lang = lang==='en' ? 'es' : 'en';
  localStorage.setItem('fm_lang', lang);
  document.getElementById('langBtn').textContent = lang==='en' ? 'ES' : 'EN';
  render();
}

// ── Firebase auth ─────────────────────────────────────────────────────────────
var currentUser = null;
var userRole = 'viewer';
// Tabs this user is allowed to see. null = all tabs (default for admin and plain viewers).
// Populated from Firestore famofi/roles if the user's entry is an object with a "tabs" array.
var userTabs = null;
function canSeeTab(p){
  if(isAdmin()) return true;
  if(!userTabs) return true; // null/undefined = all tabs allowed
  return userTabs.indexOf(p) !== -1;
}

// Cache key used to persist the resolved role across page loads so the
// correct role is available instantly before the Firestore fetch completes.
var ROLE_CACHE_KEY = 'fm_role';
var TEST_INJECTED_LINE = 1;

function authErrorMessage(code) {
  var messages = {
    'auth/invalid-email':         'The email address format is invalid.',
    'auth/user-not-found':        'No account found with this email address.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-credential':    'Incorrect email or password. Please try again.',
    'auth/too-many-requests':     'Too many failed attempts. Please wait a moment and try again.',
    'auth/user-disabled':         'This account has been disabled. Contact your administrator.',
    'auth/network-request-failed':'Network error. Please check your connection.',
    'auth/operation-not-allowed': 'Sign-in is not enabled for this app.',
    'auth/weak-password':         'Password is too weak.',
    'auth/unauthorized-domain':   'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.'
  };
  return messages[code] || ('Sign-in failed (' + (code || 'unknown') + '). Check your credentials.');
}

function showLoginError(msg) {
  var errEl = document.getElementById('li-err');
  if (!errEl) return;
  errEl.textContent = msg;
  errEl.style.display = 'block';
}

function hideLoginError() {
  var errEl = document.getElementById('li-err');
  if (errEl) errEl.style.display = 'none';
}

function setLoginLoading(loading) {
  var btn   = document.getElementById('li-btn');
  var email = document.getElementById('li-email');
  var pass  = document.getElementById('li-pass');
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="login-spinner"></div> Signing in…';
    if (email) email.disabled = true;
    if (pass)  pass.disabled  = true;
  } else {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
    if (email) email.disabled = false;
    if (pass)  pass.disabled  = false;
  }
}

function doLogin(){
  var email = document.getElementById('li-email').value.trim();
  var pass  = document.getElementById('li-pass').value;

  hideLoginError();

  if (!email) { showLoginError('Please enter your email address.'); return; }
  if (!pass)  { showLoginError('Please enter your password.'); return; }

  setLoginLoading(true);

  // Use LOCAL persistence: user stays logged in across browser restarts
  // and new tabs/windows. Session survives page refresh and browser close.
  // Use 'none' if you want no persistence (new login required each tab).
  _auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function(){
      return _auth.signInWithEmailAndPassword(email, pass);
    })
    .catch(function(error) {
      setLoginLoading(false);
      showLoginError(authErrorMessage(error.code));
    });
}

function doLogout(){
  localStorage.removeItem(ROLE_CACHE_KEY);
  localStorage.removeItem('fm_tabs');
  _auth.signOut().then(function() {
    var email = document.getElementById('li-email');
    var pass  = document.getElementById('li-pass');
    if (email) email.value = '';
    if (pass)  pass.value  = '';
    hideLoginError();
  });
}

// ── Data ──────────────────────────────────────────────────────────────────────
var data = { companies:[], investments:[] };
var _saveTimer = null;
var _unsub = null;
// Flag: when WE write to Firestore, suppress the snapshot re-render
// because we already re-rendered locally. Without this, every save
// causes a second full re-render ~500ms later when the snapshot fires.
var _localWrite = false;

function save(){
_sanitizedCache = null;
  if(userRole !== 'admin') return;
  setSyncDot('saving');
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function(){
    localStorage.setItem('fm_data', JSON.stringify(data));
    _localWrite = true; // tell the snapshot listener to skip the next re-render
    _REF.set({ payload: JSON.stringify(data) })
      .then(function(){ setSyncDot('ok'); })
      .catch(function(){ setSyncDot('error'); _localWrite = false; });
  }, 500);
}
function setSyncDot(s){
  var d = document.getElementById('sync-dot'); if(!d) return;
  d.style.background = s==='saving' ? 'var(--amber)' : s==='error' ? 'var(--red)' : 'var(--teal)';
}
function uid(){ return '_'+Math.random().toString(36).slice(2,9); }
function cname(id){ var c=data.companies.find(function(x){return x.id===id;}); return c?c.name:id; }
function invCoIds(inv){ if(Array.isArray(inv.companyIds)) return inv.companyIds.filter(Boolean); return inv.companyId?[inv.companyId]:[]; }
function cnamesList(ids){ return (ids||[]).map(cname); }
function sameIdSet(a,b){ var sa=(a||[]).slice().sort().join('|'); var sb=(b||[]).slice().sort().join('|'); return sa===sb; }
function invCoBadges(ids){ if(!ids||!ids.length) return '—'; return ids.map(function(cid){ return '<span class="badge badge-jur" style="cursor:pointer;margin:1px 2px" onclick="event.stopPropagation();go(\'companies\');setTimeout(function(){openCompany('+q(cid)+')},50)">'+esc(cname(cid))+'</span>'; }).join(''); }
function resolveOwner(sh){ return sh.type==='company' ? cname(sh.person) : sh.person; }
var _sanitizedCache = null;
function _sanitizedCompanies(){
if(_sanitizedCache) return _sanitizedCache;
var result = data.companies.map(function(c){
var seen=new Set();
var cleaned=(c.shareholders||[]).filter(function(s){
if(s.type==='company'){
if(s.person===c.id) return false;
if(seen.has(s.person)) return false;
seen.add(s.person);
}
return true;
});
return cleaned===c.shareholders?c:Object.assign({},c,{shareholders:cleaned});
});
_sanitizedCache = result;
return result;
}var __getSubsCache=null, __getSubsCacheSrc=null;
function getSubs(pid){
  var comps=_sanitizedCompanies();
  if(__getSubsCacheSrc!==comps){ __getSubsCache={}; __getSubsCacheSrc=comps; }
  if(__getSubsCache[pid]) return __getSubsCache[pid];
  var result=comps.filter(function(c){
    return c.shareholders.some(function(s){
      return s.type==='company'&&s.person===pid;
    });
  });
  __getSubsCache[pid]=result;
  return result;
}
var __allGetSubsCache=null, __allGetSubsCacheSrc=null;
function _allGetSubs(pid){
  var comps=_sanitizedCompanies();
  if(__allGetSubsCacheSrc!==comps){ __allGetSubsCache={}; __allGetSubsCacheSrc=comps; }
  if(__allGetSubsCache[pid]) return __allGetSubsCache[pid];
  var result=comps.filter(function(c){ return c.shareholders.some(function(s){ return s.type==='company'&&s.person===pid; }); });
  __allGetSubsCache[pid]=result;
  return result;
}
function getParents(cid){ return data.companies.filter(function(p){ return getSubs(p.id).some(function(s){ return s.id===cid; }); }); }
// Org-chart-only helpers: exclude liquidated companies from display (data is preserved)
var __orgActiveCacheSrc=null, __orgActiveCache=null;
function _orgActiveCompanies(){
  var src=_sanitizedCompanies();
  if(__orgActiveCacheSrc!==src){ __orgActiveCache=src.filter(function(c){ return c.status!=='liquidated'; }); __orgActiveCacheSrc=src; }
  return __orgActiveCache;
}
var __orgGetSubsCache=null, __orgGetSubsCacheSrc=null;
function _orgGetSubs(pid){
  var comps=_orgActiveCompanies();
  if(__orgGetSubsCacheSrc!==comps){ __orgGetSubsCache={}; __orgGetSubsCacheSrc=comps; }
  if(__orgGetSubsCache[pid]) return __orgGetSubsCache[pid];
  var result=comps.filter(function(c){ return c.shareholders.some(function(s){ return s.type==='company'&&s.person===pid; }); });
  __orgGetSubsCache[pid]=result;
  return result;
}
function fmtD(n){ return (n!=null&&n!=='') ? '$'+(+n).toLocaleString() : '—'; }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function q(id){ return "'"+id+"'"; }
function isAdmin(){ return userRole==='admin'; }
function sBadge(s){
  if(s==='active') return '<span class="badge badge-active">'+t('active')+'</span>';
  if(s==='liquidated') return '<span class="badge badge-liquidated">'+t('liquidated')+'</span>';
  return '<span class="badge badge-liquidation">'+t('liquidation')+'</span>';
}
function dr(lbl,val){
  if(!val && val!==0) return '';
  return '<div class="dr"><div class="dr-lbl">'+lbl+'</div><div class="dr-val">'+val+'</div></div>';
}
function gv(id){ return document.getElementById(id) ? document.getElementById(id).value : ''; }

function applyLoaded(d){
_sanitizedCache = null;
  data = d;
  if(!data.investments) data.investments=[];
  data.companies.forEach(function(c){
    c.shareholders.forEach(function(s){ if(!s.type) s.type='individual'; });
    if(!c.banking) c.banking=[];
    if(!c.custom) c.custom=[];
    if(!c.documents) c.documents=[];
    if(!c.yearFounded && c.year) c.yearFounded=String(c.year);
recomputeCurrent(c);
  });
  data.investments.forEach(function(inv){
    if(inv.commitment==null) inv.commitment=0;
    if(inv.calls==null) inv.calls=0;
    if(inv.distributions==null) inv.distributions=0;
    if(inv.expenses==null) inv.expenses=0;
    if(inv.marketValue==null) inv.marketValue=0;
    if(!inv.fund) inv.fund='';
    if(!inv.family) inv.family='';
    if(!inv.fields) inv.fields=[];
if(!Array.isArray(inv.companyIds)){ inv.companyIds = inv.companyId ? [inv.companyId] : []; }
if(!inv.companyId) inv.companyId = inv.companyIds[0] || '';
  });
}
function parseFlexDate(str){
  if(!str) return '1900-01-01';
  str=String(str).trim();
  var m;
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m){ return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2); }
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(m) return str;
  var months={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
  m = str.match(/^([A-Za-z]{3,})\.?\s+(\d{4})$/);
  if(m){ var mm=months[m[1].toLowerCase().slice(0,3)]; if(mm) return m[2]+'-'+mm+'-01'; }
  m = str.match(/(\d{4})/);
  if(m) return m[1]+'-01-01';
  return '1900-01-01';
}
function _histLatestPerSlot(history){
  var bySlot={};
  (history||[]).forEach(function(e,idx){
    var cur=bySlot[e.slotId];
    if(!cur || e.effectiveDate>cur.entry.effectiveDate || (e.effectiveDate===cur.entry.effectiveDate && idx>cur.idx)){
      bySlot[e.slotId]={entry:e,idx:idx};
    }
  });
  var out={};
  Object.keys(bySlot).forEach(function(k){ out[k]=bySlot[k].entry; });
  return out;
}
function fmtDate(iso){
  if(!iso) return '';
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if(!m) return iso;
  return m[3]+'/'+m[2]+'/'+m[1];
}
function buildSHPeriods(c){
  ensureHistory(c);
  var bySlot={};
  (c.shareholderHistory||[]).forEach(function(e){
    if(!bySlot[e.slotId]) bySlot[e.slotId]=[];
    bySlot[e.slotId].push(e);
  });
  var periods=[];
  Object.keys(bySlot).forEach(function(slotId){
    var entries=bySlot[slotId].slice().sort(function(a,b){
      if(a.effectiveDate<b.effectiveDate) return -1;
      if(a.effectiveDate>b.effectiveDate) return 1;
      return 0;
    });
    for(var i=0;i<entries.length;i++){
      var e=entries[i];
      if(e.removed) continue;
      var next=entries[i+1];
      var ceaseDate=next?next.effectiveDate:null;
      var isLast=(i===entries.length-1);
      periods.push({slotId:slotId,entryId:e.id,person:e.person,pct:e.pct,class:e.class||'',shares:e.shares,notes:e.notes||'',startDate:e.effectiveDate,ceaseDate:ceaseDate,current:isLast&&!e.removed});
    }
  });
  return periods;
}
function ensureHistory(c){
  if(!Array.isArray(c.shareholderHistory)){
    var fb=parseFlexDate(c.yearFounded||c.year||'');
    c.shareholderHistory=(c.shareholders||[]).map(function(s){
      return {id:uid(),slotId:s.id||uid(),effectiveDate:fb,person:s.person,pct:s.pct,class:s.class||'',type:s.type||'individual',shares:(s.shares!=null?s.shares:''),notes:'',removed:false};
    });
  }
  if(!Array.isArray(c.directorHistory)){
    var fb2=parseFlexDate(c.yearFounded||c.year||'');
    c.directorHistory=[];
    if(c.director){
      c.directorHistory.push({id:uid(),slotId:uid(),effectiveDate:fb2,name:c.director,position:'Director',notes:'',removed:false});
    }
  }
}
function recomputeCurrent(c){
  ensureHistory(c);
  var shBySlot=_histLatestPerSlot(c.shareholderHistory);
  var shOrder=[]; var shSeen={};
  c.shareholderHistory.forEach(function(e){ if(!shSeen[e.slotId]){ shSeen[e.slotId]=true; shOrder.push(e.slotId); } });
  c.shareholders=shOrder.map(function(sid){ return shBySlot[sid]; }).filter(function(e){ return e && !e.removed; }).map(function(e){
    return {id:e.slotId,person:e.person,pct:e.pct,class:e.class||'',type:e.type||'individual'};
  });
  var drBySlot=_histLatestPerSlot(c.directorHistory);
  var drOrder=[]; var drSeen={};
  c.directorHistory.forEach(function(e){ if(!drSeen[e.slotId]){ drSeen[e.slotId]=true; drOrder.push(e.slotId); } });
  c.directors=drOrder.map(function(sid){ return drBySlot[sid]; }).filter(function(e){ return e && !e.removed; }).map(function(e){
    return {id:e.slotId,name:e.name,position:e.position||'Director',notes:e.notes||''};
  });
  c.director=c.directors.map(function(d){return d.name;}).join(', ');
}



function seedData(){
  var i1=uid(),i2=uid(),i3=uid(),i4=uid(),i5=uid();
  data.companies=[
    {id:i1,name:'FamOfi Holdings Ltd.',jurisdiction:'BVI',purpose:'Holding',yearFounded:'2010',fiscalId:'BVI-12345',ein:'',irs:'Foreign Corp',director:'Carlos Ochoa',agent:'Trident Trust',address:'Tortola, BVI',status:'active',tags:'Holding',notes:'',
     shareholders:[{id:uid(),person:'Carlos Ochoa',pct:60,class:'Class A',type:'individual'},{id:uid(),person:'Maria Ochoa',pct:40,class:'Class A',type:'individual'}],
     banking:[{id:uid(),bank:'HSBC Private Bank',account:'****4821',routing:'',swift:'HBUKGB4B',bankAddr:'London, UK',currency:'USD',type:'Checking'}],custom:[],documents:[]},
    {id:i2,name:'Grupo Operaciones SA',jurisdiction:'Uruguay',purpose:'Operating',yearFounded:'Mar 2015',fiscalId:'UY-98765',ein:'',irs:'',director:'Ana Martinez',agent:'',address:'Montevideo, Uruguay',status:'active',tags:'Operating',notes:'',
     shareholders:[{id:uid(),person:i1,pct:100,class:'Common',type:'company'}],
     banking:[{id:uid(),bank:'Banco Itau',account:'****3300',routing:'',swift:'ITAUUYUU',bankAddr:'Montevideo',currency:'USD',type:'Checking'}],custom:[],documents:[]},
    {id:i3,name:'IP Assets Singapore Pte.',jurisdiction:'Singapore',purpose:'IP / Royalties',yearFounded:'15/06/2018',fiscalId:'SG-200812345N',ein:'',irs:'',director:'Carlos Ochoa',agent:'Tricor',address:'1 Raffles Quay, Singapore',status:'active',tags:'IP',notes:'',
     shareholders:[{id:uid(),person:i1,pct:80,class:'Ordinary',type:'company'},{id:uid(),person:'Luis Ochoa',pct:20,class:'Ordinary',type:'individual'}],
     banking:[],custom:[],documents:[]},
    {id:i4,name:'Real Estate Panama SA',jurisdiction:'Panama',purpose:'Real Estate',yearFounded:'2012',fiscalId:'PA-455123',ein:'',irs:'',director:'Maria Ochoa',agent:'',address:'Ciudad de Panama',status:'liquidated',tags:'Real Estate',notes:'',
     shareholders:[{id:uid(),person:'Carlos Ochoa',pct:50,class:'Common',type:'individual'},{id:uid(),person:'Maria Ochoa',pct:50,class:'Common',type:'individual'}],
     banking:[],custom:[],documents:[]},
    {id:i5,name:'US Operations LLC',jurisdiction:'USA',purpose:'Operating',yearFounded:'Jan 2020',fiscalId:'FL-L20000112345',ein:'87-1234567',irs:'Single Member LLC',director:'Luis Ochoa',agent:'Registered Agents Inc.',address:'Miami, FL, USA',status:'active',tags:'Operating',notes:'',
     shareholders:[{id:uid(),person:i1,pct:100,class:'Units',type:'company'}],
     banking:[{id:uid(),bank:'Bank of America',account:'****9910',routing:'026009593',swift:'BOFAUS3N',bankAddr:'Miami, FL',currency:'USD',type:'Checking'}],
     custom:[{id:uid(),name:'State',value:'Florida'}],documents:[]}
  ];
data.companies.forEach(recomputeCurrent);
  data.investments=[
    {id:uid(),companyId:i1,name:'Vanguard S&P 500 ETF',fund:'Ochoa Family Fund',family:'Ochoa',type:'Fund',commitment:500000,calls:320000,distributions:0,marketValue:450000,status:'active',notes:'Long-term holding',fields:[{id:uid(),name:'Ticker',value:'VOO'}]},
    {id:uid(),companyId:i4,name:'Office Building Panama City',fund:'Real Estate Fund I',family:'Ochoa',type:'Real Estate',commitment:900000,calls:850000,distributions:50000,marketValue:1200000,status:'active',notes:'Fully leased',fields:[{id:uid(),name:'Area m2',value:'820'}]},
    {id:uid(),companyId:i5,name:'Series A TechCo Inc.',fund:'Ochoa Family Fund',family:'Ochoa',type:'Equity',commitment:100000,calls:100000,distributions:0,marketValue:180000,status:'active',notes:'Board observer seat',fields:[]}
  ];
}

// ── Helper: apply userRole to UI badges and buttons ──────────────────────────
function applyRoleBadge(){
  var badge = document.getElementById('user-badge');
  if(badge){
    badge.textContent = isAdmin() ? 'Admin' : 'Viewer';
    badge.className   = 'user-badge' + (isAdmin() ? ' admin-badge' : '');
  }
  var ib = document.getElementById('import-btn');
  if(ib) ib.style.display = isAdmin() ? '' : 'none';
}

// ── Auth listener ─────────────────────────────────────────────────────────────
//
// HOW THIS WORKS (two-phase boot):
//
// PHASE 1 — Instant (< 5ms):
//   Read role from localStorage cache + read data from localStorage cache.
//   Hide login screen, show the app immediately with no network wait.
//
// PHASE 2 — Background (async, no UI blocking):
//   Fetch famofi/roles from Firestore to get the true, authoritative role.
//   If the role changed vs the cached value, update userRole + re-render.
//   Fetch famofi/main for fresh data, then start the real-time listener.
//
// WHY THE PREVIOUS VERSION STILL HAD DELAY:
//   It called _ROLES_REF.get() BEFORE showing the app, so every login still
//   waited for a Firestore network round-trip (500ms–2s on cold start).
//
// WHY THE ROLE WAS ALWAYS "VIEWER":
//   The most likely cause is Firestore Security Rules blocking the read of
//   famofi/roles for authenticated users. When .get() is rejected, the catch
//   block hard-codes userRole = 'viewer'. This version logs the exact error
//   so you can confirm and fix the rules (see instructions below).
//
_auth.onAuthStateChanged(function(user){
  if(user){
    currentUser = user;
    setLoginLoading(false);
    hideLoginError();

    // ── PHASE 1: Instant boot from cache ────────────────────────────────────

    // Load role from localStorage cache (set during previous session).
    // On first-ever login this will be 'viewer'; Phase 2 corrects it.
    var cachedRole = localStorage.getItem(ROLE_CACHE_KEY);
    userRole = cachedRole || 'viewer';
    // Load cached tab permissions if any
    var cachedTabs = localStorage.getItem('fm_tabs');
    if(cachedTabs){ try{ userTabs = JSON.parse(cachedTabs); }catch(e){ userTabs = null; } }
    else { userTabs = null; }

    // Load company data from localStorage cache (synchronous, instant).
    var ls = localStorage.getItem('fm_data');
    if(ls){ try{ applyLoaded(JSON.parse(ls)); }catch(e){ console.warn('[FamOfi] localStorage data parse error', e); } }

    // Show the app RIGHT NOW — no network wait.
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('loading').style.display      = 'none';
    document.getElementById('app').style.display          = 'flex';
    applyRoleBadge();
    render();

    // ── PHASE 2: Background — fetch true role then fresh data ────────────────

    _ROLES_REF.get().then(function(snap){

      // ── ROLE RESOLUTION ───────────────────────────────────────────────────
      // The roles document supports these formats per-user:
      //   Format A (by UID, simple):    { "abc123uid": "admin" }
      //   Format B (by email, simple):  { "you@email.com": "viewer" }
      //   Format C (per-tab viewer):    { "abc123uid": { "role": "viewer", "tabs": ["overview","investments"] } }
      // We try UID first (preferred), then email, then lowercased email.
      var roles        = (snap.exists && snap.data()) || {};
      var byUid        = roles[user.uid];
      var byEmail      = roles[user.email];
      var byEmailLower = roles[(user.email || '').toLowerCase().trim()];
      var entry        = byUid || byEmail || byEmailLower || 'viewer';

      // Parse: entry can be a plain string or an object { role, tabs }
      var resolvedRole, resolvedTabs = null;
      if(typeof entry === 'object' && entry !== null){
        resolvedRole = entry.role || 'viewer';
        resolvedTabs = Array.isArray(entry.tabs) ? entry.tabs : null;
      } else {
        resolvedRole = entry;
      }

      // Always log so you can see exactly what Firestore returned.
      // Open DevTools → Console to read these lines.
      console.log('=== FamOfi Role Debug ===');
      console.log('uid        :', user.uid);
      console.log('email      :', user.email);
      console.log('roles doc  :', JSON.stringify(roles));
      console.log('entry      :', JSON.stringify(entry));
      console.log('→ ROLE     :', resolvedRole);
      console.log('→ TABS     :', resolvedTabs ? JSON.stringify(resolvedTabs) : 'all');
      console.log('=========================');

      // Persist resolved role so Phase 1 is correct on next page load.
      localStorage.setItem(ROLE_CACHE_KEY, resolvedRole);
      if(resolvedTabs) localStorage.setItem('fm_tabs', JSON.stringify(resolvedTabs));
      else localStorage.removeItem('fm_tabs');

      var changed = (resolvedRole !== userRole) || (JSON.stringify(resolvedTabs) !== JSON.stringify(userTabs));
      userRole = resolvedRole;
      userTabs = resolvedTabs;
      // If tab restrictions exclude the current page, redirect to first allowed tab
      if(!canSeeTab(page)){
        var allowed = pages.filter(canSeeTab);
        if(allowed.length) page = allowed[0];
      }
      applyRoleBadge();
      if(changed) render();

    }).catch(function(e){
      // ── ROLE FETCH FAILED ─────────────────────────────────────────────────
      // The most common cause: Firestore Security Rules are blocking the read.
      // See the Firebase checklist below for exactly how to fix this.
      console.error('=== FamOfi Role Fetch FAILED ===');
      console.error('Error code   :', e.code);
      console.error('Error message:', e.message);
      console.error('uid          :', user.uid);
      console.error('email        :', user.email);
      console.error('>>> If you see "permission-denied", your Firestore Security');
      console.error('>>> Rules are blocking the read of famofi/roles.');
      console.error('>>> Fix: allow read of famofi/roles for authenticated users.');
      console.error('================================');
      // Keep whatever role Phase 1 loaded from cache. Do NOT overwrite with
      // 'viewer' here — that's what caused the bug in previous versions.
    });

    // Fetch fresh data from Firestore in background (does not block UI).
    _REF.get().then(function(s){
      if(s.exists){
        try{ applyLoaded(JSON.parse(s.data().payload)); }
        catch(e){ console.warn('[FamOfi] Main data parse error', e); }
        render();
      }
      startSub();
    }).catch(function(e){
      console.warn('[FamOfi] Main data fetch failed, using localStorage cache. Code:', e.code);
      startSub();
    });

  } else {
    // ── SIGNED OUT ───────────────────────────────────────────────────────────
    currentUser = null;
    userRole    = 'viewer';
    if(_unsub){ _unsub(); _unsub = null; }
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('loading').style.display      = 'none';
    document.getElementById('app').style.display          = 'none';
  }
});

function startSub(){
  if(_unsub) _unsub();
  _unsub = _REF.onSnapshot(function(snap){
    if(snap.exists){
      try{ applyLoaded(JSON.parse(snap.data().payload)); }catch(e){}
      // Skip re-render if: (a) this was our own write, or (b) a modal is open
      // A modal being open means the user is mid-edit — re-rendering would
      // destroy their work and cause severe typing lag.
      if(_localWrite){ _localWrite = false; return; }
      if(document.getElementById('modal-overlay')){ return; }
      render();
    }
  }, function(e){ console.warn('[FamOfi] Snapshot listener error:', e.code); });
  if(!data.companies.length){ seedData(); save(); }
}

// ── Router ────────────────────────────────────────────────────────────────────
var page = 'overview';
var pages = ['overview','companies','shareholders','investments','orgcharts','network'];

function go(p){ page=p; render(); }

// ── Charts ────────────────────────────────────────────────────────────────────
var COLORS = ['#4f6ef7','#0e9f6e','#f59e0b','#7c3aed','#e3403a','#1d83e2','#10b981','#f97316','#8b5cf6','#ef4444','#06b6d4','#84cc16','#f43f5e','#a78bfa','#fb923c','#34d399','#60a5fa','#fbbf24','#c084fc','#f87171'];
function chartColors(n){ var out=[]; for(var i=0;i<n;i++) out.push(COLORS[i%COLORS.length]); return out; }
var charts = {};
function destroyCharts(){ Object.values(charts).forEach(function(c){ try{c.destroy();}catch(e){} }); charts={}; }
var _doughnutLabelPlugin = {
  id: 'famDoughnutLabels',
  afterDraw: function(chart) {
    if(chart.config.type !== 'doughnut') return;
    var ctx = chart.ctx;
    var cW = chart.width, cH = chart.height;
    var FS = 11;
    var FONT = 'bold ' + FS + 'px sans-serif';
    var OUTER_GAP = 12;
    var LABEL_TICK = 5;
    var MIN_VERT_GAP = FS + 6;
    var SIDE_PAD = 3;

    var outsideColor = '#555';
    try {
      var c = getComputedStyle(document.documentElement).getPropertyValue('--text2').trim();
      if(c) outsideColor = c;
    } catch(e) {}

    ctx.save();
    ctx.font = FONT;

    var insideItems = [];
    var outsideItems = [];

    chart.data.datasets.forEach(function(ds, i) {
      var meta = chart.getDatasetMeta(i);
      if(meta.hidden) return;
      meta.data.forEach(function(arc, j) {
        var val = ds.data[j];
        if(!val) return;
        var segAngle = arc.endAngle - arc.startAngle;
        var midAngle = arc.startAngle + segAngle / 2;
        var str = String(val);
        var cx = arc.x, cy = arc.y;
        var innerR = arc.innerRadius;
        var outerR = arc.outerRadius;
        var midR = innerR + (outerR - innerR) * 0.58;
        var arcLen = segAngle * midR;
        var textW = ctx.measureText(str).width;

        if(arcLen >= textW + 10 && segAngle >= 0.28) {
          insideItems.push({ str: str, angle: midAngle, r: midR, cx: cx, cy: cy });
        } else {
          outsideItems.push({
            str: str, angle: midAngle, cx: cx, cy: cy,
            outerR: outerR, isRight: Math.cos(midAngle) >= 0, textW: textW
          });
        }
      });
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#fff';
    insideItems.forEach(function(item) {
      var x = item.cx + Math.cos(item.angle) * item.r;
      var y = item.cy + Math.sin(item.angle) * item.r;
      ctx.fillText(item.str, x, y);
    });

    if(!outsideItems.length) { ctx.restore(); return; }

    var refCx = outsideItems[0].cx;
    var refCy = outsideItems[0].cy;
    var refOuterR = outsideItems[0].outerR;

    var rightLabelX = Math.min(cW - SIDE_PAD - 2, refCx + refOuterR + OUTER_GAP + LABEL_TICK + 3);
    var leftLabelX = Math.max(SIDE_PAD + 2, refCx - refOuterR - OUTER_GAP - LABEL_TICK - 3);

    var leftItems = outsideItems.filter(function(it) { return !it.isRight; });
    var rightItems = outsideItems.filter(function(it) { return it.isRight; });

    leftItems.sort(function(a,b) { return Math.sin(a.angle) - Math.sin(b.angle); });
    rightItems.sort(function(a,b) { return Math.sin(a.angle) - Math.sin(b.angle); });

    function spaceItems(items) {
      if(!items.length) return;
      items.forEach(function(it) {
        it.labelY = it.cy + Math.sin(it.angle) * (it.outerR + OUTER_GAP);
        it.labelY = Math.max(FS/2 + SIDE_PAD, Math.min(cH - FS/2 - SIDE_PAD, it.labelY));
      });
      for(var pass = 0; pass < 120; pass++) {
        var moved = false;
        for(var k = 1; k < items.length; k++) {
          if(items[k].labelY - items[k-1].labelY < MIN_VERT_GAP) {
            var mid = (items[k].labelY + items[k-1].labelY) / 2;
            items[k-1].labelY = mid - MIN_VERT_GAP/2;
            items[k].labelY = mid + MIN_VERT_GAP/2;
            moved = true;
          }
        }
        if(!moved) break;
      }
      items.forEach(function(it) {
        it.labelY = Math.max(FS/2 + SIDE_PAD, Math.min(cH - FS/2 - SIDE_PAD, it.labelY));
      });
    }

    spaceItems(leftItems);
    spaceItems(rightItems);

    ctx.shadowBlur = 0;

    function drawOutside(item, labelX, isRight) {
      var p1x = item.cx + Math.cos(item.angle) * item.outerR;
      var p1y = item.cy + Math.sin(item.angle) * item.outerR;
      var p2x = item.cx + Math.cos(item.angle) * (item.outerR + OUTER_GAP);
      var p2y = item.cy + Math.sin(item.angle) * (item.outerR + OUTER_GAP);
      var p3x = isRight ? labelX - LABEL_TICK : labelX + LABEL_TICK;
      var p3y = item.labelY;

      ctx.strokeStyle = 'rgba(155,155,155,0.75)';
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(155,155,155,0.85)';
      ctx.beginPath();
      ctx.arc(p1x, p1y, 1.5, 0, 2*Math.PI);
      ctx.fill();

      ctx.textAlign = isRight ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = outsideColor;
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 1;
      ctx.fillText(item.str, labelX, item.labelY);
      ctx.shadowBlur = 0;
    }

    leftItems.forEach(function(it) { drawOutside(it, leftLabelX, false); });
    rightItems.forEach(function(it) { drawOutside(it, rightLabelX, true); });

    ctx.restore();
  }
};
function mkChart(id,type,labels,values,opts){
  opts=opts||{};
  var ctx=document.getElementById(id); if(!ctx) return;
  if(charts[id]) charts[id].destroy();
  var lFsz=opts.legendSize||10;
  var lPad=opts.legendPad||8;
  charts[id]=new Chart(ctx,{type:type,
    data:{labels:labels,datasets:[{data:values,backgroundColor:chartColors(labels.length),borderWidth:0,borderRadius:type==='bar'?5:0}]},
    options:{responsive:true,maintainAspectRatio:false,
      layout: type==='doughnut' ? {padding: opts.hideLegend ? {top:28,right:36,bottom:28,left:36} : {top:28,right:28,bottom:28,left:8}} : undefined,
      plugins:{legend:{display:opts.hideLegend?false:(type!=='bar'),position:type==='doughnut'?'left':'bottom',maxWidth:140,labels:{boxWidth:11,font:{size:lFsz},padding:lPad}}},
      scales:type==='bar'?{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'#eef0f8'},ticks:{font:{size:10},stepSize:1}}}:undefined
    },
    plugins: type==='doughnut' ? [_doughnutLabelPlugin] : []
  });
}
// ── Render ────────────────────────────────────────────────────────────────────
function render(){
  // If current page is not allowed for this user, redirect to first allowed tab
  if(!canSeeTab(page)){
    var allowed = pages.filter(canSeeTab);
    page = allowed.length ? allowed[0] : 'overview';
  }
  var nav = document.getElementById('nav');
  if(nav){
    nav.innerHTML='';
    pages.forEach(function(p){
      if(!canSeeTab(p)) return; // hide tabs this user can't see
      var b=document.createElement('button');
      b.textContent=t(p); b.className=p===page?'active':'';
      b.onclick=function(){ go(p); };
      nav.appendChild(b);
    });
  }
  destroyCharts();
  var m=document.getElementById('main'); if(!m) return;
  if(page==='overview')       { m.innerHTML=renderOverview(); setTimeout(buildOvCharts,50); }
  else if(page==='companies') { m.innerHTML=renderCompanies(); }
  else if(page==='shareholders'){ m.innerHTML=renderShareholders(); }
  else if(page==='investments'){ m.innerHTML=renderInvestments(); setTimeout(buildInvCharts,50); }
  else if(page==='orgcharts') { m.innerHTML=renderOrgCharts(); }
  else if(page==='network')   { m.innerHTML=renderNetwork(); }
}
function renderPage(){
  var m=document.getElementById('main'); if(!m) return;
  destroyCharts();
  if(page==='companies')      { m.innerHTML=renderCompanies(); }
  else if(page==='shareholders'){ m.innerHTML=renderShareholders(); }
  else if(page==='investments'){ m.innerHTML=renderInvestments(); setTimeout(buildInvCharts,50); }
  else if(page==='orgcharts') { m.innerHTML=renderOrgCharts(); }
  else if(page==='network')   { m.innerHTML=renderNetwork(); }
}
function safeRerender(renderFn){var m=document.getElementById('main');var active=document.activeElement;var restoreId=null,selStart=null,selEnd=null;if(active&&m&&m.contains(active)&&active.id){restoreId=active.id;if(typeof active.selectionStart==='number'){selStart=active.selectionStart;selEnd=active.selectionEnd;}}renderFn();if(restoreId){var el=document.getElementById(restoreId);if(el){el.focus();if(selStart!=null&&el.setSelectionRange){try{el.setSelectionRange(selStart,selEnd);}catch(e){}}}}} function rerenderMain(){safeRerender(renderPage);} function rerenderFull(){safeRerender(render);} function roBanner(){
  if(isAdmin()) return '';
  return '<div class="readonly-banner">View-only access — you can view but not edit data.</div>';
}

// ── Overview ──────────────────────────────────────────────────────────────────
var ovSort='asc'; function toggleOvSort(){ ovSort=ovSort==='asc'?'desc':'asc'; rerenderFull(); } function toggleOvSh(wrapId,btn){ var wrap=document.getElementById(wrapId); if(!wrap) return; var hidden=wrap.querySelector('.ov-sh-hidden'); if(!hidden) return; var isHidden=hidden.style.display==='none'; if(isHidden){ hidden.style.display='inline'; btn.textContent='Show less'; } else { hidden.style.display='none'; var n=hidden.querySelectorAll('.sh-chip').length; btn.textContent='+'+n+' more'; } } function renderOverview(){
  var cs=data.companies, inv=data.investments;
  var active=cs.filter(function(c){return c.status==='active';}).length;
  var jurs=[...new Set(cs.map(function(c){return c.jurisdiction;}))].length;
  var shSet=new Set(); cs.forEach(function(c){c.shareholders.forEach(function(s){if(s.type==='individual')shSet.add(s.person);});});
  var totalMV=inv.reduce(function(a,i){return a+(+i.marketValue||0);},0);
  var h=roBanner();
  h+='<div class="kpi-grid">';
  h+='<div class="kpi"><div class="kpi-label">'+t('totalCompanies')+'</div><div class="kpi-val">'+cs.length+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('activeCompanies')+'</div><div class="kpi-val">'+active+'</div><div class="kpi-sub">'+(cs.length-active)+' inactive</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('jurisdictions')+'</div><div class="kpi-val">'+jurs+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('totalShareholders')+'</div><div class="kpi-val">'+shSet.size+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('totalInvestments')+'</div><div class="kpi-val">'+inv.length+'</div><div class="kpi-sub">'+fmtD(totalMV)+' MV</div></div></div>';
  h+='<div class="charts-row">';
  h+='<div class="chart-card"><div class="chart-title">'+t('byJurisdiction')+'</div><div class="chart-body"><div class="ov-legend" id="leg-jur"><div class="ov-legend-row"></div></div><div class="ov-chart-wrap"><canvas id="ch-jur"></canvas></div></div></div>';
  h+='<div class="chart-card"><div class="chart-title">'+t('byStatus')+'</div><div class="chart-body"><div class="ov-legend" id="leg-status"><div class="ov-legend-row"></div></div><div class="ov-chart-wrap"><canvas id="ch-status"></canvas></div></div></div>';
  h+='</div>';
  var csSorted=cs.slice().sort(function(a,b){var an=(a.name||'').toLowerCase(),bn=(b.name||'').toLowerCase();var cmp=an<bn?-1:an>bn?1:0;return ovSort==='desc'?-cmp:cmp;}); var sortIcon=ovSort==='asc'?'▲':'▼'; h+='<div class="card" style="padding:0;width:100%"><table><thead><tr><th style="cursor:pointer;user-select:none" onclick="toggleOvSort()">'+t('name')+' <span style="font-size:9px;color:var(--accent)">'+sortIcon+'</span></th><th>'+t('jurisdiction')+'</th><th>'+t('status')+'</th><th>'+t('shareholders2')+'</th><th>'+t('subsidiaries')+'</th><th>'+t('investments')+'</th></tr></thead><tbody>';
  if(!csSorted.length){ h+='<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text3)">'+t('noCompanies')+'</td></tr>'; }
  else { csSorted.forEach(function(c){
    var subs=getSubs(c.id).length;
    var ic=inv.filter(function(i){return invCoIds(i).indexOf(c.id)!==-1;}).length;
    var shList='—'; if(c.shareholders.length){ var _chip=function(s){return '<span class="sh-chip">'+esc(resolveOwner(s))+' <b>'+s.pct+'%</b></span>';}; var _wid='ovsh-'+c.id; var _vis=c.shareholders.slice(0,2).map(_chip).join(''); var _rest=c.shareholders.slice(2); shList='<div class="ov-sh-wrap" id="'+_wid+'">'+_vis; if(_rest.length){ shList+='<span class="ov-sh-hidden" style="display:none">'+_rest.map(_chip).join('')+'</span><button type="button" class="ov-sh-toggle" onclick="event.stopPropagation();toggleOvSh(\''+_wid+'\',this)">+'+_rest.length+' more</button>'; } shList+='</div>'; }
    h+='<tr style="cursor:pointer" onclick="openCompany('+q(c.id)+')">';
    h+='<td><strong>'+esc(c.name)+'</strong></td><td><span class="badge badge-jur">'+esc(c.jurisdiction)+'</span></td>';
    h+='<td>'+sBadge(c.status)+'</td><td>'+shList+'</td>';
    h+='<td>'+(subs?'<span class="badge badge-active">'+subs+'</span>':'—')+'</td>';
    h+='<td>'+(ic?'<span class="badge badge-inv">'+ic+'</span>':'—')+'</td></tr>';
  }); }
  h+='</tbody></table></div>';
  return h;
}
function buildOvCharts(){
  var cs=data.companies;
  function sortedPairs(map){
    var pairs=Object.keys(map).map(function(k){return [k,map[k]];});
    pairs.sort(function(a,b){return b[1]-a[1];});
    return {labels:pairs.map(function(p){return p[0];}),values:pairs.map(function(p){return p[1];})};
  }
  // By Jurisdiction: active companies only, sorted largest first
  var activeCs=cs.filter(function(c){ return c.status==='active'; });
  var jm={}; activeCs.forEach(function(c){jm[c.jurisdiction]=(jm[c.jurisdiction]||0)+1;});
  var jd=sortedPairs(jm);
  mkChart('ch-jur','doughnut',jd.labels,jd.values,{legendSize:12,legendPad:10,hideLegend:true});
  // By Status: all companies, sorted largest first
  var sm={}; cs.forEach(function(c){var k=t(c.status);sm[k]=(sm[k]||0)+1;});
  var sd=sortedPairs(sm);
  mkChart('ch-status','doughnut',sd.labels,sd.values,{legendSize:12,legendPad:10,hideLegend:true});
  // Build custom HTML legends
  function buildOvLegend(elId, labels, colors) {
    var el=document.getElementById(elId); if(!el) return;
    var row=el.querySelector('.ov-legend-row'); if(!row) return;
    row.innerHTML=labels.map(function(lbl,i){
      var display=lbl.length>14?lbl.slice(0,12)+'…':lbl;
      return '<span class="ov-leg-item"><span class="ov-leg-swatch" style="background:'+colors[i]+'"></span><span class="ov-leg-label" title="'+esc(lbl)+'">'+esc(display)+'</span></span>';
    }).join('');
  }
  buildOvLegend('leg-jur',jd.labels,chartColors(jd.labels.length));
  buildOvLegend('leg-status',sd.labels,chartColors(sd.labels.length));
}
// ── Companies ─────────────────────────────────────────────────────────────────
var cSearch='',cJur='',cStatus='',cType='';
var CO_TYPES=['Holding Company','Operating Company','Investment Company','LLC','Corporation','Partnership','Trust','Other'];
function renderCompanies(){
  var jurs=[...new Set(data.companies.map(function(c){return c.jurisdiction;}))].sort();
  var cs=data.companies.filter(function(c){
    var q2=cSearch.toLowerCase();
    return(!q2||(c.name+c.director+c.jurisdiction).toLowerCase().includes(q2))
      &&(!cJur||c.jurisdiction===cJur)&&(!cStatus||c.status===cStatus)
      &&(!cType||(c.companyType||'')===cType);
  }).sort(function(a,b){var an=(a.name||'').toLowerCase(),bn=(b.name||'').toLowerCase();return an<bn?-1:an>bn?1:0;});
  var filteredIds=cs.map(function(c){return c.id;});
  var filtInvs=data.investments.filter(function(i){return invCoIds(i).some(function(id){return filteredIds.indexOf(id)!==-1;});});
  var totalMV=filtInvs.reduce(function(a,i){return a+(i.marketValue||0);},0);
  var totalCommit=filtInvs.reduce(function(a,i){return a+(i.commitment||0);},0);
  var h=roBanner();
  h+='<div class="section-header"><div class="section-title">'+t('companies')+' <span style="color:var(--text3);font-weight:400;font-size:14px">('+data.companies.length+')</span></div>';
  h+='<div style="display:flex;gap:8px"><button class="btn btn-teal btn-sm" onclick="exportAllCSV()">'+t('export')+'</button>';
  if(isAdmin()) h+='<button class="btn btn-primary" onclick="openCompanyForm(null)">'+t('addCompany')+'</button><button class="btn btn-danger btn-sm" id="bulk-delete-co-btn" onclick="bulkDeleteCompanies()" style="display:none;margin-left:8px">'+t('deleteSelected')+'</button>';
  h+='</div></div>';
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span>';
  h+='<input type="text" id="co-search-input" placeholder="'+t('search')+'" value="'+esc(cSearch)+'" oninput="cSearch=this.value;rerenderMain()"></div>';
  h+='<select class="filter" id="co-jur-filter" onchange="cJur=this.value;rerenderMain()"><option value="">'+t('allJurisdictions')+'</option>';
  jurs.forEach(function(j){h+='<option value="'+esc(j)+'"'+(cJur===j?' selected':'')+'>'+esc(j)+'</option>';});
h+='</select><select class="filter" id="co-status-filter" onchange="cStatus=this.value;rerenderMain()"><option value=""'+(cStatus===''?' selected':'')+'>'+t('allStatus')+'</option>';
  h+='<option value="active"'+(cStatus==='active'?' selected':'')+'>'+t('active')+'</option><option value="liquidated"'+(cStatus==='liquidated'?' selected':'')+'>'+t('liquidated')+'</option><option value="liquidation"'+(cStatus==='liquidation'?' selected':'')+'>'+t('liquidation')+'</option></select>';
  h+='<select class="filter" id="co-type-filter" onchange="cType=this.value;rerenderMain()"><option value=""'+(cType===''?' selected':'')+'>All Types</option>';
  CO_TYPES.forEach(function(tp){h+='<option value="'+esc(tp)+'"'+(cType===tp?' selected':'')+'>'+esc(tp)+'</option>';});
  h+='</select></div>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:var(--accent-bg);border-radius:var(--radius-sm);margin-bottom:10px;font-size:12px;color:var(--text2)">';
  h+='<span><b style="color:var(--text)">Showing '+cs.length+'</b> of '+data.companies.length+' companies</span>';
  if(filtInvs.length){h+='<span style="display:flex;gap:16px"><span>Portfolio MV: <b style="color:var(--accent)">'+fmtD(totalMV)+'</b></span><span>Total Commitment: <b style="color:var(--text)">'+fmtD(totalCommit)+'</b></span></span>';}
  h+='</div>';
  h+='<div class="card" style="padding:0"><table><thead><tr><th style="width:36px"><input type="checkbox" id="co-select-all" onclick="toggleAllCoSelect(this)" style="cursor:pointer"></th><th>'+t('name')+'</th><th>'+t('jurisdiction')+'</th><th>'+t('yearFounded')+'</th><th>'+t('director')+'</th><th>'+t('shareholders2')+'</th><th>'+t('status')+'</th><th></th></tr></thead><tbody>';
  if(!cs.length){ h+='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">'+t('noCompanies')+'</td></tr>'; }
  else { cs.forEach(function(c){
    var shRows=c.shareholders.map(function(s){
      return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">'
        +'<span style="font-size:13px">'+esc(resolveOwner(s))+'</span>'
        +' <span style="font-weight:700;color:var(--accent);font-size:13px">'+s.pct+'%</span>'
        +' <span style="font-size:11px">'+(s.type==='company'?'&#128290;':'&#128100;')+'</span></div>';
    }).join('');
    h+='<tr><td style="width:36px;text-align:center;padding:4px 0" onclick="event.stopPropagation()"><input type="checkbox" class="co-checkbox" data-id="'+c.id+'" onchange="updateBulkDeleteCoBtn()"></td><td style="cursor:pointer;font-weight:700" onclick="openCompany('+q(c.id)+')">'+esc(c.name)+'</td>';
    h+='<td><span class="badge badge-jur">'+esc(c.jurisdiction)+'</span></td>';
    h+='<td style="color:var(--text2)">'+esc(c.yearFounded||c.year||'—')+'</td>';
    h+='<td style="color:var(--text2)">'+esc(c.director||'—')+'</td>';
    h+='<td>'+(shRows||'—')+'</td><td>'+sBadge(c.status)+'</td>';
    h+='<td style="white-space:nowrap">';
    if(isAdmin()){
      h+='<button class="btn btn-outline btn-sm" onclick="openCompanyForm('+q(c.id)+')" style="margin-right:4px">'+t('editCompany')+'</button>';
      h+='<button class="btn btn-danger btn-sm" onclick="delCompany('+q(c.id)+')">x</button>';
    }
    h+='</td></tr>';
  }); }
  h+='</tbody></table></div>';
  return h;
}

// ── Company detail modal ──────────────────────────────────────────────────────
function openCompany(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return;
var subs=getSubs(id), parents=getParents(id);
var invs=data.investments.filter(function(i){return invCoIds(i).indexOf(id)!==-1;});
var det='';
if(parents.length){
det+='<div style="margin-bottom:12px;padding:10px 14px;background:var(--purple-bg);border-radius:var(--radius-sm);border-left:3px solid var(--purple)">';
det+='<div style="font-size:11px;font-weight:700;color:var(--purple);margin-bottom:4px">'+t('ownedBy')+'</div>';
parents.forEach(function(p,pi){
var sh=c.shareholders.find(function(s){return s.type==='company'&&s.person===p.id;});
if(pi>0) det+=' / ';
det+='<span style="cursor:pointer;color:var(--purple);font-weight:600" onclick="closeModal();openCompany('+q(p.id)+')">'+esc(p.name)+'</span>';
if(sh) det+=' <span style="color:var(--text3)">'+sh.pct+'%</span>';
});
det+='</div>';
}
det+=dr(t('jurisdiction'),esc(c.jurisdiction))+dr(t('purpose'),esc(c.purpose))
+dr(t('yearFounded'),esc(c.yearFounded||c.year||''))+dr(t('fiscalId'),esc(c.fiscalId))
+dr('EIN',esc(c.ein))+dr(t('irs'),esc(c.irs))+dr(t('director'),esc(c.director))
+dr(t('registeredAgent'),esc(c.agent))+dr(t('address'),esc(c.address))
+dr(t('tags'),esc(c.tags))+dr(t('notes'),esc(c.notes));
var h='<div class="modal-header"><div><div class="modal-title">'+esc(c.name)+'</div>';
h+='<div class="modal-subtitle">'+esc(c.jurisdiction)+' � '+esc(c.yearFounded||c.year||'')+' � '+sBadge(c.status)+'</div></div>';
h+='<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">';
h+='<button class="btn btn-teal btn-sm" onclick="exportCompanyCSV('+q(id)+')">'+t('export')+'</button>';
h+='<button class="btn btn-outline btn-sm" onclick="printCompany('+q(id)+')">'+t('exportPDF')+'</button>';
if(isAdmin()){
h+='<button class="btn btn-outline btn-sm" onclick="closeModal();openCompanyForm('+q(id)+')">'+t('editCompany')+'</button>';
h+='<button class="btn btn-danger btn-sm" onclick="closeModal();delCompany('+q(id)+')">'+t('delete')+'</button>';
}
h+='<button class="close-btn" onclick="closeModal()">x</button></div></div>';
h+='<div class="modal-body">';
h+='<div class="tabs">';
h+='<button class="tab active" onclick="switchTab(this,\'td-d\')">'+t('details')+'</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-sh\');buildSHPie('+q(id)+')">'+t('shareholders2')+' ('+c.shareholders.length+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-dir\')">'+(lang==='en'?'Directors':'Directores')+' ('+(c.directors?c.directors.length:0)+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-sub\')">'+t('subsidiaries')+' ('+subs.length+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-org\');activateOrgChartTab()">'+t('orgChart')+'</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-inv\')">'+t('investments')+' ('+invs.length+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-bank\')">'+t('banking')+' ('+c.banking.length+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-cf\')">'+t('customFields')+' ('+c.custom.length+')</button>';
h+='<button class="tab" onclick="switchTab(this,\'td-doc\')">'+t('documents')+' ('+(c.documents?c.documents.length:0)+')</button>';
h+='</div>';
h+='<div id="td-d" class="tab-panel active">'+det+'</div>';
h+='<div id="td-sh" class="tab-panel" data-lazy="sh" data-cid="'+id+'"></div>';
h+='<div id="td-dir" class="tab-panel" data-lazy="dir" data-cid="'+id+'"></div>';
h+='<div id="td-sub" class="tab-panel" data-lazy="sub" data-cid="'+id+'"></div>';
h+='<div id="td-org" class="tab-panel" style="overflow-x:auto;padding:8px 0" data-lazy="org" data-cid="'+id+'"></div>';
h+='<div id="td-inv" class="tab-panel" data-lazy="inv" data-cid="'+id+'"></div>';
h+='<div id="td-bank" class="tab-panel" data-lazy="bank" data-cid="'+id+'"></div>';
h+='<div id="td-cf" class="tab-panel" data-lazy="cf" data-cid="'+id+'"></div>';
h+='<div id="td-doc" class="tab-panel" data-lazy="doc" data-cid="'+id+'"></div>';
h+='</div>';
showModal(h,true);
}
function buildTabLazy(panel){
if(!panel || panel.getAttribute('data-built')==='1') return;
var kind=panel.getAttribute('data-lazy');
var id=panel.getAttribute('data-cid');
if(!kind || !id) return;
var html='';
if(kind==='sh') html=buildShareholdersTabHTML(id);
else if(kind==='dir') html=buildDirectorsTabHTML(id);
else if(kind==='sub') html=buildSubsidiariesTabHTML(id);
else if(kind==='org') html=buildOrgTabHTML(id);
else if(kind==='inv') html=buildInvestmentsTabHTML(id);
else if(kind==='bank') html=buildBankingTabHTML(id);
else if(kind==='cf') html=buildCustomFieldsTabHTML(id);
else if(kind==='doc') html=renderDocuments(id);
panel.innerHTML=html;
panel.setAttribute('data-built','1');
}
function buildShareholdersTabHTML(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
var shP='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">';
shP+='<div style="font-size:12px;color:var(--text3)">'+(lang==='en'?'Showing current shareholders.':'Mostrando accionistas actuales.')+'</div>';
shP+='<div style="display:flex;gap:6px">';
shP+='<button class="btn btn-outline btn-sm" onclick="openHistoryModal('+q(id)+',\'sh\')">'+(lang==='en'?'View History':'Ver Historial')+'</button>';
if(isAdmin()) shP+='<button class="btn btn-primary btn-sm" onclick="openAddSHForm('+q(id)+')">'+t('addShareholder')+'</button>';
shP+='</div></div>';
if(c.shareholders.length){
shP+='<canvas id="sh-pie" style="max-height:170px;margin-bottom:16px"></canvas>';
shP+='<table><thead><tr><th>'+t('ownerType')+'</th><th>'+t('shareholders2')+'</th><th>'+t('ownership')+'</th><th>'+t('shareClass')+'</th><th></th></tr></thead><tbody>';
c.shareholders.forEach(function(s){
shP+='<tr><td><span class="badge '+(s.type==='company'?'badge-jur':'badge-active')+'" style="font-size:10px">'+(s.type==='company'?'Empresa':'Persona')+'</span></td>';
if(s.type==='company'){ shP+='<td style="cursor:pointer;color:var(--accent);font-weight:600" onclick="closeModal();openCompany('+q(s.person)+')">'+esc(resolveOwner(s))+'</td>'; }
else { shP+='<td>'+esc(resolveOwner(s))+'</td>'; }
shP+='<td><div style="font-weight:600">'+s.pct+'%</div><div class="ownership-bar" style="width:100px"><div class="ownership-fill" style="width:'+s.pct+'%"></div></div></td>';
shP+='<td style="color:var(--text2)">'+esc(s.class||'-')+'</td><td style="white-space:nowrap">';
if(isAdmin()){
shP+='<button class="btn btn-outline btn-sm" onclick="openEditSHForm('+q(id)+','+q(s.id)+')" style="margin-right:4px">'+(lang==='en'?'Update':'Actualizar')+'</button>';
shP+='<button class="btn btn-danger btn-sm" onclick="removeSHCurrent('+q(id)+','+q(s.id)+')">'+(lang==='en'?'Remove':'Quitar')+'</button>';
}
shP+='</td></tr>';
});
shP+='</tbody></table>';
} else { shP+='<div class="empty">'+t('noShareholders')+'</div>'; }
return shP;
}
function buildDirectorsTabHTML(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
var dirP='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">';
dirP+='<div style="font-size:12px;color:var(--text3)">'+(lang==='en'?'Showing current directors.':'Mostrando directores actuales.')+'</div>';
dirP+='<div style="display:flex;gap:6px">';
dirP+='<button class="btn btn-outline btn-sm" onclick="openHistoryModal('+q(id)+',\'dir\')">'+(lang==='en'?'View History':'Ver Historial')+'</button>';
if(isAdmin()) dirP+='<button class="btn btn-primary btn-sm" onclick="openAddDirForm('+q(id)+')">+ '+(lang==='en'?'Director':'Director')+'</button>';
dirP+='</div></div>';
if(c.directors && c.directors.length){
dirP+='<table><thead><tr><th>'+(lang==='en'?'Name':'Nombre')+'</th><th>'+(lang==='en'?'Position':'Cargo')+'</th><th></th></tr></thead><tbody>';
c.directors.forEach(function(dd){
dirP+='<tr><td style="font-weight:600">'+esc(dd.name)+'</td><td style="color:var(--text2)">'+esc(dd.position||'Director')+'</td><td style="white-space:nowrap">';
if(isAdmin()){
dirP+='<button class="btn btn-outline btn-sm" onclick="openEditDirForm('+q(id)+','+q(dd.id)+')" style="margin-right:4px">'+(lang==='en'?'Update':'Actualizar')+'</button>';
dirP+='<button class="btn btn-danger btn-sm" onclick="removeDirCurrent('+q(id)+','+q(dd.id)+')">'+(lang==='en'?'Remove':'Quitar')+'</button>';
}
dirP+='</td></tr>';
});
dirP+='</tbody></table>';
} else { dirP+='<div class="empty">'+(lang==='en'?'No directors recorded.':'Sin directores.')+'</div>'; }
return dirP;
}
function buildSubsidiariesTabHTML(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
var subs=getSubs(id);
var subP='';
if(subs.length){
subP='<div style="font-size:12px;color:var(--text2);margin-bottom:12px;padding:8px 12px;background:var(--teal-bg);border-radius:var(--radius-sm)">'+esc(c.name)+(lang==='en'?' owns:':' es propietaria de:')+'</div>';
subP+='<table><thead><tr><th>'+t('name')+'</th><th>'+t('jurisdiction')+'</th><th>'+t('ownership')+'</th><th>'+t('status')+'</th><th></th></tr></thead><tbody>';
subs.forEach(function(s){
var sh=s.shareholders.find(function(sh){return sh.type==='company'&&sh.person===id;});
subP+='<tr><td style="font-weight:600;color:var(--accent);cursor:pointer" onclick="closeModal();openCompany('+q(s.id)+')">'+esc(s.name)+'</td>';
subP+='<td><span class="badge badge-jur">'+esc(s.jurisdiction)+'</span></td>';
subP+='<td><strong>'+(sh?sh.pct+'%':'—')+'</strong></td><td>'+sBadge(s.status)+'</td><td>';
if(isAdmin()) subP+='<button class="btn btn-danger btn-sm" onclick="delSubLink('+q(s.id)+','+q(id)+')">x</button>';
subP+='</td></tr>';
});
subP+='</tbody></table><div style="font-size:11px;color:var(--text3);margin-top:8px">x removes link only</div>';
} else { subP='<div class="empty">No subsidiaries.</div>'; }
return subP;
}
function buildOrgTabHTML(id){
  _orgActiveCompanyId = id;
  return renderOrgChartsContent();
}
function buildInvestmentsTabHTML(id){
var invs=data.investments.filter(function(i){return invCoIds(i).indexOf(id)!==-1;});
var invP='<div style="display:flex;justify-content:flex-end;margin-bottom:12px">';
if(isAdmin()) invP+='<button class="btn btn-primary btn-sm" onclick="openInvForm(null,'+q(id)+')">'+t('addInvestment')+'</button>';
invP+='</div>';
if(invs.length){
invs.forEach(function(inv){
invP+='<div class="inv-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
invP+='<div><div style="font-weight:700;font-size:14px">'+esc(inv.name)+'</div>';
invP+='<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
if(inv.fund) invP+='<span class="badge badge-fund">'+esc(inv.fund)+'</span>';
if(inv.type) invP+='<span class="badge badge-inv">'+esc(inv.type)+'</span>';
invP+='</div></div><div style="text-align:right"><div style="font-weight:700;font-size:15px;color:var(--accent)">'+fmtD(inv.marketValue)+'</div></div></div>';
invP+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin:8px 0;padding:8px;background:var(--bg);border-radius:var(--radius-sm)">';
invP+='<div><div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase">'+t('invCommit')+'</div><div style="font-weight:600">'+fmtD(inv.commitment)+'</div></div>';
invP+='<div><div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase">'+t('invCalls')+'</div><div style="font-weight:600">'+fmtD(inv.calls)+'</div></div>';
invP+='<div><div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase">'+t('invDist')+'</div><div style="font-weight:600;color:var(--teal)">'+fmtD(inv.distributions)+'</div></div>';
invP+='<div><div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase">'+t('invExpenses')+'</div><div style="font-weight:600;color:var(--coral)">'+fmtD(inv.expenses||0)+'</div></div></div>';
if(inv.notes) invP+='<div style="font-size:12px;color:var(--text2);margin-top:6px">'+esc(inv.notes)+'</div>';
invP+='<div style="display:flex;gap:6px;margin-top:10px">';
if(isAdmin()){
invP+='<button class="btn btn-outline btn-sm" onclick="openInvForm('+q(inv.id)+','+q(id)+')">'+t('editCompany')+'</button>';
invP+='<button class="btn btn-danger btn-sm" onclick="delInvFromModal('+q(inv.id)+','+q(id)+')">'+t('delete')+'</button>';
}
invP+='</div></div>';
});
} else { invP+='<div class="empty">'+t('noData')+'</div>'; }
return invP;
}
function buildBankingTabHTML(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
var bankP='<div style="display:flex;justify-content:flex-end;margin-bottom:12px">';
if(isAdmin()) bankP+='<button class="btn btn-primary btn-sm" onclick="addBankInModal('+q(id)+')">'+t('addBank')+'</button>';
bankP+='</div><div id="bank-view-list">'+renderBankView(id)+'</div>';
return bankP;
}
function buildCustomFieldsTabHTML(id){
var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
var cfP='<div style="display:flex;justify-content:flex-end;margin-bottom:12px">';
if(isAdmin()) cfP+='<button class="btn btn-primary btn-sm" onclick="addCFInModal('+q(id)+')">'+t('addField')+'</button>';
cfP+='</div>';
if(c.custom.length){
cfP+='<table><thead><tr><th>'+t('fieldName')+'</th><th>'+t('fieldValue')+'</th><th></th></tr></thead><tbody>';
c.custom.forEach(function(f,fi){
cfP+='<tr><td style="color:var(--text2);font-weight:500">'+esc(f.name)+'</td><td>'+esc(f.value)+'</td><td>';
if(isAdmin()) cfP+='<button class="btn btn-danger btn-sm" onclick="delCustomField('+q(id)+','+fi+')">x</button>';
cfP+='</td></tr>';
});
cfP+='</tbody></table>';
} else { cfP+='<div class="empty">'+t('noData')+'</div>'; }
return cfP;
}
function renderBankView(id){
  var c=data.companies.find(function(x){return x.id===id;}); if(!c) return '';
  if(!c.banking.length) return '<div class="empty">'+t('noData')+'</div>';
  var h='';
  c.banking.forEach(function(b,bi){
    h+='<div class="bank-row"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h+='<div style="font-weight:700">'+esc(b.bank)+' <span style="color:var(--text3);font-weight:400;font-size:12px">'+esc(b.currency||'')+' '+esc(b.type||'')+'</span></div>';
    if(isAdmin()){
      h+='<div style="display:flex;gap:5px">';
      h+='<button class="btn btn-outline btn-sm" onclick="editBankInModal('+q(id)+','+bi+')">'+t('editCompany')+'</button>';
      h+='<button class="btn btn-danger btn-sm" onclick="delBankAccount('+q(id)+','+bi+')">x</button></div>';
    }
    h+='</div>';
    h+=dr(t('accountNo'),'<span class="bank-sensitive" onclick="this.classList.toggle(\'revealed\')">'+esc(b.account||'—')+'</span>');
    if(b.routing) h+=dr(t('routing'),'<span class="bank-sensitive" onclick="this.classList.toggle(\'revealed\')">'+esc(b.routing)+'</span>');
    h+=dr('SWIFT',esc(b.swift||''))+dr(t('bankAddress'),esc(b.bankAddr||''));
    h+='</div>';
  });
  return h;
}
function buildSHPie(id){
  var c=data.companies.find(function(x){return x.id===id;}); if(!c||!c.shareholders.length) return;
  setTimeout(function(){ mkChart('sh-pie','doughnut',c.shareholders.map(function(s){return resolveOwner(s);}),c.shareholders.map(function(s){return s.pct;})); },50);
}
function switchTab(btn,pid){
var mb=btn.closest('.modal-body');
mb.querySelectorAll('.tab').forEach(function(b){b.classList.remove('active');});
mb.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
btn.classList.add('active');
var panel=document.getElementById(pid);
panel.classList.add('active');
buildTabLazy(panel);
}// -- Org Chart: filters state ------------------------------------------------

// -- Org Chart: per-company selection state ---------------------------------
var _orgActiveCompanyId = null;
var _orgSelSettings = {};
var _orgCoSearch = '';

function orgDefaultSettings(){ return { shareholders:true, subsidiaries:true, investments:true, invIds:null, shIds:null, subIds:null }; }
function orgEnsureSettings(id){ if(!_orgSelSettings[id]) _orgSelSettings[id]=orgDefaultSettings(); return _orgSelSettings[id]; }
function orgCompanyInvestments(cid){ return data.investments.filter(function(i){ return invCoIds(i).indexOf(cid)!==-1; }); }
function orgCompanyShareholders(cid){ var c=data.companies.find(function(x){return x.id===cid;}); return c?c.shareholders:[]; }
function orgCompanySubsidiaries(cid){ return getSubs(cid); }


function orgFlattenSubIds(cid){
  var out=[];
  (function walk(id, ancestors){
    if(ancestors.indexOf(id)!==-1) return;
    var nextAnc=ancestors.concat([id]);
    getSubs(id).forEach(function(sc){
      out.push(sc.id);
      walk(sc.id, nextAnc);
    });
  })(cid, []);
  return out;
}
function orgFlattenShIds(cid){
  var out=[];
  (function walk(id, ancestors){
    if(ancestors.indexOf(id)!==-1) return;
    var nextAnc=ancestors.concat([id]);
    orgCompanyShareholders(id).forEach(function(s){
      out.push(s.id);
      if(s.type==='company') walk(s.person, nextAnc);
    });
  })(cid, []);
  return out;
}
function orgFlattenInvIds(cid){
  var out=[];
  (function walk(id, ancestors){
    if(ancestors.indexOf(id)!==-1) return;
    var nextAnc=ancestors.concat([id]);
    orgCompanyInvestments(id).forEach(function(inv){ out.push(inv.id); });
    getSubs(id).forEach(function(sc){ walk(sc.id, nextAnc); });
  })(cid, []);
  return out;
}
function orgBuildSubTree(cid, ancestors){
  ancestors = ancestors || [cid];
  return getSubs(cid).map(function(sc){
    var cyc = ancestors.indexOf(sc.id)!==-1;
    return { id:sc.id, name:sc.name, jur:sc.jurisdiction, children: cyc?[]:orgBuildSubTree(sc.id, ancestors.concat([sc.id])) };
  });
}
function orgBuildShTree(cid, ancestors){
  ancestors = ancestors || [cid];
  return orgCompanyShareholders(cid).map(function(s){
    var cyc = s.type==='company' && ancestors.indexOf(s.person)!==-1;
    return { id:s.id, person:s.person, type:s.type, pct:s.pct, children: (s.type==='company' && !cyc) ? orgBuildShTree(s.person, ancestors.concat([s.person])) : [] };
  });
}
function orgBuildInvCompanyList(cid, ancestors, depth){
  ancestors = ancestors || [cid];
  depth = depth || 0;
  var list = [{ id:cid, depth:depth, investments:orgCompanyInvestments(cid) }];
  getSubs(cid).forEach(function(sc){
    if(ancestors.indexOf(sc.id)!==-1) return;
    list = list.concat(orgBuildInvCompanyList(sc.id, ancestors.concat([sc.id]), depth+1));
  });
  return list;
}
function orgRenderSubTreeHTML(activeId, tree, subIds, depth){
  var h='';
  tree.forEach(function(node){
    var incl = !subIds || subIds.has(node.id);
    h+='<label class="org-filter-option" style="padding:2px 2px;margin-left:'+(depth*14)+'px"><input type="checkbox" '+(incl?'checked':'')+' onchange="orgToggleCompanyNode('+q(activeId)+',\'sub\','+q(node.id)+',this.checked)"> <span style="font-size:12px">'+esc(node.name)+'</span></label>';
    if(node.children && node.children.length){
      h+=orgRenderSubTreeHTML(activeId, node.children, subIds, depth+1);
    }
  });
  return h;
}
function orgRenderShTreeHTML(activeId, tree, shIds, depth){
  var h='';
  tree.forEach(function(node){
    var incl = !shIds || shIds.has(node.id);
    var label = node.type==='company' ? cname(node.person) : node.person;
    h+='<label class="org-filter-option" style="padding:2px 2px;margin-left:'+(depth*14)+'px"><input type="checkbox" '+(incl?'checked':'')+' onchange="orgToggleCompanyNode('+q(activeId)+',\'sh\','+q(node.id)+',this.checked)"> <span style="font-size:12px">'+esc(label)+'</span></label>';
    if(node.children && node.children.length){
      h+=orgRenderShTreeHTML(activeId, node.children, shIds, depth+1);
    }
  });
  return h;
}
function orgRenderInvListHTML(activeId, list, invIds){
  var h='';
  list.forEach(function(entry){
    if(!entry.investments.length) return;
    if(entry.depth>0){
      h+='<div style="margin-left:'+(entry.depth*14)+'px;font-size:11.5px;color:var(--text3);margin-top:4px">'+esc(cname(entry.id))+'</div>';
    }
    entry.investments.forEach(function(inv){
      var incl = !invIds || invIds.has(inv.id);
      h+='<label class="org-filter-option" style="padding:2px 2px;margin-left:'+((entry.depth*14)+14)+'px"><input type="checkbox" '+(incl?'checked':'')+' onchange="orgToggleCompanyNode('+q(activeId)+',\'inv\','+q(inv.id)+',this.checked)"> <span style="font-size:12px">'+esc(inv.name)+'</span></label>';
    });
  });
  return h;
}

// -- Org Chart: graph builder (each entity appears exactly once) ------------
function orgBuildGraph(cid, opts){
  opts = opts || {};
  var showUp = opts.shareholders !== false;
  var showDown = opts.subsidiaries !== false;
  var showInv = opts.investments !== false;
  var invFilter = opts.invIds || null;
var shFilter = opts.shIds || null;
var subFilter = opts.subIds || null;
  var _allComps=_sanitizedCompanies(), _allById={};
  _allComps.forEach(function(c){ _allById[c.id]=c; });
  var _focalTest=_allById[cid];
  var _rootIsLiquidated=(_focalTest && _focalTest.status==='liquidated');
  var companies = _rootIsLiquidated ? _allComps : _orgActiveCompanies();
  var getSubsFn  = _rootIsLiquidated ? _allGetSubs  : _orgGetSubs;
  var byId = {};
  companies.forEach(function(c){ byId[c.id]=c; });
  var focal = byId[cid];
  var nodes = {};
  var edges = [];
  var edgeSeen = {};
  function addEdge(fromKey,toKey,pct){
    if(!fromKey || !toKey || fromKey===toKey) return;
    var k = fromKey+'|'+toKey;
    if(edgeSeen[k]) return;
    edgeSeen[k]=true;
    edges.push({from:fromKey, to:toKey, pct:(pct==null?null:pct)});
  }
  var focalKey = 'co:'+cid;
  nodes[focalKey] = {key:focalKey, kind:'focal', refId:cid, coId:cid, name:(focal?focal.name:cname(cid)), jur:(focal?focal.jurisdiction:''), sub:(focal?focal.jurisdiction:''), rank:0};
  if(showUp && focal){
    var visitedUp={}; visitedUp[cid]=true;
    var frontierUp=[cid];
    var depth=0, MAXD=30;
    while(frontierUp.length && depth<MAXD){
      depth++;
      var next=[];
      frontierUp.forEach(function(fid){
        var comp=byId[fid];
        if(!comp) return;
        (comp.shareholders||[]).forEach(function(s){
          var passesSh = !shFilter || shFilter.has(s.id);
          if(s.type==='company'){
            var pid=s.person;
            if(!byId[pid]) return;
            var key='co:'+pid;
            if(passesSh && !nodes[key]){
              nodes[key]={key:key,kind:'company',refId:pid,coId:pid,name:byId[pid].name,jur:byId[pid].jurisdiction,sub:'',rank:-depth};
            }
            if(!visitedUp[pid]){ visitedUp[pid]=true; next.push(pid); }
          } else if(s.type==='individual'){
            var ikey='ind:'+s.person;
            if(passesSh && !nodes[ikey]){
              nodes[ikey]={key:ikey,kind:'individual',refId:s.person,coId:null,name:s.person,jur:'',sub:'',rank:-depth};
            }
          }
        });
      });
      frontierUp=next;
    }
    Object.keys(nodes).forEach(function(key){
      var n=nodes[key];
      if(n.rank>0) return;
      var comp=byId[n.refId];
      if(!comp) return;
      (comp.shareholders||[]).forEach(function(s){
        if(s.type==='company'){
          var pKey='co:'+s.person;
          if(nodes[pKey] && nodes[pKey].rank<=0) addEdge(pKey,key,s.pct);
        } else if(s.type==='individual'){
          var ikey='ind:'+s.person;
          if(nodes[ikey]) addEdge(ikey,key,s.pct);
        }
      });
    });
  }
  var downInfo={};
  downInfo[cid]={key:focalKey, rank:0};
  if(showDown && focal){
    var visitedDown={}; visitedDown[cid]=true;
    var frontierDown=[cid];
    var depth2=0, MAXD2=30;
    while(frontierDown.length && depth2<MAXD2){
      depth2++;
      var next2=[];
      frontierDown.forEach(function(fid){
        getSubsFn(fid).forEach(function(sc){
          var passesSub = !subFilter || subFilter.has(sc.id);
          var key='co:'+sc.id;
          if(passesSub && !nodes[key]){
            nodes[key]={key:key,kind:'subsidiary',refId:sc.id,coId:sc.id,name:sc.name,jur:sc.jurisdiction,sub:'',rank:depth2};
          }
          if(!visitedDown[sc.id]){
            visitedDown[sc.id]=true;
            next2.push(sc.id);
            downInfo[sc.id]={key:key, rank:depth2};
          }
        });
      });
      frontierDown=next2;
    }
    Object.keys(nodes).forEach(function(key){
      var n=nodes[key];
      if(n.rank<0 || n.kind==='individual' || n.kind==='investment') return;
      getSubsFn(n.refId).forEach(function(sc){
        var cKey='co:'+sc.id;
        if(!nodes[cKey]) return;
        var sh=(sc.shareholders||[]).find(function(x){ return x.type==='company' && x.person===n.refId; });
        addEdge(key,cKey,sh?sh.pct:null);
      });
    });
  }
  if(showInv){
    Object.keys(downInfo).forEach(function(rid){
      var info=downInfo[rid];
      orgCompanyInvestments(rid).forEach(function(inv){
        var passesInv = !invFilter || invFilter.has(inv.id);
        if(!passesInv) return;
        var ikey='inv:'+inv.id;
        var mv = inv.marketValue ? ('$'+(+inv.marketValue).toLocaleString()) : '';
        if(!nodes[ikey]){
          nodes[ikey]={key:ikey,kind:'investment',refId:inv.id,coId:null,name:inv.name,jur:'',sub:mv,rank:info.rank+1};
        } else if(info.rank+1 < nodes[ikey].rank){
          nodes[ikey].rank = info.rank+1;
        }
        addEdge(info.key, ikey, null);
      });
    });
  }
  var incoming = {};
  edges.forEach(function(e){
    if(e.pct==null) return;
    var rec = incoming[e.to] || (incoming[e.to]={count:0,pct:null});
    rec.count++; rec.pct=e.pct;
  });
  Object.keys(nodes).forEach(function(key){
    var n=nodes[key];
    if(n.kind==='investment' || n.kind==='focal') return;
    var rec=incoming[key];
    n.sub = (n.jur||'').trim();
  });
  return {nodes:nodes, edges:edges, focalKey:focalKey};
}

// -- Org Chart: layout (rank rows + barycenter ordering, no overlaps) -------
function orgResolveRank(items){
  items.sort(function(a,b){ return a.bary-b.bary || (a.key<b.key?-1:a.key>b.key?1:0); });
  var leftX = items.map(function(it){ return it.bary; });
  for(var i=1;i<leftX.length;i++){ if(leftX[i] < leftX[i-1]+1) leftX[i]=leftX[i-1]+1; }
  var rightX = items.map(function(it){ return it.bary; });
  for(var j=rightX.length-2;j>=0;j--){ if(rightX[j] > rightX[j+1]-1) rightX[j]=rightX[j+1]-1; }
  items.forEach(function(it,idx){ it.x = (leftX[idx]+rightX[idx])/2; });
}
function orgLayoutGraph(nodes, edges, focalKey){
  if(!nodes[focalKey]) return;
  nodes[focalKey].x = 0;
  var byRank = {};
  Object.keys(nodes).forEach(function(k){ var r=nodes[k].rank; (byRank[r]=byRank[r]||[]).push(k); });
  var outMap={}, inMap={};
  edges.forEach(function(e){ (outMap[e.from]=outMap[e.from]||[]).push(e.to); (inMap[e.to]=inMap[e.to]||[]).push(e.from); });
  var allRanks = Object.keys(byRank).map(Number);
  var upRanks = allRanks.filter(function(r){ return r<0; }).sort(function(a,b){ return b-a; });
  var downRanks = allRanks.filter(function(r){ return r>0; }).sort(function(a,b){ return a-b; });
  function layoutSide(rankList, neighborMap){
    rankList.forEach(function(r){
      var keys = byRank[r] || [];
      var items = keys.map(function(k){
        var neigh = neighborMap[k] || [];
        var known = neigh.filter(function(nk){ return nodes[nk] && typeof nodes[nk].x === 'number'; });
        var bary = known.length ? (known.reduce(function(sum,nk){ return sum+nodes[nk].x; },0)/known.length) : nodes[focalKey].x;
        return {key:k, bary:bary};
      });
      orgResolveRank(items);
      items.forEach(function(it){ nodes[it.key].x = it.x; });
    });
  }
  layoutSide(upRanks, outMap);
  layoutSide(downRanks, inMap);
}
function orgFinalizePositions(nodes){
  var minX=Infinity, maxX=-Infinity, minRank=Infinity, maxRank=-Infinity;
  Object.keys(nodes).forEach(function(k){
    var n=nodes[k];
    if(typeof n.x !== 'number') n.x = 0;
    if(n.x<minX) minX=n.x; if(n.x>maxX) maxX=n.x;
    if(n.rank<minRank) minRank=n.rank; if(n.rank>maxRank) maxRank=n.rank;
  });
  if(!isFinite(minX)){ minX=0; maxX=0; }
  if(!isFinite(minRank)){ minRank=0; maxRank=0; }
  Object.keys(nodes).forEach(function(k){
    var n=nodes[k];
    n._cx = (n.x-minX)*ORG_COL + ORG_COL/2;
    n._cy = (n.rank-minRank)*ORG_ROW + ORG_ROW/2;
  });
  return { width: Math.max((maxX-minX+1)*ORG_COL, ORG_COL), height: (maxRank-minRank+1)*ORG_ROW };
}
function orgRenderGraphHTML(nodes, edges, focalKey){
  orgLayoutGraph(nodes, edges, focalKey);
  var dims = orgFinalizePositions(nodes);
  var htmlCards=[], edgePaths=[], edgeLabels=[];
  Object.keys(nodes).forEach(function(k){
    var n=nodes[k];
    htmlCards.push(orgCardHTML(n, n._cx, n._cy, k===focalKey));
  });
  edges.forEach(function(e){
    var a=nodes[e.from], b=nodes[e.to];
    if(!a||!b) return;
    var labelSide = (a.rank < 0) ? 'top' : 'bot';
    var result=orgEdgePath(e.from, e.to, a._cx, a._cy, b._cx, b._cy, e.pct, labelSide);
    edgePaths.push(result.path);
    if(result.label) edgeLabels.push(result.label);
  });
  var legend='<div class="org-legend" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;font-size:12px;font-weight:600">'
    +'<span style="color:var(--amber)">Individual Shareholder</span>'
    +'<span style="color:var(--purple)">Company Owner</span>'
    +'<span style="color:var(--accent)">Selected Company</span>'
    +'<span style="color:var(--teal)">Subsidiary</span>'
    +'<span style="color:var(--coral)">Investment</span>'
    +'</div>';
  // Render all path segments first, all labels last -- labels are always on top of every line
  var svg='<svg class="org-static-edges" width="'+dims.width+'" height="'+dims.height+'" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">'+edgePaths.join('')+edgeLabels.join('')+'</svg>';
  var tree='<div class="org-chart-tree" style="position:relative;width:'+dims.width+'px;height:'+dims.height+'px;margin:0 auto">'+svg+htmlCards.join('')+'</div>';
  var h='<div class="org-chart-scroll" data-static-edges="1">';
  h+='<div style="text-align:center;font-family:system-ui,sans-serif">';
  h+=legend;
  h+=tree;
  h+='</div></div>';
  return h;
}

var ORG_CARD_W=160, ORG_CARD_H=96, ORG_GAP_X=40, ORG_GAP_Y=64;
var ORG_COL=ORG_CARD_W+ORG_GAP_X, ORG_ROW=ORG_CARD_H+ORG_GAP_Y;

function orgNodeColor(kind){
if(kind==='individual') return {c:'var(--amber)',bg:'var(--amber-bg)',label:'Individual'};
if(kind==='company') return {c:'var(--purple)',bg:'var(--purple-bg)',label:'Company'};
if(kind==='subsidiary') return {c:'var(--teal)',bg:'var(--teal-bg)',label:'Subsidiary'};
if(kind==='investment') return {c:'var(--coral)',bg:'var(--coral-bg)',label:'Investment'};
if(kind==='cycle') return {c:'var(--text3)',bg:'var(--surface)',label:'Cycle'};
return {c:'var(--accent)',bg:'var(--accent-bg)',label:'Selected'};
}
function orgCardHTML(node,cx,cy,current){
var col=orgNodeColor(node.kind);
var cls='org-card org-card-abs'+((node.coId&&!current)?' clickable':'')+(current?' current':'');
var click=(node.coId&&!current)?(' onclick="openCompany('+q(node.coId)+')"'):'';
var left=Math.round(cx-ORG_CARD_W/2), top=Math.round(cy-ORG_CARD_H/2);
var style='left:'+left+'px;top:'+top+'px;width:'+ORG_CARD_W+'px;height:'+ORG_CARD_H+'px;margin:0;border-color:'+col.c+';background:'+col.bg+';';
return '<div class="'+cls+'" data-node-key="'+esc(node.key)+'" style="'+style+'"'+click+'>'
+'<div class="org-card-label" style="color:'+col.c+'">'+col.label+'</div>'
+'<div class="org-card-name" style="color:'+col.c+'">'+esc(node.name)+'</div>'
+(node.sub?'<div class="org-card-sub">'+esc(node.sub)+'</div>':'')
+'</div>';
}
function orgEdgePath(fromKey,toKey,x1,y1,x2,y2,pct,labelSide){
// top = the upper node (owner in a normal org chart); bot = the lower node (owned).
// Path shape: M top.x top.y → L top.x midY → L bot.x midY → L bot.x bot.y
var top = y1<=y2 ? {x:x1,y:y1+ORG_CARD_H/2} : {x:x2,y:y2+ORG_CARD_H/2};
var bot = y1<=y2 ? {x:x2,y:y2-ORG_CARD_H/2} : {x:x1,y:y1-ORG_CARD_H/2};
var midY=(top.y+bot.y)/2;
var eAttrs=' fill="none" stroke="var(--border2,#c7cbe0)" stroke-width="1.5" data-edge-from="'+esc(fromKey)+'" data-edge-to="'+esc(toKey)+'"';

var d='M '+top.x+' '+top.y+' L '+top.x+' '+midY+' L '+bot.x+' '+midY+' L '+bot.x+' '+bot.y;

if(pct==null){
  return {path:'<path d="'+d+'"'+eAttrs+'></path>', label:''};
}

var labelText=pct+'%';
var charW=7, pw=Math.max(labelText.length*charW+12,32), ph=18, gap=2;

// PLACEMENT RULE: label sits at (bot.x, midY) — the elbow corner at the top of the
// branch descending to the child. Each label is anchored at the x-column of its own
// child node, making it unambiguously "for this specific connection." One parent with
// multiple children: each label fans out at a different bot.x, same midY — one pill
// directly above each child branch. The white background breaks the line for readability.
var lx, ly;
if(labelSide==='top'){
  lx = top.x;
  ly = top.y + gap + ph/2;
} else {
  lx = bot.x;
  ly = midY;
}

// Label pill -- rendered on top of all paths via orgRenderGraphHTML layering
var labelHTML='<rect x="'+(lx-pw/2)+'" y="'+(ly-ph/2)+'" width="'+pw+'" height="'+ph+'" rx="9" ry="9" fill="var(--surface,#fff)" stroke="var(--border2,#c5ccdf)" stroke-width="1.2"></rect>'
+'<text x="'+lx+'" y="'+(ly+5)+'" text-anchor="middle" font-size="10" font-weight="600" font-family="system-ui,sans-serif" fill="var(--text2,#5a6080)">'+esc(labelText)+'</text>';
return {path:'<path d="'+d+'"'+eAttrs+'></path>', label:labelHTML};
}


function buildFullOrgChart(cid){
  var g = orgBuildGraph(cid, {shareholders:true, subsidiaries:true, investments:true, invIds:null});
  if(!g) return '';
  return orgRenderGraphHTML(g.nodes, g.edges, g.focalKey);
}
function buildFilteredOrgChart(cid, settings){
settings = settings || {};
var g = orgBuildGraph(cid, {shareholders:settings.shareholders!==false, subsidiaries:settings.subsidiaries!==false, investments:settings.investments!==false, invIds:settings.invIds||null, shIds:settings.shIds||null, subIds:settings.subIds||null});
if(!g) return '';
return orgRenderGraphHTML(g.nodes, g.edges, g.focalKey);
}

function orgChartDirectCards(el){
  var out = [];
  for(var i=0;i<el.children.length;i++){
    var child = el.children[i];
    if(child.classList && child.classList.contains('org-card')){ out.push(child); }
    else if(child.classList && child.classList.contains('org-branch')){
      for(var j=0;j<child.children.length;j++){
        var gc = child.children[j];
        if(gc.classList && gc.classList.contains('org-card')) out.push(gc);
      }
    }
  }
  return out;
}
function orgChartSideCards(el){
  if(!el||!el.classList) return [];
  if(el.classList.contains('org-card')) return [el];
  if(el.classList.contains('org-level')) return orgChartDirectCards(el);
  return [];
}
function orgChartConnectorPairs(root){
  var pairs = [];
  var conns = root.querySelectorAll('.org-conn');
  for(var i=0;i<conns.length;i++){
    var conn = conns[i];
    var before = orgChartSideCards(conn.previousElementSibling);
    var after = orgChartSideCards(conn.nextElementSibling);
    if(!before.length||!after.length) continue;
    for(var b=0;b<before.length;b++){
      for(var a=0;a<after.length;a++){
        pairs.push([before[b], after[a]]);
      }
    }
  }
  return pairs;
}
function orgChartCardPos(card, container){
  var left = 0, top = 0, node = card, guard = 0;
  while(node && node !== container && guard < 40){
    left += node.offsetLeft||0;
    top += node.offsetTop||0;
    node = node.offsetParent;
    guard++;
  }
  return { left: left, top: top, width: card.offsetWidth, height: card.offsetHeight };
}
function drawOrgChartConnectors(canvas){
  var scrollEl = canvas.querySelector('.org-chart-scroll');
  if(!scrollEl) return;
  scrollEl.style.position = 'relative';
  var old = scrollEl.querySelector('svg.org-chart-connectors');
  if(old) old.remove();
  var pairs = orgChartConnectorPairs(scrollEl);
  if(!pairs.length) return;
  var w = Math.max(scrollEl.scrollWidth, scrollEl.offsetWidth);
  var h = Math.max(scrollEl.scrollHeight, scrollEl.offsetHeight);
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('class','org-chart-connectors');
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.overflow = 'visible';
  svg.style.pointerEvents = 'none';
  for(var i=0;i<pairs.length;i++){
    var p = orgChartCardPos(pairs[i][0], scrollEl);
    var c = orgChartCardPos(pairs[i][1], scrollEl);
    var parentAbove = p.top <= c.top;
    var x1 = p.left + p.width/2;
    var y1 = parentAbove ? p.top + p.height : p.top;
    var x2 = c.left + c.width/2;
    var y2 = parentAbove ? c.top : c.top + c.height;
    var midY = (y1+y2)/2;
    var d = 'M '+x1+' '+y1+' L '+x1+' '+midY+' L '+x2+' '+midY+' L '+x2+' '+y2;
    var path = document.createElementNS(svgNS,'path');
    path.setAttribute('d', d);
    path.setAttribute('fill','none');
    path.setAttribute('stroke','var(--border2, #c7cbe0)');
    path.setAttribute('stroke-width','1.5');
    svg.appendChild(path);
  }
  scrollEl.insertBefore(svg, scrollEl.firstChild);
}
function orgChartApply(viewport){
  var st = viewport.__orgState;
  var canvas = viewport.__orgCanvas;
  canvas.style.transform = 'translate('+st.x+'px,'+st.y+'px) scale('+st.scale+')';
}
function orgChartFit(viewport, canvas){
  var prev = canvas.style.transform;
  canvas.style.transform = 'none';
  var cw = canvas.offsetWidth, ch = canvas.offsetHeight;
  var vw = viewport.clientWidth, vh = viewport.clientHeight;
  if(!cw||!ch||!vw||!vh){ canvas.style.transform = prev; return; }
  var scale = Math.min(vw/cw, vh/ch, 1);
  if(!scale || !isFinite(scale)) scale = 1;
  scale = Math.max(scale, 0.12);
  var tx = (vw - cw*scale)/2;
  var ty = (vh - ch*scale)/2;
  viewport.__orgState.scale = scale;
  viewport.__orgState.x = tx;
  viewport.__orgState.y = ty;
  orgChartApply(viewport);
}
function orgChartZoomBtn(factor,btn){
var vp = (btn && btn.closest) ? btn.closest('.org-chart-viewport') : document.querySelector('.org-chart-viewport');
if(!vp||!vp.__orgState) return;
var st = vp.__orgState;
var vw = vp.clientWidth, vh = vp.clientHeight;
var newScale = Math.min(Math.max(st.scale*factor, 0.12), 3);
var ratio = newScale/st.scale;
var cx = vw/2, cy = vh/2;
st.x = cx - (cx-st.x)*ratio;
st.y = cy - (cy-st.y)*ratio;
st.scale = newScale;
orgChartApply(vp);
}
function orgChartFitBtn(btn){
var vp = (btn && btn.closest) ? btn.closest('.org-chart-viewport') : document.querySelector('.org-chart-viewport');
if(!vp) return;
orgChartFit(vp, vp.__orgCanvas);
}
function orgChartClickSuppress(e){
e.stopPropagation();
e.preventDefault();
this.removeEventListener('click', orgChartClickSuppress, true);
}
function orgChartPointerDown(e){
if(e.button && e.button !== 0) return;
if(e.target && e.target.closest && e.target.closest('.org-chart-controls')) return;
var vp = e.currentTarget;
var p = e.touches ? e.touches[0] : e;
if(!window.__orgChartPan) window.__orgChartPan = {active:null};
window.__orgChartPan.active = { viewport: vp, lastX: p.clientX, lastY: p.clientY, moved: false };
if(e.cancelable) e.preventDefault();
}
function orgChartPointerMove(e){
if(!window.__orgChartPan) return;
var a = window.__orgChartPan.active;
if(!a) return;
var p = e.touches ? e.touches[0] : e;
if(!p) return;
var dx = p.clientX - a.lastX, dy = p.clientY - a.lastY;
a.lastX = p.clientX; a.lastY = p.clientY;
if(!a.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
if(!a.moved){ a.moved = true; a.viewport.classList.add('grabbing'); }
var st = a.viewport.__orgState;
if(st){ st.x += dx; st.y += dy; orgChartApply(a.viewport); }
if(e.cancelable) e.preventDefault();
}
function orgChartPointerUp(){
if(!window.__orgChartPan) return;
var a = window.__orgChartPan.active;
if(a && a.viewport){
a.viewport.classList.remove('grabbing');
if(a.moved){
a.viewport.addEventListener('click', orgChartClickSuppress, true);
}
}
window.__orgChartPan.active = null;
}
function orgChartWheel(e){
var vp = e.currentTarget;
var st = vp.__orgState;
if(!st) return;
e.preventDefault();
if(e.ctrlKey || e.metaKey){
var rect = vp.getBoundingClientRect();
var mx = e.clientX - rect.left, my = e.clientY - rect.top;
var delta = e.deltaY < 0 ? 1.12 : 0.89;
var newScale = Math.min(Math.max(st.scale*delta, 0.12), 3);
var ratio = newScale/st.scale;
st.x = mx - (mx-st.x)*ratio;
st.y = my - (my-st.y)*ratio;
st.scale = newScale;
orgChartApply(vp);
} else {
st.x -= e.deltaX;
st.y -= e.deltaY;
orgChartApply(vp);
}
}

function orgChartRefit(){
var vps = document.querySelectorAll('.org-chart-viewport');
vps.forEach(function(vp){
if(!vp || !vp.__orgCanvas) return;
drawOrgChartConnectors(vp.__orgCanvas);
orgChartFit(vp, vp.__orgCanvas);
});
}
function initOrgChartViewport(){
var scrolls = document.querySelectorAll('.org-chart-scroll');
scrolls.forEach(function(scroll){
if(scroll.closest('.org-chart-canvas')) return;
var host = scroll.parentNode;
var viewport = document.createElement('div');
viewport.className = 'org-chart-viewport';
var canvas = document.createElement('div');
canvas.className = 'org-chart-canvas';
host.insertBefore(viewport, scroll);
canvas.appendChild(scroll);
viewport.appendChild(canvas);
var controls = document.createElement('div');
controls.className = 'org-chart-controls';
controls.innerHTML = '<button type="button" class="org-chart-zoom-btn" title="Zoom in" onclick="orgChartZoomBtn(1.25,this)">+</button><button type="button" class="org-chart-zoom-btn" title="Zoom out" onclick="orgChartZoomBtn(0.8,this)">\u2212</button><button type="button" class="org-chart-zoom-btn" title="Reset view" onclick="orgChartFitBtn(this)">\u2921</button>';
viewport.appendChild(controls);
viewport.__orgState = { x:0, y:0, scale:1 };
viewport.__orgCanvas = canvas;
viewport.addEventListener('mousedown', orgChartPointerDown);
viewport.addEventListener('touchstart', orgChartPointerDown, { passive:false });
viewport.addEventListener('wheel', orgChartWheel, { passive:false });
drawOrgChartConnectors(canvas);
orgChartFit(viewport, canvas);
});
if(!window.__orgChartGlobalBound){
window.__orgChartGlobalBound = true;
window.addEventListener('mousemove', orgChartPointerMove);
window.addEventListener('mouseup', orgChartPointerUp);
window.addEventListener('touchmove', orgChartPointerMove, { passive:false });
window.addEventListener('touchend', orgChartPointerUp);
window.addEventListener('resize', function(){
clearTimeout(window.__orgChartResizeT);
window.__orgChartResizeT = setTimeout(orgChartRefit, 150);
});
}
}
function activateOrgChartTab(){
setTimeout(function(){
if(window.initOrgChartViewport) window.initOrgChartViewport();
if(window.orgChartRefit) window.orgChartRefit();
}, 0);
}
function printOrgChart(id){ openPrintConfig(id); }

// ── Org Chart Print Configuration (redesigned) ─────────────────────────────
var _orgPrintCfg = null;

function orgPrintNodeInfo(card){
  var label = card.querySelector('.org-card-label');
  var nameEl = card.querySelector('.org-card-name');
  var subEl = card.querySelector('.org-card-sub');
  return {
    label: label ? label.textContent : '',
    name: nameEl ? nameEl.textContent : '',
    sub: subEl ? subEl.textContent : ''
  };
}

function openPrintConfig(companyId){
  var c = data.companies.find(function(x){ return x.id===companyId; });
  if(!c) return;
  var tmp = document.createElement('div');
  tmp.innerHTML = buildFullOrgChart(companyId);
  var branchOptions = [{id:companyId, name:c.name}];
  var seen = {}; seen[companyId] = true;
  var clickable = tmp.querySelectorAll('.org-card.clickable');
  for(var i=0;i<clickable.length;i++){
    var m = /openCompany\('([^']+)'\)/.exec(clickable[i].getAttribute('onclick')||'');
    if(m && !seen[m[1]]){
      seen[m[1]] = true;
      var co = data.companies.find(function(x){ return x.id===m[1]; });
      if(co) branchOptions.push({id:m[1], name:co.name});
    }
  }
  var cards = tmp.querySelectorAll('.org-card');
  var nodeChecks = '';
  for(var i=0;i<cards.length;i++){
    
    var info = orgPrintNodeInfo(cards[i]);
    nodeChecks += '<label class="print-cfg-option"><input type="checkbox" class="print-node-check" value="'+(cards[i].getAttribute('data-node-key')||('n'+i))+'" checked onchange="orgPrintRefreshPreview()"> <span>'+esc(info.label)+' \u2014 '+esc(info.name)+(info.sub?' ('+esc(info.sub)+')':'')+'</span></label>';
  }

  _orgPrintCfg = { companyId: companyId, totalNodes: cards.length };

  var branchSelectHTML = '';
  for(var i=0;i<branchOptions.length;i++){
    branchSelectHTML += '<option value="'+esc(branchOptions[i].id)+'">'+esc(branchOptions[i].name)+'</option>';
  }

  var html = ''
    +'<div class="modal-header"><div><div class="modal-title">'+t('printConfigTitle')+'</div><div class="modal-subtitle">'+esc(c.name)+'</div></div><button class="close-btn" onclick="closeModal()">&times;</button></div>'
    +'<div class="modal-body">'
      +'<div class="print-cfg-grid">'
        +'<div>'
          +'<div class="print-cfg-section"><div class="print-cfg-label">'+t('printScope')+'</div>'
            +'<label class="print-cfg-option"><input type="radio" name="print-scope" value="full" checked onchange="orgPrintScopeChanged()"> '+t('printScopeFull')+'</label>'
            +'<label class="print-cfg-option"><input type="radio" name="print-scope" value="branch" onchange="orgPrintScopeChanged()"> '+t('printScopeBranch')+'</label>'
            +'<select class="print-cfg-select" id="print-branch-select" onchange="orgPrintRefreshPreview()" style="margin:4px 0 8px 26px;width:calc(100% - 26px)">'+branchSelectHTML+'</select>'
            +'<label class="print-cfg-option"><input type="radio" name="print-scope" value="selected" onchange="orgPrintScopeChanged()"> '+t('printScopeSelected')+'</label>'
          +'</div>'
          +'<div class="print-cfg-section"><div class="print-cfg-label">'+t('printInclude')+'</div>'
            +'<label class="print-cfg-option"><input type="checkbox" id="print-opt-colors" checked onchange="orgPrintRefreshPreview()"> '+t('printOptColors')+'</label>'
            +'<label class="print-cfg-option"><input type="checkbox" id="print-opt-labels" checked onchange="orgPrintRefreshPreview()"> '+t('printOptLabels')+'</label>'
            +'<label class="print-cfg-option"><input type="checkbox" id="print-opt-sub" checked onchange="orgPrintRefreshPreview()"> '+t('printOptSub')+'</label>'
            +'<label class="print-cfg-option"><input type="checkbox" id="print-opt-legend" checked onchange="orgPrintRefreshPreview()"> '+t('printOptLegend')+'</label>'
          +'</div>'
          +'<div class="print-cfg-section" id="print-node-list-wrap" style="display:none"><div class="print-cfg-label">'+t('printSelectNodes')+'</div><div class="print-node-list">'+nodeChecks+'</div></div>'
        +'</div>'
        +'<div>'
          +'<div class="print-cfg-label">'+t('printPreview')+'</div>'
          +'<div class="print-preview-shell"><div id="print-preview-inner" class="print-preview-scale"></div></div>'
          +'<div class="print-preview-note">'+t('printPreviewNote')+'</div>'
        +'</div>'
      +'</div>'
    +'</div>'
    +'<div class="modal-header" style="border-top:1px solid var(--border);border-bottom:none;justify-content:flex-end;gap:8px">'
      +'<button class="btn btn-outline" onclick="closeModal()">'+t('cancel')+'</button>'
      +'<button class="btn btn-teal" onclick="runOrgChartPrint()">&#128424; '+t('printChart')+'</button>'
    +'</div>';

  showModal(html, true);
  orgPrintRefreshPreview();
}

function orgPrintScopeChanged(){
  var scope = (document.querySelector('input[name="print-scope"]:checked')||{}).value;
  var wrap = document.getElementById('print-node-list-wrap');
  if(wrap) wrap.style.display = (scope==='selected') ? 'block' : 'none';
  orgPrintRefreshPreview();
}

function orgPrintFilteredHTML(){
  if(!_orgPrintCfg) return '';
  var scope = (document.querySelector('input[name="print-scope"]:checked')||{}).value || 'full';
  var sourceId = _orgPrintCfg.companyId;
  if(scope==='branch'){
    var sel = document.getElementById('print-branch-select');
    if(sel && sel.value) sourceId = sel.value;
  }
  var root = document.createElement('div');
  root.innerHTML = buildFullOrgChart(sourceId);

  var cards = root.querySelectorAll('.org-card');
  for(var i=0;i<cards.length;i++){  }

  if(scope==='selected'){
    var checked = {};
    var boxes = document.querySelectorAll('.print-node-check');
    for(var i=0;i<boxes.length;i++){ if(boxes[i].checked) checked[boxes[i].value] = true; }
    for(var i=0;i<cards.length;i++){
      if(!checked[cards[i].getAttribute('data-node-key')]) cards[i].remove();
    }
    var _edges = root.querySelectorAll('.org-static-edges path'); for(var _ei=0; _ei<_edges.length; _ei++){ var _ef=_edges[_ei].getAttribute('data-edge-from'), _et=_edges[_ei].getAttribute('data-edge-to'); if((_ef && !root.querySelector('[data-node-key="'+_ef+'"]')) || (_et && !root.querySelector('[data-node-key="'+_et+'"]'))){ _edges[_ei].remove(); } }
var branches = root.querySelectorAll('.org-branch');
    for(var i=0;i<branches.length;i++){
      if(!branches[i].querySelector('.org-card')) branches[i].remove();
    }
  }

  var elColors = document.getElementById('print-opt-colors');
  var elLabels = document.getElementById('print-opt-labels');
  var elSub = document.getElementById('print-opt-sub');
  var elLegend = document.getElementById('print-opt-legend');
  var showLabels = elLabels ? elLabels.checked : true;
  var showSub = elSub ? elSub.checked : true;
  var showLegend = elLegend ? elLegend.checked : true;
  var showColors = elColors ? elColors.checked : true;

  if(!showLabels){ var els=root.querySelectorAll('.org-card-label'); for(var i=0;i<els.length;i++) els[i].style.display='none'; }
  if(!showSub){ var els2=root.querySelectorAll('.org-card-sub'); for(var i=0;i<els2.length;i++) els2[i].style.display='none'; }
  var legendRow = root.querySelector('.org-legend');
  if(legendRow && !showLegend) legendRow.style.display='none';
  var scrollRoot = root.querySelector('.org-chart-scroll');
  if(scrollRoot) scrollRoot.classList.toggle('print-mono', !showColors);

  return root.innerHTML;
}

function orgPrintRefreshPreview(){
  var host = document.getElementById('print-preview-inner');
  if(!host) return;
  host.style.transform='none';
  host.style.width='auto';
  host.innerHTML = orgPrintFilteredHTML();
  var canvas = document.createElement('div');
  canvas.className = 'org-print-canvas';
  while(host.firstChild) canvas.appendChild(host.firstChild);
  host.appendChild(canvas);
  if(window.drawOrgChartConnectors) window.drawOrgChartConnectors(canvas);
  var scroll = canvas.querySelector('.org-chart-scroll');
  var shell = host.parentNode;
  var w = scroll ? scroll.scrollWidth : 800;
  var shellWidth = (shell ? shell.clientWidth : 500) - 20;
  var scale = w > 0 ? Math.min(1, shellWidth / w) : 1;
  host.style.transform = 'scale('+scale+')';
  host.style.width = (scale>0 ? (100/scale) : 100)+'%';
}

function runOrgChartPrint(){
  if(!_orgPrintCfg) return;
  var c = data.companies.find(function(x){ return x.id===_orgPrintCfg.companyId; });
  var filteredHTML = orgPrintFilteredHTML();
  var root = document.getElementById('print-org-root');
  if(!root){
    root = document.createElement('div');
    root.id = 'print-org-root';
    document.body.appendChild(root);
  }
  var headerName = c ? esc(c.name) : '';
  var headerJur = c ? esc(c.jurisdiction||'') : '';
  root.innerHTML = '<div class="org-print-header"><div class="t1">'+headerName+' \u2014 '+t('orgChart')+'</div>'
    +'<div class="t2">'+headerJur+' \u2014 FamOfi Registry \u2014 '+new Date().toLocaleDateString()+'</div></div>'
    +'<div id="print-org-canvas" class="org-print-canvas">'+filteredHTML+'</div>';

  var canvas = document.getElementById('print-org-canvas');
  if(window.drawOrgChartConnectors) window.drawOrgChartConnectors(canvas);

  var scroll = canvas.querySelector('.org-chart-scroll');
  if(scroll){
    var pageWidthPx = 1040;
    var w = scroll.scrollWidth;
    var scale = w > pageWidthPx ? (pageWidthPx / w) : 1;
    root.style.zoom = scale;
  } else {
    root.style.zoom = 1;
  }

  closeModal();
  document.body.classList.add('printing-org');
  setTimeout(function(){ window.print(); }, 60);
}

window.addEventListener('afterprint', function(){
  document.body.classList.remove('printing-org');
  var root = document.getElementById('print-org-root');
  if(root){ root.innerHTML=''; root.style.zoom=''; }
});

// -- Org Charts Tab -----------------------------------------------------------
function orgSelectCompany(id){
_orgActiveCompanyId = id;
orgEnsureSettings(id);
var m=document.getElementById('main'); if(m) m.innerHTML=renderOrgCharts();
}
function orgSetCompanySetting(id, field, val){
var st=orgEnsureSettings(id);
st[field]=val;
var m=document.getElementById('main'); if(m) m.innerHTML=renderOrgCharts();
}
function orgToggleCompanyNode(id, kind, nodeId, checked){
var st=orgEnsureSettings(id);
var field, allItems;
if(kind==='sh'){ field='shIds'; allItems=orgFlattenShIds(id); }
else if(kind==='sub'){ field='subIds'; allItems=orgFlattenSubIds(id); }
else { field='invIds'; allItems=orgFlattenInvIds(id); }
if(!st[field]){ st[field] = new Set(allItems); }
if(checked) st[field].add(nodeId); else st[field].delete(nodeId);
if(allItems.length && st[field].size===allItems.length) st[field]=null;
var m=document.getElementById('main'); if(m) m.innerHTML=renderOrgCharts();
}
function filterOrgCompanyList(qv){
var list=document.getElementById('org-co-list');
if(!list) return;
var btns=list.querySelectorAll('button');
var search=(qv||'').toLowerCase().trim();
btns.forEach(function(btn){ btn.style.display=(!search||btn.textContent.toLowerCase().includes(search))?'flex':'none'; });
}
function renderOrgChartsContent(){
var cs=data.companies.slice().sort(function(a,b){ var an=a.name.toLowerCase(), bn=b.name.toLowerCase(); return an<bn?-1:an>bn?1:0; });
if(_orgActiveCompanyId && !cs.find(function(x){ return x.id===_orgActiveCompanyId; })) _orgActiveCompanyId=null;
var h='<div class="org-charts-layout">';
h+='<div class="org-filter-sidebar">';
h+='<div class="card org-filter-section">';
h+='<div class="org-filter-title">'+(lang==='en'?'Companies':'Empresas')+'</div>';
h+='<input type="text" placeholder="'+(lang==='en'?'Search companies...':'Buscar empresas...')+'" value="'+esc(_orgCoSearch)+'" oninput="_orgCoSearch=this.value;filterOrgCompanyList(this.value)" style="width:100%;padding:6px 10px;border-radius:var(--radius-sm);border:1.5px solid var(--border);font-size:12px;margin-bottom:8px;box-sizing:border-box">';
h+='<div class="org-filter-list" id="org-co-list" style="max-height:220px">';
cs.forEach(function(c){
var isActive=(_orgActiveCompanyId===c.id);
var isLiq=(c.status==='liquidated');
h+='<button onclick="orgSelectCompany('+q(c.id)+')" style="display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:7px 11px;border-radius:var(--radius-sm);font-size:13px;cursor:pointer;font-family:inherit;border:none;background:'+(isActive?'var(--accent-bg)':'transparent')+';color:'+(isActive?'var(--accent)':(isLiq?'var(--text3)':'var(--text)'))+';font-weight:'+(isActive?'700':'400')+';margin-bottom:1px">';
h+='<span style="flex:1">'+esc(c.name)+'</span>';
if(isLiq) h+='<span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--border);color:var(--text3);font-style:italic">'+(lang==='en'?'Liquidated':'Liquidada')+'</span>';
else if(c.jurisdiction) h+='<span style="font-size:11px;padding:1px 7px;border-radius:10px;background:var(--border);color:var(--text2)">'+esc(c.jurisdiction)+'</span>';
h+='</button>';
});if(!cs.length) h+='<div style="padding:10px;color:var(--text3);font-size:12px">'+t('noCompanies')+'</div>';
h+='</div></div>';
h+='<div class="card org-filter-section">';
h+='<div class="org-filter-title">'+(lang==='en'?'Chart Settings':'Configuracion del Grafico')+'</div>';
if(!_orgActiveCompanyId){
h+='<div style="padding:10px;color:var(--text3);font-size:12px">'+(lang==='en'?'Select a company above to configure its chart':'Seleccione una empresa arriba para configurar su grafico')+'</div>';
} else {
var activeId=_orgActiveCompanyId;
var ac=cs.find(function(x){ return x.id===activeId; });
var st=orgEnsureSettings(activeId);
h+='<div style="font-size:12.5px;font-weight:700;margin-bottom:8px">'+esc(ac.name)+'</div>';
h+='<label class="org-filter-option"><input type="checkbox" '+(st.shareholders?'checked':'')+' onchange="orgSetCompanySetting('+q(activeId)+',\'shareholders\',this.checked)"> <span>'+(lang==='en'?'Show shareholders':'Mostrar accionistas')+'</span></label>';
if(st.shareholders){
var shTree=orgBuildShTree(activeId);
if(shTree.length){
h+='<div style="margin-left:18px;margin-top:2px">';
h+=orgRenderShTreeHTML(activeId, shTree, st.shIds, 0);
h+='</div>';
} else {
h+='<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'</div>';
}
}
h+='<label class="org-filter-option"><input type="checkbox" '+(st.subsidiaries?'checked':'')+' onchange="orgSetCompanySetting('+q(activeId)+',\'subsidiaries\',this.checked)"> <span>'+(lang==='en'?'Show subsidiaries':'Mostrar subsidiarias')+'</span></label>';
if(st.subsidiaries){
var subTree=orgBuildSubTree(activeId);
if(subTree.length){
h+='<div style="margin-left:18px;margin-top:2px">';
h+=orgRenderSubTreeHTML(activeId, subTree, st.subIds, 0);
h+='</div>';
} else {
h+='<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'</div>';
}
}
h+='<label class="org-filter-option"><input type="checkbox" '+(st.investments?'checked':'')+' onchange="orgSetCompanySetting('+q(activeId)+',\'investments\',this.checked)"> <span>'+(lang==='en'?'Show investments':'Mostrar inversiones')+'</span></label>';
if(st.investments){
var invList=orgBuildInvCompanyList(activeId).filter(function(e){ return e.investments.length; });
if(invList.length){
h+='<div style="margin-left:18px;margin-top:2px">';
h+=orgRenderInvListHTML(activeId, invList, st.invIds);
h+='</div>';
} else {
h+='<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'</div>';
}
}}
h+='</div>';
h+='</div>';
h+='<div class="org-chart-main" style="flex:1;min-width:0">';
if(!_orgActiveCompanyId){
h+='<div class="card" style="text-align:center;padding:48px;color:var(--text3)">';
h+='<div style="font-size:32px;margin-bottom:12px">\uD83C\uDFE2</div>';
h+='<div style="font-size:15px">'+t('selectCompany')+'</div></div>';
} else {
var c=cs.find(function(x){ return x.id===_orgActiveCompanyId; });
if(c){
var st2=orgEnsureSettings(c.id);
h+='<div class="card" style="margin-bottom:14px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
h+='<div style="font-size:13px;font-weight:600">'+esc(c.name)+' \u2014 '+t('orgChart')+'</div>';
h+='<div style="display:flex;gap:8px">';
h+='<button class="btn btn-teal btn-sm" onclick="printOrgChart('+q(c.id)+')">\uD83D\uDDA8 '+t('printChart')+'</button>';
h+='<button class="btn btn-outline btn-sm" onclick="printOrgChart('+q(c.id)+')">\u2B73 PDF / PNG</button>';
h+='</div></div>';
h+='<div class="card org-chart-card" style="margin-bottom:20px">'+buildFilteredOrgChart(c.id, st2)+'</div>';
}
}
h+='</div>';
h+='</div>';
return h;
}
function renderOrgCharts(){
var h='<div class="section-header"><div class="section-title">'+t('orgcharts')+'</div></div>';
h+=renderOrgChartsContent();
setTimeout(function(){ if(window.activateOrgChartTab) window.activateOrgChartTab(); filterOrgCompanyList(_orgCoSearch); }, 0);
return h;
}
function openAddSHForm(cid){
  var h='<div class="modal-header"><div class="modal-title">'+t('addShareholder')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group"><label class="lbl">'+t('ownerType')+'</label><select id="sh-type" class="inp" onchange="toggleSHInput()"><option value="individual">'+t('individual')+'</option><option value="company">'+t('company')+'</option></select></div>';
  var shNames=[...new Set(data.companies.reduce(function(a,c){c.shareholders.forEach(function(s){if(s.type==='individual'&&s.person)a.push(s.person);});return a;},[]))].sort();
  var shOpts=shNames.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  var opts=''; data.companies.filter(function(x){return x.id!==cid;}).forEach(function(x){opts+='<option value="'+x.id+'">'+esc(x.name)+'</option>';});
  h+='<div class="form-group"><label class="lbl">Name</label><input id="sh-person-text" class="inp" list="sh-person-list" placeholder="Type or select..."><datalist id="sh-person-list">'+shOpts+'</datalist><select id="sh-person-select" class="inp" style="display:none"><option value="">- select -</option>'+opts+'</select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('ownership')+'</label><input id="sh-pct" class="inp" type="number" min="0" max="100"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('shareClass')+'</label><input id="sh-class" class="inp"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Shares':'Acciones')+'</label><input id="sh-shares" class="inp"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Start Date':'Fecha de Inicio')+'</label><input id="sh-effdate" class="inp" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Cease Date (optional)':'Fecha de Cese (opcional)')+'</label><input id="sh-ceasedate" class="inp" type="date"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="sh-notes" class="inp"></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
  h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
  h+='<button class="btn btn-primary" onclick="commitAddSH('+q(cid)+')">'+t('save')+'</button></div></div>';
  showModal(h);
}
function toggleSHInput(){ var tp=document.getElementById('sh-type').value; document.getElementById('sh-person-text').style.display=tp==='company'?'none':'block'; document.getElementById('sh-person-select').style.display=tp==='company'?'block':'none'; }
function commitAddSH(cid){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  var tp=document.getElementById('sh-type').value||'individual';
  var person=tp==='company'?document.getElementById('sh-person-select').value:document.getElementById('sh-person-text').value;
  var pct=parseFloat(document.getElementById('sh-pct').value)||0;
  var cls=document.getElementById('sh-class').value||'';
  var shares=document.getElementById('sh-shares').value||'';
  var dt=document.getElementById('sh-effdate').value;
  var ceaseDt=document.getElementById('sh-ceasedate')?document.getElementById('sh-ceasedate').value:'';
  var notes=document.getElementById('sh-notes').value||'';
  if(!person) return;
  if(!dt){ alert(lang==='en'?'Please enter a valid start date.':'Por favor ingrese una fecha de inicio valida.'); return; }
  if(ceaseDt && ceaseDt<dt){ alert(lang==='en'?'Cease date cannot be before the start date.':'La fecha de cese no puede ser anterior a la fecha de inicio.'); return; }
  ensureHistory(c);
  var newSlot=uid();
  c.shareholderHistory.push({id:uid(),slotId:newSlot,effectiveDate:dt,person:person,pct:pct,class:cls,type:tp,shares:shares,notes:notes,removed:false});
  if(ceaseDt){
    c.shareholderHistory.push({id:uid(),slotId:newSlot,effectiveDate:ceaseDt,person:person,pct:pct,class:cls,type:tp,shares:shares,notes:notes,removed:true});
  }
  recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}
function openEditSHForm(cid,slotId){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  ensureHistory(c);
  var cur=_histLatestPerSlot(c.shareholderHistory)[slotId]; if(!cur) return;
  var opts=''; data.companies.filter(function(x){return x.id!==cid;}).forEach(function(x){opts+='<option value="'+x.id+'"'+(cur.person===x.id?' selected':'')+'>'+esc(x.name)+'</option>';});
  var h='<div class="modal-header"><div class="modal-title">'+t('editShareholder')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group"><label class="lbl">'+t('ownerType')+'</label><select id="sh-type-e" class="inp" onchange="toggleSHInputE()"><option value="individual"'+(cur.type==='individual'?' selected':'')+'>'+t('individual')+'</option><option value="company"'+(cur.type==='company'?' selected':'')+'>'+t('company')+'</option></select></div>';
  var shNamesE=[...new Set(data.companies.reduce(function(a,c2){c2.shareholders.forEach(function(s){if(s.type==='individual'&&s.person)a.push(s.person);});return a;},[]))].sort();
  var shOptsE=shNamesE.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  h+='<div class="form-group"><label class="lbl">Name</label><input id="sh-person-text-e" class="inp" list="sh-person-list-e" value="'+esc(cur.type==='individual'?cur.person:'')+'" style="'+(cur.type==='company'?'display:none':'')+'" placeholder="Type or select..."><datalist id="sh-person-list-e">'+shOptsE+'</datalist><select id="sh-person-select-e" class="inp" style="'+(cur.type==='individual'?'display:none':'')+'"><option value="">- select -</option>'+opts+'</select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('ownership')+'</label><input id="sh-pct-e" class="inp" type="number" min="0" max="100" value="'+cur.pct+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('shareClass')+'</label><input id="sh-class-e" class="inp" value="'+esc(cur.class||'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Shares':'Acciones')+'</label><input id="sh-shares-e" class="inp" value="'+esc(cur.shares!=null?cur.shares:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'New Start Date':'Nueva Fecha de Inicio')+'</label><input id="sh-effdate-e" class="inp" type="date" value="'+esc(cur.effectiveDate||'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Cease Date (optional)':'Fecha de Cese (opcional)')+'</label><input id="sh-ceasedate-e" class="inp" type="date"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="sh-notes-e" class="inp" value="'+esc(cur.notes||'')+'"></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
  h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
  h+='<button class="btn btn-primary" onclick="commitEditSH('+q(cid)+','+q(slotId)+')">'+t('save')+'</button></div></div>';
  showModal(h);
}
function toggleSHInputE(){ var tp=document.getElementById('sh-type-e').value; document.getElementById('sh-person-text-e').style.display=tp==='company'?'none':'block'; document.getElementById('sh-person-select-e').style.display=tp==='company'?'block':'none'; }
function commitEditSH(cid,slotId){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  var tp=document.getElementById('sh-type-e').value||'individual';
  var person=tp==='company'?document.getElementById('sh-person-select-e').value:document.getElementById('sh-person-text-e').value;
  var pct=parseFloat(document.getElementById('sh-pct-e').value)||0;
  var cls=document.getElementById('sh-class-e').value||'';
  var shares=document.getElementById('sh-shares-e').value||'';
  var dt=document.getElementById('sh-effdate-e').value;
  var ceaseDt=document.getElementById('sh-ceasedate-e')?document.getElementById('sh-ceasedate-e').value:'';
  var notes=document.getElementById('sh-notes-e').value||'';
  if(!person) return;
  if(!dt){ alert(lang==='en'?'Please enter a valid start date.':'Por favor ingrese una fecha de inicio valida.'); return; }
  if(ceaseDt && ceaseDt<dt){ alert(lang==='en'?'Cease date cannot be before the start date.':'La fecha de cese no puede ser anterior a la fecha de inicio.'); return; }
ensureHistory(c);
  var latest=_histLatestPerSlot(c.shareholderHistory)[slotId];
  if(latest && latest.effectiveDate===dt && !latest.removed){
    latest.person=person; latest.pct=pct; latest.class=cls; latest.type=tp; latest.shares=shares; latest.notes=notes;
  } else {
    c.shareholderHistory.push({id:uid(),slotId:slotId,effectiveDate:dt,person:person,pct:pct,class:cls,type:tp,shares:shares,notes:notes,removed:false});
  }
  if(ceaseDt){
    c.shareholderHistory.push({id:uid(),slotId:slotId,effectiveDate:ceaseDt,person:person,pct:pct,class:cls,type:tp,shares:shares,notes:notes,removed:true});
  }
  recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}
function removeSHCurrent(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var cur=_histLatestPerSlot(c.shareholderHistory)[slotId]; if(!cur) return;
var h='<div class="modal-header"><div class="modal-title">'+(lang==='en'?'Remove Shareholder':'Quitar Accionista')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
h+='<div class="modal-body">';
h+='<div style="margin-bottom:12px">'+(lang==='en'?'This will mark ':'Esto marcara a ')+'<b>'+esc(cur.person||'')+'</b>'+(lang==='en'?' as no longer a current shareholder as of the date below. The history will be preserved.':' como ya no accionista actual a partir de la fecha indicada. El historial se conservara.')+'</div>';
h+='<div class="form-grid">';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Effective Date':'Fecha Efectiva')+'</label><input id="sh-rm-date" class="inp" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="sh-rm-notes" class="inp"></div>';
h+='</div></div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
h+='<button class="btn btn-danger" onclick="commitRemoveSH('+q(cid)+','+q(slotId)+')">'+(lang==='en'?'Remove':'Quitar')+'</button></div>';
h+='</div>';
showModal(h);
}
function commitRemoveSH(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var cur=_histLatestPerSlot(c.shareholderHistory)[slotId]; if(!cur) return;
var dt=document.getElementById('sh-rm-date').value;
if(!dt){ alert(lang==='en'?'Please enter a valid effective date.':'Por favor ingrese una fecha efectiva valida.'); return; }
var notes=document.getElementById('sh-rm-notes').value||'';
c.shareholderHistory.push({id:uid(),slotId:slotId,effectiveDate:dt,person:cur.person,pct:cur.pct,class:cur.class,type:cur.type,shares:cur.shares,notes:notes,removed:true});
recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}

function openAddDirForm(cid){
var h='<div class="modal-header"><div class="modal-title">'+(lang==='en'?'Add Director':'Agregar Director')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
h+='<div class="modal-body"><div class="form-grid">';
h+='<div class="form-group"><label class="lbl">Name</label><input id="dir-name" class="inp"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Position':'Cargo')+'</label><input id="dir-position" class="inp" value="Director" placeholder="Director, Alternate Director, Manager, Member..."></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Effective Date':'Fecha Efectiva')+'</label><input id="dir-effdate" class="inp" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="dir-notes" class="inp"></div>';
h+='</div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
h+='<button class="btn btn-primary" onclick="commitAddDir('+q(cid)+')">'+t('save')+'</button></div></div>';
showModal(h);
}
function commitAddDir(cid){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
var name=document.getElementById('dir-name').value||'';
var position=document.getElementById('dir-position').value||'Director';
var dt=document.getElementById('dir-effdate').value;
var notes=document.getElementById('dir-notes').value||'';
if(!name) return;
if(!dt){ alert(lang==='en'?'Please enter a valid effective date.':'Por favor ingrese una fecha efectiva valida.'); return; }
ensureHistory(c);
c.directorHistory.push({id:uid(),slotId:uid(),effectiveDate:dt,name:name,position:position,notes:notes,removed:false});
recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}
function openEditDirForm(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var cur=_histLatestPerSlot(c.directorHistory)[slotId]; if(!cur) return;
var h='<div class="modal-header"><div class="modal-title">'+(lang==='en'?'Update Director':'Actualizar Director')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
h+='<div class="modal-body"><div class="form-grid">';
h+='<div class="form-group"><label class="lbl">Name</label><input id="dir-name-e" class="inp" value="'+esc(cur.name||'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Position':'Cargo')+'</label><input id="dir-position-e" class="inp" value="'+esc(cur.position||'Director')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'New Effective Date':'Nueva Fecha Efectiva')+'</label><input id="dir-effdate-e" class="inp" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="dir-notes-e" class="inp" value="'+esc(cur.notes||'')+'"></div>';
h+='</div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
h+='<button class="btn btn-primary" onclick="commitEditDir('+q(cid)+','+q(slotId)+')">'+t('save')+'</button></div></div>';
showModal(h);
}
function commitEditDir(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
var name=document.getElementById('dir-name-e').value||'';
var position=document.getElementById('dir-position-e').value||'Director';
var dt=document.getElementById('dir-effdate-e').value;
var notes=document.getElementById('dir-notes-e').value||'';
if(!name) return;
if(!dt){ alert(lang==='en'?'Please enter a valid effective date.':'Por favor ingrese una fecha efectiva valida.'); return; }
ensureHistory(c);
c.directorHistory.push({id:uid(),slotId:slotId,effectiveDate:dt,name:name,position:position,notes:notes,removed:false});
recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}
function removeDirCurrent(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var cur=_histLatestPerSlot(c.directorHistory)[slotId]; if(!cur) return;
var h='<div class="modal-header"><div class="modal-title">'+(lang==='en'?'Remove Director':'Quitar Director')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
h+='<div class="modal-body">';
h+='<div style="margin-bottom:12px">'+(lang==='en'?'This will mark ':'Esto marcara a ')+'<b>'+esc(cur.name||'')+'</b>'+(lang==='en'?' as no longer a current director as of the date below. The history will be preserved.':' como ya no director actual a partir de la fecha indicada. El historial se conservara.')+'</div>';
h+='<div class="form-grid">';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Effective Date':'Fecha Efectiva')+'</label><input id="dir-rm-date" class="inp" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="dir-rm-notes" class="inp"></div>';
h+='</div></div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
h+='<button class="btn btn-danger" onclick="commitRemoveDir('+q(cid)+','+q(slotId)+')">'+(lang==='en'?'Remove':'Quitar')+'</button></div>';
h+='</div>';
showModal(h);
}
function commitRemoveDir(cid,slotId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var cur=_histLatestPerSlot(c.directorHistory)[slotId]; if(!cur) return;
var dt=document.getElementById('dir-rm-date').value;
if(!dt){ alert(lang==='en'?'Please enter a valid effective date.':'Por favor ingrese una fecha efectiva valida.'); return; }
var notes=document.getElementById('dir-rm-notes').value||'';
c.directorHistory.push({id:uid(),slotId:slotId,effectiveDate:dt,name:cur.name,position:cur.position,notes:notes,removed:true});
recomputeCurrent(c); save(); closeModal(); openCompany(cid);
}

function openHistoryModal(cid,kind){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
ensureHistory(c);
var key=cid+'_'+kind;
window._histSort=window._histSort||{};
if(!window._histSort[key]) window._histSort[key]='desc';
var title = kind==='sh' ? (lang==='en'?'Shareholder History':'Historial de Accionistas') : (lang==='en'?'Director History':'Historial de Directores');
var h='<div class="modal-header"><div class="modal-title">'+esc(title)+' - '+esc(c.name)+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
h+='<div class="modal-body">';
h+='<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button class="btn btn-outline btn-sm" onclick="toggleHistSort('+q(cid)+','+q(kind)+')">'+(lang==='en'?'Sort: ':'Orden: ')+(window._histSort[key]==='asc'?(lang==='en'?'Oldest first':'Mas antiguo primero'):(lang==='en'?'Newest first':'Mas reciente primero'))+'</button></div>';
h+='<table><thead><tr>';
if(kind==='sh'){
h+='<th>'+t('shareholders2')+'</th><th>'+t('ownership')+'</th><th>'+(lang==='en'?'Start Date':'Fecha Inicio')+'</th><th>'+(lang==='en'?'Cease Date':'Fecha Cese')+'</th><th>'+(lang==='en'?'Status':'Estado')+'</th><th>'+t('notes')+'</th><th></th>';
} else {
h+='<th>'+(lang==='en'?'Effective Date':'Fecha Efectiva')+'</th><th>'+(lang==='en'?'Name':'Nombre')+'</th><th>'+(lang==='en'?'Position':'Cargo')+'</th><th>'+t('notes')+'</th><th>'+(lang==='en'?'Status':'Estado')+'</th><th></th>';
}
h+='</tr></thead><tbody id="hist-tbody">'+renderHistTable(cid,kind)+'</tbody></table>';
h+='</div>';
showModal(h,true);
}
function toggleHistSort(cid,kind){
var key=cid+'_'+kind;
window._histSort=window._histSort||{};
window._histSort[key]=(window._histSort[key]==='asc')?'desc':'asc';
openHistoryModal(cid,kind);
}
function renderHistTable(cid,kind){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return '';
  var key = cid+'_'+kind;
  window._histSort=window._histSort||{};
  var dir = window._histSort[key] || 'desc';
  if(kind==='sh'){
    var periods = buildSHPeriods(c);
    var sortedP = periods.slice().sort(function(a,b){
      if(a.startDate<b.startDate) return dir==='asc'?-1:1;
      if(a.startDate>b.startDate) return dir==='asc'?1:-1;
      return 0;
    });
    var rows='';
    sortedP.forEach(function(p){
      rows+='<tr'+(!p.current?' style="opacity:0.55"':'')+'><td>'+esc(p.person||'')+'</td><td>'+(p.pct!=null?p.pct+'%':'')+'</td><td>'+fmtDate(p.startDate)+'</td><td>'+(p.ceaseDate?fmtDate(p.ceaseDate):'—')+'</td><td>'+(p.current?(lang==='en'?'Current':'Actual'):(lang==='en'?'Former':'Anterior'))+'</td><td>'+esc(p.notes||'')+'</td><td style="white-space:nowrap">';
      if(isAdmin()){
        rows+='<button class="btn btn-outline btn-sm" onclick="openEditHistEntry('+q(cid)+',\'sh\','+q(p.entryId)+')" style="margin-right:4px">'+(lang==='en'?'Edit':'Editar')+'</button>';
        rows+='<button class="btn btn-danger btn-sm" onclick="delHistEntry('+q(cid)+',\'sh\','+q(p.entryId)+')">'+(lang==='en'?'Delete':'Eliminar')+'</button>';
      }
      rows+='</td></tr>';
    });
    if(!rows) rows='<tr><td colspan="7" class="empty">'+(lang==='en'?'No history yet.':'Sin historial.')+'</td></tr>';
    return rows;
  }
  var arr = (c.directorHistory||[]);
  var sorted = arr.slice().sort(function(a,b){
    if(a.effectiveDate<b.effectiveDate) return dir==='asc'?-1:1;
    if(a.effectiveDate>b.effectiveDate) return dir==='asc'?1:-1;
    return 0;
  });
  var rows='';
  sorted.forEach(function(e){
    rows+='<tr'+(e.removed?' style="opacity:0.55"':'')+'><td>'+esc(e.effectiveDate)+'</td><td>'+esc(e.name||'')+'</td><td>'+esc(e.position||'')+'</td><td>'+esc(e.notes||'')+'</td><td>'+(e.removed?(lang==='en'?'Removed':'Retirado'):(lang==='en'?'Active':'Activo'))+'</td><td style="white-space:nowrap">';
    if(isAdmin()){
      rows+='<button class="btn btn-outline btn-sm" onclick="openEditHistEntry('+q(cid)+','+q(kind)+','+q(e.id)+')" style="margin-right:4px">'+(lang==='en'?'Edit':'Editar')+'</button>';
      rows+='<button class="btn btn-danger btn-sm" onclick="delHistEntry('+q(cid)+','+q(kind)+','+q(e.id)+')">'+(lang==='en'?'Delete':'Eliminar')+'</button>';
    }
    rows+='</td></tr>';
  });
  if(!rows) rows='<tr><td colspan="6" class="empty">'+(lang==='en'?'No history yet.':'Sin historial.')+'</td></tr>';
  return rows;
}
function openEditHistEntry(cid,kind,entryId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
var arr = kind==='sh'?c.shareholderHistory:c.directorHistory;
var e = arr.find(function(x){return x.id===entryId;}); if(!e) return;
var h='<div class="modal-header"><div class="modal-title">'+(lang==='en'?'Edit History Entry':'Editar Entrada de Historial')+'</div><button class="close-btn" onclick="closeModal();openHistoryModal('+q(cid)+','+q(kind)+')">x</button></div>';
h+='<div class="modal-body"><div class="form-grid">';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Effective Date':'Fecha Efectiva')+'</label><input id="hist-e-date" class="inp" type="date" value="'+esc(e.effectiveDate)+'"></div>';
if(kind==='sh'){
h+='<div class="form-group"><label class="lbl">Name</label><input id="hist-e-person" class="inp" value="'+esc(e.person||'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('ownership')+'</label><input id="hist-e-pct" class="inp" type="number" min="0" max="100" value="'+(e.pct!=null?e.pct:'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Shares':'Acciones')+'</label><input id="hist-e-shares" class="inp" value="'+esc(e.shares!=null?e.shares:'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+t('shareClass')+'</label><input id="hist-e-class" class="inp" value="'+esc(e.class||'')+'"></div>';
} else {
h+='<div class="form-group"><label class="lbl">Name</label><input id="hist-e-name" class="inp" value="'+esc(e.name||'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Position':'Cargo')+'</label><input id="hist-e-position" class="inp" value="'+esc(e.position||'Director')+'"></div>';
}
h+='<div class="form-group"><label class="lbl">'+t('notes')+'</label><input id="hist-e-notes" class="inp" value="'+esc(e.notes||'')+'"></div>';
h+='<div class="form-group"><label class="lbl">'+(lang==='en'?'Removed?':'Retirado?')+'</label><select id="hist-e-removed" class="inp"><option value="0"'+(!e.removed?' selected':'')+'>'+(lang==='en'?'No':'No')+'</option><option value="1"'+(e.removed?' selected':'')+'>'+(lang==='en'?'Yes':'Si')+'</option></select></div>';
h+='</div>';
h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
h+='<button class="btn btn-outline" onclick="closeModal();openHistoryModal('+q(cid)+','+q(kind)+')">'+t('cancel')+'</button>';
h+='<button class="btn btn-primary" onclick="commitEditHistEntry('+q(cid)+','+q(kind)+','+q(entryId)+')">'+t('save')+'</button></div></div>';
showModal(h);
}
function commitEditHistEntry(cid,kind,entryId){
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
var arr = kind==='sh'?c.shareholderHistory:c.directorHistory;
var e = arr.find(function(x){return x.id===entryId;}); if(!e) return;
var dt=document.getElementById('hist-e-date').value;
if(!dt){ alert(lang==='en'?'Please enter a valid effective date.':'Por favor ingrese una fecha efectiva valida.'); return; }
e.effectiveDate=dt;
e.notes=document.getElementById('hist-e-notes').value||'';
e.removed=document.getElementById('hist-e-removed').value==='1';
if(kind==='sh'){
e.person=document.getElementById('hist-e-person').value||'';
e.pct=parseFloat(document.getElementById('hist-e-pct').value)||0;
e.shares=document.getElementById('hist-e-shares').value||'';
e.class=document.getElementById('hist-e-class').value||'';
} else {
e.name=document.getElementById('hist-e-name').value||'';
e.position=document.getElementById('hist-e-position').value||'Director';
}
recomputeCurrent(c); save(); closeModal(); openHistoryModal(cid,kind);
}
function delHistEntry(cid,kind,entryId){
if(!confirm(lang==='en'?'Delete this history entry? This cannot be undone.':'Eliminar esta entrada de historial? Esto no se puede deshacer.')) return;
var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
var arr = kind==='sh'?c.shareholderHistory:c.directorHistory;
var i = arr.findIndex(function(x){return x.id===entryId;}); if(i<0) return;
arr.splice(i,1);
recomputeCurrent(c); save(); openHistoryModal(cid,kind);
}
function delSubLink(subId,pid){ if(!confirm('Remove link? Company stays.')) return; var s=data.companies.find(function(x){return x.id===subId;}); if(!s) return; s.shareholders=s.shareholders.filter(function(sh){return !(sh.type==='company'&&sh.person===pid);}); save(); closeModal(); openCompany(pid); }
function delInvFromModal(invId,cid){ if(!confirm('Delete investment?')) return; data.investments=data.investments.filter(function(x){return x.id!==invId;}); save(); closeModal(); openCompany(cid); }
function delBankAccount(cid,idx){ if(!confirm('Delete bank account?')) return; var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.banking.splice(idx,1); save(); var el=document.getElementById('bank-view-list'); if(el) el.innerHTML=renderBankView(cid); }
function delCustomField(cid,idx){ if(!confirm('Remove field?')) return; var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.custom.splice(idx,1); save(); closeModal(); openCompany(cid); }

// ── Bank modals ───────────────────────────────────────────────────────────────
function bankFormHTML(b){
  var h='<div class="form-grid">';
  h+='<div class="form-group"><label class="lbl">'+t('bankName')+'</label><input id="bk-bank" class="inp" value="'+esc(b?b.bank:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('currency')+'</label><input id="bk-cur" class="inp" value="'+esc(b?b.currency:'USD')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('accountNo')+'</label><input id="bk-acc" class="inp" value="'+esc(b?b.account:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('routing')+'</label><input id="bk-rou" class="inp" value="'+esc(b?b.routing:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">SWIFT</label><input id="bk-sw" class="inp" value="'+esc(b?b.swift:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('accountType')+'</label><input id="bk-type" class="inp" value="'+esc(b?b.type:'Checking')+'"></div>';
  h+='<div class="form-group full"><label class="lbl">'+t('bankAddress')+'</label><input id="bk-addr" class="inp" value="'+esc(b?b.bankAddr:'')+'"></div></div>';
  return h;
}
function addBankInModal(cid){ var h='<div class="modal-header"><div class="modal-title">'+t('addBank')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div><div class="modal-body">'+bankFormHTML(null)+'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button><button class="btn btn-primary" onclick="commitBankAdd('+q(cid)+')">'+t('save')+'</button></div></div>'; showModal(h); }
function editBankInModal(cid,idx){ var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; var b=c.banking[idx]; if(!b) return; var h='<div class="modal-header"><div class="modal-title">Edit Bank</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div><div class="modal-body">'+bankFormHTML(b)+'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button><button class="btn btn-primary" onclick="commitBankEdit('+q(cid)+','+idx+')">'+t('save')+'</button></div></div>'; showModal(h); }
function commitBankAdd(cid){ var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.banking.push({id:uid(),bank:gv('bk-bank'),account:gv('bk-acc'),routing:gv('bk-rou'),swift:gv('bk-sw'),bankAddr:gv('bk-addr'),currency:gv('bk-cur'),type:gv('bk-type')}); save(); closeModal(); openCompany(cid); }
function commitBankEdit(cid,idx){ var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.banking[idx]={id:c.banking[idx].id,bank:gv('bk-bank'),account:gv('bk-acc'),routing:gv('bk-rou'),swift:gv('bk-sw'),bankAddr:gv('bk-addr'),currency:gv('bk-cur'),type:gv('bk-type')}; save(); closeModal(); openCompany(cid); }
function addCFInModal(cid){ var h='<div class="modal-header"><div class="modal-title">'+t('addField')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div><div class="modal-body"><div class="form-grid"><div class="form-group"><label class="lbl">'+t('fieldName')+'</label><input id="cf-name" class="inp"></div><div class="form-group"><label class="lbl">'+t('fieldValue')+'</label><input id="cf-val" class="inp"></div></div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button><button class="btn btn-primary" onclick="commitCFAdd('+q(cid)+')">'+t('save')+'</button></div></div>'; showModal(h); }
function commitCFAdd(cid){ var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.custom.push({id:uid(),name:gv('cf-name'),value:gv('cf-val')}); save(); closeModal(); openCompany(cid); }

// ── Documents ─────────────────────────────────────────────────────────────────
function renderDocuments(cid){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return '';
  var docs=c.documents||[];
  var h='';
  if(isAdmin()){
    h+='<div class="drop-upload" onclick="document.getElementById(\'doc-file-'+cid+'\').click()">';
    h+='<div style="font-size:24px;margin-bottom:6px">&#128206;</div>';
    h+='<div style="font-weight:600">'+t('uploadDoc')+'</div>';
    h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">PDF � DOCX � XLSX � PPTX</div>';
    h+='<input id="doc-file-'+cid+'" type="file" accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls" multiple style="display:none" onchange="uploadDocuments('+q(cid)+',this)"></div>';
  }
  h+='<div id="doc-list-'+cid+'">';
  if(docs.length){
    docs.forEach(function(doc,di){
      h+='<div class="doc-row"><div class="doc-icon">&#128196;</div>';
      h+='<div><div class="doc-name">'+esc(doc.name)+'</div>';
      h+='<div class="doc-meta">'+esc(doc.uploadedAt||'')+'</div></div>';
      h+='<div style="display:flex;gap:6px;margin-left:auto">';
      h+='<a href="'+esc(doc.url)+'" target="_blank" class="btn btn-teal btn-sm">Download</a>';
      if(isAdmin()) h+='<button class="btn btn-danger btn-sm" onclick="deleteDocument('+q(cid)+','+di+')">x</button>';
      h+='</div></div>';
    });
  } else { h+='<div class="empty">'+t('noDocuments')+'</div>'; }
  h+='</div>';
  return h;
}
function uploadDocuments(cid,input){
  var files=Array.from(input.files); if(!files.length) return;
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  if(!c.documents) c.documents=[];
  var listEl=document.getElementById('doc-list-'+cid);
  if(listEl) listEl.innerHTML='<div style="padding:16px;color:var(--text3)">Uploading...</div>';
  var promises=files.map(function(file){
    var path='famofi/'+cid+'/'+Date.now()+'_'+file.name;
    var ref=_storage.ref(path);
    return ref.put(file).then(function(){return ref.getDownloadURL();}).then(function(url){
      return {name:file.name,url:url,size:file.size,path:path,uploadedAt:new Date().toLocaleDateString()};
    });
  });
  Promise.all(promises).then(function(docs){
    docs.forEach(function(d){c.documents.push(d);}); save();
    if(listEl){ var h=''; c.documents.forEach(function(doc,di){ h+='<div class="doc-row"><div class="doc-icon">&#128196;</div><div><div class="doc-name">'+esc(doc.name)+'</div><div class="doc-meta">'+esc(doc.uploadedAt||'')+'</div></div><div style="display:flex;gap:6px;margin-left:auto"><a href="'+esc(doc.url)+'" target="_blank" class="btn btn-teal btn-sm">Download</a>'+(isAdmin()?'<button class="btn btn-danger btn-sm" onclick="deleteDocument('+q(cid)+','+di+')">x</button>':'')+'</div></div>'; }); listEl.innerHTML=h||'<div class="empty">'+t('noDocuments')+'</div>'; }
  }).catch(function(e){ if(listEl) listEl.innerHTML='<div style="color:var(--red);padding:12px">Upload failed: '+e.message+'</div>'; });
}
function deleteDocument(cid,di){
  if(!confirm('Delete this document?')) return;
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  var doc=c.documents[di];
  if(doc&&doc.path){ _storage.ref(doc.path).delete().catch(function(){}); }
  c.documents.splice(di,1); save(); closeModal(); openCompany(cid);
}

// ── Company form ──────────────────────────────────────────────────────────────
function openCompanyForm(id){
  if(!isAdmin()) return;
  var c=id?data.companies.find(function(x){return x.id===id;}):null;
  window._fSH=c?JSON.parse(JSON.stringify(c.shareholders)):[];
  var h='<div class="modal-header"><div class="modal-title">'+(c?t('editCompany')+' Company':t('addCompany'))+'</div><button class="close-btn" onclick="closeModal()">x</button></div>';
  h+='<div class="modal-body"><div class="fsec"><div class="fsec-title">'+t('details')+'</div><div class="form-grid">';
  h+='<div class="form-group full"><label class="lbl">'+t('name')+'</label><input id="f-name" class="inp" value="'+esc(c?c.name:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('jurisdiction')+'</label><input id="f-jur" class="inp" list="jl" value="'+esc(c?c.jurisdiction:'')+'"><datalist id="jl"><option>BVI</option><option>Uruguay</option><option>Singapore</option><option>USA</option><option>Panama</option><option>Ecuador</option><option>Cayman Islands</option></datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('status')+'</label><select id="f-status" class="inp"><option value="active"'+(c&&c.status==='active'?' selected':'')+'>'+t('active')+'</option><option value="liquidated"'+(c&&c.status==='liquidated'?' selected':'')+'>'+t('liquidated')+'</option><option value="liquidation"'+(c&&c.status==='liquidation'?' selected':'')+'>'+t('liquidation')+'</option></select></div>';
  h+='<div class="form-group"><label class="lbl">Type of Company</label><select id="f-company-type" class="inp"><option value="">— Select type —</option>';
  CO_TYPES.forEach(function(tp){h+='<option value="'+esc(tp)+'"'+((c&&c.companyType===tp)?' selected':'')+'>'+esc(tp)+'</option>';});
  h+='</select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('yearFounded')+'</label><input id="f-year" class="inp" value="'+esc(c?(c.yearFounded||c.year||''):'')+'" placeholder="'+t('dateHelp')+'"><span style="font-size:11px;color:var(--text3)">'+t('dateHelp')+'</span></div>';
  h+='<div class="form-group"><label class="lbl">'+t('purpose')+'</label><input id="f-purpose" class="inp" list="pl" value="'+esc(c?c.purpose:'')+'"><datalist id="pl"><option>Holding</option><option>Operating</option><option>IP / Royalties</option><option>Real Estate</option></datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('tags')+'</label><input id="f-tags" class="inp" value="'+esc(c?c.tags:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('fiscalId')+'</label><input id="f-fiscal" class="inp" value="'+esc(c?c.fiscalId:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">EIN</label><input id="f-ein" class="inp" value="'+esc(c?c.ein:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('irs')+'</label><input id="f-irs" class="inp" value="'+esc(c?c.irs:'')+'"></div>';
  var _knownDirectors=[...new Set(data.companies.map(function(x){return x.director;}).filter(Boolean))].sort(); var _directorOpts=_knownDirectors.map(function(d){return '<option value="'+esc(d)+'">'+esc(d)+'</option>';}).join(''); h+='<div class="form-group"><label class="lbl">'+t('director')+'</label><input id="f-director" class="inp" list="director-list" value="'+esc(c?c.director:'')+'"><datalist id="director-list">'+_directorOpts+'</datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('registeredAgent')+'</label><input id="f-agent" class="inp" value="'+esc(c?c.agent:'')+'"></div>';
  h+='<div class="form-group full"><label class="lbl">'+t('address')+'</label><textarea id="f-address" class="inp">'+esc(c?c.address:'')+'</textarea></div>';
  h+='<div class="form-group full"><label class="lbl">'+t('notes')+'</label><textarea id="f-notes" class="inp">'+esc(c?c.notes:'')+'</textarea></div>';
  h+='</div></div><div class="fsec"><div class="fsec-title">'+t('shareholders2')+'</div><div id="sh-list-form"></div>';
  h+='<div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-outline btn-sm" onclick="addSHRowForm(\'individual\')">'+t('addShareholder')+'</button><button class="btn btn-outline btn-sm" onclick="addSHRowForm(\'company\')">+ '+t('company')+'</button></div></div>';
  var saveId=id?q(id):"''";
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;padding-top:14px;border-top:1px solid var(--border)"><button class="btn btn-outline" onclick="closeModal()">'+t('cancel')+'</button><button class="btn btn-primary" onclick="saveCompany('+saveId+')">'+t('save')+'</button></div></div>';
  showModal(h); renderSHListForm();
}
function renderSHListForm(){
  var el=document.getElementById('sh-list-form'); if(!el) return;
  // Build datalists once — one for known individuals, one for known companies
  var knownIndiv=[...new Set(data.companies.reduce(function(a,c){
    c.shareholders.forEach(function(s){ if(s.type==='individual'&&s.person) a.push(s.person); });
    return a;
  },[]))].sort();
  var knownCo=data.companies.map(function(x){return {id:x.id,name:x.name};});
  var dlIndiv=knownIndiv.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  var dlCo=knownCo.map(function(x){return '<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>';}).join('');
  var h='';
  h+='<datalist id="sh-known-names">'+dlIndiv+'</datalist>';
  h+='<datalist id="sh-known-companies">'+dlCo+'</datalist>';
  window._fSH.forEach(function(s,i){
    // For company-type, store the display name in person field temporarily;
    // saveCompany resolves it back to an ID or creates a new company.
    var coDisplayVal = s.type==='company' ? (cname(s.person)===s.person ? s.person : cname(s.person)) : '';
    h+='<div class="sh-form-row">';
    h+='<span style="font-size:11px;color:var(--text3);font-weight:600">'+(s.type==='company'?'Co':'P')+'</span>';
    if(s.type==='company'){
      // Company: text input + datalist of existing company names — type freely to create new
      h+='<input id="fsh-person-'+i+'" list="sh-known-companies" value="'+esc(coDisplayVal)+'" placeholder="Company name or select..." style="padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;width:100%">';
    } else {
      // Individual: text input + datalist of existing names — type freely to create new
      h+='<input id="fsh-person-'+i+'" list="sh-known-names" value="'+esc(s.person)+'" placeholder="Name or select..." style="padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;width:100%">';
    }
    h+='<input id="fsh-pct-'+i+'" value="'+s.pct+'" type="number" min="0" max="100" placeholder="%" style="padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;width:100%">';
    h+='<input id="fsh-class-'+i+'" value="'+esc(s.class||'')+'" placeholder="Class" style="padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;width:100%">';
    h+='<button class="btn btn-danger btn-sm" onclick="removeSHRow('+i+')">x</button>';
    h+='</div>';
  });
  el.innerHTML=h;
}
// Sync all current DOM values into _fSH before any structural change.
// For company-type rows, the input holds a display name — resolve to ID here.
// If the typed name doesn't match any existing company, create a new stub company.
function syncSHFromDOM(){
  window._fSH.forEach(function(s,idx){
    var pp=document.getElementById('fsh-person-'+idx);
    var pc=document.getElementById('fsh-pct-'+idx);
    var cl=document.getElementById('fsh-class-'+idx);
    if(pc) s.pct=parseFloat(pc.value)||0;
    if(cl) s.class=cl.value.trim();
    if(pp){
      var raw=pp.value.trim();
      if(s.type==='company'){
        // Try to find existing company by name
        var match=data.companies.find(function(x){ return x.name.toLowerCase()===raw.toLowerCase(); });
        if(match){
          s.person=match.id;
        } else if(raw){
          // Create a minimal new company and store its id
          var newId=uid();
          data.companies.push({id:newId,name:raw,jurisdiction:'',purpose:'',yearFounded:'',fiscalId:'',ein:'',irs:'',director:'',agent:'',address:'',status:'active',tags:'',notes:'',shareholders:[],banking:[],custom:[],documents:[]});
          s.person=newId;
        }
      } else {
        s.person=raw;
      }
    }
  });
}
function removeSHRow(i){ syncSHFromDOM(); window._fSH.splice(i,1); renderSHListForm(); }
function addSHRowForm(tp){ syncSHFromDOM(); window._fSH.push({id:uid(),person:'',pct:0,class:'',type:tp}); renderSHListForm(); }
function saveCompany(id){
  syncSHFromDOM(); // read all field values from DOM into _fSH before saving
  var banking=id?(data.companies.find(function(c){return c.id===id;})||{banking:[]}).banking:[];
  var custom=id?(data.companies.find(function(c){return c.id===id;})||{custom:[]}).custom:[];
  var documents=id?(data.companies.find(function(c){return c.id===id;})||{documents:[]}).documents:[];
  var obj={id:id||uid(),name:gv('f-name'),jurisdiction:gv('f-jur'),status:gv('f-status'),companyType:gv('f-company-type'),yearFounded:gv('f-year'),
    purpose:gv('f-purpose'),tags:gv('f-tags'),fiscalId:gv('f-fiscal'),ein:gv('f-ein'),irs:gv('f-irs'),
    director:gv('f-director'),agent:gv('f-agent'),address:gv('f-address'),notes:gv('f-notes'),
    shareholders:window._fSH,banking:banking,custom:custom,documents:documents};
  if(id){var i=data.companies.findIndex(function(c){return c.id===id;});if(i>-1)data.companies[i]=obj;}
  else data.companies.push(obj);
  save(); closeModal(); render();
}
function delCompany(id){
  if(!isAdmin()) return;
  if(!confirm(t('confirmDelete'))) return;
  data.companies=data.companies.filter(function(c){return c.id!==id;});
  data.investments.forEach(function(i){
var remaining=invCoIds(i).filter(function(x){return x!==id;});
i.companyIds=remaining;
i.companyId=remaining[0]||'';
});
data.investments=data.investments.filter(function(i){return invCoIds(i).length>0;});
  save(); render();
}

// ── Investments ───────────────────────────────────────────────────────────────
var invSearch='',invFundF='',invTypeF='',invCoF='',invSort='';
function renderInvestments(){
  var inv=data.investments.filter(function(i){
    var q2=invSearch.toLowerCase();
    return(!q2||(i.name+(i.fund||'')+i.type+cnamesList(invCoIds(i)).join(' ')).toLowerCase().includes(q2))
      &&(!invFundF||i.fund===invFundF)&&(!invTypeF||i.type===invTypeF)&&(!invCoF||invCoIds(i).indexOf(invCoF)!==-1);
  });
  if(invSort==='asc') inv=inv.slice().sort(function(a,b){return a.name.toLowerCase()<b.name.toLowerCase()?-1:a.name.toLowerCase()>b.name.toLowerCase()?1:0;});
  else if(invSort==='desc') inv=inv.slice().sort(function(a,b){return a.name.toLowerCase()>b.name.toLowerCase()?-1:a.name.toLowerCase()<b.name.toLowerCase()?1:0;});
  var funds=[...new Set(data.investments.map(function(i){return i.fund;}).filter(Boolean))].sort();
  var types=[...new Set(data.investments.map(function(i){return i.type;}).filter(Boolean))].sort();
  var totalMV=inv.reduce(function(a,i){return a+(+i.marketValue||0);},0);
  var totalC=inv.reduce(function(a,i){return a+(+i.commitment||0);},0);
  var totalCallsSum=inv.reduce(function(a,i){return a+(+i.calls||0);},0);
  var totalD=inv.reduce(function(a,i){return a+(+i.distributions||0);},0);
  var totalE=inv.reduce(function(a,i){return a+(+i.expenses||0);},0);
  var h=roBanner();
  h+='<div class="section-header"><div class="section-title">'+t('investments')+' <span style="color:var(--text3);font-weight:400;font-size:14px">('+data.investments.length+')</span></div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
  if(isAdmin()) h+='<button class="btn btn-teal btn-sm" onclick="openInvImport()">⬆ Import Excel</button>';
  if(isAdmin()) h+='<button class="btn btn-primary" onclick="openInvForm(null,null)">'+t('addInvestment')+'</button>';
  if(isAdmin()) h+='<button class="btn btn-danger btn-sm" id="bulk-delete-inv-btn" onclick="bulkDeleteInvestments()" style="display:none;margin-left:8px">'+t('bulkDelete')+'</button>';
  h+='</div></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:18px">';
  h+='<div class="kpi"><div class="kpi-label">'+t('invMV')+'</div><div class="kpi-val" style="font-size:20px">'+fmtD(totalMV)+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('invCommit')+'</div><div class="kpi-val" style="font-size:20px">'+fmtD(totalC)+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('invCalls')+'</div><div class="kpi-val" style="font-size:20px;color:var(--blue)">'+fmtD(totalCallsSum)+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('invDist')+'</div><div class="kpi-val" style="font-size:20px;color:var(--teal)">'+fmtD(totalD)+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label">'+t('invExpenses')+'</div><div class="kpi-val" style="font-size:20px;color:var(--coral)">'+fmtD(totalE)+'</div></div>';
  h+='<div class="kpi"><div class="kpi-label"># Investments</div><div class="kpi-val" style="font-size:20px">'+data.investments.length+'</div></div></div>';
  h+='<div class="charts-row" style="grid-template-columns:1fr 1fr;margin-bottom:18px">';
  h+='<div class="chart-card"><div class="chart-title">'+t('byFund')+'</div><div class="chart-wrap"><canvas id="inv-fund-chart"></canvas></div></div>';
  h+='<div class="chart-card"><div class="chart-title">'+t('byType')+'</div><div class="chart-wrap"><canvas id="inv-type-chart"></canvas></div></div></div>';
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" id="inv-search-input" placeholder="'+t('search')+'" value="'+esc(invSearch)+'" oninput="invSearch=this.value;rerenderMain()"></div>';
  h+='<select class="filter" id="inv-fund-filter" onchange="invFundF=this.value;rerenderMain()"><option value="">'+t('allFunds')+'</option>';
  funds.forEach(function(f){h+='<option value="'+esc(f)+'"'+(invFundF===f?' selected':'')+'>'+esc(f)+'</option>';});
  h+='</select><select class="filter" id="inv-type-filter" onchange="invTypeF=this.value;rerenderMain()"><option value="">'+t('allTypes')+'</option>';
types.forEach(function(t2){h+='<option value="'+esc(t2)+'"'+(invTypeF===t2?' selected':'')+'>'+esc(t2)+'</option>';});
h+='</select><select class="filter" id="inv-co-filter" onchange="invCoF=this.value;rerenderMain()"><option value="">'+(lang==='en'?'All Companies':'Todas las Empresas')+'</option>';
data.companies.slice().sort(function(a,b){return a.name.toLowerCase()<b.name.toLowerCase()?-1:1;}).forEach(function(co){h+='<option value="'+co.id+'"'+(invCoF===co.id?' selected':'')+'>'+esc(co.name)+'</option>';});
h+='</select></div>';
  h+='<div class="card" style="padding:0"><div class="inv-table-wrap"><table class=\'inv-table\'><thead><tr><th style=\'width:36px\'><input type=\'checkbox\' id=\'inv-select-all\' onclick=\'toggleAllInvSelect(this)\' style=\'cursor:pointer\'></th><th>'+t('invName')+'</th><th>'+t('invFund')+'</th><th>'+t('invCompany')+'</th><th>'+t('invType')+'</th><th>'+t('invCommit')+'</th><th>'+t('invMV')+'</th><th>'+t('invCalls')+'</th><th>'+t('invDist')+'</th><th>'+t('invExpenses')+'</th><th>'+t('invStatus')+'</th><th></th></tr></thead><tbody>';
  if(!inv.length){ h+='<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text3)">'+t('noData')+'</td></tr>'; }
  else { inv.forEach(function(i){
    h+='<tr><td style="text-align:center"><input type="checkbox" class="inv-checkbox" data-id="'+i.id+'" onchange="updateBulkDeleteBtn()"></td><td style="font-weight:600">'+esc(i.name)+'</td>';
    h+='<td>'+(i.fund?'<span class="badge badge-fund">'+esc(i.fund)+'</span>':'—')+'</td>';
    h+='<td>'+invCoBadges(invCoIds(i))+'</td>';
    h+='<td><span class="badge badge-inv">'+esc(i.type||'—')+'</span></td>';
    h+='<td style="font-weight:600">'+fmtD(i.commitment||0)+'</td><td>'+fmtD(i.marketValue)+'</td><td>'+fmtD(i.calls)+'</td>';
    h+='<td style="color:var(--teal)">'+fmtD(i.distributions)+'</td>';
    h+='<td style="color:var(--coral)">'+fmtD(i.expenses||0)+'</td>';
    h+='<td>'+(i.status?'<span class="badge badge-active">'+esc(i.status)+'</span>':'—')+'</td>';
    h+='<td style="white-space:nowrap">';
    if(isAdmin()){
      h+='<button class="btn btn-outline btn-sm" onclick="openInvForm('+q(i.id)+',null)" style="margin-right:4px">'+t('editCompany')+'</button>';
      h+='<button class="btn btn-danger btn-sm" onclick="delInv('+q(i.id)+')">x</button>';
    }
    h+='</td></tr>';
  }); }
  h+='</tbody></table></div></div>';
  return h;
}
function buildInvCharts(){
  var inv=data.investments;
  var fm={}; inv.forEach(function(i){var k=i.fund||'Other';fm[k]=(fm[k]||0)+(+i.marketValue||0);});
  mkChart('inv-fund-chart','doughnut',Object.keys(fm),Object.values(fm));
  var tm={}; inv.forEach(function(i){var k=i.type||'Other';tm[k]=(tm[k]||0)+(+i.marketValue||0);});
  mkChart('inv-type-chart','doughnut',Object.keys(tm),Object.values(tm));
}
function openInvForm(id,defaultCo){
  var inv=id?data.investments.find(function(x){return x.id===id;}):null;
  window._fInvFields=inv?JSON.parse(JSON.stringify(inv.fields||[])):[];
  window._fInvCoIds=inv?invCoIds(inv).slice():(defaultCo?[defaultCo]:[]);
  var h='<div class="modal-header"><div class="modal-title">'+(inv?(lang==='en'?'Edit Investment':'Editar Inversi�n'):t('addInvestment'))+'</div><button class="close-btn" onclick="closeModal()">�</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group full"><label class="lbl">'+t('invName')+'</label><input id="iv-name" class="inp" value="'+esc(inv?inv.name:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invFund')+'</label><input id="iv-fund" class="inp" list="fund-list" value="'+esc(inv?inv.fund:'')+'"><datalist id="fund-list">';
  var knownFunds=[...new Set(data.investments.map(function(i){return i.fund;}).filter(Boolean))];
  knownFunds.forEach(function(f){h+='<option>'+esc(f)+'</option>';});
  h+='</datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invFamily')+'</label><input id="iv-family" class="inp" value="'+esc(inv?inv.family:'')+'"></div>';
  h+='<div class="form-group full"><label class="lbl">'+t('invCompany')+'</label>';
h+='<div id="iv-co-chips" class="tag-chip-wrap" style="margin-bottom:6px"></div>';
h+='<input id="iv-co-input" class="inp" list="iv-co-datalist" placeholder="'+(lang==='en'?'Type a company name and press Enter to add...':'Escribe el nombre de una empresa y presiona Enter...')+'" onkeydown="ivCoInputKeydown(event)">';
h+='<datalist id="iv-co-datalist">';
data.companies.forEach(function(c){h+='<option value="'+esc(c.name)+'">';});
h+='</datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invType')+'</label><input id="iv-type" class="inp" list="inv-types" value="'+esc(inv?inv.type:'')+'"><datalist id="inv-types"><option>Equity</option><option>Real Estate</option><option>Fund</option><option>Bond</option><option>Crypto</option><option>Loan</option><option>Other</option></datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invStatus')+'</label><select id="iv-status" class="inp"><option value="active"'+(inv&&inv.status==='active'?' selected':'')+'>Active</option><option value="exited"'+(inv&&inv.status==='exited'?' selected':'')+'>Exited</option><option value="pending"'+(inv&&inv.status==='pending'?' selected':'')+'>Pending</option></select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invCommit')+' (USD)</label><input id="iv-commit" class="inp" type="number" value="'+((inv&&inv.commitment)||'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invCalls')+' (USD)</label><input id="iv-calls" class="inp" type="number" value="'+((inv&&inv.calls)||'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invDist')+' (USD)</label><input id="iv-dist" class="inp" type="number" value="'+((inv&&inv.distributions)||'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invMV')+' (USD)</label><input id="iv-mv" class="inp" type="number" value="'+((inv&&inv.marketValue)||'')+'"></div>';
  h+='<div class="form-group full"><label class="lbl">'+t('invNotes')+'</label><textarea id="iv-notes" class="inp">'+esc(inv?inv.notes:'')+'</textarea></div>';
  h+='</div><div class="fsec" style="margin-top:14px"><div class="fsec-title">'+t('customFields')+'</div><div id="inv-fields-list"></div>';
  h+='<button class="btn btn-outline btn-sm" onclick="addInvField()">'+t('addField')+'</button></div>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;padding-top:14px;border-top:1px solid var(--border);margin-top:14px">';
  h+='<button class="btn btn-outline" onclick="closeModal()">'+t('cancel')+'</button>';
  var saveInvId=id?q(id):"''";
  h+='<button class="btn btn-primary" onclick="saveInv('+saveInvId+')">'+t('save')+'</button></div></div>';
  showModal(h);
renderInvFields();
renderInvCoChips();
}
function renderInvFields(){
  var el=document.getElementById('inv-fields-list');if(!el)return;
  var h='';
  window._fInvFields.forEach(function(f,i){
    h+='<div class="inv-field-row"><input class="inp" value="'+esc(f.name)+'" placeholder="'+t('fieldName')+'" oninput="_fInvFields['+i+'].name=this.value">';
    h+='<input class="inp" value="'+esc(f.value)+'" placeholder="'+t('fieldValue')+'" oninput="_fInvFields['+i+'].value=this.value">';
    h+='<button class="btn btn-danger btn-sm" onclick="_fInvFields.splice('+i+',1);renderInvFields()">�</button></div>';
  });
  el.innerHTML=h;
}
function addInvField(){window._fInvFields.push({id:uid(),name:'',value:''});renderInvFields();}
function renderInvCoChips(){
var el=document.getElementById('iv-co-chips'); if(!el) return;
var ids=window._fInvCoIds||[];
if(!ids.length){ el.innerHTML='<span style="font-size:12px;color:var(--text3)">'+(lang==='en'?'No companies linked yet.':'Sin empresas vinculadas.')+'</span>'; return; }
var h='';
ids.forEach(function(id,idx){
h+='<span class="sh-chip">'+esc(cname(id))+' <button type="button" onclick="removeInvCo('+idx+')" style="border:none;background:none;color:inherit;cursor:pointer;font-weight:700;margin-left:3px;padding:0">�</button></span>';
});
el.innerHTML=h;
}
function removeInvCo(idx){ window._fInvCoIds.splice(idx,1); renderInvCoChips(); }
function ivCoInputKeydown(e){
if(e.key!=='Enter') return;
e.preventDefault();
var inp=document.getElementById('iv-co-input'); if(!inp) return;
var raw=inp.value.trim(); if(!raw) return;
var match=data.companies.find(function(c){return c.name.toLowerCase()===raw.toLowerCase();});
var id;
if(match){ id=match.id; } else { id=uid(); data.companies.push({id:id,name:raw,jurisdiction:'',purpose:'',yearFounded:'',fiscalId:'',ein:'',irs:'',director:'',agent:'',address:'',status:'active',tags:'',notes:'',shareholders:[],banking:[],custom:[],documents:[]}); }
if(!window._fInvCoIds) window._fInvCoIds=[];
if(window._fInvCoIds.indexOf(id)===-1) window._fInvCoIds.push(id);
inp.value='';
renderInvCoChips();
}
function saveInv(id){
  var _coIds=(window._fInvCoIds||[]).slice();
var obj={id:id||uid(),companyIds:_coIds,companyId:_coIds[0]||'',name:gv('iv-name'),fund:gv('iv-fund'),family:gv('iv-family'),
type:gv('iv-type'),status:gv('iv-status'),
commitment:parseFloat(gv('iv-commit'))||0,calls:parseFloat(gv('iv-calls'))||0,
distributions:parseFloat(gv('iv-dist'))||0,marketValue:parseFloat(gv('iv-mv'))||0,
notes:gv('iv-notes'),fields:window._fInvFields};
  if(id){var i=data.investments.findIndex(function(x){return x.id===id;});if(i>-1)data.investments[i]=obj;}
  else data.investments.push(obj);
  save();closeModal();render();
}
function openInvImport(){
  var h='<div class="modal-header"><div class="modal-title">Import Investments</div><button class="close-btn" onclick="closeModal()">�</button></div>';
  h+='<div class="modal-body"><div class="import-hint">'+(lang==='en'?'Upload any CSV or Excel file with investment data. Map columns to fields, then import.':'Sube un archivo CSV o Excel con inversiones. Mapea columnas e importa.')+'</div>';
  h+='<div class="drop-zone" onclick="document.getElementById(\'finv\').click()" ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'" ondragleave="this.style.borderColor=\'\'" ondrop="event.preventDefault();this.style.borderColor=\'\';handleInvImportDrop(event)">';
  h+='<div style="font-size:28px;margin-bottom:6px">&#128194;</div><div style="font-weight:600">Click or drag &amp; drop</div>';
  h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">.xlsx � .xls � .csv</div>';
  h+='<input id="finv" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleInvImportFile(this)"></div>';
  h+='<div id="inv-map-area"></div><div id="inv-preview-area"></div></div>';
  showModal(h,true);
}
function handleInvImportFile(inp){ var f=inp.files[0]; if(f) readInvImportFile(f); }
function handleInvImportDrop(e){ var f=e.dataTransfer.files[0]; if(f) readInvImportFile(f); }
function readInvImportFile(f){
  var isXL=/\.xlsx?$/i.test(f.name); var isCSV=/\.csv$/i.test(f.name);
  if(!isXL&&!isCSV){alert('Unsupported file type. Please upload a .xlsx, .xls, or .csv file.');return;}
  var r=new FileReader();
  r.onload=function(e){ try{ var rows; if(isXL){var wb=XLSX.read(e.target.result,{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});}else rows=parseCSVRaw(e.target.result); if(!rows||!rows.length){alert('The file appears to be empty.');return;} showInvImportMapping(rows); }catch(err){alert('Could not read file: '+err.message);} };
  r.onerror=function(){alert('Failed to read the file. Please try again.');};
  if(isXL) r.readAsArrayBuffer(f); else r.readAsText(f,'UTF-8');
}
var INV_FIELDS=['name','fund','family','company','type','commitment','calls','distributions','marketValue','expenses'];
var INV_FIELD_LABELS={name:'Investment Name',fund:'Family Fund',family:'Family',company:'Company (separate multiple with ; )',type:'Type',commitment:'Total Commitment',calls:'Capital Calls',distributions:'Distributions',marketValue:'Market Value',expenses:'Expenses/Fees'};
var INV_FIELD_KW={name:['name','nombre','investment'],fund:['fund','fondo','familia fund'],family:['family','familia'],company:['company','empresa','compan'],type:['type','tipo'],commitment:['commit','compromi'],calls:['call','capital call','llamada'],distributions:['distrib'],marketValue:['market','valor','mv','nav'],expenses:['expense','fee','gasto']};
function showInvImportMapping(rows){
  if(!rows||rows.length<2){alert('Need at least 2 rows');return;}
  window._invImportRows=rows; var headers=rows[0].map(function(h){return String(h||'').trim();});
  window._invImportHeaders=headers;
  var mapped={}; var heads=headers.map(function(h){return h.toLowerCase();});
  INV_FIELDS.forEach(function(f){ var kws=INV_FIELD_KW[f]||[]; kws.forEach(function(k){ if(!mapped[f]){for(var i=0;i<heads.length;i++){if(heads[i].includes(k)){mapped[f]=headers[i];break;}}} }); });
  window._invImportMapping=mapped;
  var ma=document.getElementById('inv-map-area'); if(!ma) return;
  var mh='<div class="fsec" style="margin-top:16px"><div class="fsec-title">Column Mapping</div>';
  mh+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  INV_FIELDS.forEach(function(f){
    mh+='<div style="display:flex;align-items:center;gap:8px;font-size:12px"><div style="min-width:130px;font-weight:600;color:var(--text2)">'+INV_FIELD_LABELS[f]+'</div>';
    mh+='<select id="invmap-'+f+'" style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none"><option value="">— skip —</option>';
    headers.forEach(function(h){mh+='<option value="'+esc(h)+'"'+(mapped[f]===h?' selected':'')+'>'+esc(h)+'</option>';});
    mh+='</select></div>';
  });
  mh+='</div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn-primary btn-sm" onclick="buildInvImportPreview()">Preview Data</button></div></div>';
  ma.innerHTML=mh;
}
function buildInvImportPreview(){
  var headers=window._invImportHeaders||[]; var rows=window._invImportRows||[];
  INV_FIELDS.forEach(function(f){var sel=document.getElementById('invmap-'+f);if(sel){window._invImportMapping[f]=sel.value||'';}});
  var mapped=window._invImportMapping||{}; var preview=[];
  for(var i=1;i<rows.length;i++){
    var cols=rows[i];
    var nameCol=mapped['name'];var nameIdx=nameCol?headers.indexOf(nameCol):-1;
    if(nameIdx<0||!String(cols[nameIdx]||'').trim()) continue;
    preview.push(cols);
  }
  var pa=document.getElementById('inv-preview-area'); if(!pa) return;
  var ph='<div class="fsec" style="margin-top:16px"><div class="fsec-title">Preview ('+preview.length+' rows)</div>';
  ph+='<div class="import-table-wrap"><table class="import-table"><thead><tr>';
  ph+='<th>'+INV_FIELD_LABELS['name']+'</th><th>'+INV_FIELD_LABELS['fund']+'</th><th>'+INV_FIELD_LABELS['company']+'</th><th>'+INV_FIELD_LABELS['type']+'</th><th>'+INV_FIELD_LABELS['commitment']+'</th><th>'+INV_FIELD_LABELS['marketValue']+'</th><th>'+INV_FIELD_LABELS['calls']+'</th><th>'+INV_FIELD_LABELS['distributions']+'</th>';
  ph+='</tr></thead><tbody>';
  preview.forEach(function(row){
    function cv2(f){var col=mapped[f];if(!col)return '—';var idx=headers.indexOf(col);return idx>-1?esc(String(row[idx]||'').trim())||'—':'—';}
    ph+='<tr><td>'+cv2('name')+'</td><td>'+cv2('fund')+'</td><td>'+cv2('company')+'</td><td>'+cv2('type')+'</td><td>'+cv2('commitment')+'</td><td>'+cv2('marketValue')+'</td><td>'+cv2('calls')+'</td><td>'+cv2('distributions')+'</td></tr>';
  });
  ph+='</tbody></table></div>';
  ph+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">';
  ph+='<button class="btn btn-primary" onclick="confirmInvImport()">Import All '+preview.length+' Rows</button>';
  ph+='</div></div>';
  pa.innerHTML=ph;
}

function confirmInvImport(){
  var headers=window._invImportHeaders||[];
  var rows=(_invImportRows||[]).slice(1);
  var mapped=window._invImportMapping||{};
  var imported=0, updated=0, skipped=0;
  if(!mapped['name']){
    setTimeout(function(){alert('Please map the Investment Name column before importing.');},100);
    return;
  }
  rows.forEach(function(row){
    function cv(k){var col=mapped[k];if(!col)return '';var idx=headers.indexOf(col);return idx>-1?String(row[idx]||'').trim():'';}
    var name=cv('name');
    if(!name){skipped++;return;}
    // Resolve or create companies (supports multiple, separated by ; or |)
var coNameRaw=cv('company');
var coNames=coNameRaw?coNameRaw.split(/[;|]/).map(function(s){return s.trim();}).filter(Boolean):[];
var coIds=coNames.map(function(nm){
var match=data.companies.find(function(c){return c.name.toLowerCase()===nm.toLowerCase();});
if(match) return match.id;
var newId=uid();
data.companies.push({id:newId,name:nm,jurisdiction:'',purpose:'',yearFounded:'',fiscalId:'',ein:'',irs:'',director:'',agent:'',address:'',status:'active',tags:'',notes:'',shareholders:[],banking:[],custom:[],documents:[]});
return newId;
});
    // Parse numbers — strip currency symbols and commas
    function parseNum(v){return parseFloat(String(v).replace(/[^0-9.\-]/g,''))||0;}
    var existing=data.investments.find(function(inv){return inv.name.trim().toLowerCase()===name.toLowerCase()&&sameIdSet(invCoIds(inv),coIds);});
    var commitVal=parseNum(cv('commitment'));
    if(existing){
      var changed=false;
      if(cv('fund')&&existing.fund!==cv('fund')){existing.fund=cv('fund');changed=true;}
      if(cv('type')&&existing.type!==cv('type')){existing.type=cv('type');changed=true;}
      if(cv('family')&&existing.family!==cv('family')){existing.family=cv('family');changed=true;}
      if(commitVal&&existing.commitment!==commitVal){existing.commitment=commitVal;changed=true;}
      if(cv('calls')&&existing.calls!==parseNum(cv('calls'))){existing.calls=parseNum(cv('calls'));changed=true;}
      if(cv('distributions')&&existing.distributions!==parseNum(cv('distributions'))){existing.distributions=parseNum(cv('distributions'));changed=true;}
      if(cv('marketValue')&&existing.marketValue!==parseNum(cv('marketValue'))){existing.marketValue=parseNum(cv('marketValue'));changed=true;}
    if(cv('expenses')&&existing.expenses!==parseNum(cv('expenses'))){existing.expenses=parseNum(cv('expenses'));changed=true;}
      if(changed){updated++;}else{skipped++;}
    } else {
      data.investments.push({id:uid(),companyIds:coIds,companyId:coIds[0]||'',name:name,fund:cv('fund'),family:cv('family'),type:cv('type'),status:'active',commitment:commitVal,calls:parseNum(cv('calls')),distributions:parseNum(cv('distributions')),marketValue:parseNum(cv('marketValue')),notes:'',expenses:parseNum(cv('expenses')),fields:[]});
      imported++;
    }
  });
  save();
  closeModal();
  render();
  setTimeout(function(){
    alert('Import complete: '+imported+' added'+(updated?' | '+updated+' updated':'')+(skipped?' | '+skipped+' skipped (no name)':'')+'.');
  },100);
}
function delInv(id){ if(!confirm(t('confirmDelete')||'Delete this investment? Cannot be undone.')) return; data.investments=data.investments.filter(function(x){return x.id!==id;}); save(); render(); }
function toggleAllCoSelect(cb){
  document.querySelectorAll('.co-checkbox').forEach(function(c){c.checked=cb.checked;});
  updateBulkDeleteCoBtn();
}
function updateBulkDeleteCoBtn(){
  var btn=document.getElementById('bulk-delete-co-btn');
  if(!btn) return;
  var checked=document.querySelectorAll('.co-checkbox:checked').length;
  btn.style.display=checked>0?'inline-flex':'none';
  var selAll=document.getElementById('co-select-all');
  if(selAll){var total=document.querySelectorAll('.co-checkbox').length;selAll.indeterminate=checked>0&&checked<total;selAll.checked=checked===total&&total>0;}
}
function bulkDeleteCompanies(){
  var cbs=document.querySelectorAll('.co-checkbox:checked');
  if(!cbs.length) return;
  var ids=Array.from(cbs).map(function(c){return c.getAttribute('data-id');});
  if(!confirm(ids.length+' '+t('companies')+'?')) return;
  var batch=_db.batch();
  ids.forEach(function(id){batch.delete(_REF.collection('companies').doc(id));});
  batch.commit().then(function(){updateBulkDeleteCoBtn();}).catch(function(e){alert(e.message);});
}
function toggleAllShSelect(cb){
  document.querySelectorAll('.sh-checkbox').forEach(function(c){c.checked=cb.checked;});
  updateBulkShBtn();
}
function updateBulkShBtn(){
  var bar=document.getElementById('sh-bulk-bar');
  if(!bar) return;
  var checked=document.querySelectorAll('.sh-checkbox:checked').length;
  bar.style.display=checked>0?'flex':'none';
  var selAll=document.getElementById('sh-select-all');
  if(selAll){var total=document.querySelectorAll('.sh-checkbox').length;selAll.indeterminate=checked>0&&checked<total;selAll.checked=checked===total&&total>0;}
}
function bulkDeleteShareholders(){
  var cbs=document.querySelectorAll('.sh-checkbox:checked');
  if(!cbs.length) return;
  var names=Array.from(cbs).map(function(c){return c.getAttribute('data-name');});
  if(!confirm(names.length+' '+t('shareholders2')+'?')) return;
  var batch=_db.batch();
  data.companies.forEach(function(co){
    var changed=false;
    var newSh=co.shareholders.filter(function(s){if(s.type==='individual'&&names.indexOf(s.person)>=0){changed=true;return false;}return true;});
    if(changed)batch.update(_REF.collection('companies').doc(co.id),{shareholders:newSh});
  });
  batch.commit().then(function(){updateBulkShBtn();}).catch(function(e){alert(e.message);});
}
function bulkDeleteInvestments(){
  var cbs=document.querySelectorAll('.inv-checkbox:checked');
  if(!cbs.length){alert('No investments selected.');return;}
  if(!confirm('Delete '+cbs.length+' selected investment(s)? This cannot be undone.')) return;
  var ids=Array.from(cbs).map(function(cb){return cb.dataset.id;});
  data.investments=data.investments.filter(function(x){return ids.indexOf(x.id)===-1;});
  save(); render();
}
function toggleAllInvSelect(cb){
  document.querySelectorAll('.inv-checkbox').forEach(function(c){c.checked=cb.checked;});
  updateBulkDeleteBtn();
}
function updateBulkDeleteBtn(){
  var btn=document.getElementById('bulk-delete-inv-btn');
  if(!btn) return;
  var checked=document.querySelectorAll('.inv-checkbox:checked').length;
  btn.style.display=checked>0?'inline-flex':'none';
  var selAll=document.getElementById('inv-select-all');
  if(selAll){var total=document.querySelectorAll('.inv-checkbox').length;selAll.indeterminate=checked>0&&checked<total;selAll.checked=total>0&&checked===total;}
}

// ── Shareholders page ─────────────────────────────────────────────────────────
var shSearch='',shSel=null;
function renderShareholders(){
  var shSet=new Set(); data.companies.forEach(function(c){c.shareholders.forEach(function(s){if(s.type==='individual')shSet.add(s.person);});});
  var all=[...shSet].sort();
  var filtered=all.filter(function(p){return !shSearch||p.toLowerCase().includes(shSearch.toLowerCase());});
  var h='<div class="section-header"><div class="section-title">'+t('allShareholders')+' <span style="color:var(--text3);font-weight:400;font-size:14px">('+all.length+')</span></div></div>';
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" id="sh-search-input" placeholder="'+t('searchShareholder')+'" value="'+esc(shSearch)+'" oninput="shSearch=this.value;rerenderMain()"></div></div>';
  if(isAdmin()) h+='<div id="sh-bulk-bar" style="display:none;align-items:center;gap:8px;padding:6px 0"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="sh-select-all" onclick="toggleAllShSelect(this)">&nbsp;'+t('selectAll')+'</label><button class="btn btn-danger btn-sm" onclick="bulkDeleteShareholders()">'+t('deleteSelected')+'</button></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div>';
  filtered.forEach(function(p){
    var hs=data.companies.filter(function(c){return c.shareholders.some(function(s){return s.type==='individual'&&s.person===p;});});
    var avg=hs.length?Math.round(hs.reduce(function(a,c){var s=c.shareholders.find(function(s){return s.person===p;});return a+(s?s.pct:0);},0)/hs.length):0;
    h+='<div class="sh-card'+(shSel===p?' selected':'')+'" style="position:relative" onclick="shSel='+q(p)+';renderPage()"><label onclick="event.stopPropagation()" style="position:absolute;top:8px;right:8px;cursor:pointer"><input type="checkbox" class="sh-checkbox" data-name="'+esc(p)+'" onchange="updateBulkShBtn()"></label>';
    h+='<div style="font-weight:700;font-size:14px;margin-bottom:3px">'+esc(p)+'</div>';
    h+='<div style="font-size:12px;color:var(--text3)">'+t('holdingIn')+' '+hs.length+' '+t('companies2')+' � '+avg+'% '+t('pct')+'</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">';
    hs.slice(0,4).forEach(function(c){h+='<span class="holding-chip">'+esc(c.name)+'</span>';});
    if(hs.length>4) h+='<span class="holding-chip">+'+(hs.length-4)+'</span>';
    h+='</div></div>';
  });
  if(!filtered.length) h+='<div class="empty">'+t('noData')+'</div>';
  h+='</div><div>';
  if(shSel){
    var hs=data.companies.filter(function(c){return c.shareholders.some(function(s){return s.type==='individual'&&s.person===shSel;});});
    var init=shSel.split(' ').slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();
    h+='<div class="card"><div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    h+='<div style="width:44px;height:44px;border-radius:50%;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--accent)">'+init+'</div>';
    h+='<div><div style="font-weight:700;font-size:15px">'+esc(shSel)+'</div><div style="font-size:12px;color:var(--text3)">'+hs.length+' '+t('companies2')+'</div></div></div>';
    h+='<canvas id="shd-pie" style="max-height:150px;margin-bottom:14px"></canvas>';
    h+='<table><thead><tr><th>'+t('name')+'</th><th>'+t('jurisdiction')+'</th><th>'+t('ownership')+'</th></tr></thead><tbody>';
    hs.forEach(function(c){var sh=c.shareholders.find(function(s){return s.person===shSel;});
      h+='<tr style="cursor:pointer" onclick="go(\'companies\');setTimeout(function(){openCompany('+q(c.id)+')},50)">';
      h+='<td style="font-weight:600">'+esc(c.name)+'</td><td><span class="badge badge-jur">'+esc(c.jurisdiction)+'</span></td>';
      h+='<td style="font-weight:700;color:var(--accent)">'+sh.pct+'%</td></tr>';
    });
    h+='</tbody></table></div>';
    setTimeout(function(){if(hs.length)mkChart('shd-pie','doughnut',hs.map(function(c){return c.name.length>20?c.name.slice(0,20)+'...':c.name;}),hs.map(function(c){var s=c.shareholders.find(function(s){return s.person===shSel;});return s?s.pct:0;}));},50);
  } else {
    h+='<div class="card" style="display:flex;align-items:center;justify-content:center;height:220px;color:var(--text3)">Select a shareholder</div>';
  }
  h+='</div></div>';
  return h;
}

// ── Network ───────────────────────────────────────────────────────────────────
var _netSelected=null; var netSearch=''; var netSort='asc'; function toggleNetSort(){ netSort=netSort==='asc'?'desc':'asc'; rerenderMain(); }
function renderNetwork(){
  var cs=data.companies;
  cs=cs.filter(function(c){var q2=netSearch.toLowerCase();return !q2||c.name.toLowerCase().includes(q2);}); cs=cs.slice().sort(function(a,b){var an=(a.name||'').toLowerCase(),bn=(b.name||'').toLowerCase();var cmp=an<bn?-1:an>bn?1:0;return netSort==='desc'?-cmp:cmp;}); var h='<div class="section-header"><div class="section-title">'+t('networkTitle')+'</div></div>';
  h+='<div class="card" style="margin-bottom:12px;padding:10px 16px;font-size:12px;color:var(--text2)">';
  h+=lang==='en'?'Click any company to reveal its ownership relationships. Click again to collapse.':'Clic en una empresa para ver sus relaciones. Clic de nuevo para colapsar.';
  h+='</div>';
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" id="net-search-input" placeholder="'+t('search')+'" value="'+esc(netSearch)+'" oninput="netSearch=this.value;rerenderMain()"></div></div>'; h+='<div class="card" style="padding:0">';
  if(!cs.length){ h+='<div class="empty">'+t('noData')+'</div>'; }
  else {
    h+='<table><thead><tr><th style="cursor:pointer;user-select:none" onclick="toggleNetSort()">'+t('name')+' <span style="font-size:9px;color:var(--accent)">'+(netSort==='asc'?'▲':'▼')+'</span></th><th>'+t('jurisdiction')+'</th><th>'+t('status')+'</th><th>'+t('shareholders2')+'</th><th>'+t('subsidiaries')+'</th><th></th></tr></thead><tbody>';
    cs.forEach(function(c){
      var isSelected=_netSelected===c.id;
      var subs=getSubs(c.id);
      h+='<tr style="cursor:pointer;'+(isSelected?'background:var(--accent-bg)':'')+'" onclick="netToggle('+q(c.id)+')">';
      h+='<td style="font-weight:700;color:'+(isSelected?'var(--accent)':'var(--text)')+'">'+esc(c.name)+'</td>';
      h+='<td><span class="badge badge-jur">'+esc(c.jurisdiction)+'</span></td>';
      h+='<td>'+sBadge(c.status)+'</td>';
      h+='<td style="font-size:12px;color:var(--text2)">'+c.shareholders.length+'</td>';
      h+='<td style="font-size:12px;color:var(--text2)">'+subs.length+'</td>';
      h+='<td style="font-size:12px;color:var(--text3)">'+(isSelected?'▴ collapse':'▾ expand')+'</td></tr>';
      if(isSelected){
        var indivSH=c.shareholders.filter(function(s){return s.type==='individual';});
        var companySH=c.shareholders.filter(function(s){return s.type==='company';});
        h+='<tr><td colspan="6" style="padding:0;border-bottom:2px solid var(--accent)">';
        h+='<div style="padding:16px 18px;background:var(--accent-bg);display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">';
        h+='<div><div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;margin-bottom:8px">Individual Owners</div>';
        if(indivSH.length){ indivSH.forEach(function(s){ h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#fff;border-radius:var(--radius-xs);margin-bottom:5px;border:1px solid var(--border)"><span style="font-weight:600;font-size:13px">'+esc(s.person)+'</span><span style="font-weight:700;color:var(--amber)">'+s.pct+'%</span></div>'; }); }
        else { h+='<div style="font-size:12px;color:var(--text3)">—</div>'; }
        h+='</div>';
        h+='<div><div style="font-size:11px;font-weight:700;color:var(--purple);text-transform:uppercase;margin-bottom:8px">Company Owners</div>';
        if(companySH.length){ companySH.forEach(function(s){ h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#fff;border-radius:var(--radius-xs);margin-bottom:5px;border:1.5px solid var(--purple);cursor:pointer" onclick="openCompany('+q(s.person)+')"><span style="font-weight:600;font-size:13px;color:var(--purple)">'+esc(resolveOwner(s))+'</span><span style="font-weight:700;color:var(--purple)">'+s.pct+'%</span></div>'; }); }
        else { h+='<div style="font-size:12px;color:var(--text3)">Root company</div>'; }
        h+='</div>';
        h+='<div><div style="font-size:11px;font-weight:700;color:var(--teal);text-transform:uppercase;margin-bottom:8px">Subsidiaries</div>';
        if(subs.length){ subs.forEach(function(s){ var sh=s.shareholders.find(function(sh){return sh.type==='company'&&sh.person===c.id;}); h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#fff;border-radius:var(--radius-xs);margin-bottom:5px;border:1.5px solid var(--teal);cursor:pointer" onclick="openCompany('+q(s.id)+')"><span style="font-weight:600;font-size:13px;color:var(--teal)">'+esc(s.name)+'</span><span style="font-weight:700;color:var(--teal)">'+(sh?sh.pct+'%':'—')+'</span></div>'; }); }
        else { h+='<div style="font-size:12px;color:var(--text3)">—</div>'; }
        h+='</div></div>';
        h+='<div style="padding:8px 18px 12px;background:var(--accent-bg)"><button class="btn btn-outline btn-sm" onclick="openCompany('+q(c.id)+')">Open Profile</button></div>';
        h+='</td></tr>';
      }
    });
    h+='</tbody></table>';
  }
  h+='</div>';
  return h;
}
function netToggle(id){ _netSelected=(_netSelected===id)?null:id; var m=document.getElementById('main'); if(m) m.innerHTML=renderNetwork(); }

// ── Import ────────────────────────────────────────────────────────────────────
var _importRows=[], _importHeaders=[], _importMapping={}, _importEditable=[];
var SYSTEM_FIELDS=['Empresa','Jurisdiccion','Proposito','Ano','ID Fiscal','EIN','IRS','Director','Registered Agent','Direccion','Estado','Tags','Accionistas','Banco','Account #','Routing','SWIFT'];
function openImport(){
  var h='<div class="modal-header"><div class="modal-title">'+t('importTitle')+'</div><button class="close-btn" onclick="closeModal()">x</button></div>';
  h+='<div class="modal-body"><div class="import-hint">'+(lang==='en'?'Upload any CSV or Excel file. Map columns to fields, then edit before importing.':'Sube cualquier CSV o Excel. Mapea columnas y edita antes de importar.')+'</div>';
  h+='<div class="drop-zone" onclick="document.getElementById(\'fim\').click()" ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'" ondragleave="this.style.borderColor=\'\'" ondrop="event.preventDefault();this.style.borderColor=\'\';handleImportDrop(event)">';
  h+='<div style="font-size:28px;margin-bottom:6px">&#128194;</div><div style="font-weight:600">Click or drag &amp; drop</div>';
  h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">.xlsx � .xls � .csv</div>';
  h+='<input id="fim" type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleImportFile(this)"></div>';
  h+='<div style="text-align:center;font-size:12px;color:var(--text3);margin-bottom:8px">— or paste CSV below —</div>';
  h+='<textarea id="imp-txt" class="import-area" placeholder="Empresa,Jurisdiccion,Director..."></textarea>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn btn-outline" onclick="closeModal()">'+t('cancel')+'</button><button class="btn btn-primary" onclick="parseImportText()">Parse &amp; Map</button></div>';
  h+='<div id="imp-map-area"></div><div id="imp-preview-area"></div><div id="imp-msg"></div></div>';
  showModal(h,true);
}
function handleImportDrop(e){ var f=e.dataTransfer.files[0]; if(f) readImportFile(f); }
function handleImportFile(inp){ var f=inp.files[0]; if(f) readImportFile(f); }
function readImportFile(f){
  var isXL=/\.xlsx?$/i.test(f.name); var r=new FileReader();
  r.onload=function(e){ try{ var rows; if(isXL){var wb=XLSX.read(e.target.result,{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});}else rows=parseCSVRaw(e.target.result); showImportMapping(rows); }catch(err){showImpMsg(err.message,'err');} };
  if(isXL) r.readAsArrayBuffer(f); else r.readAsText(f,'UTF-8');
}
function parseImportText(){ var txt=document.getElementById('imp-txt'); if(!txt||!txt.value.trim()){showImpMsg('No text','err');return;} showImportMapping(parseCSVRaw(txt.value.trim())); }
function parseCSVRaw(txt){ var lines=txt.split('\n').filter(function(l){return l.trim();}); var f=lines[0]||''; var d=(f.match(/\t/g)||[]).length>=(f.match(/,/g)||[]).length?'\t':','; return lines.map(function(l){return splitLine(l,d);}); }
function splitLine(line,d){ var r=[],cur='',q=false; for(var i=0;i<line.length;i++){var c=line[i];if(c==='"'){q=!q;}else if(c===d&&!q){r.push(cur.trim().replace(/^"|"$/g,''));cur='';}else cur+=c;} r.push(cur.trim().replace(/^"|"$/g,'')); return r; }
function showImportMapping(rows){
  if(!rows||rows.length<2){showImpMsg('Need at least 2 rows','err');return;}
  _importRows=rows; _importHeaders=rows[0].map(function(h){return String(h||'').trim();});
  _importMapping={};
  var kw={'Empresa':['empresa','company','nombre','name'],'Jurisdiccion':['jurisdic'],'Proposito':['prop','purp'],'Ano':['ano','year','fecha','constit'],'ID Fiscal':['fiscal','nif','rut','company id'],'EIN':['ein'],'IRS':['irs'],'Director':['director','admin'],'Registered Agent':['registered','agente'],'Direccion':['direcci','address','domicilio'],'Estado':['status','estado'],'Tags':['tags','etiqueta'],'Accionistas':['shareholder','accionista'],'Banco':['bank','banco'],'Account #':['account','cuenta'],'Routing':['routing','aba'],'SWIFT':['swift']};
  var heads=_importHeaders.map(function(h){return h.toLowerCase();});
  SYSTEM_FIELDS.forEach(function(sf){ if(!_importMapping[sf]){var kws=kw[sf]||[];kws.forEach(function(k){if(!_importMapping[sf]){for(var i=0;i<heads.length;i++){if(heads[i].includes(k)){_importMapping[sf]=_importHeaders[i];break;}}}}); } });
  var ma=document.getElementById('imp-map-area'); if(!ma) return;
  var mh='<div class="fsec" style="margin-top:16px"><div class="fsec-title">Column Mapping</div>';
  mh+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  SYSTEM_FIELDS.forEach(function(sf){
    mh+='<div style="display:flex;align-items:center;gap:8px;font-size:12px"><div style="min-width:120px;font-weight:600;color:var(--text2)">'+sf+'</div>';
    mh+='<select id="map-'+sf.replace(/[^a-z]/gi,'_')+'" style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--radius-xs);font-size:12px;font-family:inherit;color:var(--text);background:var(--surface);outline:none"><option value="">— skip —</option>';
    _importHeaders.forEach(function(h){mh+='<option value="'+esc(h)+'"'+(_importMapping[sf]===h?' selected':'')+'>'+esc(h)+'</option>';});
    mh+='</select></div>';
  });
  mh+='</div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn-primary btn-sm" onclick="buildImportPreview()">Preview Data</button></div></div>';
  ma.innerHTML=mh;
}
function buildImportPreview(){
  SYSTEM_FIELDS.forEach(function(sf){var sel=document.getElementById('map-'+sf.replace(/[^a-z]/gi,'_'));if(sel)_importMapping[sf]=sel.value||'';});
  _importEditable=[];
  for(var i=1;i<_importRows.length;i++){
    var cols=_importRows[i];
    function cv(sf){var col=_importMapping[sf];if(!col)return '';var idx=_importHeaders.indexOf(col);return idx>-1?String(cols[idx]||'').trim():'';}
    if(!cv('Empresa')) continue;
    _importEditable.push({_skip:false,Empresa:cv('Empresa'),Jurisdiccion:cv('Jurisdiccion'),Proposito:cv('Proposito'),Ano:cv('Ano'),'ID Fiscal':cv('ID Fiscal'),EIN:cv('EIN'),IRS:cv('IRS'),Director:cv('Director'),'Registered Agent':cv('Registered Agent'),Direccion:cv('Direccion'),Estado:cv('Estado')||'active',Tags:cv('Tags'),Accionistas:cv('Accionistas'),Banco:cv('Banco'),'Account #':cv('Account #'),Routing:cv('Routing'),SWIFT:cv('SWIFT')});
  }
  var pa=document.getElementById('imp-preview-area'); if(!pa) return;
  var ph='<div class="fsec" style="margin-top:16px"><div class="fsec-title">Preview ('+_importEditable.length+' rows — uncheck to skip)</div>';
  ph+='<div class="import-table-wrap"><table class="import-table"><thead><tr><th>✓</th><th>Empresa</th><th>Jurisdiccion</th><th>Ano</th><th>Director</th><th>Accionistas</th></tr></thead><tbody id="imp-table-body"></tbody></table></div>';
  ph+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary" onclick="confirmImport()">Confirm Import ('+_importEditable.length+')</button></div></div>';
  pa.innerHTML=ph; renderImportTable();
}
function renderImportTable(){ var tb=document.getElementById('imp-table-body'); if(!tb) return; var h=''; _importEditable.forEach(function(row,i){h+='<tr class="'+(row._skip?'skip':'')+'"><td style="text-align:center"><input type="checkbox" '+(row._skip?'':'checked')+' onchange="_importEditable['+i+']._skip=!this.checked;renderImportTable()"></td>';['Empresa','Jurisdiccion','Ano','Director','Accionistas'].forEach(function(f){h+='<td><input value="'+esc(row[f]||'')+'" oninput="_importEditable['+i+'][\''+f+'\']=this.value" '+(row._skip?'disabled':'')+' style="width:100%;border:none;outline:none;font-size:12px;font-family:inherit;background:transparent;color:var(--text)"></td>';});h+='</tr>';}); tb.innerHTML=h; }
function confirmImport(){
  var toImport=_importEditable.filter(function(r){return !r._skip;});
  if(!toImport.length){showImpMsg('No rows selected','err');return;}
  toImport.forEach(function(row){
    var shRaw=row['Accionistas']||'';
    var shareholders=shRaw?shRaw.split(/[;|]/).map(function(s){var m=s.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?)%?$/);return m?{id:uid(),person:m[1].trim(),pct:parseFloat(m[2]),class:'',type:'individual'}:{id:uid(),person:s.trim(),pct:0,class:'',type:'individual'};}).filter(function(s){return s.person;}):[]; 
    var banking=row['Banco']?[{id:uid(),bank:row['Banco'],account:row['Account #']||'',routing:row['Routing']||'',swift:row['SWIFT']||'',bankAddr:'',currency:'USD',type:'Checking'}]:[];
    data.companies.push({id:uid(),name:row['Empresa'],jurisdiction:row['Jurisdiccion'],purpose:row['Proposito'],yearFounded:row['Ano'],fiscalId:row['ID Fiscal'],ein:row['EIN'],irs:row['IRS'],director:row['Director'],agent:row['Registered Agent'],address:row['Direccion'],status:row['Estado']||'active',tags:row['Tags']||row['Proposito'],notes:'',shareholders:shareholders,banking:banking,custom:[],documents:[]});
  });
  save(); closeModal(); render();
}
function showImpMsg(msg,type){ var el=document.getElementById('imp-msg'); if(el) el.innerHTML=msg?'<div class="'+(type==='ok'?'imp-ok':'imp-err')+'">'+msg+'</div>':''; }

// ── Export ────────────────────────────────────────────────────────────────────
function exportAllCSV(){
  var rows=[['Empresa','Jurisdiccion','Proposito','Ano','ID Fiscal','EIN','IRS','Director','Registered Agent','Direccion','Estado','Accionistas','Banco','Account #','Routing','SWIFT']];
  data.companies.forEach(function(c){rows.push([c.name,c.jurisdiction,c.purpose,c.yearFounded||c.year,c.fiscalId,c.ein,c.irs,c.director,c.agent,c.address,c.status,c.shareholders.map(function(s){return resolveOwner(s)+' '+s.pct+'%';}).join('; '),(c.banking||[]).map(function(b){return b.bank;}).join('; '),(c.banking||[]).map(function(b){return b.account;}).join('; '),(c.banking||[]).map(function(b){return b.routing;}).join('; '),(c.banking||[]).map(function(b){return b.swift;}).join('; ')]);});
  dlCSV(rows,'famofi_companies.csv');
}
function exportCompanyCSV(id){
  var c=data.companies.find(function(x){return x.id===id;}); if(!c) return;
  var subs=getSubs(id); var invs=data.investments.filter(function(i){return invCoIds(i).indexOf(id)!==-1;});
  var rows=[['Field','Value'],['Empresa',c.name],['Jurisdiccion',c.jurisdiction],['Proposito',c.purpose],['Ano',c.yearFounded||c.year],['ID Fiscal',c.fiscalId],['EIN',c.ein],['IRS',c.irs],['Director',c.director],['Registered Agent',c.agent],['Direccion',c.address],['Estado',c.status],['',''],['--- ACCIONISTAS ---',''],['Nombre','%','Tipo']];
  c.shareholders.forEach(function(s){rows.push([resolveOwner(s),s.pct+'%',s.type]);});
  rows.push(['',''],['--- SUBSIDIARIAS ---','']); subs.forEach(function(s){rows.push([s.name,s.jurisdiction,s.status]);});
  rows.push(['',''],['--- INVERSIONES ---',''],['Nombre','Fondo','Tipo','Market Value','Calls','Distribuciones','Gastos']);
  invs.forEach(function(i){rows.push([i.name,i.fund,i.type,i.marketValue,i.calls,i.distributions,i.expenses||0]);});
  rows.push(['',''],['--- BANCA ---',''],['Banco','Account #','Routing','SWIFT']);
  (c.banking||[]).forEach(function(b){rows.push([b.bank,b.account,b.routing,b.swift]);});
  dlCSV(rows,c.name.replace(/[^a-z0-9]/gi,'_')+'.csv');
}
function dlCSV(rows,name){ var csv=rows.map(function(r){return r.map(function(v){return '"'+String(v||'').replace(/"/g,'""')+'"';}).join(',');}).join('\n'); var a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent('\uFEFF'+csv); a.download=name; a.click(); }
function printCompany(id){
  var c=data.companies.find(function(x){return x.id===id;}); if(!c) return;
  var subs=getSubs(id); var invs=data.investments.filter(function(i){return invCoIds(i).indexOf(id)!==-1;});
  var w=window.open('','_blank');
  var h='<!DOCTYPE html><html><head><title>'+esc(c.name)+'</title><style>body{font-family:sans-serif;padding:28px;max-width:800px;margin:0 auto}h1{font-size:18px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}th{background:#f5f5f5;padding:5px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #eee}.row{display:grid;grid-template-columns:180px 1fr;padding:5px 0;border-bottom:1px solid #eee;font-size:12px}.lbl{color:#888}h3{font-size:13px;margin:14px 0 5px}</style></head><body>';
  h+='<div style="display:flex;justify-content:space-between;margin-bottom:18px"><div><h1>'+esc(c.name)+'</h1><div style="color:#666;font-size:12px">'+esc(c.jurisdiction)+' � '+esc(c.yearFounded||c.year||'')+' � '+c.status+'</div></div></div>';
  h+='<h3>Shareholders</h3><table><thead><tr><th>Owner</th><th>%</th><th>Type</th></tr></thead><tbody>';
  c.shareholders.forEach(function(s){h+='<tr><td>'+esc(resolveOwner(s))+'</td><td>'+s.pct+'%</td><td>'+s.type+'</td></tr>';});
  h+='</tbody></table>';
  if(subs.length){h+='<h3>Subsidiaries</h3><table><thead><tr><th>Name</th><th>Jurisdiction</th></tr></thead><tbody>'; subs.forEach(function(s){h+='<tr><td>'+esc(s.name)+'</td><td>'+esc(s.jurisdiction)+'</td></tr>';}); h+='</tbody></table>';}
  if(invs.length){h+='<h3>Investments</h3><table><thead><tr><th>Name</th><th>Type</th><th>MV</th></tr></thead><tbody>'; invs.forEach(function(i){h+='<tr><td>'+esc(i.name)+'</td><td>'+esc(i.type)+'</td><td>'+fmtD(i.marketValue)+'</td></tr>';}); h+='</tbody></table>';}
  h+='<scr'+'ipt>window.print();<'+'/scr'+'ipt></body></html>';
  w.document.write(h); w.document.close();
}
 
// ── Modal ────────────────────────────────────────────────────────────────────
function showModal(html,lg){
  document.querySelectorAll('#modal-overlay').forEach(function(o){ o.remove(); });
  var ov=document.createElement('div'); ov.className='overlay'; ov.id='modal-overlay';
  var m=document.createElement('div'); m.className='modal'+(lg?' modal-lg':''); m.innerHTML=html;
  ov.appendChild(m); document.body.appendChild(ov);
  ov.addEventListener('click',function(e){ if(e.target===ov) closeModal(); });
}
// Pass rerender=true only when closing after a data-mutating action.
// This prevents unnecessary full re-renders on every modal close (the main lag source).
// All overlays share id/selector 'modal-overlay'; showModal/closeModal always clear ALL
// matching overlays (not just the first) so stale/orphaned modals never stack or block clicks.
function closeModal(rerender){
  document.querySelectorAll('#modal-overlay').forEach(function(o){ o.remove(); });
  if(rerender) render();
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && document.getElementById('modal-overlay')) closeModal();
});
