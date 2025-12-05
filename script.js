// Sections
const financeSection = document.getElementById('financeSection');
const gardenSection = document.getElementById('gardenSection');
const gamesSection = document.getElementById('gamesSection');
const storeSection = document.getElementById('storeSection');

document.getElementById('financeBtn').addEventListener('click', () => showSection(financeSection));
document.getElementById('gardenBtn').addEventListener('click', () => showSection(gardenSection));
document.getElementById('gamesBtn').addEventListener('click', () => showSection(gamesSection));
document.getElementById('storeBtn').addEventListener('click', () => showSection(storeSection));

function showSection(section) {
  [financeSection, gardenSection, gamesSection, storeSection].forEach(sec => sec.classList.remove('active'));
  section.classList.add('active');
}

// ==== FINANCE SYSTEM ====
let financeEntries = JSON.parse(localStorage.getItem('financeEntries')) || [];
function saveFinance() { localStorage.setItem('financeEntries', JSON.stringify(financeEntries)); displayFinance(); }
function displayFinance() {
  const list = document.getElementById('financeList');
  const totals = document.getElementById('financeTotals');
  list.innerHTML = '';
  let totalEarnings = 0, totalExpenses = 0;
  financeEntries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - $${entry.amount} (${entry.type}) | ${entry.frequency} | ${entry.date || ''} | ${entry.note || ''}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => { financeEntries.splice(i,1); saveFinance(); };
    li.appendChild(removeBtn);
    list.appendChild(li);
    if(entry.type==='earning') totalEarnings+=entry.amount;
    else totalExpenses+=entry.amount;
  });
  totals.textContent = `Total Earnings: $${totalEarnings} | Total Expenses: $${totalExpenses} | Net: $${totalEarnings-totalExpenses}`;
}
document.getElementById('addEntryBtn').addEventListener('click', ()=>{
  const name=document.getElementById('entryName').value;
  const amount=Number(document.getElementById('entryAmount').value);
  const type=document.getElementById('entryType').value;
  const frequency=document.getElementById('entryFrequency').value;
  const date=document.getElementById('entryDate').value;
  const note=document.getElementById('entryNote').value;
  if(name && amount){ financeEntries.push({name, amount, type, frequency, date, note}); saveFinance(); }
});
displayFinance();

// ==== RESOURCES ====
let water = Number(localStorage.getItem('water'))||3;
let food = Number(localStorage.getItem('food'))||3;
let coins = Number(localStorage.getItem('coins'))||0;
const waterDisplay=document.getElementById('waterCount');
const foodDisplay=document.getElementById('foodCount');
const coinsDisplay=document.getElementById('coins');
function saveResources(){ localStorage.setItem('water', water); localStorage.setItem('food', food); localStorage.setItem('coins', coins); updateResourceDisplay(); }
function updateResourceDisplay(){ waterDisplay.textContent=water; foodDisplay.textContent=food; coinsDisplay.textContent=coins; }
updateResourceDisplay();

// ==== GARDEN ====
let plants = JSON.parse(localStorage.getItem('plants'))||[];
const gardenGrid = document.getElementById('gardenGrid');

const plantTypes=[
  {name:'Sunflower', cost:5},{name:'Rose', cost:10},{name:'Tulip', cost:7},{name:'Cactus', cost:3},
  {name:'Daisy', cost:4},{name:'Orchid', cost:12},{name:'Lily', cost:8},{name:'Bonsai', cost:15},
  {name:'Lavender', cost:6},{name:'Cherry Blossom', cost:20}
];

function saveGarden(){ localStorage.setItem('plants', JSON.stringify(plants)); displayGarden(); saveResources(); }
function displayGarden(){ gardenGrid.innerHTML=''; plants.forEach((p,i)=>{
  const div=document.createElement('div'); div.className='plant-card';
  div.innerHTML=`<p>${p.name}</p><p>Pot: ${p.pot || 'Default'}</p><p>Water: ${p.water}/5 | Food: ${p.food}/5</p>`;
  gardenGrid.appendChild(div);
}); updateResourceDisplay(); }
displayGarden();

function waterPlant(){ if(water<=0){ alert("No water left! Play mini-games."); return; } plants.forEach(p=>{ if(p.water<5) p.water+=1; }); water-=1; saveGarden(); }
function feedPlant(){ if(food<=0){ alert("No food left! Play mini-games."); return; } plants.forEach(p=>{ if(p.food<5) p.food+=1; }); food-=1; saveGarden(); }

document.getElementById('waterPlantBtn').addEventListener('click', waterPlant);
document.getElementById('feedPlantBtn').addEventListener('click', feedPlant);

// ==== MINI-GAMES ====
const gameArea = document.getElementById('gameArea');
document.getElementById('tapGameBtn').addEventListener('click', ()=>{
  gameArea.innerHTML='<p>Tap as fast as you can! 5 seconds!</p><button id="tapBtn">Tap</button><p>Score: <span id="tapScore">0</span></p>';
  let score=0;
  const tapScore=document.getElementById('tapScore');
  const tapBtn=document.getElementById('tapBtn');
  tapBtn.onclick=()=>{score++; tapScore.textContent=score;};
  setTimeout(()=>{ alert(`You earned ${score} coins, ${score} water, ${score} food!`); coins+=score; water+=score; food+=score; saveGarden(); gameArea.innerHTML=''; },5000);
});
document.getElementById('matchGameBtn').addEventListener('click', ()=>{
  gameArea.innerHTML='<p>Match letters!</p>';
  const letters=['A','B','A','B'];
  const buttons=[]; let first=null; let score=0;
  letters.forEach(l=>{
    const b=document.createElement('button'); b.textContent=l; buttons.push(b); gameArea.appendChild(b);
    b.addEventListener('click',()=>{
      if(!first) first=b; else { if(first.textContent===b.textContent) score++; first=null; else first=null; }
    });
  });
  setTimeout(()=>{ alert(`You earned ${score} coins, ${score} water, ${score} food!`); coins+=score; water+=score; food+=score; saveGarden(); gameArea.innerHTML=''; },10000);
});

// ==== STORE ====
const plantStoreGrid=document.querySelector('#plantStore .store-grid');
const potStoreGrid=document.querySelector('#potStore .store-grid');
const potTypes=['Red Pot','Blue Pot','Yellow Pot','Green Pot','Pink Pot','Purple Pot','Orange Pot','Brown Pot','White Pot','Black Pot'];

function displayStore(){
  plantStoreGrid.innerHTML=''; potStoreGrid.innerHTML='';
  plantTypes.forEach((p,i)=>{
    const b=document.createElement('button'); b.textContent=`${p.name} (${p.cost} coins)`; plantStoreGrid.appendChild(b);
    b.onclick=()=>{
      if(coins>=p.cost){ plants.push({name:p.name, pot:'Default', water:3, food:3}); coins-=p.cost; saveGarden(); } else alert("Not enough coins!");
    };
  });
  potTypes.forEach(p=>{
    const b=document.createElement('button'); b.textContent=p; potStoreGrid.appendChild(b);
    b.onclick=()=>{
      if(plants.length>0){ plants[plants.length-1].pot=p; saveGarden(); } else alert("Buy a plant first!");
    };
  });
}
displayStore();

// ==== DAY/NIGHT CYCLE ====
function updateDayNight(){
  const hour=new Date().getHours();
  document.body.style.background=(hour>=6 && hour<18)?'#fff0f5':'#2c3e50';
  document.body.style.color=(hour>=6 && hour<18)?'#333':'#fff';
}
setInterval(updateDayNight,60000); updateDayNight();
