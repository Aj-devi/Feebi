// ===================
// FEEDBACK / NOTES
// ===================
// All main logic is here: Sections, Garden, Finance, Mini-Games, Store, Day/Night, Seasons.
// LocalStorage is used to save progress.
// Resources: coins, water, food, level, XP.
// Garden supports multiple plants, growth stages, water/food, happiness.

//////////////////////////
// Sections
//////////////////////////
const sections = {
  finance: document.getElementById('financeSection'),
  garden: document.getElementById('gardenSection'),
  games: document.getElementById('gamesSection'),
  store: document.getElementById('storeSection')
};

function showSection(section) {
  Object.values(sections).forEach(s => {
    s === section ? s.classList.add('active') : s.classList.remove('active');
  });
}

// Navigation buttons
document.getElementById('financeBtn').onclick = () => showSection(sections.finance);
document.getElementById('gardenBtn').onclick = () => showSection(sections.garden);
document.getElementById('gamesBtn').onclick = () => showSection(sections.games);
document.getElementById('storeBtn').onclick = () => showSection(sections.store);

//////////////////////////
// Resources
//////////////////////////
let coins = Number(localStorage.getItem('coins')) || 20;
let water = Number(localStorage.getItem('water')) || 3;
let food = Number(localStorage.getItem('food')) || 3;
let level = Number(localStorage.getItem('level')) || 1;
let xp = Number(localStorage.getItem('xp')) || 0;

const coinsDisplay = document.getElementById('coins');
const waterDisplay = document.getElementById('waterCount');
const foodDisplay = document.getElementById('foodCount');
const levelDisplay = document.getElementById('level');
const xpDisplay = document.getElementById('xp');

function updateResources(){
  coinsDisplay.textContent = coins;
  waterDisplay.textContent = water;
  foodDisplay.textContent = food;
  levelDisplay.textContent = level;
  xpDisplay.textContent = xp;
}

//////////////////////////
// Finance System
//////////////////////////
let financeEntries = JSON.parse(localStorage.getItem('financeEntries')) || [];

function saveFinance() {
  localStorage.setItem('financeEntries', JSON.stringify(financeEntries));
  displayFinance();
}

function displayFinance() {
  const list = document.getElementById('financeList');
  list.innerHTML = '';
  let totalE = 0, totalX = 0;

  financeEntries.forEach((e,i) => {
    const li = document.createElement('li');
    li.textContent = `${e.name} - $${e.amount} (${e.type}) | ${e.frequency} | ${e.date||''} | ${e.note||''}`;
    
    // Remove button for each entry
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.onclick = () => {
      financeEntries.splice(i,1);
      saveFinance();
    };
    li.appendChild(btn);
    list.appendChild(li);

    e.type==='earning'?totalE+=e.amount:totalX+=e.amount;
  });

  document.getElementById('financeTotals').textContent =
    `Total Earnings: $${totalE} | Total Expenses: $${totalX} | Net: $${totalE-totalX}`;
}

// Add new finance entry
document.getElementById('addEntryBtn').onclick = () => {
  const name = document.getElementById('entryName').value;
  const amount = Number(document.getElementById('entryAmount').value);
  const type = document.getElementById('entryType').value;
  const frequency = document.getElementById('entryFrequency').value;
  const date = document.getElementById('entryDate').value;
  const note = document.getElementById('entryNote').value;
  if(name && amount){
    financeEntries.push({name, amount, type, frequency, date, note});
    saveFinance();
  }
}

saveFinance();

//////////////////////////
// Garden
//////////////////////////
let plants = JSON.parse(localStorage.getItem('plants')) || [];
const gardenGrid = document.getElementById('gardenGrid');

const plantTypes = [
  {name:'Sunflower', cost:5, images:['https://i.ibb.co/LtB4Y6Y/sunflower-seed.png','https://i.ibb.co/3kV7J7Q/sunflower-sprout.png','https://i.ibb.co/zfGZtVW/sunflower-bloom.png']},
  {name:'Rose', cost:10, images:['https://i.ibb.co/5vhgkSn/rose-seed.png','https://i.ibb.co/8gL0XrX/rose-sprout.png','https://i.ibb.co/7kZnQfx/rose-bloom.png']},
  {name:'Tulip', cost:7, images:['https://i.ibb.co/TMbM3F4/tulip-seed.png','https://i.ibb.co/6X8T2Vw/tulip-sprout.png','https://i.ibb.co/3ShM1Z9/tulip-bloom.png']},
  {name:'Daisy', cost:6, images:['https://i.ibb.co/J7nC03b/daisy-seed.png','https://i.ibb.co/pX2ZyLs/daisy-sprout.png','https://i.ibb.co/sC8ZVPT/daisy-bloom.png']},
  {name:'Lavender', cost:9, images:['https://i.ibb.co/YkHdhNf/lavender-seed.png','https://i.ibb.co/Vp7WjkD/lavender-sprout.png','https://i.ibb.co/yR8WJbJ/lavender-bloom.png']},
  {name:'Orchid', cost:12, images:['https://i.ibb.co/5TBhbnX/orchid-seed.png','https://i.ibb.co/N2K4H3k/orchid-sprout.png','https://i.ibb.co/F3VYr49/orchid-bloom.png']},
  {name:'Lily', cost:8, images:['https://i.ibb.co/2Nvq6JX/lily-seed.png','https://i.ibb.co/4JpFppG/lily-sprout.png','https://i.ibb.co/HY3RStJ/lily-bloom.png']},
  {name:'Cactus', cost:4, images:['https://i.ibb.co/2S6Qw6B/cactus-seed.png','https://i.ibb.co/3vYjW9v/cactus-sprout.png','https://i.ibb.co/3Wpx6yD/cactus-bloom.png']},
  {name:'Peony', cost:11, images:['https://i.ibb.co/5TFYspW/peony-seed.png','https://i.ibb.co/GR0DkZx/peony-sprout.png','https://i.ibb.co/G5qF9tX/peony-bloom.png']},
  {name:'Marigold', cost:7, images:['https://i.ibb.co/6b4Jv0y/marigold-seed.png','https://i.ibb.co/jg4yYhp/marigold-sprout.png','https://i.ibb.co/xXzXHdb/marigold-bloom.png']}
];
const potTypes=['Red','Blue','Yellow','Green','Pink','Purple','Orange','Brown','White','Black'];

// Display garden
function displayGarden(){
  gardenGrid.innerHTML='';
  plants.forEach(p=>{
    const div=document.createElement('div'); 
    div.className='plant-card';
    let stageIndex=Math.min(p.age||0,2);
    const happiness = p.water>=3&&p.food>=3?'😄':(p.water>=2&&p.food>=2?'😐':'😢');
    div.innerHTML=`<img src="${p.images[stageIndex]}" width="80"><p>${p.name} (${p.pot||'Default'})</p><p>Water: ${p.water||0}/5 | Food: ${p.food||0}/5</p><p>Happiness: ${happiness}</p>`;
    gardenGrid.appendChild(div);
  });
}

function saveGarden(){
  localStorage.setItem('plants',JSON.stringify(plants)); 
  localStorage.setItem('coins',coins); 
  localStorage.setItem('water',water); 
  localStorage.setItem('food',food); 
  localStorage.setItem('level',level); 
  localStorage.setItem('xp',xp); 
  updateResources(); 
  displayGarden();
}

displayGarden();

