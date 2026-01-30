let currentClass = '3A';
let currentSort = 'coins';
let leaderboardData = [];

function showLeaderboard(className) {
  const leaderboard = document.getElementById('leaderboard');
  if (!leaderboard) return;

  currentClass = className;
  leaderboard.innerHTML = '';

  // Update tabs
  document.querySelectorAll('.nb-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-class') === className) {
      tab.classList.add('active');
    }
  });

  const students = [];
  let totalNomes = 0;
  let totalCoins = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(className) && !key.includes('_historico')) {
      const name = key.split('_')[1];
      const coins = parseInt(localStorage.getItem(key), 10) || 0;
      const nomeFormatado = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');

      students.push({ name: nomeFormatado, coins });
      totalNomes++;
      totalCoins += coins;
    }
  }

  leaderboardData = students;
  sortAndDisplay(students);

  document.getElementById('contador-nomes').textContent = totalNomes;
  document.getElementById('contador-coins').textContent = totalCoins.toLocaleString() + ' MKR';
}

function sortAndDisplay(students) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';

  if (currentSort === 'coins') {
    students.sort((a, b) => b.coins - a.coins);
  } else {
    students.sort((a, b) => a.name.localeCompare(b.name));
  }

  students.forEach((student, index) => {
    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const item = document.createElement('div');
    item.className = 'nb-list-item';
    item.style.padding = '12px 16px';
    item.innerHTML = `
            <div class="nb-list-rank">${currentSort === 'coins' ? index + 1 : '•'}</div>
            <div class="nb-list-avatar">${initials}</div>
            <div class="nb-list-info">
                <div class="nb-list-name">${student.name}</div>
                <div class="nb-list-class">3º Ano - Maker Coins</div>
            </div>
            <div class="nb-list-amount">${student.coins.toLocaleString()} MKR</div>
        `;
    leaderboard.appendChild(item);
  });
}

function searchStudents(query) {
  if (!query) {
    sortAndDisplay(leaderboardData);
    return;
  }
  const filtered = leaderboardData.filter(s =>
    s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
  sortAndDisplay(filtered);
}

function toggleSort(type) {
  currentSort = type;
  sortAndDisplay(leaderboardData);
}

// Initial load
document.addEventListener('DOMContentLoaded', () => showLeaderboard('3A'));
