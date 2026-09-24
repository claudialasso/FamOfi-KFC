// ═══════════════════════════════════════════════════════════════════════════════
// FamOfi Registry — Org Chart engine (v3: "clean hierarchy")
// Loaded with `defer` after script.js / crm.js / banking.js. Replaces the org-chart
// graph builder, layout, line routing and print scaling. Keeps every entry point the
// rest of the site calls: orgBuildGraph, orgRenderGraphHTML, buildFullOrgChart,
// buildFilteredOrgChart, orgChartFit, orgChartFitBtn, initOrgChartViewport.
//
// READ-ONLY: never changes ownership data. No relationship is dropped — every
// shareholder of every entity on the chart is either a line or listed on the card.
//
// DESIGN
//   • Lines form a clean tree. Every entity hangs from ONE line: its largest owner on
//     the chart (subsidiaries) or the entity it owns (shareholders above). Lines are
//     short elbow connectors between adjacent levels only.
//   • Every other owner of an entity is listed inside that entity's card under
//     "Also owned by", with its %. ↗ marks owners that also appear as a box on this
//     chart; hovering highlights them. No long lines across the chart.
//   • Investments are listed inside the card of the company that holds them.
//   • A company with many subsidiaries that have nothing below them shows them as a
//     compact two-column list off one vertical line instead of one very wide row.
//   • Each level sits on its own shaded band with a label, so the structure reads
//     top-to-bottom: shareholders → selected company → subsidiaries.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var C = {
    W: 212, IND_W: 188, LABEL_COL: 128, MARGIN: 20,
    HEAD_H: 62, IND_H: 52, ROW_H: 15, SEC_HEAD: 18, SEC_PAD: 6, STATUS_H: 13,
    INV_MAX_SCREEN: 5, GROUP_MIN: 3,
    GAP: 30, SUBTREE_GAP: 40,
    SPINE_MIN: 4, SPINE_SG: 66, SPINE_ROW_GAP: 16, STUB_Y: 24,
    PORT_SP: 62, TRACK_SP: 12, GAP_TOP: 20, GAP_MID: 8, PILL_ZONE: 30, GAP_NOPILL: 18, MIN_GAP: 64,
    BAND_PAD: 12,
    AUTO_MAX_CARDS: 40, MIN_READ_SCALE: 0.5
  };

  // ── i18n ──────────────────────────────────────────────────────────────────
  function L(k) {
    var es = (typeof lang !== 'undefined' && lang === 'es');
    var T = {
      individual: ['Individual', 'Persona'], trust: ['Trust', 'Fideicomiso / Trust'],
      holding: ['Holding company', 'Holding'], company: ['Company', 'Empresa'],
      investments: ['Investments', 'Inversiones'], shareholders: ['Shareholders', 'Accionistas'], group: ['Shareholders', 'Accionistas'], selected: ['Selected', 'Seleccionada'],
      inLiq: ['In liquidation', 'En liquidación'], liquidated: ['Liquidated', 'Liquidada'],
      alsoOwned: ['Also owned by', 'También propiedad de'], ownedBy: ['Owned by', 'Propiedad de'], sharedWith: ['also held by', 'también en'],
      more: ['more', 'más'], hidden: ['hidden', 'ocultas'], showLess: ['show less', 'ver menos'],
      lvlSel: ['Selected company', 'Empresa seleccionada'],
      lvlUp: ['Shareholders · level {n}', 'Accionistas · nivel {n}'],
      lvlDown: ['Subsidiaries · level {n}', 'Subsidiarias · nivel {n}'],
      lgLine: ['Line = main owner → owned entity (% on the line)', 'Línea = dueño principal → entidad (% en la línea)'],
      lgAlso: ['“Also owned by” = the entity’s other owners · ↗ = also shown on this chart (hover to highlight)',
               '“También propiedad de” = los demás dueños · ↗ = también en este gráfico (pase el cursor)'],
      lgInv: ['Investments are listed inside the company that holds them', 'Las inversiones se listan dentro de la empresa que las posee'],
      circular: ['circular holding', 'participación circular'],
      expandAll: ['Expand all', 'Expandir todo'], collapseAll: ['Collapse levels', 'Contraer niveles'],
      showOwners: ['Show owners', 'Mostrar dueños'], showHoldings: ['Show holdings', 'Mostrar participadas'], hide: ['Hide', 'Ocultar'],
      pageStd: ['Prints on one {o} page at about {p}% scale.', 'Se imprime en una página {o} a aprox. {p}%.'],
      pageCustom: ['Large chart: prints on one custom-size page ({w} × {h} in) at {p}% so nothing is cut. Choose “Save as PDF” as the printer for best results.',
                   'Gráfico grande: se imprime en una página de tamaño personalizado ({w} × {h} in) al {p}% para no cortar nada. Elija “Guardar como PDF” como impresora.'],
      landscape: ['landscape', 'horizontal'], portrait: ['portrait', 'vertical']
    };
    return (T[k] || [k, k])[es ? 1 : 0];
  }
  function E(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function JQ(s) { return E("'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"); }
  function fmtPct(p) { if (p == null || p === '' || isNaN(+p)) return null; return (Math.round(+p * 100) / 100).toString() + '%'; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function byName(a, b) { return String(a).localeCompare(String(b)); }

  // ── Entity typing (display only) ──────────────────────────────────────────
  var TYPE_COL = {
    individual: { c: 'var(--amber)', bg: 'var(--amber-bg)' },
    trust:      { c: 'var(--purple)', bg: 'var(--purple-bg)' },
    holding:    { c: 'var(--blue)', bg: 'var(--blue-bg)' },
    company:    { c: 'var(--teal)', bg: 'var(--teal-bg)' }
  };
  function isTrustName(n) { return /\b(trust|fideicomiso|foundation|fundaci[oó]n)\b/i.test(n || ''); }

  // ── Context: active companies + indexes (cached per data snapshot) ─────────
  var _ctx = { src: null, liq: null, ctx: null };
  function context(cid) {
    var all = _sanitizedCompanies();
    var focal = all.find(function (c) { return c.id === cid; });
    var liq = !!(focal && focal.status === 'liquidated');
    if (_ctx.src === all && _ctx.liq === liq && _ctx.ctx) return _ctx.ctx;
    var comps = liq ? all : all.filter(function (c) { return c.status !== 'liquidated'; });
    var byId = {}, subsOf = {}, ownsCo = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    comps.forEach(function (c) {
      (c.shareholders || []).forEach(function (s) {
        if (s.type === 'company' && byId[s.person]) { (subsOf[s.person] = subsOf[s.person] || []).push({ co: c, sh: s }); ownsCo[s.person] = true; }
      });
    });
    var ctx = { byId: byId, subsOf: subsOf, ownsCo: ownsCo, all: all };
    _ctx = { src: all, liq: liq, ctx: ctx };
    return ctx;
  }
  function coType(ctx, c) { if (isTrustName(c.name)) return 'trust'; if (ctx.ownsCo[c.id]) return 'holding'; return 'company'; }
  function companyInvestments(cid) { return (data.investments || []).filter(function (i) { return invCoIds(i).indexOf(cid) !== -1; }); }

  // ── View state (per selected company; display only) ───────────────────────
  var COLL = {};   // cid -> { set:{key:true}, auto:bool }
  var INVX = {};   // cid -> { key:true }  cards whose investment list is expanded

  // ════════════════════════════════════════════════════════════════════════
  // 1. GRAPH  (tree lines + notes)
  // ════════════════════════════════════════════════════════════════════════
  function buildGraph(cid, opts) {
    opts = opts || {};
    var ctx = context(cid), byId = ctx.byId;
    var focalCo = byId[cid] || ctx.all.find(function (c) { return c.id === cid; });
    if (!focalCo) return null;
    if (!byId[cid]) byId[cid] = focalCo;
    var showUp = opts.shareholders !== false, showDown = opts.subsidiaries !== false, showInv = opts.investments !== false;
    var shF = opts.shIds || null, subF = opts.subIds || null, invF = opts.invIds || null;
    var coll = opts.collapsed || {};
    var nodes = {}, edges = [], seenE = {};
    var fk = 'co:' + cid;

    function add(key, o) { if (nodes[key]) return nodes[key]; o.key = key; o.also = []; o.invs = []; nodes[key] = o; return o; }
    function coNode(id, role, depth) {
      var c = byId[id];
      return add('co:' + id, { kind: role === 'focal' ? 'focal' : (role === 'down' ? 'subsidiary' : 'company'), role: role, depth: depth, refId: id, coId: id,
        name: c.name, jur: c.jurisdiction || '', status: c.status || '', etype: coType(ctx, c), sub: c.jurisdiction || '' });
    }
    function indNode(name, depth) {
      return add('ind:' + name, { kind: 'individual', role: 'up', depth: depth, refId: name, coId: null, name: name, jur: '', etype: 'individual', sub: '' });
    }
    function ownerKey(s) { return s.type === 'company' ? 'co:' + s.person : 'ind:' + s.person; }
    function ownerName(s) { return s.type === 'company' ? cname(s.person) : s.person; }
    function ownerType(s) { return s.type === 'company' ? (byId[s.person] ? coType(ctx, byId[s.person]) : 'company') : 'individual'; }
    function edge(a, b, pct, kind) {
      var k = a + '|' + b; if (a === b || seenE[k]) return; seenE[k] = 1;
      edges.push({ from: a, to: b, pct: (pct == null || pct === '' || isNaN(+pct)) ? null : +pct, kind: kind });
    }
    function note(targetKey, s, extra) {
      var ok = ownerKey(s);
      nodes[targetKey].also.push({ key: ok, name: ownerName(s), pct: (s.pct == null || s.pct === '' || isNaN(+s.pct)) ? null : +s.pct,
        etype: ownerType(s), onChart: false, circular: !!(extra && extra.circular) });
    }

    coNode(cid, 'focal', 0);
    var deferredNotes = []; // [targetKey, shareholder]

    // ── Shareholders above (inverted tree). Each owner's LINE goes to its largest
    //    stake on the chart; its other stakes are listed on those cards.
    if (showUp) {
      var qu = [cid], upE = [], firstT = {};
      while (qu.length) {
        var id = qu.shift(), k = 'co:' + id, n = nodes[k];
        if (id !== cid && coll[k]) { n.collapsedUp = true; continue; }
        (byId[id].shareholders || []).forEach(function (s) {
          if (!s.person) return;
          if (s.type === 'company' && !byId[s.person]) return;
          if (shF && !shF.has(s.id)) return;
          var ok = ownerKey(s);
          if (ok === fk) { deferredNotes.push([k, s, true]); return; }
          if (!nodes[ok]) {
            if (s.type === 'company') { coNode(s.person, 'up', null); qu.push(s.person); } else indNode(s.person, null);
            firstT[ok] = k;
          }
          upE.push({ from: ok, to: k, pct: s.pct, s: s });
        });
      }
      var tChild = {};
      Object.keys(firstT).forEach(function (o) {
        var best = null;
        upE.forEach(function (e) { if (e.from === o && (best == null || (+e.pct || 0) > (+best.pct || 0))) best = e; });
        tChild[o] = best ? best.to : firstT[o];
      });
      function loops(o) { var seen = {}, x = o, guard = 0; while (x && x !== fk && guard++ < 500) { if (seen[x]) return true; seen[x] = 1; x = tChild[x]; } return x !== fk; }
      Object.keys(tChild).forEach(function (o) { if (loops(o)) tChild[o] = firstT[o]; });
      function upDepth(o, guard) { if (o === fk) return 0; if ((guard = (guard || 0) + 1) > 400) return -1; return upDepth(tChild[o], guard) - 1; }
      Object.keys(tChild).forEach(function (o) { nodes[o].depth = upDepth(o); nodes[o].treeChild = tChild[o]; });
      upE.forEach(function (e) {
        var o = nodes[e.from], t = nodes[e.to];
        if (tChild[e.from] === e.to) edge(e.from, e.to, e.pct, 'tree');
        else if (o.depth === t.depth - 1 && t.treeChild && nodes[tChild[e.from]] && nodes[tChild[e.from]].treeChild === t.treeChild) edge(e.from, e.to, e.pct, 'tree2');
        else deferredNotes.push([e.to, e.s]);
      });
    }

    // ── Subsidiaries below: collect, then hang each from its largest owner on the chart
    var order = [];
    if (showDown) {
      var disc = {}; disc[cid] = null;
      var qd = [cid];
      while (qd.length) {
        var id2 = qd.shift(), k2 = 'co:' + id2;
        if (id2 !== cid && coll[k2]) { nodes[k2].collapsedDown = true; continue; }
        (ctx.subsOf[id2] || []).forEach(function (x) {
          var sc = x.co; if (subF && !subF.has(sc.id)) return;
          var key = 'co:' + sc.id;
          if (nodes[key]) return; // already on the chart (as owner above or subsidiary)
          coNode(sc.id, 'down', null); disc[sc.id] = id2; order.push(sc.id); qd.push(sc.id);
        });
      }
      function chainOwner(s) { if (s.type !== 'company') return null; var n2 = nodes['co:' + s.person]; return (n2 && (n2.role === 'down' || n2.role === 'focal')) ? n2 : null; }
      var parent = {};
      function reaches(fromId, targetId) { var guard = 0; while (fromId && guard++ < 500) { if (fromId === targetId) return true; fromId = parent[fromId]; } return false; }
      order.forEach(function (sid) {
        var best = null;
        (byId[sid].shareholders || []).forEach(function (s) { var o = chainOwner(s); if (o && (best == null || (+s.pct || 0) > (+best.pct || 0))) best = s; });
        var p = best ? best.person : disc[sid];
        if (p !== cid && reaches(p, sid)) p = disc[sid];
        parent[sid] = p === cid ? null : p;
        nodes['co:' + sid].treeParent = 'co:' + p;
      });
      function depthOf(sid, guard) { guard = guard || 0; var p = parent[sid]; return (p == null || guard > 400) ? 1 : depthOf(p, guard + 1) + 1; }
      order.forEach(function (sid) { nodes['co:' + sid].depth = depthOf(sid); });
      order.forEach(function (sid) {
        var k3 = 'co:' + sid, tp = nodes[k3].treeParent;
        (byId[sid].shareholders || []).forEach(function (s) {
          if (!s.person || (s.type === 'company' && !byId[s.person])) return;
          if (ownerKey(s) === tp) edge(tp, k3, s.pct, 'tree'); else deferredNotes.push([k3, s]);
        });
      });
    }
    // Many small shareholders with no owners of their own → one "Shareholders (n)" card
    // with one line; every holder stays listed with its %.
    var grouped = {};
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (!n || n.role === 'down') return;
      var leafOwners = edges.filter(function (e) {
        if (e.to !== k || e.kind !== 'tree') return false;
        var o = nodes[e.from];
        return o.role === 'up' && !o.coId;   // individuals only (companies keep their own card)
      }).filter(function (e) { return !edges.some(function (x) { return x.from === e.from && x.to !== k; }); });
      if (leafOwners.length < C.GROUP_MIN) return;
      var gk = 'grp:' + k;
      var members = leafOwners.map(function (e) { var o = nodes[e.from]; return { key: o.key, name: o.name, pct: e.pct, etype: o.etype }; })
        .sort(function (a, b) { return (b.pct || 0) - (a.pct || 0) || byName(a.name, b.name); });
      leafOwners.forEach(function (e) { grouped[e.from] = gk; delete nodes[e.from]; });
      edges = edges.filter(function (e) { return !grouped[e.from]; });
      var allInd = members.every(function (m) { return m.etype === 'individual'; });
      add(gk, { kind: 'group', role: 'up', depth: n.depth - 1, refId: k, coId: null, name: L('shareholders') + ' (' + members.length + ')',
        jur: '', etype: allInd ? 'individual' : 'company', group: true, members: members, treeChild: k });
      edge(gk, k, null, 'tree');
    });
    seenE = {}; edges.forEach(function (e) { seenE[e.from + '|' + e.to] = 1; });

    // cross-holdings: an entity above that is also owned by the selected company / a subsidiary
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (n.role !== 'up' || !n.coId) return;
      (byId[n.refId].shareholders || []).forEach(function (s) {
        var o = s.type === 'company' && nodes['co:' + s.person];
        if (o && (o.role === 'down' || o.role === 'focal') && !seenE[o.key + '|' + k]) deferredNotes.push([k, s, true]);
      });
    });
    var seenNote = {};
    deferredNotes.forEach(function (d) {
      var nk = d[0] + '<' + ownerKey(d[1]); if (seenNote[nk]) return; seenNote[nk] = 1;
      note(d[0], d[1], { circular: !!d[2] });
    });
    Object.keys(nodes).forEach(function (k) {
      nodes[k].also.forEach(function (a) { a.onChart = !!nodes[a.key] || !!grouped[a.key]; });
      nodes[k].also.sort(function (a, b) { return (b.pct || 0) - (a.pct || 0) || byName(a.name, b.name); });
    });

    // ── Investments: listed inside the holder's card
    if (showInv) {
      var holders = Object.keys(nodes).filter(function (k) { var n = nodes[k]; return n.coId && (n.role === 'down' || n.role === 'focal') && !n.collapsedDown; });
      var holdersOf = {};
      holders.forEach(function (hk) { companyInvestments(nodes[hk].refId).forEach(function (inv) { if (invF && !invF.has(inv.id)) return; (holdersOf[inv.id] = holdersOf[inv.id] || []).push(hk); }); });
      holders.forEach(function (hk) {
        companyInvestments(nodes[hk].refId).forEach(function (inv) {
          if (invF && !invF.has(inv.id)) return;
          var others = holdersOf[inv.id].filter(function (x) { return x !== hk; }).map(function (x) { return nodes[x].name; });
          nodes[hk].invs.push({ id: inv.id, name: inv.name, shared: others });
        });
        nodes[hk].invs.sort(function (a, b) { return byName(a.name, b.name); });
      });
    }

    // ── Collapse affordances
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (!n.coId || k === fk) return;
      if (n.role === 'down') { var cnt = countBelow(ctx, n.refId, subF); n.canCollapse = cnt > 0; if (n.collapsedDown) n.hiddenCount = cnt; }
      else if (n.role === 'up') { var c2 = countAbove(ctx, n.refId); n.canCollapse = c2 > 0; if (n.collapsedUp) n.hiddenCount = c2; }
    });
    return { nodes: nodes, edges: edges, focalKey: fk, rootId: cid };
  }
  function countBelow(ctx, id, subF) {
    var seen = {}, q = [id], n = 0; seen[id] = 1;
    while (q.length) { (ctx.subsOf[q.shift()] || []).forEach(function (r) { if (seen[r.co.id] || (subF && !subF.has(r.co.id))) return; seen[r.co.id] = 1; n++; q.push(r.co.id); }); }
    return n;
  }
  function countAbove(ctx, id) {
    var seen = {}, q = [id], n = 0; seen[id] = 1;
    while (q.length) {
      var c = ctx.byId[q.shift()]; if (!c) continue;
      (c.shareholders || []).forEach(function (s) { var k = s.type === 'company' ? s.person : 'i:' + s.person; if (seen[k]) return; seen[k] = 1; n++; if (s.type === 'company' && ctx.byId[s.person]) q.push(s.person); });
    }
    return n;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. SIZES
  // ════════════════════════════════════════════════════════════════════════
  function invShown(g, n, print) {
    if (print || (INVX[g.rootId] && INVX[g.rootId][n.key])) return n.invs.length;
    return Math.min(n.invs.length, C.INV_MAX_SCREEN);
  }
  function cardH(g, n, print) {
    if (n.group) return 34 + n.members.length * C.ROW_H + C.SEC_PAD;
    if (n.etype === 'individual' && !n.also.length) return C.IND_H;
    var h = C.HEAD_H;
    if (n.status === 'liquidation' || n.status === 'liquidated') h += C.STATUS_H;
    if (n.also.length) h += C.SEC_HEAD + n.also.length * C.ROW_H + C.SEC_PAD;
    if (n.invs.length) {
      var sh = invShown(g, n, print), extra = n.invs.length > C.INV_MAX_SCREEN && !print ? 1 : 0;
      h += C.SEC_HEAD + sh * C.ROW_H + extra * C.ROW_H + C.SEC_PAD;
    }
    if (n.canCollapse) h += 6;
    return h;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. LAYOUT  (tidy tree up + down, compact columns, level rows)
  // ════════════════════════════════════════════════════════════════════════
  function layout(g, print) {
    var nodes = g.nodes, fk = g.focalKey, keys = Object.keys(nodes);
    var inc = {}; g.edges.forEach(function (e) { inc[e.to] = (inc[e.to] || 0) + 1; });
    var V = {};
    keys.forEach(function (k) {
      var n = nodes[k];
      var base = n.etype === 'individual' && !n.also.length && !n.group ? C.IND_W : C.W;
      V[k] = { key: k, real: n, rank: n.depth, w: Math.max(base, (inc[k] || 0) > 1 ? inc[k] * C.PORT_SP + 20 : 0), h: cardH(g, n, print) };
    });
    // tree children
    var dch = {}, uch = {};
    g.edges.forEach(function (e) {
      if (e.kind !== 'tree') return;
      if (nodes[e.to].role === 'down') (dch[e.from] = dch[e.from] || []).push(e.to);
      else (uch[e.to] = uch[e.to] || []).push(e.from);
    });
    function ordKids(list) {
      return (list || []).slice().sort(function (a, b) {
        var na = nodes[a], nb = nodes[b];
        return byName(na.name, nb.name);
      });
    }
    // ---- compact tree placement (Reingold–Tilford contours per level) ----------
    // Each subtree is laid out relative to its root; siblings are pushed together
    // until they would touch on any level, so narrow branches tuck in close.
    var off = {}, spines = [], spineOf = {};
    function mergeC(acc, c, dx) { Object.keys(c).forEach(function (d) { var l = c[d][0] + dx, r = c[d][1] + dx; if (!acc[d]) acc[d] = [l, r]; else { acc[d][0] = Math.min(acc[d][0], l); acc[d][1] = Math.max(acc[d][1], r); } }); }
    function packGroups(groups) { // groups: [{cont, anchor}] → offsets centred on first/last anchor
      var acc = {}, offs = [];
      groups.forEach(function (gr, i) {
        var o = 0;
        if (i) {
          o = -1e9;
          Object.keys(gr.cont).forEach(function (d) { if (acc[d]) o = Math.max(o, acc[d][1] - gr.cont[d][0] + (gr.gap || C.GAP)); });
          if (o === -1e9) o = acc.__r != null ? acc.__r : 0;
        }
        offs.push(o); mergeC(acc, gr.cont, o);
      });
      if (!groups.length) return offs;
      var mid = (offs[0] + offs[offs.length - 1]) / 2;
      return offs.map(function (o) { return o - mid; });
    }
    function layDown(k) {
      var d0 = V[k].rank, kids = ordKids(dch[k]);
      var nonLeaf = kids.filter(function (c) { return (dch[c] || []).length; });
      var leaves = kids.filter(function (c) { return !(dch[c] || []).length; });
      var groups = [];
      nonLeaf.forEach(function (c) { groups.push({ key: c, cont: layDown(c), gap: C.SUBTREE_GAP }); });
      if (leaves.length >= C.SPINE_MIN) {
        var nb = Math.max(1, Math.round(Math.sqrt(leaves.length / 4)));
        var per = Math.ceil(leaves.length / nb);
        for (var i = 0; i < leaves.length; i += per) {
          var items = leaves.slice(i, i + per);
          var colW = items.reduce(function (m, c) { return Math.max(m, V[c].w); }, 0);
          var cont = {}; cont[d0 + 1] = [-(colW + C.SPINE_SG), colW + C.SPINE_SG];
          var sp = { parent: k, items: items, colW: colW, rank: d0 + 1, key: '§' + spines.length };
          spines.push(sp); groups.push({ spine: sp, cont: cont, gap: C.SUBTREE_GAP });
        }
      } else leaves.forEach(function (c) { var cont = {}; cont[d0 + 1] = [-V[c].w / 2, V[c].w / 2]; groups.push({ key: c, cont: cont }); });
      var sp2 = groups.filter(function (x) { return x.spine; }), nd = groups.filter(function (x) { return !x.spine; });
      var half = Math.ceil(nd.length / 2);
      groups = nd.slice(0, half).concat(sp2).concat(nd.slice(half));
      var offs = packGroups(groups), res = {};
      res[d0] = [-V[k].w / 2, V[k].w / 2];
      groups.forEach(function (gr, i) { mergeC(res, gr.cont, offs[i]); if (gr.spine) gr.spine.off = offs[i]; else off[gr.key] = offs[i]; });
      V[k].kidsDown = groups;
      return res;
    }
    function applyDown(k) {
      (V[k].kidsDown || []).forEach(function (gr) {
        if (gr.spine) {
          var sp = gr.spine; sp.x = V[k].x + sp.off;
          sp.items.forEach(function (c, i) {
            var left2 = i % 2 === 0;
            V[c].x = left2 ? sp.x - C.SPINE_SG - V[c].w / 2 : sp.x + C.SPINE_SG + V[c].w / 2;
            V[c].spine = sp; V[c].spineRow = Math.floor(i / 2); V[c].side = left2 ? -1 : 1;
          });
        } else { V[gr.key].x = V[k].x + off[gr.key]; applyDown(gr.key); }
      });
    }
    function upKids(k) {
      var kids = (uch[k] || []).slice().sort(function (a, b) {
        var ea = g.edges.find(function (e) { return e.from === a && e.to === k; }), eb = g.edges.find(function (e) { return e.from === b && e.to === k; });
        return ((eb && eb.pct) || 0) - ((ea && ea.pct) || 0) || byName(nodes[a].name, nodes[b].name);
      });
      var arranged = []; kids.forEach(function (c, i) { if (i % 2 === 0) arranged.push(c); else arranged.unshift(c); });
      return arranged;
    }
    function layUp(k) {
      var d0 = V[k].rank, kids = upKids(k);
      var groups = kids.map(function (c) { return { key: c, cont: layUp(c) }; });
      var offs = packGroups(groups), res = {};
      res[d0] = [-V[k].w / 2, V[k].w / 2];
      groups.forEach(function (gr, i) { mergeC(res, gr.cont, offs[i]); off[gr.key] = offs[i]; });
      V[k].kidsUp = kids;
      return res;
    }
    function applyUp(k) { (V[k].kidsUp || []).forEach(function (c) { V[c].x = V[k].x + off[c]; applyUp(c); }); }
    V[fk].x = 0;
    layDown(fk); applyDown(fk);
    layUp(fk); applyUp(fk);

    // ---- segments (drawn lines between adjacent levels) ----
    var segs = [];
    g.edges.forEach(function (e) {
      var a = V[e.from], b = V[e.to];
      if (b.spine && e.kind === 'tree' && b.spine.parent === e.from) { e.viaSpine = true; return; }
      if (b.rank !== a.rank + 1) { e.skip = true; return; }
      segs.push({ a: e.from, b: e.to, e: e });
    });
    spines.forEach(function (sp) {
      V[sp.key] = { key: sp.key, dummy: true, spineHead: true, rank: sp.rank, x: sp.x, w: 2, h: 0 };
      var hk = '|' + sp.parent + '|' + sp.items.join('|') + '|';
      segs.push({ a: sp.parent, b: sp.key, e: { from: sp.parent, to: sp.key, pct: null, hk: hk } });
    });
    var ranks = {}, minR = 1e9, maxR = -1e9;
    Object.keys(V).forEach(function (k) { var r = V[k].rank; (ranks[r] = ranks[r] || []).push(k); minR = Math.min(minR, r); maxR = Math.max(maxR, r); });
    var down = {}, up = {};
    segs.forEach(function (s) { (down[s.a] = down[s.a] || []).push(s); (up[s.b] = up[s.b] || []).push(s); });

    // ---- ports on the top edge of each owned card ----
    segs.forEach(function (s) { s.sx = V[s.a].x; });
    Object.keys(V).forEach(function (k) {
      var list = up[k] || []; if (!list.length) return;
      var v = V[k];
      if (v.dummy || list.length === 1) { list.forEach(function (s) { s.px = v.x; }); return; }
      list.sort(function (s1, s2) { return V[s1.a].x - V[s2.a].x || (s1.a < s2.a ? -1 : 1); });
      var spc = Math.min(C.PORT_SP, (v.w - 24) / (list.length - 1));
      list.forEach(function (s, i) { s.px = v.x + (i - (list.length - 1) / 2) * spc; });
    });
    segs.forEach(function (s) {
      if ((down[s.a] || []).length !== 1 || Math.abs(s.px - s.sx) >= 8) return;
      var sibs = up[s.b] || [], tv = V[s.b];
      if (tv.dummy || s.sx < tv.x - tv.w / 2 + 12 || s.sx > tv.x + tv.w / 2 - 12) return;
      if (sibs.some(function (o) { return o !== s && Math.abs(o.px - s.sx) < 40; })) return;
      s.px = s.sx;
    });

    // ---- lanes: one per owner per gap, ordered to avoid crossings ----
    var gaps = {};
    for (var r3 = minR; r3 < maxR; r3++) {
      var groups = {};
      (ranks[r3] || []).forEach(function (k) { (down[k] || []).forEach(function (s) { (groups[k] = groups[k] || { src: k, sx: V[k].x, segs: [] }).segs.push(s); }); });
      var G = Object.keys(groups).map(function (k) {
        var g1 = groups[k], xs = g1.segs.map(function (s) { return s.px; }).concat([g1.sx]);
        g1.l = Math.min.apply(null, xs); g1.r = Math.max.apply(null, xs); g1.straight = (g1.r - g1.l) < 0.5; return g1;
      });
      var need = G.filter(function (g1) { return !g1.straight; });
      var before = {};
      G.forEach(function (h) { G.forEach(function (g1) { if (g1 === h) return; g1.segs.forEach(function (s) { if (Math.abs(s.px - h.sx) < 3) (before[g1.src] = before[g1.src] || []).push(h.src); }); }); });
      var inside = function (x, g1) { return x > g1.l + 0.5 && x < g1.r - 0.5; };
      var mustAbove = function (a, b) { return (before[b.src] || []).indexOf(a.src) !== -1; };
      var cost = function (a, b) { var c = 0; a.segs.forEach(function (s) { if (inside(s.px, b)) c++; }); if (inside(b.sx, a)) c++; if (mustAbove(b, a)) c += 1000; return c; };
      need.sort(function (a, b) { return (b.r - b.l) - (a.r - a.l) || a.l - b.l; });
      var ordered = [];
      need.forEach(function (g1) {
        var bestI = 0, bestC = Infinity;
        for (var i = 0; i <= ordered.length; i++) { var c = 0; for (var j = 0; j < ordered.length; j++) c += j < i ? cost(ordered[j], g1) : cost(g1, ordered[j]); if (c < bestC) { bestC = c; bestI = i; } }
        ordered.splice(bestI, 0, g1);
      });
      var lanesN = 0;
      ordered.forEach(function (g1, i) {
        var lane = 0;
        for (var j = 0; j < i; j++) { var o = ordered[j]; if (!(g1.r + 10 < o.l || g1.l - 10 > o.r) || mustAbove(o, g1)) lane = Math.max(lane, o.lane + 1); }
        g1.lane = lane; lanesN = Math.max(lanesN, lane + 1);
      });
      G.forEach(function (g1) { if (g1.straight) g1.lane = null; });
      var hasPill = G.some(function (g1) { return g1.segs.some(function (s) { return !V[s.b].dummy && s.e.pct != null; }); });
      gaps[r3] = { groups: G, lanes: lanesN, hasPill: hasPill };
    }

    // ---- rows (levels) ----
    spines.forEach(function (sp) {
      var y = 0; sp.rows = [];
      for (var i = 0; i < sp.items.length; i += 2) {
        var a = sp.items[i], b = sp.items[i + 1];
        var h = Math.max(V[a].h, b ? V[b].h : 0);
        sp.rows.push({ off: y, h: h, items: b ? [a, b] : [a] }); y += h + C.SPINE_ROW_GAP;
      }
      sp.h = y - C.SPINE_ROW_GAP;
    });
    var rowTop = {}, rowH = {}, y = C.MARGIN + 6, rows = [];
    for (var r4 = minR; r4 <= maxR; r4++) {
      var hh = 0;
      (ranks[r4] || []).forEach(function (k) { var v = V[k]; if (!v.dummy && !v.spine) hh = Math.max(hh, v.h); });
      spines.forEach(function (sp) { if (sp.rank === r4) hh = Math.max(hh, sp.h); });
      rowTop[r4] = y; rowH[r4] = hh;
      rows.push({ rank: r4, top: y, bottom: y + hh });
      if (r4 < maxR) {
        var gp = gaps[r4];
        var gh = C.GAP_TOP + gp.lanes * C.TRACK_SP + C.GAP_MID + (gp.hasPill ? C.PILL_ZONE : C.GAP_NOPILL);
        gp.y0 = y + hh; gp.trackY0 = gp.y0 + C.GAP_TOP;
        y += hh + Math.max(gh, C.MIN_GAP);
      } else y += hh;
    }
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      v.top = rowTop[v.rank];
      if (v.spine) { var row = v.spine.rows[v.spineRow]; v.top += row.off; }
      v.bottom = v.top + v.h;
    });
    spines.forEach(function (sp) {
      sp.top = rowTop[sp.rank];
      sp.stubs = sp.items.map(function (c) { var v = V[c]; return { key: c, y: v.top + C.STUB_Y, x1: sp.x, x2: v.side < 0 ? v.x + v.w / 2 : v.x - v.w / 2, side: v.side }; });
      sp.bottomY = sp.stubs.reduce(function (m, s) { return Math.max(m, s.y); }, sp.top);
    });

    // ---- horizontal extent, label column ----
    var minX = Infinity, maxX = -Infinity;
    Object.keys(V).forEach(function (k) { var v = V[k]; minX = Math.min(minX, v.x - v.w / 2); maxX = Math.max(maxX, v.x + v.w / 2); });
    var shift = C.MARGIN + C.LABEL_COL - minX;
    Object.keys(V).forEach(function (k) { V[k].x += shift; });
    segs.forEach(function (s) { s.px += shift; s.sx += shift; });
    Object.keys(gaps).forEach(function (r) { gaps[r].groups.forEach(function (g1) { g1.sx += shift; g1.l += shift; g1.r += shift; }); });
    spines.forEach(function (sp) { sp.x += shift; sp.stubs.forEach(function (s) { s.x1 += shift; s.x2 += shift; }); });
    return { V: V, segs: segs, gaps: gaps, spines: spines, rows: rows, width: Math.ceil(maxX - minX + 2 * C.MARGIN + C.LABEL_COL), height: Math.ceil(y + C.MARGIN), minR: minR, maxR: maxR };
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. RENDER
  // ════════════════════════════════════════════════════════════════════════
  function keyList(s) { return s.e.hk || ('|' + s.e.from + '|' + s.e.to + '|'); }
  function renderSVG(g, Lo) {
    var V = Lo.V, halos = [], parts = [], pills = [], dots = [], bands = [];
    Lo.rows.forEach(function (row, i) {
      if (row.bottom <= row.top) return;
      bands.push('<rect class="org2-band' + (row.rank === 0 ? ' org2-band-sel' : '') + '" x="' + C.MARGIN / 2 + '" y="' + r1(row.top - C.BAND_PAD) + '" width="' + r1(Lo.width - C.MARGIN) + '" height="' + r1(row.bottom - row.top + 2 * C.BAND_PAD) + '" rx="10"/>');
    });
    function line(d, keys, arrow, cls) {
      halos.push('<path class="org2-halo" d="' + d + '"/>');
      parts.push('<path class="org2-e' + (cls ? ' ' + cls : '') + '" data-k="' + E(keys) + '" d="' + d + '"' + (arrow ? ' marker-end="url(#org2-arrow)"' : '') + '/>');
    }
    function pill(t, cx, cy, keys) {
      var pw = t.length * 6.4 + 14, ph = 17;
      pills.push('<g class="org2-pill" data-k="' + E(keys) + '"><rect x="' + r1(cx - pw / 2) + '" y="' + r1(cy - ph / 2) + '" width="' + r1(pw) + '" height="' + ph + '" rx="8.5"/><text x="' + r1(cx) + '" y="' + r1(cy + 4) + '" text-anchor="middle">' + E(t) + '</text></g>');
    }
    function addPill(s, tgt) { if (tgt.dummy) return; var t = fmtPct(s.e.pct); if (t == null) return; pill(t, s.px, tgt.top - C.PILL_ZONE / 2 - 3, keyList(s)); }
    Object.keys(Lo.gaps).forEach(function (r) {
      var gp = Lo.gaps[r];
      gp.groups.forEach(function (grp) {
        var src = V[grp.src], y1 = src.bottom;
        var ty = grp.lane == null ? null : gp.trackY0 + grp.lane * C.TRACK_SP;
        var allKeys = '|' + grp.segs.map(function (s) { return keyList(s).replace(/^\||\|$/g, ''); }).join('|') + '|';
        if (ty == null) {
          grp.segs.forEach(function (s) { var tgt = V[s.b]; line('M' + r1(s.px) + ' ' + r1(y1) + 'V' + r1(tgt.dummy ? tgt.top : tgt.top - 1), keyList(s), !tgt.dummy); addPill(s, tgt); });
          return;
        }
        line('M' + r1(grp.sx) + ' ' + r1(y1) + 'V' + r1(ty) + (grp.l < grp.sx - 0.5 ? 'M' + r1(grp.sx) + ' ' + r1(ty) + 'H' + r1(grp.l) : '') + (grp.r > grp.sx + 0.5 ? 'M' + r1(grp.sx) + ' ' + r1(ty) + 'H' + r1(grp.r) : ''), allKeys, false);
        grp.segs.forEach(function (s) {
          var tgt = V[s.b];
          line('M' + r1(s.px) + ' ' + r1(ty) + 'V' + r1(tgt.dummy ? tgt.top : tgt.top - 1), keyList(s), !tgt.dummy);
          if (s.px > grp.l + 0.5 && s.px < grp.r - 0.5) dots.push('<circle class="org2-dot" data-k="' + E(keyList(s)) + '" cx="' + r1(s.px) + '" cy="' + r1(ty) + '" r="2.6"/>');
          addPill(s, tgt);
        });
        if (grp.sx > grp.l + 0.5 && grp.sx < grp.r - 0.5) dots.push('<circle class="org2-dot" data-k="' + E(allKeys) + '" cx="' + r1(grp.sx) + '" cy="' + r1(ty) + '" r="2.6"/>');
      });
    });
    // compact columns: one vertical line with short side branches
    Lo.spines.forEach(function (sp) {
      var hk = '|' + sp.parent + '|' + sp.items.join('|') + '|';
      line('M' + r1(sp.x) + ' ' + r1(sp.top) + 'V' + r1(sp.bottomY), hk, false);
      sp.stubs.forEach(function (st) {
        var keys = '|' + sp.parent + '|' + st.key + '|';
        line('M' + r1(st.x1) + ' ' + r1(st.y) + 'H' + r1(st.x2 - st.side * 1), keys, true);
        if (st.y < sp.bottomY - 0.5) dots.push('<circle class="org2-dot" data-k="' + E(keys) + '" cx="' + r1(st.x1) + '" cy="' + r1(st.y) + '" r="2.6"/>');
        var e = g.edges.find(function (x) { return x.from === sp.parent && x.to === st.key; });
        var t = e && fmtPct(e.pct);
        if (t) pill(t, (st.x1 + st.x2) / 2 - st.side * 3, st.y, keys);
      });
    });
    return '<svg class="org-static-edges org2-svg" width="' + Lo.width + '" height="' + Lo.height + '" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">'
      + '<defs><marker id="org2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="org2-arrowhead"/></marker></defs>'
      + '<g>' + bands.join('') + '</g><g>' + halos.join('') + '</g><g>' + parts.join('') + '</g><g>' + dots.join('') + '</g><g>' + pills.join('') + '</g></svg>';
  }

  function rowLabels(Lo) {
    return Lo.rows.map(function (row) {
      if (row.bottom <= row.top) return '';
      var t = row.rank === 0 ? L('lvlSel') : (row.rank < 0 ? L('lvlUp') : L('lvlDown')).replace('{n}', Math.abs(row.rank));
      return '<div class="org2-lvl' + (row.rank === 0 ? ' sel' : '') + '" style="top:' + r1(row.top) + 'px;left:' + (C.MARGIN + 2) + 'px;width:' + (C.LABEL_COL - 18) + 'px">' + E(t) + '</div>';
    }).join('');
  }

  function cardHTML(g, n, v, print) {
    if (n.group) {
      var gc = TYPE_COL[n.etype] || TYPE_COL.company;
      var gh = '<div class="org-card org-card-abs org2-card org2-group org2-t-' + n.etype + '" data-node-key="' + E(n.key) + '" data-refs="|' + E(n.members.map(function (m) { return m.key; }).join('|')) + '|" style="left:' + r1(v.x - v.w / 2) + 'px;top:' + r1(v.top) + 'px;width:' + r1(v.w) + 'px;height:' + r1(v.h) + 'px;margin:0;border-color:' + gc.c + ';">';
      gh += '<div class="org2-head" style="background:' + gc.bg + ';min-height:0;padding:6px 11px"><div class="org-card-label" style="color:' + gc.c + ';margin:0">' + E(n.name) + '</div></div><div class="org2-sec org-card-sub" style="border-top:none">';
      n.members.forEach(function (m) {
        var mc = TYPE_COL[m.etype] || TYPE_COL.company;
        gh += '<div class="org2-row on" data-ref="' + E(m.key) + '" title="' + E(m.name + (fmtPct(m.pct) ? ' — ' + fmtPct(m.pct) : '')) + '"><i style="background:' + mc.c + '"></i><span class="nm">' + E(m.name) + '</span>' + (fmtPct(m.pct) ? '<b>' + E(fmtPct(m.pct)) + '</b>' : '') + '</div>';
      });
      return gh + '</div></div>';
    }
    var col = TYPE_COL[n.etype] || TYPE_COL.company, cur = n.key === g.focalKey;
    var cls = 'org-card org-card-abs org2-card org2-t-' + n.etype + (n.coId && !cur ? ' clickable' : '') + (cur ? ' current' : '');
    var click = (n.coId && !cur) ? ' onclick="openCompany(' + JQ(n.coId) + ')"' : '';
    var style = 'left:' + r1(v.x - v.w / 2) + 'px;top:' + r1(v.top) + 'px;width:' + r1(v.w) + 'px;height:' + r1(v.h) + 'px;margin:0;border-color:' + col.c + ';';
    var refs = n.also.filter(function (a) { return a.onChart; }).map(function (a) { return a.key; });
    var h = '<div class="' + cls + '" data-node-key="' + E(n.key) + '" data-refs="' + E('|' + refs.join('|') + '|') + '" style="' + style + '"' + click + ' title="' + E(n.name + (n.jur ? ' — ' + n.jur : '')) + '">';
    if (cur) h += '<div class="org2-selected-tag">' + E(L('selected')) + '</div>';
    h += '<div class="org2-head" style="background:' + col.bg + '">';
    h += '<div class="org-card-label" style="color:' + col.c + '">' + E(L(n.etype) + (n.jur ? ' · ' + n.jur : '')) + '</div>';
    h += '<div class="org-card-name" style="color:' + col.c + '">' + E(n.name) + '</div>';
    if (n.status === 'liquidation') h += '<div class="org2-status">' + E(L('inLiq')) + '</div>';
    if (n.status === 'liquidated') h += '<div class="org2-status">' + E(L('liquidated')) + '</div>';
    h += '</div>';
    if (n.also.length) {
      var hasLine = g.edges.some(function (e) { return e.to === n.key; });
      h += '<div class="org2-sec org-card-sub"><div class="org2-sec-h">' + E(L(hasLine ? 'alsoOwned' : 'ownedBy')) + '</div>';
      n.also.forEach(function (a) {
        var ac = TYPE_COL[a.etype] || TYPE_COL.company;
        h += '<div class="org2-row' + (a.onChart ? ' on' : '') + '"' + (a.onChart ? ' data-ref="' + E(a.key) + '"' : '') + ' title="' + E(a.name + (fmtPct(a.pct) ? ' — ' + fmtPct(a.pct) : '') + (a.circular ? ' (' + L('circular') + ')' : '')) + '">'
          + '<i style="background:' + ac.c + '"></i><span class="nm">' + E(a.name) + (a.onChart ? ' ↗' : '') + (a.circular ? ' ↻' : '') + '</span>'
          + (fmtPct(a.pct) ? '<b>' + E(fmtPct(a.pct)) + '</b>' : '') + '</div>';
      });
      h += '</div>';
    }
    if (n.invs.length) {
      var sh = invShown(g, n, print);
      h += '<div class="org2-sec org2-inv org-card-sub"><div class="org2-sec-h">' + E(L('investments')) + ' (' + n.invs.length + ')</div>';
      for (var i = 0; i < sh; i++) {
        var iv = n.invs[i];
        h += '<div class="org2-row" title="' + E(iv.name + (iv.shared.length ? ' — ' + L('sharedWith') + ' ' + iv.shared.join(', ') : '')) + '"><i></i><span class="nm">' + E(iv.name) + (iv.shared.length ? ' ⇄' : '') + '</span></div>';
      }
      if (!print && n.invs.length > C.INV_MAX_SCREEN) {
        var open = INVX[g.rootId] && INVX[g.rootId][n.key];
        h += '<button type="button" class="org2-more" onclick="event.stopPropagation();orgToggleInv(' + JQ(g.rootId) + ',' + JQ(n.key) + ',this)">' + (open ? E(L('showLess')) : '+' + (n.invs.length - sh) + ' ' + E(L('more'))) + '</button>';
      }
      h += '</div>';
    }
    if (!print && n.canCollapse) {
      var isUp = n.role === 'up', closed = isUp ? n.collapsedUp : n.collapsedDown;
      var txt = closed ? ('+' + n.hiddenCount + ' ' + (isUp ? '▲' : '▼')) : (isUp ? '▲' : '▼');
      var tip = closed ? (isUp ? L('showOwners') : L('showHoldings')) : L('hide');
      h += '<button type="button" class="org2-tg ' + (isUp ? 'org2-tg-up' : 'org2-tg-down') + (closed ? ' closed' : '') + '" title="' + E(tip) + '" onclick="event.stopPropagation();orgToggleCollapse(' + JQ(g.rootId) + ',' + JQ(n.key) + ',this)">' + E(txt) + '</button>';
    }
    return h + '</div>';
  }

  function legendHTML(g) {
    var present = {}, hasAlso = false, hasInv = false;
    Object.keys(g.nodes).forEach(function (k) { var n = g.nodes[k]; present[n.etype] = true; if (n.also.length) hasAlso = true; if (n.invs.length) hasInv = true; });
    var h = '<div class="org-legend org2-legend">';
    ['individual', 'trust', 'holding', 'company'].forEach(function (t) {
      if (!present[t]) return; var col = TYPE_COL[t];
      h += '<span class="org2-lg"><i style="background:' + col.bg + ';border-color:' + col.c + '"></i>' + E(L(t)) + '</span>';
    });
    h += '<span class="org2-lg"><i class="org2-lg-sel"></i>' + E(L('selected')) + '</span>';
    var notes = [L('lgLine')];
    if (hasAlso) notes.push(L('lgAlso'));
    if (hasInv) notes.push(L('lgInv'));
    h += '<span class="org2-lg org2-lg-line">' + notes.map(E).join('<br>') + '</span>';
    return h + '</div>';
  }

  function renderGraph(g, print) {
    var Lo = layout(g, print);
    var cards = [];
    Object.keys(g.nodes).forEach(function (k) { cards.push(cardHTML(g, g.nodes[k], Lo.V[k], print)); });
    var big = Object.keys(g.nodes).length > C.AUTO_MAX_CARDS || g.hiddenTotal ? 1 : 0;
    var tree = '<div class="org-chart-tree org2-tree" data-root="' + E(g.rootId) + '" data-big="' + big + '" data-hidden="' + (g.hiddenTotal || 0) + '" data-w="' + Lo.width + '" data-h="' + Lo.height + '" style="position:relative;width:' + Lo.width + 'px;height:' + Lo.height + 'px;margin:0 auto">'
      + renderSVG(g, Lo) + rowLabels(Lo) + cards.join('') + '</div>';
    var h = '<div class="org-chart-scroll org2-scroll" data-static-edges="1"><div style="font-family:system-ui,sans-serif">' + legendHTML(g) + tree + '</div></div>';
    return { html: h, layout: Lo };
  }

  // ── Auto-grouping for very large charts: collapse deepest levels first ──────
  function effectiveCollapsed(cid, opts, print) {
    if (print) return {};
    var s = COLL[cid];
    if (s) return s.set;
    var set = {};
    var g = buildGraph(cid, Object.assign({}, opts, { collapsed: set }));
    if (!g) return set;
    var count = Object.keys(g.nodes).length;
    if (count > C.AUTO_MAX_CARDS) {
      var byDepth = {};
      Object.keys(g.nodes).forEach(function (k) { var n = g.nodes[k]; if (n.role === 'down' && n.canCollapse) (byDepth[n.depth] = byDepth[n.depth] || []).push(k); });
      var ds = Object.keys(byDepth).map(Number).filter(function (d) { return d >= 1; }).sort(function (a, b) { return b - a; });
      for (var i = 0; i < ds.length && count > C.AUTO_MAX_CARDS; i++) {
        byDepth[ds[i]].forEach(function (k) { set[k] = true; });
        g = buildGraph(cid, Object.assign({}, opts, { collapsed: set }));
        count = Object.keys(g.nodes).length;
      }
    }
    COLL[cid] = { set: set, auto: true };
    return set;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PUBLIC API (same names the site already uses)
  // ════════════════════════════════════════════════════════════════════════
  function optsFrom(settings) {
    settings = settings || {};
    return { shareholders: settings.shareholders !== false, subsidiaries: settings.subsidiaries !== false, investments: settings.investments !== false,
      invIds: settings.invIds || null, shIds: settings.shIds || null, subIds: settings.subIds || null };
  }
  function build(cid, settings, extra) {
    var print = !!(extra && extra.print);
    var o = optsFrom(settings);
    o.collapsed = effectiveCollapsed(cid, o, print);
    var g = buildGraph(cid, o);
    if (!g) return '';
    if (!print && Object.keys(o.collapsed).length) {
      var full = buildGraph(cid, Object.assign({}, o, { collapsed: {} }));
      g.hiddenTotal = Math.max(0, Object.keys(full.nodes).length - Object.keys(g.nodes).length);
    }
    return renderGraph(g, print).html;
  }
  window.orgBuildGraph = function (cid, opts) { return buildGraph(cid, opts || {}); };
  window.orgRenderGraphHTML = function (nodes, edges, focalKey) {
    var root = (nodes[focalKey] && nodes[focalKey].refId) || '';
    return renderGraph({ nodes: nodes, edges: edges, focalKey: focalKey, rootId: root }, false).html;
  };
  window.buildFullOrgChart = function (cid) { return build(cid, {}, { print: true }); };
  window.buildFilteredOrgChart = function (cid, settings, extra) { return build(cid, settings, extra); };
  window.orgLayoutForTest = function (cid, settings, print) {
    var o = optsFrom(settings); o.collapsed = print ? {} : effectiveCollapsed(cid, o, false);
    var g = buildGraph(cid, o); return g ? { g: g, L: layout(g, !!print) } : null;
  };

  window.orgToggleCollapse = function (cid, key, btn) {
    var s = COLL[cid] || (COLL[cid] = { set: {}, auto: false });
    if (s.set[key]) delete s.set[key]; else s.set[key] = true;
    s.auto = false; rerender(cid, btn);
  };
  window.orgToggleInv = function (cid, key, btn) {
    var s = INVX[cid] || (INVX[cid] = {});
    if (s[key]) delete s[key]; else s[key] = true;
    rerender(cid, btn);
  };
  window.orgExpandAll = function (cid, btn) { COLL[cid] = { set: {}, auto: false }; rerender(cid, btn); };
  window.orgAutoGroup = function (cid, btn) { delete COLL[cid]; rerender(cid, btn); };
  function rerender(cid, btn) {
    var host = btn && btn.closest ? btn.closest('.org-chart-card') : null;
    var settings = (typeof orgEnsureSettings === 'function') ? orgEnsureSettings(cid) : {};
    var vp = host && host.querySelector('.org-chart-viewport');
    var keep = vp && vp.__orgState ? { scale: vp.__orgState.scale, x: vp.__orgState.x, y: vp.__orgState.y } : null;
    if (host) {
      host.innerHTML = build(cid, settings);
      window.initOrgChartViewport();
      var nvp = host.querySelector('.org-chart-viewport');
      if (nvp && keep && nvp.__orgState) { nvp.__orgState.scale = keep.scale; nvp.__orgState.x = keep.x; nvp.__orgState.y = keep.y; orgChartApply(nvp); }
    } else if (typeof orgSelectCompany === 'function') orgSelectCompany(cid);
  }

  // ── Viewport: readable default zoom, "fit all" on the ⤡ button ──────────────
  window.orgChartFit = function (viewport, canvas, all) {
    var prev = canvas.style.transform;
    canvas.style.transform = 'none';
    var cw = canvas.offsetWidth, ch = canvas.offsetHeight, vw = viewport.clientWidth, vh = viewport.clientHeight;
    if (!cw || !ch || !vw || !vh) { canvas.style.transform = prev; return; }
    var fit = Math.min(vw / cw, vh / ch, 1);
    var st = viewport.__orgState;
    if (all || fit >= C.MIN_READ_SCALE) {
      st.scale = Math.max(fit, 0.08); st.x = (vw - cw * st.scale) / 2; st.y = (vh - ch * st.scale) / 2;
    } else {
      st.scale = Math.max(Math.min(vw / cw, 1), C.MIN_READ_SCALE);
      var cur = canvas.querySelector('.org-card.current'), cx = cw / 2, cy = ch / 2;
      if (cur) {
        var el = canvas.querySelector('.org-chart-tree'), off = 0, offY = 0;
        cx = cur.offsetLeft + cur.offsetWidth / 2; cy = cur.offsetTop + cur.offsetHeight / 2;
        while (el && el !== canvas) { off += el.offsetLeft || 0; offY += el.offsetTop || 0; el = el.offsetParent; }
        cx += off; cy += offY;
      }
      st.x = vw / 2 - cx * st.scale; st.y = vh * 0.35 - cy * st.scale;
      st.x = Math.max(Math.min(st.x, 0), vw - cw * st.scale);
      st.y = Math.max(Math.min(st.y, 0), Math.min(0, vh - ch * st.scale));
    }
    orgChartApply(viewport);
  };
  window.orgChartFitBtn = function (btn) {
    var vp = (btn && btn.closest) ? btn.closest('.org-chart-viewport') : document.querySelector('.org-chart-viewport');
    if (vp) window.orgChartFit(vp, vp.__orgCanvas, true);
  };
  var _initVP = window.initOrgChartViewport;
  window.initOrgChartViewport = function () {
    _initVP.apply(this, arguments);
    document.querySelectorAll('.org-chart-viewport').forEach(function (vp) {
      if (vp.querySelector('.org2-bar')) return;
      var tree = vp.querySelector('.org2-tree'); if (!tree) return;
      var cid = tree.getAttribute('data-root'), hidden = +tree.getAttribute('data-hidden') || 0;
      var bar = document.createElement('div'); bar.className = 'org2-bar';
      if (vp.querySelector('.org2-tg.closed')) bar.innerHTML = '<button type="button" onclick="orgExpandAll(' + JQ(cid) + ',this)">' + E(L('expandAll')) + (hidden ? ' (' + hidden + ' ' + E(L('hidden')) + ')' : '') + '</button>';
      else if (tree.getAttribute('data-big') === '1' && vp.querySelector('.org2-tg')) bar.innerHTML = '<button type="button" onclick="orgAutoGroup(' + JQ(cid) + ',this)">' + E(L('collapseAll')) + '</button>';
      if (bar.innerHTML) { bar.addEventListener('mousedown', function (e) { e.stopPropagation(); }); vp.appendChild(bar); }
    });
  };

  // ── Hover: highlight an entity's lines and every place it is referenced ─────
  function hl(card, on) {
    var tree = card.closest('.org2-tree'); if (!tree) return;
    var key = card.getAttribute('data-node-key');
    tree.classList.toggle('org2-dim', on);
    tree.querySelectorAll('.org2-e,.org2-pill,.org2-dot').forEach(function (p) {
      p.classList.toggle('hl', on && (p.getAttribute('data-k') || '').indexOf('|' + key + '|') !== -1);
    });
    tree.querySelectorAll('.org2-card').forEach(function (c) { c.classList.remove('org2-hl'); });
    tree.querySelectorAll('.org2-row.hl').forEach(function (r) { r.classList.remove('hl'); });
    if (!on) return;
    var rel = {}; rel[key] = 1;
    tree.querySelectorAll('.org2-e.hl').forEach(function (p) { (p.getAttribute('data-k') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; }); });
    (card.getAttribute('data-refs') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; });
    card.querySelectorAll('.org2-row[data-ref]').forEach(function (r) { r.classList.add('hl'); });
    tree.querySelectorAll('.org2-row[data-ref="' + key.replace(/"/g, '\\"') + '"]').forEach(function (r) { r.classList.add('hl'); var c = r.closest('.org2-card'); if (c) rel[c.getAttribute('data-node-key')] = 1; });
    tree.querySelectorAll('.org2-card').forEach(function (c) { if (rel[c.getAttribute('data-node-key')]) c.classList.add('org2-hl'); });
  }
  document.addEventListener('mouseover', function (e) {
    var c = e.target && e.target.closest && e.target.closest('.org2-card'); if (!c || c.__org2hl) return;
    c.__org2hl = true; hl(c, true);
  });
  document.addEventListener('mouseout', function (e) {
    var c = e.target && e.target.closest && e.target.closest('.org2-card'); if (!c) return;
    if (e.relatedTarget && c.contains(e.relatedTarget)) return;
    c.__org2hl = false; hl(c, false);
  });

  // ════════════════════════════════════════════════════════════════════════
  // PRINT: scale to the chart, never cut it
  // ════════════════════════════════════════════════════════════════════════
  var PAGE = { land: { w: 990, h: 700 }, port: { w: 730, h: 960 } };
  var MIN_PRINT_SCALE = 0.6;
  function printPlan(w, h) {
    var sl = Math.min(PAGE.land.w / w, PAGE.land.h / h), sp = Math.min(PAGE.port.w / w, PAGE.port.h / h);
    var land = sl >= sp, s = Math.min(Math.max(sl, sp), 1.25);
    if (s >= MIN_PRINT_SCALE) return { custom: false, land: land, zoom: s };
    var z = MIN_PRINT_SCALE, mm = 60;
    return { custom: true, land: w >= h, zoom: z, pageW: Math.ceil(w * z * 1.03 + mm + 20), pageH: Math.ceil(h * z * 1.05 + mm + 40) };
  }
  function planText(p) {
    var pct = Math.round(p.zoom * 100);
    if (!p.custom) return L('pageStd').replace('{o}', L(p.land ? 'landscape' : 'portrait')).replace('{p}', pct);
    return L('pageCustom').replace('{w}', (p.pageW / 96).toFixed(1)).replace('{h}', (p.pageH / 96).toFixed(1)).replace('{p}', pct);
  }
  window.orgPrintSetup = function (root) {
    root.style.zoom = 1;
    var p = printPlan(Math.max(root.scrollWidth, 1), Math.max(root.scrollHeight, 1));
    var css = p.custom ? '@page{size:' + p.pageW + 'px ' + p.pageH + 'px;margin:8mm}' : '@page{size:' + (p.land ? 'landscape' : 'portrait') + ';margin:8mm}';
    var el = document.getElementById('org2-page-style');
    if (!el) { el = document.createElement('style'); el.id = 'org2-page-style'; document.head.appendChild(el); }
    el.textContent = '@media print{' + css + '}';
    root.style.zoom = p.zoom;
    return p;
  };
  window.addEventListener('afterprint', function () { var el = document.getElementById('org2-page-style'); if (el) el.textContent = ''; });
  var _refresh = window.orgPrintRefreshPreview;
  if (typeof _refresh === 'function') {
    window.orgPrintRefreshPreview = function () {
      _refresh.apply(this, arguments);
      var host = document.getElementById('print-preview-inner'), note = document.querySelector('.print-preview-note');
      var scroll = host && host.querySelector('.org2-scroll');
      if (!scroll || !note) return;
      note.textContent = planText(printPlan(scroll.offsetWidth, scroll.offsetHeight + 56));
    };
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  var css = ''
    + '.org2-tree .org2-card{box-sizing:border-box;padding:0;display:block;text-align:left;border-width:1.5px;background:var(--surface);overflow:visible;border-radius:10px}'
    + '.org2-tree .org2-card>*{flex-shrink:0}'
    + '.org2-tree .org2-head{padding:9px 11px 8px;border-radius:9px 9px 0 0;min-height:' + (C.HEAD_H - 3) + 'px;box-sizing:border-box}'
    + '.org2-tree .org2-card.current{border-width:3px;border-color:var(--accent)!important;box-shadow:0 0 0 4px var(--accent-bg),var(--shadow-md)}'
    + '.org2-tree .org2-t-individual{border-radius:26px}.org2-tree .org2-t-individual .org2-head{border-radius:24px;text-align:center;min-height:0;padding:8px 14px}'
    + '.org2-tree .org2-t-individual .org2-sec{border-radius:0 0 24px 24px}'
    + '.org2-tree .org2-t-trust{border-style:double;border-width:4px}'
    + '.org2-tree .org2-group{border-radius:12px!important}.org2-tree .org2-group .org2-head{border-radius:11px 11px 0 0!important;text-align:left!important}'
    + '.org2-tree .org-card-name{-webkit-line-clamp:2;font-size:12.5px;line-height:1.25;text-align:inherit;margin:0}'
    + '.org2-tree .org-card-label{font-size:9.5px;letter-spacing:.35px;opacity:.9;text-align:inherit;margin-bottom:2px}'
    + '.org2-status{font-size:9.5px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.3px;margin-top:1px}'
    + '.org2-selected-tag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:9px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:2px 8px;border-radius:10px;white-space:nowrap;z-index:2}'
    + '.org2-tree .org2-sec{border-top:1px solid var(--border);padding:3px 10px ' + C.SEC_PAD + 'px;font-size:10.5px;color:var(--text2);white-space:normal;overflow:visible;text-overflow:clip;margin:0}'
    + '.org2-sec-h{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.35px;color:var(--text3);height:' + (C.SEC_HEAD - 3) + 'px;line-height:' + (C.SEC_HEAD - 3) + 'px}'
    + '.org2-row{display:flex;align-items:center;gap:5px;height:' + C.ROW_H + 'px;line-height:' + C.ROW_H + 'px;border-radius:4px}'
    + '.org2-row i{flex:0 0 6px;height:6px;border-radius:50%;background:var(--coral)}'
    + '.org2-row .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.org2-row b{font-weight:700;color:var(--text);font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:0 5px;line-height:13px}'
    + '.org2-row.on .nm{color:var(--text)}.org2-row.hl{background:var(--accent-bg)}.org2-row.hl .nm{color:var(--accent);font-weight:600}'
    + '.org2-inv .org2-sec-h{color:var(--coral)}'
    + '.org2-more{border:none;background:none;padding:0;font:italic 10px system-ui,sans-serif;color:var(--accent);cursor:pointer;height:' + C.ROW_H + 'px}'
    + '.org2-svg .org2-band{fill:var(--surface,#fff);opacity:.55}.org2-svg .org2-band-sel{fill:var(--accent-bg);opacity:.6}'
    + '.org2-lvl{position:absolute;font:700 9.5px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.4px;color:var(--text3);line-height:1.3;padding-top:2px}'
    + '.org2-lvl.sel{color:var(--accent)}'
    + '.org2-svg .org2-halo{fill:none;stroke:var(--bg,#f0f2f8);stroke-width:5;opacity:0}'
    + '.org2-svg .org2-e{fill:none;stroke:#8e95b3;stroke-width:1.6;stroke-linejoin:round;transition:opacity .12s}'
    + '.org2-svg .org2-arrowhead{fill:#8e95b3}.org2-svg .org2-dot{fill:#8e95b3}'
    + '.org2-svg .org2-pill rect{fill:var(--surface,#fff);stroke:#8e95b3;stroke-width:1}'
    + '.org2-svg .org2-pill text{font:600 10.5px system-ui,sans-serif;fill:var(--text,#1e2340)}'
    + '.org2-dim .org2-e:not(.hl),.org2-dim .org2-dot:not(.hl){opacity:.15}.org2-dim .org2-pill:not(.hl){opacity:.25}'
    + '.org2-dim .org2-card:not(.org2-hl):not(:hover){opacity:.45}'
    + '.org2-svg .org2-e.hl{stroke:var(--accent);stroke-width:2.4}.org2-svg .org2-dot.hl{fill:var(--accent)}.org2-svg .org2-pill.hl rect{stroke:var(--accent);stroke-width:1.6}'
    + '.org2-tg{position:absolute;right:8px;font:700 10px system-ui,sans-serif;border:1px solid var(--border2);background:var(--surface);color:var(--text2);border-radius:9px;padding:1px 7px;cursor:pointer;line-height:15px;z-index:2}'
    + '.org2-tg-down{bottom:-9px}.org2-tg-up{top:-9px}.org2-tg.closed{background:var(--accent);color:#fff;border-color:var(--accent)}.org2-tg:hover{border-color:var(--accent)}'
    + '.org2-legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:0 0 12px;font-size:11.5px;color:var(--text2);align-items:center}'
    + '.org2-lg{display:inline-flex;align-items:center;gap:5px;font-weight:600}'
    + '.org2-lg i{display:inline-block;width:14px;height:10px;border:1.5px solid;border-radius:3px}.org2-lg i.org2-lg-sel{border:2.5px solid var(--accent);background:var(--surface)}'
    + '.org2-lg-line{font-weight:500;color:var(--text3);flex-basis:100%;justify-content:center;text-align:center;display:block;line-height:1.5}'
    + '.org2-bar{position:absolute;left:10px;bottom:10px;z-index:5}'
    + '.org2-bar button{font:600 12px system-ui,sans-serif;padding:6px 12px;border-radius:16px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;box-shadow:var(--shadow)}'
    + '.org2-bar button:hover{border-color:var(--accent);color:var(--accent)}'
    + '@media print{.org2-tg,.org2-bar,.org2-more{display:none!important}}';
  var st = document.getElementById('org2-style'); if (st) st.remove();
  var s = document.createElement('style'); s.id = 'org2-style'; s.textContent = css; document.head.appendChild(s);
})();
