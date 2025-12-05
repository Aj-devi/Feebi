// === Feebi App JS ===

// Sections
const financeSection = document.getElementById('financeSection');
const gardenSection = document.getElementById('gardenSection');
const gamesSection = document.getElementById('gamesSection');

document.getElementById('financeBtn').addEventListener('click', () => showSection(financeSection));
document.getElementById('gardenBtn').addEventListener('click', () => showSection(gardenSection));
document.getElementById('gamesBtn').addEventListener('click', () => showSection(gamesSection));

function showSection(section) {
  [financeSection, gardenSection, gamesSection].forEach(sec => sec.classList.remove('active'));
  section.classList.add('active');
}

// ===== FINANCE =====
let financeEntries = JSON.parse(localStorage.getItem('financeEntries')) || [];

function saveFinance() {
  localStorage.setItem('financeEntries', JSON.stringify(financeEntries));
  displayFinance();
}

function displayFinance() {
  const list = document.getElementById('financeList');
  const totals = document.getElementById('financeTotals');
  list.innerHTML = '';
  let totalEarnings = 0;
  let totalExpenses = 0;

  financeEntries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - $${entry.amount} (${entry.type})`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => {
      financeEntries.splice(i,1);
      saveFinance();
    };
    li.appendChild(removeBtn);
    list.appendChild(li);
    if(entry.type === 'earning') totalEarnings += entry.amount;
    else totalExpenses += entry.amount;
  });

  totals.textContent = `Total Earnings: $${totalEarnings} | Total Expenses: $${totalExpenses} | Net: $${totalEarnings - totalExpenses}`;
}

document.getElementById('addEntryBtn').addEventListener('click', () => {
  const name = document.getElementById('entryName').value;
  const amount = Number(document.getElementById('entryAmount').value);
  const type = document.getElementById('entryType').value;
  if(name && amount) {
    financeEntries.push({name, amount, type});
    saveFinance();
    document.getElementById('entryName').value = '';
    document.getElementById('entryAmount').value = '';
  }
});

displayFinance();

// ===== GARDEN =====
let water = Number(localStorage.getItem('water')) || 3;
let food = Number(localStorage.getItem('food')) || 3;
const waterDisplay = document.getElementById('waterCount');
const foodDisplay = document.getElementById('foodCount');
const plantsGrid = document.getElementById('plantsGrid');

let plants = JSON.parse(localStorage.getItem('plants')) || [];

function saveGarden() {
  localStorage.setItem('plants', JSON.stringify(plants));
  localStorage.setItem('water', water);
  localStorage.setItem('food', food);
  displayGarden();
}

function displayGarden() {
  plantsGrid.innerHTML = '';
  plants.forEach((plant, i) => {
    const div = document.createElement('div');
    div.className = 'plant';
    div.innerHTML = `
      <p>${plant.name}</p>
      <img src="https://cdn-icons-png.flaticon.com/512/415/415733.png" alt="plant">
      <p>Hydration: ${plant.water}/5</p>
      <p>Nutrition: ${plant.food}/5</p>
    `;
    plantsGrid.appendChild(div);
  });
  waterDisplay.textContent = water;
  foodDisplay.textContent = food;
}

function addPlant() {
  const name = prompt("Name your plant 🌱:");
  if(name) {
    plants.push({name, water: 3, food: 3});
    saveGarden();
  }
}

function waterPlant() {
  if(water <= 0) { alert("No water left! Play a mini-game to earn."); return; }
  plants.forEach(p => { if(p.water<5) p.water +=1; });
  water -=1;
  saveGarden();
}

function feedPlant() {
  if(food <= 0) { alert("No food left! Play a mini-game to earn."); return; }
  plants.forEach(p => { if(p.food<5) p.food +=1; });
  food -=1;
  saveGarden();
}

document.getElementById('addPlantBtn').addEventListener('click', addPlant);
document.getElementById('waterPlantBtn').addEventListener('click', waterPlant);
document.getElementById('feedPlantBtn').addEventListener('click', feedPlant);

displayGarden();

// ===== MINI-GAMES =====
const gameArea = document.getElementById('gameArea');

document.getElementById('tapGameBtn').addEventListener('click', () => {
  gameArea.innerHTML = '<p>Tap as fast as you can! You have 5 seconds.</p><button id="tapBtn">Tap me!</button><p>Score: <span id="tapScore">0</span></p>';
  let score = 0;
  const tapScore = document.getElementById('tapScore');
  const tapBtn = document.getElementById('tapBtn');
  tapBtn.onclick = () => { score +=1; tapScore.textContent = score; };
  setTimeout(() => {
    alert(`Time's up! You earned ${score} water and ${score} food!`);
    water += score;
    food += score;
    saveGarden();
    gameArea.innerHTML = '';
  }, 5000);
});

document.getElementById('matchGameBtn').addEventListener('click', () => {
  gameArea.innerHTML = '<p>Click two buttons to match and earn resources!</p>';
  const btn1 = document.createElement('button'); btn1.textContent = 'A';
  const btn2 = document.createElement('button'); btn2.textContent = 'B';
  const btn3 = document.createElement('button'); btn3.textContent = 'A';
  const btn4 = document.createElement('button'); btn4.textContent = 'B';
  const buttons = [btn1, btn2, btn3, btn4];
  buttons.forEach(b => gameArea.appendChild(b));
  let first = null;
  let score = 0;
  buttons.forEach(b => b.addEventListener('click', () => {
    if(!first) { first = b; } else {
      if(first.textContent === b.textContent) { score +=1; alert("Match!"); } 
      first = null;
    }
  }));
  setTimeout(() => {
    alert(`Game over! You earned ${score} water and ${score} food!`);
    water += score;
    food += score;
    saveGarden();
    gameArea.innerHTML = '';
  }, 10000);
});

// Show Finance by default
showSection(financeSection);

