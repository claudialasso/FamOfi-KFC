// ═══════════════════════════════════════════════════════════════════════════════
// FamOfi Registry — Org Chart engine (v4: "ownership diagram")
// Loaded with `defer` after script.js / crm.js / banking.js. Replaces the org-chart
// graph builder, layout, connectors and print scaling. Keeps every entry point the
// rest of the site calls: orgBuildGraph, orgRenderGraphHTML, buildFullOrgChart,
// buildFilteredOrgChart, orgChartFit, orgChartFitBtn, initOrgChartViewport.
//
// READ-ONLY: never changes ownership or investment data. No relationship is dropped:
// every shareholder of every entity on the chart is either a connector or a tag on
// that entity's connector; every investment of every company shown is drawn.
//
// VISUAL LANGUAGE
//   • Ownership: ONE line enters each entity from above (arrow = owned entity).
//     Its shareholders converge into that line:
//       – shareholder boxes above join through a single shared connector;
//       – any other shareholder (e.g. one already drawn elsewhere) plugs into the same
//         line as a small labelled tag.
//     Each % is plain text right beside its own shareholder's connection.
//   • Investments: separate small boxes BESIDE the company that holds them, joined by
//     a dashed orange connector — never below it, never styled as a subsidiary.
//   • No containers, no level bands. Hierarchy = vertical position.
//   • Tree packing guarantees connectors in the same gap never overlap, so each gap
//     needs just one horizontal line per branch.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var C = {
    W: 184, H: 56, IND_W: 176, IND_H: 48, STATUS_H: 12,
    GAP_X: 28, SUBTREE_GAP: 44, MARGIN: 28,
    // gap anatomy (top → bottom): [row] stem/trunk zone · bus · entity zone (% + tags) · [next row]
    STEM_ZONE: 30, TRUNK_ZONE: 20, ZONE_TOP: 6, LBL_H: 16, TAG_H: 16, ZONE_BOTTOM: 12, MIN_ZONE: 24,
    TXT_MAX: 230, TXT_MIN: 70,
    // investments
    // investments: a strip of separate boxes BELOW the company, inside the company's own level
    INV_W: 150, INV_H: 24, INV_GAP: 10, INV_VGAP: 16, INV_TOP: 24, INV_RAIL: 9, INV_GUTTER: 44, INV_FEED: 12, INV_PER_ROW: 4, INV_MAX_SCREEN: 3,
    // many subsidiaries with nothing below: wrapped grid around a central spine
    // same parent = same level: subsidiaries are never stacked (grid layout disabled)
    WRAP_MIN: Infinity, GUTTER: 40, SUBROW_GAP: 14,
    AUTO_MAX_CARDS: 40, MIN_READ_SCALE: 0.5
  };

  // ── i18n ──────────────────────────────────────────────────────────────────
  function L(k) {
    var es = (typeof lang !== 'undefined' && lang === 'es');
    var T = {
      individual: ['Individual', 'Persona'], trust: ['Trust', 'Fideicomiso / Trust'],
      holding: ['Holding company', 'Holding'], company: ['Company', 'Empresa'],
      s_individual: ['Individual', 'Persona'], s_trust: ['Trust', 'Trust'], s_holding: ['Holding', 'Holding'], s_company: ['Company', 'Empresa'],
      investment: ['Investment', 'Inversión'], investments: ['Investments', 'Inversiones'],
      selected: ['Selected', 'Seleccionada'], inLiq: ['In liquidation', 'En liquidación'], liquidated: ['Liquidated', 'Liquidada'],
      sharedWith: ['also held by', 'también en'], more: ['more', 'más'], showLess: ['show less', 'ver menos'], hidden: ['hidden', 'ocultas'],
      lgOwn: ['Ownership (arrow → owned entity, % = stake)', 'Propiedad (flecha → entidad poseída, % = participación)'],
      lgInv: ['Investment', 'Inversión'],
      lgTag: ['↗ = also shown elsewhere on this chart', '↗ = también en otra parte del gráfico'],
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
  var INVX = {};   // cid -> { key:true } companies whose investment list is expanded

  // ════════════════════════════════════════════════════════════════════════
  // 1. GRAPH — tree connectors + tags (never drops a relationship)
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
    function pctOf(v) { return (v == null || v === '' || isNaN(+v)) ? null : +v; }
    function edge(a, b, pct) { var k = a + '|' + b; if (a === b || seenE[k]) return; seenE[k] = 1; edges.push({ from: a, to: b, pct: pctOf(pct), kind: 'tree' }); }
    var deferred = []; // [targetKey, shareholder, circular]

    coNode(cid, 'focal', 0);

    // ── Shareholders above: each owner is drawn above its LARGEST stake on the chart
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
          if (ok === fk) { deferred.push([k, s, true]); return; }
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
      var loops = function (o) { var seen = {}, x = o, guard = 0; while (x && x !== fk && guard++ < 500) { if (seen[x]) return true; seen[x] = 1; x = tChild[x]; } return x !== fk; };
      Object.keys(tChild).forEach(function (o) { if (loops(o)) tChild[o] = firstT[o]; });
      var upDepth = function (o, guard) { if (o === fk) return 0; if ((guard = (guard || 0) + 1) > 400) return -1; return upDepth(tChild[o], guard) - 1; };
      Object.keys(tChild).forEach(function (o) { nodes[o].depth = upDepth(o); nodes[o].treeChild = tChild[o]; });
      var drawnOwners = function (t) { return Object.keys(tChild).filter(function (o) { return tChild[o] === t; }); };
      upE.forEach(function (e) {
        if (tChild[e.from] === e.to) { edge(e.from, e.to, e.pct); return; }
        // same shareholder of neighbouring entities → one connector branching to each
        var o = e.from, t0 = tChild[o], T = nodes[e.to], T0 = nodes[t0];
        var ok = T0 && T.treeChild && T.treeChild === T0.treeChild && !drawnOwners(e.to).length &&
          drawnOwners(t0).length === 1 && (!T.clusterOwner || T.clusterOwner === o) && (!T0.clusterOwner || T0.clusterOwner === o);
        if (ok) { edge(o, e.to, e.pct); nodes[o].multi = true; nodes[e.to].clusterOwner = o; nodes[t0].clusterOwner = o; }
        else deferred.push([e.to, e.s]);
      });
    }

    // ── Subsidiaries below: each hangs from its LARGEST owner on the chart
    if (showDown) {
      var order = [], disc = {}, qd = [cid];
      while (qd.length) {
        var id2 = qd.shift(), k2 = 'co:' + id2;
        if (id2 !== cid && coll[k2]) { nodes[k2].collapsedDown = true; continue; }
        (ctx.subsOf[id2] || []).forEach(function (x) {
          var sc = x.co; if (subF && !subF.has(sc.id)) return;
          if (nodes['co:' + sc.id]) return;
          coNode(sc.id, 'down', null); disc[sc.id] = id2; order.push(sc.id); qd.push(sc.id);
        });
      }
      var chainOwner = function (s) { if (s.type !== 'company') return null; var n2 = nodes['co:' + s.person]; return (n2 && (n2.role === 'down' || n2.role === 'focal')) ? n2 : null; };
      var parent = {};
      var reaches = function (fromId, targetId) { var guard = 0; while (fromId && guard++ < 500) { if (fromId === targetId) return true; fromId = parent[fromId]; } return false; };
      order.forEach(function (sid) {
        var best = null;
        (byId[sid].shareholders || []).forEach(function (s) { if (chainOwner(s) && (best == null || (+s.pct || 0) > (+best.pct || 0))) best = s; });
        var p = best ? best.person : disc[sid];
        if (p !== cid && reaches(p, sid)) p = disc[sid];
        parent[sid] = p === cid ? null : p;
        nodes['co:' + sid].treeParent = 'co:' + p;
      });
      var depthOf = function (sid, guard) { guard = guard || 0; var p = parent[sid]; return (p == null || guard > 400) ? 1 : depthOf(p, guard + 1) + 1; };
      order.forEach(function (sid) { nodes['co:' + sid].depth = depthOf(sid); });
      order.forEach(function (sid) {
        var k3 = 'co:' + sid, tp = nodes[k3].treeParent;
        (byId[sid].shareholders || []).forEach(function (s) {
          if (!s.person || (s.type === 'company' && !byId[s.person])) return;
          if (ownerKey(s) === tp) edge(tp, k3, s.pct); else deferred.push([k3, s]);
        });
      });
    }
    // cross-holdings: an owner above that is itself owned by the selected company / a subsidiary
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (n.role !== 'up' || !n.coId) return;
      (byId[n.refId].shareholders || []).forEach(function (s) {
        var o = s.type === 'company' && nodes['co:' + s.person];
        if (o && (o.role === 'down' || o.role === 'focal') && !seenE[o.key + '|' + k]) deferred.push([k, s, true]);
      });
    });
    var seenTag = {};
    deferred.forEach(function (d) {
      var s = d[1], ok = ownerKey(s), tk = d[0] + '<' + ok;
      if (seenTag[tk] || seenE[ok + '|' + d[0]]) return; seenTag[tk] = 1;
      nodes[d[0]].also.push({ key: ok, name: ownerName(s), pct: pctOf(s.pct), etype: ownerType(s), circular: !!d[2] });
    });
    Object.keys(nodes).forEach(function (k) {
      nodes[k].also.forEach(function (a) { a.onChart = !!nodes[a.key]; });
      nodes[k].also.sort(function (a, b) { return (b.pct || 0) - (a.pct || 0) || byName(a.name, b.name); });
    });

    // ── Investments (drawn beside the holder, never as subsidiaries)
    if (showInv) {
      var holders = Object.keys(nodes).filter(function (k) { var n = nodes[k]; return n.coId && (n.role === 'down' || n.role === 'focal') && !n.collapsedDown; });
      var holdersOf = {};
      holders.forEach(function (hk) { companyInvestments(nodes[hk].refId).forEach(function (inv) { if (invF && !invF.has(inv.id)) return; (holdersOf[inv.id] = holdersOf[inv.id] || []).push(hk); }); });
      holders.forEach(function (hk) {
        companyInvestments(nodes[hk].refId).forEach(function (inv) {
          if (invF && !invF.has(inv.id)) return;
          nodes[hk].invs.push({ id: inv.id, name: inv.name, type: inv.type || '', shared: holdersOf[inv.id].filter(function (x) { return x !== hk; }).map(function (x) { return nodes[x].name; }) });
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
  // 2. LAYOUT
  // ════════════════════════════════════════════════════════════════════════
  function layout(g, print) {
    var nodes = g.nodes, fk = g.focalKey, keys = Object.keys(nodes);
    var V = {};
    var pctIn = {}; g.edges.forEach(function (e) { pctIn[e.to] = e; });
    keys.forEach(function (k) {
      var n = nodes[k], ind = n.etype === 'individual';
      var v = V[k] = { key: k, n: n, rank: n.depth, w: ind ? C.IND_W : C.W, h: (ind ? C.IND_H : C.H) + ((n.status === 'liquidation' || n.status === 'liquidated') ? C.STATUS_H : 0) };
      v.fl = v.w / 2; v.fr = v.w / 2; v.fh = v.h;
      v.lbl = (n.role === 'down' || !!n.clusterOwner) && pctIn[k] && pctIn[k].pct != null; // % shown just above the entity (fan-out)
      v.zone = Math.max(C.MIN_ZONE, C.ZONE_TOP + (v.lbl ? C.LBL_H : 0) + n.also.length * C.TAG_H + C.ZONE_BOTTOM);
    });
    var dch = {}, uch = {};
    g.edges.forEach(function (e) {
      if (nodes[e.to].role === 'down') (dch[e.from] = dch[e.from] || []).push(e.to);
      else if (!(nodes[e.to].clusterOwner === e.from)) (uch[e.to] = uch[e.to] || []).push(e.from);
    });
    // investments: strip of boxes under the company (row-major, up to INV_PER_ROW per row).
    // When the company also has subsidiaries the strip splits around its ownership line.
    keys.forEach(function (k) {
      var v = V[k], n = v.n; if (!n.invs.length) return;
      var open = print || (INVX[g.rootId] && INVX[g.rootId][k]);
      var shown = open ? n.invs.length : Math.min(n.invs.length, C.INV_MAX_SCREEN);
      var items = n.invs.slice(0, shown).map(function (iv) { return { inv: iv }; });
      if (!print && n.invs.length > C.INV_MAX_SCREEN) items.push({ more: true });
      var hasSubs = !!(dch[k] || []).length, rows = [];
      for (var i = 0; i < items.length; i += C.INV_PER_ROW) rows.push(items.slice(i, i + C.INV_PER_ROW));
      var split = hasSubs || rows.length > 1, gut = split ? C.INV_GUTTER : 0, maxW = 0, step = C.INV_W + C.INV_GAP;
      rows.forEach(function (row, ri) {
        var nl = split ? Math.ceil(row.length / 2) : 0;
        row.forEach(function (it, j) {
          it.yRel = v.h + C.INV_TOP + ri * (C.INV_H + C.INV_VGAP);
          if (!split) it.xRel = -(row.length * step - C.INV_GAP) / 2 + j * step;
          else if (j < nl) it.xRel = -gut / 2 - (nl - j) * step + C.INV_GAP;
          else it.xRel = gut / 2 + (j - nl) * step;
          it.side = !split ? 0 : (j < nl ? -1 : 1);
        });
        var rw = split ? 2 * Math.max(nl, row.length - nl) * step - 2 * C.INV_GAP + gut : row.length * step - C.INV_GAP;
        maxW = Math.max(maxW, rw);
      });
      v.inv = { items: items, rows: rows, split: split, hasSubs: hasSubs, total: n.invs.length };
      v.fl = Math.max(v.fl, maxW / 2); v.fr = Math.max(v.fr, maxW / 2);
      v.fh = v.h + C.INV_TOP + rows.length * (C.INV_H + C.INV_VGAP) - C.INV_VGAP;
    });

    // ---- compact tree placement (Reingold–Tilford contours per level) ----
    var off = {}, blocks = [];
    function mergeC(acc, c, dx) { Object.keys(c).forEach(function (d) { var l = c[d][0] + dx, r = c[d][1] + dx; if (!acc[d]) acc[d] = [l, r]; else { acc[d][0] = Math.min(acc[d][0], l); acc[d][1] = Math.max(acc[d][1], r); } }); }
    function pack(groups) {
      var acc = {}, offs = [];
      groups.forEach(function (gr, i) {
        var o = 0;
        if (i) { o = -1e9; Object.keys(gr.cont).forEach(function (d) { if (acc[d]) o = Math.max(o, acc[d][1] - gr.cont[d][0] + (gr.gap || C.GAP_X)); }); if (o === -1e9) o = 0; }
        offs.push(o); mergeC(acc, gr.cont, o);
      });
      if (!groups.length) return offs;
      var mid = (offs[0] + offs[offs.length - 1]) / 2;
      return offs.map(function (o) { return o - mid; });
    }
    function layDown(k) {
      var d0 = V[k].rank;
      var kids = (dch[k] || []).slice().sort(function (a, b) { return byName(nodes[a].name, nodes[b].name); });
      var nonLeaf = kids.filter(function (c) { return (dch[c] || []).length; });
      var leaves = kids.filter(function (c) { return !(dch[c] || []).length; });
      var groups = [];
      nonLeaf.forEach(function (c) { groups.push({ key: c, cont: layDown(c), gap: C.SUBTREE_GAP }); });
      if (leaves.length >= C.WRAP_MIN) {
        // wrapped grid: cells either side of a central spine, rows read left → right
        var cPer = Math.max(1, Math.round(Math.sqrt(leaves.length) / 1.6)), per = 2 * cPer;
        var cellW = leaves.reduce(function (m, c) { return Math.max(m, V[c].fl + V[c].fr); }, 0) + C.GAP_X;
        var width = 2 * cPer * cellW + C.GUTTER;
        var b = { parent: k, rank: d0 + 1, cellW: cellW, cPer: cPer, rows: [], key: '▦' + blocks.length };
        for (var i = 0; i < leaves.length; i += per) {
          var items = leaves.slice(i, i + per), nl = Math.ceil(items.length / 2);
          var row = { cells: [] };
          items.forEach(function (c, j) {
            var cellLeft = j < nl ? -C.GUTTER / 2 - (nl - j) * cellW : C.GUTTER / 2 + (j - nl) * cellW;
            row.cells.push({ key: c, rel: cellLeft + C.GAP_X / 2 + V[c].fl });
          });
          b.rows.push(row);
        }
        var cont = {}; cont[d0 + 1] = [-width / 2, width / 2];
        blocks.push(b); groups.push({ block: b, cont: cont, gap: C.SUBTREE_GAP });
      } else leaves.forEach(function (c) { var cont = {}; cont[d0 + 1] = [-V[c].fl, V[c].fr]; groups.push({ key: c, cont: cont }); });
      var bl = groups.filter(function (x) { return x.block; }), nd = groups.filter(function (x) { return !x.block; });
      var half = Math.ceil(nd.length / 2);
      groups = nd.slice(0, half).concat(bl).concat(nd.slice(half));
      var offs = pack(groups), res = {};
      res[d0] = [-V[k].fl, V[k].fr];
      groups.forEach(function (gr, i) { mergeC(res, gr.cont, offs[i]); if (gr.block) gr.block.off = offs[i]; else off[gr.key] = offs[i]; });
      V[k].kidsDown = groups;
      return res;
    }
    function applyDown(k) {
      (V[k].kidsDown || []).forEach(function (gr) {
        if (gr.block) {
          var b = gr.block; b.x = V[k].x + b.off;
          b.rows.forEach(function (row, ri) { row.cells.forEach(function (c) { V[c.key].x = b.x + c.rel; V[c.key].block = b; V[c.key].subRow = ri; }); });
        } else { V[gr.key].x = V[k].x + off[gr.key]; applyDown(gr.key); }
      });
    }
    function upKids(k) {
      var pct = function (o) { var e = g.edges.find(function (x) { return x.from === o && x.to === k; }); return (e && e.pct) || 0; };
      var kids = (uch[k] || []).slice().sort(function (a, b) { return pct(b) - pct(a) || byName(nodes[a].name, nodes[b].name); });
      var arranged = []; kids.forEach(function (c, i) { if (i % 2 === 0) arranged.push(c); else arranged.unshift(c); });
      return arranged;
    }
    var clusterOf = {};
    function layUp(k) {
      var d0 = V[k].rank, kids = upKids(k), groups = [], seenO = {};
      // owners of k that share one shareholder sit together under it
      var owner = function (c) { return nodes[c].clusterOwner; };
      var ordered = [];
      kids.forEach(function (c) { var o = owner(c); if (!o) { ordered.push(c); return; } if (seenO[o]) return; seenO[o] = 1; kids.forEach(function (x) { if (owner(x) === o) ordered.push(x); }); });
      var done = {};
      ordered.forEach(function (c) {
        var o = owner(c);
        if (!o) { groups.push({ key: c, cont: layUp(c) }); return; }
        if (done[o]) return; done[o] = 1;
        var members = ordered.filter(function (x) { return owner(x) === o; });
        var mg = members.map(function (m) { var ct = {}; ct[V[m].rank] = [-V[m].fl, V[m].fr]; return { key: m, cont: ct }; });
        var mo = pack(mg), cont = {};
        mg.forEach(function (m, i) { mergeC(cont, m.cont, mo[i]); off[m.key] = mo[i]; });
        mergeC(cont, layUp(o), 0);
        var cl = { owner: o, members: members };
        clusterOf[o] = cl;
        groups.push({ cluster: cl, cont: cont });
      });
      var offs = pack(groups), res = {};
      res[d0] = [-V[k].fl, V[k].fr];
      groups.forEach(function (gr, i) { mergeC(res, gr.cont, offs[i]); if (gr.cluster) gr.cluster.off = offs[i]; else off[gr.key] = offs[i]; });
      V[k].upGroups = groups;
      V[k].kidsUp = [];
      groups.forEach(function (gr) { if (gr.cluster) V[k].kidsUp = V[k].kidsUp.concat(gr.cluster.members); else V[k].kidsUp.push(gr.key); });
      return res;
    }
    function applyUp(k) {
      (V[k].upGroups || []).forEach(function (gr) {
        if (gr.cluster) {
          var cx = V[k].x + gr.cluster.off;
          gr.cluster.members.forEach(function (m) { V[m].x = cx + off[m]; });
          V[gr.cluster.owner].x = cx; applyUp(gr.cluster.owner);
        } else { V[gr.key].x = V[k].x + off[gr.key]; applyUp(gr.key); }
      });
    }
    V[fk].x = 0;
    layDown(fk); applyDown(fk); layUp(fk); applyUp(fk);

    // ---- vertical placement ----
    var minR = 1e9, maxR = -1e9, byRank = {};
    keys.forEach(function (k) { var r = V[k].rank; minR = Math.min(minR, r); maxR = Math.max(maxR, r); (byRank[r] = byRank[r] || []).push(k); });
    blocks.forEach(function (b) {
      var y = 0;
      b.rows.forEach(function (row, ri) {
        row.zone = row.cells.reduce(function (m, c) { return Math.max(m, V[c.key].zone); }, C.MIN_ZONE);
        if (ri) { row.busRel = y + C.SUBROW_GAP; y = row.busRel + row.zone; }
        row.topRel = y;
        row.h = row.cells.reduce(function (m, c) { return Math.max(m, V[c.key].fh); }, 0);
        y += row.h;
      });
      b.h = y;
    });
    var rowTop = {}, rowH = {}, busY = {};
    var y = C.MARGIN + (byRank[minR] || []).reduce(function (m, k) { return Math.max(m, V[k].n.also.length ? V[k].zone : 0); }, 0);
    for (var r = minR; r <= maxR; r++) {
      rowTop[r] = y;
      var hh = 0;
      (byRank[r] || []).forEach(function (k) { if (!V[k].block) hh = Math.max(hh, V[k].fh); });
      blocks.forEach(function (b) { if (b.rank === r) hh = Math.max(hh, b.h); });
      rowH[r] = hh;
      if (r < maxR) {
        busY[r] = y + hh + (r + 1 <= 0 ? C.STEM_ZONE : C.TRUNK_ZONE);
        var zone = C.MIN_ZONE;
        (byRank[r + 1] || []).forEach(function (k) { var v = V[k]; if (!v.block || v.subRow === 0) zone = Math.max(zone, v.zone); });
        y = busY[r] + zone;
      } else y += hh;
    }
    keys.forEach(function (k) {
      var v = V[k]; v.top = rowTop[v.rank];
      if (v.block) v.top += v.block.rows[v.subRow].topRel;
      v.bottom = v.top + v.h;
    });
    blocks.forEach(function (b) { b.top = rowTop[b.rank]; b.rows.forEach(function (row, ri) { row.busY = ri ? b.top + row.busRel : busY[b.rank - 1]; }); });

    // ---- connectors ----
    var segs = [], labels = [], tags = [], dots = [], inv = [];
    function seg(x1, y1, x2, y2, k, o) { if (Math.abs(x1 - x2) < 0.01 && Math.abs(y1 - y2) < 0.01) return; segs.push(Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2, k: k }, o || {})); }
    function K(list) { return '|' + list.join('|') + '|'; }
    function pctE(from, to) { var e = g.edges.find(function (x) { return x.from === from && x.to === to; }); return e ? e.pct : null; }
    function span(xs) { return [Math.min.apply(null, xs), Math.max.apply(null, xs)]; }
    for (var r2 = minR; r2 < maxR; r2++) {
      var by = busY[r2], rowBottom = rowTop[r2] + rowH[r2];
      if (r2 + 1 <= 0) {
        // a shareholder of several neighbouring entities: one connector branching to each
        (byRank[r2] || []).forEach(function (o) {
          var cl = clusterOf[o]; if (!cl) return;
          var O = V[o], ms = cl.members, AK = K([o].concat(ms));
          seg(O.x, O.bottom, O.x, by, AK);
          var spc = span(ms.map(function (m) { return V[m].x; }).concat([O.x]));
          seg(spc[0], by, spc[1], by, AK);
          ms.forEach(function (m) {
            seg(V[m].x, by, V[m].x, V[m].top, K([o, m]), { arrow: true });
            if (V[m].x > spc[0] + 0.5 && V[m].x < spc[1] - 0.5) dots.push({ x: V[m].x, y: by, k: K([o, m]) });
          });
          if (O.x > spc[0] + 0.5 && O.x < spc[1] - 0.5) dots.push({ x: O.x, y: by, k: AK });
        });
        // shareholders converge into the entity they own
        (byRank[r2 + 1] || []).forEach(function (t) {
          var owners = V[t].kidsUp || []; if (!owners.length) return;
          var T = V[t], all = owners.concat([t]);
          if (owners.length === 1 && Math.abs(V[owners[0]].x - T.x) < 0.5) {
            seg(T.x, V[owners[0]].bottom, T.x, T.top, K(all), { arrow: true });
          } else {
            owners.forEach(function (ok) { var o2 = V[ok]; seg(o2.x, o2.bottom, o2.x, by, K([ok, t])); });
            var sp = span(owners.map(function (ok) { return V[ok].x; }).concat([T.x]));
            seg(sp[0], by, sp[1], by, K(all));
            seg(T.x, by, T.x, T.top, K(all), { arrow: true });
            dots.push({ x: T.x, y: by, k: K(all) });
          }
          owners.forEach(function (ok) {
            var p = fmtPct(pctE(ok, t)); if (!p) return;
            labels.push({ x: V[ok].x + 6, y: rowBottom + 15, text: p, k: K([ok, t]) });
          });
        });
      } else {
        // a company's holdings hang from one trunk
        (byRank[r2] || []).forEach(function (p) {
          var groups = V[p].kidsDown || []; if (!groups.length) return;
          var P = V[p], drops = [], allKeys = [p], blk = null;
          groups.forEach(function (gr) {
            if (gr.block) {
              blk = gr.block;
              blk.rows[0].cells.forEach(function (c) { drops.push(c.key); });
              blk.rows.forEach(function (row) { row.cells.forEach(function (c) { allKeys.push(c.key); }); });
            } else { drops.push(gr.key); allKeys.push(gr.key); }
          });
          var AK = K(allKeys);
          if (drops.length === 1 && !blk && Math.abs(V[drops[0]].x - P.x) < 0.5) {
            seg(P.x, P.bottom, P.x, V[drops[0]].top, K([p, drops[0]]), { arrow: true });
          } else {
            seg(P.x, P.bottom, P.x, by, AK);
            var xs = drops.map(function (c) { return V[c].x; }).concat([P.x]);
            if (blk && blk.rows.length > 1) xs.push(blk.x);
            var sp2 = span(xs);
            seg(sp2[0], by, sp2[1], by, AK);
            drops.forEach(function (c) {
              seg(V[c].x, by, V[c].x, V[c].top, K([p, c]), { arrow: true });
              if (V[c].x > sp2[0] + 0.5 && V[c].x < sp2[1] - 0.5) dots.push({ x: V[c].x, y: by, k: K([p, c]) });
            });
            if (P.x > sp2[0] + 0.5 && P.x < sp2[1] - 0.5) dots.push({ x: P.x, y: by, k: AK });
          }
          if (blk && blk.rows.length > 1) {
            var last = blk.rows[blk.rows.length - 1];
            seg(blk.x, by, blk.x, last.busY, AK);
            blk.rows.forEach(function (row, ri) {
              if (!ri) return;
              var sp3 = span(row.cells.map(function (c) { return V[c.key].x; }).concat([blk.x]));
              seg(sp3[0], row.busY, sp3[1], row.busY, AK);
              row.cells.forEach(function (c) { seg(V[c.key].x, row.busY, V[c.key].x, V[c.key].top, K([p, c.key]), { arrow: true }); });
              if (ri < blk.rows.length - 1) dots.push({ x: blk.x, y: row.busY, k: AK });
            });
          }
        });
      }
    }
    // entity zone: its own % (fan-out) and any other shareholders plugged into its line
    keys.forEach(function (k) {
      var v = V[k], n = v.n;
      var hasIn = segs.some(function (s) { return s.arrow && Math.abs(s.x2 - v.x) < 0.5 && Math.abs(s.y2 - v.top) < 0.5; });
      if (!hasIn && !n.also.length) return;
      var zTop = v.top - v.zone;
      if (!hasIn) seg(v.x, zTop + C.ZONE_TOP - 2, v.x, v.top, K([k]), { arrow: true, stub: true });
      var yy = zTop + C.ZONE_TOP;
      if (v.lbl) {
        var e = pctIn[k];
        labels.push({ x: v.x + 6, y: yy + 11, text: fmtPct(e.pct), k: K([e.from, k]) });
        yy += C.LBL_H;
      }
      n.also.forEach(function (a) { tags.push({ x: v.x, y: yy + 8, a: a, k: K([a.key, k]) }); yy += C.TAG_H; });
    });
    // investments below the holder (dashed, orange; never part of the ownership lines)
    keys.forEach(function (k) {
      var v = V[k], I = v.inv; if (!I) return;
      var bottom = v.top + v.h, paths = [];
      I.items.forEach(function (it) { it.x = v.x + it.xRel; it.y = v.top + it.yRel; });
      (I.split ? [-1, 1] : [0]).forEach(function (sd) {
        if (!I.items.some(function (it) { return it.side === sd; })) return;
        var fx = (sd !== 0 && I.hasSubs) ? v.x + sd * C.INV_FEED : v.x, lastY = null;
        I.rows.forEach(function (row) {
          var ri = row.filter(function (it) { return it.side === sd; }); if (!ri.length) return;
          var ry = ri[0].y - C.INV_RAIL, xs = ri.map(function (it) { return it.x + C.INV_W / 2; }).concat([fx]);
          paths.push([Math.min.apply(null, xs), ry, Math.max.apply(null, xs), ry]);
          ri.forEach(function (it) { paths.push([it.x + C.INV_W / 2, ry, it.x + C.INV_W / 2, it.y]); });
          lastY = ry;
        });
        paths.push([fx, bottom, fx, lastY]);
      });
      inv.push({ holder: k, items: I.items, paths: paths, total: I.total });
    });

    // ---- text widths: never run into the next line or box to the right ----
    function fit(list, yOf, pad) {
      list.forEach(function (t) {
        var yT = yOf(t), xL = t.x + pad, limit = C.TXT_MAX;
        segs.forEach(function (s) { if (Math.abs(s.x1 - s.x2) < 0.5 && s.x1 > xL + 1 && yT > Math.min(s.y1, s.y2) - 8 && yT < Math.max(s.y1, s.y2) + 8) limit = Math.min(limit, s.x1 - xL - 10); });
        keys.forEach(function (k) { var v = V[k]; if (v.x - v.w / 2 > xL && yT > v.top - 6 && yT < v.top + v.fh + 6) limit = Math.min(limit, v.x - v.w / 2 - xL - 10); });
        t.maxW = Math.max(C.TXT_MIN, limit);
      });
    }
    fit(tags, function (t) { return t.y; }, 17);
    fit(labels, function (t) { return t.y - 4; }, 0);

    // ---- extent ----
    var minX = Infinity, maxX = -Infinity, maxY = 0;
    keys.forEach(function (k) { var v = V[k]; minX = Math.min(minX, v.x - v.fl); maxX = Math.max(maxX, v.x + v.fr); maxY = Math.max(maxY, v.top + v.fh); });
    tags.forEach(function (t) { maxX = Math.max(maxX, t.x + 17 + t.maxW); });
    var sx = C.MARGIN - minX;
    keys.forEach(function (k) { V[k].x += sx; });
    segs.forEach(function (s) { s.x1 += sx; s.x2 += sx; });
    labels.forEach(function (t) { t.x += sx; });
    tags.forEach(function (t) { t.x += sx; });
    dots.forEach(function (d) { d.x += sx; });
    inv.forEach(function (s) { s.items.forEach(function (it) { it.x += sx; }); s.paths.forEach(function (p) { p[0] += sx; p[2] += sx; }); });
    blocks.forEach(function (b) { b.x += sx; });
    return { V: V, segs: segs, labels: labels, tags: tags, dots: dots, inv: inv, blocks: blocks,
      width: Math.ceil(maxX - minX + 2 * C.MARGIN), height: Math.ceil(maxY + C.MARGIN), minR: minR, maxR: maxR };
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. RENDER
  // ════════════════════════════════════════════════════════════════════════
  function renderSVG(g, Lo) {
    var p = [], labels = [], dots = [], tags = [], invs = [];
    Lo.segs.forEach(function (s) {
      p.push('<path class="org2-e' + (s.stub ? ' org2-stub' : '') + '" data-k="' + E(s.k) + '" d="M' + r1(s.x1) + ' ' + r1(s.y1) + 'L' + r1(s.x2) + ' ' + r1(s.y2 - (s.arrow ? 1 : 0)) + '"' + (s.arrow ? ' marker-end="url(#org2-arrow)"' : '') + '/>');
    });
    Lo.dots.forEach(function (d) { dots.push('<circle class="org2-dot" data-k="' + E(d.k) + '" cx="' + r1(d.x) + '" cy="' + r1(d.y) + '" r="2.8"/>'); });
    Lo.labels.forEach(function (t) { labels.push('<text class="org2-pct" data-k="' + E(t.k) + '" x="' + r1(t.x) + '" y="' + r1(t.y) + '">' + E(t.text) + '</text>'); });
    Lo.tags.forEach(function (t) {
      var a = t.a, col = (TYPE_COL[a.etype] || TYPE_COL.company).c, pct = fmtPct(a.pct);
      tags.push('<g class="org2-tag' + (a.onChart ? ' on' : '') + '" data-k="' + E(t.k) + '"' + (a.onChart ? ' data-ref="' + E(a.key) + '"' : '') + '>'
        + '<path class="org2-e" d="M' + r1(t.x) + ' ' + r1(t.y) + 'H' + r1(t.x + 9) + '"/>'
        + '<circle cx="' + r1(t.x + 12) + '" cy="' + r1(t.y) + '" r="3" style="fill:' + col + '"/>'
        + '<foreignObject x="' + r1(t.x + 17) + '" y="' + r1(t.y - 8) + '" width="' + r1(t.maxW) + '" height="16"><div xmlns="http://www.w3.org/1999/xhtml" class="org2-tagtxt" title="' + E(a.name + (pct ? ' — ' + pct : '') + (a.circular ? ' — ' + L('circular') : '')) + '">'
        + (pct ? '<b>' + E(pct) + '</b> ' : '') + '<span>' + E(a.name) + (a.onChart ? ' ↗' : '') + (a.circular ? ' ↻' : '') + '</span></div></foreignObject></g>');
    });
    Lo.inv.forEach(function (s) {
      var k = '|' + s.holder + '|';
      s.paths.forEach(function (p) { invs.push('<path class="org2-inv-line" data-k="' + E(k) + '" d="M' + r1(p[0]) + ' ' + r1(p[1]) + 'L' + r1(p[2]) + ' ' + r1(p[3]) + '"/>'); });
    });
    return '<svg class="org-static-edges org2-svg" width="' + Lo.width + '" height="' + Lo.height + '" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">'
      + '<defs><marker id="org2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="org2-arrowhead"/></marker></defs>'
      + '<g>' + invs.join('') + '</g><g>' + p.join('') + '</g><g>' + dots.join('') + '</g><g>' + labels.join('') + '</g><g style="pointer-events:auto">' + tags.join('') + '</g></svg>';
  }

  function cardHTML(g, n, v, print) {
    var col = TYPE_COL[n.etype] || TYPE_COL.company, cur = n.key === g.focalKey;
    var cls = 'org-card org-card-abs org2-card org2-t-' + n.etype + (n.coId && !cur ? ' clickable' : '') + (cur ? ' current' : '');
    var click = (n.coId && !cur) ? ' onclick="openCompany(' + JQ(n.coId) + ')"' : '';
    var style = 'left:' + r1(v.x - v.w / 2) + 'px;top:' + r1(v.top) + 'px;width:' + r1(v.w) + 'px;height:' + r1(v.h) + 'px;margin:0;border-color:' + col.c + ';background:' + col.bg + ';';
    var refs = n.also.filter(function (a) { return a.onChart; }).map(function (a) { return a.key; });
    var h = '<div class="' + cls + '" data-node-key="' + E(n.key) + '" data-refs="' + E('|' + refs.join('|') + '|') + '" style="' + style + '"' + click + ' title="' + E(n.name + (n.jur ? ' — ' + n.jur : '')) + '">';
    if (cur) h += '<div class="org2-selected-tag">' + E(L('selected')) + '</div>';
    h += '<div class="org-card-label" style="color:' + col.c + '">' + E(L('s_' + n.etype) + (n.jur ? ' · ' + n.jur : '')) + '</div>';
    h += '<div class="org-card-name">' + E(n.name) + '</div>';
    if (n.status === 'liquidation') h += '<div class="org2-status">' + E(L('inLiq')) + '</div>';
    if (n.status === 'liquidated') h += '<div class="org2-status">' + E(L('liquidated')) + '</div>';
    if (!print && n.canCollapse) {
      var isUp = n.role === 'up', closed = isUp ? n.collapsedUp : n.collapsedDown;
      var txt = closed ? ('+' + n.hiddenCount + ' ' + (isUp ? '▲' : '▼')) : (isUp ? '▲' : '▼');
      var tip = closed ? (isUp ? L('showOwners') : L('showHoldings')) : L('hide');
      h += '<button type="button" class="org2-tg ' + (isUp ? 'org2-tg-up' : 'org2-tg-down') + (closed ? ' closed' : '') + '" title="' + E(tip) + '" onclick="event.stopPropagation();orgToggleCollapse(' + JQ(g.rootId) + ',' + JQ(n.key) + ',this)">' + E(txt) + '</button>';
    }
    return h + '</div>';
  }
  function invHTML(g, s) {
    return s.items.map(function (it) {
      var st = 'left:' + r1(it.x) + 'px;top:' + r1(it.y) + 'px;width:' + C.INV_W + 'px;height:' + C.INV_H + 'px;';
      if (it.more) {
        var open = INVX[g.rootId] && INVX[g.rootId][s.holder];
        return '<button type="button" class="org2-invc org2-invmore" data-holder="' + E(s.holder) + '" style="' + st + '" onclick="event.stopPropagation();orgToggleInv(' + JQ(g.rootId) + ',' + JQ(s.holder) + ',this)">' + (open ? E(L('showLess')) : '+' + (s.total - (s.items.length - 1)) + ' ' + E(L('more'))) + '</button>';
      }
      var iv = it.inv;
      return '<div class="org2-invc" data-holder="' + E(s.holder) + '" style="' + st + '" title="' + E(iv.name + (iv.type ? ' — ' + iv.type : '') + (iv.shared.length ? ' — ' + L('sharedWith') + ' ' + iv.shared.join(', ') : '')) + '">'
        + '<span>' + E(iv.name) + '</span>' + (iv.shared.length ? '<i>⇄</i>' : '') + '</div>';
    }).join('');
  }

  function legendHTML(g) {
    var present = {}, hasTagOn = false, hasInv = false;
    Object.keys(g.nodes).forEach(function (k) { var n = g.nodes[k]; present[n.etype] = true; if (n.also.some(function (a) { return a.onChart; })) hasTagOn = true; if (n.invs.length) hasInv = true; });
    var h = '<div class="org-legend org2-legend">';
    ['individual', 'trust', 'holding', 'company'].forEach(function (t) {
      if (!present[t]) return; var col = TYPE_COL[t];
      h += '<span class="org2-lg"><i style="background:' + col.bg + ';border-color:' + col.c + '"></i>' + E(L(t)) + '</span>';
    });
    h += '<span class="org2-lg"><svg width="26" height="10" class="org2-svg"><path d="M1 5H19" class="org2-e"/><path d="M18 1L25 5L18 9z" class="org2-arrowhead"/></svg>' + E(L('lgOwn')) + '</span>';
    if (hasInv) h += '<span class="org2-lg"><svg width="24" height="10" class="org2-svg"><path d="M1 5H23" class="org2-inv-line"/></svg><i class="org2-lg-inv"></i>' + E(L('lgInv')) + '</span>';
    if (hasTagOn) h += '<span class="org2-lg org2-lg-note">' + E(L('lgTag')) + '</span>';
    return h + '</div>';
  }

  function renderGraph(g, print) {
    var Lo = layout(g, print);
    var cards = [];
    Object.keys(g.nodes).forEach(function (k) { cards.push(cardHTML(g, g.nodes[k], Lo.V[k], print)); });
    var invh = Lo.inv.map(function (s) { return invHTML(g, s); }).join('');
    var big = Object.keys(g.nodes).length > C.AUTO_MAX_CARDS || g.hiddenTotal ? 1 : 0;
    var tree = '<div class="org-chart-tree org2-tree" data-root="' + E(g.rootId) + '" data-big="' + big + '" data-hidden="' + (g.hiddenTotal || 0) + '" data-w="' + Lo.width + '" data-h="' + Lo.height + '" style="position:relative;width:' + Lo.width + 'px;height:' + Lo.height + 'px;margin:0 auto">'
      + renderSVG(g, Lo) + cards.join('') + invh + '</div>';
    return { html: '<div class="org-chart-scroll org2-scroll" data-static-edges="1"><div style="font-family:system-ui,sans-serif">' + legendHTML(g) + tree + '</div></div>', layout: Lo };
  }

  // ── Auto-grouping for very large charts: collapse deepest levels first ──────
  function effectiveCollapsed(cid, opts, print) {
    if (print) return {};
    var s = COLL[cid]; if (s) return s.set;
    var set = {}, g = buildGraph(cid, Object.assign({}, opts, { collapsed: set }));
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
  window.orgToggleInv = function (cid, key, btn) { var s = INVX[cid] || (INVX[cid] = {}); if (s[key]) delete s[key]; else s[key] = true; rerender(cid, btn); };
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
    var fit = Math.min(vw / cw, vh / ch, 1), st = viewport.__orgState;
    if (all || fit >= C.MIN_READ_SCALE) { st.scale = Math.max(fit, 0.08); st.x = (vw - cw * st.scale) / 2; st.y = (vh - ch * st.scale) / 2; }
    else {
      st.scale = Math.max(Math.min(vw / cw, 1), C.MIN_READ_SCALE);
      var cur = canvas.querySelector('.org-card.current'), cx = cw / 2, cy = ch / 2;
      if (cur) {
        var el = canvas.querySelector('.org-chart-tree'), o1 = 0, o2 = 0;
        cx = cur.offsetLeft + cur.offsetWidth / 2; cy = cur.offsetTop + cur.offsetHeight / 2;
        while (el && el !== canvas) { o1 += el.offsetLeft || 0; o2 += el.offsetTop || 0; el = el.offsetParent; }
        cx += o1; cy += o2;
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

  // ── Hover: highlight an entity's connections and every tag that refers to it ─
  function hl(card, on) {
    var tree = card.closest('.org2-tree'); if (!tree) return;
    var key = card.getAttribute('data-node-key');
    tree.classList.toggle('org2-dim', on);
    tree.querySelectorAll('.hl').forEach(function (x) { x.classList.remove('hl'); });
    tree.querySelectorAll('.org2-hl').forEach(function (x) { x.classList.remove('org2-hl'); });
    if (!on) return;
    var rel = {}; rel[key] = 1;
    tree.querySelectorAll('[data-k]').forEach(function (p) { if ((p.getAttribute('data-k') || '').indexOf('|' + key + '|') !== -1) p.classList.add('hl'); });
    tree.querySelectorAll('.org2-e.hl').forEach(function (p) { (p.getAttribute('data-k') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; }); });
    (card.getAttribute('data-refs') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; });
    tree.querySelectorAll('.org2-tag[data-ref="' + key.replace(/"/g, '\\"') + '"]').forEach(function (t) { t.classList.add('hl'); (t.getAttribute('data-k') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; }); });
    tree.querySelectorAll('.org2-card').forEach(function (c) { if (rel[c.getAttribute('data-node-key')]) c.classList.add('org2-hl'); });
    tree.querySelectorAll('.org2-invc').forEach(function (c) { if (c.getAttribute('data-holder') === key) c.classList.add('org2-hl'); });
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
  var LINE = '#9097b5';
  var css = ''
    + '.org2-tree .org2-card{box-sizing:border-box;padding:8px 12px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;border-width:1.5px;overflow:visible;border-radius:10px;box-shadow:0 1px 2px rgba(30,35,64,.06)}'
    + '.org2-tree .org2-card>*{flex-shrink:0;max-width:100%}'
    + '.org2-tree .org2-card.clickable:hover{box-shadow:var(--shadow-md);transform:none}'
    + '.org2-tree .org2-card.current{border-width:2.5px;border-color:var(--accent)!important;box-shadow:0 0 0 4px var(--accent-bg),var(--shadow-md)}'
    + '.org2-tree .org2-t-individual{border-radius:22px;align-items:center;text-align:center;padding:6px 14px}'
    + '.org2-tree .org2-t-trust{border-style:double;border-width:4px}'
    + '.org2-tree .org-card-name{-webkit-line-clamp:2;font-size:12.5px;line-height:1.25;margin:0;color:var(--text);font-weight:700;text-align:inherit}'
    + '.org2-tree .org-card-label{font-size:9px;letter-spacing:.4px;text-align:inherit;margin-bottom:2px}'
    + '.org2-status{font-size:9px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.3px;margin-top:1px}'
    + '.org2-selected-tag{position:absolute;top:-9px;right:12px;background:var(--accent);color:#fff;font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 7px;border-radius:9px;white-space:nowrap;z-index:2}'
    + '.org2-svg .org2-e{fill:none;stroke:' + LINE + ';stroke-width:1.5;stroke-linecap:square}'
    + '.org2-svg .org2-arrowhead{fill:' + LINE + '}.org2-svg .org2-dot{fill:' + LINE + '}'
    + '.org2-svg .org2-pct{font:700 11px system-ui,sans-serif;fill:var(--text,#1e2340)}'
    + '.org2-tagtxt{font:500 10.5px/16px system-ui,sans-serif;color:var(--text2,#5a6080);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.org2-tagtxt b{font-weight:700;color:var(--text,#1e2340)}'
    + '.org2-tag.on .org2-tagtxt span{color:var(--text,#1e2340)}'
    + '.org2-svg .org2-inv-line{fill:none;stroke:var(--coral);stroke-width:1.3;stroke-dasharray:4 3;opacity:.85}'
    + '.org2-svg .org2-inv-head{font:700 8.5px system-ui,sans-serif;letter-spacing:.5px;fill:var(--coral)}'
    + '.org2-invc{position:absolute;box-sizing:border-box;display:flex;align-items:center;gap:7px;padding:0 10px;border:1px dashed var(--coral);border-radius:12px;background:var(--surface);font:500 10.5px system-ui,sans-serif;color:var(--text2);white-space:nowrap}'
    + '.org2-invc span{overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}.org2-invc i{font-style:normal;color:var(--coral)}'
    + '.org2-invc:before{content:"";flex:0 0 6px;height:6px;transform:rotate(45deg);background:var(--coral);opacity:.8}'
    + 'button.org2-invmore{cursor:pointer;color:var(--accent);font-style:italic;justify-content:flex-start;border-style:dotted}button.org2-invmore:before{display:none}'
    + '.org2-dim .org2-e:not(.hl),.org2-dim .org2-dot:not(.hl),.org2-dim .org2-inv-line:not(.hl){opacity:.14}'
    + '.org2-dim .org2-pct:not(.hl),.org2-dim .org2-tag:not(.hl),.org2-dim .org2-inv-head:not(.hl){opacity:.25}'
    + '.org2-dim .org2-card:not(.org2-hl):not(:hover),.org2-dim .org2-invc:not(.org2-hl){opacity:.4}'
    + '.org2-svg .org2-e.hl{stroke:var(--accent);stroke-width:2.2}.org2-svg .org2-dot.hl{fill:var(--accent)}.org2-svg .org2-pct.hl{fill:var(--accent)}'
    + '.org2-tag.hl .org2-tagtxt,.org2-tag.hl .org2-tagtxt b{color:var(--accent)}'
    + '.org2-tg{position:absolute;right:8px;font:700 10px system-ui,sans-serif;border:1px solid var(--border2);background:var(--surface);color:var(--text2);border-radius:9px;padding:1px 7px;cursor:pointer;line-height:15px;z-index:2}'
    + '.org2-tg-down{bottom:-9px}.org2-tg-up{top:-9px}.org2-tg.closed{background:var(--accent);color:#fff;border-color:var(--accent)}.org2-tg:hover{border-color:var(--accent)}'
    + '.org2-legend{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:0 0 6px;font-size:11px;color:var(--text3);align-items:center}'
    + '.org2-lg{display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--text2)}'
    + '.org2-lg i{display:inline-block;width:14px;height:10px;border:1.5px solid;border-radius:3px}'
    + '.org2-lg i.org2-lg-inv{border:1px dashed var(--coral);border-radius:6px;width:16px;background:var(--surface);margin-left:-4px}'
    + '.org2-lg-note{font-weight:500;color:var(--text3)}'
    + '.org2-bar{position:absolute;left:10px;bottom:10px;z-index:5}'
    + '.org2-bar button{font:600 12px system-ui,sans-serif;padding:6px 12px;border-radius:16px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;box-shadow:var(--shadow)}'
    + '.org2-bar button:hover{border-color:var(--accent);color:var(--accent)}'
    + '@media print{.org2-tg,.org2-bar{display:none!important}}';
  var old = document.getElementById('org2-style'); if (old) old.remove();
  var s = document.createElement('style'); s.id = 'org2-style'; s.textContent = css; document.head.appendChild(s);
})();
