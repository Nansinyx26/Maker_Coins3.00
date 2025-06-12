let selectedClass = '';

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toggleJustificativa() {
  const isNegative = document.getElementById('isNegative').checked;
  const justificativaBox = document.getElementById('justificativa-container');
  justificativaBox.style.display = isNegative ? 'block' : 'none';
}

function setClass(className) {
  selectedClass = className;
  document.getElementById('alert').textContent = `Turma selecionada: ${className}`;
  displaySavedData();
}

function saveData() {
  const nameInput = document.getElementById('name').value.trim();
  const coinsInput = parseInt(document.getElementById('coins').value, 10);
  const isNegative = document.getElementById('isNegative').checked;
  const justificativa = document.getElementById('justificativa').value.trim();
  const coins = isNegative ? -Math.abs(coinsInput) : Math.abs(coinsInput);

  if (nameInput && !isNaN(coins) && selectedClass) {
    const nomeNormalizado = removerAcentos(nameInput).toLowerCase().replace(/\s+/g, ' ').trim();
    const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
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

    alert('Dados salvos!');
    document.getElementById('name').value = '';
    document.getElementById('coins').value = '';
    document.getElementById('isNegative').checked = false;
    document.getElementById('justificativa').value = '';
    document.getElementById('justificativa-container').style.display = 'none';
    document.getElementById('alert').textContent = '';
    displaySavedData();
  } else {
    alert('Por favor, preencha todos os campos e selecione uma turma.');
  }
}

function displaySavedData() {
  const savedDataContainer = document.getElementById('savedData');
  savedDataContainer.innerHTML = '';

  let totalNomes = 0;
  let totalCoins = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(selectedClass) && !key.includes('_historico')) {
      const nomeNormalizado = key.split('_')[1];
      const coins = parseInt(localStorage.getItem(key)) || 0;
      const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
      totalNomes++;
      totalCoins += coins;

      const userCard = `
        <div class="user-card">
          <p class="user-name">${nomeFormatado}</p>
          <p class="user-coins">Coins: ${coins}</p>
          <button onclick="deleteData('${key}')">Excluir</button>
        </div>
      `;
      savedDataContainer.innerHTML += userCard;
    }
  }

  document.getElementById('contador-nomes').textContent = `Nomes: ${totalNomes}`;
  document.getElementById('contador-coins').textContent = `Coins: ${totalCoins}`;
}

function deleteData(key) {
  if (confirm('Tem certeza que deseja excluir este dado?')) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_historico`);
    alert('Dados excluídos!');
    displaySavedData();
  }
}

function exportToTXT() {
  if (!selectedClass) {
    alert("Selecione uma turma antes de exportar.");
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
}

function mostrarHistorico() {
  const nomeInput = document.getElementById('pesquisa').value.trim();
  const nomeNormalizado = removerAcentos(nomeInput).toLowerCase().replace(/\s+/g, ' ').trim();
  const nome = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);

  if (!selectedClass || !nomeNormalizado) {
    alert('Selecione uma turma e digite o nome.');
    return;
  }

  const historicoKey = `${selectedClass}_${nomeNormalizado}_historico`;
  const historico = JSON.parse(localStorage.getItem(historicoKey)) || [];

  const container = document.getElementById('historicoAluno');
  container.innerHTML = `<h3>Histórico de ${nome}</h3>`;

  if (historico.length === 0) {
    container.innerHTML += '<p>Nenhum histórico encontrado.</p>';
    return;
  }

  const lista = document.createElement('ul');
  historico.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.data} → ${item.valor > 0 ? '+' : ''}${item.valor} coins`;

    if (item.valor < 0 && item.justificativa) {
      const btn = document.createElement('button');
      btn.textContent = 'Mostrar Justificativa';
      btn.classList.add('justificativa-btn');
      btn.onclick = () => {
        alert(`Justificativa: ${item.justificativa}`);
      };

      btn.style.background = '#34495e';
      btn.style.color = '#ecf0f1';
      btn.style.border = 'none';
      btn.style.padding = '1rem 2rem';
      btn.style.fontSize = '1.1rem';
      btn.style.borderRadius = '5px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'background-color 0.3s ease, transform 0.3s ease';
      btn.style.marginLeft = '1rem';

      btn.addEventListener('mouseover', () => {
        btn.style.background = '#1abc9c';
        btn.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('mouseout', () => {
        btn.style.background = '#34495e';
        btn.style.transform = 'scale(1)';
      });

      li.appendChild(btn);
    }

    lista.appendChild(li);
  });

  container.appendChild(lista);
}

function importarAlunos() {
  const fileInput = document.getElementById('fileUpload');
  const file = fileInput.files[0];

  if (!file) {
    alert('Selecione um arquivo .txt.');
    return;
  }

  if (!selectedClass) {
    alert('Selecione uma turma antes de importar.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const linhas = e.target.result.split('\n');

    linhas.forEach(linha => {
      const nomeBruto = linha.trim();
      if (nomeBruto) {
        const nomeNormalizado = removerAcentos(nomeBruto).toLowerCase().replace(/\s+/g, ' ').trim();
        const key = `${selectedClass}_${nomeNormalizado}`;
        const historicoKey = `${key}_historico`;

        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 0);
          localStorage.setItem(historicoKey, JSON.stringify([]));
        }
      }
    });

    alert('Alunos importados com sucesso!');
    fileInput.value = '';
    document.getElementById('nome-arquivo').textContent = 'Nenhum arquivo selecionado';
    displaySavedData();
  };

  reader.readAsText(file);
}

function mostrarNomeArquivo() {
  const fileInput = document.getElementById('fileUpload');
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
  document.getElementById('nome-arquivo').textContent = fileName;
}

// ✅ Adicionando função que estava faltando
function alterarTodos(acao) {
  if (!selectedClass) {
    alert("Selecione uma turma antes.");
    return;
  }

  const valorInput = parseInt(document.getElementById('coinsGroup').value, 10);
  if (isNaN(valorInput) || valorInput <= 0) {
    alert("Digite um valor positivo válido.");
    return;
  }

  const valorAplicado = acao === 'remove' ? -Math.abs(valorInput) : Math.abs(valorInput);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(selectedClass) && !key.includes('_historico')) {
      const atual = parseInt(localStorage.getItem(key)) || 0;
      const novoValor = atual + valorAplicado;
      localStorage.setItem(key, novoValor);

      const historicoKey = `${key}_historico`;
      let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
      historico.push({
        data: new Date().toLocaleString(),
        valor: valorAplicado,
        justificativa: acao === 'remove' ? 'Remoção geral' : 'Distribuição geral'
      });
      localStorage.setItem(historicoKey, JSON.stringify(historico));
    }
  }

  alert("Coins atualizados para todos da turma.");
  document.getElementById('coinsGroup').value = '';
  displaySavedData();
}
