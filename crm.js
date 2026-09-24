// ═══════════════════════════════════════════════════════════════════════════════
// FamOfi Registry — CRM core: shared Tasks / Follow-ups + Activity timeline
// Loaded with `defer` after script.js and before banking.js.
//
// ONE task model and ONE activity log for the whole site. Every section plugs in
// through links, nothing is duplicated:
//   task     = { id, title, status:'open'|'waiting'|'done', dueDate, responsible, notes,
//                companyId, ref:{type,id,label}|null, category:'compliance'|'',
//                recur:''|'monthly'|'quarterly'|'yearly', seriesId,
//                createdAt/By, updatedAt/By, completedAt/By }
//     ref.type ∈ company | bank | investment | shareholder | director | document | loan
//   activity = { id, at, date, by, kind, text, companyId, companyIds, ref, from, to }
//     Only events that are not already stored elsewhere are logged here (notes, company
//     status changes, investment value changes). Timelines are ASSEMBLED on read from
//     shareholder/director history, bank-account activity, completed tasks and this log.
//
// STORAGE — two modes, chosen automatically:
//   'docs' : famofi/tasks + famofi/activity (own Firestore documents; keeps famofi/main
//            small and lets non-admin "task editors" work). Needs a Firestore rules update.
//   'main' : data.tasks + data.activity inside famofi/main (works with today's rules).
//   When 'docs' becomes available, anything stored in 'main' is moved over once.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var PAGE = 'tasks';
  TT.en[PAGE] = 'Tasks';
  TT.es[PAGE] = 'Tareas';

  // ── i18n ────────────────────────────────────────────────────────────────────
  var L = {
    en: {
      title:'Tasks & Follow-ups', newTask:'+ New task', compliance:'📅 Compliance schedule', exportCsv:'Export CSV',
      kOpen:'Open', kOverdue:'Overdue', kWeek:'Due this week', kWaiting:'Waiting on others', kDone:'Completed', kUpcoming:'Upcoming dates',
      kOpenSub:'open + waiting', kOverSub:'past due date', kWeekSub:'next 7 days', kWaitSub:'blocked by a third party', kDoneSub:'last 30 days', kUpSub:'expiries & maturities',
      search:'Search tasks, companies, notes…', stActive:'Open & waiting', stOpen:'Open', stWaiting:'Waiting on others', stDone:'Done', stAll:'All statuses',
      allResp:'Anyone responsible', unassigned:'— Unassigned —', allCompanies:'All companies', noCompany:'— No company —',
      allTypes:'Everything', anyDue:'Any due date', dueOver:'Overdue', dueWeek:'Due within 7 days', due30:'Due within 30 days', dueNone:'No due date',
      reset:'Reset filters', vDue:'By due date', vMonth:'By month', vCompany:'By company', showing:'Showing', of:'of', tasksN:'tasks',
      gOverdue:'Overdue', gToday:'Today', gWeek:'Next 7 days', g30:'Next 30 days', gLater:'Later', gNone:'No due date', gDone:'Done',
      noTasks:'No tasks match these filters.', noneYet:'No tasks yet. Create one here or from any company, bank account or investment.',
      tTitle:'Task', tCompany:'Company', tRelated:'Related to', tStatus:'Status', tDue:'Due date', tResp:'Responsible', tRepeat:'Repeats',
      tNotes:'Notes', tCategory:'Compliance / filing deadline', rNone:'Does not repeat', rMonthly:'Monthly', rQuarterly:'Quarterly', rYearly:'Yearly',
      relCompany:'The company itself', relGeneral:'General (no company)', save:'Save', cancel:'Cancel', del:'Delete', complete:'✓ Complete', reopen:'Reopen',
      editTask:'Edit task', addTask:'New task', reqTitle:'Please describe the task.', delConfirm:'Delete this task? (Completing it keeps it in the history instead.)',
      created:'Created', by:'by', completedOn:'Completed', nextCreated:'Next occurrence created for', ph:'e.g. Obtain signed shareholder documents',
      tBank:'Bank account', tInvestment:'Investment', tShareholder:'Shareholder', tDirector:'Director', tDocument:'Document', tLoan:'Loan', tCompanyOnly:'Company', tCompliance:'Compliance',
      upTitle:'Upcoming dates', upNone:'No document expiries or loan maturities in the next 90 days.', docExp:'Document expires', docExpd:'Document expired', loanMat:'Loan matures', createTask:'+ Task',
      acTitle:'Action items', acAll:'Open Tasks →', acNone:'Nothing pending — no open tasks or upcoming dates.',
      caTab:'Tasks & Activity', caOpen:'Open tasks', caNoOpen:'No open tasks for this company.', caNote:'Add a note', caNotePh:'e.g. Spoke with registered agent about annual filing', caAddNote:'Add note',
      caTimeline:'Activity timeline', caNoTimeline:'No activity recorded yet.', fAll:'All', fNotes:'Notes', fOwner:'Ownership & directors', fBank:'Banking', fTasks:'Tasks', fInv:'Investments', fStatus:'Status',
      evSH:'Shareholder', evSHout:'ceased as shareholder', evDir:'Director appointed', evDirOut:'Director ceased', evNote:'Note', evStatus:'Company status', evCreated:'Company added',
      evValue:'Investment values', evTaskDone:'Task completed', evBank:'Bank account',
      coFilter:'All tasks', coHasOpen:'Has open tasks', coHasOver:'Has overdue tasks', overdueN:'overdue', openN:'open',
      invFilter:'All valuations', invStale:'Valuation older than 6 months', invNoDate:'No valuation date', invFresh:'Valued in last 6 months',
      asOf:'as of', staleTip:'Market value is more than 6 months old', valuedAsOf:'Valued as of',
      ipFigures:'Figures', ipTasks:'Tasks', ipHistory:'Value history', ipNoHistory:'No value changes recorded yet (changes are logged from now on).', ipEdit:'Edit',
      expires:'Expires', setExpiry:'Expiry', expired:'Expired',
      cmTitle:'Compliance schedule', cmIntro:'Create a recurring compliance task for several companies at once. Each company gets its own task; when it is completed, the next one is created automatically.',
      cmTemplate:'Obligation', cmCustom:'Custom…', cmJur:'Jurisdiction', cmAllJur:'All jurisdictions', cmCompanies:'Companies', cmSelAll:'Select all', cmSelNone:'None',
      cmFirstDue:'First due date', cmCreate:'Create tasks', cmSkip:'already have this open task — skipped', cmReqDue:'Choose the first due date.', cmReqCo:'Select at least one company.', cmDone:'Created',
      storeMain:'Tasks and activity are saved in the main database. Enabling their own storage (Firestore rules) keeps the main database small and lets you give team members task-only access.',
      readOnly:'View-only access — you can view tasks but not change them.', notReady:'Loading tasks…', delNote:'Remove this note?',
      tpl:['Annual government / registry fee','Annual return / annual filing','Registered agent renewal','Economic substance filing','Beneficial ownership (UBO) filing / update','Tax return','Financial statements / audit','Certificate of good standing','Board / shareholder annual resolutions']
    },
    es: {
      title:'Tareas y Seguimientos', newTask:'+ Nueva tarea', compliance:'📅 Calendario de cumplimiento', exportCsv:'Exportar CSV',
      kOpen:'Abiertas', kOverdue:'Vencidas', kWeek:'Vencen esta semana', kWaiting:'Esperando a terceros', kDone:'Completadas', kUpcoming:'Próximas fechas',
      kOpenSub:'abiertas + en espera', kOverSub:'fecha vencida', kWeekSub:'próximos 7 días', kWaitSub:'dependen de un tercero', kDoneSub:'últimos 30 días', kUpSub:'vencimientos de documentos y préstamos',
      search:'Buscar tareas, empresas, notas…', stActive:'Abiertas y en espera', stOpen:'Abiertas', stWaiting:'Esperando a terceros', stDone:'Hechas', stAll:'Todos los estados',
      allResp:'Cualquier responsable', unassigned:'— Sin asignar —', allCompanies:'Todas las empresas', noCompany:'— Sin empresa —',
      allTypes:'Todo', anyDue:'Cualquier fecha', dueOver:'Vencidas', dueWeek:'Vencen en 7 días', due30:'Vencen en 30 días', dueNone:'Sin fecha',
      reset:'Limpiar filtros', vDue:'Por vencimiento', vMonth:'Por mes', vCompany:'Por empresa', showing:'Mostrando', of:'de', tasksN:'tareas',
      gOverdue:'Vencidas', gToday:'Hoy', gWeek:'Próximos 7 días', g30:'Próximos 30 días', gLater:'Más adelante', gNone:'Sin fecha', gDone:'Hechas',
      noTasks:'Ninguna tarea coincide con estos filtros.', noneYet:'Aún no hay tareas. Crea una aquí o desde cualquier empresa, cuenta o inversión.',
      tTitle:'Tarea', tCompany:'Empresa', tRelated:'Relacionada con', tStatus:'Estado', tDue:'Fecha límite', tResp:'Responsable', tRepeat:'Se repite',
      tNotes:'Notas', tCategory:'Cumplimiento / fecha de presentación', rNone:'No se repite', rMonthly:'Mensual', rQuarterly:'Trimestral', rYearly:'Anual',
      relCompany:'La empresa', relGeneral:'General (sin empresa)', save:'Guardar', cancel:'Cancelar', del:'Eliminar', complete:'✓ Completar', reopen:'Reabrir',
      editTask:'Editar tarea', addTask:'Nueva tarea', reqTitle:'Describe la tarea.', delConfirm:'¿Eliminar esta tarea? (Si la completas, queda en el historial.)',
      created:'Creada', by:'por', completedOn:'Completada', nextCreated:'Siguiente tarea creada para el', ph:'ej. Obtener documentos firmados de accionistas',
      tBank:'Cuenta bancaria', tInvestment:'Inversión', tShareholder:'Accionista', tDirector:'Director', tDocument:'Documento', tLoan:'Préstamo', tCompanyOnly:'Empresa', tCompliance:'Cumplimiento',
      upTitle:'Próximas fechas', upNone:'Sin vencimientos de documentos ni préstamos en los próximos 90 días.', docExp:'Documento vence', docExpd:'Documento vencido', loanMat:'Préstamo vence', createTask:'+ Tarea',
      acTitle:'Pendientes', acAll:'Abrir Tareas →', acNone:'Nada pendiente — sin tareas abiertas ni fechas próximas.',
      caTab:'Tareas y Actividad', caOpen:'Tareas abiertas', caNoOpen:'Sin tareas abiertas para esta empresa.', caNote:'Agregar nota', caNotePh:'ej. Hablé con el agente registrado sobre la presentación anual', caAddNote:'Agregar nota',
      caTimeline:'Historial de actividad', caNoTimeline:'Sin actividad registrada.', fAll:'Todo', fNotes:'Notas', fOwner:'Accionistas y directores', fBank:'Banca', fTasks:'Tareas', fInv:'Inversiones', fStatus:'Estado',
      evSH:'Accionista', evSHout:'dejó de ser accionista', evDir:'Director nombrado', evDirOut:'Director cesado', evNote:'Nota', evStatus:'Estado de la empresa', evCreated:'Empresa agregada',
      evValue:'Valores de inversión', evTaskDone:'Tarea completada', evBank:'Cuenta bancaria',
      coFilter:'Todas las tareas', coHasOpen:'Con tareas abiertas', coHasOver:'Con tareas vencidas', overdueN:'vencidas', openN:'abiertas',
      invFilter:'Todas las valuaciones', invStale:'Valuación de más de 6 meses', invNoDate:'Sin fecha de valuación', invFresh:'Valuada en los últimos 6 meses',
      asOf:'al', staleTip:'El valor de mercado tiene más de 6 meses', valuedAsOf:'Valuada al',
      ipFigures:'Cifras', ipTasks:'Tareas', ipHistory:'Historial de valores', ipNoHistory:'Sin cambios de valor registrados (se registran desde ahora).', ipEdit:'Editar',
      expires:'Vence', setExpiry:'Vencimiento', expired:'Vencido',
      cmTitle:'Calendario de cumplimiento', cmIntro:'Crea una tarea recurrente de cumplimiento para varias empresas a la vez. Cada empresa recibe su propia tarea; al completarla se crea la siguiente automáticamente.',
      cmTemplate:'Obligación', cmCustom:'Otra…', cmJur:'Jurisdicción', cmAllJur:'Todas las jurisdicciones', cmCompanies:'Empresas', cmSelAll:'Todas', cmSelNone:'Ninguna',
      cmFirstDue:'Primera fecha límite', cmCreate:'Crear tareas', cmSkip:'ya tienen esta tarea abierta — omitidas', cmReqDue:'Elige la primera fecha límite.', cmReqCo:'Selecciona al menos una empresa.', cmDone:'Creadas',
      storeMain:'Las tareas y la actividad se guardan en la base principal. Habilitar su propio almacenamiento (reglas de Firestore) mantiene la base principal liviana y permite dar acceso solo a tareas.',
      readOnly:'Solo lectura — puedes ver las tareas pero no modificarlas.', notReady:'Cargando tareas…', delNote:'¿Eliminar esta nota?',
      tpl:['Tasa anual gubernamental / de registro','Declaración / presentación anual','Renovación de agente registrado','Declaración de sustancia económica','Registro / actualización de beneficiario final (UBO)','Declaración de impuestos','Estados financieros / auditoría','Certificado de vigencia (good standing)','Resoluciones anuales de directorio / accionistas']
    }
  };
  function lt(k) { return (L[lang] && L[lang][k] !== undefined) ? L[lang][k] : L.en[k]; }

  var ST = [
    { k:'open',    en:'Open',              es:'Abierta' },
    { k:'waiting', en:'Waiting on others', es:'Esperando a terceros' },
    { k:'done',    en:'Done',              es:'Hecha' }
  ];
  var REF_ICON = { company:'🏢', bank:'🏦', investment:'📈', shareholder:'👥', director:'🪪', document:'📄', loan:'💵', compliance:'📅' };
  var REF_LBL = { company:'tCompanyOnly', bank:'tBank', investment:'tInvestment', shareholder:'tShareholder', director:'tDirector', document:'tDocument', loan:'tLoan', compliance:'tCompliance' };
  var STALE_DAYS = 180;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseD(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function daysUntil(s) { var d = parseD(s); if (!d) return null; return Math.round((d - parseD(today())) / 86400000); }
  function fmtDay(s) { var d = parseD(s); if (!d) return '—'; return d.toLocaleDateString(lang === 'es' ? 'es-EC' : 'en-US', { month:'short', day:'numeric', year:'numeric' }); }
  function fmtLong(s) { var d = parseD(s); if (!d) return '—'; return d.toLocaleDateString(lang === 'es' ? 'es-EC' : 'en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' }); }
  function fmtMonth(s) { var d = parseD(s); if (!d) return '—'; var t0 = d.toLocaleDateString(lang === 'es' ? 'es-EC' : 'en-US', { month:'long', year:'numeric' }); return t0.charAt(0).toUpperCase() + t0.slice(1); }
  function addMonths(s, n) { var d = parseD(s); if (!d) return ''; var day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nowISO() { return new Date().toISOString(); }
  function me() { return (window.currentUser && (currentUser.displayName || currentUser.email)) || ''; }
  function jq(s) { return esc("'" + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"); }
  function opt(v, label, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function uniqSorted(arr) { var m = {}; arr.forEach(function (v) { v = String(v || '').trim(); if (v && !m[v.toLowerCase()]) m[v.toLowerCase()] = v; }); return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.localeCompare(b); }); }
  function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function coById(id) { return (data.companies || []).find(function (c) { return c.id === id; }); }
  function modalOpen() { return !!document.getElementById('modal-overlay'); }

  function dueState(date, done) {
    if (!date || done) return '';
    var d = daysUntil(date); if (d === null) return '';
    return d < 0 ? 'overdue' : d === 0 ? 'today' : d <= 7 ? 'soon' : 'ok';
  }
  function dueText(date) {
    var d = daysUntil(date); if (d === null) return '';
    var es = lang === 'es';
    if (d === 0) return es ? 'hoy' : 'today';
    if (d === 1) return es ? 'mañana' : 'tomorrow';
    if (d === -1) return es ? '1 día vencida' : '1 day overdue';
    return d < 0 ? (es ? (-d) + ' días vencida' : (-d) + ' days overdue') : (es ? 'en ' + d + ' días' : 'in ' + d + ' days');
  }
  function dueChip(date, done) {
    if (!date) return '';
    var st = dueState(date, done) || 'ok';
    var cls = st === 'today' ? 'soon' : st;
    return '<span class="bk-due bk-due-' + cls + '" title="' + esc(dueText(date)) + '">' + (st === 'overdue' ? '⚠ ' : '') + esc(fmtDay(date)) + '</span>';
  }
  function stLabel(k) { var s = ST.find(function (x) { return x.k === k; }) || ST[0]; return lang === 'es' ? s.es : s.en; }
  function pill(k) { return '<span class="bk-pill tk-st-' + (k || 'open') + '"><i></i>' + esc(stLabel(k)) + '</span>'; }

  // ── Storage adapter ─────────────────────────────────────────────────────────
  var S = { mode:'main', ready:false, tasks:[], activity:[], unsub:[], lastW:{}, timers:{}, roleFlags:{}, listeners:[] };
  var DOCS = { tasks:'tasks', activity:'activity' };
  function T() { if (S.mode === 'docs') return S.tasks; if (!Array.isArray(data.tasks)) data.tasks = []; return data.tasks; }
  function A() { if (S.mode === 'docs') return S.activity; if (!Array.isArray(data.activity)) data.activity = []; return data.activity; }
  function canEdit() { return S.ready && (isAdmin() || (S.mode === 'docs' && S.roleFlags.tasks === true)); }

  S.pend = { tasks:[], activity:[] };
  function writeDoc(which) {
    clearTimeout(S.timers[which]);
    return new Promise(function (resolve, reject) {
      S.pend[which].push({ resolve:resolve, reject:reject });
      S.timers[which] = setTimeout(function () {
        var waiters = S.pend[which]; S.pend[which] = [];
        var payload = JSON.stringify(which === 'tasks' ? S.tasks : S.activity);
        S.lastW[which] = payload;
        setSyncDot('saving');
        _db.collection('famofi').doc(DOCS[which]).set({ payload:payload }).then(function () {
          setSyncDot('ok'); waiters.forEach(function (w) { w.resolve(); });
        }, function (e) {
          setSyncDot('error'); console.error('[crm] save ' + which, e); waiters.forEach(function (w) { w.reject(e); });
        });
      }, 300);
    });
  }
  function persist(which, quiet) {
    var p;
    if (S.mode === 'docs') p = Promise.all((which ? [which] : ['tasks', 'activity']).map(writeDoc));
    else { save(); p = Promise.resolve(); }
    if (!quiet) changed();
    return p;
  }
  function changed() {
    S.listeners.forEach(function (fn) { try { fn(); } catch (e) { console.warn(e); } });
    if (typeof page !== 'undefined' && ['tasks', 'companies', 'investments', 'bankaccounts'].indexOf(page) !== -1) render();
    else navBadge();
  }
  function parsePayload(snap) { try { return (snap.exists && snap.data().payload) ? JSON.parse(snap.data().payload) : []; } catch (e) { return []; } }

  function init() {
    if (S.initStarted) return; S.initStarted = true;
    // Role flags (e.g. { role:'viewer', tasks:true } lets a viewer manage tasks in 'docs' mode)
    _ROLES_REF.get().then(function (snap) {
      var r = (snap.exists && snap.data()) || {}, u = window.currentUser || {};
      var e = r[u.uid] || r[u.email] || r[(u.email || '').toLowerCase()];
      S.roleFlags = (e && typeof e === 'object') ? e : {};
      if (S.ready) changed();
    }).catch(function () {});
    probe(0);
  }
  function probe(attempt) {
    var ref = _db.collection('famofi');
    Promise.all([ref.doc(DOCS.tasks).get(), ref.doc(DOCS.activity).get()]).then(function (snaps) {
      S.mode = 'docs';
      S.tasks = parsePayload(snaps[0]); S.activity = parsePayload(snaps[1]);
      subscribe();
      S.ready = true;
      migrateMainToDocs();
      onReady();
    }).catch(function (e) {
      if (e && e.code === 'permission-denied') { S.mode = 'main'; S.ready = true; onReady(); return; }
      console.warn('[crm] storage probe failed, retrying', e && e.code);
      if (attempt < 6) setTimeout(function () { probe(attempt + 1); }, 2000 * (attempt + 1));
      else { S.mode = 'main'; S.ready = true; onReady(); }
    });
  }
  function subscribe() {
    ['tasks', 'activity'].forEach(function (which) {
      S.unsub.push(_db.collection('famofi').doc(DOCS[which]).onSnapshot(function (snap) {
        var raw = snap.exists ? snap.data().payload : '[]';
        if (raw === S.lastW[which]) return; // our own write
        var arr = parsePayload(snap);
        if (which === 'tasks') S.tasks = arr; else S.activity = arr;
        if (!modalOpen()) changed();
      }, function (e) { console.warn('[crm] listener', which, e.code); }));
    });
  }
  function migrateMainToDocs() {
    if (!isAdmin()) return;
    var mt = Array.isArray(data.tasks) ? data.tasks : [], ma = Array.isArray(data.activity) ? data.activity : [];
    if (!mt.length && !ma.length) return;
    function merge(dst, src) { var ids = {}; dst.forEach(function (x) { ids[x.id] = x; }); src.forEach(function (x) { if (!ids[x.id]) dst.push(x); else if ((x.updatedAt || '') > (ids[x.id].updatedAt || '')) Object.assign(ids[x.id], x); }); }
    merge(S.tasks, mt); merge(S.activity, ma);
    Promise.all([writeDoc('tasks'), writeDoc('activity')]).then(function () {
      delete data.tasks; delete data.activity; save();
      console.log('[crm] moved ' + mt.length + ' tasks and ' + ma.length + ' activity entries to their own storage');
    });
  }
  function onReady() {
    (S.readyFns || []).forEach(function (fn) { try { fn(); } catch (e) { console.warn(e); } });
    changed();
  }
  function whenReady(fn) { if (S.ready) fn(); else (S.readyFns = S.readyFns || []).push(fn); }

  // Boot after the main data subscription starts (post-login)
  var _startSub = window.startSub;
  window.startSub = function () { var r = _startSub.apply(this, arguments); init(); return r; };

  // ── Tasks API ───────────────────────────────────────────────────────────────
  function isDone(t) { return t.status === 'done'; }
  function findTask(id) { return T().find(function (t) { return t.id === id; }); }
  function tasksFor(type, id, openOnly) {
    return T().filter(function (t) { return t.ref && t.ref.type === type && t.ref.id === id && (!openOnly || !isDone(t)); }).sort(byDue);
  }
  function tasksForCompany(cid, openOnly) { return T().filter(function (t) { return t.companyId === cid && (!openOnly || !isDone(t)); }).sort(byDue); }
  function byDue(a, b) { var da = a.dueDate || '9999', db2 = b.dueDate || '9999'; return da < db2 ? -1 : da > db2 ? 1 : (a.createdAt || '').localeCompare(b.createdAt || ''); }
  function addTask(t) {
    var o = Object.assign({ id:uid(), title:'', status:'open', dueDate:'', responsible:'', notes:'', companyId:'', ref:null, category:'', recur:'', createdAt:nowISO(), createdBy:me() }, t);
    o.updatedAt = o.createdAt; o.updatedBy = me();
    if (o.recur && !o.seriesId) o.seriesId = uid();
    T().push(o); return o;
  }
  function completeTask(id, silent) {
    var t = findTask(id); if (!t || isDone(t) || !canEdit()) return null;
    t.status = 'done'; t.completedAt = nowISO(); t.completedBy = me(); t.updatedAt = t.completedAt; t.updatedBy = me();
    var next = null;
    if (t.recur && t.dueDate) {
      var n = { monthly:1, quarterly:3, yearly:12 }[t.recur] || 12;
      next = addTask({ title:t.title, dueDate:addMonths(t.dueDate, n), responsible:t.responsible, notes:t.notes, companyId:t.companyId, ref:t.ref, category:t.category, recur:t.recur, seriesId:t.seriesId || uid() });
    }
    if (!silent) persist('tasks');
    return next;
  }
  function reopenTask(id) { var t = findTask(id); if (!t || !canEdit()) return; t.status = 'open'; delete t.completedAt; delete t.completedBy; t.updatedAt = nowISO(); t.updatedBy = me(); persist('tasks'); }
  function deleteTask(id) { if (!canEdit()) return; var arr = T(); var i = arr.findIndex(function (t) { return t.id === id; }); if (i > -1) arr.splice(i, 1); persist('tasks'); }

  // ── Activity API ────────────────────────────────────────────────────────────
  function log(e) {
    var o = Object.assign({ id:uid(), at:nowISO(), date:today(), by:me(), kind:'note', text:'' }, e);
    A().push(o); return o;
  }

  // ── Related records ─────────────────────────────────────────────────────────
  function relOptions(cid) {
    var c = coById(cid), out = [];
    if (!c) return out;
    out.push({ v:'', label:lt('relCompany') });
    (c.banking || []).forEach(function (b) { out.push({ v:'bank:' + b.id, label:REF_ICON.bank + ' ' + (b.bank || '—') + (b.accountName || b.type ? ' · ' + (b.accountName || b.type) : '') + (b.currency ? ' (' + b.currency + ')' : '') }); });
    (data.investments || []).filter(function (i) { return invCoIds(i).indexOf(cid) !== -1; }).forEach(function (i) { out.push({ v:'investment:' + i.id, label:REF_ICON.investment + ' ' + i.name }); });
    (c.shareholders || []).forEach(function (s) { out.push({ v:'shareholder:' + s.id, label:REF_ICON.shareholder + ' ' + resolveOwner(s) + (s.pct ? ' (' + s.pct + '%)' : '') }); });
    (c.directors || []).forEach(function (d) { out.push({ v:'director:' + d.id, label:REF_ICON.director + ' ' + d.name + (d.position ? ' — ' + d.position : '') }); });
    (c.documents || []).forEach(function (d) { out.push({ v:'document:' + (d.path || d.name), label:REF_ICON.document + ' ' + d.name }); });
    (c.portfolioLoans || []).forEach(function (l) { out.push({ v:'loan:' + l.id, label:REF_ICON.loan + ' ' + (l.lender || '—') + (l.amount ? ' · ' + (l.currency || '') + ' ' + Number(l.amount).toLocaleString() : '') }); });
    return out;
  }
  function refLabel(t) {
    var r = t.ref; if (!r) return '';
    var c = coById(t.companyId), live = '';
    if (r.type === 'bank') { var b = c && (c.banking || []).find(function (x) { return x.id === r.id; }); if (b) live = (b.bank || '') + (b.accountName || b.type ? ' · ' + (b.accountName || b.type) : ''); }
    else if (r.type === 'investment') { var i = (data.investments || []).find(function (x) { return x.id === r.id; }); if (i) live = i.name; }
    else if (r.type === 'shareholder') { var s = c && (c.shareholders || []).find(function (x) { return x.id === r.id; }); if (s) live = resolveOwner(s); }
    else if (r.type === 'director') { var d = c && (c.directors || []).find(function (x) { return x.id === r.id; }); if (d) live = d.name; }
    else if (r.type === 'document') { var dc = c && (c.documents || []).find(function (x) { return (x.path || x.name) === r.id; }); if (dc) live = dc.name; }
    else if (r.type === 'loan') { var l = c && (c.portfolioLoans || []).find(function (x) { return x.id === r.id; }); if (l) live = l.lender; }
    return live || r.label || '';
  }
  function typeOf(t) { return t.category === 'compliance' ? 'compliance' : (t.ref ? t.ref.type : (t.companyId ? 'company' : 'general')); }
  function refChip(t) {
    var ty = typeOf(t); if (ty === 'general') return '';
    var lbl = ty === 'company' || ty === 'compliance' ? lt(REF_LBL[ty]) : refLabel(t);
    return '<span class="tk-ref" onclick="event.stopPropagation();crm.openRefOf(' + jq(t.id) + ')">' + (REF_ICON[ty] || '•') + ' ' + esc(trunc(lbl, 42)) + '</span>';
  }
  function openCompanyTab(cid, panelId) {
    closeModal(); openCompany(cid);
    var n = 0;
    (function click() {
      var ov = document.getElementById('modal-overlay');
      var btn = ov && (panelId === 'td-loan' ? ov.querySelector('#tab-loan-btn') : Array.prototype.find.call(ov.querySelectorAll('.tab'), function (x) { return (x.getAttribute('onclick') || '').indexOf("'" + panelId + "'") !== -1; }));
      if (btn) btn.click(); else if (n++ < 15) setTimeout(click, 40);
    })();
  }
  function openRefOf(id) {
    var t = findTask(id); if (!t) return;
    var r = t.ref, cid = t.companyId;
    if (r && r.type === 'bank' && window.bk && findBank(r.id)) return bk.open(r.id, null);
    if (r && r.type === 'investment') return openInvestment(r.id);
    if (!cid || !coById(cid)) return;
    var tab = { shareholder:'td-sh', director:'td-dir', document:'td-doc', loan:'td-loan' }[r && r.type] || 'td-crm';
    openCompanyTab(cid, tab);
  }
  function findBank(bid) { var out = null; (data.companies || []).some(function (c) { var b = (c.banking || []).find(function (x) { return x.id === bid; }); if (b) out = { c:c, b:b }; return !!b; }); return out; }

  // ── Upcoming dates (derived — nothing stored) ───────────────────────────────
  function upcoming(cid, horizon) {
    horizon = horizon || 90; var out = [];
    (data.companies || []).forEach(function (c) {
      if (cid && c.id !== cid) return;
      (c.documents || []).forEach(function (d) {
        if (!d.expiryDate) return; var n = daysUntil(d.expiryDate);
        if (n !== null && n <= horizon) out.push({ kind:'document', date:d.expiryDate, c:c, label:d.name, id:d.path || d.name, text:(n < 0 ? lt('docExpd') : lt('docExp')) });
      });
      (c.portfolioLoans || []).forEach(function (l) {
        if (!l.maturityDate || /paid/i.test(l.status || '')) return; var n = daysUntil(l.maturityDate);
        if (n !== null && n <= horizon && n >= -30) out.push({ kind:'loan', date:l.maturityDate, c:c, label:(l.lender || '—') + (l.amount ? ' · ' + (l.currency || '') + ' ' + Number(l.amount).toLocaleString() : ''), id:l.id, text:lt('loanMat') });
      });
    });
    return out.sort(function (a, b) { return a.date.localeCompare(b.date); });
  }
  function upcomingHTML(list, compact) {
    if (!list.length) return '<div class="bk-muted" style="padding:4px 0">' + lt('upNone') + '</div>';
    var h = '<div class="tk-up-list">';
    list.forEach(function (u) {
      var hasTask = tasksFor(u.kind, u.id, true).length;
      h += '<div class="tk-up"><span>' + REF_ICON[u.kind] + '</span><div class="tk-up-main"><div><b>' + esc(u.text) + '</b> · ' + esc(trunc(u.label, 48)) + '</div>' + (compact ? '' : '<div class="bk-sub"><span class="bk-link" onclick="crm.openCompanyTab(' + jq(u.c.id) + ',' + jq(u.kind === 'loan' ? 'td-loan' : 'td-doc') + ')">' + esc(u.c.name) + '</span></div>') + '</div>';
      h += '<div class="tk-up-r">' + dueChip(u.date) + (canEdit() && !hasTask ? '<button class="btn btn-outline btn-sm" onclick="crm.taskForm(null,{companyId:' + jq(u.c.id) + ',ref:' + jq(u.kind + ':' + u.id) + ',title:' + jq(u.text + ': ' + u.label) + ',dueDate:' + jq(u.date) + '})">' + lt('createTask') + '</button>' : (hasTask ? '<span class="bk-muted" style="font-size:11px">🎯 ' + hasTask + '</span>' : '')) + '</div></div>';
    });
    return h + '</div>';
  }

  // ── Task row + list rendering (shared by every section) ─────────────────────
  function taskRow(t, opts) {
    opts = opts || {};
    var done = isDone(t), ds = dueState(t.dueDate, done), c = coById(t.companyId);
    var h = '<div class="tk-row' + (done ? ' done' : '') + (ds === 'overdue' ? ' over' : '') + '" onclick="crm.taskForm(' + jq(t.id) + ')">';
    h += canEdit() ? '<button class="tk-check' + (done ? ' on' : '') + '" title="' + esc(done ? lt('reopen') : lt('complete')) + '" onclick="event.stopPropagation();crm.' + (done ? 'reopen' : 'complete') + '(' + jq(t.id) + ')">' + (done ? '✓' : '') + '</button>' : '<span class="tk-check ro' + (done ? ' on' : '') + '">' + (done ? '✓' : '') + '</span>';
    h += '<div class="tk-main"><div class="tk-title">' + esc(t.title) + (t.recur ? ' <span class="tk-recur" title="' + esc(lt('r' + t.recur.charAt(0).toUpperCase() + t.recur.slice(1))) + '">↻</span>' : '') + '</div>';
    h += '<div class="tk-meta">' + (opts.noRef ? '' : refChip(t)) + (c && !opts.noCompany ? '<span class="tk-co" onclick="event.stopPropagation();crm.openCompanyTab(' + jq(c.id) + ',\'td-crm\')">' + esc(c.name) + '</span>' : '') + (t.notes ? '<span class="bk-muted" title="' + esc(t.notes) + '">📝 ' + esc(trunc(t.notes, 50)) + '</span>' : '') + '</div></div>';
    h += '<div class="tk-right">' + (t.responsible ? '<span class="tk-resp">👤 ' + esc(t.responsible) + '</span>' : '') + (done ? '<span class="bk-muted" style="font-size:11px">' + esc(fmtDay((t.completedAt || '').slice(0, 10))) + '</span>' : dueChip(t.dueDate)) + (t.status === 'waiting' ? pill('waiting') : '') + '</div>';
    return h + '</div>';
  }

  // ── Task form (create / edit) ───────────────────────────────────────────────
  var ret = null; // function to return to the caller (bank panel, company tab…)
  function taskForm(id, preset, back) {
    if (back !== undefined) ret = back || null;
    else ret = (modalOpen() && modalRefresher) ? modalRefresher : null;
    var t = id ? findTask(id) : null;
    if (id && !t) return;
    preset = preset || {};
    var ed = canEdit();
    var v = t ? t : { title:preset.title || '', status:'open', dueDate:preset.dueDate || '', responsible:preset.responsible || '', notes:'', companyId:preset.companyId || '', ref:null, category:preset.category || '', recur:preset.recur || '' };
    var refVal = t ? (t.ref ? t.ref.type + ':' + t.ref.id : '') : (preset.ref || '');
    var cos = (data.companies || []).slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
    var h = '<div class="modal-header"><div><div class="modal-title">' + (t ? lt('editTask') : lt('addTask')) + '</div>';
    if (t) h += '<div class="modal-subtitle">' + pill(t.status) + ' · ' + lt('created') + ' ' + esc(fmtDay((t.createdAt || '').slice(0, 10))) + (t.createdBy ? ' ' + lt('by') + ' ' + esc(t.createdBy) : '') + (t.completedAt ? ' · ' + lt('completedOn') + ' ' + esc(fmtDay(t.completedAt.slice(0, 10))) + (t.completedBy ? ' ' + lt('by') + ' ' + esc(t.completedBy) : '') : '') + '</div>';
    h += '</div><button class="close-btn" onclick="crm.back()">×</button></div><div class="modal-body">';
    var dis = ed ? '' : ' disabled';
    h += '<div class="form-group"><label class="lbl">' + lt('tTitle') + ' *</label><input class="inp" id="tk-title" value="' + esc(v.title) + '" placeholder="' + esc(lt('ph')) + '"' + dis + '></div>';
    h += '<div class="form-grid" style="margin-top:12px">';
    h += '<div class="form-group"><label class="lbl">' + lt('tCompany') + '</label><select class="inp" id="tk-co" onchange="crm._relRefresh()"' + dis + '>' + opt('', lt('relGeneral'), !v.companyId);
    cos.forEach(function (c) { h += opt(c.id, c.name + (c.status === 'liquidated' ? ' ✕' : ''), c.id === v.companyId); });
    h += '</select></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tRelated') + '</label><select class="inp" id="tk-ref"' + dis + '>' + relSelectOptions(v.companyId, refVal, v.ref) + '</select></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tDue') + '</label><input type="date" class="inp" id="tk-due" value="' + esc(v.dueDate || '') + '"' + dis + '></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tResp') + '</label><input class="inp" id="tk-resp" list="tk-dl-resp" value="' + esc(v.responsible || '') + '"' + dis + '></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tStatus') + '</label><select class="inp" id="tk-status"' + dis + '>' + ST.map(function (s) { return opt(s.k, stLabel(s.k), s.k === v.status); }).join('') + '</select></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tRepeat') + '</label><select class="inp" id="tk-recur"' + dis + '>' + opt('', lt('rNone'), !v.recur) + opt('monthly', lt('rMonthly'), v.recur === 'monthly') + opt('quarterly', lt('rQuarterly'), v.recur === 'quarterly') + opt('yearly', lt('rYearly'), v.recur === 'yearly') + '</select></div>';
    h += '<div class="form-group full"><label class="tk-cb"><input type="checkbox" id="tk-cat"' + (v.category === 'compliance' ? ' checked' : '') + dis + '> 📅 ' + lt('tCategory') + '</label></div>';
    h += '<div class="form-group full"><label class="lbl">' + lt('tNotes') + '</label><textarea class="inp" id="tk-notes" rows="3"' + dis + '>' + esc(v.notes || '') + '</textarea></div>';
    h += '</div>';
    h += '<datalist id="tk-dl-resp">' + respNames().map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist>';
    h += '<div id="tk-msg"></div>';
    h += '<div class="tk-form-actions">';
    if (t && ed) h += '<button class="bk-link bk-danger-link" onclick="crm._del(' + jq(t.id) + ')">🗑 ' + lt('del') + '</button>';
    h += '<span style="flex:1"></span><button class="btn btn-outline" onclick="crm.back()">' + lt('cancel') + '</button>';
    if (ed) {
      if (t && !isDone(t)) h += '<button class="btn btn-teal" onclick="crm._saveTask(' + jq(t.id) + ',true)">' + lt('complete') + '</button>';
      h += '<button class="btn btn-primary" onclick="crm._saveTask(' + jq(t ? t.id : '') + ',false)">' + lt('save') + '</button>';
    }
    h += '</div></div>';
    showModal(h);
    if (!t && ed) setTimeout(function () { var el = document.getElementById('tk-title'); if (el) el.focus(); }, 30);
  }
  function relSelectOptions(cid, cur, curRef) {
    if (!cid) return opt('', '—', true);
    var list = relOptions(cid), found = false, h = '';
    list.forEach(function (o) { var s = o.v === cur; if (s) found = true; h += opt(o.v, o.label, s); });
    if (cur && !found) h += opt(cur, (curRef && curRef.label) || cur, true); // record no longer exists — keep the link
    return h;
  }
  function relRefresh() { var el = document.getElementById('tk-ref'); if (el) el.innerHTML = relSelectOptions(gv('tk-co'), '', null); }
  function respNames() {
    var n = T().map(function (t) { return t.responsible; });
    rowsBanks().forEach(function (b) { n.push(b.responsible); });
    n.push(me());
    return uniqSorted(n);
  }
  function rowsBanks() { var o = []; (data.companies || []).forEach(function (c) { (c.banking || []).forEach(function (b) { o.push(b); }); }); return o; }
  function saveTask(id, andComplete) {
    if (!canEdit()) return;
    var title = gv('tk-title').trim();
    if (!title) { document.getElementById('tk-msg').innerHTML = '<div class="imp-err">' + lt('reqTitle') + '</div>'; return; }
    var cid = gv('tk-co'), rv = gv('tk-ref'), ref = null;
    if (cid && rv) { var i = rv.indexOf(':'); var ty = rv.slice(0, i), rid = rv.slice(i + 1); var o = relOptions(cid).find(function (x) { return x.v === rv; }); ref = { type:ty, id:rid, label:o ? o.label.replace(/^\S+\s/, '') : '' }; }
    var vals = { title:title, companyId:cid, ref:ref, dueDate:gv('tk-due'), responsible:gv('tk-resp').trim(), status:gv('tk-status') || 'open', recur:gv('tk-recur'), category:document.getElementById('tk-cat').checked ? 'compliance' : '', notes:gv('tk-notes') };
    var t;
    if (id) { t = findTask(id); if (!t) return; var wasDone = isDone(t); Object.assign(t, vals, { updatedAt:nowISO(), updatedBy:me() }); if (t.recur && !t.seriesId) t.seriesId = uid(); if (vals.status === 'done' && !wasDone) { t.status = 'open'; andComplete = true; } if (vals.status !== 'done' && wasDone) { delete t.completedAt; delete t.completedBy; } }
    else { if (vals.status === 'done') { vals.status = 'open'; andComplete = true; } t = addTask(vals); }
    if (andComplete) completeTask(t.id, true);
    persist('tasks');
    back();
  }
  function del(id) { if (!confirm(lt('delConfirm'))) return; deleteTask(id); back(); }
  function back() { var r = ret; ret = null; if (r) r(); else closeModal(); }
  function complete(id) { completeTask(id); refreshModal(); }
  function reopen(id) { reopenTask(id); refreshModal(); }
  var modalRefresher = null; // re-renders the open panel after a quick action
  function refreshModal() { if (modalRefresher && modalOpen()) modalRefresher(); }

  // ── Tasks tab ───────────────────────────────────────────────────────────────
  var F0 = { q:'', status:'', resp:'', company:'', type:'', due:'' };
  var F = Object.assign({}, F0), view = 'due';
  try { view = localStorage.getItem('fm_tk_view') || 'due'; } catch (e) {}
  function fCount() { return Object.keys(F0).filter(function (k) { return F[k]; }).length; }
  function tMatch(t) {
    var done = isDone(t), c = coById(t.companyId);
    if (F.status === '' && done) return false;
    if (F.status && F.status !== 'all' && t.status !== F.status) return false;
    if (F.q) { var hay = [t.title, t.notes, t.responsible, c && c.name, refLabel(t), stLabel(t.status)].join(' ').toLowerCase(); if (hay.indexOf(F.q.toLowerCase().trim()) === -1) return false; }
    if (F.resp) { if (F.resp === '__none') { if ((t.responsible || '').trim()) return false; } else if (t.responsible !== F.resp) return false; }
    if (F.company) { if (F.company === '__none') { if (t.companyId) return false; } else if (t.companyId !== F.company) return false; }
    if (F.type && typeOf(t) !== F.type) return false;
    if (F.due) {
      var d = daysUntil(t.dueDate);
      if (F.due === 'overdue' && dueState(t.dueDate, done) !== 'overdue') return false;
      if (F.due === 'week' && !(d !== null && d >= 0 && d <= 7 && !done)) return false;
      if (F.due === '30' && !(d !== null && d >= 0 && d <= 30 && !done)) return false;
      if (F.due === 'none' && t.dueDate) return false;
    }
    return true;
  }
  function renderTab() {
    if (!S.ready) return '<div class="card"><div class="empty">' + lt('notReady') + '</div></div>';
    var all = T(), ed = canEdit();
    var open = all.filter(function (t) { return !isDone(t); });
    var list = all.filter(tMatch).sort(byDue);
    var nOver = open.filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    var nWeek = open.filter(function (t) { var d = daysUntil(t.dueDate); return d !== null && d >= 0 && d <= 7; }).length;
    var nWait = open.filter(function (t) { return t.status === 'waiting'; }).length;
    var d30 = new Date(); d30.setDate(d30.getDate() - 30); d30 = d30.toISOString();
    var nDone = all.filter(function (t) { return isDone(t) && (t.completedAt || '') >= d30; }).length;
    var ups = upcoming(null, 90);
    var h = '';
    if (!ed) h += '<div class="readonly-banner">' + lt('readOnly') + '</div>';
    h += '<div class="section-header"><div class="section-title">' + lt('title') + ' <span style="color:var(--text3);font-weight:400;font-size:14px">(' + open.length + ')</span></div><div style="display:flex;gap:8px;flex-wrap:wrap">';
    h += '<button class="btn btn-teal btn-sm" onclick="crm.exportCSV()">' + lt('exportCsv') + '</button>';
    if (ed) h += '<button class="btn btn-outline btn-sm" onclick="crm.complianceForm()">' + lt('compliance') + '</button><button class="btn btn-primary" onclick="crm.taskForm(null,{},null)">' + lt('newTask') + '</button>';
    h += '</div></div>';
    function tile(label, val, sub, cls, click, active) { return '<button class="kpi bk-kpi ' + cls + (active ? ' active' : '') + '" onclick="' + click + '"><div class="kpi-label">' + label + '</div><div class="kpi-val">' + val + '</div><div class="kpi-sub">' + sub + '</div></button>'; }
    var only = function (k, v) { return fCount() === 1 && F[k] === v; };
    h += '<div class="bk-kpis">';
    h += tile(lt('kOpen'), open.length, lt('kOpenSub'), 'bk-k-total', 'crm.reset()', fCount() === 0);
    h += tile(lt('kOverdue'), nOver, lt('kOverSub'), 'bk-k-closing', "crm.quick('due','overdue')", only('due', 'overdue'));
    h += tile(lt('kWeek'), nWeek, lt('kWeekSub'), 'bk-k-needs', "crm.quick('due','week')", only('due', 'week'));
    h += tile(lt('kWaiting'), nWait, lt('kWaitSub'), 'tk-k-wait', "crm.quick('status','waiting')", only('status', 'waiting'));
    h += tile(lt('kDone'), nDone, lt('kDoneSub'), 'bk-k-open', "crm.quick('status','done')", only('status', 'done'));
    h += tile(lt('kUpcoming'), ups.length, lt('kUpSub'), 'tk-k-up', "document.getElementById('tk-up-card').scrollIntoView({behavior:'smooth'})", false);
    h += '</div>';

    // Filters
    var resps = uniqSorted(all.map(function (t) { return t.responsible; }));
    var coIds = uniqSorted(all.map(function (t) { return t.companyId; }));
    h += '<div class="toolbar bk-toolbar"><div class="search-wrap"><span class="si">&#8981;</span><input type="text" id="tk-f-q" placeholder="' + esc(lt('search')) + '" value="' + esc(F.q) + '" oninput="crm.set(\'q\',this.value)"></div>';
    h += '<select class="filter" id="tk-f-status" onchange="crm.set(\'status\',this.value)">' + opt('', lt('stActive'), !F.status) + opt('open', lt('stOpen'), F.status === 'open') + opt('waiting', lt('stWaiting'), F.status === 'waiting') + opt('done', lt('stDone'), F.status === 'done') + opt('all', lt('stAll'), F.status === 'all') + '</select>';
    h += '<select class="filter" id="tk-f-type" onchange="crm.set(\'type\',this.value)">' + opt('', lt('allTypes'), !F.type) + ['compliance', 'company', 'bank', 'investment', 'shareholder', 'director', 'document', 'loan'].map(function (k) { return opt(k, REF_ICON[k] + ' ' + lt(REF_LBL[k]), F.type === k); }).join('') + '</select>';
    h += '<select class="filter" id="tk-f-resp" onchange="crm.set(\'resp\',this.value)">' + opt('', lt('allResp'), !F.resp) + opt('__none', lt('unassigned'), F.resp === '__none') + resps.map(function (r) { return opt(r, r, F.resp === r); }).join('') + '</select>';
    h += '<select class="filter" id="tk-f-co" onchange="crm.set(\'company\',this.value)" style="max-width:210px">' + opt('', lt('allCompanies'), !F.company) + opt('__none', lt('noCompany'), F.company === '__none') + coIds.map(function (id) { var c = coById(id); return c ? opt(id, c.name, F.company === id) : ''; }).join('') + '</select>';
    h += '<select class="filter" id="tk-f-due" onchange="crm.set(\'due\',this.value)">' + opt('', lt('anyDue'), !F.due) + opt('overdue', lt('dueOver'), F.due === 'overdue') + opt('week', lt('dueWeek'), F.due === 'week') + opt('30', lt('due30'), F.due === '30') + opt('none', lt('dueNone'), F.due === 'none') + '</select>';
    h += '<div class="bk-seg"><button class="' + (view === 'due' ? 'on' : '') + '" onclick="crm.setView(\'due\')">' + lt('vDue') + '</button><button class="' + (view === 'month' ? 'on' : '') + '" onclick="crm.setView(\'month\')">' + lt('vMonth') + '</button><button class="' + (view === 'company' ? 'on' : '') + '" onclick="crm.setView(\'company\')">' + lt('vCompany') + '</button></div>';
    h += '</div>';
    h += '<div class="bk-resultbar"><span><b style="color:var(--text)">' + lt('showing') + ' ' + list.length + '</b> ' + lt('tasksN') + '</span>' + (fCount() ? '<button class="bk-link" onclick="crm.reset()">✕ ' + lt('reset') + '</button>' : '') + '</div>';

    h += '<div class="tk-layout"><div class="tk-col-main">';
    if (!all.length) h += '<div class="card"><div class="empty">🎯<br><br>' + lt('noneYet') + (ed ? '<br><br><button class="btn btn-primary" onclick="crm.taskForm(null,{},null)">' + lt('newTask') + '</button>' : '') + '</div></div>';
    else if (!list.length) h += '<div class="card"><div class="empty">' + lt('noTasks') + '</div></div>';
    else h += groupedHTML(list);
    h += '</div><div class="tk-col-side"><div class="card tk-side-card" id="tk-up-card"><div class="fsec-title">📌 ' + lt('upTitle') + '</div>' + upcomingHTML(ups) + '</div>';
    if (isAdmin() && S.mode === 'main') h += '<div class="tk-store-note">ℹ ' + lt('storeMain') + '</div>';
    h += '</div></div>';
    modalRefresher = null;
    return h;
  }
  function groupedHTML(list) {
    var groups = [], idx = {};
    function g(key, title, cls) { if (!idx[key]) { idx[key] = { title:title, cls:cls || '', items:[] }; groups.push(idx[key]); } return idx[key]; }
    list.forEach(function (t) {
      var done = isDone(t);
      if (view === 'company') { var c = coById(t.companyId); g('c' + (t.companyId || ''), c ? c.name : lt('relGeneral')).items.push(t); return; }
      if (done) { g('done', lt('gDone'), 'done').items.push(t); return; }
      if (view === 'month') {
        if (!t.dueDate) { g('~none', lt('gNone')).items.push(t); return; }
        if (dueState(t.dueDate) === 'overdue') { g('!over', lt('gOverdue'), 'over').items.push(t); return; }
        g(t.dueDate.slice(0, 7), fmtMonth(t.dueDate)).items.push(t); return;
      }
      var d = daysUntil(t.dueDate);
      if (d === null) g('6', lt('gNone')).items.push(t);
      else if (d < 0) g('1', lt('gOverdue'), 'over').items.push(t);
      else if (d === 0) g('2', lt('gToday'), 'soon').items.push(t);
      else if (d <= 7) g('3', lt('gWeek')).items.push(t);
      else if (d <= 30) g('4', lt('g30')).items.push(t);
      else g('5', lt('gLater')).items.push(t);
    });
    if (view === 'company') groups.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (view === 'due') groups.sort(function (a, b) { var ka = a.cls === 'done' ? '9' : Object.keys(idx).find(function (k) { return idx[k] === a; }), kb = b.cls === 'done' ? '9' : Object.keys(idx).find(function (k) { return idx[k] === b; }); return ka < kb ? -1 : 1; });
    else groups.sort(function (a, b) { var ka = Object.keys(idx).find(function (k) { return idx[k] === a; }), kb = Object.keys(idx).find(function (k) { return idx[k] === b; }); if (a.cls === 'done') ka = '~~'; if (b.cls === 'done') kb = '~~'; return ka < kb ? -1 : 1; });
    var h = '';
    groups.forEach(function (gr) {
      h += '<div class="card tk-group"><div class="tk-group-hd ' + gr.cls + '">' + esc(gr.title) + ' <span>' + gr.items.length + '</span></div>';
      gr.items.forEach(function (t) { h += taskRow(t, { noCompany:view === 'company' }); });
      h += '</div>';
    });
    return h;
  }
  function set(k, v) { F[k] = v; rerenderMain(); }
  function quick(k, v) { var same = fCount() === 1 && F[k] === v; F = Object.assign({}, F0); if (!same) F[k] = v; rerenderMain(); }
  function reset() { F = Object.assign({}, F0); rerenderMain(); }
  function setView(v) { view = v; try { localStorage.setItem('fm_tk_view', v); } catch (e) {} rerenderMain(); }
  function exportCSV() {
    var rows = [['Task', 'Status', 'Due', 'Responsible', 'Company', 'Related type', 'Related to', 'Repeats', 'Compliance', 'Notes', 'Created', 'Completed']];
    T().filter(tMatch).sort(byDue).forEach(function (t) { var c = coById(t.companyId); rows.push([t.title, stLabel(t.status), t.dueDate, t.responsible, c ? c.name : '', t.ref ? t.ref.type : '', refLabel(t), t.recur, t.category === 'compliance' ? 'yes' : '', t.notes, (t.createdAt || '').slice(0, 10), (t.completedAt || '').slice(0, 10)]); });
    dlCSV(rows, 'famofi_tasks.csv');
  }

  // ── Compliance schedule (recurring tasks for many companies at once) ────────
  function complianceForm() {
    if (!canEdit()) return;
    var jurs = uniqSorted((data.companies || []).map(function (c) { return c.jurisdiction; }));
    var h = '<div class="modal-header"><div><div class="modal-title">' + lt('cmTitle') + '</div><div class="modal-subtitle">' + lt('cmIntro') + '</div></div><button class="close-btn" onclick="closeModal()">×</button></div><div class="modal-body">';
    h += '<div class="form-grid"><div class="form-group full"><label class="lbl">' + lt('cmTemplate') + '</label><input class="inp" id="cm-title" list="cm-dl-tpl" placeholder="' + esc(lt('tpl')[0]) + '"><datalist id="cm-dl-tpl">' + lt('tpl').map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('cmFirstDue') + ' *</label><input type="date" class="inp" id="cm-due"></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tRepeat') + '</label><select class="inp" id="cm-recur">' + opt('yearly', lt('rYearly'), true) + opt('quarterly', lt('rQuarterly'), false) + opt('monthly', lt('rMonthly'), false) + opt('', lt('rNone'), false) + '</select></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('tResp') + '</label><input class="inp" id="cm-resp" list="cm-dl-resp"><datalist id="cm-dl-resp">' + respNames().map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist></div>';
    h += '<div class="form-group"><label class="lbl">' + lt('cmJur') + '</label><select class="inp" id="cm-jur" onchange="crm._cmList()">' + opt('', lt('cmAllJur'), true) + jurs.map(function (j) { return opt(j, j, false); }).join('') + '</select></div>';
    h += '<div class="form-group full"><label class="lbl">' + lt('tNotes') + '</label><input class="inp" id="cm-notes"></div></div>';
    h += '<div class="fsec" style="margin-top:14px"><div class="fsec-title" style="display:flex;justify-content:space-between;align-items:center">' + lt('cmCompanies') + ' <span><button class="bk-link" onclick="crm._cmAll(true)">' + lt('cmSelAll') + '</button> · <button class="bk-link" onclick="crm._cmAll(false)">' + lt('cmSelNone') + '</button></span></div><div id="cm-list" class="tk-cm-list"></div></div>';
    h += '<div id="cm-msg"></div><div class="tk-form-actions"><span style="flex:1"></span><button class="btn btn-outline" onclick="closeModal()">' + lt('cancel') + '</button><button class="btn btn-primary" onclick="crm._cmCreate()">' + lt('cmCreate') + '</button></div></div>';
    showModal(h, true);
    cmList();
  }
  function cmList() {
    var j = gv('cm-jur'), el = document.getElementById('cm-list'); if (!el) return;
    var cos = (data.companies || []).filter(function (c) { return c.status !== 'liquidated' && (!j || c.jurisdiction === j); }).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
    el.innerHTML = cos.map(function (c) { return '<label class="tk-cb"><input type="checkbox" class="cm-co" value="' + esc(c.id) + '" checked> ' + esc(c.name) + ' <span class="bk-muted">' + esc(c.jurisdiction || '') + '</span></label>'; }).join('') || '<div class="bk-muted">—</div>';
  }
  function cmAll(on) { document.querySelectorAll('.cm-co').forEach(function (x) { x.checked = on; }); }
  function cmCreate() {
    var title = gv('cm-title').trim() || lt('tpl')[0], due = gv('cm-due'), msg = document.getElementById('cm-msg');
    var ids = Array.prototype.filter.call(document.querySelectorAll('.cm-co'), function (x) { return x.checked; }).map(function (x) { return x.value; });
    if (!due) { msg.innerHTML = '<div class="imp-err">' + lt('cmReqDue') + '</div>'; return; }
    if (!ids.length) { msg.innerHTML = '<div class="imp-err">' + lt('cmReqCo') + '</div>'; return; }
    var made = 0, skipped = 0, norm = title.toLowerCase();
    ids.forEach(function (cid) {
      if (tasksForCompany(cid, true).some(function (t) { return (t.title || '').toLowerCase() === norm; })) { skipped++; return; }
      addTask({ title:title, dueDate:due, recur:gv('cm-recur'), responsible:gv('cm-resp').trim(), notes:gv('cm-notes'), companyId:cid, category:'compliance' });
      made++;
    });
    persist('tasks');
    closeModal();
    F = Object.assign({}, F0, { type:'compliance' }); view = 'month';
    if (page !== PAGE) go(PAGE); else rerenderMain();
    setTimeout(function () { alert(lt('cmDone') + ': ' + made + (skipped ? '\n' + skipped + ' ' + lt('cmSkip') : '')); }, 50);
  }

  // ── Company panel: "Tasks & Activity" tab ───────────────────────────────────
  var tlFilter = 'all';
  function companyTimeline(cid) {
    var c = coById(cid); if (!c) return [];
    var out = [];
    function push(o) { if (o.date && o.date !== '1900-01-01') out.push(o); }
    A().forEach(function (e) {
      if (e.companyId !== cid && !(e.companyIds || []).some(function (x) { return x === cid; })) return;
      var grp = e.kind === 'value' ? 'inv' : e.kind === 'status' || e.kind === 'created' ? 'status' : 'notes';
      push({ date:e.date, at:e.at, grp:grp, icon:e.kind === 'value' ? '📈' : e.kind === 'note' ? '📝' : '🏢', title:e.kind === 'value' ? lt('evValue') + (e.refLabel ? ' · ' + e.refLabel : '') : e.kind === 'status' ? lt('evStatus') : e.kind === 'created' ? lt('evCreated') : lt('evNote'), text:e.text, by:e.by, from:e.from, to:e.to, noteId:e.kind === 'note' ? e.id : null });
    });
    (c.shareholderHistory || []).forEach(function (e) {
      var who = e.type === 'company' ? cname(e.person) : e.person;
      push({ date:e.effectiveDate, at:'', grp:'owner', icon:'👥', title:e.removed ? who + ' ' + lt('evSHout') : lt('evSH') + ': ' + who + ' — ' + e.pct + '%' + (e.class ? ' (' + e.class + ')' : ''), text:e.notes || '' });
    });
    (c.directorHistory || []).forEach(function (e) {
      push({ date:e.effectiveDate, at:'', grp:'owner', icon:'🪪', title:(e.removed ? lt('evDirOut') : lt('evDir')) + ': ' + e.name + (e.position && e.position !== 'Director' ? ' (' + e.position + ')' : ''), text:e.notes || '' });
    });
    (c.banking || []).forEach(function (b) {
      var lbl = (b.bank || '') + (b.accountName || b.type ? ' · ' + (b.accountName || b.type) : '');
      (b.activity || []).forEach(function (a) {
        if (a.kind === 'edit' || a.kind === 'next') return;
        push({ date:a.date, at:a.at, grp:'bank', icon:'🏦', title:lt('evBank') + ' · ' + lbl, text:a.text || '', by:a.by, from:a.kind === 'status' ? a.from : null, to:a.kind === 'status' ? a.to : null, bankStatus:a.kind === 'status', bankId:b.id });
      });
    });
    T().forEach(function (t) {
      if (t.companyId !== cid || !isDone(t) || !t.completedAt) return;
      push({ date:t.completedAt.slice(0, 10), at:t.completedAt, grp:'tasks', icon:'✅', title:lt('evTaskDone') + (t.ref ? ' · ' + refLabel(t) : ''), text:t.title, by:t.completedBy });
    });
    return out.sort(function (a, b) { return b.date.localeCompare(a.date) || (b.at || '').localeCompare(a.at || ''); });
  }
  function companyPanelHTML(cid) {
    var c = coById(cid); if (!c) return '';
    var ed = canEdit(), open = tasksForCompany(cid, true), ups = upcoming(cid, 90);
    var h = '<div class="bk-detail-grid"><div class="bk-col">';
    h += '<div class="bk-box"><div class="fsec-title" style="display:flex;justify-content:space-between;align-items:center">🎯 ' + lt('caOpen') + ' (' + open.length + ')' + (ed ? '<span style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="crm.taskForm(null,{companyId:' + jq(cid) + '},function(){crm.openCompanyTab(' + jq(cid) + ',\'td-crm\')})">' + lt('newTask') + '</button></span>' : '') + '</div>';
    h += open.length ? open.map(function (t) { return taskRow(t, { noCompany:true }); }).join('') : '<div class="bk-muted" style="padding:4px 0">' + lt('caNoOpen') + '</div>';
    h += '</div>';
    if (ups.length) h += '<div class="bk-box"><div class="fsec-title">📌 ' + lt('upTitle') + '</div>' + upcomingHTML(ups, true) + '</div>';
    if (ed) h += '<div class="bk-box"><div class="fsec-title">✍ ' + lt('caNote') + '</div><textarea class="inp" id="ca-note" rows="2" placeholder="' + esc(lt('caNotePh')) + '"></textarea><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><input type="date" class="inp" id="ca-note-date" value="' + today() + '" style="width:auto"><button class="btn btn-primary btn-sm" onclick="crm._addNote(' + jq(cid) + ')">' + lt('caAddNote') + '</button></div></div>';
    h += '</div><div class="bk-col"><div class="bk-box"><div class="fsec-title">🕘 ' + lt('caTimeline') + '</div>';
    var fl = [['all', 'fAll'], ['notes', 'fNotes'], ['owner', 'fOwner'], ['bank', 'fBank'], ['tasks', 'fTasks'], ['inv', 'fInv'], ['status', 'fStatus']];
    h += '<div class="tk-tl-filters">' + fl.map(function (f) { return '<button class="bk-qchip' + (tlFilter === f[0] ? ' active' : '') + '" onclick="crm._tl(' + jq(cid) + ',' + jq(f[0]) + ')">' + lt(f[1]) + '</button>'; }).join('') + '</div>';
    var items = companyTimeline(cid).filter(function (x) { return tlFilter === 'all' || x.grp === tlFilter; });
    if (!items.length) h += '<div class="bk-muted" style="padding:6px 0">' + lt('caNoTimeline') + '</div>';
    else {
      h += '<div class="bk-timeline">'; var last = null;
      items.slice(0, 150).forEach(function (x) {
        if (x.date !== last) { h += '<div class="bk-tl-date">' + esc(fmtLong(x.date)) + '</div>'; last = x.date; }
        h += '<div class="bk-tl-item"><span class="bk-tl-dot tk-g-' + x.grp + '"></span><div class="bk-tl-body"><div class="bk-tl-kind">' + x.icon + ' ' + esc(x.title) + (x.by ? ' · <span class="bk-muted">' + esc(x.by) + '</span>' : '') + (x.noteId && ed ? ' <button class="bk-tl-del" onclick="crm._delNote(' + jq(cid) + ',' + jq(x.noteId) + ')">✕</button>' : '') + '</div>';
        if (x.bankStatus && window.bk) h += '<div class="bk-tl-status">' + (x.from ? bk.pill(x.from) + ' <span class="bk-muted">→</span> ' : '') + bk.pill(x.to) + '</div>';
        else if (x.from || x.to) h += '<div class="bk-tl-status">' + (x.from ? '<span class="bk-muted">' + esc(x.from) + '</span> → ' : '') + '<b>' + esc(x.to || '') + '</b></div>';
        if (x.text) h += '<div class="bk-tl-text">' + esc(x.text) + '</div>';
        h += '</div></div>';
      });
      h += '</div>';
    }
    h += '</div></div></div>';
    return h;
  }
  function refreshCompanyPanel(cid) {
    var p = document.getElementById('td-crm'); if (p) p.innerHTML = companyPanelHTML(cid);
    var b = document.getElementById('tab-crm-btn'); if (b) b.innerHTML = tabLabel(cid);
  }
  function tabLabel(cid) {
    var open = tasksForCompany(cid, true), over = open.filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    return '🎯 ' + lt('caTab') + (open.length ? ' <span class="tk-tabcount' + (over ? ' over' : '') + '">' + open.length + '</span>' : '');
  }
  function addNote(cid) {
    var txt = gv('ca-note').trim(); if (!txt || !canEdit()) return;
    log({ kind:'note', companyId:cid, text:txt, date:gv('ca-note-date') || today() });
    persist('activity'); refreshCompanyPanel(cid);
  }
  function delNote(cid, id) {
    if (!canEdit() || !confirm(lt('delNote'))) return;
    var arr = A(), i = arr.findIndex(function (e) { return e.id === id; }); if (i > -1) arr.splice(i, 1);
    persist('activity'); refreshCompanyPanel(cid);
  }
  function tl(cid, f) { tlFilter = f; refreshCompanyPanel(cid); }

  // Inject the tab into the company modal (wrap, don't replace)
  var _openCompany = window.openCompany;
  window.openCompany = function (id) {
    _openCompany.apply(this, arguments);
    var ov = document.getElementById('modal-overlay'); if (!ov) return;
    var tabs = ov.querySelector('.tabs'), body = ov.querySelector('.modal-body');
    if (!tabs || !body || tabs.querySelector('#tab-crm-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'tab'; btn.id = 'tab-crm-btn'; btn.innerHTML = tabLabel(id);
    btn.setAttribute('onclick', "switchTab(this,'td-crm')");
    var first = tabs.querySelector('.tab'); if (first && first.nextSibling) tabs.insertBefore(btn, first.nextSibling); else tabs.appendChild(btn);
    var panel = document.createElement('div');
    panel.className = 'tab-panel'; panel.id = 'td-crm'; panel.setAttribute('data-lazy', 'crm'); panel.setAttribute('data-cid', id);
    body.appendChild(panel);
    // Overdue indicator in the header
    var over = tasksForCompany(id, true).filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    var sub = ov.querySelector('.modal-subtitle');
    if (over && sub) sub.insertAdjacentHTML('beforeend', ' <span class="bk-due bk-due-overdue" style="cursor:pointer" onclick="crm.openCompanyTab(' + jq(id) + ',\'td-crm\')">⚠ ' + over + ' ' + lt('overdueN') + '</span>');
    modalRefresher = function () { if (document.getElementById('td-crm')) refreshCompanyPanel(id); else openCompanyTab(id, 'td-crm'); };
  };
  var _buildTabLazy = window.buildTabLazy;
  window.buildTabLazy = function (panel) {
    if (panel && panel.getAttribute('data-lazy') === 'crm') { panel.innerHTML = companyPanelHTML(panel.getAttribute('data-cid')); panel.setAttribute('data-built', '1'); return; }
    return _buildTabLazy.apply(this, arguments);
  };

  // Log company status changes / new companies (wrap saveCompany)
  var _saveCompany = window.saveCompany;
  window.saveCompany = function (id) {
    var before = id ? coById(id) : null, prevStatus = before ? before.status : null, nBefore = (data.companies || []).length;
    var r = _saveCompany.apply(this, arguments);
    if (!isAdmin()) return r;
    var stName = function (s) { return s === 'active' ? t('active') : s === 'liquidated' ? t('liquidated') : s === 'liquidation' ? t('liquidation') : (s || '—'); };
    if (id && before && prevStatus !== before.status) { log({ kind:'status', companyId:id, from:stName(prevStatus), to:stName(before.status) }); persist('activity'); }
    else if (!id && data.companies.length > nBefore) { log({ kind:'created', companyId:data.companies[data.companies.length - 1].id, text:data.companies[data.companies.length - 1].name }); persist('activity'); }
    return r;
  };

  // ── Companies list hooks (see script.js renderCompanies) ────────────────────
  var coF = '';
  window.crmCoFilterHTML = function () {
    if (!S.ready) return '';
    return '<select class="filter" id="co-task-filter" onchange="crm._coF(this.value)">' + opt('', lt('coFilter'), !coF) + opt('open', lt('coHasOpen'), coF === 'open') + opt('overdue', lt('coHasOver'), coF === 'overdue') + '</select>';
  };
  window.crmCoFilter = function (c) {
    if (!coF) return true;
    var open = tasksForCompany(c.id, true);
    return coF === 'open' ? open.length > 0 : open.some(function (t) { return dueState(t.dueDate) === 'overdue'; });
  };
  window.crmCoBadge = function (c) {
    if (!S.ready) return '';
    var open = tasksForCompany(c.id, true); if (!open.length) return '';
    var over = open.filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    return ' <span class="tk-cobadge' + (over ? ' over' : '') + '" title="' + open.length + ' ' + lt('openN') + (over ? ', ' + over + ' ' + lt('overdueN') : '') + '" onclick="event.stopPropagation();crm.openCompanyTab(' + jq(c.id) + ',\'td-crm\')">🎯 ' + open.length + '</span>';
  };

  // ── Investments (light CRM) ─────────────────────────────────────────────────
  var invF = '';
  function invStale(i) { if (!i.valuationDate) return null; var d = daysUntil(i.valuationDate); return d !== null && -d > STALE_DAYS; }
  window.crmInvFilterHTML = function () {
    return '<select class="filter" id="inv-val-filter" onchange="crm._invF(this.value)">' + opt('', lt('invFilter'), !invF) + opt('stale', lt('invStale'), invF === 'stale') + opt('nodate', lt('invNoDate'), invF === 'nodate') + opt('fresh', lt('invFresh'), invF === 'fresh') + '</select>';
  };
  window.crmInvFilter = function (i) {
    if (!invF) return true;
    if (invF === 'nodate') return !i.valuationDate;
    if (invF === 'stale') return invStale(i) === true;
    return invStale(i) === false;
  };
  window.crmInvName = function (i) {
    var open = S.ready ? tasksFor('investment', i.id, true) : [];
    var over = open.filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    return '<span class="tk-invname" onclick="crm.openInvestment(' + jq(i.id) + ')">' + esc(i.name) + '</span>' + (open.length ? ' <span class="tk-cobadge' + (over ? ' over' : '') + '">🎯 ' + open.length + '</span>' : '');
  };
  window.crmInvMV = function (i) {
    if (!i.valuationDate) return '';
    var st = invStale(i);
    return '<div class="bk-sub' + (st ? ' tk-stale' : '') + '"' + (st ? ' title="' + esc(lt('staleTip')) + '"' : '') + '>' + (st ? '⚠ ' : '') + lt('asOf') + ' ' + esc(fmtDay(i.valuationDate)) + '</div>';
  };
  // Log value changes on save (wrap saveInv)
  var VAL_FIELDS = [['marketValue', 'invMV'], ['commitment', 'invCommit'], ['calls', 'invCalls'], ['distributions', 'invDist'], ['expenses', 'invExpenses']];
  var _saveInv = window.saveInv;
  window.saveInv = function (id) {
    var inv = id ? (data.investments || []).find(function (x) { return x.id === id; }) : null;
    var before = inv ? JSON.parse(JSON.stringify(inv)) : null;
    var r = _saveInv.apply(this, arguments);
    if (!before || !isAdmin()) return r;
    var after = (data.investments || []).find(function (x) { return x.id === id; }); if (!after) return r;
    var parts = [];
    VAL_FIELDS.forEach(function (f) { if ((+before[f[0]] || 0) !== (+after[f[0]] || 0)) parts.push(t(f[1]) + ': ' + fmtD(+before[f[0]] || 0) + ' → ' + fmtD(+after[f[0]] || 0)); });
    if ((before.status || '') !== (after.status || '')) parts.push(t('invStatus') + ': ' + (before.status || '—') + ' → ' + (after.status || '—'));
    if (parts.length || (before.valuationDate || '') !== (after.valuationDate || '')) {
      if (after.valuationDate && (before.valuationDate || '') !== after.valuationDate) parts.push(lt('valuedAsOf') + ' ' + fmtDay(after.valuationDate));
      var ids = invCoIds(after);
      log({ kind:'value', companyId:ids[0] || '', companyIds:ids, ref:{ type:'investment', id:after.id }, refLabel:after.name, text:parts.join(' · '), date:after.valuationDate && after.valuationDate <= today() ? after.valuationDate : today() });
      persist('activity');
    }
    return r;
  };
  function openInvestment(id) {
    var i = (data.investments || []).find(function (x) { return x.id === id; }); if (!i) return;
    var ed = canEdit(), open = tasksFor('investment', id, false);
    var h = '<div class="modal-header"><div><div class="modal-title">📈 ' + esc(i.name) + '</div><div class="modal-subtitle" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px">' + (i.fund ? '<span class="badge badge-fund">' + esc(i.fund) + '</span>' : '') + (i.type ? '<span class="badge badge-inv">' + esc(i.type) + '</span>' : '') + invCoBadges(invCoIds(i)) + '</div></div>';
    h += '<div style="display:flex;gap:5px;align-items:center">' + (isAdmin() ? '<button class="btn btn-outline btn-sm" onclick="closeModal();openInvForm(' + jq(id) + ',null)">' + lt('ipEdit') + '</button>' : '') + '<button class="close-btn" onclick="closeModal()">×</button></div></div><div class="modal-body">';
    var st = invStale(i);
    h += '<div class="tk-inv-figs">' + [['invCommit', i.commitment], ['invCalls', i.calls], ['invDist', i.distributions], ['invExpenses', i.expenses || 0], ['invMV', i.marketValue]].map(function (f) { return '<div><div class="kpi-label">' + t(f[0]) + '</div><div class="tk-fig">' + fmtD(f[1] || 0) + '</div></div>'; }).join('') + '</div>';
    h += '<div class="bk-sub' + (st ? ' tk-stale' : '') + '" style="margin:-4px 0 14px">' + (i.valuationDate ? (st ? '⚠ ' + lt('staleTip') + ' — ' : '') + lt('valuedAsOf') + ' ' + esc(fmtDay(i.valuationDate)) : lt('invNoDate')) + '</div>';
    h += '<div class="bk-detail-grid"><div class="bk-col"><div class="bk-box"><div class="fsec-title" style="display:flex;justify-content:space-between;align-items:center">🎯 ' + lt('ipTasks') + (ed ? '<button class="btn btn-primary btn-sm" onclick="crm.taskForm(null,{companyId:' + jq(invCoIds(i)[0] || '') + ',ref:' + jq('investment:' + id) + '},function(){crm.openInvestment(' + jq(id) + ')})">' + lt('newTask') + '</button>' : '') + '</div>';
    h += open.length ? open.map(function (tk) { return taskRow(tk, { noRef:true }); }).join('') : '<div class="bk-muted">—</div>';
    h += '</div>' + (i.notes ? '<div class="bk-box"><div class="fsec-title">' + t('invNotes') + '</div><div class="bk-notes">' + esc(i.notes) + '</div></div>' : '') + '</div>';
    var hist = A().filter(function (e) { return e.ref && e.ref.type === 'investment' && e.ref.id === id; }).sort(function (a, b) { return b.date.localeCompare(a.date) || (b.at || '').localeCompare(a.at || ''); });
    h += '<div class="bk-col"><div class="bk-box"><div class="fsec-title">🕘 ' + lt('ipHistory') + '</div>';
    if (!hist.length) h += '<div class="bk-muted">' + lt('ipNoHistory') + '</div>';
    else { h += '<div class="bk-timeline">'; hist.forEach(function (e) { h += '<div class="bk-tl-item"><span class="bk-tl-dot tk-g-inv"></span><div class="bk-tl-body"><div class="bk-tl-kind">' + esc(fmtLong(e.date)) + (e.by ? ' · <span class="bk-muted">' + esc(e.by) + '</span>' : '') + '</div><div class="bk-tl-text">' + esc(e.text) + '</div></div></div>'; }); h += '</div>'; }
    h += '</div></div></div></div>';
    showModal(h, true);
    modalRefresher = function () { openInvestment(id); };
  }

  // ── Documents: optional expiry date (see script.js renderDocuments) ─────────
  window.crmDocMeta = function (cid, di, doc) {
    var h = '';
    if (doc.expiryDate) { var n = daysUntil(doc.expiryDate); h += ' · <span class="' + (n < 0 ? 'tk-exp-over' : n <= 60 ? 'tk-exp-soon' : '') + '">' + (n < 0 ? lt('expired') : lt('expires')) + ' ' + esc(fmtDay(doc.expiryDate)) + '</span>'; }
    if (isAdmin()) h += ' <label class="tk-docexp" onclick="event.stopPropagation()">' + lt('setExpiry') + ' <input type="date" value="' + esc(doc.expiryDate || '') + '" onchange="crm._docExp(' + jq(cid) + ',' + di + ',this.value)"></label>';
    return h;
  };
  function docExp(cid, di, v) {
    var c = coById(cid); if (!c || !c.documents || !c.documents[di] || !isAdmin()) return;
    c.documents[di].expiryDate = v; save();
    openCompanyTab(cid, 'td-doc');
  }

  // ── Overview: Action items card ─────────────────────────────────────────────
  function overviewCard() {
    if (!S.ready) return '';
    var open = T().filter(function (t) { return !isDone(t); }).sort(byDue);
    var ups = upcoming(null, 60);
    var nOver = open.filter(function (t) { return dueState(t.dueDate) === 'overdue'; }).length;
    var nWeek = open.filter(function (t) { var d = daysUntil(t.dueDate); return d !== null && d >= 0 && d <= 7; }).length;
    var nWait = open.filter(function (t) { return t.status === 'waiting'; }).length;
    var h = '<div class="card tk-ov"><div class="tk-ov-hd"><div class="fsec-title" style="margin:0;border:0;padding:0">🎯 ' + lt('acTitle') + '</div>';
    h += '<div class="tk-ov-stats"><button class="bk-qchip bk-q-red' + (nOver ? '' : ' zero') + '" onclick="crm.goTasks(\'due\',\'overdue\')">' + lt('kOverdue') + ' <b>' + nOver + '</b></button><button class="bk-qchip bk-q-amber' + (nWeek ? '' : ' zero') + '" onclick="crm.goTasks(\'due\',\'week\')">' + lt('kWeek') + ' <b>' + nWeek + '</b></button><button class="bk-qchip' + (nWait ? '' : ' zero') + '" onclick="crm.goTasks(\'status\',\'waiting\')">' + lt('kWaiting') + ' <b>' + nWait + '</b></button>';
    h += '<button class="bk-link" onclick="crm.goTasks()">' + lt('acAll') + '</button></div></div>';
    if (!open.length && !ups.length) return h + '<div class="bk-muted" style="padding:6px 0 2px">' + lt('acNone') + '</div></div>';
    h += '<div class="tk-ov-grid"><div>' + open.slice(0, 6).map(function (tk) { return taskRow(tk); }).join('') + '</div>';
    if (ups.length) h += '<div class="tk-ov-up"><div class="bk-sub" style="font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">📌 ' + lt('upTitle') + '</div>' + upcomingHTML(ups.slice(0, 5)) + '</div>';
    return h + '</div></div>';
  }
  function goTasks(k, v) { F = Object.assign({}, F0); if (k) F[k] = v; go(PAGE); }

  // ── Router integration ──────────────────────────────────────────────────────
  if (pages.indexOf(PAGE) === -1) pages.push(PAGE);
  function navBadge() {
    var nav = document.getElementById('nav'); if (!nav || !S.ready) return;
    var btn = Array.prototype.find.call(nav.querySelectorAll('button'), function (b) { return b.textContent.indexOf(t(PAGE)) === 0; });
    if (!btn) return;
    var over = T().filter(function (x) { return !isDone(x) && dueState(x.dueDate) === 'overdue'; }).length;
    var old = btn.querySelector('.tk-navbadge'); if (old) old.remove();
    if (over) btn.insertAdjacentHTML('beforeend', ' <span class="tk-navbadge">' + over + '</span>');
  }
  var _render = window.render, _renderPage = window.renderPage;
  window.render = function () {
    _render.apply(this, arguments);
    var m = document.getElementById('main');
    if (m && page === PAGE) m.innerHTML = renderTab();
    // Tasks are intentionally not shown on the Overview tab (see Tasks tab).
    navBadge();
  };
  window.renderPage = function () {
    if (page === PAGE) { var m = document.getElementById('main'); if (m) { destroyCharts(); m.innerHTML = renderTab(); } return; }
    return _renderPage.apply(this, arguments);
  };

  // ── Public API ──────────────────────────────────────────────────────────────
  window.crm = {
    whenReady:whenReady, canEdit:canEdit, isReady:function () { return S.ready; }, mode:function () { return S.mode; },
    tasks:T, activity:A, findTask:findTask, tasksFor:tasksFor, tasksForCompany:tasksForCompany, addTask:addTask,
    completeTask:completeTask, log:log, persist:persist, onChange:function (fn) { S.listeners.push(fn); },
    dueState:dueState, dueChip:dueChip, dueText:dueText, taskRow:taskRow, pill:pill, isDone:isDone,
    taskForm:taskForm, back:back, complete:complete, reopen:reopen, setRefresher:function (fn) { modalRefresher = fn; },
    openRefOf:openRefOf, openCompanyTab:openCompanyTab, openInvestment:openInvestment, goTasks:goTasks,
    set:set, quick:quick, reset:reset, setView:setView, exportCSV:exportCSV, complianceForm:complianceForm,
    _saveTask:saveTask, _del:del, _relRefresh:relRefresh, _cmList:cmList, _cmAll:cmAll, _cmCreate:cmCreate,
    _addNote:addNote, _delNote:delNote, _tl:tl, _docExp:docExp,
    _coF:function (v) { coF = v; rerenderMain(); }, _invF:function (v) { invF = v; rerenderMain(); }
  };
})();
