let selectedClass = '';
let selectedAutocompleteIndex = -1;
let currentClassStudents = [];

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
  if (justificativaBox) justificativaBox.style.display = isNegative ? 'block' : 'none';
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
  setupAutocomplete();
  addTerminalLog(`Turma ${className} selecionada`, 'success');
}

async function saveData() {
  const nameInput = document.getElementById('name')?.value.trim();
  const coinsInput = parseInt(document.getElementById('coins')?.value, 10);
  const isNegative = document.getElementById('isNegative')?.checked;
  const justificativa = document.getElementById('justificativa')?.value.trim();

  if (!nameInput || isNaN(coinsInput) || !selectedClass) {
    showNotification('Preencha os campos e escolha a turma.', 'error');
    return;
  }

  if (isNegative && !justificativa) {
    showNotification('Justificativa obrigatória para penalidades.', 'error');
    return;
  }

  try {
    const user = currentClassStudents.find(u => u.nome.toLowerCase() === nameInput.toLowerCase());
    if (!user) {
      showNotification('Estudante não encontrado nesta turma.', 'error');
      return;
    }

    const coins = isNegative ? -Math.abs(coinsInput) : Math.abs(coinsInput);

    await apiClient.adminUpdateCoins({
      email: user.email,
      valor: coins,
      descricao: isNegative ? justificativa : 'Crédito administrativo 3º Ano',
      secret: 'Mantra2222'
    });

    showNotification('Transação processada com sucesso!', 'success');
    addTerminalLog(`Transação: ${user.nome} ${coins > 0 ? '+' : ''}${coins} MKR`, 'success');

    clearForm();
    displaySavedData();
  } catch (error) {
    showNotification('Erro: ' + error.message, 'error');
  }
}

function clearForm() {
  const elements = ['name', 'coins', 'justificativa'];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const check = document.getElementById('isNegative');
  if (check) check.checked = false;
  const box = document.getElementById('justificativa-container');
  if (box) box.style.display = 'none';
  hideAutocomplete();
}

async function displaySavedData() {
  const savedDataContainer = document.getElementById('savedData');
  if (!savedDataContainer || !selectedClass) return;

  try {
    const students = await apiClient.adminGetUsersByClass(selectedClass);
    currentClassStudents = students;
    savedDataContainer.innerHTML = '';

    let totalNomes = students.length;
    let totalCoins = 0;

    students.sort((a, b) => b.saldo - a.saldo);

    students.forEach((student, index) => {
      totalCoins += student.saldo;
      const item = document.createElement('div');
      item.className = 'nb-list-item';
      item.style.padding = '12px 16px';
      item.innerHTML = `
          <div class="nb-list-rank">#${index + 1}</div>
          <div class="nb-list-info">
              <div class="nb-list-name" style="font-size: 14px;">${student.nome}</div>
              <div style="font-size: 10px; color: var(--nb-text-secondary);">${student.email}</div>
          </div>
          <div class="nb-list-amount" style="font-size: 14px;">${student.saldo.toLocaleString()} MKR</div>
          <button class="nb-icon-btn" style="width: 32px; height: 32px; font-size: 12px; margin-left: 10px; color: #ff4757; background: #fff5f5;" onclick="deleteData('${student.email}')">
              <i class="fas fa-trash"></i>
          </button>
      `;
      savedDataContainer.appendChild(item);
    });

    if (students.length === 0) {
      savedDataContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Nenhum estudante nesta turma.</p>`;
    }

    const contadorNomes = document.getElementById('contador-nomes');
    const contadorCoins = document.getElementById('contador-coins');
    if (contadorNomes) contadorNomes.textContent = totalNomes;
    if (contadorCoins) contadorCoins.textContent = totalCoins.toLocaleString();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteData(email) {
  if (confirm('Deseja excluir este estudante?')) {
    try {
      await apiClient.adminDeleteUser({ email, secret: 'Mantra2222' });
      showNotification('Estudante removido.', 'success');
      displaySavedData();
    } catch (error) {
      showNotification('Erro: ' + error.message, 'error');
    }
  }
}

/**
 * Autocomplete Logic
 */
function setupAutocomplete() {
  const nameInput = document.getElementById('name');
  const autocompleteList = document.getElementById('autocomplete-list');
  if (!nameInput || !autocompleteList) return;

  nameInput.addEventListener('input', function () {
    const val = this.value.trim();
    hideAutocomplete();
    selectedAutocompleteIndex = -1;
    if (val.length < 2 || !selectedClass) return;

    const matches = currentClassStudents
      .filter(s => removerAcentos(s.nome).toLowerCase().includes(removerAcentos(val).toLowerCase()))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    if (matches.length > 0) {
      matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `<span>${m.nome}</span> <span style="font-size:10px; opacity:0.7;">${m.saldo} MKR</span>`;
        div.onclick = () => {
          nameInput.value = m.nome;
          hideAutocomplete();
        };
        autocompleteList.appendChild(div);
      });
      autocompleteList.style.display = 'block';
    }
  });

  document.addEventListener('click', (e) => {
    if (!nameInput.contains(e.target)) hideAutocomplete();
  });
}

function hideAutocomplete() {
  const list = document.getElementById('autocomplete-list');
  if (list) {
    list.innerHTML = '';
    list.style.display = 'none';
    selectedAutocompleteIndex = -1;
  }
}

function exportToTXT() {
  if (!selectedClass) {
    showNotification("Selecione uma turma.", 'error');
    return;
  }
  let txt = "Nome\tCoins\tEmail\n";
  currentClassStudents.forEach(s => {
    txt += `${s.nome}\t${s.saldo}\t${s.email}\n`;
  });
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `turma_${selectedClass}_3ano.txt`);
  link.click();
}

/**
 * Administrative Import Functions (Sync with Master)
 */
function mostrarNomeArquivo() {
  const fileInput = document.getElementById('fileUpload');
  const fileName = fileInput?.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
  const statusElement = document.getElementById('nome-arquivo');
  if (statusElement) statusElement.textContent = fileName;
}

function mostrarNomeArquivoData() {
  const fileInput = document.getElementById('fileUploadData');
  const fileName = fileInput?.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
  const statusElement = document.getElementById('nome-arquivo-data');
  if (statusElement) statusElement.textContent = fileName;
}

function importarAlunos() {
  showNotification('Use a página principal para importações massivas.', 'info');
}

function importarDadosComCoins() {
  showNotification('Use a página principal para importações massivas.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }`;
  document.head.appendChild(style);
});
