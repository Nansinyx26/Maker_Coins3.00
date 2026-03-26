let currentClass = '2A';
let currentSort = 'coins';
let leaderboardData = [];

async function fetchRankingFromMongo(turma) {
  try {
    // Usamos fetch diretamente na rota pública que acabamos de configurar
    const response = await fetch(`${API_URL}/ranking/${turma}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar ranking no banco de dados');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao conectar com MongoDB (via API):', error);
    return [];
  }
}

async function showLeaderboard(className) {
  const leaderboard = document.getElementById('leaderboard');
  if (!leaderboard) return;

  currentClass = className;
  leaderboard.innerHTML = '<div style="text-align: center; color: white;">Carregando...</div>';

  // Update tabs
  document.querySelectorAll('.nb-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-class') === className) {
      tab.classList.add('active');
    }
  });

  // Busca dados do MongoDB
  const studentsFromDB = await fetchRankingFromMongo(className);
  
  const students = [];
  let totalNomes = 0;
  let totalCoins = 0;

  studentsFromDB.forEach(user => {
    students.push({
      name: user.nome,
      coins: user.saldo || 0,
      avatar: user.avatar || ''
    });
    totalNomes++;
    totalCoins += user.saldo || 0;
  });

  leaderboardData = students;
  sortAndDisplay(students);

  document.getElementById('contador-nomes').textContent = totalNomes;
  document.getElementById('contador-coins').textContent = totalCoins.toLocaleString() + ' MKR';
}

function sortAndDisplay(students) {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';

  // Sort based on current selection
  if (currentSort === 'coins') {
    students.sort((a, b) => b.coins - a.coins);
  } else {
    students.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (students.length === 0) {
    leaderboard.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.7); padding: 20px;">Nenhum aluno encontrado para esta turma.</div>';
    return;
  }

  students.forEach((student, index) => {
    // Obter iniciais
    const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    // Configurar avatar (se tiver imagem, exibe a imagem. Caso contrário, iniciais)
    const avatarHtml = student.avatar 
        ? `<img src="${student.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
        : initials;

    const item = document.createElement('div');
    item.className = 'nb-list-item';
    item.style.padding = '12px 16px';
    item.innerHTML = `
            <div class="nb-list-rank">${currentSort === 'coins' ? index + 1 : '•'}</div>
            <div class="nb-list-avatar" style="overflow: hidden;">${avatarHtml}</div>
            <div class="nb-list-info">
                <div class="nb-list-name">${student.name}</div>
                <div class="nb-list-class">2º Ano - Maker Coins</div>
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
document.addEventListener('DOMContentLoaded', () => showLeaderboard('2A'));
