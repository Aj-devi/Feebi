/* Full app JS (PWA-ready) */
/* Features:
   - Add/Edit/Delete items
   - Categories (Option B style)
   - Charts (Chart.js)
   - CSV export/import
   - Dark mode
   - localStorage persistence
*/

const STORAGE_KEY = 'myfinance_v3';

const INCOME_CATEGORIES = ["Job","Gift","Tips","Business","Other"];
const EXPENSE_CATEGORIES = ["Food","Rent","Utilities","Gas","Shopping","Health","Entertainment","Other"];
const FREQ_EARNING = ["Once","Weekly","Monthly","Yearly"];
const FREQ_EXPENSE = ["Once","Weekly","Biweekly","Monthly","Yearly"];
const PALETTE = ["#FF9AA2","#FFD1E8","#E8D1FF","#D1EEFF","#CFFFE4","#FFE7B7","#F3D6FF"];

let state = { items: [], settings: { dark: false } };

let barChart = null, pieChart = null;

// DOM refs
const appEl = document.getElementById('app');
const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
const screens = Array.from(document.querySelectorAll('main.screen'));
const summaryEarn = document.getElementById('summary-earn');
const summaryExp = document.getElementById('summary-exp');
const summaryNet = document.getElementById('summary-net');
const earnList = document.getElementById('earn-list');
const expList = document.getElementById('exp-list');
const statsList = document.getElementById('stats-list');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const segButtons = Array.from(document.querySelectorAll('.seg-btn'));
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const frequencyInput = document.getElementById('frequency');
const dateInput = document.getElementById('date');
const noteInput = document.getElementById('note');
const editIndexInput = document.getElementById('editIndex');

const quickAddEarning = document.getElementById('quickAddEarning');
const quickAddExpense = document.getElementById('quickAddExpense');
const saveItemBtn = document.getElementById('saveItem');
const cancelItemBtn = document.getElementById('cancelItem');
const darkToggle = document.getElementById('darkToggle');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const csvInput = document.getElementById('csvInput');

// init
init();

function init(){
  load();
  bindUI();
  initCharts();
  renderAll();
  applyTheme();
}

function bindUI(){
  navBtns.forEach(btn => btn.addEventListener('click', () => {
    navBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showScreen(btn.dataset.screen);
  }));
  quickAddEarning.addEventListener('click', ()=> openModalFor('earning'));
  quickAddExpense.addEventListener('click', ()=> openModalFor('expense'));
  modalClose.addEventListener('click', closeModal);
  cancelItemBtn.addEventListener('click', closeModal);
  saveItemBtn.addEventListener('click', saveFromModal);
  segButtons.forEach(b => b.addEventListener('click', ()=> {
    segButtons.forEach(x=>x.classList.remove('active')); b.classList.add('active');
    populateCategoryAndFreq(b.dataset.type);
  }));
  darkToggle.addEventListener('change', e => { state.settings.dark = e.target.checked; applyTheme(); save(); });
  clearAllBtn.addEventListener('click', ()=> {
    if (!confirm('Clear all data?')) return;
    state.items = []; save(); renderAll();
  });
  exportBtn.addEventListener('click', exportCSV);
  importBtn.addEventListener('click', ()=> csvInput.click());
  csvInput.addEventListener('change', handleCSVFile);
  showScreen('screen-home');
}

function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){console.error(e);} }
function load(){ try{ const raw = localStorage.getItem(STORAGE_KEY); if(raw) state = JSON.parse(raw); else state = {items:[], settings:{dark:false}};}catch(e){state={items:[],settings:{dark:false}};} }

function showScreen(id){ screens.forEach(s=>s.classList.add('hidden')); const el = document.getElementById(id); if(el) el.classList.remove('hidden'); }

function applyTheme(){ if(state.settings.dark){ appEl.classList.add('dark'); appEl.classList.remove('light'); darkToggle.checked=true;} else {appEl.classList.remove('dark'); appEl.classList.add('light'); darkToggle.checked=false;} }

function openModalFor(type, idx=-1){
  segButtons.forEach(b => b.classList.toggle('active', b.dataset.type === type));
  populateCategoryAndFreq(type);
  if (idx >=0){ const it = state.items[idx]; modalTitle.textContent='Edit Item'; nameInput.value=it.name; categoryInput.value=it.category; amountInput.value=it.amount; frequencyInput.value=it.frequency; dateInput.value=it.date||''; noteInput.value=it.note||''; editIndexInput.value=idx; } else { modalTitle.textContent = (type==='earning'?'Add Earning':'Add Expense'); nameInput.value=''; amountInput.value=''; dateInput.value=''; noteInput.value=''; editIndexInput.value=-1; }
  modal.classList.remove('hidden'); setTimeout(()=>nameInput.focus(),120);
}
function closeModal(){ modal.classList.add('hidden'); editIndexInput.value=-1; }
function populateCategoryAndFreq(type){ const cats = type==='earning'?INCOME_CATEGORIES:EXPENSE_CATEGORIES; categoryInput.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join(''); const freqs = type==='earning'?FREQ_EARNING:FREQ_EXPENSE; frequencyInput.innerHTML = freqs.map(f=>`<option value="${f}">${f}</option>`).join(''); }

function saveFromModal(){
  const type = segButtons.find(b=>b.classList.contains('active')).dataset.type;
  const name = nameInput.value.trim() || '(no name)';
  const category = categoryInput.value;
  const amount = parseFloat(amountInput.value) || 0;
  const frequency = frequencyInput.value;
  const date = dateInput.value || '';
  const note = noteInput.value || '';
  const item = { type, name, category, amount, frequency, date, note };
  const editIdx = parseInt(editIndexInput.value,10);
  if (!isNaN(editIdx) && editIdx >= 0) state.items[editIdx] = item; else state.items.push(item);
  save(); renderAll(); closeModal();
}

function renderAll(){ renderLists(); renderSummary(); renderStats(); updateCharts(); }
function renderLists(){
  earnList.innerHTML=''; expList.innerHTML='';
  state.items.forEach((it, idx) => {
    const el = document.createElement('div'); el.className='item';
    const left = document.createElement('div'); left.innerHTML=`<div style="font-weight:700">${escapeHtml(it.name)}</div><div class="meta">${escapeHtml(it.category)} • ${escapeHtml(it.frequency)} ${it.date? '• '+escapeHtml(it.date):''}</div>`;
    const right = document.createElement('div'); right.style.textAlign='right';
    const amt = document.createElement('div'); amt.className='amt'; amt.textContent=(it.type==='earning'?'+':'-')+formatCurrency(it.amount); amt.style.color = it.type==='earning'?'var(--plus)':'var(--minus)';
    const actions = document.createElement('div'); actions.style.marginTop='6px'; actions.innerHTML = `<button class="btn" onclick="window.appEdit(${idx})">Edit</button> <button class="btn ghost" onclick="window.appRemove(${idx})">Delete</button>`;
    right.appendChild(amt); right.appendChild(actions);
    el.appendChild(left); el.appendChild(right);
    if(it.type==='earning') earnList.appendChild(el); else expList.appendChild(el);
  });
}

function renderSummary(){ let earn=0, exp=0; state.items.forEach(it=>{ if(it.type==='earning') earn += Number(it.amount||0); else exp += Number(it.amount||0); }); summaryEarn.textContent = formatCurrency(earn); summaryExp.textContent = formatCurrency(exp); summaryNet.textContent = formatCurrency(earn - exp); }

function renderStats(){
  statsList.innerHTML='';
  const byCat = {}; EXPENSE_CATEGORIES.forEach(c=>byCat[c]=0);
  state.items.forEach(it=>{ if(it.type==='expense') byCat[it.category] = (byCat[it.category]||0) + Number(it.amount||0); });
  const entries = Object.entries(byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  if(entries.length === 0){ statsList.innerHTML='<div class="muted">No data yet — add expenses to see stats.</div>'; return; }
  entries.forEach(([cat,val])=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `<div><div style="font-weight:700">${escapeHtml(cat)}</div><div class="meta">Total spent</div></div><div style="text-align:right"><div class="amt">${formatCurrency(val)}</div></div>`;
    statsList.appendChild(el);
  });
}

// Charts
function initCharts(){
  // ensure canvases exist
  const barC = document.getElementById('barChart'); const pieC = document.getElementById('pieChart');
  if(!barC || !pieC) return;
  barChart = new Chart(barC.getContext('2d'), { type:'bar', data:{ labels:['Earnings','Expenses'], datasets:[{ label:'Amount', data:[0,0], backgroundColor:['rgba(126,231,184,0.9)','rgba(255,154,162,0.9)'] }] }, options:{ plugins:{ legend:{display:false} }, responsive:true, maintainAspectRatio:false } });
  pieChart = new Chart(pieC.getContext('2d'), { type:'pie', data:{ labels:[], datasets:[{ data:[], backgroundColor:[]} ] }, options:{ responsive:true, maintainAspectRatio:false } });
  updateCharts();
}

function updateCharts(){
  if(!barChart || !pieChart) return;
  let earn=0, exp=0; state.items.forEach(it=>{ if(it.type==='earning') earn += Number(it.amount||0); else exp += Number(it.amount||0); });
  barChart.data.datasets[0].data = [earn, exp]; barChart.update();
  const byCat = {}; EXPENSE_CATEGORIES.forEach(c=>byCat[c]=0); state.items.forEach(it=>{ if(it.type==='expense') byCat[it.category] = (byCat[it.category]||0) + Number(it.amount||0); });
  const labels = Object.keys(byCat).filter(k => byCat[k] > 0); const values = labels.map(l => byCat[l]); const colors = labels.map((_,i) => PALETTE[i % PALETTE.length]);
  pieChart.data.labels = labels; pieChart.data.datasets[0].data = values; pieChart.data.datasets[0].backgroundColor = colors; pieChart.update();
}

// Exposed actions
window.appEdit = function(idx){ openModalFor(state.items[idx].type, idx); };
window.appRemove = function(idx){ if(!confirm('Delete this item?')) return; state.items.splice(idx,1); save(); renderAll(); };

// CSV export/import
function exportCSV(){
  const rows = [['type','name','category','amount','frequency','date','note']];
  state.items.forEach(it => rows.push([it.type, it.name, it.category, it.amount, it.frequency, it.date, it.note]));
  const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='myfinance_export.csv'; a.click(); URL.revokeObjectURL(url);
}
function escapeCsv(val){ if(val===undefined||val===null) return ''; const s = String(val).replace(/"/g,'""'); if(s.includes(',')||s.includes('"')||s.includes('\n')) return `"${s}"`; return s; }
function handleCSVFile(e){ const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ev => { parseCSVandImport(ev.target.result); csvInput.value=''; }; reader.readAsText(f); }
function parseCSVandImport(text){
  const lines = text.split(/\r?\n/).filter(Boolean); if(lines.length < 2) { alert('CSV empty or incorrect'); return; }
  lines.shift();
  const result = [];
  lines.forEach(line => {
    const r = parseCSVLine(line);
    const obj = { type:r[0], name:r[1], category:r[2], amount:parseFloat(r[3])||0, frequency:r[4], date:r[5], note:r[6] };
    result.push(obj);
  });
  if(!confirm(`Import ${result.length} items and replace existing data? OK=replace, Cancel=append`)) state.items = state.items.concat(result); else state.items = result;
  save(); renderAll();
}
function parseCSVLine(line){
  const res=[]; let cur=''; let inQuotes=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(inQuotes){
      if(ch === '"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else { inQuotes=false; } } else cur+=ch;
    } else {
      if(ch === '"'){ inQuotes = true; } else if(ch === ','){ res.push(cur); cur=''; } else cur+=ch;
    }
  }
  res.push(cur); return res;
}

function formatCurrency(n){ return Number(n || 0).toLocaleString(undefined, {style:'currency', currency:'USD', maximumFractionDigits:2}); }
function escapeHtml(s){ if(s===undefined||s===null) return ''; return String(s).replace(/[&<>"'`=\/]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"}[c])); }
init();
