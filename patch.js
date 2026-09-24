// FamOfi Registry â Patch: Portfolio Loan tab + Duplicate Investment guard
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
        if (admin) { h += '<td style="padding:8px 6px;white-space:nowrap"><button class="btn btn-sm" style="margin-right:4px" onclick="_editLoanModal(\''+id+'\',\''+loan.id+'\')">Edit<\ï¿½button><button class="btn btn-sm" style="background:#fee;color:#c33;border:1px solid #fcc" onclick="_delLoan(\''+id+'\',\''+loan.id+'\')">Ã<\/button><\/td>'; } else h += '<td><\/td>';
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
      _origSaveInv.apply(this, arguments); // FIX: pass the investment id through (was creating a copy on every edit)
      var newInv=(data.investments||[]).find(function(i){return!beforeIds.has(i.id);});
      if(!newInv)return;
      var similar=(data.investments||[]).filter(function(i){return i.id!==newInv.id&&_simScore(i.name,newInv.name)>=0.7;});
      if(!similar.length)return;
      var matchLines=similar.map(function(m){return '  â¢ '+m.name+(m.fund?' ['+m.fund+']':'');}).join('\n');
      var keep=confirm('â ï¸ Possible duplicate investment\n\nThe investment â'+newInv.name+'â looks very similar to:\n\n'+matchLines+'\n\nDo you want to keep it?\nOK = Keep it   |   Cancel = Remove it');
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

// ââ Patch #2: Print modal Chart Settings + Dynamic scale ââââââââââââââââââ
// NOTE: openPrintConfig / orgPrintFilteredHTML / runOrgChartPrint are all defined
// inside a Firebase onAuthStateChanged callback in script.js, which fires AFTER
// our IIFE.  Direct window.X = ... overrides are therefore wiped out.
// Instead we:
//   (a) Wrap window.showModal immediately (showModal is defined at parse-time and
//       stays stable), detecting when the print-config modal opens.
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
      h += '<label class="org-filter-option" style="padding:2px 2pz;margin-left:'+(depth*14)+'px">'
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
    h += '<div class="print-cfg-label">'+(en?'Chart Settings':'ConfiguraciÃ³n del GrÃ¡fico')+'<\/div>';

    // â Shareholders â
    h += '<label class="org-filter-option"><input type="checkbox" '+(st.shareholders?'checked':'')+' onchange="orgPrintSettingChanged('+_q(id)+',\'shareholders\',this.checked)"> <span>'+(en?'Show shareholders':'Mostrar accionistas')+'<\/span><\/label>';
    if (st.shareholders) {
      var shTree = orgBuildShTree(id);
      if (shTree.length) {
        h += '<div style="margin-left:18px;margin-top:2px">'+_renderShTreeForPrint(id, shTree, st.shIds, 0)+'<\/div>';
      } else {
        h += '<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'<\/div>';
      }
    }

    // â Subsidiaries â
    h += '<label class="org-filter-option"><input type="checkbox" '+(st.subsidiaries?'checked':'')+' onchange="orgPrintSettingChanged('+_q(id)+',\'subsidiaries\',this.checked)"> <span>'+(en?'Show subsidiaries':'Mostrar subsidiarias')+'<\/span><\/label>';
    if (st.subsidiaries) {
      var subTree = orgBuildSubTree(id);
      if (subTree.length) {
        h += '<div style="margin-left:18px;margin-top:2px">'+_renderSubTreeForPrint(id, subTree, st.subIds, 0)+'<\/div>';
      } else {
        h += '<div style="margin-left:18px;color:var(--text3);font-size:11.5px">'+t('noData')+'<\/div>';
      }
    }

    // â Investments â
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

  // ââ Interactive pan/zoom on the live print preview âââââââââââââââââââââââââ
  function _setupPreviewPanZoom() {
    // Clean up previous instance (modal re-opened)
    if (window._pzCleanup) { window._pzCleanup(); window._pzCleanup = null; }

    var cfgGrid = document.querySelector('.print-cfg-grid');
    if (!cfgGrid) return;

    // Make right column fluid so it doesn't force the modal to 5445 px
    cfgGrid.style.gridTemplateColumns = '280px 1fr';

    var shell = cfgGrid.querySelector('.print-preview-shell');
    if (!shell) return;

    // Constrain the shell so orgPrintRefreshPreview auto-calculates a fit scale
    shell.style.overflow = 'hidden';
    shell.style.cursor   = 'grab';
    shell.style.position = 'relative';
    shell.style.userSelect = 'none';
    shell.style.height = (Math.max(400, window.innerHeight - 240)) + 'px';
    shell.style.boxSizing = 'border-box';

    var inner = document.getElementById('print-preview-inner');
    if (!inner) return;

    var pz = { tx: 0, ty: 0, userZoom: 1, baseScale: 1,
               dragging: false, startX: 0, startY: 0, startTx: 0, startTy: 0 };

    function applyTransform() {
      var s = pz.baseScale * pz.userZoom;
      inner.style.transform = 'translate(' + pz.tx + 'px,' + pz.ty + 'px) scale(' + s + ')';
      inner.style.transformOrigin = '0 0';
    }

    function captureBaseScale() {
      // orgPrintRefreshPreview sets "scale(N)" or "scale(N) ..." â read N
      var m = (inner.style.transform || '').match(/scale\(([\d.eE+\-]+)\)/);
      if (m) {
        pz.baseScale = parseFloat(m[1]) || 1;
        pz.tx = 0; pz.ty = 0; pz.userZoom = 1;
      }
      applyTransform();
    }

    // Wrap orgPrintRefreshPreview to capture the auto-scale it computes
    var _origRefresh = window.orgPrintRefreshPreview;
    window.orgPrintRefreshPreview = function () {
      if (typeof _origRefresh === 'function') _origRefresh();
      setTimeout(captureBaseScale, 40);
    };

    // Trigger initial scaled render
    if (typeof _origRefresh === 'function') { _origRefresh(); setTimeout(captureBaseScale, 40); }

    // ââ Pan via mouse drag ââââââââââââââââââââââââââââââââââââââââââââââââââââ
    function onMouseDown(e) {
      if (e.button !== 0) return;
      // Don't start drag on the control buttons
      if (e.target.closest && e.target.closest('#pz-controls')) return;
      pz.dragging = true;
      pz.startX = e.clientX; pz.startY = e.clientY;
      pz.startTx = pz.tx;    pz.startTy = pz.ty;
      shell.style.cursor = 'grabbing';
      e.preventDefault();
    }
    function onMouseMove(e) {
      if (!pz.dragging) return;
      pz.tx = pz.startTx + (e.clientX - pz.startX);
      pz.ty = pz.startTy + (e.clientY - pz.startY);
      applyTransform();
    }
    function onMouseUp() {
      if (pz.dragging) { pz.dragging = false; shell.style.cursor = 'grab'; }
    }
    shell.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // ââ Zoom via scroll wheel âââââââââââââââââââââââââââââââââââââââââââââââââ
    function onWheel(e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.12 : (1 / 1.12);
      pz.userZoom = Math.max(0.15, Math.min(8, pz.userZoom * factor));
      applyTransform();
    }
    shell.addEventListener('wheel', onWheel, { passive: false });

    // ââ Control buttons âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    var oldCtrl = document.getElementById('pz-controls');
    if (oldCtrl) oldCtrl.remove();

    var ctrl = document.createElement('div');
    ctrl.id = 'pz-controls';
    ctrl.style.cssText = 'position:absolute;top:8px;right:8px;z-index:20;display:flex;gap:4px;align-items:center;';

    function makeBtn(label, title, fn) {
      var b = document.createElement('button');
      b.textContent = label; b.title = title;
      b.style.cssText = 'padding:4px 10px;font-size:13px;font-weight:600;background:#fff;border:1px solid #ccc;border-radius:5px;cursor:pointer;line-height:1.2;box-shadow:0 1px 3px rgba(0,0,0,.15);';
      b.addEventListener('mousedown', function(e){ e.stopPropagation(); });
      b.addEventListener('click', fn);
      return b;
    }
    ctrl.appendChild(makeBtn('â Fit', 'Reset to fit', function(){
      pz.tx=0; pz.ty=0; pz.userZoom=1; applyTransform();
    }));
    ctrl.appendChild(makeBtn('+', 'Zoom in', function(){
      pz.userZoom = Math.min(8, pz.userZoom * 1.25); applyTransform();
    }));
    ctrl.appendChild(makeBtn('â', 'Zoom out', function(){
      pz.userZoom = Math.max(0.15, pz.userZoom / 1.25); applyTransform();
    }));
    shell.appendChild(ctrl);

    // ââ Hint text âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    var hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);'
      + 'background:rgba(0,0,0,.55);color:#fff;font-size:11px;padding:3px 12px;'
      + 'border-radius:10px;pointer-events:none;white-space:nowrap;transition:opacity 1.5s;';
    hint.textContent = 'Drag to pan Â· Scroll to zoom';
    shell.appendChild(hint);
    setTimeout(function(){ hint.style.opacity = '0'; }, 3500);

    // ââ Cleanup function (called on modal re-open) ââââââââââââââââââââââââââââ
    window._pzCleanup = function () {
      shell.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      shell.removeEventListener('wheel', onWheel);
      if (typeof _origRefresh === 'function') window.orgPrintRefreshPreview = _origRefresh;
    };
  }

  // ââ Public handlers called from inline onchange/onclick in the print modal â

  window.orgPrintSettingChanged = function (id, field, val) {
    orgEnsureSettings(id)[field] = val;
    _refreshPrintSettingsPanel(id);
    if (typeof orgPrintRefreshPreview === 'function') orgPrintRefreshPreview();
  };

  window.orgPrintToggleNode = function (id, kind, nodeId, checked) {
    var st = orgEnsureSettings(id);
    var field, allItems;
    if (kind==='sh')       { field='shIds';  allItems=orgFlattenShIds(id);  }
    else if (kind==='sub') { field='subIds'; allItems=orgFlattenSubIds(id); }
    else                   { field='invIds'; allItems=orgFlattenInvIds(id); }
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

  // ââ Filtered HTML builder (uses _orgSelSettings populated by our UI) âââââââ
  function _ourOrgPrintFilteredHTML() {
    if (!window._orgPrintCfg) return '';
    var cid = window._orgPrintCfg.companyId;
    var settings = (window._orgSelSettings && window._orgSelSettings[cid]) || {};

    var root = document.createElement('div');
    if (typeof buildFilteredOrgChart === 'function') {
      root.innerHTML = buildFilteredOrgChart(cid, settings, { print: true });
    } else {
      // Fallback: render via original and filter post-hoc
      if (typeof orgPrintFilteredHTML === 'function') root.innerHTML = window._origOrgPrintFilteredHTML ? window._origOrgPrintFilteredHTML() : '';
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

  // ââ Dynamic-scale print runner âââââââââââââââââââââââââââââââââââââââââââââ
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
      +   '<div class="t1">'+headerName+' \u2014 '+(typeof t==='function'?t('orgChart'):'Org Chart')+'<\/div>'
      +   '<div class="t2">'+headerJur+' \u2014 FamOfi Registry \u2014 '+new Date().toLocaleDateString()+'<\/div>'
      + '<\/div>'
      + '<div id="print-org-canvas" class="org-print-canvas">'+filteredHTML+'<\/div>';

    var canvas = document.getElementById('print-org-canvas');
    if (typeof drawOrgChartConnectors === 'function') drawOrgChartConnectors(canvas);
    if (typeof window._fixEdgeFan === 'function') window._fixEdgeFan(canvas);

    // Scale to the chart's own size: one standard page when it stays readable,
    // otherwise a custom page sized to the chart (nothing is ever cut off).
    if (typeof window.orgPrintSetup === 'function') window.orgPrintSetup(root);
    else {
      var scroll = canvas.querySelector('.org-chart-scroll');
      if (scroll) root.style.zoom = Math.min(1040 / Math.max(scroll.scrollWidth, 1), 740 / Math.max(scroll.scrollHeight, 1), 2.5);
    }

    if (typeof closeModal === 'function') closeModal();
    document.body.classList.add('printing-org');
    setTimeout(function(){ window.print(); }, 60);
  }

  // ââ Inject Chart Settings into the print modal once it opens âââââââââââââ
  function _injectPrintChartSettings(cid) {
    if (document.getElementById('print-chart-settings-wrap')) return; // already injected
    var cfgGrid = document.querySelector('.print-cfg-grid');
    if (!cfgGrid) return;
    var leftCol = cfgGrid.firstElementChild;
    if (!leftCol) return;

    // Hide "WHAT TO PRINT" section (radio buttons) â our Chart Settings replace it
    Array.prototype.forEach.call(leftCol.querySelectorAll('.print-cfg-section'), function(sec) {
      if (sec.querySelector('input[type="radio"]')) sec.style.display = 'none';
    });

    // Inject our Chart Settings at the top of the left column
    var wrap = document.createElement('div');
    wrap.id = 'print-chart-settings-wrap';
    leftCol.insertBefore(wrap, leftCol.firstChild);
    wrap.innerHTML = _buildPrintChartSettings(cid);

    // Re-hook the print-action functions (they may have been overwritten)
    window.orgPrintFilteredHTML = _ourOrgPrintFilteredHTML;
    window.runOrgChartPrint     = _ourRunOrgChartPrint;

    // Set up interactive pan/zoom (it also triggers the initial preview refresh)
    setTimeout(_setupPreviewPanZoom, 50);
  }

  // ââ Watch DOM for the print-cfg-grid to appear (works regardless of how
  //    openPrintConfig / showModal are called internally) ââââââââââââââââââââ
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
// Patch #3 (LLC line separation) removed: org chart lines are now routed by orgchart.js.
