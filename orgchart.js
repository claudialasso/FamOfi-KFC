// ═══════════════════════════════════════════════════════════════════════════════
// FamOfi Registry — Org Chart engine (v2)
// Loaded with `defer` after script.js / crm.js / banking.js. Replaces the org-chart
// graph builder, layout, line routing and print scaling. Keeps every entry point the
// rest of the site calls: orgBuildGraph, orgRenderGraphHTML, buildFullOrgChart,
// buildFilteredOrgChart, orgChartFit, orgChartFitBtn, initOrgChartViewport.
//
// READ-ONLY: never changes ownership data. Every entity appears exactly once.
//
// PIPELINE
//   1. Graph   — owners above the selected company (all layers), everything it owns
//                below (all layers), every co-owner of those subsidiaries (companies AND
//                individuals, e.g. Amerouge Investors LLC), and investments.
//                Investments held by a single company are grouped into one portfolio
//                card; an investment held by several companies gets its own card.
//   2. Ranks   — every ownership line points downward: owner row < owned row.
//                Subsidiaries sit as high as possible, owners as low as possible, so
//                lines stay short. Circular holdings are drawn dashed.
//   3. Order   — rows reordered (barycenter sweeps) to minimise line crossings.
//                Lines that skip rows get invisible waypoints so they pass BETWEEN
//                cards, never through them.
//   4. X       — exact least-squares placement per row (no overlaps, subsidiaries
//                centred under their majority owner, owners centred over their holdings).
//   5. Lines   — each owner gets its own horizontal track in each gap, so two owners'
//                lines never merge. Each owner enters the owned card at its own port,
//                with its % label on that final segment only — unambiguous.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var C = {
    W: 184, H: 86, IND_H: 64, PF_W: 216,
    GAP: 26, DGAP: 12, DUMMY_W: 10,
    PORT_SP: 62, TRACK_SP: 12, GAP_TOP: 18, GAP_MID: 8, PILL_ZONE: 30, GAP_NOPILL: 16,
    PF_LINE: 15, PF_MAX_SCREEN: 14,
    AUTO_MAX_CARDS: 70, MAX_ROW_W: 2600, CHIP_MIN: 5, CHIP_W: 176, CHIP_H: 50, MIN_READ_SCALE: 0.5, MARGIN: 24
  };

  // ── i18n ──────────────────────────────────────────────────────────────────
  function L(k) {
    var es = (typeof lang !== 'undefined' && lang === 'es');
    var T = {
      individual: ['Individual', 'Persona'], trust: ['Trust', 'Fideicomiso / Trust'],
      holding: ['Holding company', 'Holding'], company: ['Company', 'Empresa'],
      investment: ['Investment', 'Inversión'], portfolio: ['Investments', 'Inversiones'],
      selected: ['Selected', 'Seleccionada'], inLiq: ['In liquidation', 'En liquidación'],
      liquidated: ['Liquidated', 'Liquidada'], ownedBy: ['Owned by', 'Propiedad de'],
      more: ['more', 'más'], hidden: ['hidden', 'ocultas'],
      lineLegend: ['Line = ownership · arrow points to the owned entity · % = stake held',
                   'Línea = propiedad · la flecha apunta a la entidad poseída · % = participación'],
      circular: ['dashed = circular holding', 'punteada = participación circular'],
      expandAll: ['Expand all', 'Expandir todo'], collapseAll: ['Collapse levels', 'Contraer niveles'],
      showOwners: ['Show owners', 'Mostrar dueños'], showHoldings: ['Show holdings', 'Mostrar participadas'],
      hide: ['Hide', 'Ocultar'],
      coOwnerOf: ['co-owner of {n} entities in this chart (each shown with its own box)', 'copropietario de {n} entidades en este gráfico (cada una con su propio recuadro)'],
      refLegend: ['×N box = a co-owner with stakes in N entities here, shown above each one (hover to see all)', 'recuadro ×N = copropietario con participación en N entidades, mostrado sobre cada una (pase el cursor para ver todas)'],
      pageStd: ['Prints on one {o} page at about {p}% scale.', 'Se imprime en una página {o} a aprox. {p}%.'],
      pageCustom: ['Large chart: prints on one custom-size page ({w} × {h} in) at {p}% so nothing is cut. Choose “Save as PDF” as the printer for best results.',
                   'Gráfico grande: se imprime en una página de tamaño personalizado ({w} × {h} in) al {p}% para no cortar nada. Elija “Guardar como PDF” como impresora.'],
      landscape: ['landscape', 'horizontal'], portrait: ['portrait', 'vertical']
    };
    return (T[k] || [k, k])[es ? 1 : 0];
  }
  function E(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function JQ(s) { return E("'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"); }
  function fmtPct(p) {
    if (p == null || p === '' || isNaN(+p)) return null;
    var n = +p; return (Math.round(n * 100) / 100).toString() + '%';
  }

  // ── Entity typing (display only) ──────────────────────────────────────────
  var TYPE_COL = {
    individual: { c: 'var(--amber)', bg: 'var(--amber-bg)' },
    trust:      { c: 'var(--purple)', bg: 'var(--purple-bg)' },
    holding:    { c: 'var(--blue)', bg: 'var(--blue-bg)' },
    company:    { c: 'var(--teal)', bg: 'var(--teal-bg)' },
    investment: { c: 'var(--coral)', bg: 'var(--coral-bg)' },
    portfolio:  { c: 'var(--coral)', bg: 'var(--coral-bg)' }
  };
  function isTrustName(n) { return /\b(trust|fideicomiso|foundation|fundaci[oó]n)\b/i.test(n || ''); }

  // ── Context: active companies + indexes (cached per data snapshot) ─────────
  var _ctxCache = { src: null, liq: null, ctx: null };
  function context(cid) {
    var all = _sanitizedCompanies();
    var focal = all.find(function (c) { return c.id === cid; });
    var liq = !!(focal && focal.status === 'liquidated');
    if (_ctxCache.src === all && _ctxCache.liq === liq && _ctxCache.ctx) return _ctxCache.ctx;
    var comps = liq ? all : all.filter(function (c) { return c.status !== 'liquidated'; });
    var byId = {}, subsOf = {}, ownsCo = {};
    comps.forEach(function (c) { byId[c.id] = c; });
    comps.forEach(function (c) {
      (c.shareholders || []).forEach(function (s) {
        if (s.type === 'company' && byId[s.person]) {
          (subsOf[s.person] = subsOf[s.person] || []).push({ co: c, sh: s });
          ownsCo[s.person] = true;
        }
      });
    });
    Object.keys(subsOf).forEach(function (k) { subsOf[k].sort(function (a, b) { return (+b.sh.pct || 0) - (+a.sh.pct || 0) || String(a.co.name).localeCompare(String(b.co.name)); }); });
    var ctx = { byId: byId, subsOf: subsOf, ownsCo: ownsCo, all: all };
    _ctxCache = { src: all, liq: liq, ctx: ctx };
    return ctx;
  }
  function coType(ctx, c) { if (isTrustName(c.name)) return 'trust'; if (ctx.ownsCo[c.id]) return 'holding'; return 'company'; }
  function companyInvestments(cid) {
    return (data.investments || []).filter(function (i) { return invCoIds(i).indexOf(cid) !== -1; });
  }

  // ── Collapse state (per selected company; display only) ───────────────────
  var COLL = {}; // cid -> { set:{key:true}, auto:bool }
  function collState(cid) { return COLL[cid]; }

  // ════════════════════════════════════════════════════════════════════════
  // 1. GRAPH
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
    var focalKey = 'co:' + cid;

    function add(key, o) { if (nodes[key]) return nodes[key]; o.key = key; nodes[key] = o; return o; }
    function coNode(id, role) {
      var c = byId[id];
      return add('co:' + id, { kind: role === 'focal' ? 'focal' : (role === 'down' ? 'subsidiary' : 'company'), role: role, refId: id, coId: id,
        name: c.name, jur: c.jurisdiction || '', status: c.status || '', etype: coType(ctx, c), sub: c.jurisdiction || '' });
    }
    function indNode(name, role) {
      return add('ind:' + name, { kind: 'individual', role: role, refId: name, coId: null, name: name, jur: '', etype: 'individual', sub: '' });
    }
    function edge(a, b, pct) {
      if (!a || !b || a === b) return;
      var k = a + '|' + b; if (seenE[k]) return; seenE[k] = 1;
      edges.push({ from: a, to: b, pct: (pct == null || pct === '' || isNaN(+pct)) ? null : +pct });
    }

    coNode(cid, 'focal');

    // Owners above (all layers)
    if (showUp) {
      var qu = [cid], su = {}; su[cid] = 1;
      while (qu.length) {
        var id = qu.shift(), k = 'co:' + id;
        if (id !== cid && coll[k]) { nodes[k].collapsedUp = true; continue; }
        (byId[id].shareholders || []).forEach(function (s) {
          if (shF && !shF.has(s.id)) return;
          if (s.type === 'company') {
            if (!byId[s.person]) return;
            if (!nodes['co:' + s.person]) coNode(s.person, 'up');
            edge('co:' + s.person, k, s.pct);
            if (!su[s.person] && nodes['co:' + s.person].role === 'up') { su[s.person] = 1; qu.push(s.person); }
          } else if (s.person) {
            indNode(s.person, 'up'); edge('ind:' + s.person, k, s.pct);
          }
        });
      }
    }

    // Holdings below (all layers)
    if (showDown) {
      var qd = [cid], sd = {}; sd[cid] = 1;
      while (qd.length) {
        var id2 = qd.shift(), k2 = 'co:' + id2;
        if (id2 !== cid && coll[k2]) { nodes[k2].collapsedDown = true; continue; }
        (ctx.subsOf[id2] || []).forEach(function (x) {
          var sc = x.co; if (subF && !subF.has(sc.id)) return;
          var key = 'co:' + sc.id, existed = !!nodes[key];
          if (!existed) coNode(sc.id, 'down');
          edge(k2, key, x.sh.pct);
          if (!sd[sc.id] && nodes[key].role === 'down') { sd[sc.id] = 1; qd.push(sc.id); }
        });
      }
      // Every other owner of each holding — companies AND individuals (never hidden)
      Object.keys(nodes).forEach(function (k) {
        var n = nodes[k]; if (n.role !== 'down') return;
        (byId[n.refId].shareholders || []).forEach(function (s) {
          if (s.type === 'company') {
            if (!byId[s.person]) return;
            if (!nodes['co:' + s.person]) coNode(s.person, 'co');
            edge('co:' + s.person, k, s.pct);
          } else if (s.person) {
            if (!nodes['ind:' + s.person]) indNode(s.person, 'co');
            edge('ind:' + s.person, k, s.pct);
          }
        });
      });
      // Co-owners' own owners: draw the line if that owner is already on the chart,
      // otherwise note it on the card so nothing is silently dropped.
      Object.keys(nodes).forEach(function (k) {
        var n = nodes[k]; if (n.role !== 'co' || !n.coId) return;
        var notes = [];
        (byId[n.refId].shareholders || []).forEach(function (s) {
          var ok = s.type === 'company' ? 'co:' + s.person : 'ind:' + s.person;
          if (nodes[ok]) edge(ok, k, s.pct);
          else notes.push((s.type === 'company' ? cname(s.person) : s.person) + (fmtPct(s.pct) ? ' ' + fmtPct(s.pct) : ''));
        });
        if (notes.length) n.ownerNote = L('ownedBy') + ': ' + notes.join(', ');
      });
    }

    // Co-owners with stakes in many entities across the chart (e.g. Amerouge's 2% in
    // two dozen LLCs): show a small labelled reference box directly above each entity
    // it co-owns instead of dozens of long crossing lines. Same entity, same colour;
    // hovering one highlights all of them.
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (n.role !== 'co') return;
      var outs = edges.filter(function (e) { return e.from === k; });
      if (outs.length < C.CHIP_MIN) return;
      // only when its stakes are spread across different ownership families
      var fam = {};
      outs.forEach(function (e) {
        var best = null;
        edges.forEach(function (x) { if (x.to === e.to && x.from !== k && (best == null || (+x.pct || 0) > (+best.pct || 0))) best = x; });
        fam[best ? best.from : '-'] = 1;
      });
      if (Object.keys(fam).length < 3) return;
      delete nodes[k];
      edges = edges.filter(function (e) { return e.from !== k && e.to !== k; });
      outs.forEach(function (e, i) {
        var rk = 'ref:' + k + '>' + e.to;
        add(rk, { kind: n.kind, role: 'co', etype: n.etype, ref: true, entityKey: k, refCount: outs.length, refId: n.refId, coId: n.coId,
          name: n.name, jur: n.jur, status: n.status, ownerNote: n.ownerNote, sub: '' });
        edge(rk, e.to, e.pct);
      });
    });
    seenE = {}; edges.forEach(function (e) { seenE[e.from + '|' + e.to] = 1; });

    // Investments of the selected company and everything below it
    if (showInv) {
      var holders = Object.keys(nodes).filter(function (k) { var n = nodes[k]; return n.coId && (n.role === 'down' || n.role === 'focal') && !n.collapsedDown; });
      var byInv = {};
      holders.forEach(function (hk) {
        companyInvestments(nodes[hk].refId).forEach(function (inv) {
          if (invF && !invF.has(inv.id)) return;
          (byInv[inv.id] = byInv[inv.id] || { inv: inv, h: [] }).h.push(hk);
        });
      });
      var pf = {};
      Object.keys(byInv).forEach(function (iid) {
        var r = byInv[iid];
        if (r.h.length > 1) {
          add('inv:' + iid, { kind: 'investment', role: 'down', etype: 'investment', refId: iid, coId: null, name: r.inv.name, jur: '', sub: r.inv.type || '' });
          r.h.forEach(function (hk) { edge(hk, 'inv:' + iid, null); });
        } else (pf[r.h[0]] = pf[r.h[0]] || []).push(r.inv);
      });
      Object.keys(pf).forEach(function (hk) {
        var list = pf[hk];
        if (list.length === 1) {
          var inv = list[0];
          add('inv:' + inv.id, { kind: 'investment', role: 'down', etype: 'investment', refId: inv.id, coId: null, name: inv.name, jur: '', sub: inv.type || '' });
          edge(hk, 'inv:' + inv.id, null);
        } else {
          var names = list.map(function (i) { return i.name; }).sort(function (a, b) { return a.localeCompare(b); });
          add('pf:' + nodes[hk].refId, { kind: 'investment', role: 'down', etype: 'portfolio', refId: nodes[hk].refId, coId: null,
            name: list.length + ' ' + L('portfolio').toLowerCase(), items: names, jur: '', sub: '' });
          edge(hk, 'pf:' + nodes[hk].refId, null);
        }
      });
    }

    // Hidden-by-collapse counts + which nodes can collapse
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k]; if (!n.coId || k === focalKey || n.role === 'co') return;
      if (n.role === 'down') {
        var cnt = countBelow(ctx, n.refId, showInv, subF);
        n.canCollapse = cnt > 0; if (n.collapsedDown) n.hiddenCount = cnt;
      } else if (n.role === 'up') {
        var c2 = countAbove(ctx, n.refId);
        n.canCollapse = c2 > 0; if (n.collapsedUp) n.hiddenCount = c2;
      }
    });
    return { nodes: nodes, edges: edges, focalKey: focalKey, rootId: cid };
  }
  function countBelow(ctx, id, withInv, subF) {
    var seen = {}, q = [id], n = 0; seen[id] = 1;
    if (withInv) n += companyInvestments(id).length;
    while (q.length) {
      var x = q.shift();
      (ctx.subsOf[x] || []).forEach(function (r) {
        if (seen[r.co.id] || (subF && !subF.has(r.co.id))) return;
        seen[r.co.id] = 1; n++; q.push(r.co.id);
        if (withInv) n += companyInvestments(r.co.id).length;
      });
    }
    return n;
  }
  function countAbove(ctx, id) {
    var seen = {}, q = [id], n = 0; seen[id] = 1;
    while (q.length) {
      var c = ctx.byId[q.shift()]; if (!c) continue;
      (c.shareholders || []).forEach(function (s) {
        var k = s.type === 'company' ? s.person : 'i:' + s.person;
        if (seen[k]) return; seen[k] = 1; n++;
        if (s.type === 'company' && ctx.byId[s.person]) q.push(s.person);
      });
    }
    return n;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2–5. LAYOUT
  // ════════════════════════════════════════════════════════════════════════
  function nodeHeight(n, print) {
    if (n.dummy) return 0;
    if (n.ref) return C.CHIP_H;
    if (n.etype === 'individual') return C.IND_H;
    if (n.etype === 'portfolio') {
      var shown = print ? n.items.length : Math.min(n.items.length, C.PF_MAX_SCREEN);
      return 50 + shown * C.PF_LINE + (n.items.length > shown ? C.PF_LINE : 0) + 10;
    }
    var h = C.H;
    if (n.ownerNote) h += 22;
    if (n.status === 'liquidation' || n.status === 'liquidated') h += 10;
    return h;
  }

  function layout(g, print) {
    var nodes = g.nodes, edges = g.edges, fk = g.focalKey;
    var keys = Object.keys(nodes);
    var out = {}, inn = {};
    edges.forEach(function (e) { (out[e.from] = out[e.from] || []).push(e); (inn[e.to] = inn[e.to] || []).push(e); });

    // -- cycles: DFS, mark back edges (roots first, then focal) -------------
    var st = {}, post = [];
    var starts = keys.filter(function (k) { return !(inn[k] || []).length; }).sort();
    starts.push(fk); keys.slice().sort().forEach(function (k) { starts.push(k); });
    function dfs(k) {
      st[k] = 1;
      (out[k] || []).forEach(function (e) { if (st[e.to] === 1) e.back = true; else if (!st[e.to]) dfs(e.to); });
      st[k] = 2; post.push(k);
    }
    starts.forEach(function (k) { if (!st[k]) dfs(k); });
    var topo = post.slice().reverse();

    // -- ranks ----------------------------------------------------------------
    var R = {}; R[fk] = 0;
    function isDown(k) { return nodes[k].role === 'down'; }
    topo.forEach(function (k) {
      if (!isDown(k)) return; var r = null;
      (inn[k] || []).forEach(function (e) { if (e.back) return; if ((isDown(e.from) || e.from === fk) && R[e.from] != null) r = Math.max(r == null ? -1e9 : r, R[e.from] + 1); });
      R[k] = r == null ? 1 : r;
    });
    for (var ti = topo.length - 1; ti >= 0; ti--) {
      var k0 = topo[ti]; if (isDown(k0) || k0 === fk) continue; var r0 = null;
      (out[k0] || []).forEach(function (e) { if (e.back) return; if (R[e.to] != null) r0 = Math.min(r0 == null ? 1e9 : r0, R[e.to] - 1); });
      R[k0] = r0 == null ? -1 : r0;
    }
    topo.forEach(function (k) {
      if (!isDown(k)) return;
      (inn[k] || []).forEach(function (e) { if (!e.back && R[e.from] != null && R[k] < R[e.from] + 1) R[k] = R[e.from] + 1; });
    });
    // -- wrap very wide rows: stagger entities that own nothing below them onto
    //    extra rows under their owners (lines still only run downward) ----------
    (function wrapRows() {
      var outDeg = {}, primary = {};
      edges.forEach(function (e) { if (!e.back) outDeg[e.from] = (outDeg[e.from] || 0) + 1; });
      keys.forEach(function (k) {
        var best = null;
        (inn[k] || []).forEach(function (e) { if (!e.back && (best == null || (+e.pct || 0) > (+best.pct || 0))) best = e; });
        primary[k] = best ? best.from : '';
      });
      function estW(k) {
        var n = nodes[k], inc = (inn[k] || []).filter(function (e) { return !e.back; }).length;
        return Math.max(n.ref ? C.CHIP_W : (n.etype === 'portfolio' ? C.PF_W : C.W), inc > 1 ? inc * C.PORT_SP + 16 : 0) + C.GAP;
      }
      var movedOnce = {};
      for (var guard = 0; guard < 40; guard++) {
        var rows = {};
        keys.forEach(function (k) { (rows[R[k]] = rows[R[k]] || []).push(k); });
        var changed = false;
        Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).some(function (r) {
          if (r <= 0) return false;
          var ks = rows[r], width = ks.reduce(function (t, k) { return t + estW(k); }, 0);
          if (width <= C.MAX_ROW_W) return false;
          var leaves = ks.filter(function (k) { return !outDeg[k] && nodes[k].role === 'down' && !movedOnce[k]; });
          if (leaves.length < 2) return false;
          var fixedW = width - leaves.reduce(function (t, k) { return t + estW(k); }, 0);
          var k2 = Math.min(Math.ceil(width / C.MAX_ROW_W), leaves.length);
          if (fixedW > C.MAX_ROW_W) k2 = Math.max(k2, 2);
          leaves.sort(function (a, b) { return (primary[a] < primary[b] ? -1 : primary[a] > primary[b] ? 1 : 0) || String(nodes[a].name).localeCompare(String(nodes[b].name)); });
          var moved = false;
          leaves.forEach(function (k, i) { movedOnce[k] = 1; var d = fixedW > C.MAX_ROW_W ? 1 + (i % (k2 - 1 || 1)) : i % k2; if (d) { R[k] += d; moved = true; } });
          if (moved) changed = true;
          return moved;
        });
        if (!changed) break;
      }
    })();
    for (var tj = topo.length - 1; tj >= 0; tj--) {
      var kk = topo[tj]; if (isDown(kk) || kk === fk) continue; var rr0 = null;
      (out[kk] || []).forEach(function (e) { if (!e.back && R[e.to] != null) rr0 = Math.min(rr0 == null ? 1e9 : rr0, R[e.to] - 1); });
      if (rr0 != null) R[kk] = rr0;
    }
    var minR = 1e9, maxR = -1e9;
    keys.forEach(function (k) { if (R[k] == null) R[k] = 0; minR = Math.min(minR, R[k]); maxR = Math.max(maxR, R[k]); });

    // -- virtual waypoints for lines that skip rows ----------------------------
    var V = {}; // all layout nodes (real + dummy)
    keys.forEach(function (k) { V[k] = { key: k, real: nodes[k], rank: R[k], dummy: false }; });
    var segs = []; // {a, b, e}  a in rank r, b in rank r+1
    var dn = 0;
    edges.forEach(function (e) {
      var a = e.from, b = e.to;
      if (e.back) { a = e.to; b = e.from; }
      if (R[b] <= R[a]) { e.skip = true; return; }
      var prev = a;
      for (var r = R[a] + 1; r < R[b]; r++) {
        var dk = '~' + (dn++);
        V[dk] = { key: dk, dummy: true, rank: r, edge: e };
        segs.push({ a: prev, b: dk, e: e }); prev = dk;
      }
      segs.push({ a: prev, b: b, e: e });
    });
    var up = {}, down = {};
    segs.forEach(function (s) { (down[s.a] = down[s.a] || []).push(s); (up[s.b] = up[s.b] || []).push(s); });

    // -- widths & heights --------------------------------------------------------
    Object.keys(V).forEach(function (k) {
      var v = V[k];
      if (v.dummy) { v.w = C.DUMMY_W; v.h = 0; return; }
      var n = v.real, inc = (up[k] || []).length;
      var base = n.ref ? C.CHIP_W : (n.etype === 'portfolio' ? C.PF_W : C.W);
      v.w = Math.max(base, inc > 1 ? inc * C.PORT_SP + 16 : 0);
      v.h = nodeHeight(n, print);
    });

    // -- ordering: barycenter sweeps, keep best -----------------------------------
    var layers = {};
    for (var rr = minR; rr <= maxR; rr++) layers[rr] = [];
    // initial order: DFS from focal outward (keeps families together)
    var seenO = {};
    function place0(k) { if (seenO[k]) return; seenO[k] = 1; layers[V[k].rank].push(k); }
    (function walk() {
      var q = [fk], visited = {}; visited[fk] = 1;
      while (q.length) {
        var k = q.shift(); place0(k);
        var nb = [];
        (down[k] || []).forEach(function (s) { nb.push(s.b); });
        (up[k] || []).forEach(function (s) { nb.push(s.a); });
        nb.forEach(function (x) { if (!visited[x]) { visited[x] = 1; q.push(x); } });
      }
      Object.keys(V).forEach(place0);
    })();
    function pos(layer) { var p = {}; layer.forEach(function (k, i) { p[k] = i; }); return p; }
    function crossings() {
      var total = 0;
      for (var r = minR; r < maxR; r++) {
        var pa = pos(layers[r]), pb = pos(layers[r + 1]), list = [];
        layers[r].forEach(function (k) { (down[k] || []).forEach(function (s) { list.push([pa[s.a], pb[s.b]]); }); });
        for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
          if ((list[i][0] - list[j][0]) * (list[i][1] - list[j][1]) < 0) total++;
        }
      }
      return total;
    }
    function sweep(dir) {
      var rs = [];
      if (dir > 0) for (var r = minR + 1; r <= maxR; r++) rs.push(r); else for (var r2 = maxR - 1; r2 >= minR; r2--) rs.push(r2);
      rs.forEach(function (r) {
        var ref = pos(layers[r - dir]), cur = pos(layers[r]);
        var bary = {};
        layers[r].forEach(function (k) {
          var nb = dir > 0 ? (up[k] || []).map(function (s) { return s.a; }) : (down[k] || []).map(function (s) { return s.b; });
          nb = nb.filter(function (x) { return ref[x] != null; });
          bary[k] = nb.length ? nb.reduce(function (t, x) { return t + ref[x]; }, 0) / nb.length : null;
        });
        // nodes without neighbours keep their slot
        var fixed = layers[r].map(function (k, i) { return bary[k] == null ? i : null; });
        var movable = layers[r].filter(function (k) { return bary[k] != null; })
          .sort(function (a, b) { return bary[a] - bary[b] || cur[a] - cur[b]; });
        var res = [], mi = 0;
        for (var i = 0; i < layers[r].length; i++) res.push(fixed[i] != null ? layers[r][i] : movable[mi++]);
        layers[r] = res;
      });
    }
    var best = null, bestC = Infinity;
    function snap() { var o = {}; Object.keys(layers).forEach(function (r) { o[r] = layers[r].slice(); }); return o; }
    var totalSegs = segs.length;
    var iters = totalSegs > 900 ? 4 : 10;
    for (var it = 0; it < iters; it++) {
      sweep(it % 2 === 0 ? 1 : -1);
      var cc = totalSegs > 1500 ? 0 : crossings();
      if (cc < bestC) { bestC = cc; best = snap(); }
      if (cc === 0) break;
    }
    if (best) layers = best;

    // -- x placement: exact least-squares with min separation (PAVA) ----------------
    function sep(a, b) { var va = V[a], vb = V[b]; return (va.w + vb.w) / 2 + ((va.dummy || vb.dummy) ? C.DGAP : C.GAP); }
    function placeLayer(layer, want) {
      var n = layer.length; if (!n) return;
      var S = [0]; for (var i = 1; i < n; i++) S[i] = S[i - 1] + sep(layer[i - 1], layer[i]);
      var blocks = [];
      for (var j = 0; j < n; j++) {
        blocks.push({ sum: want[j] - S[j], cnt: 1, start: j });
        while (blocks.length > 1) {
          var b1 = blocks[blocks.length - 2], b2 = blocks[blocks.length - 1];
          if (b1.sum / b1.cnt <= b2.sum / b2.cnt) break;
          b1.sum += b2.sum; b1.cnt += b2.cnt; blocks.pop();
        }
      }
      blocks.forEach(function (b, bi) {
        var y = b.sum / b.cnt, end = bi + 1 < blocks.length ? blocks[bi + 1].start : n;
        for (var k = b.start; k < end; k++) V[layer[k]].x = y + S[k];
      });
    }
    Object.keys(layers).forEach(function (r) {
      var x = 0; layers[r].forEach(function (k, i) { if (i) x += sep(layers[r][i - 1], k); V[k].x = x; });
      var mid = x / 2; layers[r].forEach(function (k) { V[k].x -= mid; });
    });
    function wOf(s, towardsTarget) {
      if (V[s.a].dummy || V[s.b].dummy) return 3;          // keep long lines straight
      if (towardsTarget) return s.e.pct != null ? Math.max(+s.e.pct, 4) / 25 : 1; // sit under majority owner
      return 1;
    }
    function passX(dir) {
      var rs = [];
      if (dir > 0) for (var r = minR + 1; r <= maxR; r++) rs.push(r); else for (var r2 = maxR - 1; r2 >= minR; r2--) rs.push(r2);
      rs.forEach(function (r) {
        var layer = layers[r];
        var want = layer.map(function (k) {
          var list = dir > 0 ? (up[k] || []) : (down[k] || []);
          if (!list.length) return V[k].x;
          var sw = 0, sx = 0;
          list.forEach(function (s) { var o = dir > 0 ? s.a : s.b, w = wOf(s, dir > 0); sw += w; sx += w * V[o].x; });
          return sx / sw;
        });
        placeLayer(layer, want);
      });
    }
    for (var p = 0; p < 8; p++) { passX(1); passX(-1); }
    passX(1);

    // -- ports on the top edge of each owned card ------------------------------------
    segs.forEach(function (s) { s.sx = V[s.a].x; });
    Object.keys(V).forEach(function (k) {
      var list = up[k] || []; if (!list.length) return;
      var v = V[k];
      if (v.dummy || list.length === 1) { list.forEach(function (s) { s.px = v.x; }); return; }
      list.sort(function (s1, s2) { return V[s1.a].x - V[s2.a].x || (s1.a < s2.a ? -1 : 1); });
      var sp = Math.min(C.PORT_SP, (v.w - 24) / (list.length - 1));
      list.forEach(function (s, i) { s.px = v.x + (i - (list.length - 1) / 2) * sp; });
    });

    // snap a lone line onto its owner's centre when the port is only a few px off
    segs.forEach(function (s) {
      if ((down[s.a] || []).length !== 1 || Math.abs(s.px - s.sx) >= 6) return;
      var sibs = up[s.b] || [], tv = V[s.b];
      if (s.sx < tv.x - tv.w / 2 + 12 || s.sx > tv.x + tv.w / 2 - 12) return;
      if (sibs.some(function (o) { return o !== s && Math.abs(o.px - s.sx) < 40; })) return;
      s.px = s.sx;
    });
    // -- tracks: one horizontal lane per owner per gap -------------------------------
    var gaps = {};
    for (var r3 = minR; r3 < maxR; r3++) {
      var groups = {};
      layers[r3].forEach(function (k) {
        (down[k] || []).forEach(function (s) { (groups[k] = groups[k] || { src: k, sx: V[k].x, segs: [] }).segs.push(s); });
      });
      var G = Object.keys(groups).map(function (k) {
        var g1 = groups[k], xs = g1.segs.map(function (s) { return s.px; }).concat([g1.sx]);
        g1.l = Math.min.apply(null, xs); g1.r = Math.max.apply(null, xs);
        g1.straight = (g1.r - g1.l) < 0.5;
        return g1;
      });
      // ordering constraints: an owner's trunk that shares an x with another owner's
      // drop must use the higher lane, so the two verticals never overlap.
      var need = G.filter(function (g1) { return !g1.straight; });
      var before = {}; // g.src -> [g2.src that must be above g]
      G.forEach(function (h) {
        G.forEach(function (g1) {
          if (g1 === h) return;
          g1.segs.forEach(function (s) {
            if (Math.abs(s.px - h.sx) < 3) (before[g1.src] = before[g1.src] || []).push(h.src);
          });
        });
      });
      // Lane order that minimises crossings: for each pair of owners, compare the
      // crossings produced by "A above B" vs "B above A"; hard constraints (shared x)
      // cost 1000. Then stack: lane = 1 + highest lane of any earlier overlapping owner.
      function inside(x, g1) { return x > g1.l + 0.5 && x < g1.r - 0.5; }
      function mustAbove(a, b) { return (before[b.src] || []).indexOf(a.src) !== -1; }
      function cost(a, b) { // a above b
        var c = 0;
        a.segs.forEach(function (s) { if (inside(s.px, b)) c++; });
        if (inside(b.sx, a)) c++;
        if (mustAbove(b, a)) c += 1000;
        return c;
      }
      need.sort(function (a, b) { return (b.r - b.l) - (a.r - a.l) || a.l - b.l; });
      var ordered = [];
      need.forEach(function (g1) {
        var bestI = 0, bestC2 = Infinity;
        for (var i = 0; i <= ordered.length; i++) {
          var c = 0;
          for (var j = 0; j < ordered.length; j++) c += j < i ? cost(ordered[j], g1) : cost(g1, ordered[j]);
          if (c < bestC2) { bestC2 = c; bestI = i; }
        }
        ordered.splice(bestI, 0, g1);
      });
      var lanesN = 0;
      ordered.forEach(function (g1, i) {
        var lane = 0;
        for (var j = 0; j < i; j++) {
          var o = ordered[j];
          if (!(g1.r + 10 < o.l || g1.l - 10 > o.r) || mustAbove(o, g1)) lane = Math.max(lane, o.lane + 1);
        }
        g1.lane = lane; lanesN = Math.max(lanesN, lane + 1);
      });
      var lanes = new Array(lanesN);
      // straight lines: if a straight trunk shares x with another group's drop, give it a lane too
      G.forEach(function (g1) { if (g1.straight) g1.lane = null; });
      var hasPill = G.some(function (g1) { return g1.segs.some(function (s) { return !V[s.b].dummy && (s.e.pct != null); }); });
      gaps[r3] = { groups: G, lanes: lanes.length, hasPill: hasPill };
    }

    // -- y placement ------------------------------------------------------------------
    var rowTop = {}, rowH = {}, y = C.MARGIN + 8;
    for (var r4 = minR; r4 <= maxR; r4++) {
      rowTop[r4] = y;
      rowH[r4] = layers[r4].reduce(function (m, k) { return Math.max(m, V[k].h); }, 0);
      if (r4 < maxR) {
        var gp = gaps[r4];
        var gh = C.GAP_TOP + gp.lanes * C.TRACK_SP + C.GAP_MID + (gp.hasPill ? C.PILL_ZONE : C.GAP_NOPILL);
        gp.y0 = y + rowH[r4]; gp.trackY0 = gp.y0 + C.GAP_TOP;
        y += rowH[r4] + Math.max(gh, 48);
      } else y += rowH[r4];
    }
    Object.keys(V).forEach(function (k) { var v = V[k]; v.top = rowTop[v.rank]; v.bottom = v.top + v.h; });
    var minX = Infinity, maxX = -Infinity;
    Object.keys(V).forEach(function (k) { var v = V[k]; minX = Math.min(minX, v.x - v.w / 2); maxX = Math.max(maxX, v.x + v.w / 2); });
    var shift = C.MARGIN - minX;
    Object.keys(V).forEach(function (k) { V[k].x += shift; });
    segs.forEach(function (s) { s.px += shift; s.sx += shift; });
    Object.keys(gaps).forEach(function (r) { gaps[r].groups.forEach(function (g1) { g1.sx += shift; g1.l += shift; g1.r += shift; }); });

    return { V: V, segs: segs, gaps: gaps, layers: layers, width: Math.ceil(maxX - minX + 2 * C.MARGIN), height: Math.ceil(y + C.MARGIN), minR: minR, maxR: maxR, crossings: bestC };
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  function keyList(s) { return '|' + s.e.from + '|' + s.e.to + '|'; }
  function renderSVG(g, Lo) {
    var V = Lo.V, parts = [], halos = [], pills = [], dots = [];
    function line(d, keys, dashed, arrow) {
      halos.push('<path class="org2-halo" d="' + d + '"/>');
      parts.push('<path class="org2-e' + (dashed ? ' org2-back' : '') + '" data-k="' + E(keys) + '" d="' + d + '"' + (arrow ? ' marker-end="url(#org2-arrow)"' : '') + '/>');
    }
    Object.keys(Lo.gaps).forEach(function (r) {
      var gp = Lo.gaps[r];
      gp.groups.forEach(function (grp) {
        var src = V[grp.src];
        var ty = grp.lane == null ? null : gp.trackY0 + grp.lane * C.TRACK_SP;
        var allKeys = '|' + grp.segs.map(function (s) { return s.e.from + '|' + s.e.to; }).join('|') + '|';
        var anyBack = grp.segs.every(function (s) { return s.e.back; });
        var y1 = src.dummy ? src.top : src.bottom;
        if (ty == null) {
          // straight down (single target directly below)
          grp.segs.forEach(function (s) {
            var tgt = V[s.b], y2 = tgt.dummy ? tgt.top : tgt.top - 1;
            line('M' + r1(s.px) + ' ' + r1(y1) + 'V' + r1(y2), keyList(s), s.e.back, !tgt.dummy);
            addPill(s, tgt);
          });
          return;
        }
        // trunk + lane
        line('M' + r1(grp.sx) + ' ' + r1(y1) + 'V' + r1(ty) + (grp.l < grp.sx - 0.5 ? 'M' + r1(grp.sx) + ' ' + r1(ty) + 'H' + r1(grp.l) : '') + (grp.r > grp.sx + 0.5 ? 'M' + r1(grp.sx) + ' ' + r1(ty) + 'H' + r1(grp.r) : ''), allKeys, anyBack, false);
        grp.segs.forEach(function (s) {
          var tgt = V[s.b], y2 = tgt.dummy ? tgt.top : tgt.top - 1;
          line('M' + r1(s.px) + ' ' + r1(ty) + 'V' + r1(y2), keyList(s), s.e.back, !tgt.dummy);
          if (s.px > grp.l + 0.5 && s.px < grp.r - 0.5) dots.push('<circle class="org2-dot" data-k="' + E(keyList(s)) + '" cx="' + r1(s.px) + '" cy="' + r1(ty) + '" r="2.6"/>');
          addPill(s, tgt);
        });
        if (grp.sx > grp.l + 0.5 && grp.sx < grp.r - 0.5) dots.push('<circle class="org2-dot" data-k="' + E(allKeys) + '" cx="' + r1(grp.sx) + '" cy="' + r1(ty) + '" r="2.6"/>');
      });
    });
    function addPill(s, tgt) {
      if (tgt.dummy) return;
      var t = fmtPct(s.e.pct); if (t == null) return;
      if (s.e.back) t = '↑ ' + t;
      var pw = t.length * 6.4 + 14, ph = 17, cx = s.px, cy = tgt.top - C.PILL_ZONE / 2 - 3;
      pills.push('<g class="org2-pill" data-k="' + E(keyList(s)) + '"><rect x="' + r1(cx - pw / 2) + '" y="' + r1(cy - ph / 2) + '" width="' + r1(pw) + '" height="' + ph + '" rx="8.5"/><text x="' + r1(cx) + '" y="' + r1(cy + 4) + '" text-anchor="middle">' + E(t) + '</text></g>');
    }
    return '<svg class="org-static-edges org2-svg" width="' + Lo.width + '" height="' + Lo.height + '" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">'
      + '<defs><marker id="org2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="org2-arrowhead"/></marker></defs>'
      + '<g>' + halos.join('') + '</g><g>' + parts.join('') + '</g><g>' + dots.join('') + '</g><g>' + pills.join('') + '</g></svg>';
  }
  function r1(v) { return Math.round(v * 10) / 10; }

  function typeLabel(n) {
    if (n.etype === 'portfolio') return L('portfolio');
    return L(n.etype);
  }
  function cardHTML(g, n, v, print) {
    if (n.ref) {
      var colr = TYPE_COL[n.etype] || TYPE_COL.company;
      var st = 'left:' + r1(v.x - v.w / 2) + 'px;top:' + r1(v.top) + 'px;width:' + r1(v.w) + 'px;height:' + r1(v.h) + 'px;margin:0;border-color:' + colr.c + ';background:' + colr.bg + ';';
      var tip = n.name + ' — ' + L('coOwnerOf').replace('{n}', n.refCount) + (n.ownerNote ? ' · ' + n.ownerNote : '');
      return '<div class="org-card org-card-abs org2-card org2-ref org2-t-' + n.etype + (n.coId ? ' clickable' : '') + '" data-node-key="' + E(n.key) + '" data-entity="' + E(n.entityKey) + '" style="' + st + '"' + (n.coId ? ' onclick="openCompany(' + JQ(n.coId) + ')"' : '') + ' title="' + E(tip) + '">'
        + '<div class="org-card-label" style="color:' + colr.c + '">' + E(L(n.etype)) + ' · ×' + n.refCount + '</div>'
        + '<div class="org-card-name" style="color:' + colr.c + '">' + E(n.name) + '</div></div>';
    }
    var col = TYPE_COL[n.etype] || TYPE_COL.company, cur = n.key === g.focalKey;
    var cls = 'org-card org-card-abs org2-card org2-t-' + n.etype + (n.coId && !cur ? ' clickable' : '') + (cur ? ' current' : '');
    var click = (n.coId && !cur) ? ' onclick="openCompany(' + JQ(n.coId) + ')"' : '';
    var style = 'left:' + r1(v.x - v.w / 2) + 'px;top:' + r1(v.top) + 'px;width:' + r1(v.w) + 'px;height:' + r1(v.h) + 'px;margin:0;border-color:' + col.c + ';background:' + col.bg + ';';
    var label = typeLabel(n) + (n.jur ? ' · ' + n.jur : '');
    var h = '<div class="' + cls + '" data-node-key="' + E(n.key) + '" style="' + style + '"' + click + ' title="' + E(n.name + (n.jur ? ' — ' + n.jur : '') + (n.ownerNote ? '\n' + n.ownerNote : '')) + '">';
    if (cur) h += '<div class="org2-selected-tag">' + E(L('selected')) + '</div>';
    h += '<div class="org-card-label" style="color:' + col.c + '">' + E(label) + '</div>';
    if (n.etype === 'portfolio') {
      var shown = print ? n.items.length : Math.min(n.items.length, C.PF_MAX_SCREEN);
      h += '<div class="org-card-name" style="color:' + col.c + '">' + E(n.name) + '</div><ul class="org2-pf">';
      for (var i = 0; i < shown; i++) h += '<li>' + E(n.items[i]) + '</li>';
      if (n.items.length > shown) h += '<li class="org2-more">+' + (n.items.length - shown) + ' ' + E(L('more')) + '</li>';
      h += '</ul>';
    } else {
      h += '<div class="org-card-name" style="color:' + col.c + '">' + E(n.name) + '</div>';
      if (n.etype === 'investment' && n.sub) h += '<div class="org-card-sub">' + E(n.sub) + '</div>';
      if (n.ownerNote) h += '<div class="org-card-sub org2-note">' + E(n.ownerNote) + '</div>';
      if (n.status === 'liquidation') h += '<div class="org2-status">' + E(L('inLiq')) + '</div>';
      if (n.status === 'liquidated') h += '<div class="org2-status">' + E(L('liquidated')) + '</div>';
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
    var present = {};
    Object.keys(g.nodes).forEach(function (k) { present[g.nodes[k].etype] = true; });
    var order = ['individual', 'trust', 'holding', 'company', 'investment', 'portfolio'];
    var h = '<div class="org-legend org2-legend">';
    order.forEach(function (t) {
      if (!present[t] || (t === 'portfolio' && present.investment)) return;
      var col = TYPE_COL[t];
      h += '<span class="org2-lg"><i style="background:' + col.bg + ';border-color:' + col.c + '"></i>' + E(t === 'portfolio' ? L('investment') : L(t)) + '</span>';
    });
    h += '<span class="org2-lg"><i class="org2-lg-sel"></i>' + E(L('selected')) + '</span>';
    var hasRef = Object.keys(g.nodes).some(function (k) { return g.nodes[k].ref; });
    h += '<span class="org2-lg org2-lg-line">' + E(L('lineLegend')) + (g.edges.some(function (e) { return e.back; }) ? ' · ' + E(L('circular')) : '') + (hasRef ? '<br>' + E(L('refLegend')) : '') + '</span>';
    return h + '</div>';
  }

  function renderGraph(g, print) {
    var Lo = layout(g, print);
    var cards = [];
    Object.keys(g.nodes).forEach(function (k) { cards.push(cardHTML(g, g.nodes[k], Lo.V[k], print)); });
    var tree = '<div class="org-chart-tree org2-tree" data-root="' + E(g.rootId) + '" data-big="' + (Object.keys(g.nodes).length > C.AUTO_MAX_CARDS || g.hiddenTotal ? 1 : 0) + '" data-hidden="' + (g.hiddenTotal || 0) + '" data-w="' + Lo.width + '" data-h="' + Lo.height + '" style="position:relative;width:' + Lo.width + 'px;height:' + Lo.height + 'px;margin:0 auto">'
      + renderSVG(g, Lo) + cards.join('') + '</div>';
    var h = '<div class="org-chart-scroll org2-scroll" data-static-edges="1"><div style="font-family:system-ui,sans-serif">' + legendHTML(g) + tree + '</div></div>';
    return { html: h, layout: Lo };
  }

  // ── Auto-grouping for very large charts: collapse deepest levels first ──────
  function effectiveCollapsed(cid, opts, print) {
    if (print) return {};
    var s = collState(cid);
    if (s) return s.set;
    var set = {};
    var g = buildGraph(cid, Object.assign({}, opts, { collapsed: set }));
    if (!g) return set;
    function cnt(gr) { return Object.keys(gr.nodes).filter(function (k) { return !gr.nodes[k].ref; }).length; }
    var count = cnt(g);
    if (count > C.AUTO_MAX_CARDS) {
      var L0 = layout(g, false);
      var byRank = {};
      Object.keys(g.nodes).forEach(function (k) { var n = g.nodes[k]; if (n.role === 'down' && n.coId && n.canCollapse) (byRank[L0.V[k].rank] = byRank[L0.V[k].rank] || []).push(k); });
      var ranks = Object.keys(byRank).map(Number).filter(function (r) { return r >= 2; }).sort(function (a, b) { return b - a; });
      for (var i = 0; i < ranks.length && count > C.AUTO_MAX_CARDS; i++) {
        byRank[ranks[i]].forEach(function (k) { set[k] = true; });
        g = buildGraph(cid, Object.assign({}, opts, { collapsed: set }));
        count = cnt(g);
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
    s.auto = false;
    rerender(cid, btn);
  };
  window.orgExpandAll = function (cid, btn) { COLL[cid] = { set: {}, auto: false }; rerender(cid, btn); };
  window.orgAutoGroup = function (cid, btn) { delete COLL[cid]; rerender(cid, btn); };
  function rerender(cid, btn) {
    var host = btn && btn.closest ? btn.closest('.org-chart-card') : null;
    var settings = (typeof orgEnsureSettings === 'function') ? orgEnsureSettings(cid) : {};
    var keep = null;
    var vp = host && host.querySelector('.org-chart-viewport');
    if (vp && vp.__orgState) keep = { scale: vp.__orgState.scale, x: vp.__orgState.x, y: vp.__orgState.y };
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
      // Too big to read when shrunk: open at a readable zoom centred on the selected company
      st.scale = Math.max(Math.min(vw / cw, 1), C.MIN_READ_SCALE);
      var cur = canvas.querySelector('.org-card.current');
      var cx = cw / 2, cy = ch / 2;
      if (cur) {
        var tree = canvas.querySelector('.org-chart-tree'), off = 0, offY = 0, el = cur;
        cx = cur.offsetLeft + cur.offsetWidth / 2; cy = cur.offsetTop + cur.offsetHeight / 2;
        el = tree; while (el && el !== canvas) { off += el.offsetLeft || 0; offY += el.offsetTop || 0; el = el.offsetParent; }
        cx += off; cy += offY;
      }
      st.x = vw / 2 - cx * st.scale; st.y = vh * 0.42 - cy * st.scale;
      st.x = Math.min(st.x, 0); st.x = Math.max(st.x, vw - cw * st.scale);
      st.y = Math.min(st.y, 0); st.y = Math.max(st.y, Math.min(0, vh - ch * st.scale));
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
      var cid = tree.getAttribute('data-root');
      var anyClosed = !!vp.querySelector('.org2-tg.closed');
      var bar = document.createElement('div');
      bar.className = 'org2-bar';
      var hidden = +tree.getAttribute('data-hidden') || 0;
      if (anyClosed) bar.innerHTML = '<button type="button" onclick="orgExpandAll(' + JQ(cid) + ',this)">' + E(L('expandAll')) + (hidden ? ' (' + hidden + ' ' + E(L('hidden')) + ')' : '') + '</button>';
      else if (tree.getAttribute('data-big') === '1' && vp.querySelector('.org2-tg')) bar.innerHTML = '<button type="button" onclick="orgAutoGroup(' + JQ(cid) + ',this)">' + E(L('collapseAll')) + '</button>';
      if (bar.innerHTML) { bar.addEventListener('mousedown', function (e) { e.stopPropagation(); }); vp.appendChild(bar); }
    });
  };

  // ── Hover: highlight one entity's ownership lines ──────────────────────────
  function hl(card, on) {
    var tree = card.closest('.org2-tree'); if (!tree) return;
    var key = card.getAttribute('data-node-key');
    var ent = card.getAttribute('data-entity');
    var sameKeys = {}; sameKeys[key] = 1;
    if (ent) tree.querySelectorAll('[data-entity="' + ent.replace(/"/g, '\\"') + '"]').forEach(function (c) { sameKeys[c.getAttribute('data-node-key')] = 1; });
    tree.classList.toggle('org2-dim', on);
    tree.querySelectorAll('.org2-e,.org2-pill,.org2-dot').forEach(function (p) {
      var dk = p.getAttribute('data-k') || '';
      p.classList.toggle('hl', on && Object.keys(sameKeys).some(function (sk) { return dk.indexOf('|' + sk + '|') !== -1; }));
    });
    tree.querySelectorAll('.org2-card').forEach(function (c) { c.classList.remove('org2-hl'); });
    if (on) {
      var rel = Object.assign({}, sameKeys);
      tree.querySelectorAll('.org2-e.hl').forEach(function (p) { (p.getAttribute('data-k') || '').split('|').forEach(function (k) { if (k) rel[k] = 1; }); });
      tree.querySelectorAll('.org2-card').forEach(function (c) { if (rel[c.getAttribute('data-node-key')]) c.classList.add('org2-hl'); });
    }
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
  var PAGE = { land: { w: 990, h: 700 }, port: { w: 730, h: 960 } }; // printable CSS px on Letter & A4 with 8 mm margins
  var MIN_PRINT_SCALE = 0.6;
  function printPlan(w, h) {
    var sl = Math.min(PAGE.land.w / w, PAGE.land.h / h), sp = Math.min(PAGE.port.w / w, PAGE.port.h / h);
    var land = sl >= sp, s = Math.min(Math.max(sl, sp), 1.25);
    if (s >= MIN_PRINT_SCALE) return { custom: false, land: land, zoom: s };
    var z = MIN_PRINT_SCALE, mm = 60; // 8mm margins ≈ 30px each side, plus a safety band
    return { custom: true, land: w >= h, zoom: z, pageW: Math.ceil(w * z * 1.03 + mm + 20), pageH: Math.ceil(h * z * 1.05 + mm + 40) };
  }
  function planText(p) {
    var pct = Math.round(p.zoom * 100);
    if (!p.custom) return L('pageStd').replace('{o}', L(p.land ? 'landscape' : 'portrait')).replace('{p}', pct);
    return L('pageCustom').replace('{w}', (p.pageW / 96).toFixed(1)).replace('{h}', (p.pageH / 96).toFixed(1)).replace('{p}', pct);
  }
  window.orgPrintSetup = function (root) {
    root.style.zoom = 1;
    var w = Math.max(root.scrollWidth, 1), h = Math.max(root.scrollHeight, 1);
    var p = printPlan(w, h);
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
      var w = scroll.offsetWidth, h = scroll.offsetHeight + 56; // + print header
      note.textContent = planText(printPlan(w, h));
    };
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  var css = ''
    + '.org2-tree .org2-card{box-sizing:border-box;padding:8px 10px;justify-content:flex-start;padding-top:12px;border-width:1.5px}'
    + '.org2-tree .org2-card.current{border-width:3px;border-color:var(--accent)!important;box-shadow:0 0 0 4px var(--accent-bg),var(--shadow-md)}'
    + '.org2-tree .org2-t-individual{border-radius:32px;justify-content:center;padding-top:8px}'
    + '.org2-tree .org2-ref{border-style:dashed!important;border-width:1.5px!important;padding:5px 8px!important;justify-content:center!important;box-shadow:none}'
    + '.org2-tree .org2-ref .org-card-name{font-size:11px;-webkit-line-clamp:2;line-height:1.2}.org2-tree .org2-ref .org-card-label{font-size:8.5px;margin-bottom:1px}'
    + '.org2-tree .org2-t-trust{border-style:double;border-width:4px}'
    + '.org2-tree .org2-t-portfolio,.org2-tree .org2-t-investment{border-style:dashed}'
    + '.org2-tree .org-card-name{-webkit-line-clamp:2;font-size:12.5px;line-height:1.25}'
    + '.org2-tree .org2-card>*{flex-shrink:0}'
    + '.org2-tree .org-card-label{font-size:9.5px;letter-spacing:.35px;opacity:.9}'
    + '.org2-tree .org2-note{white-space:normal;font-size:10px;line-height:1.2;color:var(--text2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '.org2-status{font-size:9.5px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.3px;margin-top:2px}'
    + '.org2-selected-tag{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:9px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:2px 8px;border-radius:10px;white-space:nowrap}'
    + '.org2-tree .org2-card.current{overflow:visible}'
    + '.org2-pf{list-style:none;margin:4px 0 0;padding:0;width:100%;text-align:left}'
    + '.org2-pf li{font-size:10.5px;line-height:15px;height:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text2)}'
    + '.org2-pf li:before{content:"• ";color:var(--coral)}.org2-pf li.org2-more{color:var(--text3);font-style:italic}.org2-pf li.org2-more:before{content:""}'
    + '.org2-svg .org2-halo{fill:none;stroke:var(--bg,#f0f2f8);stroke-width:5}'
    + '.org2-svg .org2-e{fill:none;stroke:#8e95b3;stroke-width:1.5;stroke-linejoin:round;transition:opacity .12s}'
    + '.org2-svg .org2-back{stroke-dasharray:5 4}'
    + '.org2-svg .org2-arrowhead{fill:#8e95b3}'
    + '.org2-svg .org2-dot{fill:#8e95b3}'
    + '.org2-svg .org2-pill rect{fill:var(--surface,#fff);stroke:#8e95b3;stroke-width:1}'
    + '.org2-svg .org2-pill text{font:600 10.5px system-ui,sans-serif;fill:var(--text,#1e2340)}'
    + '.org2-dim .org2-e:not(.hl),.org2-dim .org2-dot:not(.hl){opacity:.12}'
    + '.org2-dim .org2-pill:not(.hl){opacity:.2}'
    + '.org2-dim .org2-card:not(.org2-hl):not(:hover){opacity:.45}'
    + '.org2-svg .org2-e.hl{stroke:var(--accent);stroke-width:2.4}.org2-svg .org2-dot.hl{fill:var(--accent)}.org2-svg .org2-pill.hl rect{stroke:var(--accent);stroke-width:1.6}'
    + '.org2-tg{position:absolute;right:6px;font:700 10px system-ui,sans-serif;border:1px solid var(--border2);background:var(--surface);color:var(--text2);border-radius:9px;padding:1px 7px;cursor:pointer;line-height:15px}'
    + '.org2-tg-down{bottom:-9px}.org2-tg-up{top:-9px}.org2-tree .org2-card{overflow:visible}'
    + '.org2-tg.closed{background:var(--accent);color:#fff;border-color:var(--accent)}'
    + '.org2-tg:hover{border-color:var(--accent)}'
    + '.org2-legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:0 0 14px;font-size:11.5px;color:var(--text2);align-items:center}'
    + '.org2-lg{display:inline-flex;align-items:center;gap:5px;font-weight:600}'
    + '.org2-lg i{display:inline-block;width:14px;height:10px;border:1.5px solid;border-radius:3px}'
    + '.org2-lg i.org2-lg-sel{border:2.5px solid var(--accent);background:var(--surface)}'
    + '.org2-lg-line{font-weight:500;color:var(--text3);flex-basis:100%;justify-content:center}'
    + '.org2-bar{position:absolute;left:10px;bottom:10px;z-index:5}'
    + '.org2-bar button{font:600 12px system-ui,sans-serif;padding:6px 12px;border-radius:16px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;box-shadow:var(--shadow)}'
    + '.org2-bar button:hover{border-color:var(--accent);color:var(--accent)}'
    + '@media print{.org2-tg,.org2-bar{display:none!important}.org2-svg .org2-halo{stroke:#fff}}'
    + '#print-org-root .org2-svg .org2-halo,.print-preview-scale .org2-svg .org2-halo{stroke:#fff}';
  var s = document.createElement('style'); s.id = 'org2-style'; s.textContent = css; document.head.appendChild(s);
})();
