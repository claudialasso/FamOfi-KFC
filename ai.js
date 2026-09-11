/**
 * ai.js — FamOfi Registry AI Assistant
 * Adds a conversational assistant tab that queries the in-memory registry data.
 * No external API calls. Pure client-side pattern matching and query engine.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1.  CSS INJECTION
  ───────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ai-styles')) return;
    var style = document.createElement('style');
    style.id = 'ai-styles';
    style.textContent = [
      /* layout */
      '#ai-root{display:flex;flex-direction:column;height:calc(100vh - 60px);max-width:960px;margin:0 auto;padding:0 16px 0;}',
      '#ai-header{padding:18px 0 10px;border-bottom:1px solid var(--border);}',
      '#ai-header h2{margin:0 0 4px;font-size:1.25rem;color:var(--teal);}',
      '#ai-header p{margin:0;font-size:.82rem;color:var(--muted,#888);}',
      '#ai-body{flex:1;overflow-y:auto;padding:16px 0;display:flex;flex-direction:column;gap:12px;}',
      '#ai-suggestions{display:flex;flex-wrap:wrap;gap:8px;padding:12px 0 4px;}',
      '#ai-footer{padding:10px 0 14px;border-top:1px solid var(--border);}',
      '#ai-form{display:flex;gap:8px;}',
      '#ai-input{flex:1;padding:9px 13px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text,inherit);font-size:.93rem;outline:none;resize:none;line-height:1.4;min-height:40px;max-height:120px;overflow-y:auto;}',
      '#ai-input:focus{border-color:var(--teal);}',
      '#ai-send{padding:9px 18px;background:var(--teal);color:#fff;border:none;border-radius:8px;font-size:.93rem;cursor:pointer;flex-shrink:0;transition:opacity .15s;}',
      '#ai-send:disabled{opacity:.5;cursor:default;}',
      /* messages */
      '.ai-msg{display:flex;gap:10px;animation:aiFadeIn .2s ease;}',
      '.ai-msg.user{flex-direction:row-reverse;}',
      '.ai-bubble{max-width:85%;padding:10px 14px;border-radius:12px;font-size:.9rem;line-height:1.55;}',
      '.ai-msg.user .ai-bubble{background:var(--teal);color:#fff;border-bottom-right-radius:3px;}',
      '.ai-msg.assistant .ai-bubble{background:var(--surface);border:1px solid var(--border);border-bottom-left-radius:3px;}',
      '.ai-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0;margin-top:2px;}',
      '.ai-msg.user .ai-avatar{background:var(--teal);color:#fff;}',
      '.ai-msg.assistant .ai-avatar{background:var(--surface);border:1px solid var(--border);color:var(--teal);}',
      /* tables */
      '.ai-table{width:100%;border-collapse:collapse;font-size:.85rem;margin:8px 0;}',
      '.ai-table th{text-align:left;padding:6px 10px;background:var(--surface);border-bottom:2px solid var(--border);font-weight:600;white-space:nowrap;}',
      '.ai-table td{padding:6px 10px;border-bottom:1px solid var(--border);vertical-align:top;}',
      '.ai-table tr:hover td{background:var(--hover,rgba(0,0,0,.03));}',
      '.ai-table-wrap{overflow-x:auto;border-radius:6px;border:1px solid var(--border);}',
      /* entity links */
      '.ai-entity-link{color:var(--teal);text-decoration:none;cursor:pointer;font-weight:500;}',
      '.ai-entity-link:hover{text-decoration:underline;}',
      /* suggestion chips */
      '.ai-chip{padding:5px 12px;border:1px solid var(--border);border-radius:20px;font-size:.8rem;cursor:pointer;background:var(--surface);transition:border-color .15s,background .15s;white-space:nowrap;}',
      '.ai-chip:hover{border-color:var(--teal);background:rgba(0,150,136,.07);}',
      /* stat cards */
      '.ai-stat-row{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0;}',
      '.ai-stat{flex:1;min-width:120px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;text-align:center;}',
      '.ai-stat-value{font-size:1.4rem;font-weight:700;color:var(--teal);}',
      '.ai-stat-label{font-size:.75rem;color:var(--muted,#888);margin-top:2px;}',
      /* loading */
      '.ai-typing{display:flex;gap:4px;padding:10px 0;}',
      '.ai-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);opacity:.4;animation:aiBounce 1s infinite;}',
      '.ai-dot:nth-child(2){animation-delay:.18s;}',
      '.ai-dot:nth-child(3){animation-delay:.36s;}',
      /* badges */
      '.ai-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600;}',
      '.ai-badge-active{background:#d1fae5;color:#065f46;}',
      '.ai-badge-inactive{background:#fee2e2;color:#991b1b;}',
      '.ai-badge-info{background:#dbeafe;color:#1e40af;}',
      /* apply-filter button */
      '.ai-apply-btn{display:inline-block;margin-top:10px;padding:5px 12px;background:var(--teal);color:#fff;border:none;border-radius:6px;font-size:.8rem;cursor:pointer;}',
      '.ai-apply-btn:hover{opacity:.88;}',
      /* action row */
      '.ai-action-row{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;}',
      /* keyframes */
      '@keyframes aiFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '@keyframes aiBounce{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     2.  QUERY ENGINE
     All queries run against the global window.data
  ───────────────────────────────────────────── */
  var Q = {
    all: function () { return (window.data && window.data.companies) ? window.data.companies : []; },
    investments: function () { return (window.data && window.data.investments) ? window.data.investments : []; },

    byBank: function (q) {
      if (!q) return [];
      var lq = q.toLowerCase();
      return this.all().filter(function (c) {
        return c.banking && c.banking.some(function (b) {
          return (b.bank || '').toLowerCase().indexOf(lq) !== -1;
        });
      });
    },

    byJurisdiction: function (jur) {
      if (!jur) return this.all();
      var lj = jur.toLowerCase();
      return this.all().filter(function (c) {
        return (c.jurisdiction || '').toLowerCase().indexOf(lj) !== -1;
      });
    },

    byStatus: function (status) {
      var ls = (status || '').toLowerCase();
      return this.all().filter(function (c) {
        return (c.status || '').toLowerCase() === ls;
      });
    },

    byName: function (q) {
      if (!q) return [];
      var lq = q.toLowerCase();
      return this.all().filter(function (c) {
        return (c.name || '').toLowerCase().indexOf(lq) !== -1;
      });
    },

    byId: function (id) {
      return this.all().filter(function (c) { return c.id === id; })[0] || null;
    },

    byType: function (type) {
      if (!type) return [];
      var lt = type.toLowerCase();
      return this.all().filter(function (c) {
        return ((c.type || c.purpose || '')).toLowerCase().indexOf(lt) !== -1;
      });
    },

    byDirector: function (name) {
      if (!name) return [];
      var ln = name.toLowerCase();
      return this.all().filter(function (c) {
        return (c.director || '').toLowerCase().indexOf(ln) !== -1;
      });
    },

    byYear: function (year) {
      var y = String(year);
      return this.all().filter(function (c) {
        return String(c.yearFounded || '') === y;
      });
    },

    byTag: function (tag) {
      if (!tag) return [];
      var lt = tag.toLowerCase();
      return this.all().filter(function (c) {
        return c.tags && c.tags.some(function (t) { return t.toLowerCase().indexOf(lt) !== -1; });
      });
    },

    withBanking: function () {
      return this.all().filter(function (c) { return c.banking && c.banking.length > 0; });
    },

    withoutBanking: function () {
      return this.all().filter(function (c) { return !c.banking || c.banking.length === 0; });
    },

    withMultipleBanks: function () {
      return this.all().filter(function (c) { return c.banking && c.banking.length > 1; });
    },

    withInvestments: function () {
      var invIds = this._companiesWithInv();
      return this.all().filter(function (c) { return invIds[c.id]; });
    },

    withoutInvestments: function () {
      var invIds = this._companiesWithInv();
      return this.all().filter(function (c) { return !invIds[c.id]; });
    },

    _companiesWithInv: function () {
      var map = {};
      this.investments().forEach(function (inv) {
        var ids = inv.companyIds && inv.companyIds.length ? inv.companyIds : (inv.companyId ? [inv.companyId] : []);
        ids.forEach(function (id) { map[id] = true; });
      });
      return map;
    },

    investmentsFor: function (companyId) {
      return this.investments().filter(function (inv) {
        var ids = inv.companyIds && inv.companyIds.length ? inv.companyIds : (inv.companyId ? [inv.companyId] : []);
        return ids.indexOf(companyId) !== -1;
      });
    },

    byShareholder: function (q) {
      if (!q) return [];
      var lq = q.toLowerCase();
      return this.all().filter(function (c) {
        return c.shareholders && c.shareholders.some(function (sh) {
          var name = '';
          if (typeof window.resolveOwner === 'function') {
            name = window.resolveOwner(sh) || '';
          } else {
            name = sh.person || sh.id || '';
          }
          return name.toLowerCase().indexOf(lq) !== -1;
        });
      });
    },

    missingInfo: function () {
      return this.all().filter(function (c) {
        return !c.banking || c.banking.length === 0 ||
          !c.jurisdiction || !c.status;
      });
    },

    groupByJurisdiction: function () {
      var map = {};
      this.all().forEach(function (c) {
        var j = c.jurisdiction || 'Unknown';
        if (!map[j]) map[j] = [];
        map[j].push(c);
      });
      return map;
    },

    groupByStatus: function () {
      var map = {};
      this.all().filter(function(c){ return c.status; }).forEach(function (c) {
        var s = c.status || 'Unknown';
        if (!map[s]) map[s] = [];
        map[s].push(c);
      });
      return map;
    },

    groupByBank: function () {
      var map = {};
      this.all().forEach(function (c) {
        if (!c.banking) return;
        c.banking.forEach(function (b) {
          var bn = b.bank || 'Unknown';
          if (!map[bn]) map[bn] = [];
          if (map[bn].indexOf(c) === -1) map[bn].push(c);
        });
      });
      return map;
    },

    groupByType: function () {
      var map = {};
      this.all().forEach(function (c) {
        var t = c.type || c.purpose || 'Unknown';
        if (!map[t]) map[t] = [];
        map[t].push(c);
      });
      return map;
    },

    bankList: function () {
      var seen = {};
      this.all().forEach(function (c) {
        if (!c.banking) return;
        c.banking.forEach(function (b) {
          if (b.bank) seen[b.bank] = true;
        });
      });
      return Object.keys(seen).sort();
    },

    jurisdictionList: function () {
      var seen = {};
      this.all().forEach(function (c) { if (c.jurisdiction) seen[c.jurisdiction] = true; });
      return Object.keys(seen).sort();
    },

    typeList: function () {
      var seen = {};
      this.all().forEach(function (c) {
        var t = c.type || c.purpose;
        if (t) seen[t] = true;
      });
      return Object.keys(seen).sort();
    },

    directorList: function () {
      var seen = {};
      this.all().forEach(function (c) {
        if (c.director) seen[c.director] = true;
      });
      return Object.keys(seen).sort();
    },

    investmentsByType: function () {
      var map = {};
      this.investments().forEach(function (inv) {
        var t = inv.type || 'Unknown';
        if (!map[t]) map[t] = [];
        map[t].push(inv);
      });
      return map;
    },

    totalInvestmentValue: function (invList) {
      return (invList || this.investments()).reduce(function (s, inv) {
        return s + (parseFloat(inv.marketValue) || 0);
      }, 0);
    },

    relatedCompanies: function (companyId) {
      var company = this.byId(companyId);
      if (!company) return [];
      var results = [];
      var self = this;
      this.all().forEach(function (c) {
        if (c.id === companyId) return;
        if (c.shareholders && c.shareholders.some(function (sh) { return sh.id === companyId || sh.person === companyId; })) {
          results.push({ company: c, relation: 'Subsidiary' });
        }
      });
      if (company.shareholders) {
        company.shareholders.forEach(function (sh) {
          var parent = self.byId(sh.id || sh.person);
          if (parent) results.push({ company: parent, relation: 'Shareholder (' + (sh.pct || '?') + '%)' });
        });
      }
      return results;
    },

    /* ── Full-text search across all entity fields ── */
    search: function (q) {
      if (!q || q.length < 2) return [];
      var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length >= 2; });
      if (!words.length) return [];
      return this.all().filter(function (c) {
        var text = [
          c.name, c.jurisdiction, c.status, c.type, c.purpose, c.director,
          c.registeredAgent, c.address, c.notes, c.fiscalId, c.ein, c.irs
        ].join(' ').toLowerCase();
        if (c.banking) c.banking.forEach(function (b) { text += ' ' + (b.bank || '') + ' ' + (b.type || ''); });
        if (c.tags) text += ' ' + c.tags.join(' ');
        if (c.shareholders) {
          c.shareholders.forEach(function (sh) {
            var name = typeof window.resolveOwner === 'function' ? window.resolveOwner(sh) : (sh.person || sh.id || '');
            text += ' ' + name;
          });
        }
        return words.every(function (w) { return text.indexOf(w) !== -1; });
      });
    },

    /* ── Compound multi-condition filter ── */
    applyConditions: function (conds) {
      return this.all().filter(function (c) {
        if (conds.status) {
          if ((c.status || '').toLowerCase() !== conds.status.toLowerCase()) return false;
        }
        if (conds.jurisdiction) {
          if ((c.jurisdiction || '').toLowerCase().indexOf(conds.jurisdiction.toLowerCase()) === -1) return false;
        }
        if (conds.bank) {
          var lb = conds.bank.toLowerCase();
          if (!c.banking || !c.banking.some(function (b) { return (b.bank || '').toLowerCase().indexOf(lb) !== -1; })) return false;
        }
        if (conds.type) {
          var lt = conds.type.toLowerCase();
          if (((c.type || c.purpose || '')).toLowerCase().indexOf(lt) === -1) return false;
        }
        if (conds.director) {
          if ((c.director || '').toLowerCase().indexOf(conds.director.toLowerCase()) === -1) return false;
        }
        if (conds.noBank) {
          if (c.banking && c.banking.length > 0) return false;
        }
        return true;
      });
    },

    /* ── Registry-wide statistics ── */
    stats: function () {
      var all = this.all();
      var statusMap = this.groupByStatus();
      var jurMap = this.groupByJurisdiction();
      var bankMap = this.groupByBank();
      return {
        total: all.length,
        withBanking: this.withBanking().length,
        withoutBanking: this.withoutBanking().length,
        withInvestments: this.withInvestments().length,
        statusBreakdown: statusMap,
        topJurisdiction: Object.keys(jurMap).sort(function(a,b){ return jurMap[b].length - jurMap[a].length; })[0],
        topBank: Object.keys(bankMap).sort(function(a,b){ return bankMap[b].length - bankMap[a].length; })[0],
        investmentCount: this.investments().length,
        totalInvValue: this.totalInvestmentValue()
      };
    }
  };

  /* ─────────────────────────────────────────────
     3.  EXTRACTOR HELPERS
  ───────────────────────────────────────────── */
  var BANK_ALIASES = {
    'jpmorgan': 'JPMorgan', 'jp morgan': 'JPMorgan', 'jpm': 'JPMorgan', 'chase': 'JPMorgan Chase',
    'bofa': 'Bank of America', 'bank of america': 'Bank of America', 'bac': 'Bank of America',
    'wells': 'Wells Fargo', 'wells fargo': 'Wells Fargo',
    'citi': 'Citibank', 'citibank': 'Citibank', 'citigroup': 'Citibank',
    'schwab': 'Charles Schwab', 'charles schwab': 'Charles Schwab',
    'fidelity': 'Fidelity',
    'morgan stanley': 'Morgan Stanley',
    'ubs': 'UBS',
    'goldman': 'Goldman Sachs', 'goldman sachs': 'Goldman Sachs',
    'northern trust': 'Northern Trust',
    'td bank': 'TD Bank', 'td': 'TD Bank',
    'hsbc': 'HSBC',
    'bmo': 'BMO',
    'pnc': 'PNC',
    'us bank': 'US Bank', 'usbank': 'US Bank',
    'city national': 'City National Bank', 'cnb': 'City National Bank',
    'santander': 'Santander',
    'bankinter': 'Bankinter',
    'banco general': 'Banco General de Panama',
    'cibc': 'Canadian Imperial Bank of Commerce', 'canadian imperial': 'Canadian Imperial Bank of Commerce',
    'bbp': 'BBP Bank',
  };

  var JUR_ALIASES = {
    'delaware': 'Delaware', 'de': 'Delaware',
    'florida': 'Florida', 'fl': 'Florida',
    'new york': 'New York', 'ny': 'New York',
    'nevada': 'Nevada', 'nv': 'Nevada',
    'wyoming': 'Wyoming', 'wy': 'Wyoming',
    'california': 'California', 'ca': 'California',
    'texas': 'Texas', 'tx': 'Texas',
    'cayman': 'Cayman Islands', 'cayman islands': 'Cayman Islands', 'caiman': 'Caiman',
    'bvi': 'British Virgin Islands', 'british virgin islands': 'British Virgin Islands',
    'puerto rico': 'Puerto Rico', 'pr': 'Puerto Rico',
    'panama': 'Panama',
    'luxembourg': 'Luxembourg',
    'ireland': 'Ireland',
    'ontario': 'Ontario',
    'british columbia': 'British Columbia', 'bc': 'British Columbia',
    'españa': 'España', 'spain': 'España', 'espana': 'España',
    'singapore': 'Singapore',
    'bahamas': 'Bahamas',
    'ecuador': 'Ecuador',
    'uruguay': 'Uruguay',
    'usa': 'USA', 'united states': 'USA', 'us': 'USA',
  };

  function extractBankRef(q) {
    var lq = q.toLowerCase().trim();
    // check actual bank names in data FIRST (most accurate)
    var banks = Q.bankList();
    for (var j = 0; j < banks.length; j++) {
      if (lq.indexOf(banks[j].toLowerCase().trim()) !== -1) return banks[j];
    }
    // check aliases and try to map to an actual data bank name
    var keys = Object.keys(BANK_ALIASES).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      if (lq.indexOf(keys[i]) !== -1) {
        var canonical = BANK_ALIASES[keys[i]].toLowerCase();
        for (var k = 0; k < banks.length; k++) {
          var bk = banks[k].toLowerCase().trim();
          if (bk.indexOf(canonical) !== -1 || canonical.indexOf(bk) !== -1) return banks[k];
        }
        return BANK_ALIASES[keys[i]];
      }
    }
    return null;
  }

  function extractJurisdiction(q) {
    var lq = q.toLowerCase();
    // check actual jurisdictions from data FIRST
    var jurs = Q.jurisdictionList();
    for (var j = 0; j < jurs.length; j++) {
      if (jurs[j] && lq.indexOf(jurs[j].toLowerCase()) !== -1) return jurs[j];
    }
    // then check aliases
    var keys = Object.keys(JUR_ALIASES).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      if (lq.indexOf(keys[i]) !== -1) {
        var target = JUR_ALIASES[keys[i]].toLowerCase();
        for (var k = 0; k < jurs.length; k++) {
          if (jurs[k] && jurs[k].toLowerCase().indexOf(target) !== -1) return jurs[k];
        }
        return JUR_ALIASES[keys[i]];
      }
    }
    return null;
  }

  function extractStatus(q) {
    var lq = q.toLowerCase();
    // check actual status values from data first (case-insensitive)
    var statuses = [];
    Q.all().forEach(function(c){ if (c.status && statuses.indexOf(c.status) === -1) statuses.push(c.status); });
    for (var i = 0; i < statuses.length; i++) {
      if (lq.indexOf(statuses[i].toLowerCase()) !== -1) return statuses[i];
    }
    // fallback aliases
    if (/\bactive\b|\bactiv[ao]\b/.test(lq)) return 'active';
    if (/\binactive\b|\binactiv[ao]\b/.test(lq)) return 'inactive';
    if (/\bdissolved\b/.test(lq)) return 'dissolved';
    if (/\bliquidat/.test(lq)) return 'liquidated';
    if (/\bliquidaci/.test(lq)) return 'liquidation';
    if (/\bpending\b|\bpendiente\b/.test(lq)) return 'pending';
    if (/\bdormant\b/.test(lq)) return 'dormant';
    return null;
  }

  function extractEntityType(q) {
    var lq = q.toLowerCase();
    // check actual types from data first
    var types = Q.typeList();
    for (var i = 0; i < types.length; i++) {
      if (types[i] && types[i].length > 2 && lq.indexOf(types[i].toLowerCase()) !== -1) return types[i];
    }
    // common type keywords
    if (/\bllc\b/.test(lq)) return 'LLC';
    if (/\bcorp(?:oration)?\b/.test(lq)) return 'corporation';
    if (/\btrust\b|\bfideicomiso\b/.test(lq)) return 'trust';
    if (/\bfoundation\b|\bfundación\b/.test(lq)) return 'foundation';
    if (/\bholding\b/.test(lq)) return 'holding';
    if (/\bltd\b|\blimited\b/.test(lq)) return 'Ltd';
    if (/\bpartnership\b/.test(lq)) return 'partnership';
    if (/\bfund\b/.test(lq)) return 'fund';
    return null;
  }

  function extractYear(q) {
    var m = q.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : null;
  }

  function extractEntityName(q) {
    var lq = q.toLowerCase();
    var companies = Q.all();
    // try longest match first
    var sorted = companies.slice().sort(function (a, b) { return (b.name || '').length - (a.name || '').length; });
    for (var i = 0; i < sorted.length; i++) {
      var name = (sorted[i].name || '').toLowerCase();
      if (name.length > 2 && lq.indexOf(name) !== -1) return sorted[i];
    }
    // try after keywords
    var afterKw = q.match(/(?:about|of|for|regarding|summarize|summary of|investments? in|shareholders? of|banking for|accounts? for|directors? of|status of|tell me about|info(?:rmation)? (?:on|about)|sobre|acerca de|de la empresa|de la entidad)\s+(.+)/i);
    if (afterKw) {
      var candidate = afterKw[1].replace(/[?.!].*$/, '').trim().toLowerCase();
      for (var j = 0; j < sorted.length; j++) {
        var n = (sorted[j].name || '').toLowerCase();
        if (n.indexOf(candidate) !== -1 || candidate.indexOf(n) !== -1) return sorted[j];
      }
    }
    return null;
  }

  function extractShareholderName(q) {
    var m = q.match(/shareholders?\s+(?:of|in|for)\s+(.+)/i) ||
              q.match(/(?:who owns?|ownership of)\s+(.+)/i) ||
              q.match(/accionistas?\s+de\s+(.+)/i);
    if (m) return m[1].replace(/[?.!].*$/, '').trim();
    return null;
  }

  function extractInvestmentType(q) {
    var lq = q.toLowerCase();
    var types = ['private equity', 'real estate', 'hedge fund', 'venture capital', 'fixed income', 'equity', 'debt', 'credit', 'infrastructure', 'fund of funds'];
    for (var i = 0; i < types.length; i++) {
      if (lq.indexOf(types[i]) !== -1) return types[i];
    }
    return null;
  }

  /* Detect which specific field the user is asking about for a given entity */
  function extractFieldRequest(q) {
    var lq = q.toLowerCase();
    if (/\b(jurisdiction|país|country|domicilio|incorporated in|registered in|where is)\b/.test(lq)) return 'jurisdiction';
    if (/\b(director|ceo|president|directora?)\b/.test(lq) && !/\blist\b|\ball\b|\bshow\b/.test(lq)) return 'director';
    if (/\b(registered agent|agente registrado|agente)\b/.test(lq)) return 'registeredAgent';
    if (/\b(address|dirección|ubicación|location)\b/.test(lq)) return 'address';
    if (/\b(status|estado|situación)\b/.test(lq) && !/ (all|list|show|which)\b/.test(lq)) return 'status';
    if (/\b(year founded|year incorporated|founded|incorporated|formed|cuando|cuándo|año de|año de constitución)\b/.test(lq)) return 'yearFounded';
    if (/\b(fiscal id|ein|tax id|rut|nit|id fiscal|número fiscal)\b/.test(lq)) return 'fiscalId';
    if (/\b(tags?|etiquetas?|labels?|categories?)\b/.test(lq)) return 'tags';
    if (/\b(type|tipo|purpose|propósito)\b/.test(lq) && !/ (all|list|show|which)\b/.test(lq)) return 'type';
    if (/\b(notes?|notas?|comments?|observations?)\b/.test(lq)) return 'notes';
    if (/\b(currency|currencies|moneda)\b/.test(lq)) return 'currency';
    if (/\b(bank|account|banking|cuenta|banco)\b/.test(lq)) return 'banking';
    if (/\b(shareholders?|accionistas?|socios?|owners?)\b/.test(lq)) return 'shareholders';
    if (/\b(investments?|inversiones?|portfolio|cartera)\b/.test(lq)) return 'investments';
    return null;
  }

  /* ─────────────────────────────────────────────
     4.  INTENT PARSER
  ───────────────────────────────────────────── */
  function parseIntent(question) {
    var q = question.trim();
    var lq = q.toLowerCase();

    /* ── Greetings (EN + ES) ── */
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy)\b/.test(lq) ||
        /^(hola|buenos\s*(días|tardes|noches)|buen\s*día)\b/.test(lq)) {
      return { type: 'greeting' };
    }

    /* ── Help ── */
    if (/\b(help|what can you|what do you|capabilities|how do (i|you)|guide)\b/.test(lq) ||
        /\b(ayuda|qué puedes|cómo funciona|qué sabes|para qué sirve)\b/.test(lq)) {
      return { type: 'help' };
    }

    /* ── Registry overview / stats ── */
    if (/\b(overview|resumen general|dashboard|summary of the registry|estadísticas?|statistics|general stats)\b/.test(lq)) {
      return { type: 'registry_overview' };
    }

    /* ── List ALL entities ── */
    if (/\b(list all|show all|all entities|all companies|todas las empresas|todas las entidades|show me everything|listado completo)\b/.test(lq)) {
      return { type: 'list_all' };
    }

    /* ── Compound multi-condition query (checked FIRST before any single-condition blocks) ── */
    var _statusC = extractStatus(q);
    var _jurC = extractJurisdiction(q);
    var _bankC = extractBankRef(q);
    var _typeC = extractEntityType(q);
    var _conds = {};
    if (_statusC) _conds.status = _statusC;
    if (_jurC) _conds.jurisdiction = _jurC;
    if (_bankC) _conds.bank = _bankC;
    if (_typeC) _conds.type = _typeC;
    if (Object.keys(_conds).length >= 2) return { type: 'compound_query', conditions: _conds };

    /* ── Count companies ── */
    if (/\bhow many (companies|entities|llcs?|corps?|trusts?|total)\b/.test(lq) && !/bank|invest|shareholder/.test(lq) ||
        /\bcuántas?\s+(empresas?|entidades?|compañías?)\b/.test(lq)) {
      var status = extractStatus(q);
      return { type: 'count_companies', status: status };
    }

    /* ── Count investments ── */
    if (/\bhow many investments?\b/.test(lq) || /\btotal (number of )?investments?\b/.test(lq) ||
        /\bcuántas?\s+inversiones?\b/.test(lq)) {
      return { type: 'count_investments' };
    }

    /* ── Total investment value / AUM ── */
    if (/\b(total|sum|aum|assets? under management|portfolio value|market value|total value|valor total|valor de la cartera)\b/.test(lq) && /\binvest/.test(lq)) {
      return { type: 'total_inv_value' };
    }

    /* ── By specific bank (with bank keyword) ── */
    if (/\b(bank|account|banking|deposit|cuenta|banco|cuentas?)\b/.test(lq) && !/no (bank|account|banking)/.test(lq) && !/sin (banco|cuenta)/.test(lq)) {
      var bank = extractBankRef(q);
      if (bank) return { type: 'by_bank', bank: bank };
      if (/\b(which|list|all|show me) (banks?|financial institutions?)\b/.test(lq) ||
          /\b(qué|cuáles?|lista de|listado de) bancos?\b/.test(lq)) {
        return { type: 'list_banks' };
      }
      if (/multiple|more than one|several|más de un\b/.test(lq)) {
        return { type: 'multiple_banks' };
      }
      if (/breakdown|desglose/.test(lq)) {
        return { type: 'breakdown_by_bank' };
      }
      if (/\bwith (a |an )?(bank|account|banking)\b/.test(lq) || /\bcon (banco|cuenta)\b/.test(lq)) {
        return { type: 'with_banking' };
      }
    }

    /* ── No bank account ── */
    if (/\b(no|without|missing|lack) (bank|account|banking)\b/.test(lq) ||
        /\b(not|don't) have (a )?(bank|account|banking)\b/.test(lq) ||
        /\bsin (banco|cuenta|cuentas?)\b/.test(lq)) {
      return { type: 'no_banking' };
    }

    /* ── Breakdown by bank ── */
    if (/\bbreakdown\b/.test(lq) && /\bbank\b/.test(lq) ||
        /\bdesglose\b.+\bbanco\b/.test(lq) || /\bpor banco\b/.test(lq)) {
      return { type: 'breakdown_by_bank' };
    }

    /* ── Breakdown by status ── */
    if ((/\bbreakdown\b/.test(lq) || /\bdesglose\b/.test(lq)) && /\bstatus\b|\bestado\b/.test(lq)) {
      return { type: 'breakdown_by_status' };
    }

    /* ── By jurisdiction ── */
    if (/\b(jurisdiction|incorporated|registered|domicile|formed|country|jurisdicción|incorporada?|constituida?|domicilio)\b/.test(lq)) {
      var jur = extractJurisdiction(q);
      if (/\bbreakdown\b/.test(lq) || /\bgroup\b/.test(lq) || /\bby jurisdiction\b/.test(lq) ||
          /\bpor jurisdicción\b/.test(lq) || /\bdesglose por país\b/.test(lq)) {
        return { type: 'breakdown_by_jurisdiction' };
      }
      if (jur) return { type: 'by_jurisdiction', jurisdiction: jur };
      return { type: 'breakdown_by_jurisdiction' };
    }

    /* ── By entity type ── */
    if (/\b(type|tipos?|what type|qué tipo)\b/.test(lq) && /\b(all|list|show|which|breakdown|group)\b/.test(lq)) {
      var type = extractEntityType(q);
      if (/\bbreakdown\b|\bdesglose\b|\bby type\b|\bpor tipo\b/.test(lq)) {
        return { type: 'breakdown_by_type' };
      }
      if (type) return { type: 'by_type', type: type };
      return { type: 'breakdown_by_type' };
    }

    /* ── By director ── */
    if (/\b(directors?|directoras?)\b/.test(lq) && /\b(all|list|show|which|who|list all|todos|todas|lista de|todas las)\b/.test(lq)) {
      return { type: 'list_directors' };
    }
    if (/\bwho is the director\b|\b(?:who|whom) directs?\b|\bel director de\b|\bla directora de\b/.test(lq)) {
      var entityForDir = extractEntityName(q);
      if (entityForDir) return { type: 'field_lookup', company: entityForDir, field: 'director' };
    }

    /* ── By status ── */
    var status = extractStatus(q);
    if (status && /\b(status|show|find|list|which|estado|mostrar|listar|cuáles?)\b/.test(lq)) {
      return { type: 'by_status', status: status };
    }
    if (status && !/invest|bank|shareholder|inversión|banco|accionista/.test(lq)) {
      return { type: 'by_status', status: status };
    }

    /* ── Founded in a specific year ── */
    var year = extractYear(q);
    if (year && /\b(founded|incorporated|formed|created|established|constituida?|fundada?|año)\b/.test(lq)) {
      return { type: 'by_year', year: year };
    }

    /* ── Shareholders ── */
    if (/\bshareholders?\b|\baccionistas?\b|\bsocios?\b/.test(lq)) {
      var entityForSh = extractEntityName(q);
      if (entityForSh) return { type: 'shareholders_of', company: entityForSh };
      var shName = extractShareholderName(q);
      if (shName) return { type: 'entities_by_shareholder', shareholder: shName };
      return { type: 'all_shareholders' };
    }

    /* ── Investments for entity ── */
    if (/\binvestments?\b|\binversiones?\b/.test(lq)) {
      var entityForInv = extractEntityName(q);
      if (entityForInv) return { type: 'entity_investments', company: entityForInv };
      if (/\b(no|without|missing) invest/.test(lq) || /\bsin inversiones?\b/.test(lq)) return { type: 'without_investments' };
      if (/\bwith invest/.test(lq) || /\bhave invest/.test(lq) || /\bcon inversiones?\b/.test(lq)) return { type: 'with_investments' };
      var invType = extractInvestmentType(q);
      if (invType) return { type: 'investments_by_type', invType: invType };
      if (/largest|biggest|top|highest|mayores|más grandes/.test(lq)) return { type: 'largest_investments' };
      if (/by type|por tipo|breakdown|desglose/.test(lq)) return { type: 'investments_by_type', invType: null };
      return { type: 'list_investments' };
    }

    /* ── Missing info ── */
    if (/\b(missing|incomplete|no info|without info|lack|faltante|incompleta?)\b/.test(lq)) {
      return { type: 'missing_info' };
    }

    /* ── Compare ── */
    if (/\bcompar(e|ing|ison)?\b|\bcompar[ao]\b/.test(lq)) {
      var cmpCompanies = [];
      Q.all().sort(function(a,b){return (b.name||'').length-(a.name||'').length;}).forEach(function(c){
        if ((q.toLowerCase()).indexOf((c.name||'').toLowerCase()) !== -1 && c.name.length > 2) {
          if (cmpCompanies.indexOf(c) === -1) cmpCompanies.push(c);
        }
      });
      return { type: 'compare', companies: cmpCompanies };
    }

    /* ── Related / subsidiaries ── */
    if (/\b(related|subsidiaries|subsidiary|children|parent|affiliated|filial|subsidiaria|relacionadas?)\b/.test(lq)) {
      var entityForRel = extractEntityName(q);
      if (entityForRel) return { type: 'related', company: entityForRel };
    }

    /* ── Field-specific lookup + entity: "what is the director of X?" ── */
    var fieldReq = extractFieldRequest(q);
    var entityForField = extractEntityName(q);
    if (fieldReq && entityForField) {
      return { type: 'field_lookup', company: entityForField, field: fieldReq };
    }

    /* ── Entity summary / full info ── */
    if (/\b(summary|overview|info|details?|tell me about|describe|profile|full|resumen|información|info de|datos de|qué sabes de)\b/.test(lq)) {
      var entityForSumm = extractEntityName(q);
      if (entityForSumm) return { type: 'entity_summary', company: entityForSumm };
    }

    /* ── Direct entity name question (fallback) ── */
    var directEntity = extractEntityName(q);
    if (directEntity) return { type: 'entity_summary', company: directEntity };

    /* ── With/without banking (late fallback) ── */
    if (/with (a |an )?(bank|account|banking)\b/.test(lq)) return { type: 'with_banking' };
    if (/without (a |an )?(bank|account|banking)\b/.test(lq)) return { type: 'no_banking' };

    /* ── Smart full-text search fallback ── */
    return { type: 'smart_search', query: q };
  }

  /* ─────────────────────────────────────────────
     5.  FORMATTERS & RESPONSE BUILDERS
  ───────────────────────────────────────────── */
  function fmtMoney(n) {
    if (!n && n !== 0) return '—';
    var v = parseFloat(n);
    if (isNaN(v)) return '—';
    if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(0);
  }

  function entityLink(company) {
    if (!company) return '—';
    var id = company.id || '';
    var name = company.name || id;
    return '<a class="ai-entity-link" onclick="(function(){window._aiOpenCompany(' + JSON.stringify(id) + ');})()" href="javascript:void(0)">' + esc(name) + '</a>';
  }

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function statusBadge(s) {
    if (!s) return '—';
    var l = s.toLowerCase();
    var cls = l === 'active' ? 'ai-badge-active'
            : (l === 'liquidated' || l === 'liquidation' || l === 'inactive' || l === 'dissolved') ? 'ai-badge-inactive'
            : 'ai-badge-info';
    var display = s.charAt(0).toUpperCase() + s.slice(1);
    return '<span class="ai-badge ' + cls + '">' + esc(display) + '</span>';
  }

  function companyTable(companies, columns) {
    if (!companies || companies.length === 0) return '<em>No entities found.</em>';
    columns = columns || ['name', 'jurisdiction', 'status'];
    var colDefs = {
      name: { label: 'Entity', render: function (c) { return entityLink(c); } },
      jurisdiction: { label: 'Jurisdiction', render: function (c) { return esc(c.jurisdiction || '—'); } },
      status: { label: 'Status', render: function (c) { return c.status ? statusBadge(c.status) : '—'; } },
      type: { label: 'Type', render: function (c) { return esc(c.type || c.purpose || '—'); } },
      banks: { label: 'Banks', render: function (c) { return c.banking && c.banking.length ? c.banking.map(function (b) { return esc(b.bank || '?'); }).join(', ') : '—'; } },
      director: { label: 'Director', render: function (c) { return esc(c.director || '—'); } },
      year: { label: 'Founded', render: function (c) { return esc(c.yearFounded || '—'); } },
      shareholders: { label: 'Shareholders', render: function (c) {
        if (!c.shareholders || !c.shareholders.length) return '—';
        return c.shareholders.map(function (sh) {
          var name = typeof window.resolveOwner === 'function' ? window.resolveOwner(sh) : (sh.person || sh.id || '?');
          return esc(name) + (sh.pct ? ' (' + sh.pct + '%)' : '');
        }).join('<br>');
      }},
      inv_count: { label: 'Investments', render: function (c) {
        var invs = Q.investmentsFor(c.id);
        return String(invs.length);
      }},
      inv_value: { label: 'Mkt Value', render: function (c) {
        var invs = Q.investmentsFor(c.id);
        return fmtMoney(Q.totalInvestmentValue(invs));
      }},
    };
    var html = '<div class="ai-table-wrap"><table class="ai-table"><thead><tr>';
    columns.forEach(function (col) {
      var def = colDefs[col] || { label: col };
      html += '<th>' + esc(def.label) + '</th>';
    });
    html += '</tr></thead><tbody>';
    companies.forEach(function (c) {
      html += '<tr>';
      columns.forEach(function (col) {
        var def = colDefs[col] || { render: function () { return esc(c[col] || '—'); } };
        html += '<td>' + def.render(c) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<p style="font-size:.78rem;color:var(--muted,#888);margin:4px 0 0">' + companies.length + ' entity/entities found</p>';
    return html;
  }

  function investmentTable(invs) {
    if (!invs || invs.length === 0) return '<em>No investments found.</em>';
    var html = '<div class="ai-table-wrap"><table class="ai-table"><thead><tr>';
    html += '<th>Investment</th><th>Entity</th><th>Type</th><th>Status</th><th>Mkt Value</th>';
    html += '</tr></thead><tbody>';
    invs.forEach(function (inv) {
      var ids = inv.companyIds && inv.companyIds.length ? inv.companyIds : (inv.companyId ? [inv.companyId] : []);
      var entityNames = ids.map(function (id) {
        var c = Q.byId(id);
        return c ? entityLink(c) : esc(id);
      }).join(', ');
      html += '<tr>';
      html += '<td>' + esc(inv.name || inv.fund || '—') + '</td>';
      html += '<td>' + (entityNames || '—') + '</td>';
      html += '<td>' + esc(inv.type || '—') + '</td>';
      html += '<td>' + (inv.status ? statusBadge(inv.status) : '—') + '</td>';
      html += '<td>' + fmtMoney(inv.marketValue) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<p style="font-size:.78rem;color:var(--muted,#888);margin:4px 0 0">' + invs.length + ' investment(s) · Total: ' + fmtMoney(Q.totalInvestmentValue(invs)) + '</p>';
    return html;
  }

  function applyFilterBtn(filterType, filterValue) {
    var payload = JSON.stringify({ type: filterType, value: filterValue });
    return '<button class="ai-apply-btn" onclick="window._aiApplyFilter(' + esc(payload) + ')">Apply filter in registry ↗</button>';
  }

  /* ─────────────────────────────────────────────
     6.  INTENT EXECUTOR
  ───────────────────────────────────────────── */
  function executeIntent(intent) {
    var html = '';
    var companies, jur, status, banks;

    switch (intent.type) {

      case 'greeting':
        return 'Hello! I\'m the FamOfi Registry Assistant. Ask me anything about the entities, accounts, investments, shareholders, or overall structure. What would you like to know?';

      case 'help':
        return [
          '<strong>Here\'s what I can help you with:</strong><br><br>',
          '<strong>Entity queries</strong><br>',
          '&bull; "Which entities have an account at JP Morgan?"<br>',
          '&bull; "Show me all active companies in Uruguay"<br>',
          '&bull; "Active entities in BVI with a Santander account"<br>',
          '&bull; "Which entities have no bank accounts?"<br>',
          '&bull; "List all entities"<br><br>',
          '<strong>Entity details</strong><br>',
          '&bull; "Tell me about [Entity Name]"<br>',
          '&bull; "What is the director of [Entity]?"<br>',
          '&bull; "What jurisdiction is [Entity] in?"<br>',
          '&bull; "What bank accounts does [Entity] have?"<br>',
          '&bull; "When was [Entity] incorporated?"<br><br>',
          '<strong>Investments</strong><br>',
          '&bull; "How many investments do we have?"<br>',
          '&bull; "What is the total portfolio value?"<br>',
          '&bull; "Show investments for [Entity Name]"<br><br>',
          '<strong>Shareholders</strong><br>',
          '&bull; "Who are the shareholders of [Entity]?"<br>',
          '&bull; "Which entities does [Person] own?"<br><br>',
          '<strong>Analytics &amp; breakdowns</strong><br>',
          '&bull; "Breakdown by jurisdiction"<br>',
          '&bull; "Breakdown by status"<br>',
          '&bull; "Which banks do we use?"<br>',
          '&bull; "Compare [Entity A] and [Entity B]"<br>',
          '&bull; "Registry overview"<br><br>',
          '<em>Tip: You can combine filters — "active entities in Panama with a Banco General account" — or ask in Spanish.</em>',
        ].join('');

      case 'registry_overview':
        var st = Q.stats();
        var statusMap = Q.groupByStatus();
        html = '<strong>FamOfi Registry — Overview</strong><br><br>';
        html += '<div class="ai-stat-row">';
        html += '<div class="ai-stat"><div class="ai-stat-value">' + st.total + '</div><div class="ai-stat-label">Total Entities</div></div>';
        html += '<div class="ai-stat"><div class="ai-stat-value">' + st.withBanking + '</div><div class="ai-stat-label">With Banking</div></div>';
        html += '<div class="ai-stat"><div class="ai-stat-value">' + st.withoutBanking + '</div><div class="ai-stat-label">No Bank Account</div></div>';
        html += '<div class="ai-stat"><div class="ai-stat-value">' + st.investmentCount + '</div><div class="ai-stat-label">Investments</div></div>';
        html += '<div class="ai-stat"><div class="ai-stat-value">' + fmtMoney(st.totalInvValue) + '</div><div class="ai-stat-label">Portfolio Value</div></div>';
        html += '</div><br>';
        html += '<strong>Status breakdown:</strong><br><div class="ai-stat-row">';
        Object.keys(statusMap).sort().forEach(function (s) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + statusMap[s].length + '</div><div class="ai-stat-label">' + statusBadge(s) + '</div></div>';
        });
        html += '</div>';
        return html;

      case 'list_all':
        companies = Q.all().slice().sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
        html = 'All <strong>' + companies.length + '</strong> entities in the registry:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'type']);
        return html;

      case 'count_companies':
        if (intent.status) {
          companies = Q.byStatus(intent.status);
          var dispStatus = intent.status.charAt(0).toUpperCase() + intent.status.slice(1);
          return '<strong>' + companies.length + '</strong> ' + dispStatus + ' entity/entities in the registry.';
        }
        return 'There are <strong>' + Q.all().length + '</strong> total entities in the FamOfi Registry.';

      case 'count_investments':
        return 'There are <strong>' + Q.investments().length + '</strong> investments in the registry.';

      case 'total_inv_value':
        var total = Q.totalInvestmentValue();
        return 'The total portfolio market value is <strong>' + fmtMoney(total) + '</strong> across ' + Q.investments().length + ' investments.';

      case 'by_bank':
        companies = Q.byBank(intent.bank);
        html = '<strong>' + companies.length + '</strong> entity/entities with a <strong>' + esc(intent.bank) + '</strong> account:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'banks']);
        if (companies.length) html += '<div class="ai-action-row">' + applyFilterBtn('bank', intent.bank) + '</div>';
        return html;

      case 'list_banks':
        banks = Q.groupByBank();
        var bankNames = Object.keys(banks).sort(function (a, b) { return banks[b].length - banks[a].length; });
        html = '<strong>Banks in use across the registry:</strong><br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Bank</th><th>Entities</th></tr></thead><tbody>';
        bankNames.forEach(function (bn) {
          html += '<tr><td>' + esc(bn) + '</td><td>' + banks[bn].length + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'multiple_banks':
        companies = Q.withMultipleBanks();
        html = '<strong>' + companies.length + '</strong> entity/entities with accounts at multiple banks:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'banks']);
        return html;

      case 'with_banking':
        companies = Q.withBanking();
        html = '<strong>' + companies.length + '</strong> entity/entities with at least one bank account:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'banks']);
        return html;

      case 'no_banking':
        companies = Q.withoutBanking();
        html = '<strong>' + companies.length + '</strong> entity/entities without any bank account on file:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status']);
        if (companies.length) html += '<div class="ai-action-row">' + applyFilterBtn('no_bank', null) + '</div>';
        return html;

      case 'breakdown_by_bank':
        var byBank = Q.groupByBank();
        var bkNames = Object.keys(byBank).sort(function (a, b) { return byBank[b].length - byBank[a].length; });
        html = '<strong>Entities by bank:</strong><br><br>';
        html += '<div class="ai-stat-row">';
        bkNames.forEach(function (bn) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + byBank[bn].length + '</div><div class="ai-stat-label">' + esc(bn) + '</div></div>';
        });
        html += '</div>';
        return html;

      case 'by_jurisdiction':
        companies = Q.byJurisdiction(intent.jurisdiction);
        html = '<strong>' + companies.length + '</strong> entity/entities in <strong>' + esc(intent.jurisdiction) + '</strong>:<br><br>';
        html += companyTable(companies, ['name', 'status', 'type', 'banks']);
        if (companies.length) html += '<div class="ai-action-row">' + applyFilterBtn('jurisdiction', intent.jurisdiction) + '</div>';
        return html;

      case 'breakdown_by_jurisdiction':
        var byJur = Q.groupByJurisdiction();
        var jurNames = Object.keys(byJur).sort(function (a, b) { return byJur[b].length - byJur[a].length; });
        html = '<strong>Entities by jurisdiction:</strong><br><br><div class="ai-stat-row">';
        jurNames.forEach(function (j) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + byJur[j].length + '</div><div class="ai-stat-label">' + esc(j) + '</div></div>';
        });
        html += '</div>';
        html += '<br>' + companyTable(Q.all().slice().sort(function(a,b){return(a.jurisdiction||'').localeCompare(b.jurisdiction||'');}), ['name','jurisdiction','status']);
        return html;

      case 'by_status':
        companies = Q.byStatus(intent.status);
        var bsDisp = intent.status.charAt(0).toUpperCase() + intent.status.slice(1);
        html = '<strong>' + companies.length + '</strong> ' + esc(bsDisp) + ' entity/entities:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'type', 'banks']);
        if (companies.length) html += '<div class="ai-action-row">' + applyFilterBtn('status', intent.status) + '</div>';
        return html;

      case 'breakdown_by_status':
        var byStatus = Q.groupByStatus();
        var statusNames = Object.keys(byStatus).sort(function(a,b){ return byStatus[b].length - byStatus[a].length; });
        html = '<strong>Entities by status:</strong><br><br><div class="ai-stat-row">';
        statusNames.forEach(function(s) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + byStatus[s].length + '</div><div class="ai-stat-label">' + statusBadge(s) + '</div></div>';
        });
        html += '</div>';
        return html;

      case 'by_type':
        companies = Q.byType(intent.type);
        html = '<strong>' + companies.length + '</strong> entity/entities of type <strong>' + esc(intent.type) + '</strong>:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status']);
        return html;

      case 'breakdown_by_type':
        var byType2 = Q.groupByType();
        var typeNames2 = Object.keys(byType2).sort(function(a,b){ return byType2[b].length - byType2[a].length; });
        html = '<strong>Entities by type:</strong><br><br><div class="ai-stat-row">';
        typeNames2.forEach(function(t) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + byType2[t].length + '</div><div class="ai-stat-label">' + esc(t) + '</div></div>';
        });
        html += '</div>';
        return html;

      case 'list_directors':
        var dirMap = {};
        Q.all().forEach(function(c) {
          if (!c.director) return;
          if (!dirMap[c.director]) dirMap[c.director] = [];
          dirMap[c.director].push(c);
        });
        var dirNames = Object.keys(dirMap).sort();
        html = '<strong>' + dirNames.length + '</strong> director(s) in the registry:<br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Director</th><th>Entities</th><th>Count</th></tr></thead><tbody>';
        dirNames.forEach(function(d) {
          html += '<tr><td>' + esc(d) + '</td><td>' + dirMap[d].map(function(c){ return entityLink(c); }).join(', ') + '</td><td>' + dirMap[d].length + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'by_year':
        companies = Q.byYear(intent.year);
        html = '<strong>' + companies.length + '</strong> entity/entities founded/incorporated in <strong>' + esc(intent.year) + '</strong>:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'type']);
        return html;

      case 'compound_query':
        var condResults = Q.applyConditions(intent.conditions);
        var condParts = [];
        if (intent.conditions.status) condParts.push(intent.conditions.status.charAt(0).toUpperCase() + intent.conditions.status.slice(1));
        if (intent.conditions.jurisdiction) condParts.push('in ' + intent.conditions.jurisdiction);
        if (intent.conditions.bank) condParts.push('with ' + intent.conditions.bank);
        if (intent.conditions.type) condParts.push(intent.conditions.type);
        html = '<strong>' + condResults.length + '</strong> entity/entities — ' + esc(condParts.join(', ')) + ':<br><br>';
        html += companyTable(condResults, ['name', 'jurisdiction', 'status', 'type', 'banks']);
        return html;

      case 'field_lookup':
        var flCo = intent.company;
        var fieldLabels = {
          jurisdiction: 'Jurisdiction', director: 'Director', banking: 'Bank Accounts',
          status: 'Status', yearFounded: 'Year Founded / Incorporated', address: 'Address',
          shareholders: 'Shareholders', registeredAgent: 'Registered Agent',
          fiscalId: 'Fiscal ID / EIN', tags: 'Tags', type: 'Type / Purpose',
          notes: 'Notes', currency: 'Currency', investments: 'Investments'
        };
        html = '<strong>' + esc(flCo.name) + '</strong> — ' + esc(fieldLabels[intent.field] || intent.field) + ':<br><br>';
        if (intent.field === 'banking') {
          if (!flCo.banking || !flCo.banking.length) {
            return '<strong>' + esc(flCo.name) + '</strong> has no bank accounts on file.';
          }
          html += '<ul style="margin:4px 0;padding-left:20px">';
          flCo.banking.forEach(function(b) {
            html += '<li><strong>' + esc(b.bank || '?') + '</strong>';
            if (b.type) html += ' · ' + esc(b.type);
            if (b.currency) html += ' · ' + esc(b.currency);
            html += '</li>';
          });
          html += '</ul>';
        } else if (intent.field === 'shareholders') {
          return executeIntent({ type: 'shareholders_of', company: flCo });
        } else if (intent.field === 'investments') {
          return executeIntent({ type: 'entity_investments', company: flCo });
        } else if (intent.field === 'status') {
          html += flCo.status ? statusBadge(flCo.status) : '—';
        } else if (intent.field === 'currency') {
          var curs = [];
          (flCo.banking || []).forEach(function(b) { if (b.currency && curs.indexOf(b.currency) === -1) curs.push(b.currency); });
          html += curs.length ? esc(curs.join(', ')) : '—';
        } else if (intent.field === 'tags') {
          html += flCo.tags && flCo.tags.length ? flCo.tags.map(esc).join(', ') : '—';
        } else {
          var val = flCo[intent.field];
          if (Array.isArray(val)) val = val.join(', ');
          html += val ? esc(String(val)) : '—';
        }
        html += '<div class="ai-action-row"><button class="ai-apply-btn" onclick="window._aiOpenCompany(' + JSON.stringify(flCo.id) + ')">Open in Registry ↗</button></div>';
        return html;

      case 'shareholders_of':
        var co = intent.company;
        if (!co.shareholders || co.shareholders.length === 0) {
          return 'No shareholders on record for <strong>' + esc(co.name) + '</strong>.';
        }
        html = '<strong>Shareholders of ' + esc(co.name) + ':</strong><br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Shareholder</th><th>Ownership %</th><th>Class</th><th>Type</th></tr></thead><tbody>';
        co.shareholders.forEach(function (sh) {
          var name = typeof window.resolveOwner === 'function' ? window.resolveOwner(sh) : (sh.person || sh.id || '?');
          var ownerCompany = Q.byId(sh.id || sh.person);
          var nameHtml = ownerCompany ? entityLink(ownerCompany) : esc(name);
          html += '<tr><td>' + nameHtml + '</td><td>' + esc(sh.pct || '—') + '%</td><td>' + esc(sh.class || '—') + '</td><td>' + esc(sh.type || '—') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'entities_by_shareholder':
        var shCompanies = Q.byShareholder(intent.shareholder);
        if (!shCompanies.length) return 'No entities found where <strong>' + esc(intent.shareholder) + '</strong> appears as a shareholder.';
        html = '<strong>' + shCompanies.length + '</strong> entity/entities where <strong>' + esc(intent.shareholder) + '</strong> is a shareholder:<br><br>';
        html += companyTable(shCompanies, ['name', 'jurisdiction', 'status', 'shareholders']);
        return html;

      case 'all_shareholders':
        var shMap = {};
        Q.all().forEach(function (c) {
          if (!c.shareholders) return;
          c.shareholders.forEach(function (sh) {
            var name = typeof window.resolveOwner === 'function' ? window.resolveOwner(sh) : (sh.person || sh.id || '?');
            if (!shMap[name]) shMap[name] = { name: name, companies: [], isCompany: sh.type === 'company' };
            shMap[name].companies.push(c);
          });
        });
        var shList = Object.keys(shMap).sort();
        html = '<strong>' + shList.length + '</strong> unique shareholders in the registry:<br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Shareholder</th><th>Type</th><th>Entities Owned</th></tr></thead><tbody>';
        shList.forEach(function (name) {
          var entry = shMap[name];
          html += '<tr><td>' + esc(name) + '</td><td>' + (entry.isCompany ? 'Company' : 'Individual') + '</td><td>' + entry.companies.map(function(c){ return entityLink(c); }).join(', ') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'entity_investments':
        var entityCo = intent.company;
        var invs = Q.investmentsFor(entityCo.id);
        if (!invs.length) return '<strong>' + esc(entityCo.name) + '</strong> has no investments on record.';
        html = '<strong>' + invs.length + '</strong> investment(s) for ' + entityLink(entityCo) + ':<br><br>';
        html += investmentTable(invs);
        return html;

      case 'with_investments':
        companies = Q.withInvestments();
        html = '<strong>' + companies.length + '</strong> entity/entities with at least one investment:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'inv_count', 'inv_value']);
        return html;

      case 'without_investments':
        companies = Q.withoutInvestments();
        html = '<strong>' + companies.length + '</strong> entity/entities with no investments:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status']);
        return html;

      case 'largest_investments':
        var topInvs = Q.investments().slice().sort(function (a, b) {
          return (parseFloat(b.marketValue) || 0) - (parseFloat(a.marketValue) || 0);
        }).slice(0, 20);
        html = 'Top investments by market value:<br><br>';
        html += investmentTable(topInvs);
        return html;

      case 'list_investments':
        html = 'All <strong>' + Q.investments().length + '</strong> investments:<br><br>';
        html += investmentTable(Q.investments().slice(0, 50));
        if (Q.investments().length > 50) html += '<p style="font-size:.8rem;color:var(--muted,#888)">Showing first 50. Ask about a specific entity or type for more focused results.</p>';
        return html;

      case 'investments_by_type':
        var byType = Q.investmentsByType();
        if (intent.invType) {
          var lType = intent.invType.toLowerCase();
          var matchType = Object.keys(byType).find ? Object.keys(byType).find(function (t) { return t.toLowerCase().indexOf(lType) !== -1; }) : null;
          if (!matchType) {
            Object.keys(byType).forEach(function(t){ if (t.toLowerCase().indexOf(lType) !== -1) matchType = t; });
          }
          if (matchType) {
            html = '<strong>' + byType[matchType].length + '</strong> investments of type <strong>' + esc(matchType) + '</strong>:<br><br>';
            html += investmentTable(byType[matchType]);
            return html;
          }
        }
        var typeNames = Object.keys(byType).sort(function (a, b) { return byType[b].length - byType[a].length; });
        html = '<strong>Investments by type:</strong><br><br><div class="ai-stat-row">';
        typeNames.forEach(function (t) {
          html += '<div class="ai-stat"><div class="ai-stat-value">' + byType[t].length + '</div><div class="ai-stat-label">' + esc(t) + '</div></div>';
        });
        html += '</div>';
        return html;

      case 'missing_info':
        companies = Q.missingInfo();
        html = '<strong>' + companies.length + '</strong> entity/entities with missing or incomplete information:<br><br>';
        html += companyTable(companies, ['name', 'jurisdiction', 'status', 'banks']);
        return html;

      case 'compare':
        if (!intent.companies || intent.companies.length < 2) {
          return 'Please name two entities to compare. For example: <em>"Compare Acme LLC and Beta Corp."</em>';
        }
        var coA = intent.companies[0], coB = intent.companies[1];
        var invsA = Q.investmentsFor(coA.id), invsB = Q.investmentsFor(coB.id);
        html = '<strong>Comparison:</strong><br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Attribute</th><th>' + esc(coA.name) + '</th><th>' + esc(coB.name) + '</th></tr></thead><tbody>';
        var rows = [
          ['Status', coA.status ? statusBadge(coA.status) : '—', coB.status ? statusBadge(coB.status) : '—'],
          ['Jurisdiction', esc(coA.jurisdiction || '—'), esc(coB.jurisdiction || '—')],
          ['Type', esc(coA.purpose || coA.type || '—'), esc(coB.purpose || coB.type || '—')],
          ['Director', esc(coA.director || '—'), esc(coB.director || '—')],
          ['Year Founded', esc(coA.yearFounded || '—'), esc(coB.yearFounded || '—')],
          ['Banks', coA.banking && coA.banking.length ? coA.banking.map(function(b){return esc(b.bank||'?');}).join(', ') : '—',
                    coB.banking && coB.banking.length ? coB.banking.map(function(b){return esc(b.bank||'?');}).join(', ') : '—'],
          ['Shareholders', String(coA.shareholders ? coA.shareholders.length : 0), String(coB.shareholders ? coB.shareholders.length : 0)],
          ['Investments', String(invsA.length), String(invsB.length)],
          ['Portfolio Value', fmtMoney(Q.totalInvestmentValue(invsA)), fmtMoney(Q.totalInvestmentValue(invsB))],
        ];
        rows.forEach(function (r) {
          html += '<tr><td><strong>' + r[0] + '</strong></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'related':
        var relCo = intent.company;
        var related = Q.relatedCompanies(relCo.id);
        if (!related.length) return 'No related entities found for <strong>' + esc(relCo.name) + '</strong> based on shareholder relationships.';
        html = '<strong>Related entities for ' + esc(relCo.name) + ':</strong><br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Entity</th><th>Relationship</th><th>Jurisdiction</th><th>Status</th></tr></thead><tbody>';
        related.forEach(function (r) {
          html += '<tr><td>' + entityLink(r.company) + '</td><td>' + esc(r.relation) + '</td><td>' + esc(r.company.jurisdiction || '—') + '</td><td>' + (r.company.status ? statusBadge(r.company.status) : '—') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        return html;

      case 'entity_summary':
        var sumCo = intent.company;
        var sumInvs = Q.investmentsFor(sumCo.id);
        html = '<strong>' + esc(sumCo.name) + '</strong> — Full Summary<br><br>';
        html += '<div class="ai-table-wrap"><table class="ai-table"><tbody>';
        var fields = [
          ['Status', sumCo.status ? statusBadge(sumCo.status) : '—'],
          ['Jurisdiction', esc(sumCo.jurisdiction || '—')],
          ['Type / Purpose', esc(sumCo.purpose || sumCo.type || '—')],
          ['Year Founded', esc(sumCo.yearFounded || '—')],
          ['Director', esc(sumCo.director || '—')],
          ['Registered Agent', esc(sumCo.registeredAgent || '—')],
          ['Fiscal ID', esc(sumCo.fiscalId || sumCo.ein || sumCo.irs || '—')],
          ['Address', esc(sumCo.address || '—')],
          ['Tags', sumCo.tags && sumCo.tags.length ? sumCo.tags.map(esc).join(', ') : '—'],
        ];
        fields.forEach(function (f) {
          if (f[1] && f[1] !== '—') {
            html += '<tr><td style="width:160px;font-weight:600;white-space:nowrap">' + f[0] + '</td><td>' + f[1] + '</td></tr>';
          }
        });
        html += '</tbody></table></div><br>';

        if (sumCo.banking && sumCo.banking.length) {
          html += '<strong>Bank Accounts (' + sumCo.banking.length + '):</strong><br>';
          html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Bank</th><th>Type</th><th>Currency</th></tr></thead><tbody>';
          sumCo.banking.forEach(function (b) {
            html += '<tr><td>' + esc(b.bank || '—') + '</td><td>' + esc(b.type || '—') + '</td><td>' + esc(b.currency || '—') + '</td></tr>';
          });
          html += '</tbody></table></div><br>';
        } else {
          html += '<strong>Bank Accounts:</strong> None on file<br><br>';
        }

        if (sumCo.shareholders && sumCo.shareholders.length) {
          html += '<strong>Shareholders (' + sumCo.shareholders.length + '):</strong><br>';
          html += '<div class="ai-table-wrap"><table class="ai-table"><thead><tr><th>Shareholder</th><th>%</th><th>Class</th></tr></thead><tbody>';
          sumCo.shareholders.forEach(function (sh) {
            var name = typeof window.resolveOwner === 'function' ? window.resolveOwner(sh) : (sh.person || sh.id || '?');
            var ownerCo = Q.byId(sh.id || sh.person);
            var nameHtml = ownerCo ? entityLink(ownerCo) : esc(name);
            html += '<tr><td>' + nameHtml + '</td><td>' + esc(sh.pct || '—') + '</td><td>' + esc(sh.class || '—') + '</td></tr>';
          });
          html += '</tbody></table></div><br>';
        }

        if (sumInvs.length) {
          html += '<strong>Investments (' + sumInvs.length + ' · ' + fmtMoney(Q.totalInvestmentValue(sumInvs)) + ' total MV):</strong><br>';
          html += investmentTable(sumInvs);
          html += '<br>';
        } else {
          html += '<strong>Investments:</strong> None on file<br><br>';
        }

        if (sumCo.notes) {
          html += '<strong>Notes:</strong><br><span style="font-size:.85rem;opacity:.8">' + esc(sumCo.notes) + '</span><br><br>';
        }

        html += '<div class="ai-action-row"><button class="ai-apply-btn" onclick="window._aiOpenCompany(' + JSON.stringify(sumCo.id) + ')">Open in Registry ↗</button></div>';
        return html;

      case 'smart_search':
        var searchResults = Q.search(intent.query);
        if (searchResults.length === 1) {
          // Single match — show full summary
          return executeIntent({ type: 'entity_summary', company: searchResults[0] });
        }
        if (searchResults.length > 0) {
          html = '<strong>' + searchResults.length + '</strong> entity/entities matching <em>"' + esc(intent.query) + '"</em>:<br><br>';
          html += companyTable(searchResults, ['name', 'jurisdiction', 'status', 'type']);
          return html;
        }
        // Nothing found — suggest
        return 'I couldn\'t find anything matching <em>"' + esc(intent.query) + '"</em> in the registry.<br><br>' +
               'Try asking differently, name an entity directly, or type <em>help</em> to see what I can do.<br>' +
               'You can also ask: <em>"list all entities"</em> or <em>"registry overview"</em>.';

      default:
        return 'I\'m not sure I understood that. Try asking something like:<br>' +
               '&bull; "Which entities have a JP Morgan account?"<br>' +
               '&bull; "Active companies in Panama"<br>' +
               '&bull; "Tell me about [Entity Name]"<br>' +
               '&bull; "Registry overview"<br><br>' +
               'Type <em>help</em> for a full list of what I can do.';
    }
  }

  /* ─────────────────────────────────────────────
     7.  APPLY FILTER (bridge to registry)
  ───────────────────────────────────────────── */
  window._aiApplyFilter = function (payloadStr) {
    try {
      var payload = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
      if (typeof window.go === 'function') {
        window.go('companies');
      }
      setTimeout(function () {
        if (payload.type === 'jurisdiction' && payload.value) {
          if (typeof window.cJur !== 'undefined') window.cJur = payload.value;
          var jurSel = document.querySelector('#jur-filter, select[data-filter="jurisdiction"]');
          if (jurSel) { jurSel.value = payload.value; jurSel.dispatchEvent(new Event('change')); }
        }
        if (payload.type === 'status' && payload.value) {
          if (typeof window.cStatus !== 'undefined') window.cStatus = payload.value;
          var stSel = document.querySelector('#status-filter, select[data-filter="status"]');
          if (stSel) { stSel.value = payload.value; stSel.dispatchEvent(new Event('change')); }
        }
        if (payload.type === 'bank' && payload.value) {
          var search = document.querySelector('#company-search, input[type="search"]');
          if (search) {
            search.value = payload.value;
            search.dispatchEvent(new Event('input'));
          }
        }
        if (typeof window.rerenderMain === 'function') window.rerenderMain();
      }, 300);
    } catch (e) {}
  };

  /* ─────────────────────────────────────────────
     8.  OPEN COMPANY (bridge to registry)
  ───────────────────────────────────────────── */
  window._aiOpenCompany = function (companyId) {
    if (typeof window.openCompany === 'function') {
      window.openCompany(companyId);
    } else {
      if (typeof window.go === 'function') window.go('companies');
      setTimeout(function () {
        if (typeof window.openCompany === 'function') window.openCompany(companyId);
      }, 400);
    }
  };

  /* ─────────────────────────────────────────────
     9.  CHAT STATE
  ───────────────────────────────────────────── */
  var chatHistory = [];
  var lastEntityContext = null;
  var isProcessing = false;

  function addMessage(role, content, isHtml) {
    chatHistory.push({ role: role, content: content, isHtml: !!isHtml });
  }

  function renderMessages() {
    var body = document.getElementById('ai-body');
    if (!body) return;
    body.innerHTML = '';

    if (chatHistory.length === 0) {
      body.innerHTML = '<div id="ai-suggestions"><div style="width:100%;font-size:.82rem;color:var(--muted,#888);margin-bottom:4px">Try asking…</div>' + getSuggestedQuestions().map(function (q) {
        return '<button class="ai-chip" onclick="window._aiAskSuggestion(' + JSON.stringify(q) + ')">' + esc(q) + '</button>';
      }).join('') + '</div>';
      return;
    }

    chatHistory.forEach(function (msg) {
      var isUser = msg.role === 'user';
      var div = document.createElement('div');
      div.className = 'ai-msg ' + (isUser ? 'user' : 'assistant');

      var avatar = document.createElement('div');
      avatar.className = 'ai-avatar';
      avatar.textContent = isUser ? '👤' : '🤖';

      var bubble = document.createElement('div');
      bubble.className = 'ai-bubble';
      if (msg.isHtml) {
        bubble.innerHTML = msg.content;
      } else {
        bubble.textContent = msg.content;
      }

      if (isUser) {
        div.appendChild(bubble);
        div.appendChild(avatar);
      } else {
        div.appendChild(avatar);
        div.appendChild(bubble);
      }
      body.appendChild(div);
    });

    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var body = document.getElementById('ai-body');
    if (!body) return;
    var div = document.createElement('div');
    div.className = 'ai-msg assistant';
    div.id = 'ai-typing-indicator';

    var avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.textContent = '🤖';

    var bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    bubble.innerHTML = '<div class="ai-typing"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>';

    div.appendChild(avatar);
    div.appendChild(bubble);
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ai-typing-indicator');
    if (el) el.parentNode.removeChild(el);
  }

  function getSuggestedQuestions() {
    var all = Q.all();
    var banks = Q.bankList();
    var jurs = Q.jurisdictionList();
    var suggestions = [
      'Registry overview',
      'Show me all active companies',
      'Which entities have no bank account?',
      'Breakdown by jurisdiction',
      'What is the total portfolio value?',
    ];
    if (banks.length > 0) suggestions.push('Which entities have a ' + banks[0] + ' account?');
    if (jurs.length > 0) suggestions.push('Entities in ' + jurs[0]);
    if (all.length > 0) {
      var randomCo = all[Math.floor(Math.random() * Math.min(all.length, 20))];
      suggestions.push('Tell me about ' + randomCo.name);
    }
    return suggestions.slice(0, 6);
  }

  window._aiAskSuggestion = function (q) {
    var input = document.getElementById('ai-input');
    if (input) { input.value = q; }
    aiSend(q);
  };

  function resolveFollowUp(question) {
    var lq = question.toLowerCase();
    if (lastEntityContext) {
      if (/\b(it|this|that|its|their|the company|the entity|the llc|the corp|esta|ese|esa|esta empresa)\b/.test(lq)) {
        question = question + ' ' + lastEntityContext.name;
      }
    }
    return question;
  }

  function aiSend(question) {
    if (!question) {
      var input = document.getElementById('ai-input');
      question = input ? input.value.trim() : '';
    }
    if (!question || isProcessing) return;

    var input = document.getElementById('ai-input');
    if (input) input.value = '';

    if (!window.data || !window.data.companies) {
      addMessage('user', question, false);
      addMessage('assistant', '⚠️ Registry data is still loading. Please try again in a moment.', false);
      renderMessages();
      return;
    }

    var resolved = resolveFollowUp(question);

    addMessage('user', question, false);
    renderMessages();
    showTyping();
    isProcessing = true;
    setSendDisabled(true);

    setTimeout(function () {
      try {
        var intent = parseIntent(resolved);
        var response = executeIntent(intent);
        if (intent.company) lastEntityContext = intent.company;
        else if (intent.type === 'unknown' || intent.type === 'smart_search') { /* keep last context */ }
        else lastEntityContext = null;

        hideTyping();
        addMessage('assistant', response, true);
        renderMessages();
      } catch (e) {
        hideTyping();
        addMessage('assistant', '⚠️ Something went wrong processing your question. Please try rephrasing it.', false);
        renderMessages();
        console.error('[AI Assistant]', e);
      }
      isProcessing = false;
      setSendDisabled(false);
    }, 320);
  }

  function setSendDisabled(disabled) {
    var btn = document.getElementById('ai-send');
    if (btn) btn.disabled = disabled;
    var input = document.getElementById('ai-input');
    if (input) input.disabled = disabled;
  }

  /* ─────────────────────────────────────────────
     10.  UI RENDERING
  ───────────────────────────────────────────── */
  window.renderAI = function () {
    injectCSS();
    var main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = [
      '<div id="ai-root">',
      '  <div id="ai-header">',
      '    <h2>🤖 AI Assistant</h2>',
      '    <p>Ask anything about entities, accounts, investments, shareholders, and more. Works in English and Spanish.</p>',
      '  </div>',
      '  <div id="ai-body"></div>',
      '  <div id="ai-footer">',
      '    <div id="ai-form">',
      '      <textarea id="ai-input" placeholder="Ask anything about the registry…" rows="1"></textarea>',
      '      <button id="ai-send">Send</button>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    renderMessages();

    var sendBtn = document.getElementById('ai-send');
    var inputEl = document.getElementById('ai-input');

    if (sendBtn) {
      sendBtn.addEventListener('click', function () { aiSend(); });
    }

    if (inputEl) {
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          aiSend();
        }
      });
      inputEl.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
      setTimeout(function () { inputEl.focus(); }, 50);
    }
  };

  /* ─────────────────────────────────────────────
     11.  ROUTING INTEGRATION
  ───────────────────────────────────────────── */
  function patchRouting() {
    if (window.TT) {
      if (window.TT.en) window.TT.en.ai = 'AI Assistant';
      if (window.TT.es) window.TT.es.ai = 'Asistente IA';
    }

    if (window.pages && window.pages.indexOf('ai') === -1) {
      window.pages.push('ai');
    }

    if (typeof window.render === 'function' && !window._aiRenderPatched) {
      var _origRender = window.render;
      window.render = function () {
        if (typeof window.page !== 'undefined' && window.page === 'ai') {
          var nav = document.getElementById('nav');
          if (nav) {
            nav.innerHTML = '';
            (window.pages || []).forEach(function (p) {
              if (typeof window.canSeeTab === 'function' && !window.canSeeTab(p)) return;
              var b = document.createElement('button');
              b.textContent = typeof window.t === 'function' ? window.t(p) : p;
              b.className = p === window.page ? 'active' : '';
              b.onclick = function () { window.go(p); };
              nav.appendChild(b);
            });
          }
          if (typeof window.destroyCharts === 'function') window.destroyCharts();
          window.renderAI();
          return;
        }
        _origRender.apply(this, arguments);
      };
      window._aiRenderPatched = true;
    }
  }

  /* ─────────────────────────────────────────────
     12.  BOOTSTRAP
  ───────────────────────────────────────────── */
  function boot() {
    var ready = typeof window.go === 'function' &&
                typeof window.render === 'function' &&
                typeof window.pages !== 'undefined' &&
                typeof window.canSeeTab === 'function';
    if (!ready) {
      setTimeout(boot, 200);
      return;
    }
    patchRouting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
