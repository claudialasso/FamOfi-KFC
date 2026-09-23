// ═══════════════════════════════════════════════════════════════════════════════
// FamOfi Registry — Bank Accounts module (CRM-style bank account management)
// Loaded with `defer` AFTER script.js so every core helper already exists.
//
// DATA MODEL — no new collection. Bank accounts stay where they always lived:
//   data.companies[i].banking[]   (same Firestore doc famofi/main → payload)
// Original fields are kept untouched:  id, bank, account, routing, swift,
//   bankAddr, currency, type
// CRM fields added (all optional — legacy accounts without them still work):
//   accountName, country, status, dateOpened, dateClosed, responsible,
//   nextAction, nextActionDate, lastAction, lastActionDate, notes,
//   createdAt, createdBy, updatedAt, updatedBy,
//   activity: [{ id, date:'YYYY-MM-DD', at:ISO, kind, text, from, to, by }]
// FUTURE-PROOFING: add new per-account data as new keys on the same object
//   (e.g. contacts:[], signatories:[], checklist:[], kyc:{}, onlineBanking:{},
//   fees:{}, restrictions:'') and register a panel with
//   bk.sections.push({ id, title, render:function(b,c){ return html; } })
//   — it will appear automatically in the account detail panel.
// Statuses live in ONE list (BK_STATUSES); colours in index.html CSS vars.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var PAGE = 'bankaccounts';

  // ── i18n ────────────────────────────────────────────────────────────────────
  TT.en[PAGE] = 'Bank Accounts';
  TT.es[PAGE] = 'Cuentas Bancarias';
  var L = {
    en: {
      title:'Bank Accounts', add:'+ Add Bank Account', exportCsv:'Export CSV',
      total:'Total Accounts', open:'Open', opening:'Opening', closing:'Closing', closed:'Closed',
      needs:'Needs Follow-up', overdueN:'overdue', inPipeline:'in opening process', allRecords:'all records',
      operating:'operating normally', closureStarted:'closure started', history:'kept for history', dueSoon7:'overdue or due ≤ 7 days',
      qOverdue:'Overdue', qSoon:'Due in 7 days', qDocs:'Waiting for documents', qBank:'Waiting on bank',
      qReview:'Under review', qHold:'On hold', qUnassigned:'No one assigned',
      search:'Search company, bank, account #, notes…', allStatus:'All statuses', allBanks:'All banks',
      allCompanies:'All companies', allCountries:'All countries', allCurrencies:'All currencies',
      allResp:'Anyone responsible', unassigned:'— Unassigned —', allLife:'Any stage',
      lifeActive:'Open (active)', lifeOpening:'Being opened', lifeClosing:'Being closed', lifeClosed:'Closed / rejected', lifeHold:'On hold',
      anyNext:'Any next action', nextOverdue:'Overdue', nextSoon:'Due within 7 days', nextAttention:'Overdue + due soon',
      next30:'Due within 30 days', nextAny:'Has a next action', nextNone:'No next action',
      moreFilters:'More filters', reset:'Reset filters', table:'Table', byBank:'By bank',
      openedFrom:'Opened from', openedTo:'Opened to', showing:'Showing', of:'of', accounts:'accounts',
      noAccounts:'No bank accounts match these filters.', noneYet:'No bank accounts recorded yet.',
      company:'Company', bank:'Bank', account:'Account', currency:'Currency', status:'Status',
      responsible:'Responsible', nextAction:'Next action', updated:'Updated', country:'Country / Jurisdiction',
      accountName:'Account name', accountNo:'Account number', accountType:'Account type',
      dateOpened:'Date opened', dateClosed:'Date closed', notes:'Notes', lastAction:'Latest action',
      nextActionDate:'Next action date', routing:'Routing / ABA', swift:'SWIFT / BIC', bankAddr:'Bank address',
      created:'Created', lastUpdated:'Last updated', by:'by',
      secCompany:'Company', secBank:'Bank information', secStatus:'Status', secMgmt:'Management',
      moreBank:'More banking details (routing, SWIFT, address)',
      selectCompany:'Select a company…', liquidated:'liquidated',
      save:'Save', cancel:'Cancel', edit:'Edit', saveAnyway:'Save anyway',
      reqCompany:'Please select a company.', reqBank:'Please enter the bank name.',
      dupTitle:'Possible duplicate', dupIntro:'This looks like an account that already exists:',
      dupSameNum:'same company, bank and account number', dupMasked:'same company & bank, account number ends in the same digits',
      dupSameName:'same company, bank, account name and currency', dupOtherCo:'same bank and account number under another company',
      nextCard:'Next action', noNext:'No next action scheduled.', markDone:'✓ Mark done', update:'Update',
      due:'Due', today:'Due today', inDays:'in {n} days', daysOver:'{n} days overdue', tomorrow:'tomorrow', oneOver:'1 day overdue',
      logTitle:'Log an update', logText:'What happened?', logPh:'e.g. Bank requested updated KYC for the UBO',
      logKind:'Type', logDate:'Date', changeStatus:'Change status to', noChange:'— Keep current status —',
      saveUpdate:'Save update', needText:'Write what happened or choose a new status.',
      details:'Account details', activity:'Activity', noActivity:'No activity recorded yet.',
      kNote:'Note', kAction:'Action taken', kFollow:'Follow-up', kBankComm:'Bank communication', kDocs:'Documents',
      kCreated:'Created', kStatus:'Status change', kEdit:'Edited', kNext:'Next action',
      danger:'Delete permanently', delConfirm:'Permanently delete this bank account and its history?\n\nTip: to keep it for historical records, change its status to "Closed" instead.',
      backCompany:'← Back to company', viewAll:'Open in Bank Accounts tab →',
      reveal:'Show full number', hide:'Hide',
      createdLog:'Account added to registry', statusLog:'Status changed', movedLog:'Moved from {a} to {b}',
      updatedFields:'Updated: ', nextSetLog:'Next action set: ', nextClearedLog:'Next action cleared',
      respLog:'Responsible: ', completedLog:'Completed: ', dueWord:'due',
      companiesN:'companies', accountsN:'accounts', viewOnly:'View-only access — you can view but not edit data.',
      delAct:'Remove this log entry?', followups:'Follow-ups', addFollow:'+ Add follow-up', firstFollow:'First follow-up', firstFollowDate:'Follow-up due', moreN:'more', followNote:'Follow-ups are tasks: they also appear in the Tasks tab and on the company.'
    },
    es: {
      title:'Cuentas Bancarias', add:'+ Agregar Cuenta', exportCsv:'Exportar CSV',
      total:'Total Cuentas', open:'Abiertas', opening:'En apertura', closing:'En cierre', closed:'Cerradas',
      needs:'Requieren seguimiento', overdueN:'vencidas', inPipeline:'en proceso de apertura', allRecords:'todos los registros',
      operating:'operando normalmente', closureStarted:'cierre iniciado', history:'se conservan como historial', dueSoon7:'vencidas o vencen ≤ 7 días',
      qOverdue:'Vencidas', qSoon:'Vencen en 7 días', qDocs:'Esperando documentos', qBank:'Esperando al banco',
      qReview:'En revisión', qHold:'En pausa', qUnassigned:'Sin responsable',
      search:'Buscar empresa, banco, # cuenta, notas…', allStatus:'Todos los estados', allBanks:'Todos los bancos',
      allCompanies:'Todas las empresas', allCountries:'Todos los países', allCurrencies:'Todas las monedas',
      allResp:'Cualquier responsable', unassigned:'— Sin asignar —', allLife:'Cualquier etapa',
      lifeActive:'Abiertas (activas)', lifeOpening:'En apertura', lifeClosing:'En cierre', lifeClosed:'Cerradas / rechazadas', lifeHold:'En pausa',
      anyNext:'Cualquier próxima acción', nextOverdue:'Vencidas', nextSoon:'Vencen en 7 días', nextAttention:'Vencidas + próximas',
      next30:'Vencen en 30 días', nextAny:'Con próxima acción', nextNone:'Sin próxima acción',
      moreFilters:'Más filtros', reset:'Limpiar filtros', table:'Tabla', byBank:'Por banco',
      openedFrom:'Abierta desde', openedTo:'Abierta hasta', showing:'Mostrando', of:'de', accounts:'cuentas',
      noAccounts:'Ninguna cuenta coincide con estos filtros.', noneYet:'Aún no hay cuentas registradas.',
      company:'Empresa', bank:'Banco', account:'Cuenta', currency:'Moneda', status:'Estado',
      responsible:'Responsable', nextAction:'Próxima acción', updated:'Actualizada', country:'País / Jurisdicción',
      accountName:'Nombre de la cuenta', accountNo:'Número de cuenta', accountType:'Tipo de cuenta',
      dateOpened:'Fecha de apertura', dateClosed:'Fecha de cierre', notes:'Notas', lastAction:'Última acción',
      nextActionDate:'Fecha próxima acción', routing:'Routing / ABA', swift:'SWIFT / BIC', bankAddr:'Dirección del banco',
      created:'Creada', lastUpdated:'Última actualización', by:'por',
      secCompany:'Empresa', secBank:'Información bancaria', secStatus:'Estado', secMgmt:'Gestión',
      moreBank:'Más datos bancarios (routing, SWIFT, dirección)',
      selectCompany:'Selecciona una empresa…', liquidated:'liquidada',
      save:'Guardar', cancel:'Cancelar', edit:'Editar', saveAnyway:'Guardar de todas formas',
      reqCompany:'Selecciona una empresa.', reqBank:'Ingresa el nombre del banco.',
      dupTitle:'Posible duplicado', dupIntro:'Parece una cuenta que ya existe:',
      dupSameNum:'misma empresa, banco y número de cuenta', dupMasked:'misma empresa y banco, el número termina en los mismos dígitos',
      dupSameName:'misma empresa, banco, nombre de cuenta y moneda', dupOtherCo:'mismo banco y número de cuenta en otra empresa',
      nextCard:'Próxima acción', noNext:'No hay próxima acción programada.', markDone:'✓ Marcar hecha', update:'Actualizar',
      due:'Vence', today:'Vence hoy', inDays:'en {n} días', daysOver:'{n} días vencida', tomorrow:'mañana', oneOver:'1 día vencida',
      logTitle:'Registrar actualización', logText:'¿Qué pasó?', logPh:'ej. El banco pidió KYC actualizado del beneficiario final',
      logKind:'Tipo', logDate:'Fecha', changeStatus:'Cambiar estado a', noChange:'— Mantener estado actual —',
      saveUpdate:'Guardar actualización', needText:'Escribe qué pasó o elige un nuevo estado.',
      details:'Datos de la cuenta', activity:'Actividad', noActivity:'Sin actividad registrada.',
      kNote:'Nota', kAction:'Acción realizada', kFollow:'Seguimiento', kBankComm:'Comunicación del banco', kDocs:'Documentos',
      kCreated:'Creada', kStatus:'Cambio de estado', kEdit:'Editada', kNext:'Próxima acción',
      danger:'Eliminar definitivamente', delConfirm:'¿Eliminar definitivamente esta cuenta y su historial?\n\nConsejo: para conservarla como registro histórico, cambia su estado a "Cerrada".',
      backCompany:'← Volver a la empresa', viewAll:'Abrir en Cuentas Bancarias →',
      reveal:'Mostrar número', hide:'Ocultar',
      createdLog:'Cuenta agregada al registro', statusLog:'Cambio de estado', movedLog:'Movida de {a} a {b}',
      updatedFields:'Actualizado: ', nextSetLog:'Próxima acción: ', nextClearedLog:'Próxima acción eliminada',
      respLog:'Responsable: ', completedLog:'Completado: ', dueWord:'vence',
      companiesN:'empresas', accountsN:'cuentas', viewOnly:'Solo lectura — puedes ver pero no editar.',
      delAct:'¿Eliminar esta entrada del historial?', followups:'Seguimientos', addFollow:'+ Agregar seguimiento', firstFollow:'Primer seguimiento', firstFollowDate:'Fecha del seguimiento', moreN:'más', followNote:'Los seguimientos son tareas: también aparecen en Tareas y en la empresa.'
    }
  };
  function bt(k) { return (L[lang] && L[lang][k]) || L.en[k] || k; }

  // ── Status system (single source of truth; colours = CSS vars in index.html) ─
  var BK_STATUSES = [
    { k:'open',         en:'Open',                  es:'Abierta',                 grp:'active'  },
    { k:'opening',      en:'Opening in Progress',   es:'Apertura en curso',       grp:'opening' },
    { k:'pending_docs', en:'Pending Documents',     es:'Documentos pendientes',   grp:'opening' },
    { k:'pending_bank', en:'Pending Bank',          es:'Pendiente del banco',     grp:'opening' },
    { k:'under_review', en:'Under Review',          es:'En revisión',             grp:'opening' },
    { k:'on_hold',      en:'On Hold',               es:'En pausa',                grp:'hold'    },
    { k:'closing',      en:'Closing in Progress',   es:'Cierre en curso',         grp:'closing' },
    { k:'closed',       en:'Closed',                es:'Cerrada',                 grp:'closed'  },
    { k:'rejected',     en:'Rejected / Not Opened', es:'Rechazada / No abierta',  grp:'closed'  }
  ];
  var ST_BY = {}; BK_STATUSES.forEach(function (s, i) { s.order = i; ST_BY[s.k] = s; });
  var ACT_KINDS = ['note', 'action', 'followup', 'bank', 'docs'];
  var ACT_LBL = { note:'kNote', action:'kAction', followup:'kFollow', bank:'kBankComm', docs:'kDocs', created:'kCreated', status:'kStatus', edit:'kEdit', next:'kNext' };
  var CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'UYU', 'PAB', 'SGD', 'BSD', 'KYD', 'MXN', 'COP', 'PEN', 'CLP', 'BRL', 'ARS', 'GTQ', 'CRC'];
  var ACC_TYPES = ['Checking', 'Savings', 'Current', 'Operating', 'Custody', 'Investment / Brokerage', 'Money Market', 'Time Deposit', 'Escrow', 'Payroll', 'Multi-currency'];

  function stOf(b) { return ST_BY[b && b.status] ? b.status : 'open'; } // legacy accounts → Open
  function stLabel(k) { var s = ST_BY[k] || ST_BY.open; return lang === 'es' ? s.es : s.en; }
  function pill(k) { k = ST_BY[k] ? k : 'open'; return '<span class="bk-pill bk-st-' + k + '"><i></i>' + esc(stLabel(k)) + '</span>'; }
  function grpOf(b) { return ST_BY[stOf(b)].grp; }
  function isDone(b) { return grpOf(b) === 'closed'; }

  // ── Small helpers ───────────────────────────────────────────────────────────
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseD(s) { if (!s) return null; var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function daysUntil(s) { var d = parseD(s); if (!d) return null; var t0 = parseD(today()); return Math.round((d - t0) / 86400000); }
  function fmtDay(s) { var d = parseD(s); if (!d) return '—'; return d.toLocaleDateString(lang === 'es' ? 'es-EC' : 'en-US', { month:'short', day:'numeric', year:'numeric' }); }
  function fmtLong(s) { var d = parseD(s); if (!d) return '—'; return d.toLocaleDateString(lang === 'es' ? 'es-EC' : 'en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' }); }
  function me() { return (window.currentUser && (currentUser.displayName || currentUser.email)) || ''; }
  function nowISO() { return new Date().toISOString(); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, ' ').trim(); }
  function normAcct(s) { return String(s || '').replace(/[^0-9a-z]/gi, '').toLowerCase(); }
  function isMasked(s) { return /[*•x]{3,}/i.test(String(s || '')); }
  function last4(s) { var n = normAcct(s); return n.slice(-4); }
  function maskAcct(s) { var l = last4(s); return l ? '•••• ' + l : '—'; }
  function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function uniqSorted(arr) { var m = {}; arr.forEach(function (v) { v = String(v || '').trim(); if (v && !m[v.toLowerCase()]) m[v.toLowerCase()] = v; }); return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.localeCompare(b); }); }
  function opt(v, label, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function datalist(id, vals) { return '<datalist id="' + id + '">' + vals.map(function (v) { return '<option value="' + esc(v) + '">'; }).join('') + '</datalist>'; }
  function tpl(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  // All accounts, flattened, each linked to its registry company
  function rows() {
    var out = [];
    (data.companies || []).forEach(function (c) {
      if (!Array.isArray(c.banking)) c.banking = [];
      c.banking.forEach(function (b) { if (!b.id) b.id = uid(); out.push({ c:c, b:b }); });
    });
    return out;
  }
  function findRow(bid) { var r = rows(); for (var i = 0; i < r.length; i++) if (r[i].b.id === bid) return r[i]; return null; }
  function coById(id) { return (data.companies || []).find(function (c) { return c.id === id; }); }

  // "Next action" = the account's earliest open task in the shared task list (crm.js).
  // Falls back to the legacy nextAction fields until they are migrated.
  function openTasks(b) { return (window.crm && crm.isReady()) ? crm.tasksFor('bank', b.id, true) : []; }
  function nx(b) {
    var ts = openTasks(b);
    if (ts.length) return { text:ts[0].title, date:ts[0].dueDate || '', resp:ts[0].responsible, n:ts.length, task:ts[0] };
    return { text:b.nextAction || '', date:b.nextActionDate || '', n:(b.nextAction || b.nextActionDate) ? 1 : 0 };
  }
  function dueState(b) {
    var nd = nx(b).date;
    if (!nd || isDone(b)) return '';
    var d = daysUntil(nd);
    if (d === null) return '';
    return d < 0 ? 'overdue' : d <= 7 ? 'soon' : 'ok';
  }
  function dueText(b) {
    var d = daysUntil(nx(b).date); if (d === null) return '';
    if (d === 0) return bt('today');
    if (d === 1) return bt('tomorrow');
    if (d === -1) return bt('oneOver');
    return d < 0 ? tpl(bt('daysOver'), { n:-d }) : tpl(bt('inDays'), { n:d });
  }
  function dueChip(b) {
    var nd = nx(b).date; if (!nd) return '';
    var st = dueState(b) || 'ok';
    return '<span class="bk-due bk-due-' + st + '" title="' + esc(dueText(b)) + '">' + (st === 'overdue' ? '⚠ ' : '') + esc(fmtDay(nd)) + '</span>';
  }
  function addAct(b, e) {
    if (!Array.isArray(b.activity)) b.activity = [];
    e.id = uid(); e.at = nowISO(); e.by = me(); if (!e.date) e.date = today();
    b.activity.push(e);
  }
  function touch(b) { b.updatedAt = nowISO(); b.updatedBy = me(); }
  function persist() { save(); if (page === PAGE) rerenderMain(); }

  // ── Filter / view state ─────────────────────────────────────────────────────
  var F0 = { q:'', company:'', bank:'', status:'', country:'', currency:'', resp:'', life:'', next:'', from:'', to:'' };
  var F = Object.assign({}, F0);
  var view = 'table', sortK = 'next', sortDir = 1, showMore = false;
  try { view = localStorage.getItem('fm_bk_view') || 'table'; } catch (e) {}

  function activeFilterCount(keys) { return (keys || Object.keys(F0)).filter(function (k) { return F[k]; }).length; }

  function matches(r) {
    var b = r.b, c = r.c, s = stOf(b);
    if (F.q) {
      var hay = [c.name, b.bank, b.accountName, b.account, b.type, b.currency, b.country, b.responsible, b.notes, nx(b).text, b.lastAction, b.swift, stLabel(s)].join(' ').toLowerCase();
      var qq = F.q.toLowerCase().trim(), qn = normAcct(qq);
      if (hay.indexOf(qq) === -1 && !(qn.length >= 3 && normAcct(b.account).indexOf(qn) !== -1)) return false;
    }
    if (F.company && c.id !== F.company) return false;
    if (F.bank && norm(b.bank) !== F.bank) return false;
    if (F.status && s !== F.status) return false;
    if (F.country && (b.country || '') !== F.country) return false;
    if (F.currency && (b.currency || '').toUpperCase() !== F.currency) return false;
    if (F.resp) { if (F.resp === '__none') { if ((b.responsible || '').trim() || isDone(b)) return false; } else if ((b.responsible || '') !== F.resp) return false; }
    if (F.life && ST_BY[s].grp !== F.life) return false;
    if (F.from && (!b.dateOpened || b.dateOpened < F.from)) return false;
    if (F.to && (!b.dateOpened || b.dateOpened > F.to)) return false;
    if (F.next) {
      var n0 = nx(b), ds = dueState(b), d = daysUntil(n0.date), has = n0.n > 0 && !isDone(b);
      if (F.next === 'overdue' && ds !== 'overdue') return false;
      if (F.next === 'soon' && ds !== 'soon') return false;
      if (F.next === 'attention' && ds !== 'overdue' && ds !== 'soon') return false;
      if (F.next === '30' && !(d !== null && d >= 0 && d <= 30 && !isDone(b))) return false;
      if (F.next === 'any' && !has) return false;
      if (F.next === 'none' && has) return false;
    }
    return true;
  }
  function sortRows(list) {
    var dir = sortDir;
    function key(r) {
      var b = r.b;
      switch (sortK) {
        case 'company': return (r.c.name || '').toLowerCase();
        case 'bank': return (b.bank || '').toLowerCase();
        case 'account': return (b.accountName || b.type || '').toLowerCase();
        case 'currency': return (b.currency || '').toLowerCase();
        case 'status': return ST_BY[stOf(b)].order;
        case 'resp': return (b.responsible || '~').toLowerCase();
        case 'updated': return b.updatedAt || '';
        default: var nd = nx(b).date; return (isDone(b) || !nd) ? '9999' : nd; // next
      }
    }
    return list.slice().sort(function (a, b) {
      var ka = key(a), kb = key(b);
      if (ka < kb) return -dir; if (ka > kb) return dir;
      var na = (a.c.name || '').toLowerCase(), nb = (b.c.name || '').toLowerCase();
      return na < nb ? -1 : na > nb ? 1 : 0;
    });
  }

  // ── Main tab ────────────────────────────────────────────────────────────────
  function renderTab() {
    var all = rows();
    var list = sortRows(all.filter(matches));
    var h = '';
    if (!isAdmin()) h += '<div class="readonly-banner">' + bt('viewOnly') + '</div>';

    h += '<div class="section-header"><div class="section-title">' + bt('title') + ' <span style="color:var(--text3);font-weight:400;font-size:14px">(' + all.length + ')</span></div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-teal btn-sm" onclick="bk.exportCSV()">' + bt('exportCsv') + '</button>';
    if (isAdmin()) h += '<button class="btn btn-primary" onclick="bk.form(null)">' + bt('add') + '</button>';
    h += '</div></div>';

    // KPI tiles (clickable → set filters)
    var cnt = function (fn) { return all.filter(fn).length; };
    var nOpen = cnt(function (r) { return stOf(r.b) === 'open'; });
    var nOpening = cnt(function (r) { return grpOf(r.b) === 'opening'; });
    var nClosing = cnt(function (r) { return grpOf(r.b) === 'closing'; });
    var nClosed = cnt(function (r) { return stOf(r.b) === 'closed'; });
    var nOver = cnt(function (r) { return dueState(r.b) === 'overdue'; });
    var nSoon = cnt(function (r) { return dueState(r.b) === 'soon'; });
    var fOnly = function (k, v) { return activeFilterCount() === 1 && F[k] === v; };
    function tile(label, val, sub, cls, onclick, active) {
      return '<button class="kpi bk-kpi ' + cls + (active ? ' active' : '') + '" onclick="' + onclick + '"><div class="kpi-label">' + label + '</div><div class="kpi-val">' + val + '</div><div class="kpi-sub">' + sub + '</div></button>';
    }
    h += '<div class="bk-kpis">';
    h += tile(bt('total'), all.length, bt('allRecords'), 'bk-k-total', 'bk.reset()', activeFilterCount() === 0);
    h += tile(bt('open'), nOpen, bt('operating'), 'bk-k-open', "bk.quick('status','open')", fOnly('status', 'open'));
    h += tile(bt('opening'), nOpening, bt('inPipeline'), 'bk-k-opening', "bk.quick('life','opening')", fOnly('life', 'opening'));
    h += tile(bt('closing'), nClosing, bt('closureStarted'), 'bk-k-closing', "bk.quick('life','closing')", fOnly('life', 'closing'));
    h += tile(bt('closed'), nClosed, bt('history'), 'bk-k-closed', "bk.quick('status','closed')", fOnly('status', 'closed'));
    h += tile(bt('needs'), nOver + nSoon, (nOver ? '<b style="color:var(--red)">' + nOver + ' ' + bt('overdueN') + '</b>' : bt('dueSoon7')), 'bk-k-needs' + (nOver ? ' has-over' : ''), "bk.quick('next','attention')", fOnly('next', 'attention'));
    h += '</div>';

    // Quick views
    var quicks = [
      ['qOverdue', 'next', 'overdue', nOver, 'red'],
      ['qSoon', 'next', 'soon', nSoon, 'amber'],
      ['qDocs', 'status', 'pending_docs', cnt(function (r) { return stOf(r.b) === 'pending_docs'; }), 'pending_docs'],
      ['qBank', 'status', 'pending_bank', cnt(function (r) { return stOf(r.b) === 'pending_bank'; }), 'pending_bank'],
      ['qReview', 'status', 'under_review', cnt(function (r) { return stOf(r.b) === 'under_review'; }), 'under_review'],
      ['qHold', 'status', 'on_hold', cnt(function (r) { return stOf(r.b) === 'on_hold'; }), 'on_hold'],
      ['qUnassigned', 'resp', '__none', cnt(function (r) { return !isDone(r.b) && !(r.b.responsible || '').trim(); }), 'none']
    ];
    h += '<div class="bk-quick">';
    quicks.forEach(function (qv) {
      h += '<button class="bk-qchip bk-q-' + qv[4] + (fOnly(qv[1], qv[2]) ? ' active' : '') + (qv[3] ? '' : ' zero') + '" onclick="bk.quick(\'' + qv[1] + '\',\'' + qv[2] + '\')">' + bt(qv[0]) + ' <b>' + qv[3] + '</b></button>';
    });
    h += '</div>';

    // Toolbar
    var bankNames = {}; all.forEach(function (r) { var k = norm(r.b.bank); if (k && !bankNames[k]) bankNames[k] = r.b.bank.trim(); });
    var bankKeys = Object.keys(bankNames).sort(function (a, b) { return bankNames[a].localeCompare(bankNames[b]); });
    var cos = (data.companies || []).filter(function (c) { return (c.banking || []).length; }).sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
    h += '<div class="toolbar bk-toolbar">';
    h += '<div class="search-wrap"><span class="si">&#8981;</span><input type="text" id="bk-f-q" placeholder="' + esc(bt('search')) + '" value="' + esc(F.q) + '" oninput="bk.set(\'q\',this.value)"></div>';
    h += '<select class="filter" id="bk-f-status" onchange="bk.set(\'status\',this.value)">' + opt('', bt('allStatus'), !F.status);
    BK_STATUSES.forEach(function (s) { h += opt(s.k, stLabel(s.k), F.status === s.k); });
    h += '</select>';
    h += '<select class="filter" id="bk-f-bank" onchange="bk.set(\'bank\',this.value)">' + opt('', bt('allBanks'), !F.bank);
    bankKeys.forEach(function (k) { h += opt(k, bankNames[k], F.bank === k); });
    h += '</select>';
    h += '<select class="filter" id="bk-f-company" onchange="bk.set(\'company\',this.value)" style="max-width:220px">' + opt('', bt('allCompanies'), !F.company);
    cos.forEach(function (c) { h += opt(c.id, c.name, F.company === c.id); });
    h += '</select>';
    var moreN = activeFilterCount(['country', 'currency', 'resp', 'life', 'next', 'from', 'to']);
    h += '<button class="btn btn-outline btn-sm bk-more-btn' + (showMore || moreN ? ' on' : '') + '" onclick="bk.toggleMore()">⚲ ' + bt('moreFilters') + (moreN ? ' <span class="bk-count">' + moreN + '</span>' : '') + ' ' + (showMore ? '▴' : '▾') + '</button>';
    h += '<div class="bk-seg"><button class="' + (view === 'table' ? 'on' : '') + '" onclick="bk.setView(\'table\')">☰ ' + bt('table') + '</button><button class="' + (view === 'bank' ? 'on' : '') + '" onclick="bk.setView(\'bank\')">🏦 ' + bt('byBank') + '</button></div>';
    h += '</div>';

    if (showMore) {
      var countries = uniqSorted(all.map(function (r) { return r.b.country; }));
      var curs = uniqSorted(all.map(function (r) { return (r.b.currency || '').toUpperCase(); }));
      var resps = uniqSorted(all.map(function (r) { return r.b.responsible; }));
      h += '<div class="card bk-more">';
      h += '<div class="bk-more-grid">';
      h += '<label><span>' + bt('country') + '</span><select class="inp" id="bk-f-country" onchange="bk.set(\'country\',this.value)">' + opt('', bt('allCountries'), !F.country) + countries.map(function (v) { return opt(v, v, F.country === v); }).join('') + '</select></label>';
      h += '<label><span>' + bt('currency') + '</span><select class="inp" id="bk-f-currency" onchange="bk.set(\'currency\',this.value)">' + opt('', bt('allCurrencies'), !F.currency) + curs.map(function (v) { return opt(v, v, F.currency === v); }).join('') + '</select></label>';
      h += '<label><span>' + bt('responsible') + '</span><select class="inp" id="bk-f-resp" onchange="bk.set(\'resp\',this.value)">' + opt('', bt('allResp'), !F.resp) + opt('__none', bt('unassigned'), F.resp === '__none') + resps.map(function (v) { return opt(v, v, F.resp === v); }).join('') + '</select></label>';
      h += '<label><span>' + bt('secStatus') + '</span><select class="inp" id="bk-f-life" onchange="bk.set(\'life\',this.value)">' + opt('', bt('allLife'), !F.life) + opt('active', bt('lifeActive'), F.life === 'active') + opt('opening', bt('lifeOpening'), F.life === 'opening') + opt('closing', bt('lifeClosing'), F.life === 'closing') + opt('closed', bt('lifeClosed'), F.life === 'closed') + opt('hold', bt('lifeHold'), F.life === 'hold') + '</select></label>';
      h += '<label><span>' + bt('nextActionDate') + '</span><select class="inp" id="bk-f-next" onchange="bk.set(\'next\',this.value)">' + opt('', bt('anyNext'), !F.next) + opt('overdue', bt('nextOverdue'), F.next === 'overdue') + opt('soon', bt('nextSoon'), F.next === 'soon') + opt('attention', bt('nextAttention'), F.next === 'attention') + opt('30', bt('next30'), F.next === '30') + opt('any', bt('nextAny'), F.next === 'any') + opt('none', bt('nextNone'), F.next === 'none') + '</select></label>';
      h += '<label><span>' + bt('openedFrom') + '</span><input type="date" class="inp" id="bk-f-from" value="' + esc(F.from) + '" onchange="bk.set(\'from\',this.value)"></label>';
      h += '<label><span>' + bt('openedTo') + '</span><input type="date" class="inp" id="bk-f-to" value="' + esc(F.to) + '" onchange="bk.set(\'to\',this.value)"></label>';
      h += '</div></div>';
    }

    h += '<div class="bk-resultbar"><span><b style="color:var(--text)">' + bt('showing') + ' ' + list.length + '</b> ' + bt('of') + ' ' + all.length + ' ' + bt('accounts') + '</span>';
    if (activeFilterCount()) h += '<button class="bk-link" onclick="bk.reset()">✕ ' + bt('reset') + '</button>';
    h += '</div>';

    if (!all.length) {
      h += '<div class="card"><div class="empty">🏦<br><br>' + bt('noneYet') + (isAdmin() ? '<br><br><button class="btn btn-primary" onclick="bk.form(null)">' + bt('add') + '</button>' : '') + '</div></div>';
      return h;
    }
    h += view === 'bank' ? renderBankGroups(list) : renderTable(list);
    return h;
  }

  function acctCell(b) {
    var label = b.accountName || b.type || '—';
    var h = '<div class="bk-acct-name">' + esc(label) + '</div>';
    var curIn = b.currency ? '<span class="bk-cur bk-cur-inline">' + esc(b.currency.toUpperCase()) + '</span> ' : '';
    if (b.account) h += '<div class="bk-sub">' + curIn + acctNum(b) + (b.accountName && b.type ? ' · ' + esc(b.type) : '') + '</div>';
    else if (curIn) h += '<div class="bk-sub">' + curIn + (b.accountName && b.type ? esc(b.type) : '') + '</div>';
    else if (!curIn && b.accountName && b.type) h += '<div class="bk-sub">' + esc(b.type) + '</div>';
    return h;
  }
  function acctNum(b) {
    if (!b.account) return '—';
    return '<span class="bk-num" data-full="' + esc(b.account) + '" data-mask="' + esc(maskAcct(b.account)) + '">' + esc(maskAcct(b.account)) + '</span>'
      + ' <button class="bk-eye" title="' + esc(bt('reveal')) + '" onclick="bk.reveal(this,event)">👁</button>';
  }
  function th(k, label, cls) {
    var on = sortK === k;
    return '<th class="bk-th ' + (cls || '') + (on ? ' on' : '') + '" onclick="bk.sort(\'' + k + '\')">' + label + (on ? (sortDir > 0 ? ' ▲' : ' ▼') : '') + '</th>';
  }
  function renderTable(list) {
    var h = '<div class="card bk-table-card" style="padding:0"><div class="bk-table-wrap"><table class="bk-table"><thead><tr>';
    h += th('company', bt('company')) + th('bank', bt('bank')) + th('account', bt('account')) + th('currency', bt('currency'), 'bk-c-cur') + th('status', bt('status')) + th('resp', bt('responsible'), 'bk-c-resp') + th('next', bt('nextAction')) + th('updated', bt('updated'), 'bk-c-upd');
    h += '</tr></thead><tbody>';
    if (!list.length) h += '<tr><td colspan="8" class="empty">' + bt('noAccounts') + '</td></tr>';
    list.forEach(function (r) {
      var b = r.b, c = r.c, ds = dueState(b);
      h += '<tr class="bk-row' + (isDone(b) ? ' bk-done' : '') + (ds === 'overdue' ? ' bk-row-over' : '') + '" onclick="bk.open(\'' + b.id + '\',null)">';
      h += '<td><div class="bk-co">' + esc(c.name) + '</div>' + (c.status === 'liquidated' ? '<div class="bk-sub">' + bt('liquidated') + '</div>' : (c.jurisdiction ? '<div class="bk-sub">' + esc(c.jurisdiction) + '</div>' : '')) + '</td>';
      h += '<td><div class="bk-bank">' + esc(b.bank || '—') + '</div>' + (b.country ? '<div class="bk-sub">' + esc(b.country) + '</div>' : '') + '</td>';
      h += '<td>' + acctCell(b) + '</td>';
      h += '<td class="bk-c-cur">' + (b.currency ? '<span class="bk-cur">' + esc(b.currency.toUpperCase()) + '</span>' : '—') + '</td>';
      h += '<td>' + pill(stOf(b)) + '</td>';
      h += '<td class="bk-c-resp">' + (b.responsible ? esc(b.responsible) : '<span class="bk-muted">—</span>') + '</td>';
      var n1 = nx(b);
      h += '<td class="bk-next-cell">' + (n1.text && !isDone(b) ? '<div class="bk-next-txt" title="' + esc(n1.text) + '">' + esc(trunc(n1.text, 48)) + '</div>' : '') + (isDone(b) ? '' : dueChip(b) + (n1.n > 1 ? ' <span class="bk-muted" style="font-size:11px">+' + (n1.n - 1) + ' ' + bt('moreN') + '</span>' : '')) + (!n1.n || isDone(b) ? '<span class="bk-muted">—</span>' : '') + '</td>';
      h += '<td class="bk-c-upd bk-muted">' + (b.updatedAt ? fmtDay(b.updatedAt.slice(0, 10)) : '—') + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
    return h;
  }

  function renderBankGroups(list) {
    if (!list.length) return '<div class="card"><div class="empty">' + bt('noAccounts') + '</div></div>';
    var groups = {}, order = [];
    list.forEach(function (r) {
      var k = norm(r.b.bank) || '—';
      if (!groups[k]) { groups[k] = { name:(r.b.bank || '—').trim(), rows:[] }; order.push(k); }
      groups[k].rows.push(r);
    });
    order.sort(function (a, b) { return groups[a].name.localeCompare(groups[b].name); });
    var h = '<div class="bk-groups">';
    order.forEach(function (k) {
      var g = groups[k];
      var coIds = uniqSorted(g.rows.map(function (r) { return r.c.id; }));
      var countries = uniqSorted(g.rows.map(function (r) { return r.b.country; }));
      var stc = {}; g.rows.forEach(function (r) { var s = stOf(r.b); stc[s] = (stc[s] || 0) + 1; });
      h += '<div class="card bk-group">';
      h += '<div class="bk-group-hd"><div><div class="bk-group-name">🏦 ' + esc(g.name) + '</div><div class="bk-sub">' + coIds.length + ' ' + bt('companiesN') + ' · ' + g.rows.length + ' ' + bt('accountsN') + (countries.length ? ' · ' + esc(countries.join(', ')) : '') + '</div></div>';
      h += '<div class="bk-group-stats">' + BK_STATUSES.filter(function (s) { return stc[s.k]; }).map(function (s) { return '<span class="bk-pill bk-st-' + s.k + '"><i></i>' + stc[s.k] + '</span>'; }).join('') + '</div></div>';
      // Bank → Company → Accounts
      var byCo = {}; var coOrder = [];
      g.rows.forEach(function (r) { if (!byCo[r.c.id]) { byCo[r.c.id] = []; coOrder.push(r.c.id); } byCo[r.c.id].push(r); });
      coOrder.sort(function (a, b) { return (byCo[a][0].c.name || '').localeCompare(byCo[b][0].c.name || ''); });
      coOrder.forEach(function (cid) {
        var rs = byCo[cid];
        h += '<div class="bk-group-co"><div class="bk-group-co-name">→ ' + esc(rs[0].c.name) + '</div><div class="bk-group-accts">';
        rs.forEach(function (r) {
          var b = r.b;
          h += '<div class="bk-group-acct" onclick="bk.open(\'' + b.id + '\',null)">';
          h += '<span class="bk-ga-l">' + esc(b.accountName || b.type || '—') + (b.currency ? ' <span class="bk-cur">' + esc(b.currency.toUpperCase()) + '</span>' : '') + (b.account ? ' <span class="bk-sub" style="display:inline">' + esc(maskAcct(b.account)) + '</span>' : '') + '</span>';
          h += '<span class="bk-ga-r">' + (isDone(b) ? '' : dueChip(b)) + pill(stOf(b)) + '</span></div>';
        });
        h += '</div></div>';
      });
      h += '</div>';
    });
    return h + '</div>';
  }

  // ── Account detail panel ────────────────────────────────────────────────────
  var ctxCompany = null; // company id when opened from the company modal
  var lastBid = null;
  function open(bid, fromCompany) {
    if (fromCompany !== undefined) ctxCompany = fromCompany || null;
    lastBid = bid;
    var r = findRow(bid); if (!r) return;
    var b = r.b, c = r.c, s = stOf(b), adm = isAdmin();
    var h = '<div class="modal-header"><div style="min-width:0">';
    h += '<div class="modal-title">' + esc(b.bank || '—') + ' <span style="color:var(--text3);font-weight:500">· ' + esc(b.accountName || b.type || '') + '</span></div>';
    h += '<div class="modal-subtitle bk-detail-sub"><span class="bk-link" onclick="bk.goCompany(\'' + c.id + '\')">' + esc(c.name) + '</span>' + (b.currency ? ' · <span class="bk-cur">' + esc(b.currency.toUpperCase()) + '</span>' : '') + (b.country ? ' · ' + esc(b.country) : '') + ' · ' + pill(s) + '</div></div>';
    h += '<div style="display:flex;gap:5px;align-items:center;flex-shrink:0">';
    if (ctxCompany) h += '<button class="btn btn-outline btn-sm" onclick="bk.backToCompany()">' + bt('backCompany') + '</button>';
    if (adm) h += '<button class="btn btn-outline btn-sm" onclick="bk.form(\'' + b.id + '\')">' + bt('edit') + '</button>';
    h += '<button class="close-btn" onclick="closeModal()">×</button></div></div>';

    h += '<div class="modal-body"><div class="bk-detail-grid"><div class="bk-col">';

    // Follow-ups = open tasks linked to this account (shared with the Tasks tab)
    var ds = dueState(b), fts = openTasks(b), canT = window.crm && crm.canEdit();
    h += '<div class="bk-nextcard bk-nc-' + (ds === 'today' ? 'soon' : ds || 'none') + '"><div class="bk-nc-hd"><span>🎯 ' + bt('followups') + (fts.length ? ' (' + fts.length + ')' : '') + '</span>';
    if (canT) h += '<button class="btn btn-primary btn-sm" onclick="crm.taskForm(null,{companyId:\'' + c.id + '\',ref:\'bank:' + b.id + '\',responsible:' + esc(JSON.stringify(b.responsible || '')).replace(/"/g, '&quot;') + '},function(){bk.open(\'' + b.id + '\')})">' + bt('addFollow') + '</button>';
    h += '</div>';
    if (fts.length) h += '<div class="bk-fu-list">' + fts.map(function (tk) { return crm.taskRow(tk, { noRef:true, noCompany:true }); }).join('') + '</div>';
    else if (b.nextAction || b.nextActionDate) h += '<div class="bk-nc-text">' + esc(b.nextAction || '—') + '</div>' + (b.nextActionDate ? '<div class="bk-nc-meta"><span>📅 ' + bt('due') + ' <b>' + esc(fmtDay(b.nextActionDate)) + '</b></span></div>' : '');
    else h += '<div class="bk-muted" style="margin-top:6px">' + bt('noNext') + '</div>';
    h += '<div class="bk-nc-meta"><span>👤 ' + bt('responsible') + ': ' + (b.responsible ? esc(b.responsible) : '<span class="bk-muted">' + bt('unassigned') + '</span>') + '</span></div>';
    h += '</div>';

    // Log an update (optionally changes status)
    if (adm) {
      h += '<div class="bk-box"><div class="fsec-title">✍ ' + bt('logTitle') + '</div>';
      h += '<textarea class="inp" id="bk-u-text" rows="2" placeholder="' + esc(bt('logPh')) + '"></textarea>';
      h += '<div class="bk-log-grid"><div class="form-group"><label class="lbl">' + bt('logKind') + '</label><select class="inp" id="bk-u-kind">' + ACT_KINDS.map(function (k) { return opt(k, bt(ACT_LBL[k]), k === 'note'); }).join('') + '</select></div>';
      h += '<div class="form-group"><label class="lbl">' + bt('logDate') + '</label><input type="date" class="inp" id="bk-u-date" value="' + today() + '"></div>';
      h += '<div class="form-group"><label class="lbl">' + bt('changeStatus') + '</label><select class="inp" id="bk-u-status">' + opt('', bt('noChange'), true) + BK_STATUSES.filter(function (x) { return x.k !== s; }).map(function (x) { return opt(x.k, stLabel(x.k), false); }).join('') + '</select></div></div>';
      h += '<div id="bk-u-err" class="imp-err" style="display:none"></div>';
      h += '<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn-primary btn-sm" onclick="bk.logUpdate(\'' + b.id + '\')">' + bt('saveUpdate') + '</button></div></div>';
    }

    // Activity timeline
    h += '<div class="bk-box"><div class="fsec-title">🕘 ' + bt('activity') + '</div>' + timelineHTML(b) + '</div>';
    h += '</div><div class="bk-col">';

    // Details
    h += '<div class="bk-box"><div class="fsec-title">' + bt('details') + '</div>';
    h += dr(bt('company'), '<span class="bk-link" onclick="bk.goCompany(\'' + c.id + '\')">' + esc(c.name) + '</span>');
    h += dr(bt('bank'), esc(b.bank)) + dr(bt('accountName'), esc(b.accountName)) + dr(bt('accountType'), esc(b.type));
    h += dr(bt('accountNo'), b.account ? acctNum(b) : '');
    h += dr(bt('currency'), esc((b.currency || '').toUpperCase())) + dr(bt('country'), esc(b.country));
    h += dr(bt('status'), pill(s)) + dr(bt('dateOpened'), b.dateOpened ? esc(fmtDay(b.dateOpened)) : '') + dr(bt('dateClosed'), b.dateClosed ? esc(fmtDay(b.dateClosed)) : '');
    h += dr(bt('responsible'), esc(b.responsible));
    var la = latestAction(b);
    h += dr(bt('lastAction'), la.text ? esc(la.text) + (la.date ? ' <span class="bk-muted">(' + esc(fmtDay(la.date)) + ')</span>' : '') : '');
    h += dr(bt('routing'), b.routing ? '<span class="bank-sensitive" onclick="this.classList.toggle(\'revealed\')">' + esc(b.routing) + '</span>' : '');
    h += dr(bt('swift'), esc(b.swift)) + dr(bt('bankAddr'), esc(b.bankAddr));
    h += dr(bt('created'), b.createdAt ? esc(fmtDay(b.createdAt.slice(0, 10))) + (b.createdBy ? ' <span class="bk-muted">' + bt('by') + ' ' + esc(b.createdBy) + '</span>' : '') : '');
    h += dr(bt('lastUpdated'), b.updatedAt ? esc(fmtDay(b.updatedAt.slice(0, 10))) + (b.updatedBy ? ' <span class="bk-muted">' + bt('by') + ' ' + esc(b.updatedBy) + '</span>' : '') : '');
    h += '</div>';
    if (b.notes) h += '<div class="bk-box"><div class="fsec-title">' + bt('notes') + '</div><div class="bk-notes">' + esc(b.notes) + '</div></div>';

    // Pluggable future sections (contacts, signatories, KYC, checklists…)
    bk.sections.forEach(function (sec) {
      try { var body = sec.render(b, c); if (body) h += '<div class="bk-box"><div class="fsec-title">' + esc(typeof sec.title === 'function' ? sec.title() : sec.title) + '</div>' + body + '</div>'; } catch (e) { console.warn('[bank section]', sec.id, e); }
    });

    if (adm) h += '<div style="text-align:right;margin-top:6px"><button class="bk-link bk-danger-link" onclick="bk.del(\'' + b.id + '\')">🗑 ' + bt('danger') + '</button></div>';
    h += '</div></div></div>';
    showModal(h, true);
    if (window.crm) crm.setRefresher(function () { open(bid); });
  }
  function doneTasks(b) { return (window.crm && crm.isReady()) ? crm.tasksFor('bank', b.id, false).filter(function (t) { return t.status === 'done' && t.completedAt; }) : []; }
  function latestAction(b) {
    var best = { text:b.lastAction || '', date:b.lastActionDate || '' };
    doneTasks(b).forEach(function (t) { var d = t.completedAt.slice(0, 10); if (d >= best.date) best = { text:bt('completedLog') + t.title, date:d }; });
    return best;
  }

  function timelineHTML(b) {
    var derived = doneTasks(b).map(function (t) { return { id:'t' + t.id, kind:'action', date:t.completedAt.slice(0, 10), at:t.completedAt, by:t.completedBy, text:bt('completedLog') + t.title, derived:true }; });
    var acts = (b.activity || []).concat(derived).sort(function (x, y) { return (y.date || '').localeCompare(x.date || '') || (y.at || '').localeCompare(x.at || ''); });
    if (!acts.length) return '<div class="bk-muted" style="padding:6px 0">' + bt('noActivity') + '</div>';
    var h = '<div class="bk-timeline">', lastDate = null;
    acts.forEach(function (a) {
      if (a.date !== lastDate) { h += '<div class="bk-tl-date">' + esc(fmtLong(a.date)) + '</div>'; lastDate = a.date; }
      var dotCls = a.kind === 'status' ? 'bk-st-' + (ST_BY[a.to] ? a.to : 'open') : 'bk-k-' + a.kind;
      h += '<div class="bk-tl-item"><span class="bk-tl-dot ' + dotCls + '"></span><div class="bk-tl-body">';
      h += '<div class="bk-tl-kind">' + esc(bt(ACT_LBL[a.kind] || 'kNote')) + (a.by ? ' · <span class="bk-muted">' + esc(a.by) + '</span>' : '');
      if (isAdmin() && a.kind !== 'created' && !a.derived) h += ' <button class="bk-tl-del" title="✕" onclick="bk.delAct(\'' + b.id + '\',\'' + a.id + '\')">✕</button>';
      h += '</div>';
      if (a.kind === 'status') h += '<div class="bk-tl-status">' + (a.from ? pill(a.from) + ' <span class="bk-muted">→</span> ' : '') + pill(a.to) + '</div>';
      if (a.text) h += '<div class="bk-tl-text">' + esc(a.text) + '</div>';
      h += '</div></div>';
    });
    return h + '</div>';
  }

  // Apply a status change with sensible side-effects (dates) + history entry
  function applyStatus(b, to, date, note) {
    var from = stOf(b);
    if (to === from) return false;
    b.status = to;
    if (to === 'open' && !b.dateOpened) b.dateOpened = date || today();
    if (to === 'closed' && !b.dateClosed) b.dateClosed = date || today();
    addAct(b, { kind:'status', from:from, to:to, date:date || today(), text:note || '' });
    return true;
  }

  function logUpdate(bid) {
    var r = findRow(bid); if (!r || !isAdmin()) return;
    var b = r.b, text = gv('bk-u-text').trim(), kind = gv('bk-u-kind') || 'note', date = gv('bk-u-date') || today(), to = gv('bk-u-status');
    if (!text && !to) { var e = document.getElementById('bk-u-err'); if (e) { e.textContent = bt('needText'); e.style.display = 'block'; } return; }
    if (to) applyStatus(b, to, date, text);
    else addAct(b, { kind:kind, date:date, text:text });
    if (text && (!b.lastActionDate || date >= b.lastActionDate)) { b.lastAction = text; b.lastActionDate = date; }
    touch(b); persist(); open(bid);
  }
  function delAct(bid, aid) {
    var r = findRow(bid); if (!r || !isAdmin()) return;
    if (!confirm(bt('delAct'))) return;
    r.b.activity = (r.b.activity || []).filter(function (a) { return a.id !== aid; });
    touch(r.b); persist(); open(bid);
  }
  function del(bid) {
    var r = findRow(bid); if (!r || !isAdmin()) return;
    if (!confirm(bt('delConfirm'))) return;
    r.c.banking = r.c.banking.filter(function (b) { return b.id !== bid; });
    persist(); closeModal();
    if (ctxCompany) backToCompany();
  }

  // ── Add / edit form ─────────────────────────────────────────────────────────
  var formCtx = null; // { bid, presetCo, fromCompany }
  function form(bid, presetCo, fromCompany) {
    if (!isAdmin()) return;
    formCtx = { bid:bid || null, presetCo:presetCo || null, fromCompany:(fromCompany !== undefined ? fromCompany : ctxCompany) || null };
    var r = bid ? findRow(bid) : null, b = r ? r.b : {}, coId = r ? r.c.id : (presetCo || '');
    var all = rows();
    var cos = (data.companies || []).slice().sort(function (a, b2) { return (a.name || '').localeCompare(b2.name || ''); });
    function inp(id, label, val, extra, full) { return '<div class="form-group' + (full ? ' full' : '') + '"><label class="lbl">' + label + '</label><input class="inp" id="' + id + '" value="' + esc(val || '') + '" ' + (extra || '') + '></div>'; }
    var h = '<div class="modal-header"><div><div class="modal-title">' + (bid ? bt('edit') + ' · ' + esc(b.bank || '') : bt('add').replace('+ ', '')) + '</div>' + (r ? '<div class="modal-subtitle">' + esc(r.c.name) + '</div>' : '') + '</div><button class="close-btn" onclick="bk.cancelForm()">×</button></div>';
    h += '<div class="modal-body">';
    h += '<div class="fsec"><div class="fsec-title">' + bt('secCompany') + '</div><div class="form-group"><label class="lbl">' + bt('company') + ' *</label><select class="inp" id="bk-e-co"><option value="">' + esc(bt('selectCompany')) + '</option>';
    cos.forEach(function (c) { h += opt(c.id, c.name + (c.jurisdiction ? ' — ' + c.jurisdiction : '') + (c.status === 'liquidated' ? ' (' + bt('liquidated') + ')' : ''), c.id === coId); });
    h += '</select></div></div>';

    h += '<div class="fsec"><div class="fsec-title">' + bt('secBank') + '</div><div class="form-grid">';
    h += inp('bk-e-bank', bt('bank') + ' *', b.bank, 'list="bk-dl-bank" autocomplete="off"');
    h += inp('bk-e-name', bt('accountName'), b.accountName, 'placeholder="e.g. Main operating account"');
    h += inp('bk-e-acc', bt('accountNo'), b.account, 'autocomplete="off"');
    h += inp('bk-e-type', bt('accountType'), b.type || (bid ? '' : 'Checking'), 'list="bk-dl-type"');
    h += inp('bk-e-cur', bt('currency'), b.currency || (bid ? '' : 'USD'), 'list="bk-dl-cur" style="text-transform:uppercase"');
    h += inp('bk-e-country', bt('country'), b.country, 'list="bk-dl-country"');
    h += '</div><details class="bk-details"' + (b.routing || b.swift || b.bankAddr ? ' open' : '') + '><summary>' + bt('moreBank') + '</summary><div class="form-grid" style="margin-top:10px">';
    h += inp('bk-e-rou', bt('routing'), b.routing) + inp('bk-e-sw', bt('swift'), b.swift) + inp('bk-e-addr', bt('bankAddr'), b.bankAddr, '', true);
    h += '</div></details></div>';

    h += '<div class="fsec"><div class="fsec-title">' + bt('secStatus') + '</div><div class="form-grid bk-form-3">';
    h += '<div class="form-group"><label class="lbl">' + bt('status') + '</label><select class="inp" id="bk-e-status" onchange="bk.formStatusChanged()">';
    var curSt = bid ? stOf(b) : 'opening';
    BK_STATUSES.forEach(function (s) { h += opt(s.k, stLabel(s.k), s.k === curSt); });
    h += '</select></div>';
    h += '<div class="form-group"><label class="lbl">' + bt('dateOpened') + '</label><input type="date" class="inp" id="bk-e-opened" value="' + esc(b.dateOpened || '') + '"></div>';
    h += '<div class="form-group"><label class="lbl">' + bt('dateClosed') + '</label><input type="date" class="inp" id="bk-e-closed" value="' + esc(b.dateClosed || '') + '"></div>';
    h += '</div></div>';

    h += '<div class="fsec"><div class="fsec-title">' + bt('secMgmt') + '</div><div class="form-grid">';
    h += inp('bk-e-resp', bt('responsible'), b.responsible || (bid ? '' : me()), 'list="bk-dl-resp"');
    if (!bid) {
      h += '<div class="form-group"><label class="lbl">' + bt('firstFollowDate') + '</label><input type="date" class="inp" id="bk-e-ndate"></div>';
      h += inp('bk-e-next', bt('firstFollow'), '', 'placeholder="Follow up with bank regarding account approval"', true);
    }
    h += '<div class="form-group full"><label class="lbl">' + bt('notes') + '</label><textarea class="inp" id="bk-e-notes" rows="3">' + esc(b.notes || '') + '</textarea></div>';
    h += '</div></div>';

    h += datalist('bk-dl-bank', uniqSorted(all.map(function (x) { return x.b.bank; })));
    h += datalist('bk-dl-type', uniqSorted(ACC_TYPES.concat(all.map(function (x) { return x.b.type; }))));
    h += datalist('bk-dl-cur', uniqSorted(CURRENCIES.concat(all.map(function (x) { return (x.b.currency || '').toUpperCase(); }))));
    h += datalist('bk-dl-country', uniqSorted(all.map(function (x) { return x.b.country; }).concat((data.companies || []).map(function (c) { return c.jurisdiction; }))));
    h += datalist('bk-dl-resp', uniqSorted(all.map(function (x) { return x.b.responsible; }).concat([me()])));

    h += '<div id="bk-e-msg"></div>';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end;padding-top:14px;border-top:1px solid var(--border)"><button class="btn btn-outline" onclick="bk.cancelForm()">' + bt('cancel') + '</button><button class="btn btn-primary" onclick="bk.saveForm(false)">' + bt('save') + '</button></div>';
    h += '</div>';
    showModal(h, true);
  }
  function formStatusChanged() {
    var s = gv('bk-e-status');
    var op = document.getElementById('bk-e-opened'), cl = document.getElementById('bk-e-closed');
    if (s === 'open' && op && !op.value) op.value = today();
    if (s === 'closed' && cl && !cl.value) cl.value = today();
  }
  function cancelForm() {
    var fc = formCtx || {};
    if (fc.bid) open(fc.bid);
    else if (fc.fromCompany) backToCompany();
    else closeModal();
  }

  // Duplicate detection: company + bank + account number (and softer signals)
  function findDupes(v, selfId) {
    var out = [], nb = norm(v.bank), na = normAcct(v.account);
    rows().forEach(function (r) {
      var b = r.b; if (b.id === selfId || norm(b.bank) !== nb || !nb) return;
      var ob = normAcct(b.account), reason = '';
      if (r.c.id === v.companyId) {
        if (na && ob && na === ob) reason = 'dupSameNum';
        else if (na && ob && (isMasked(v.account) || isMasked(b.account)) && last4(v.account) === last4(b.account)) reason = 'dupMasked';
        else if ((!na || !ob) && norm(b.accountName) === norm(v.accountName) && (b.currency || '').toUpperCase() === v.currency) reason = 'dupSameName';
      } else if (na && ob && na === ob && na.length >= 6 && !isMasked(v.account)) reason = 'dupOtherCo';
      if (reason) out.push({ r:r, reason:reason });
    });
    return out;
  }

  function saveForm(force) {
    if (!isAdmin()) return;
    var fc = formCtx || {};
    var msg = document.getElementById('bk-e-msg');
    var v = {
      companyId:gv('bk-e-co'), bank:gv('bk-e-bank').trim(), accountName:gv('bk-e-name').trim(), account:gv('bk-e-acc').trim(),
      type:gv('bk-e-type').trim(), currency:gv('bk-e-cur').trim().toUpperCase(), country:gv('bk-e-country').trim(),
      routing:gv('bk-e-rou').trim(), swift:gv('bk-e-sw').trim(), bankAddr:gv('bk-e-addr').trim(),
      status:gv('bk-e-status') || 'open', dateOpened:gv('bk-e-opened'), dateClosed:gv('bk-e-closed'),
      responsible:gv('bk-e-resp').trim(), nextAction:gv('bk-e-next').trim(), nextActionDate:gv('bk-e-ndate'), notes:gv('bk-e-notes')
    };
    if (!v.companyId) { msg.innerHTML = '<div class="imp-err">' + bt('reqCompany') + '</div>'; return; }
    if (!v.bank) { msg.innerHTML = '<div class="imp-err">' + bt('reqBank') + '</div>'; return; }
    var newCo = coById(v.companyId); if (!newCo) return;
    // Snap to the existing spelling of a known bank so grouping stays clean
    var known = rows().find(function (x) { return x.b.id !== fc.bid && norm(x.b.bank) === norm(v.bank); });
    if (known) v.bank = known.b.bank.trim();

    if (!force) {
      var d = findDupes(v, fc.bid);
      if (d.length) {
        var hh = '<div class="bk-dup"><b>⚠ ' + bt('dupTitle') + '</b><div style="margin:4px 0 6px">' + bt('dupIntro') + '</div><ul>';
        d.forEach(function (x) { hh += '<li><b>' + esc(x.r.c.name) + '</b> · ' + esc(x.r.b.bank) + ' · ' + esc(x.r.b.accountName || x.r.b.type || '') + ' ' + esc(maskAcct(x.r.b.account)) + ' ' + pill(stOf(x.r.b)) + ' <span class="bk-muted">— ' + bt(x.reason) + '</span></li>'; });
        hh += '</ul><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-outline btn-sm" onclick="bk.open(\'' + d[0].r.b.id + '\')">' + bt('details') + ' →</button><button class="btn btn-danger btn-sm" onclick="bk.saveForm(true)">' + bt('saveAnyway') + '</button></div></div>';
        msg.innerHTML = hh; msg.scrollIntoView({ block:'nearest' });
        return;
      }
    }

    var FIELDS = ['bank', 'accountName', 'account', 'type', 'currency', 'country', 'routing', 'swift', 'bankAddr', 'dateOpened', 'dateClosed', 'responsible', 'notes'];
    var b;
    if (fc.bid) {
      var r = findRow(fc.bid); if (!r) return;
      b = r.b;
      // Move between companies if the company changed (same object → no duplicate)
      if (r.c.id !== newCo.id) {
        r.c.banking = r.c.banking.filter(function (x) { return x.id !== b.id; });
        newCo.banking.push(b);
        addAct(b, { kind:'edit', text:tpl(bt('movedLog'), { a:r.c.name, b:newCo.name }) });
      }
      var changed = FIELDS.filter(function (k) { return String(b[k] || '') !== String(v[k] || ''); });
      var statusFrom = stOf(b);
      FIELDS.forEach(function (k) { b[k] = v[k]; }); // merge — keeps activity & any future keys
      if (v.status !== statusFrom) applyStatus(b, v.status, today(), '');
      if (changed.length) addAct(b, { kind:'edit', text:bt('updatedFields') + changed.map(function (k) { return fieldLabel(k); }).join(', ') });
    } else {
      b = { id:uid(), createdAt:nowISO(), createdBy:me(), activity:[] };
      FIELDS.forEach(function (k) { b[k] = v[k]; });
      b.status = v.status;
      addAct(b, { kind:'created', text:bt('createdLog') });
      addAct(b, { kind:'status', from:'', to:v.status });
      newCo.banking.push(b);
    }
    touch(b);
    persist();
    if (!fc.bid && (v.nextAction || v.nextActionDate) && window.crm && crm.canEdit()) {
      crm.addTask({ title:v.nextAction || bt('followups'), dueDate:v.nextActionDate, responsible:v.responsible, companyId:newCo.id, ref:{ type:'bank', id:b.id, label:b.bank } });
      crm.persist('tasks');
    }
    if (fc.fromCompany && !fc.bid) { ctxCompany = newCo.id; backToCompany(); }
    else open(b.id);
  }
  function fieldLabel(k) {
    return bt({ bank:'bank', accountName:'accountName', account:'accountNo', type:'accountType', currency:'currency', country:'country', routing:'routing', swift:'swift', bankAddr:'bankAddr', dateOpened:'dateOpened', dateClosed:'dateClosed', responsible:'responsible', notes:'notes' }[k] || k);
  }

  // ── Navigation helpers ──────────────────────────────────────────────────────
  function openCompanyBankTab(cid) {
    openCompany(cid);
    var tries = 0;
    (function clickTab() {
      var ov = document.getElementById('modal-overlay');
      var btn = ov && Array.prototype.find.call(ov.querySelectorAll('.tab'), function (x) { return (x.getAttribute('onclick') || '').indexOf('td-bank') !== -1; });
      if (btn) btn.click(); else if (tries++ < 10) setTimeout(clickTab, 40);
    })();
  }
  function backToCompany() { var cid = ctxCompany; ctxCompany = null; if (cid) openCompanyBankTab(cid); else closeModal(); }
  function goCompany(cid) { ctxCompany = null; closeModal(); openCompany(cid); }
  function showForCompany(cid) { closeModal(); F = Object.assign({}, F0, { company:cid }); ctxCompany = null; go(PAGE); }

  // ── Actions exposed to inline handlers ──────────────────────────────────────
  function set(k, v) { F[k] = v; rerenderMain(); }
  function quick(k, v) { var already = activeFilterCount() === 1 && F[k] === v; F = Object.assign({}, F0); if (!already) F[k] = v; if (['country', 'currency', 'resp', 'life', 'next', 'from', 'to'].indexOf(k) !== -1 && !already) showMore = true; rerenderMain(); }
  function reset() { F = Object.assign({}, F0); rerenderMain(); }
  function toggleMore() { showMore = !showMore; rerenderMain(); }
  function setView(v) { view = v; try { localStorage.setItem('fm_bk_view', v); } catch (e) {} rerenderMain(); }
  function sortBy(k) { if (sortK === k) sortDir = -sortDir; else { sortK = k; sortDir = (k === 'updated') ? -1 : 1; } rerenderMain(); }
  function reveal(btn, ev) {
    if (ev) ev.stopPropagation();
    var sp = btn.previousElementSibling; if (!sp) return;
    var shown = sp.getAttribute('data-shown') === '1';
    sp.textContent = shown ? sp.getAttribute('data-mask') : sp.getAttribute('data-full');
    sp.setAttribute('data-shown', shown ? '0' : '1');
    btn.title = shown ? bt('reveal') : bt('hide');
    btn.classList.toggle('on', !shown);
  }
  function exportCSV() {
    var out = [['Company', 'Jurisdiction', 'Bank', 'Account Name', 'Account Type', 'Account #', 'Currency', 'Country', 'Status', 'Date Opened', 'Date Closed', 'Responsible', 'Next Action', 'Next Action Date', 'Latest Action', 'SWIFT', 'Routing', 'Notes', 'Last Updated']];
    sortRows(rows().filter(matches)).forEach(function (r) {
      var b = r.b;
      out.push([r.c.name, r.c.jurisdiction, b.bank, b.accountName, b.type, b.account, (b.currency || '').toUpperCase(), b.country, stLabel(stOf(b)), b.dateOpened, b.dateClosed, b.responsible, nx(b).text, nx(b).date, latestAction(b).text, b.swift, b.routing, b.notes, (b.updatedAt || '').slice(0, 10)]);
    });
    dlCSV(out, 'famofi_bank_accounts.csv');
  }

  // ── Company modal integration (replaces the Banking tab contents) ──────────
  window.buildBankingTabHTML = function (id) {
    var c = coById(id); if (!c) return '';
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap">';
    h += (canSeeTab(PAGE) ? '<button class="bk-link" onclick="bk.showForCompany(\'' + id + '\')">' + bt('viewAll') + '</button>' : '<span></span>');
    if (isAdmin()) h += '<button class="btn btn-primary btn-sm" onclick="bk.form(null,\'' + id + '\',\'' + id + '\')">' + bt('add') + '</button>';
    h += '</div><div id="bank-view-list">' + window.renderBankView(id) + '</div>';
    return h;
  };
  window.renderBankView = function (id) {
    var c = coById(id); if (!c) return '';
    if (!(c.banking || []).length) return '<div class="empty">' + t('noData') + '</div>';
    var list = c.banking.slice().sort(function (a, b) { return (isDone(a) - isDone(b)) || ST_BY[stOf(a)].order - ST_BY[stOf(b)].order || (a.bank || '').localeCompare(b.bank || ''); });
    var h = '<div class="bk-co-list">';
    list.forEach(function (b) {
      if (!b.id) b.id = uid();
      h += '<div class="bk-co-item' + (isDone(b) ? ' bk-done' : '') + '" onclick="bk.open(\'' + b.id + '\',\'' + id + '\')">';
      h += '<div class="bk-co-top"><div><div class="bk-bank">' + esc(b.bank || '—') + ' <span class="bk-muted" style="font-weight:400">· ' + esc(b.accountName || b.type || '') + '</span></div>';
      h += '<div class="bk-sub">' + (b.currency ? '<span class="bk-cur">' + esc(b.currency.toUpperCase()) + '</span> ' : '') + (b.account ? acctNum(b) : '') + (b.country ? ' · ' + esc(b.country) : '') + '</div></div>' + pill(stOf(b)) + '</div>';
      var n2 = nx(b);
      if (n2.n && !isDone(b)) h += '<div class="bk-co-next">🎯 ' + esc(trunc(n2.text, 70)) + ' ' + dueChip(b) + (n2.n > 1 ? ' <span class="bk-muted" style="font-size:11px">+' + (n2.n - 1) + ' ' + bt('moreN') + '</span>' : '') + '</div>';
      if (b.notes) h += '<div class="bk-co-notes">' + esc(trunc(b.notes, 140)) + '</div>';
      h += '</div>';
    });
    return h + '</div>';
  };
  // Legacy entry points from script.js → new CRM form (keeps CRM fields intact)
  window.addBankInModal = function (cid) { form(null, cid, cid); };
  window.editBankInModal = function (cid, idx) { var c = coById(cid); if (c && c.banking[idx]) { ctxCompany = cid; form(c.banking[idx].id, null, cid); } };
  window.commitBankEdit = function (cid, idx) { // safety: merge instead of replace
    var c = coById(cid); if (!c || !c.banking[idx]) return;
    Object.assign(c.banking[idx], { bank:gv('bk-bank'), account:gv('bk-acc'), routing:gv('bk-rou'), swift:gv('bk-sw'), bankAddr:gv('bk-addr'), currency:gv('bk-cur'), type:gv('bk-type') });
    touch(c.banking[idx]); save(); closeModal(); openCompany(cid);
  };
  window.delBankAccount = function (cid, idx) {
    var c = coById(cid); if (!c || !c.banking[idx]) return;
    if (!confirm(bt('delConfirm'))) return;
    c.banking.splice(idx, 1); save();
    var el = document.getElementById('bank-view-list'); if (el) el.innerHTML = window.renderBankView(cid);
  };

  // ── Router integration (wrap, don't replace) ────────────────────────────────
  if (pages.indexOf(PAGE) === -1) {
    var at = pages.indexOf('investments');
    pages.splice(at === -1 ? pages.length : at + 1, 0, PAGE);
  }
  var _render = window.render, _renderPage = window.renderPage;
  window.render = function () {
    _render.apply(this, arguments);
    if (page === PAGE) { var m = document.getElementById('main'); if (m) m.innerHTML = renderTab(); }
  };
  window.renderPage = function () {
    if (page === PAGE) { var m = document.getElementById('main'); if (m) { destroyCharts(); m.innerHTML = renderTab(); } return; }
    return _renderPage.apply(this, arguments);
  };

  // ── Public namespace ────────────────────────────────────────────────────────
  window.bk = {
    statuses:BK_STATUSES, sections:[], rows:rows,
    open:open, form:form, saveForm:saveForm, cancelForm:cancelForm, formStatusChanged:formStatusChanged,
    logUpdate:logUpdate, delAct:delAct, del:del,
    set:set, quick:quick, reset:reset, toggleMore:toggleMore, setView:setView, sort:sortBy, reveal:reveal, exportCSV:exportCSV,
    goCompany:goCompany, backToCompany:backToCompany, showForCompany:showForCompany, pill:pill
  };

  // One-time move of legacy per-account "next action" fields into the shared task list
  function migrateNext() {
    if (!window.crm || !crm.canEdit() || !isAdmin()) return;
    var todo = rows().filter(function (r) { return r.b.nextAction || r.b.nextActionDate; });
    if (!todo.length) return;
    todo.forEach(function (r) {
      var b = r.b;
      if (!crm.tasksFor('bank', b.id, false).some(function (t) { return t.title === (b.nextAction || '') && (t.dueDate || '') === (b.nextActionDate || ''); }))
        crm.addTask({ title:b.nextAction || bt('followups'), dueDate:b.nextActionDate || '', responsible:b.responsible || '', companyId:r.c.id, ref:{ type:'bank', id:b.id, label:b.bank } });
    });
    crm.persist('tasks', true).then(function () {
      todo.forEach(function (r) { delete r.b.nextAction; delete r.b.nextActionDate; });
      save();
      if (page === PAGE) rerenderMain();
      console.log('[bank] moved ' + todo.length + ' next actions into Tasks');
    });
  }
  if (window.crm) crm.whenReady(migrateNext);

  // If the app is already visible (auth resolved first), refresh the nav
  var app = document.getElementById('app');
  if (app && app.style.display === 'flex') render();
})();
