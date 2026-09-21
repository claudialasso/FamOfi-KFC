// FamOfi Registry — Patch: Portfolio Loan tab + Duplicate Investment guard
// Add to your repo and include in index.html:  <script src="patch.js"></script>
(function () {
  'use strict';

  var _origOpenCompany = null;

  function hookOpenCompany() {
    if (typeof window.openCompany !== 'function') return;
    _origOpenCompany = window.openCompany;
    window.openCompany = function (id) {
      _origOpenCompany(id);
      setTimeout(function () { _injectLoanTab(id); }, 80);
    };
  }

  window._injectLoanTab = function (id) {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    var tabs = overlay.querySelector('.tabs');
    if (!tabs || tabs.querySelector('#tab-loan-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'tab';
    btn.id = 'tab-loan-btn';
    btn.textContent = 'Portfolio Loan';
    btn.onclick = function () {
      tabs.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      overlay.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = 'none'; });
      var lp = document.getElementById('td-loan');
      if (lp) { lp.style.display = 'block'; _renderLoanPanel(id); }
    };
    tabs.appendChild(btn);
    if (!document.getElementById('td-loan')) {
      var panel = document.createElement('div');
      panel.className = 'tab-panel';
      panel.id = 'td-loan';
      panel.style.display = 'none';
      var firstPanel = overlay.querySelector('.tab-panel');
      if (firstPanel) firstPanel.parentNode.appendChild(panel);
    }
  };

  window._renderLoanPanel = function (id) {
    var panel = document.getElementById('td-loan');
    if (!panel) return;
    var c = (data.companies || []).find(function (x) { return x.id === id; });
    if (!c) return;
    if (!c.portfolioLoans) c.portfolioLoans = [];
    var admin = typeof isAdmin === 'function' && isAdmin();
    var h = '<div style="display:flex;justify-content:flex-end;margin-bottom:14px">';
    if (admin) h += '<button class="btn btn-primary btn-sm" onclick="_addLoanModal(\'' + id + '\')">+ Add Loan<\/button>';
    h += '<\/div>';
    if (!c.portfolioLoans.length) {
      h += '<div style="color:#aaa;text-align:center;padding:32px">No portfolio loans recorded.<\/div>';
    } else {
      h += '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="border-bottom:2px solid #eee">';
      ['Lender','Type','Amount','Rate','Start','Maturity','Status',''].forEach(function(col){h+='<th style="text-align:left;padding:8px 6px;font-weight:600;color:#555">'+col+'<\/th>';});
      h += '<\/tr><\/thead><tbody>';
      c.portfolioLoans.forEach(function (loan) {
        var amt = loan.amount ? (loan.currency||'') + ' ' + Number(loan.amount).toLocaleString() : '-';
        h += '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:8px 6px">'+(loan.lender||'-')+'<\/td><td style="padding:8px 6px">'+(loan.type||'-')+'<\/td><td style="padding:8px 6px">'+amt+'<\/td><td style="padding:8px 6px">'+(loan.interestRate?loan.interestRate+'%':'-')+'<\/td><td style="padding:8px 6px">'+(loan.startDate||'-')+'<\/td><td style="padding:8px 6px">'+(loan.maturityDate||'-')+'<\/td><td style="padding:8px 6px"><span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:11px">'+(loan.status||'-')+'<\/span><\/td>';
        if (admin) { h += '<td style="padding:8px 6px;white-space:nowrap"><button class="btn btn-sm" style="margin-right:4px" onclick="_editLoanModal(\''+id+'\',\''+loan.id+'\')">Edit<\/button><button class="btn btn-sm" style="background:#fee;color:#c33;border:1px solid #fcc" onclick="_delLoan(\''+id+'\',\''+loan.id+'\')">×<\/button><\/td>'; } else h += '<td><\/td>';
        h += '<\/tr>';
      });
      h += '<\/tbody><\/table>';
    }
    panel.innerHTML = h;
  };

  function _showLoanForm(cid, lid) {
    var c = (data.companies||[]).find(function(x){return x.id===cid;});
    if (!c) return;
    if (!c.portfolioLoans) c.portfolioLoans = [];
    var loan = lid ? c.portfolioLoans.find(function(l){return l.id===lid;}) : null;
    var v = function(f){return loan?(loan[f]||''):''};
    function sel(field,opts){return opts.map(function(o){return '<option'+(v(field)===o?' selected':'')+'>'+o+'<\/option>';}).join('');}
    function row(lbl,inp){return '<label style="display:block;margin-bottom:10px;font-size:13px;font-weight:500;color:#444">'+lbl+'<br>'+inp+'<\/label>';}
    function inp(id,type,val){return '<input id="'+id+'" type="'+type+'" value="'+val+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px;box-sizing:border-box">';}
    function sel2(id,opts){return '<select id="'+id+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px;box-sizing:border-box">'+opts+'<\/select>';}
    var html='<div id="loan-modal-bg" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:14px;padding:28px;width:500px;max-width:94vw;max-height:88vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.18)"><h3 style="margin:0 0 18px;font-size:17px">'+(loan?'Edit':'Add')+' Portfolio Loan<\/h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'+row('Lender',inp('pl-lender','text',v('lender')))+row('Loan Type',sel2('pl-type',sel('type',['Term Loan','Revolving Credit','Bridge Loan','Mezzanine','Other'])))+row('Amount',inp('pl-amount','number',v('amount')))+row('Currency',sel2('pl-currency',sel('currency',['USD','EUR','UYU','PEN','CLP','GBP','Other'])))+row('Interest Rate (%)',inp('pl-rate','number',v('interestRate')))+row('Status',sel2('pl-status',sel('status',['Active','Paid Off','Defaulted','Restructured'])))+row('Start Date',inp('pl-start','date',v('startDate')))+row('Maturity Date',inp('pl-maturity','date',v('maturityDate')))+'<\/div>'+row('Notes','<textarea id="pl-notes" rows="2" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px;box-sizing:border-box">'+v('notes')+'<\/textarea>')+'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn" onclick="document.getElementById(\'loan-modal-bg\').remove()">Cancel<\/button><button class="btn btn-primary" onclick="_saveLoan(\''+cid+'\','+(lid?'\''+lid+'\'':'null')+')">Save<\/button><\/div><\/div><\/div>';
    document.body.insertAdjacentHTML('beforeend',html);
  }

  window._addLoanModal = function(id){_showLoanForm(id,null);};
  window._editLoanModal = function(id,lid){_showLoanForm(id,lid);};

  window._saveLoan = function(cid,lid){
    var c=(data.companies||[]).find(function(x){return x.id===cid;});
    if(!c)return;
    if(!c.portfolioLoans)c.portfolioLoans=[];
    var loan={id:lid||uid(),lender:document.getElementById('pl-lender').value.trim(),type:document.getElementById('pl-type').value,amount:parseFloat(document.getElementById('pl-amount').value)||0,currency:document.getElementById('pl-currency').value,interestRate:parseFloat(document.getElementById('pl-rate').value)||0,startDate:document.getElementById('pl-start').value,maturityDate:document.getElementById('pl-maturity').value,status:document.getElementById('pl-status').value,notes:document.getElementById('pl-notes').value.trim()};
    if(lid){var idx=c.portfolioLoans.findIndex(function(l){return l.id===lid;});if(idx>=0)c.portfolioLoans[idx]=loan;}else{c.portfolioLoans.push(loan);}
    save();
    document.getElementById('loan-modal-bg').remove();
    _renderLoanPanel(cid);
  };

  window._delLoan = function(cid,lid){
    if(!confirm('Delete this loan?'))return;
    var c=(data.companies||[]).find(function(x){return x.id===cid;});
    if(!c||!c.portfolioLoans)return;
    c.portfolioLoans=c.portfolioLoans.filter(function(l){return l.id!==lid;});
    save();
    _renderLoanPanel(cid);
  };

  var _origSaveInv=null;

  function hookSaveInv(){
    if(typeof window.saveInv!=='function')return;
    _origSaveInv=window.saveInv;
    window.saveInv=function(){
      var beforeIds=new Set((data.investments||[]).map(function(i){return i.id;}));
      _origSaveInv();
      var newInv=(data.investments||[]).find(function(i){return!beforeIds.has(i.id);});
      if(!newInv)return;
      var similar=(data.investments||[]).filter(function(i){return i.id!==newInv.id&&_simScore(i.name,newInv.name)>=0.7;});
      if(!similar.length)return;
      var matchLines=similar.map(function(m){return '  • '+m.name+(m.fund?' ['+m.fund+']':'');}).join('\n');
      var keep=confirm('⚠️ Possible duplicate investment\n\nThe investment "'+newInv.name+'" looks very similar to:\n\n'+matchLines+'\n\nDo you want to keep it?\nOK = Keep it   |   Cancel = Remove it');
      if(!keep){
        data.investments=(data.investments||[]).filter(function(i){return i.id!==newInv.id;});
        save();
        var invPanel=document.getElementById('td-inv');
        if(invPanel){invPanel.removeAttribute('data-built');if(typeof buildTabLazy==='function')buildTabLazy(invPanel);}
      }
    };
  }

  function _normInv(str){return(str||'').toLowerCase().replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();}

  function _simScore(a,b){
    var na=_normInv(a),nb=_normInv(b);
    if(!na||!nb)return 0;
    if(na===nb)return 1.0;
    if(na.indexOf(nb)!==-1||nb.indexOf(na)!==-1)return 0.9;
    var wa=na.split(' ').filter(function(w){return w.length>2;});
    var wb=new Set(nb.split(' ').filter(function(w){return w.length>2;}));
    var overlap=wa.filter(function(w){return wb.has(w);}).length;
    var total=Math.max(wa.length,wb.size,1);
    return overlap/total;
  }

  function hookOpenCompany2(){
    if(typeof window.openCompany==='function'&&typeof window.saveInv==='function'){hookOpenCompany();hookSaveInv();}else{setTimeout(hookOpenCompany2,200);}
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',hookOpenCompany2);}else{hookOpenCompany2();}
})();

// ── Patch #2: Print modal Chart Settings + Dynamic scale ──────────────────
// NOTE: openPrintConfig / orgPrintFilteredHTML / runOrgChartPrint are all defined
// inside a Firebase onAuthStateChanged callback in script.js, which fires AFTER
// our IIFE.  Direct window.X = ... overrides are therefore wiped out.
// Instead we:
//   (a) Watch the DOM for .print-cfg-grid to appear (MutationObserver), which
//       fires each time the print modal opens.
//   (b) Each time it opens, inject our Chart Settings panel and re-hook
//       runOrgChartPrint / orgPrintFilteredHTML for that session.
(function () {
  'use strict';

  // Helper: safely escape a string for insertion into HTML attribute single-quote context
  function _q(s){ return "'" + String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'") + "'"; }

  // Render investment list checkboxes wired to orgPrintToggleNode
  function _renderInvListForPrint(activeId, list, invIds) {
    var h = '';
    list.forEach(function (entry) {
      if (!entry.investments.length) return;
      if (entry.depth > 0) {
        h += '<div style="margin-left:'+(entry.depth*14)+'px;font-size:11.5px;color:var(--text3);margin-top:4px">'+esc(cname(entry.id))+'<\/div>';
      }
      entry.investments.forEach(function (inv) {
        var incl = !invIds || invIds.has(inv.id);
        h += '<label class="org-filter-option" style="padding:2px 2px;margin-left:'+((entry.depth*14)+14)+'px">'
          + '<input type="checkbox" '+(incl?'checked':'')+' onchange="orgPrintToggleNode('+_q(activeId)+',\'inv\','+_q(inv.id)+',this.checked)">'
          + ' <span style="font-size:12px">'+esc(inv.name)+'<\/span><\/label>';
      });
    });
    return h;
  }

  function _renderShTreeForPrint(activeId, tree, shIds, depth) {
    var h = '';
    tree.forEach(function (node) {
      var incl = !shIds || shIds.has(node.id);
      var label = node.type==='company' ? cname(node.person) : node.person;
      h += '<label class="org-filter-option" style="padding:2px 2px;margin-left:'+(depth*14)+'px">'
        + '<input type="checkbox" '+(incl?'checked':'')+' onchange="orgPrintToggleNode('+_q(activeId)+',\'sh\','+_q(node.id)+',this.checked)">'
        + ' <span style="font-size:12px">'+esc(label)+'<\/span><\/label>';
      if (node.children && node.children.length) h += _renderShTreeForPrint(activeId, node.children, shIds, depth+1);
    });
    return h;
  }

  function _renderSubTreeForPrint(activeId, tree, subIds, depth) {
    var h = '';
    tree.forEach(function (node) {
      var incl = !subIds || subIds.has(node.id);
      h += '<label class="org-filter-option" style="padding:2px 2px;margin-left:'+(depth*14)+'px">'
        + '<input type="checkbox" '+(incl?'checked':'')+' onchange="orgPrintToggleNode('+_q(activeId)+',\'sub\','+_q(node.id)+',this.checked)">'
        + ' <span style="font-size:12px">'+esc(node.name)+'<\/span><\/label>';
      if (node.children && node.children.length) h += _renderSubTreeForPrint(activeId, node.children, subIds, depth+1);
    });
    return h;
  }

  // Build the full Chart Settings HTML block for the print modal
  function _buildPrintChartSettings(id) {
    var st = orgEnsureSettings(id);
    var en = (typeof lang !== 'undefined' && lang === 'en');
    var h = '<div class="print-cfg-section">';
    h += '<div class="print-cfg-label">'+(en?'Chart Settings':'Configuración del Gráfico')+'<\/div>';

    // — Shareholders —
    h += '<label class="org-filter-option"><input type="checkbox" '+(st.shareholders?'checked':'')+' onchange="orgPrintSettingChanged('+_q(id)+',\'shareholders\',this.checked)"> <span>'+(en?'Show shareholders':'Mostrar accionistas')+'<\/span><\/label>';
    if (st.shareholders) {
      var shTree = orgBuildShTree(id);
      if (shTree.length) {
        h += '<div style="margin-left:18px;margin-top:2px">'+_renderShTreeForPrint(id, shTree, st.shIds, 0)+'<\/div>';
      } else {
        h += '<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'<\/div>';
      }
    }

    // — Subsidiaries —
    h += '<label class="org-filter-option"><input type="checkbox" '+(st.subsidiaries?'checked':'')+' onchange="orgPrintSettingChanged('+_q(id)+',\'subsidiaries\',this.checked)"> <span>'+(en?'Show subsidiaries':'Mostrar subsidiarias')+'<\/span><\/label>';
    if (st.subsidiaries) {
      var subTree = (typeof orgBuildSubTree === 'function') ? orgBuildSubTree(id) : [];
      if (subTree.length) {
        h += '<div style="margin-left:18px;margin-top:2px">'+_renderSubTreeForPrint(id, subTree, st.subIds, 0)+'<\/div>';
      } else {
        h += '<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'<\/div>';
      }
    }

    // — Investments —
    h += '<label class="org-filter-option"><input type="checkbox" '+(st.investments?'checked':'')+' onchange="orgPrintSettingChanged('+_q(id)+',\'investments\',this.checked)"> <span>'+(en?'Show investments':'Mostrar inversiones')+'<\/span><\/label>';
    if (st.investments) {
      var invList = orgBuildInvCompanyList(id).filter(function(e){ return e.investments.length; });
      if (invList.length) {
        h += '<div id="print-inv-detail" style="margin-left:18px;margin-top:2px">';
        h += '<div style="display:flex;gap:6px;margin-bottom:6px">'
          + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',true)">'+(en?'Select All':'Seleccionar Todo')+'<\/button>'
          + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',false)">'+(en?'Unselect All':'Deseleccionar Todo')+'<\/button>'
          + '<\/div>';
        h += _renderInvListForPrint(id, invList, st.invIds);
        h += '<\/div>';
      } else {
        h += '<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'<\/div>';
      }
    }

    h += '<\/div>';
    return h;
  }

  // Refresh just the settings panel inside the print modal
  function _refreshPrintSettingsPanel(id) {
    var wrap = document.getElementById('print-chart-settings-wrap');
    if (wrap) wrap.innerHTML = _buildPrintChartSettings(id);
  }

  // ── Public handlers called from inline onchange/onclick in the print modal ─

  window.orgPrintSettingChanged = function (id, field, val) {
    orgEnsureSettings(id)[field] = val;
    _refreshPrintSettingsPanel(id);
    if (typeof orgPrintRefreshPreview === 'function') orgPrintRefreshPreview();
  };

  window.orgPrintToggleNode = function (id, kind, nodeId, checked) {
    var st = orgEnsureSettings(id);
    var field, allItems;
    if (kind==='sh')       { field='shIds';  allItems=(typeof orgFlattenShIds==='function')?orgFlattenShIds(id):[]; }
    else if (kind==='sub') { field='subIds'; allItems=(typeof orgFlattenSubIds==='function')?orgFlattenSubIds(id):[]; }
    else                   { field='invIds'; allItems=(typeof orgFlattenInvIds==='function')?orgFlattenInvIds(id):[]; }
    if (!st[field]) st[field] = new Set(allItems);
    if (checked) st[field].add(nodeId); else st[field].delete(nodeId);
    if (allItems.length && st[field].size === allItems.length) st[field] = null;
    if (kind === 'inv') {
      var invWrap = document.getElementById('print-inv-detail');
      if (invWrap) {
        var invList = orgBuildInvCompanyList(id).filter(function(e){ return e.investments.length; });
        var en = (typeof lang !== 'undefined' && lang === 'en');
        var h = '<div style="display:flex;gap:6px;margin-bottom:6px">'
          + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',true)">'+(en?'Select All':'Seleccionar Todo')+'<\/button>'
          + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',false)">'+(en?'Unselect All':'Deseleccionar Todo')+'<\/button>'
          + '<\/div>';
        h += _renderInvListForPrint(id, invList, st.invIds);
        invWrap.innerHTML = h;
      }
    }
    if (typeof orgPrintRefreshPreview === 'function') orgPrintRefreshPreview();
  };

  window.orgPrintSelectAllInv = function (id, checked) {
    var st = orgEnsureSettings(id);
    st.invIds = checked ? null : new Set();
    var invWrap = document.getElementById('print-inv-detail');
    if (invWrap) {
      var invList = orgBuildInvCompanyList(id).filter(function(e){ return e.investments.length; });
      var en = (typeof lang !== 'undefined' && lang === 'en');
      var h = '<div style="display:flex;gap:6px;margin-bottom:6px">'
        + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',true)">'+(en?'Select All':'Seleccionar Todo')+'<\/button>'
        + '<button class="btn btn-outline btn-sm" style="font-size:11px;padding:2px 8px" onclick="orgPrintSelectAllInv('+_q(id)+',false)">'+(en?'Unselect All':'Deseleccionar Todo')+'<\/button>'
        + '<\/div>';
      h += _renderInvListForPrint(id, invList, st.invIds);
      invWrap.innerHTML = h;
    }
    if (typeof orgPrintRefreshPreview === 'function') orgPrintRefreshPreview();
  };

  // ── Filtered HTML builder (uses _orgSelSettings populated by our UI) ───────
  function _ourOrgPrintFilteredHTML() {
    if (!window._orgPrintCfg) return '';
    var cid = window._orgPrintCfg.companyId;
    var settings = (window._orgSelSettings && window._orgSelSettings[cid]) || {};

    var root = document.createElement('div');
    if (typeof buildFilteredOrgChart === 'function') {
      root.innerHTML = buildFilteredOrgChart(cid, settings);
    } else {
      // Fallback: use original if available
      if (typeof window._origOrgPrintFilteredHTML === 'function') {
        root.innerHTML = window._origOrgPrintFilteredHTML();
      }
    }

    var elColors = document.getElementById('print-opt-colors');
    var elLabels = document.getElementById('print-opt-labels');
    var elSub    = document.getElementById('print-opt-sub');
    var elLegend = document.getElementById('print-opt-legend');

    if (elLabels && !elLabels.checked) {
      Array.prototype.forEach.call(root.querySelectorAll('.org-card-label'), function(el){ el.style.display='none'; });
    }
    if (elSub && !elSub.checked) {
      Array.prototype.forEach.call(root.querySelectorAll('.org-card-sub'), function(el){ el.style.display='none'; });
    }
    var legendRow = root.querySelector('.org-legend');
    if (legendRow && elLegend && !elLegend.checked) legendRow.style.display='none';
    var scrollRoot = root.querySelector('.org-chart-scroll');
    if (scrollRoot) scrollRoot.classList.toggle('print-mono', !!(elColors && !elColors.checked));

    return root.innerHTML;
  }

  // ── Dynamic-scale print runner ─────────────────────────────────────────────
  function _ourRunOrgChartPrint() {
    if (!window._orgPrintCfg) return;
    var c = (window.data && data.companies || []).find(function(x){ return x.id===window._orgPrintCfg.companyId; });
    var filteredHTML = _ourOrgPrintFilteredHTML();
    var root = document.getElementById('print-org-root');
    if (!root) { root = document.createElement('div'); root.id = 'print-org-root'; document.body.appendChild(root); }
    root.style.zoom = 1;
    var headerName = c ? esc(c.name) : '';
    var headerJur  = c ? esc(c.jurisdiction||'') : '';
    root.innerHTML =
        '<div class="org-print-header">'
      +   '<div class="t1">'+headerName+' — '+(typeof t==='function'?t('orgChart'):'Org Chart')+'<\/div>'
      +   '<div class="t2">'+headerJur+' — FamOfi Registry — '+new Date().toLocaleDateString()+'<\/div>'
      + '<\/div>'
      + '<div id="print-org-canvas" class="org-print-canvas">'+filteredHTML+'<\/div>';

    var canvas = document.getElementById('print-org-canvas');
    if (typeof drawOrgChartConnectors === 'function') drawOrgChartConnectors(canvas);
    if (typeof window._fixEdgeFan === 'function') window._fixEdgeFan(canvas);

    var scroll = canvas.querySelector('.org-chart-scroll');
    if (scroll) {
      var pageW = 1040, pageH = 740;
      var w = Math.max(scroll.scrollWidth, scroll.offsetWidth, 1);
      var h = Math.max(scroll.scrollHeight, scroll.offsetHeight, 1);
      root.style.zoom = Math.min(pageW / w, pageH / h, 2.5);
    }

    if (typeof closeModal === 'function') closeModal();
    document.body.classList.add('printing-org');
    setTimeout(function(){ window.print(); }, 60);
  }

  // ── Inject Chart Settings into the print modal once it opens ─────────────
  function _injectPrintChartSettings(cid) {
    if (document.getElementById('print-chart-settings-wrap')) return; // already injected
    var cfgGrid = document.querySelector('.print-cfg-grid');
    if (!cfgGrid) return;
    var leftCol = cfgGrid.firstElementChild;
    if (!leftCol) return;

    // Hide "WHAT TO PRINT" section (radio buttons) — our Chart Settings replace it
    Array.prototype.forEach.call(leftCol.querySelectorAll('.print-cfg-section'), function(sec) {
      if (sec.querySelector('input[type="radio"]')) sec.style.display = 'none';
    });

    // Inject our Chart Settings at the top of the left column
    var wrap = document.createElement('div');
    wrap.id = 'print-chart-settings-wrap';
    leftCol.insertBefore(wrap, leftCol.firstChild);
    wrap.innerHTML = _buildPrintChartSettings(cid);

    // Re-hook the print-action functions (overwrite whatever Firebase set)
    window.orgPrintFilteredHTML = _ourOrgPrintFilteredHTML;
    window.runOrgChartPrint     = _ourRunOrgChartPrint;

    // Refresh live preview if available
    if (typeof orgPrintRefreshPreview === 'function') orgPrintRefreshPreview();
  }

  // ── Watch DOM for the print-cfg-grid to appear (works regardless of how
  //    openPrintConfig / showModal are called internally) ────────────────────
  function _startPrintModalWatcher() {
    if (window._printModalWatcherActive) return;
    window._printModalWatcherActive = true;
    var observer = new MutationObserver(function() {
      // Only act if the print modal is open and not yet patched
      if (document.getElementById('print-chart-settings-wrap')) return;
      var cfgGrid = document.querySelector('.print-cfg-grid');
      if (!cfgGrid) return;
      var cfg = window._orgPrintCfg;
      if (!cfg || !cfg.companyId) return;
      _injectPrintChartSettings(cfg.companyId);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startPrintModalWatcher);
  } else {
    _startPrintModalWatcher();
  }

})();

// ── Patch #3: LLC org chart line separation ───────────────────────────────
// Fixes overlapping connector lines when multiple shareholders/owners share
// the same x-column in the org chart (common with LLC structures).
(function () {
  'use strict';

  /**
   * Fan out SVG paths that converge at the same card entry/exit point.
   *
   * orgEdgePath draws L-shaped paths: M x1 y1 → L x1 midY → L x2 midY → L x2 y2
   * When multiple paths share the same x2 (bottom endpoint), they overlap and
   * look like a single line.  This post-processor offsets them left/right so
   * each connection is visually distinct.
   *
   * @param {Element} container  — DOM element that contains the org chart
   *                               (an .org-chart-scroll or its parent)
   */
  function fixEdgeFan(container) {
    var svg = container.querySelector('svg');
    if (!svg) return;
    var pathEls = Array.prototype.slice.call(svg.querySelectorAll('path[d]'));
    if (!pathEls.length) return;

    // Parse the 4-point path: M x1 y1 L xm1 ym1 L xm2 ym2 L x2 y2
    var parsed = [];
    var re = /M\s*([\-\d.]+)\s+([\-\d.]+)\s+L\s*([\-\d.]+)\s+([\-\d.]+)\s+L\s*([\-\d.]+)\s+([\-\d.]+)\s+L\s*([\-\d.]+)\s+([\-\d.]+)/;
    pathEls.forEach(function (el) {
      var m = (el.getAttribute('d') || '').match(re);
      if (!m) return;
      parsed.push({
        el:  el,
        x1:  +m[1], y1:  +m[2],
        xm1: +m[3], ym1: +m[4],
        xm2: +m[5], ym2: +m[6],
        x2:  +m[7], y2:  +m[8]
      });
    });
    if (!parsed.length) return;

    var STEP = 8; // pixels between adjacent fan lines

    // ── Fan paths converging at the SAME BOTTOM POINT ────────────────────
    // (multiple shareholders → one company)
    var byBot = {};
    parsed.forEach(function (p) {
      var k = Math.round(p.x2) + ',' + Math.round(p.y2);
      (byBot[k] = byBot[k] || []).push(p);
    });
    Object.keys(byBot).forEach(function (k) {
      var g = byBot[k];
      if (g.length < 2) return;
      var half = (g.length - 1) * STEP / 2;
      g.forEach(function (p, i) {
        var ox = i * STEP - half;
        // Shift the bottom vertical segment (xm2 → x2) by ox
        p.el.setAttribute('d',
          'M ' + p.x1  + ' ' + p.y1  +
          ' L ' + p.xm1 + ' ' + p.ym1 +
          ' L ' + (p.xm2 + ox) + ' ' + p.ym2 +
          ' L ' + (p.x2  + ox) + ' ' + p.y2);
      });
    });

    // ── Fan paths diverging from the SAME TOP POINT ───────────────────────
    // (one company → multiple subsidiaries/investments)
    var byTop = {};
    parsed.forEach(function (p) {
      var k = Math.round(p.x1) + ',' + Math.round(p.y1);
      (byTop[k] = byTop[k] || []).push(p);
    });
    Object.keys(byTop).forEach(function (k) {
      var g = byTop[k];
      if (g.length < 2) return;
      var half = (g.length - 1) * STEP / 2;
      g.forEach(function (p, i) {
        var ox = i * STEP - half;
        // Re-read 'd' — the byBot pass may have already modified it
        var d = p.el.getAttribute('d') || '';
        var m = d.match(re);
        if (!m) return;
        // Shift the top vertical segment (x1 → xm1) by ox
        p.el.setAttribute('d',
          'M ' + (+m[1] + ox) + ' ' + m[2] +
          ' L ' + (+m[3] + ox) + ' ' + m[4] +
          ' L ' + m[5] + ' ' + m[6] +
          ' L ' + m[7] + ' ' + m[8]);
      });
    });

    // ── Pass 3: Stagger midY for paths that share the same rank-transition
    //    band but target DIFFERENT destination columns.
    //
    //    Problem: when Carlos Montufar (rank -2) → Amerouge (rank -1) and
    //    five Trusts (rank -2) → HF Invest (rank -1) all use midY = 320,
    //    their horizontal segments overlap.  Specifically, Mykonos Trust's
    //    downward vertical at x=700 meets Carlos's rightward horizontal at
    //    y=320 and x=700, creating a T-junction that makes it look like
    //    Mykonos Trust is connected to Amerouge.
    //
    //    Fix: group paths by (y1, y2) rank-transition range and destination
    //    column cluster (nearest 100 px).  When paths in different clusters
    //    have overlapping x-spans (proof they can visually merge), assign
    //    each cluster a slightly different midY so their horizontal segments
    //    never coincide.
    var STEP_Y = 14; // px between midY lanes
    var byRange = {};
    pathEls.forEach(function (el) {
      var m = (el.getAttribute('d') || '').match(re);
      if (!m) return;
      // Cluster destination x to nearest 100 px (groups same-card arrivals
      // even after the byBot fan shifted them by ±STEP pixels).
      var x2c = Math.round(+m[7] / 100) * 100;
      var rk  = Math.round(+m[2]) + ',' + Math.round(+m[8]);
      if (!byRange[rk]) byRange[rk] = {};
      if (!byRange[rk][x2c]) byRange[rk][x2c] = [];
      byRange[rk][x2c].push(el);
    });
    Object.keys(byRange).forEach(function (rk) {
      var clusters = byRange[rk];
      var ckNums   = Object.keys(clusters).map(Number).sort(function (a, b) { return a - b; });
      if (ckNums.length < 2) return; // only one destination column — nothing to separate

      // Compute the full x-span (min source x to max dest x) for each cluster.
      var clusterInfo = ckNums.map(function (ck) {
        var xMin = Infinity, xMax = -Infinity;
        clusters[ck].forEach(function (el) {
          var m = (el.getAttribute('d') || '').match(re);
          if (!m) return;
          var xa = +m[1], xb = +m[7];
          if (xa < xMin) xMin = xa; if (xa > xMax) xMax = xa;
          if (xb < xMin) xMin = xb; if (xb > xMax) xMax = xb;
        });
        return { ck: ck, xMin: xMin, xMax: xMax };
      });

      // Only stagger when paths from different clusters actually overlap in x
      // (if they don't overlap they can't look merged, so leave them alone).
      var needsSep = false;
      for (var ci = 0; ci < clusterInfo.length && !needsSep; ci++) {
        for (var cj = ci + 1; cj < clusterInfo.length && !needsSep; cj++) {
          if (clusterInfo[ci].xMin <= clusterInfo[cj].xMax &&
              clusterInfo[cj].xMin <= clusterInfo[ci].xMax) needsSep = true;
        }
      }
      if (!needsSep) return;

      var nC = ckNums.length;
      ckNums.forEach(function (ck, gi) {
        var yOff = (gi - (nC - 1) / 2) * STEP_Y;
        clusters[ck].forEach(function (el) {
          var m = (el.getAttribute('d') || '').match(re);
          if (!m) return;
          var newMid = +m[4] + yOff;
          el.setAttribute('d',
            'M ' + m[1] + ' ' + m[2] +
            ' L ' + m[3] + ' ' + newMid +
            ' L ' + m[5] + ' ' + newMid +
            ' L ' + m[7] + ' ' + m[8]);
        });
      });
    });
  }

  // Expose globally so runOrgChartPrint (Patch #2) can call it after
  // drawOrgChartConnectors adds any extra paths.
  window._fixEdgeFan = fixEdgeFan;

  // Hook orgRenderGraphHTML so the fix applies automatically in the normal
  // org chart view (and transitively in orgPrintFilteredHTML, which calls it).
  function hookRenderGraph() {
    if (typeof window.orgRenderGraphHTML !== 'function') {
      setTimeout(hookRenderGraph, 100);
      return;
    }
    var _orig = window.orgRenderGraphHTML;
    window.orgRenderGraphHTML = function (nodes, edges, focalKey) {
      var html = _orig.apply(this, arguments);
      // Post-process in a detached element so we can manipulate SVG paths
      // before the HTML is inserted into the live DOM.
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      fixEdgeFan(tmp);
      return tmp.innerHTML;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookRenderGraph);
  } else {
    hookRenderGraph();
  }

})()
