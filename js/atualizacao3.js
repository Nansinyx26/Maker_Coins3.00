let selectedClass = '';

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function addTerminalLog(message, type = 'info') {
  const terminal = document.getElementById('terminal-output');
  if (!terminal) return;
  const line = document.createElement('div');
  line.style.marginBottom = '4px';
  line.innerHTML = `<span style="opacity:0.5">[${new Date().toLocaleTimeString()}]</span> <span style="color:${type === 'error' ? '#ff4757' : (type === 'success' ? '#00ff88' : '#00ff88')}">${message}</span>`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function showNotification(message, type = 'info') {
  const container = document.getElementById('alert');
  if (!container) return;

  // Clear previous alerts if any
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'alert-card';
  card.style.borderLeftColor = type === 'success' ? '#00A3A2' : (type === 'error' ? '#ff4757' : '#820AD1');
  card.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111;">NOTIFICAÇÃO</div>
        <div style="font-size: 14px; color: #666;">${message}</div>
    `;

  container.appendChild(card);

  setTimeout(() => {
    card.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => card.remove(), 300);
  }, 4000);
}

function toggleJustificativa() {
  const isNegative = document.getElementById('isNegative').checked;
  const justificativaBox = document.getElementById('justificativa-container');
  justificativaBox.style.display = isNegative ? 'block' : 'none';
}

function setClass(className) {
  selectedClass = className;

  document.querySelectorAll('.nb-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-class') === className) {
      tab.classList.add('active');
    }
  });

  displaySavedData();
}

function saveData() {
  const nameInput = document.getElementById('name').value.trim();
  const coinsInputString = document.getElementById('coins').value;
  const coinsInput = parseInt(coinsInputString, 10);
  const isNegative = document.getElementById('isNegative').checked;
  const justificativa = document.getElementById('justificativa').value.trim();

  if (nameInput && !isNaN(coinsInput) && selectedClass) {
    if (isNegative && !justificativa) {
      showNotification('Justificativa obrigatória para penalidades.', 'error');
      return;
    }

    const coins = isNegative ? -Math.abs(coinsInput) : Math.abs(coinsInput);
    const nomeNormalizado = removerAcentos(nameInput).toLowerCase().replace(/\s+/g, ' ').trim();
    const key = `${selectedClass}_${nomeNormalizado}`;
    const historicoKey = `${key}_historico`;

    const valorAtual = parseInt(localStorage.getItem(key)) || 0;
    const novoValor = valorAtual + coins;

    localStorage.setItem(key, novoValor);

    let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
    historico.push({
      data: new Date().toLocaleString(),
      valor: coins,
      justificativa: isNegative ? justificativa : ''
    });
    localStorage.setItem(historicoKey, JSON.stringify(historico));

    showNotification('Dados processados com sucesso!', 'success');

    document.getElementById('name').value = '';
    document.getElementById('coins').value = '';
    document.getElementById('isNegative').checked = false;
    document.getElementById('justificativa').value = '';
    document.getElementById('justificativa-container').style.display = 'none';

    displaySavedData();
  } else {
    showNotification('Preencha os campos e escolha a turma.', 'error');
  }
}

function displaySavedData() {
  const savedDataContainer = document.getElementById('savedData');
  if (!savedDataContainer) return;
  savedDataContainer.innerHTML = '';

  let totalNomes = 0;
  let totalCoins = 0;
  const students = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(selectedClass) && !key.includes('_historico')) {
      const nomeNormalizado = key.split('_')[1];
      const coins = parseInt(localStorage.getItem(key)) || 0;
      const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);

      students.push({ key, nomeFormatado, coins });
      totalNomes++;
      totalCoins += coins;
    }
  }

  students.sort((a, b) => b.coins - a.coins);

  students.forEach((student, index) => {
    const item = document.createElement('div');
    item.className = 'nb-list-item';
    item.style.padding = '12px 16px';
    item.innerHTML = `
        <div class="nb-list-rank">#${index + 1}</div>
        <div class="nb-list-info">
            <div class="nb-list-name" style="font-size: 14px;">${student.nomeFormatado}</div>
        </div>
        <div class="nb-list-amount" style="font-size: 14px;">${student.coins.toLocaleString()} MKR</div>
        <button class="nb-icon-btn" style="width: 32px; height: 32px; font-size: 12px; margin-left: 10px; color: #ff4757; background: #fff5f5;" onclick="deleteData('${student.key}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    savedDataContainer.appendChild(item);
  });

  if (students.length === 0) {
    savedDataContainer.innerHTML = `
        <div class="nb-empty-state" style="padding: 30px 10px; margin: 10px 0;">
            <div class="nb-empty-icon" style="font-size: 32px; margin-bottom: 10px;">
                <i class="fas fa-users"></i>
            </div>
            <h4 class="nb-empty-title" style="font-size: 16px;">Nenhum estudante cadastrado</h4>
            <p class="nb-empty-desc" style="font-size: 12px; margin-bottom: 0;">Inicie o cadastro agora.</p>
        </div>
    `;
  }

  const contadorNomes = document.getElementById('contador-nomes');
  const contadorCoins = document.getElementById('contador-coins');
  if (contadorNomes) contadorNomes.textContent = totalNomes;
  if (contadorCoins) contadorCoins.textContent = totalCoins.toLocaleString();
}

function deleteData(key) {
  if (confirm('Deseja excluir este estudante?')) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_historico`);
    showNotification('Dados excluídos!', 'success');
    displaySavedData();
  }
}

function exportToTXT() {
  if (!selectedClass) {
    showNotification("Selecione uma turma.", 'error');
    return;
  }

  let txt = "Nome\tCoins\n";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(selectedClass) && !key.includes('_historico')) {
      const nomeNormalizado = key.split('_')[1];
      const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
      const coins = localStorage.getItem(key);
      txt += `${nomeFormatado}\t${coins}\n`;
    }
  }

  const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `turma_${selectedClass}.txt`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification('Arquivo exportado!', 'success');
}

// Initial state
document.addEventListener('DOMContentLoaded', () => {
  // Add keyframe for fadeOut
  const style = document.createElement('style');
  style.textContent = `
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
    `;
  document.head.appendChild(style);
});

