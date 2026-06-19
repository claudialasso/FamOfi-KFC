
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
    purpose:'Purpose', yearFounded:'Year / Date Founded', fiscalId:'Company ID / Fiscal #',
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
    printChart:'Print Chart', selectCompany:'Select a company to view its org chart'
  },
  es: {
    overview:'Resumen', companies:'Empresas', shareholders:'Accionistas',
    investments:'Inversiones', orgcharts:'Organigrama', network:'Red',
    addCompany:'+ Agregar Empresa', search:'Buscar...', allJurisdictions:'Todas las Jurisdicciones',
    allStatus:'Todos los Estados', name:'Razon Social', jurisdiction:'Jurisdiccion',
    purpose:'Proposito', yearFounded:'Ano / Fecha', fiscalId:'ID Fiscal',
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
    printChart:'Imprimir Grafico', selectCompany:'Selecciona una empresa para ver su organigrama'
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
function resolveOwner(sh){ return sh.type==='company' ? cname(sh.person) : sh.person; }
function _sanitizedCompanies(){
  return data.companies.map(function(c){
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
}

function getSubs(pid){
  return _sanitizedCompanies().filter(function(c){
    return c.shareholders.some(function(s){
      return s.type==='company'&&s.person===pid;
    });
  });
}
function getParents(cid){ return data.companies.filter(function(p){ return getSubs(p.id).some(function(s){ return s.id===cid; }); }); }
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
  data = d;
  if(!data.investments) data.investments=[];
  data.companies.forEach(function(c){
    c.shareholders.forEach(function(s){ if(!s.type) s.type='individual'; });
    if(!c.banking) c.banking=[];
    if(!c.custom) c.custom=[];
    if(!c.documents) c.documents=[];
    if(!c.yearFounded && c.year) c.yearFounded=String(c.year);
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
  });
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
var COLORS = ['#4f6ef7','#0e9f6e','#f59e0b','#7c3aed','#e3403a','#1d83e2','#10b981','#f97316','#8b5cf6','#ef4444'];
var charts = {};
function destroyCharts(){ Object.values(charts).forEach(function(c){ try{c.destroy();}catch(e){} }); charts={}; }
function mkChart(id,type,labels,values){
  var ctx=document.getElementById(id); if(!ctx) return;
  if(charts[id]) charts[id].destroy();
  charts[id]=new Chart(ctx,{type:type,
    data:{labels:labels,datasets:[{data:values,backgroundColor:COLORS.slice(0,labels.length),borderWidth:0,borderRadius:type==='bar'?5:0}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:type!=='bar',position:'bottom',labels:{boxWidth:10,font:{size:10},padding:8}}},
      scales:type==='bar'?{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'#eef0f8'},ticks:{font:{size:10},stepSize:1}}}:undefined
    }
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
function roBanner(){
  if(isAdmin()) return '';
  return '<div class="readonly-banner">View-only access — you can view but not edit data.</div>';
}

// ── Overview ──────────────────────────────────────────────────────────────────
function renderOverview(){
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
  h+='<div class="chart-card"><div class="chart-title">'+t('byJurisdiction')+'</div><div class="chart-wrap"><canvas id="ch-jur"></canvas></div></div>';
  h+='<div class="chart-card"><div class="chart-title">'+t('byStatus')+'</div><div class="chart-wrap"><canvas id="ch-status"></canvas></div></div>';
  h+='</div>';
  h+='<div class="card" style="padding:0;width:100%"><table><thead><tr><th>'+t('name')+'</th><th>'+t('jurisdiction')+'</th><th>'+t('status')+'</th><th>'+t('shareholders2')+'</th><th>'+t('subsidiaries')+'</th><th>'+t('investments')+'</th></tr></thead><tbody>';
  if(!cs.length){ h+='<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text3)">'+t('noCompanies')+'</td></tr>'; }
  else { cs.forEach(function(c){
    var subs=getSubs(c.id).length;
    var ic=inv.filter(function(i){return i.companyId===c.id;}).length;
    var shList=c.shareholders.map(function(s){return '<span style="font-size:12px">'+esc(resolveOwner(s))+' <b style="color:var(--accent)">'+s.pct+'%</b></span>';}).join('<br>');
    h+='<tr style="cursor:pointer" onclick="openCompany('+q(c.id)+')">';
    h+='<td><strong>'+esc(c.name)+'</strong></td><td><span class="badge badge-jur">'+esc(c.jurisdiction)+'</span></td>';
    h+='<td>'+sBadge(c.status)+'</td><td>'+(shList||'—')+'</td>';
    h+='<td>'+(subs?'<span class="badge badge-active">'+subs+'</span>':'—')+'</td>';
    h+='<td>'+(ic?'<span class="badge badge-inv">'+ic+'</span>':'—')+'</td></tr>';
  }); }
  h+='</tbody></table></div>';
  return h;
}
function buildOvCharts(){
  var cs=data.companies;
  var jm={}; cs.forEach(function(c){jm[c.jurisdiction]=(jm[c.jurisdiction]||0)+1;});
  mkChart('ch-jur','doughnut',Object.keys(jm),Object.values(jm));
  var sm={}; cs.forEach(function(c){var k=t(c.status);sm[k]=(sm[k]||0)+1;});
  mkChart('ch-status','doughnut',Object.keys(sm),Object.values(sm));
}

// ── Companies ─────────────────────────────────────────────────────────────────
var cSearch='',cJur='',cStatus='';
function renderCompanies(){
  var jurs=[...new Set(data.companies.map(function(c){return c.jurisdiction;}))].sort();
  var cs=data.companies.filter(function(c){
    var q2=cSearch.toLowerCase();
    return(!q2||(c.name+c.director+c.jurisdiction).toLowerCase().includes(q2))
      &&(!cJur||c.jurisdiction===cJur)&&(!cStatus||c.status===cStatus);
  });
  var h=roBanner();
  h+='<div class="section-header"><div class="section-title">'+t('companies')+' <span style="color:var(--text3);font-weight:400;font-size:14px">('+data.companies.length+')</span></div>';
  h+='<div style="display:flex;gap:8px"><button class="btn btn-teal btn-sm" onclick="exportAllCSV()">'+t('export')+'</button>';
  if(isAdmin()) h+='<button class="btn btn-primary" onclick="openCompanyForm(null)">'+t('addCompany')+'</button><button class="btn btn-danger btn-sm" id="bulk-delete-co-btn" onclick="bulkDeleteCompanies()" style="display:none;margin-left:8px">'+t('deleteSelected')+'</button>';
  h+='</div></div>';
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span>';
  h+='<input type="text" placeholder="'+t('search')+'" value="'+esc(cSearch)+'" oninput="cSearch=this.value;renderPage()"></div>';
  h+='<select class="filter" onchange="cJur=this.value;renderPage()"><option value="">'+t('allJurisdictions')+'</option>';
  jurs.forEach(function(j){h+='<option value="'+esc(j)+'"'+(cJur===j?' selected':'')+'>'+esc(j)+'</option>';});
  h+='</select><select class="filter" onchange="cStatus=this.value;renderPage()"><option value="">'+t('allStatus')+'</option>';
  h+='<option value="active">'+t('active')+'</option><option value="liquidated">'+t('liquidated')+'</option><option value="liquidation">'+t('liquidation')+'</option></select></div>';
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
  var invs=data.investments.filter(function(i){return i.companyId===id;});
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
  var shP='<div style="display:flex;justify-content:flex-end;margin-bottom:10px">';
  if(isAdmin()) shP+='<button class="btn btn-primary btn-sm" onclick="openAddSHForm('+q(id)+')">'+t('addShareholder')+'</button>';
  shP+='</div>';
  if(c.shareholders.length){
    shP+='<canvas id="sh-pie" style="max-height:170px;margin-bottom:16px"></canvas>';
    shP+='<table><thead><tr><th>'+t('ownerType')+'</th><th>'+t('shareholders2')+'</th><th>'+t('ownership')+'</th><th>'+t('shareClass')+'</th><th></th></tr></thead><tbody>';
    c.shareholders.forEach(function(s,si){
      shP+='<tr><td><span class="badge '+(s.type==='company'?'badge-jur':'badge-active')+'" style="font-size:10px">'+(s.type==='company'?'Empresa':'Persona')+'</span></td>';
      if(s.type==='company'){ shP+='<td style="cursor:pointer;color:var(--accent);font-weight:600" onclick="closeModal();openCompany('+q(s.person)+')">'+esc(resolveOwner(s))+'</td>'; }
      else { shP+='<td>'+esc(resolveOwner(s))+'</td>'; }
      shP+='<td><div style="font-weight:600">'+s.pct+'%</div><div class="ownership-bar" style="width:100px"><div class="ownership-fill" style="width:'+s.pct+'%"></div></div></td>';
      shP+='<td style="color:var(--text2)">'+esc(s.class||'—')+'</td><td style="white-space:nowrap">';
      if(isAdmin()){
        shP+='<button class="btn btn-outline btn-sm" onclick="openEditSHForm('+q(id)+','+si+')" style="margin-right:4px">'+t('editCompany')+'</button>';
        shP+='<button class="btn btn-danger btn-sm" onclick="delShareholder('+q(id)+','+si+')">x</button>';
      }
      shP+='</td></tr>';
    });
    shP+='</tbody></table>';
  } else { shP+='<div class="empty">'+t('noShareholders')+'</div>'; }
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
  var orgP='<div style="display:flex;gap:8px;margin-bottom:14px">'
    +'<button class="btn btn-teal btn-sm" onclick="printOrgChart('+q(id)+')">&#128424; '+t('printChart')+'</button>'
    +'<button class="btn btn-outline btn-sm" onclick="printOrgChart('+q(id)+')">&#8659; PDF / PNG</button>'
    +'</div>'+buildFullOrgChart(id);
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
  var bankP='<div style="display:flex;justify-content:flex-end;margin-bottom:12px">';
  if(isAdmin()) bankP+='<button class="btn btn-primary btn-sm" onclick="addBankInModal('+q(id)+')">'+t('addBank')+'</button>';
  bankP+='</div><div id="bank-view-list">'+renderBankView(id)+'</div>';
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
  var docP=renderDocuments(id);
  var h='<div class="modal-header"><div><div class="modal-title">'+esc(c.name)+'</div>';
  h+='<div class="modal-subtitle">'+esc(c.jurisdiction)+' · '+esc(c.yearFounded||c.year||'')+' · '+sBadge(c.status)+'</div></div>';
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
  h+='<button class="tab" onclick="switchTab(this,\'td-sub\')">'+t('subsidiaries')+' ('+subs.length+')</button>';
  h+='<button class="tab" onclick="switchTab(this,\'td-org\')">'+t('orgChart')+'</button>';
  h+='<button class="tab" onclick="switchTab(this,\'td-inv\')">'+t('investments')+' ('+invs.length+')</button>';
  h+='<button class="tab" onclick="switchTab(this,\'td-bank\')">'+t('banking')+' ('+c.banking.length+')</button>';
  h+='<button class="tab" onclick="switchTab(this,\'td-cf\')">'+t('customFields')+' ('+c.custom.length+')</button>';
  h+='<button class="tab" onclick="switchTab(this,\'td-doc\')">'+t('documents')+' ('+(c.documents?c.documents.length:0)+')</button>';
  h+='</div>';
  h+='<div id="td-d" class="tab-panel active">'+det+'</div>';
  h+='<div id="td-sh" class="tab-panel">'+shP+'</div>';
  h+='<div id="td-sub" class="tab-panel">'+subP+'</div>';
  h+='<div id="td-org" class="tab-panel" style="overflow-x:auto;padding:8px 0">'+orgP+'</div>';
  h+='<div id="td-inv" class="tab-panel">'+invP+'</div>';
  h+='<div id="td-bank" class="tab-panel">'+bankP+'</div>';
  h+='<div id="td-cf" class="tab-panel">'+cfP+'</div>';
  h+='<div id="td-doc" class="tab-panel">'+docP+'</div>';
  h+='</div>';
  showModal(h,true);
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
  btn.classList.add('active'); document.getElementById(pid).classList.add('active');
}

// ── Full recursive org chart ──────────────────────────────────────────────────
function _upstreamDepth(cid,visited,companies){
  var c=companies.find(function(x){return x.id===cid;}); if(!c) return 0;
  var compOwners=(c.shareholders||[]).filter(function(s){return s.type==='company';});
  var indivOwners=(c.shareholders||[]).filter(function(s){return s.type==='individual';});
  if(!compOwners.length&&!indivOwners.length) return 0;
  if(indivOwners.length&&!compOwners.length) return 1;
  var maxD=0;
  compOwners.forEach(function(s){
    if(!visited.has(s.person)){
      var next=new Set(visited); next.add(s.person);
      var d=_upstreamDepth(s.person,next,companies);
      if(d>maxD) maxD=d;
    }
  });
  return 1+maxD;
}
function _buildUpstreamBranch(cid,visited,companies,targetDepth){
  var c=companies.find(function(x){return x.id===cid;}); if(!c) return '';
  var compOwners=(c.shareholders||[]).filter(function(s){return s.type==='company';});
  var indivOwners=(c.shareholders||[]).filter(function(s){return s.type==='individual';});
  if(!compOwners.length&&!indivOwners.length) return '';
  var h='<div class="org-level">';
  compOwners.slice().sort(function(a,b){var na=cname(a.person).toLowerCase(),nb=cname(b.person).toLowerCase();return na<nb?-1:na>nb?1:0;}).forEach(function(s){
    var ownerId=s.person;
    var ownerC=companies.find(function(x){return x.id===ownerId;})||{};
    var label=s.pct+'% '+(ownerC.jurisdiction||'');
    h+='<div class="org-branch">';
    if(visited.has(ownerId)){
      for(var pi=0;pi<targetDepth-1;pi++){h+='<div class="org-level"><div class="org-branch"><div class="org-pad-node"></div></div></div><div class="org-pad-conn"></div>';}
      h+=orgNode('↻ '+cname(ownerId),label,'var(--text3)','var(--surface)','Cycle',ownerId);
    } else {
      var next=new Set(visited); next.add(ownerId);
      var childDepth=_upstreamDepth(ownerId,next,companies);
      var padLevels=targetDepth-1-childDepth;
      for(var pi2=0;pi2<padLevels;pi2++){h+='<div class="org-level"><div class="org-branch"><div class="org-pad-node"></div></div></div><div class="org-pad-conn"></div>';}
      h+=_buildUpstreamBranch(ownerId,next,companies,childDepth);
      h+=orgNode(cname(ownerId),label,'var(--purple)','var(--purple-bg)','Company',ownerId);
    }
    h+='</div>';
  });
  indivOwners.slice().sort(function(a,b){return a.person<b.person?-1:a.person>b.person?1:0;}).forEach(function(s){
    h+='<div class="org-branch">';
    h+=orgNode(s.person,s.pct+'%','var(--amber)','var(--amber-bg)','Individual',null);
    h+='</div>';
  });
  h+='</div>';
  h+=orgConn();
  return h;
}
function buildUpstream(cid,visited){
  var companies=_sanitizedCompanies();
  var c=companies.find(function(x){return x.id===cid;}); if(!c) return '';
  var compOwners=(c.shareholders||[]).filter(function(s){return s.type==='company';});
  var indivOwners=(c.shareholders||[]).filter(function(s){return s.type==='individual';});
  if(!compOwners.length&&!indivOwners.length) return '';
  var maxDepth=0;
  compOwners.forEach(function(s){
    if(!visited.has(s.person)){
      var next=new Set(visited); next.add(s.person);
      var d=_upstreamDepth(s.person,next,companies);
      if(d>maxDepth) maxDepth=d;
    }
  });
  return _buildUpstreamBranch(cid,visited,companies,maxDepth);
}

function buildFullOrgChart(cid){
  var c=_sanitizedCompanies().find(function(x){return x.id===cid;});
  if(!c) return '';
  var visited=new Set([cid]);
  var h='<div class="org-chart-scroll">';
  h+='<div style="text-align:center;font-family:system-ui,sans-serif">';
  h+='<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;font-size:12px;font-weight:600">';
  h+='<span style="color:var(--amber)">Individual Shareholder</span>';
  h+='<span style="color:var(--purple)">Company Owner</span>';
  h+='<span style="color:var(--accent)">Selected Company</span>';
  h+='<span style="color:var(--teal)">Subsidiary</span>';
  h+='<span style="color:var(--coral)">Investment</span>';
  h+='</div>';
  h+=buildUpstream(cid,visited);
  h+='<div class="org-level">';
  h+=orgNode(c.name,c.jurisdiction,'var(--accent)','var(--accent-bg)','Selected',null,true);
  h+='</div>';
  h+=buildSubTree(cid,visited);
  h+='</div>';
  h+='</div>';
  return h;
}
function buildSubTree(cid,visited){
  var subs=getSubs(cid);
  var invs=data.investments.filter(function(i){return i.companyId===cid;});
  if(!subs.length&&!invs.length) return '';
  var h=orgConn()+'<div class="org-level">';
  subs.forEach(function(s){
    var sh=s.shareholders.find(function(x){return x.type==='company'&&x.person===cid;});
    var subLabel=(sh?sh.pct+'%':'')+' '+s.jurisdiction;
    h+='<div class="org-branch">';
    if(visited.has(s.id)){
      h+=orgNode('↻ '+s.name,subLabel,'var(--text3)','var(--surface)','Cycle',s.id);
    } else {
      h+=orgNode(s.name,subLabel,'var(--teal)','var(--teal-bg)','Subsidiary',s.id);
      var next=new Set(visited); next.add(s.id);
      h+=buildSubTree(s.id,next);
    }
    h+='</div>';
  });
  invs.forEach(function(inv){
    h+=orgNode(inv.name,(inv.type||'')+(inv.marketValue?' $'+(+inv.marketValue).toLocaleString():''),'var(--coral)','var(--coral-bg)','Investment',null);
  });
  h+='</div>';
  return h;
}
function orgNode(name,sub,color,bg,label,clickId,isCurrent){
  var style='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;';
  style+='border:2px solid '+color+';background:'+bg+';border-radius:10px;padding:10px 14px;';
  style+='min-width:110px;max-width:150px;text-align:center;margin:4px;box-shadow:0 2px 8px rgba(0,0,0,.08);';
  if(isCurrent) style+='border-width:3px;';
  if(clickId) style+='cursor:pointer;';
  var click=clickId?'onclick="openCompany('+q(clickId)+')"':'';
  return '<div style="'+style+'" '+click+'>'
    +'<div style="font-size:10px;color:'+color+';font-weight:700;text-transform:uppercase;margin-bottom:3px">'+label+'</div>'
    +'<div style="font-size:12px;font-weight:700;color:'+color+';line-height:1.3;word-break:break-word">'+esc(name)+'</div>'
    +(sub?'<div style="font-size:10px;color:var(--text3);margin-top:3px">'+esc(sub)+'</div>':'')
    +'</div>';
}
function orgConn(){ return '<div class="org-conn"></div>'; }

function printOrgChart(id){
  var c=data.companies.find(function(x){return x.id===id;}); if(!c) return;
  var chartHTML=buildFullOrgChart(id);
  var w=window.open('','_blank');
  w.document.write('<!DOCTYPE html><html><head><title>Org Chart - '+esc(c.name)+'</title>');
  w.document.write('<style>');
  w.document.write('@page{size:A3 landscape;margin:1.5cm}');
  w.document.write('*{box-sizing:border-box;margin:0;padding:0}');
  w.document.write('body{font-family:system-ui,sans-serif;padding:24px;background:#fff;color:#1e2340;text-align:center}');
  w.document.write('h2{font-size:16px;font-weight:700;margin-bottom:4px;text-align:left}.sub{font-size:12px;color:#5a6080;margin-bottom:20px;text-align:left}');
  w.document.write('button{display:none!important}');
  w.document.write('.org-chart-scroll{width:100%;overflow:visible}');
  w.document.write('.org-level{display:flex;flex-wrap:nowrap;justify-content:center;align-items:flex-end;gap:10px}');
  w.document.write('.org-branch{display:flex;flex-direction:column;align-items:center;min-width:0}');
  w.document.write('.org-conn{width:2px;height:16px;background:#c5ccdf;margin:0 auto;print-color-adjust:exact;-webkit-print-color-adjust:exact}');
  w.document.write('.org-pad-node{display:inline-flex;min-width:100px;height:56px;margin:4px;visibility:hidden}');
  w.document.write('.org-pad-conn{width:2px;height:16px;margin:0 auto;visibility:hidden}');
  w.document.write('</style></head><body>');
  w.document.write('<h2>'+esc(c.name)+'</h2>');
  w.document.write('<div class="sub">'+esc(c.jurisdiction)+' — Organizational Chart — FamOfi Registry — '+new Date().toLocaleDateString()+'</div>');
  w.document.write(chartHTML);
  w.document.write('<script>window.print();<\/script></body></html>');
  w.document.close();
}

// ── Org Charts Tab ────────────────────────────────────────────────────────────
var _orgSelected=null;
function renderOrgCharts(){
  var cs=data.companies.slice().sort(function(a,b){return a.name.toLowerCase()<b.name.toLowerCase()?-1:a.name.toLowerCase()>b.name.toLowerCase()?1:0;});
  var jurisdictions=[...new Set(data.companies.map(function(c){return c.jurisdiction;}).filter(Boolean))].sort();
  var filterJur=window._orgJurFilter||'';
  var h='<div class="section-header"><div class="section-title">'+t('orgcharts')+'</div>';
  h+='<div style="display:flex;align-items:center;gap:8px"><select onchange="window._orgJurFilter=this.value;var m=document.getElementById(\'main\');if(m)m.innerHTML=renderOrgCharts();" style="padding:6px 10px;border-radius:var(--radius-sm);border:1.5px solid var(--border);font-size:12px;background:var(--surface);color:var(--text);cursor:pointer">';
  h+='<option value="">'+(lang==='en'?'All Jurisdictions':'Todas las Jurisdicciones')+'</option>';
  jurisdictions.forEach(function(j){h+='<option value="'+esc(j)+'"'+(filterJur===j?' selected':'')+'>'+esc(j)+'</option>';});
  h+='</select></div></div>';
  h+='<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px">';
  h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg)">';
  h+='<input type="text" id="org-co-search" placeholder="'+(lang==="en"?'Search companies...':'Buscar empresas...')+'" oninput="filterOrgCompanyList(this.value)" style="flex:1;padding:7px 11px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:inherit;background:var(--surface);outline:none">';
  h+='</div><div id="org-co-list" style="max-height:200px;overflow-y:auto;padding:6px">';
  var filtered=(filterJur?cs.filter(function(c){return c.jurisdiction===filterJur;}):cs);
  if(!filtered.length){h+='<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px">'+(lang==="en"?'No companies found.':'Sin empresas.')+'</div>';}
  filtered.forEach(function(c){
    var sel=_orgSelected===c.id;
    h+='<button onclick="selectOrgCo('+q(c.id)+')" style="display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:7px 11px;border-radius:var(--radius-sm);font-size:13px;cursor:pointer;font-family:inherit;font-weight:'+(sel?'600':'400')+';border:none;background:'+(sel?'var(--accent-bg)':'transparent')+';color:'+(sel?'var(--accent)':'var(--text)')+';margin-bottom:1px">';
    h+='<span style="flex:1">'+esc(c.name)+'</span>';
    if(c.jurisdiction) h+='<span style="font-size:11px;padding:1px 7px;border-radius:10px;background:var(--border);color:var(--text2)">'+esc(c.jurisdiction)+'</span>';
    h+='</button>';
  });
  h+='</div></div></div>';
  if(!_orgSelected){
    h+='<div class="card" style="text-align:center;padding:48px;color:var(--text3)">';
    h+='<div style="font-size:32px;margin-bottom:12px">&#127968;</div>';
    h+='<div style="font-size:15px">'+t('selectCompany')+'</div></div>';
    return h;
  }
  var c=data.companies.find(function(x){return x.id===_orgSelected;}); if(!c) return h;
  h+='<div class="card" style="margin-bottom:14px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
  h+='<div style="font-size:13px;font-weight:600">'+esc(c.name)+' — '+t('orgChart')+'</div>';
  h+='<div style="display:flex;gap:8px">';
  h+='<button class="btn btn-teal btn-sm" onclick="printOrgChart('+q(c.id)+')">&#128424; '+t('printChart')+'</button>';
  h+='<button class="btn btn-outline btn-sm" onclick="printOrgChart('+q(c.id)+')">&#8659; PDF / PNG</button>';
  h+='</div></div>';
  h+='<div class="card" style="overflow-x:auto;padding:24px">'+buildFullOrgChart(c.id)+'</div>';
  return h;
}
function selectOrgCo(id){
  _orgSelected=id;
  var m=document.getElementById('main'); if(m) m.innerHTML=renderOrgCharts();
}

function filterOrgCompanyList(q){
  var list=document.getElementById('org-co-list');
  if(!list) return;
  var btns=list.querySelectorAll('button');
  var search=(q||'').toLowerCase().trim();
  btns.forEach(function(btn){btn.style.display=(!search||btn.textContent.toLowerCase().includes(search))?'flex':'none';});
}

// ── SH add/edit ───────────────────────────────────────────────────────────────
function openAddSHForm(cid){
  var opts=''; data.companies.filter(function(x){return x.id!==cid;}).forEach(function(x){opts+='<option value="'+x.id+'">'+esc(x.name)+'</option>';});
  var h='<div class="modal-header"><div class="modal-title">'+t('addShareholder')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group"><label class="lbl">'+t('ownerType')+'</label><select id="sh-type" class="inp" onchange="toggleSHInput()"><option value="individual">'+t('individual')+'</option><option value="company">'+t('company')+'</option></select></div>';
  var shNames=[...new Set(data.companies.reduce(function(a,c){c.shareholders.forEach(function(s){if(s.type==='individual'&&s.person)a.push(s.person);});return a;},[]))].sort();
  var shOpts=shNames.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  h+='<div class="form-group"><label class="lbl">Name</label><input id="sh-person-text" class="inp" list="sh-person-list" placeholder="Type or select..."><datalist id="sh-person-list">'+shOpts+'</datalist><select id="sh-person-select" class="inp" style="display:none"><option value="">— select —</option>'+opts+'</select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('ownership')+'</label><input id="sh-pct" class="inp" type="number" min="0" max="100"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('shareClass')+'</label><input id="sh-class" class="inp"></div></div>';
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
  if(!person) return;
  c.shareholders.push({id:uid(),person:person,pct:pct,class:cls,type:tp});
  save(); closeModal(); openCompany(cid);
}
function openEditSHForm(cid,idx){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  var s=c.shareholders[idx]; if(!s) return;
  var opts=''; data.companies.filter(function(x){return x.id!==cid;}).forEach(function(x){opts+='<option value="'+x.id+'"'+(s.person===x.id?' selected':'')+'>'+esc(x.name)+'</option>';});
  var h='<div class="modal-header"><div class="modal-title">'+t('editShareholder')+'</div><button class="close-btn" onclick="closeModal();openCompany('+q(cid)+')">x</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group"><label class="lbl">'+t('ownerType')+'</label><select id="sh-type-e" class="inp" onchange="toggleSHInputE()"><option value="individual"'+(s.type==='individual'?' selected':'')+'>'+t('individual')+'</option><option value="company"'+(s.type==='company'?' selected':'')+'>'+t('company')+'</option></select></div>';
  var shNamesE=[...new Set(data.companies.reduce(function(a,c){c.shareholders.forEach(function(s){if(s.type==='individual'&&s.person)a.push(s.person);});return a;},[]))].sort();
  var shOptsE=shNamesE.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
  h+='<div class="form-group"><label class="lbl">Name</label><input id="sh-person-text-e" class="inp" list="sh-person-list-e" value="'+esc(s.type==='individual'?s.person:'')+'" style="'+(s.type==='company'?'display:none':'')+'" placeholder="Type or select..."><datalist id="sh-person-list-e">'+shOptsE+'</datalist><select id="sh-person-select-e" class="inp" style="'+(s.type==='individual'?'display:none':'')+'"><option value="">— select —</option>'+opts+'</select></div>';
  h+='<div class="form-group"><label class="lbl">'+t('ownership')+'</label><input id="sh-pct-e" class="inp" type="number" min="0" max="100" value="'+s.pct+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('shareClass')+'</label><input id="sh-class-e" class="inp" value="'+esc(s.class||'')+'"></div></div>';
  h+='<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">';
  h+='<button class="btn btn-outline" onclick="closeModal();openCompany('+q(cid)+')">'+t('cancel')+'</button>';
  h+='<button class="btn btn-primary" onclick="commitEditSH('+q(cid)+','+idx+')">'+t('save')+'</button></div></div>';
  showModal(h);
}
function toggleSHInputE(){ var tp=document.getElementById('sh-type-e').value; document.getElementById('sh-person-text-e').style.display=tp==='company'?'none':'block'; document.getElementById('sh-person-select-e').style.display=tp==='company'?'block':'none'; }
function commitEditSH(cid,idx){
  var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return;
  var tp=document.getElementById('sh-type-e').value||'individual';
  var person=tp==='company'?document.getElementById('sh-person-select-e').value:document.getElementById('sh-person-text-e').value;
  var pct=parseFloat(document.getElementById('sh-pct-e').value)||0;
  var cls=document.getElementById('sh-class-e').value||'';
  if(!person) return;
  c.shareholders[idx]={id:c.shareholders[idx].id,person:person,pct:pct,class:cls,type:tp};
  save(); closeModal(); openCompany(cid);
}
function delShareholder(cid,idx){ if(!confirm('Remove shareholder?')) return; var c=data.companies.find(function(x){return x.id===cid;}); if(!c) return; c.shareholders.splice(idx,1); save(); closeModal(); openCompany(cid); }
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
    h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">PDF · DOCX · XLSX · PPTX</div>';
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
  h+='<div class="form-group"><label class="lbl">'+t('yearFounded')+'</label><input id="f-year" class="inp" value="'+esc(c?(c.yearFounded||c.year||''):'')+'" placeholder="'+t('dateHelp')+'"><span style="font-size:11px;color:var(--text3)">'+t('dateHelp')+'</span></div>';
  h+='<div class="form-group"><label class="lbl">'+t('purpose')+'</label><input id="f-purpose" class="inp" list="pl" value="'+esc(c?c.purpose:'')+'"><datalist id="pl"><option>Holding</option><option>Operating</option><option>IP / Royalties</option><option>Real Estate</option></datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('tags')+'</label><input id="f-tags" class="inp" value="'+esc(c?c.tags:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('fiscalId')+'</label><input id="f-fiscal" class="inp" value="'+esc(c?c.fiscalId:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">EIN</label><input id="f-ein" class="inp" value="'+esc(c?c.ein:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('irs')+'</label><input id="f-irs" class="inp" value="'+esc(c?c.irs:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('director')+'</label><input id="f-director" class="inp" value="'+esc(c?c.director:'')+'"></div>';
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
  var obj={id:id||uid(),name:gv('f-name'),jurisdiction:gv('f-jur'),status:gv('f-status'),yearFounded:gv('f-year'),
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
  data.investments=data.investments.filter(function(i){return i.companyId!==id;});
  save(); render();
}

// ── Investments ───────────────────────────────────────────────────────────────
var invSearch='',invFundF='',invTypeF='',invSort='';
function renderInvestments(){
  var inv=data.investments.filter(function(i){
    var q2=invSearch.toLowerCase();
    return(!q2||(i.name+(i.fund||'')+i.type+cname(i.companyId)).toLowerCase().includes(q2))
      &&(!invFundF||i.fund===invFundF)&&(!invTypeF||i.type===invTypeF);
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
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" placeholder="'+t('search')+'" value="'+esc(invSearch)+'" oninput="invSearch=this.value;renderPage()"></div>';
  h+='<select class="filter" onchange="invFundF=this.value;renderPage()"><option value="">'+t('allFunds')+'</option>';
  funds.forEach(function(f){h+='<option value="'+esc(f)+'"'+(invFundF===f?' selected':'')+'>'+esc(f)+'</option>';});
  h+='</select><select class="filter" onchange="invTypeF=this.value;renderPage()"><option value="">'+t('allTypes')+'</option>';
  types.forEach(function(t2){h+='<option value="'+esc(t2)+'"'+(invTypeF===t2?' selected':'')+'>'+esc(t2)+'</option>';});
  h+='</select></div>';
  h+='<div class="card" style="padding:0"><table><thead><tr><th style=\'width:36px\'><input type=\'checkbox\' id=\'inv-select-all\' onclick=\'toggleAllInvSelect(this)\' style=\'cursor:pointer\'></th><th>'+t('invName')+'</th><th>'+t('invFund')+'</th><th>'+t('invCompany')+'</th><th>'+t('invType')+'</th><th>'+t('invCommit')+'</th><th>'+t('invMV')+'</th><th>'+t('invCalls')+'</th><th>'+t('invDist')+'</th><th>'+t('invExpenses')+'</th><th>'+t('invStatus')+'</th><th></th></tr></thead><tbody>';
  if(!inv.length){ h+='<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text3)">'+t('noData')+'</td></tr>'; }
  else { inv.forEach(function(i){
    h+='<tr><td style="text-align:center"><input type="checkbox" class="inv-checkbox" data-id="'+i.id+'" onchange="updateBulkDeleteBtn()"></td><td style="font-weight:600">'+esc(i.name)+'</td>';
    h+='<td>'+(i.fund?'<span class="badge badge-fund">'+esc(i.fund)+'</span>':'—')+'</td>';
    h+='<td style="cursor:pointer;color:var(--accent);font-weight:500" onclick="go(\'companies\');setTimeout(function(){openCompany('+q(i.companyId)+')},50)">'+esc(cname(i.companyId))+'</td>';
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
  h+='</tbody></table></div>';
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
  var preCo=inv?inv.companyId:(defaultCo||'');
  var h='<div class="modal-header"><div class="modal-title">'+(inv?(lang==='en'?'Edit Investment':'Editar Inversión'):t('addInvestment'))+'</div><button class="close-btn" onclick="closeModal()">×</button></div>';
  h+='<div class="modal-body"><div class="form-grid">';
  h+='<div class="form-group full"><label class="lbl">'+t('invName')+'</label><input id="iv-name" class="inp" value="'+esc(inv?inv.name:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invFund')+'</label><input id="iv-fund" class="inp" list="fund-list" value="'+esc(inv?inv.fund:'')+'"><datalist id="fund-list">';
  var knownFunds=[...new Set(data.investments.map(function(i){return i.fund;}).filter(Boolean))];
  knownFunds.forEach(function(f){h+='<option>'+esc(f)+'</option>';});
  h+='</datalist></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invFamily')+'</label><input id="iv-family" class="inp" value="'+esc(inv?inv.family:'')+'"></div>';
  h+='<div class="form-group"><label class="lbl">'+t('invCompany')+'</label><select id="iv-co" class="inp"><option value="">— select —</option>';
  data.companies.forEach(function(c){h+='<option value="'+c.id+'"'+(preCo===c.id?' selected':'')+'>'+esc(c.name)+'</option>';});
  h+='</select></div>';
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
}
function renderInvFields(){
  var el=document.getElementById('inv-fields-list');if(!el)return;
  var h='';
  window._fInvFields.forEach(function(f,i){
    h+='<div class="inv-field-row"><input class="inp" value="'+esc(f.name)+'" placeholder="'+t('fieldName')+'" oninput="_fInvFields['+i+'].name=this.value">';
    h+='<input class="inp" value="'+esc(f.value)+'" placeholder="'+t('fieldValue')+'" oninput="_fInvFields['+i+'].value=this.value">';
    h+='<button class="btn btn-danger btn-sm" onclick="_fInvFields.splice('+i+',1);renderInvFields()">×</button></div>';
  });
  el.innerHTML=h;
}
function addInvField(){window._fInvFields.push({id:uid(),name:'',value:''});renderInvFields();}
function saveInv(id){
  var obj={id:id||uid(),companyId:gv('iv-co'),name:gv('iv-name'),fund:gv('iv-fund'),family:gv('iv-family'),
    type:gv('iv-type'),status:gv('iv-status'),
    commitment:parseFloat(gv('iv-commit'))||0,calls:parseFloat(gv('iv-calls'))||0,
    distributions:parseFloat(gv('iv-dist'))||0,marketValue:parseFloat(gv('iv-mv'))||0,
    notes:gv('iv-notes'),fields:window._fInvFields};
  if(id){var i=data.investments.findIndex(function(x){return x.id===id;});if(i>-1)data.investments[i]=obj;}
  else data.investments.push(obj);
  save();closeModal();render();
}
function confirmInvImport(){
  var rows=_invImportRows;
  var mapped=window._invImportMapping||{};
  var imported=0, updated=0, skipped=0;
  rows.forEach(function(row){
    function cv(k){return mapped[k]?String(row[mapped[k]]||'').trim():'';}
    var name=cv('name');
    if(!name){skipped++;return;}
    // Resolve or create company
    var coName=cv('company');
    var coId='';
    if(coName){
      var match=data.companies.find(function(c){return c.name.toLowerCase()===coName.toLowerCase();});
      if(match){coId=match.id;}
      else{coId=uid();data.companies.push({id:coId,name:coName,jurisdiction:'',purpose:'',yearFounded:'',fiscalId:'',ein:'',irs:'',director:'',agent:'',address:'',status:'active',tags:'',notes:'',shareholders:[],banking:[],custom:[],documents:[]});}
    }
    // Parse numbers — strip currency symbols and commas
    function parseNum(v){return parseFloat(String(v).replace(/[^0-9.\-]/g,''))||0;}
    var existing=data.investments.find(function(inv){return inv.name.trim().toLowerCase()===name.toLowerCase()&&inv.companyId===coId;});
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
      data.investments.push({id:uid(),companyId:coId,name:name,fund:cv('fund'),family:cv('family'),type:cv('type'),status:'active',commitment:commitVal,calls:parseNum(cv('calls')),distributions:parseNum(cv('distributions')),marketValue:parseNum(cv('marketValue')),notes:'',expenses:parseNum(cv('expenses')),fields:[]});
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
  h+='<div class="toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" placeholder="'+t('searchShareholder')+'" value="'+esc(shSearch)+'" oninput="shSearch=this.value;renderPage()"></div></div>';
  if(isAdmin()) h+='<div id="sh-bulk-bar" style="display:none;align-items:center;gap:8px;padding:6px 0"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="sh-select-all" onclick="toggleAllShSelect(this)">&nbsp;'+t('selectAll')+'</label><button class="btn btn-danger btn-sm" onclick="bulkDeleteShareholders()">'+t('deleteSelected')+'</button></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div>';
  filtered.forEach(function(p){
    var hs=data.companies.filter(function(c){return c.shareholders.some(function(s){return s.type==='individual'&&s.person===p;});});
    var avg=hs.length?Math.round(hs.reduce(function(a,c){var s=c.shareholders.find(function(s){return s.person===p;});return a+(s?s.pct:0);},0)/hs.length):0;
    h+='<div class="sh-card'+(shSel===p?' selected':'')+'" style="position:relative" onclick="shSel='+q(p)+';renderPage()"><label onclick="event.stopPropagation()" style="position:absolute;top:8px;right:8px;cursor:pointer"><input type="checkbox" class="sh-checkbox" data-name="'+esc(p)+'" onchange="updateBulkShBtn()"></label>';
    h+='<div style="font-weight:700;font-size:14px;margin-bottom:3px">'+esc(p)+'</div>';
    h+='<div style="font-size:12px;color:var(--text3)">'+t('holdingIn')+' '+hs.length+' '+t('companies2')+' · '+avg+'% '+t('pct')+'</div>';
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
var _netSelected=null;
function renderNetwork(){
  var cs=data.companies;
  var h='<div class="section-header"><div class="section-title">'+t('networkTitle')+'</div></div>';
  h+='<div class="card" style="margin-bottom:12px;padding:10px 16px;font-size:12px;color:var(--text2)">';
  h+=lang==='en'?'Click any company to reveal its ownership relationships. Click again to collapse.':'Clic en una empresa para ver sus relaciones. Clic de nuevo para colapsar.';
  h+='</div>';
  h+='<div class="card" style="padding:0">';
  if(!cs.length){ h+='<div class="empty">'+t('noData')+'</div>'; }
  else {
    h+='<table><thead><tr><th>'+t('name')+'</th><th>'+t('jurisdiction')+'</th><th>'+t('status')+'</th><th>'+t('shareholders2')+'</th><th>'+t('subsidiaries')+'</th><th></th></tr></thead><tbody>';
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
var _pending=[], _importRows=[], _importHeaders=[], _importMapping={}, _importEditable=[];
var SYSTEM_FIELDS=['Empresa','Jurisdiccion','Proposito','Ano','ID Fiscal','EIN','IRS','Director','Registered Agent','Direccion','Estado','Tags','Accionistas','Banco','Account #','Routing','SWIFT'];
function openImport(){
  var h='<div class="modal-header"><div class="modal-title">'+t('importTitle')+'</div><button class="close-btn" onclick="closeModal()">x</button></div>';
  h+='<div class="modal-body"><div class="import-hint">'+(lang==='en'?'Upload any CSV or Excel file. Map columns to fields, then edit before importing.':'Sube cualquier CSV o Excel. Mapea columnas y edita antes de importar.')+'</div>';
  h+='<div class="drop-zone" onclick="document.getElementById(\'fim\').click()" ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'" ondragleave="this.style.borderColor=\'\'" ondrop="event.preventDefault();this.style.borderColor=\'\';handleImportDrop(event)">';
  h+='<div style="font-size:28px;margin-bottom:6px">&#128194;</div><div style="font-weight:600">Click or drag &amp; drop</div>';
  h+='<div style="font-size:11px;color:var(--text3);margin-top:3px">.xlsx · .xls · .csv</div>';
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
  var subs=getSubs(id); var invs=data.investments.filter(function(i){return i.companyId===id;});
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
  var subs=getSubs(id); var invs=data.investments.filter(function(i){return i.companyId===id;});
  var w=window.open('','_blank');
  var h='<!DOCTYPE html><html><head><title>'+esc(c.name)+'</title><style>body{font-family:sans-serif;padding:28px;max-width:800px;margin:0 auto}h1{font-size:18px}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}th{background:#f5f5f5;padding:5px 8px;text-align:left}td{padding:5px 8px;border-bottom:1px solid #eee}.row{display:grid;grid-template-columns:180px 1fr;padding:5px 0;border-bottom:1px solid #eee;font-size:12px}.lbl{color:#888}h3{font-size:13px;margin:14px 0 5px}</style></head><body>';
  h+='<div style="display:flex;justify-content:space-between;margin-bottom:18px"><div><h1>'+esc(c.name)+'</h1><div style="color:#666;font-size:12px">'+esc(c.jurisdiction)+' · '+esc(c.yearFounded||c.year||'')+' · '+c.status+'</div></div></div>';
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
  var ov=document.createElement('div'); ov.className='overlay'; ov.id='modal-overlay';
  var m=document.createElement('div'); m.className='modal'+(lg?' modal-lg':''); m.innerHTML=html;
  ov.appendChild(m); document.body.appendChild(ov);
  ov.addEventListener('click',function(e){ if(e.target===ov) closeModal(); });
}
// Pass rerender=true only when closing after a data-mutating action.
// This prevents unnecessary full re-renders on every modal close (the main lag source).
function closeModal(rerender){
  var ov=document.getElementById('modal-overlay');
  if(ov) ov.remove();
  if(rerender) render();
}
