let selectedClass = '';
let selectedAutocompleteIndex = -1;

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
  setupAutocomplete(); // Atualiza o autocompletar quando a turma muda
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
    hideAutocomplete(); // Esconde a lista de autocompletar após salvar
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
    setupAutocomplete(); // Atualiza o autocompletar após exclusão
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
    setupAutocomplete(); // Atualiza o autocompletar após importar
  };

  reader.readAsText(file);
}

function mostrarNomeArquivo() {
  const fileInput = document.getElementById('fileUpload');
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
  document.getElementById('nome-arquivo').textContent = fileName;
}

// Nova função para mostrar nome do arquivo de dados
function mostrarNomeArquivoData() {
  const fileInput = document.getElementById('fileUploadData');
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
  document.getElementById('nome-arquivo-data').textContent = fileName;
}

// Nova função para importar dados com coins
function importarDadosComCoins() {
  const fileInput = document.getElementById('fileUploadData');
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
    let importados = 0;
    let erros = 0;

    linhas.forEach(linha => {
      const linhaTrimmed = linha.trim();
      if (linhaTrimmed) {
        // Aceita tanto tabulação quanto espaço como separador
        const partes = linhaTrimmed.split(/[\t\s]+/);
        
        if (partes.length >= 2) {
          // O último elemento é sempre o valor dos coins
          const coinsValue = parseInt(partes[partes.length - 1], 10);
          // Tudo antes do último elemento é o nome
          const nomeBruto = partes.slice(0, -1).join(' ');
          
          if (!isNaN(coinsValue) && nomeBruto) {
            const nomeNormalizado = removerAcentos(nomeBruto).toLowerCase().replace(/\s+/g, ' ').trim();
            const key = `${selectedClass}_${nomeNormalizado}`;
            const historicoKey = `${key}_historico`;

            // Se o aluno não existe, cria com coins zero
            if (!localStorage.getItem(key)) {
              localStorage.setItem(key, 0);
              localStorage.setItem(historicoKey, JSON.stringify([]));
            }

            // Adiciona os coins importados
            const valorAtual = parseInt(localStorage.getItem(key)) || 0;
            const novoValor = valorAtual + coinsValue;
            localStorage.setItem(key, novoValor);

            // Adiciona ao histórico
            let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
            historico.push({
              data: new Date().toLocaleString(),
              valor: coinsValue,
              justificativa: 'Importação de dados'
            });
            localStorage.setItem(historicoKey, JSON.stringify(historico));

            importados++;
          } else {
            erros++;
          }
        } else {
          erros++;
        }
      }
    });

    alert(`Dados importados com sucesso!\nImportados: ${importados}\nErros: ${erros}`);
    fileInput.value = '';
    document.getElementById('nome-arquivo-data').textContent = 'Nenhum arquivo selecionado';
    displaySavedData();
    setupAutocomplete(); // Atualiza o autocompletar após importar
  };

  reader.readAsText(file);
}

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

// Funções do autocompletar
function setupAutocomplete() {
  const nameInput = document.getElementById('name');
  const autocompleteList = document.getElementById('autocomplete-list');
  
  nameInput.addEventListener('input', function() {
    const inputValue = this.value.trim();
    hideAutocomplete();
    selectedAutocompleteIndex = -1;
    
    if (inputValue.length < 2 || !selectedClass) {
      return;
    }
    
    const matches = getMatchingNames(inputValue);
    
    if (matches.length > 0) {
      showAutocompleteList(matches);
    }
  });
  
  nameInput.addEventListener('keydown', function(e) {
    const autocompleteItems = document.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, autocompleteItems.length - 1);
      updateSelection(autocompleteItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
      updateSelection(autocompleteItems);
    } else if (e.key === 'Enter' && selectedAutocompleteIndex >= 0) {
      e.preventDefault();
      selectAutocompleteItem(autocompleteItems[selectedAutocompleteIndex].textContent);
    } else if (e.key === 'Escape') {
      hideAutocomplete();
    }
  });
  
  // Esconder lista quando clicar fora
  document.addEventListener('click', function(e) {
    if (!nameInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      hideAutocomplete();
    }
  });
}

function getMatchingNames(input) {
  const inputNormalized = removerAcentos(input).toLowerCase();
  const matches = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(selectedClass) && !key.includes('_historico')) {
      const nomeNormalizado = key.split('_')[1];
      const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
      
      if (removerAcentos(nomeNormalizado).includes(inputNormalized)) {
        matches.push(nomeFormatado);
      }
    }
  }
  
  return matches.sort();
}

function showAutocompleteList(matches) {
  const autocompleteList = document.getElementById('autocomplete-list');
  autocompleteList.innerHTML = '';
  
  matches.forEach((name, index) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = name;
    item.addEventListener('click', function() {
      selectAutocompleteItem(name);
    });
    autocompleteList.appendChild(item);
  });
  
  autocompleteList.style.display = 'block';
}

function hideAutocomplete() {
  const autocompleteList = document.getElementById('autocomplete-list');
  autocompleteList.style.display = 'none';
  selectedAutocompleteIndex = -1;
}

function updateSelection(items) {
  items.forEach((item, index) => {
    if (index === selectedAutocompleteIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function selectAutocompleteItem(name) {
  document.getElementById('name').value = name;
  hideAutocomplete();
}

// Inicializar autocompletar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  setupAutocomplete();
});
