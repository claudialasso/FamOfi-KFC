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
    if (admin) h += '<button class="btn btn-primary btn-sm" onclick="_addLoanModal(' + JSON.stringify(id) + ')">+ Add Loan<\/button>';
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
        if (admin) { h += '<td style="padding:8px 6px;white-space:nowrap"><button class="btn btn-sm" style="margin-right:4px" onclick="_editLoanModal('+JSON.stringify(id)+','+JSON.stringify(loan.id)+')">Edit<\/button><button class="btn btn-sm" style="background:#fee;color:#c33;border:1px solid #fcc" onclick="_delLoan('+JSON.stringify(id)+','+JSON.stringify(loan.id)+')">\u00d7<\/button><\/td>'; } else h += '<td><\/td>';
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
    var html='<div id="loan-modal-bg" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center"><div style="background:#fff;border-radius:14px;padding:28px;width:500px;max-width:94vw;max-height:88vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.18)"><h3 style="margin:0 0 18px;font-size:17px">'+(loan?'Edit':'Add')+' Portfolio Loan<\/h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px">'+row('Lender',inp('pl-lender','text',v('lender')))+row('Loan Type',sel2('pl-type',sel('type',['Term Loan','Revolving Credit','Bridge Loan','Mezzanine','Other'])))+row('Amount',inp('pl-amount','number',v('amount')))+row('Currency',sel2('pl-currency',sel('currency',['USD','EUR','UYU','PEN','CLP','GBP','Other'])))+row('Interest Rate (%)',inp('pl-rate','number',v('interestRate')))+row('Status',sel2('pl-status',sel('status',['Active','Paid Off','Defaulted','Restructured'])))+row('Start Date',inp('pl-start','date',v('startDate')))+row('Maturity Date',inp('pl-maturity','date',v('maturityDate')))+'<\/div>'+row('Notes','<textarea id="pl-notes" rows="2" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:4px;box-sizing:border-box">'+v('notes')+'<\/textarea>')+'<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn" onclick="document.getElementById(\'loan-modal-bg\').remove()">Cancel<\/button><button class="btn btn-primary" onclick="_saveLoan('+JSON.stringify(cid)+','+JSON.stringify(lid)+')">Save<\/button><\/div><\/div><\/div>';
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
      var matchLines=similar.map(function(m){return '  \u2022 '+m.name+(m.fund?' ['+m.fund+']':'');}).join('\n');
      var keep=confirm('\u26a0\ufe0f Possible duplicate investment\n\nThe investment \u201c'+newInv.name+'\u201d looks very similar to:\n\n'+matchLines+'\n\nDo you want to keep it?\nOK = Keep it   |   Cancel = Remove it');
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

  function hookOpenCompany(){
    if(typeof window.openCompany!=='function')return;
    _origOpenCompany=window.openCompany;
    window.openCompany=function(id){_origOpenCompany(id);setTimeout(function(){_injectLoanTab(id);},80);};
  }

  function init(){
    if(typeof window.openCompany==='function'&&typeof window.saveInv==='function'){hookOpenCompany();hookSaveInv();}else{setTimeout(init,200);}
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
