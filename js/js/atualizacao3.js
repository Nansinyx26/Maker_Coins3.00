let selectedClass = '';

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function setClass(className) {
  selectedClass = className;
  document.getElementById('alert').textContent = `Turma selecionada: ${className}`;
  displaySavedData();
}

function saveData() {
  const nameInput = document.getElementById('name').value.trim();
  const coins = document.getElementById('coins').value;

  if (nameInput && coins && selectedClass) {
    const nomeNormalizado = removerAcentos(nameInput).toLowerCase().replace(/\s+/g, ' ').trim();
    const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
    const key = `${selectedClass}_${nomeNormalizado}`;
    const historicoKey = `${key}_historico`;

    const valorAtual = parseInt(localStorage.getItem(key)) || 0;
    const novoValor = valorAtual + parseInt(coins);

    localStorage.setItem(key, novoValor);

    let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
    historico.push({
      data: new Date().toLocaleString(),
      valor: parseInt(coins)
    });
    localStorage.setItem(historicoKey, JSON.stringify(historico));

    alert('Dados salvos!');
    document.getElementById('name').value = '';
    document.getElementById('coins').value = '';
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
    lista.appendChild(li);
  });

  container.appendChild(lista);
}
