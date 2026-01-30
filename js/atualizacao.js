// Modern Maker Coins System - Enhanced JavaScript
// Initialize global variables at the top
let selectedClass = '';
let selectedAutocompleteIndex = -1;
let fabMenuOpen = false;
let terminalMinimized = true;
let priceUpdateInterval = null;

// Crypto price simulation data
const cryptoPrices = {
    mkr: { price: 1247.89, change: 2.34 },
    eth: { price: 2456.78, change: -0.87 },
    btc: { price: 45678.90, change: 1.23 }
};

/**
 * Utility Functions
 */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.nb-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show target section
    const target = document.getElementById('section-' + sectionId);
    if (target) target.style.display = 'block';

    // Update tabs
    document.querySelectorAll('.nb-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTab = document.getElementById('tab-' + sectionId);
    if (activeTab) activeTab.classList.add('active');

    addTerminalLog(`Navegando para: ${sectionId}`, 'info');
}

function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function getCurrentTimestamp() {
    return new Date().toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Terminal Functions Enhanced
 */
function addTerminalLog(message, type = 'info') {
    const terminal = document.getElementById('terminal-output');
    if (!terminal) return;

    const line = document.createElement('div');
    line.className = 'terminal-line';

    const timestamp = getCurrentTimestamp();
    line.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="${type}-msg">${message}</span>
    `;

    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;

    // Keep only last 100 lines for performance
    while (terminal.children.length > 100) {
        terminal.removeChild(terminal.firstChild);
    }

    // Auto-expand terminal for important messages
    if (type === 'error' || type === 'warning') {
        maximizeTerminal();
    }
}

function toggleTerminal() {
    const terminal = document.getElementById('live-terminal');
    if (terminal) {
        terminal.classList.toggle('minimized');
        terminalMinimized = !terminalMinimized;

        if (!terminalMinimized) {
            addTerminalLog('Terminal expandido', 'system');
        }
    }
}

function closeTerminal() {
    const terminal = document.getElementById('live-terminal');
    if (terminal) {
        terminal.style.display = 'none';
        addTerminalLog('Terminal fechado', 'system');
    }
}

function minimizeTerminal() {
    const terminal = document.getElementById('live-terminal');
    if (terminal) {
        terminal.classList.add('minimized');
        terminalMinimized = true;
    }
}

function maximizeTerminal() {
    const terminal = document.getElementById('live-terminal');
    if (terminal) {
        terminal.classList.remove('minimized');
        terminalMinimized = false;
    }
}

/**
 * Price Update System
 */
function updateCryptoPrices() {
    Object.keys(cryptoPrices).forEach(crypto => {
        // Simulate price fluctuation
        const priceElement = document.getElementById(`${crypto}-price`);
        const changeElement = document.getElementById(`${crypto}-change`);

        if (priceElement && changeElement) {
            // Random price change between -2% to +2%
            const changePercent = (Math.random() - 0.5) * 4;
            const newPrice = cryptoPrices[crypto].price * (1 + changePercent / 100);

            cryptoPrices[crypto].price = newPrice;
            cryptoPrices[crypto].change = changePercent;

            priceElement.textContent = formatCurrency(newPrice);
            changeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
            changeElement.className = `ticker-change ${changePercent > 0 ? 'positive' : 'negative'}`;
        }
    });
}

/**
 * Matrix Rain Effect Enhanced
 */
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    const container = document.getElementById('matrix-bg');
    if (!container) return;

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const columns = canvas.width / 20;
    const drops = Array(Math.floor(columns)).fill(1);
    const characters = '01MKRCOINSマトリックス';

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff88';
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * 20, drops[i] * 20);

            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 35);
}

/**
 * System Status Updates
 */
function updateSystemStatus() {
    const statusElement = document.getElementById('system-status');
    if (statusElement) {
        const uptime = 98.5 + Math.random() * 1.4; // 98.5-99.9%
        statusElement.textContent = `${uptime.toFixed(1)}%`;
    }
}

/**
 * Enhanced Class Management
 */
function toggleJustificativa() {
    const isNegative = document.getElementById('isNegative').checked;
    const justificativaBox = document.getElementById('justificativa-container');

    if (justificativaBox) {
        if (isNegative) {
            justificativaBox.style.display = 'block';
            addTerminalLog('Modo penalidade ativado - justificativa obrigatória', 'warning');
        } else {
            justificativaBox.style.display = 'none';
            addTerminalLog('Modo penalidade desativado', 'info');
        }
    }
}

function setClass(className) {
    selectedClass = className;

    // Update tab appearance
    document.querySelectorAll('.nb-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-class') === className) {
            tab.classList.add('active');
        }
    });

    // Update display and autocomplete
    displaySavedData();
    setupAutocomplete();

    addTerminalLog(`Turma ${className} selecionada`, 'success');
}

/**
 * Enhanced Data Management
 */
function saveData() {
    const nameInput = document.getElementById('name')?.value.trim();
    const coinsInput = parseInt(document.getElementById('coins')?.value, 10);
    const isNegative = document.getElementById('isNegative')?.checked;
    const justificativa = document.getElementById('justificativa')?.value.trim();

    if (!nameInput || isNaN(coinsInput) || !selectedClass) {
        showNotification('Por favor, preencha todos os campos e selecione uma turma.', 'error');
        addTerminalLog('Tentativa de transação com dados incompletos', 'error');
        return;
    }

    if (isNegative && !justificativa) {
        showNotification('Justificativa obrigatória para penalidades.', 'error');
        addTerminalLog('Penalidade rejeitada - sem justificativa', 'error');
        return;
    }

    const coins = isNegative ? -Math.abs(coinsInput) : Math.abs(coinsInput);
    const nomeNormalizado = removerAcentos(nameInput).toLowerCase().replace(/\s+/g, ' ').trim();
    const key = `${selectedClass}_${nomeNormalizado}`;
    const historicoKey = `${key}_historico`;

    try {
        const valorAtual = parseInt(localStorage.getItem(key)) || 0;
        const novoValor = valorAtual + coins;

        localStorage.setItem(key, novoValor);

        // Update history
        let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
        historico.push({
            data: getCurrentTimestamp(),
            valor: coins,
            justificativa: isNegative ? justificativa : '',
            tipo: coins > 0 ? 'credito' : 'debito'
        });
        localStorage.setItem(historicoKey, JSON.stringify(historico));

        // Clear form
        clearForm();

        // Update displays
        displaySavedData();

        // Show success
        const transactionType = coins > 0 ? 'Crédito' : 'Débito';
        showNotification(`${transactionType} de ${Math.abs(coins)} MKR para ${nameInput} processado com sucesso!`, 'success');
        addTerminalLog(`Transação processada: ${nameInput} ${coins > 0 ? '+' : ''}${coins} MKR`, 'success');

        // Log transaction details
        if (isNegative && justificativa) {
            addTerminalLog(`Motivo da penalidade: ${justificativa}`, 'warning');
        }

    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Erro ao salvar dados. Tente novamente.', 'error');
        addTerminalLog(`Erro na transação: ${error.message}`, 'error');
    }
}

function clearForm() {
    const elements = ['name', 'coins', 'justificativa'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    const isNegativeCheckbox = document.getElementById('isNegative');
    if (isNegativeCheckbox) isNegativeCheckbox.checked = false;

    const justificativaContainer = document.getElementById('justificativa-container');
    if (justificativaContainer) justificativaContainer.style.display = 'none';

    hideAutocomplete();
}

/**
 * Enhanced Display Functions
 */
function displaySavedData() {
    const savedDataContainer = document.getElementById('savedData');
    if (!savedDataContainer) return;

    savedDataContainer.innerHTML = '';

    let totalNomes = 0;
    let totalCoins = 0;
    const students = [];

    // Collect student data
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

    // Sort by coins (descending)
    students.sort((a, b) => b.coins - a.coins);

    // Create user items
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

    // Update counters
    const contadorNomes = document.getElementById('contador-nomes');
    const contadorCoins = document.getElementById('contador-coins');

    if (contadorNomes) contadorNomes.textContent = totalNomes;
    if (contadorCoins) contadorCoins.textContent = totalCoins.toLocaleString();

    if (students.length === 0) {
        savedDataContainer.innerHTML = `
            <div class="nb-empty-state" style="padding: 30px 10px; margin: 10px 0;">
                <div class="nb-empty-icon" style="font-size: 32px; margin-bottom: 10px;">
                    <i class="fas fa-users"></i>
                </div>
                <h4 class="nb-empty-title" style="font-size: 16px;">Nenhum estudante cadastrado</h4>
                <p class="nb-empty-desc" style="font-size: 12px; margin-bottom: 0;">Use o formulário acima para adicionar.</p>
            </div>
        `;
    }
}

function deleteData(key) {
    if (!confirm('Tem certeza que deseja excluir este estudante? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const studentName = key.split('_')[1];
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_historico`);

        displaySavedData();
        setupAutocomplete();

        showNotification(`Estudante ${studentName} removido com sucesso.`, 'success');
        addTerminalLog(`Estudante removido: ${studentName}`, 'warning');

    } catch (error) {
        console.error('Error deleting data:', error);
        showNotification('Erro ao excluir dados.', 'error');
        addTerminalLog(`Erro ao remover estudante: ${error.message}`, 'error');
    }
}

/**
 * Enhanced Import/Export Functions
 */
function exportToTXT() {
    if (!selectedClass) {
        showNotification('Selecione uma turma antes de exportar.', 'error');
        return;
    }

    let txt = "Nome\tCoins\tStatus\n";
    let exportCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(selectedClass) && !key.includes('_historico')) {
            const nomeNormalizado = key.split('_')[1];
            const nomeFormatado = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
            const coins = localStorage.getItem(key);
            const status = parseInt(coins) >= 0 ? 'Positivo' : 'Negativo';
            txt += `${nomeFormatado}\t${coins}\t${status}\n`;
            exportCount++;
        }
    }

    try {
        const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
        const link = document.createElement("a");
        const filename = `makercoin_turma_${selectedClass}_${new Date().toISOString().split('T')[0]}.txt`;

        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", filename);
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`${exportCount} registros exportados com sucesso!`, 'success');
        addTerminalLog(`Dados exportados: ${exportCount} registros salvos em ${filename}`, 'success');

    } catch (error) {
        console.error('Export error:', error);
        showNotification('Erro ao exportar dados.', 'error');
        addTerminalLog(`Erro na exportação: ${error.message}`, 'error');
    }
}

function importarAlunos() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput?.files[0];

    if (!file) {
        showNotification('Selecione um arquivo .txt.', 'error');
        return;
    }

    if (!selectedClass) {
        showNotification('Selecione uma turma antes de importar.', 'error');
        return;
    }

    const reader = new FileReader();
    let importCount = 0;
    let skipCount = 0;

    reader.onload = function (e) {
        try {
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
                        importCount++;
                    } else {
                        skipCount++;
                    }
                }
            });

            // Reset file input
            fileInput.value = '';
            const nomeArquivo = document.getElementById('nome-arquivo');
            if (nomeArquivo) nomeArquivo.textContent = 'Nenhum arquivo selecionado';

            displaySavedData();
            setupAutocomplete();

            showNotification(`Importação concluída! ${importCount} novos estudantes adicionados. ${skipCount} já existiam.`, 'success');
            addTerminalLog(`Importação de estudantes: +${importCount} novos, ${skipCount} duplicados ignorados`, 'success');

        } catch (error) {
            console.error('Error importing students:', error);
            showNotification('Erro ao importar estudantes.', 'error');
            addTerminalLog(`Erro na importação de estudantes: ${error.message}`, 'error');
        }
    };

    reader.onerror = function () {
        showNotification('Erro ao ler o arquivo.', 'error');
        addTerminalLog('Erro na leitura do arquivo de importação', 'error');
    };

    reader.readAsText(file);
}

function mostrarNomeArquivo() {
    const fileInput = document.getElementById('fileUpload');
    const fileName = fileInput?.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
    const statusElement = document.getElementById('nome-arquivo');
    if (statusElement) {
        statusElement.textContent = fileName;
    }
}

function mostrarNomeArquivoData() {
    const fileInput = document.getElementById('fileUploadData');
    const fileName = fileInput?.files.length > 0 ? fileInput.files[0].name : 'Nenhum arquivo selecionado';
    const statusElement = document.getElementById('nome-arquivo-data');
    if (statusElement) {
        statusElement.textContent = fileName;
    }
}

function importarDadosComCoins() {
    const fileInput = document.getElementById('fileUploadData');
    const file = fileInput?.files[0];

    if (!file) {
        showNotification('Selecione um arquivo .txt.', 'error');
        return;
    }

    if (!selectedClass) {
        showNotification('Selecione uma turma antes de importar.', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const linhas = e.target.result.split('\n');
            let importados = 0;
            let erros = 0;

            linhas.forEach(linha => {
                const linhaTrimmed = linha.trim();
                if (linhaTrimmed) {
                    // Split by tabs first, then by multiple spaces as fallback
                    let partes = linhaTrimmed.split('\t');
                    if (partes.length < 2) {
                        partes = linhaTrimmed.split(/\s+/);
                    }

                    if (partes.length >= 2) {
                        const coinsValue = parseInt(partes[partes.length - 1], 10);
                        const nomeBruto = partes.slice(0, -1).join(' ');

                        if (!isNaN(coinsValue) && nomeBruto) {
                            const nomeNormalizado = removerAcentos(nomeBruto).toLowerCase().replace(/\s+/g, ' ').trim();
                            const key = `${selectedClass}_${nomeNormalizado}`;
                            const historicoKey = `${key}_historico`;

                            // Create student if doesn't exist
                            if (!localStorage.getItem(key)) {
                                localStorage.setItem(key, 0);
                                localStorage.setItem(historicoKey, JSON.stringify([]));
                            }

                            // Add imported coins
                            const valorAtual = parseInt(localStorage.getItem(key)) || 0;
                            const novoValor = valorAtual + coinsValue;
                            localStorage.setItem(key, novoValor);

                            // Add to history
                            let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
                            historico.push({
                                data: getCurrentTimestamp(),
                                valor: coinsValue,
                                justificativa: 'Importação de dados',
                                tipo: coinsValue > 0 ? 'credito' : 'debito'
                            });
                            localStorage.setItem(historicoKey, JSON.stringify(historico));

                            importados++;
                        } else {
                            erros++;
                            addTerminalLog(`Erro ao processar linha: "${linhaTrimmed}" - valor inválido ou nome vazio`, 'error');
                        }
                    } else {
                        erros++;
                        addTerminalLog(`Erro ao processar linha: "${linhaTrimmed}" - formato incorreto`, 'error');
                    }
                }
            });

            // Reset file input
            fileInput.value = '';
            const nomeArquivoData = document.getElementById('nome-arquivo-data');
            if (nomeArquivoData) nomeArquivoData.textContent = 'Nenhum arquivo selecionado';

            displaySavedData();
            setupAutocomplete();

            showNotification(`Dados importados! ${importados} registros processados, ${erros} erros.`, importados > 0 ? 'success' : 'error');
            addTerminalLog(`Importação de dados: ${importados} processados, ${erros} erros`, importados > 0 ? 'success' : 'error');

        } catch (error) {
            console.error('Error importing data with coins:', error);
            showNotification('Erro ao importar dados.', 'error');
            addTerminalLog(`Erro na importação de dados: ${error.message}`, 'error');
        }
    };

    reader.onerror = function () {
        showNotification('Erro ao ler o arquivo de dados.', 'error');
        addTerminalLog('Erro na leitura do arquivo de dados', 'error');
    };

    reader.readAsText(file);
}

/**
 * Group Operations
 */
function alterarTodos(acao) {
    if (!selectedClass) {
        showNotification('Selecione uma turma antes.', 'error');
        return;
    }

    const valorInput = parseInt(document.getElementById('coinsGroup')?.value, 10);
    if (isNaN(valorInput) || valorInput <= 0) {
        showNotification('Digite um valor positivo válido.', 'error');
        return;
    }

    if (!confirm(`Tem certeza que deseja ${acao === 'add' ? 'adicionar' : 'remover'} ${valorInput} MKR ${acao === 'add' ? 'para' : 'de'} todos os estudantes da turma ${selectedClass}?`)) {
        return;
    }

    const valorAplicado = acao === 'remove' ? -Math.abs(valorInput) : Math.abs(valorInput);
    let affectedCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(selectedClass) && !key.includes('_historico')) {
            const atual = parseInt(localStorage.getItem(key)) || 0;
            const novoValor = atual + valorAplicado;
            localStorage.setItem(key, novoValor);

            // Add to history
            const historicoKey = `${key}_historico`;
            let historico = JSON.parse(localStorage.getItem(historicoKey)) || [];
            historico.push({
                data: getCurrentTimestamp(),
                valor: valorAplicado,
                justificativa: acao === 'remove' ? 'Remoção em grupo' : 'Distribuição em grupo',
                tipo: valorAplicado > 0 ? 'credito' : 'debito'
            });
            localStorage.setItem(historicoKey, JSON.stringify(historico));

            affectedCount++;
        }
    }

    // Clear input
    const coinsGroupInput = document.getElementById('coinsGroup');
    if (coinsGroupInput) coinsGroupInput.value = '';

    displaySavedData();

    const actionText = acao === 'add' ? 'adicionados' : 'removidos';
    showNotification(`${valorInput} MKR ${actionText} para ${affectedCount} estudantes da turma ${selectedClass}.`, 'success');
    addTerminalLog(`Operação em grupo: ${valorAplicado > 0 ? '+' : ''}${valorAplicado} MKR para ${affectedCount} estudantes`, 'success');
}

/**
 * History Functions
 */
function mostrarHistorico() {
    const nomeInput = document.getElementById('pesquisa')?.value.trim();

    if (!selectedClass || !nomeInput) {
        showNotification('Selecione uma turma e digite o nome.', 'error');
        return;
    }

    const nomeNormalizado = removerAcentos(nomeInput).toLowerCase().replace(/\s+/g, ' ').trim();
    const nome = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
    const historicoKey = `${selectedClass}_${nomeNormalizado}_historico`;
    const historico = JSON.parse(localStorage.getItem(historicoKey)) || [];

    const container = document.getElementById('historicoAluno');
    if (!container) return;

    container.innerHTML = `
        <div class="history-header">
            <h3><i class="fas fa-user"></i> Histórico de ${nome}</h3>
            <div class="history-stats">
                <span class="stat"><i class="fas fa-list"></i> ${historico.length} transações</span>
            </div>
        </div>
    `;

    if (historico.length === 0) {
        container.innerHTML += `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <p>Nenhum histórico encontrado</p>
                <small>Este estudante ainda não possui transações registradas</small>
            </div>
        `;
        return;
    }

    const lista = document.createElement('div');
    lista.className = 'history-list';

    // Sort history by date (newest first)
    historico.sort((a, b) => new Date(b.data) - new Date(a.data));

    historico.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `history-item ${item.tipo || 'neutral'}`;

        const valorClass = item.valor > 0 ? 'positive' : 'negative';
        const valorIcon = item.valor > 0 ? 'fa-plus' : 'fa-minus';

        itemDiv.innerHTML = `
            <div class="history-main">
                <div class="history-info">
                    <span class="history-date"><i class="fas fa-clock"></i> ${item.data}</span>
                    <span class="history-value ${valorClass}">
                        <i class="fas ${valorIcon}"></i>
                        ${item.valor > 0 ? '+' : ''}${item.valor} MKR
                    </span>
                </div>
                ${item.justificativa ? `
                    <button class="justification-btn" onclick="showJustification('${index}', '${encodeURIComponent(item.justificativa)}')">
                        <i class="fas fa-info-circle"></i>
                        Ver Justificativa
                    </button>
                ` : ''}
            </div>
        `;

        lista.appendChild(itemDiv);
    });

    container.appendChild(lista);

    addTerminalLog(`Histórico exibido para ${nome}: ${historico.length} transações`, 'info');
}

function showJustification(index, justificativa) {
    const decodedJustification = decodeURIComponent(justificativa);
    showNotification(`Justificativa: ${decodedJustification}`, 'info');
    addTerminalLog(`Justificativa visualizada para transação #${index}`, 'info');
}

/**
 * Enhanced Autocomplete
 */
function setupAutocomplete() {
    const nameInput = document.getElementById('name');
    const autocompleteList = document.getElementById('autocomplete-list');

    if (!nameInput || !autocompleteList) return;

    nameInput.addEventListener('input', function () {
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

    nameInput.addEventListener('keydown', function (e) {
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

    // Hide list when clicking outside
    document.addEventListener('click', function (e) {
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
                const coins = parseInt(localStorage.getItem(key)) || 0;
                matches.push({ nome: nomeFormatado, coins });
            }
        }
    }

    return matches.sort((a, b) => a.nome.localeCompare(b.nome));
}

function showAutocompleteList(matches) {
    const autocompleteList = document.getElementById('autocomplete-list');
    if (!autocompleteList) return;

    autocompleteList.innerHTML = '';

    matches.forEach((match, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
            <span class="autocomplete-name">${match.nome}</span>
            <span class="autocomplete-coins ${match.coins < 0 ? 'negative' : 'positive'}">
                ${match.coins} MKR
            </span>
        `;
        item.addEventListener('click', function () {
            selectAutocompleteItem(match.nome);
        });
        autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = 'block';
}

function hideAutocomplete() {
    const autocompleteList = document.getElementById('autocomplete-list');
    if (autocompleteList) {
        autocompleteList.style.display = 'none';
        selectedAutocompleteIndex = -1;
    }
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
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.value = name;
    }
    hideAutocomplete();
    addTerminalLog(`Estudante selecionado via autocompletar: ${name}`, 'info');
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('alert');
    if (!container) return;

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

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

/**
 * FAB Menu Functions
 */
function toggleFabMenu() {
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) {
        fabContainer.classList.toggle('active');
        fabMenuOpen = !fabMenuOpen;

        const mainIcon = fabContainer.querySelector('.fab-main i');
        if (mainIcon) {
            mainIcon.className = fabMenuOpen ? 'fas fa-times' : 'fas fa-cog';
        }

        addTerminalLog(`Menu FAB ${fabMenuOpen ? 'aberto' : 'fechado'}`, 'info');
    }
}

function refreshData() {
    displaySavedData();
    updateSystemStatus();
    showNotification('Dados atualizados com sucesso!', 'success');
    addTerminalLog('Dados do sistema atualizados manualmente', 'success');
}

function backupData() {
    try {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            allData[key] = localStorage.getItem(key);
        }

        const backup = JSON.stringify(allData, null, 2);
        const blob = new Blob([backup], { type: 'application/json' });
        const link = document.createElement('a');
        const filename = `makercoin_backup_${new Date().toISOString().split('T')[0]}.json`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Backup criado com sucesso!', 'success');
        addTerminalLog(`Backup completo criado: ${filename}`, 'success');
    } catch (error) {
        console.error('Backup error:', error);
        showNotification('Erro ao criar backup.', 'error');
        addTerminalLog(`Erro no backup: ${error.message}`, 'error');
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    showNotification(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`, 'info');
    addTerminalLog(`Tema alterado: ${newTheme}`, 'info');
}

function showSettings() {
    showNotification('Configurações em desenvolvimento.', 'info');
    addTerminalLog('Tentativa de acesso às configurações', 'info');
}

/**
 * Terminal Command System
 */
function handleTerminalCommand(command) {
    const cmd = command.toLowerCase().trim();

    switch (cmd) {
        case 'help':
            addTerminalLog('Comandos disponíveis: help, clear, status, refresh, backup', 'info');
            break;
        case 'clear':
            const terminal = document.getElementById('terminal-output');
            if (terminal) terminal.innerHTML = '';
            break;
        case 'status':
            const totalUsers = document.querySelectorAll('.user-card').length;
            addTerminalLog(`Sistema operacional. Usuários ativos: ${totalUsers}`, 'success');
            break;
        case 'refresh':
            refreshData();
            break;
        case 'backup':
            backupData();
            break;
        default:
            addTerminalLog(`Comando não reconhecido: ${cmd}`, 'error');
    }
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    // Terminal input
    const terminalInput = document.querySelector('.terminal-input');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                if (command) {
                    addTerminalLog(`$ ${command}`, 'system');
                    handleTerminalCommand(command);
                    this.value = '';
                }
            }
        });
    }

    // Form validation
    const coinsInput = document.getElementById('coins');
    if (coinsInput) {
        coinsInput.addEventListener('input', function () {
            const value = parseInt(this.value);
            if (value < 0) {
                this.value = Math.abs(value);
            }
        });
    }

    // Close FAB menu when clicking outside
    document.addEventListener('click', function (e) {
        const fabContainer = document.querySelector('.fab-container');
        if (fabContainer && fabMenuOpen && !fabContainer.contains(e.target)) {
            toggleFabMenu();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Ctrl + S to save data
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveData();
        }
        // Ctrl + E to export
        else if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportToTXT();
        }
        // Ctrl + T to toggle terminal
        else if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            toggleTerminal();
        }
    });
}

/**
 * Initialize System
 */
function initializeSystem() {
    addTerminalLog('Sistema Maker Coins iniciado', 'success');
    addTerminalLog('Conectando à blockchain fictícia...', 'info');

    setTimeout(() => {
        addTerminalLog('Conexão estabelecida com sucesso', 'success');
        addTerminalLog('Wallet inicializada - Saldo: 0 MKR', 'info');
    }, 1000);

    // Start price updates
    priceUpdateInterval = setInterval(updateCryptoPrices, 30000); // Every 30 seconds

    // Start system status updates
    setInterval(updateSystemStatus, 60000); // Every minute

    // Initialize display if class is selected
    if (selectedClass) {
        displaySavedData();
    }

    addTerminalLog('Todos os sistemas operacionais', 'success');
}

/**
 * Cleanup Functions
 */
function cleanup() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }

    addTerminalLog('Sistema finalizado', 'warning');
}

/**
 * DOM Content Loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize components
    createMatrixRain();
    setupAutocomplete();
    setupEventListeners();
    initializeSystem();

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }

    // Setup auto-save
    const inputs = ['name', 'coins'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                // Auto-save draft functionality could be added here
            });
        }
    });

    // Window unload cleanup
    window.addEventListener('beforeunload', cleanup);

    addTerminalLog('Interface carregada e pronta para uso', 'success');
});

/**
 * Enhanced Error Handling
 */
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    addTerminalLog(`Erro do sistema: ${e.error.message}`, 'error');
    showNotification('Erro inesperado detectado. Verifique o terminal para detalhes.', 'error');
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    addTerminalLog(`Erro assíncrono: ${e.reason}`, 'error');
});

/**
 * Performance Monitoring
 */
function logPerformance(operation, startTime) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    addTerminalLog(`Operação '${operation}' concluída em ${duration}ms`, 'info');
}

/**
 * Additional Utility Functions
 */
function generateTransactionId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function validateStudentName(name) {
    if (!name || typeof name !== 'string') return false;
    if (name.trim().length < 2) return false;
    if (name.length > 50) return false;
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
}

function validateCoinsAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return false;
    if (Math.abs(amount) > 999999) return false;
    return Number.isInteger(amount);
}

/**
 * Advanced Features
 */
function generateReport() {
    if (!selectedClass) {
        showNotification('Selecione uma turma para gerar relatório.', 'error');
        return;
    }

    const students = [];
    let totalCoins = 0;
    let positiveBalance = 0;
    let negativeBalance = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(selectedClass) && !key.includes('_historico')) {
            const coins = parseInt(localStorage.getItem(key)) || 0;
            const name = key.split('_')[1];

            students.push({ name, coins });
            totalCoins += coins;

            if (coins >= 0) {
                positiveBalance++;
            } else {
                negativeBalance++;
            }
        }
    }

    const report = {
        turma: selectedClass,
        data: getCurrentTimestamp(),
        totalEstudantes: students.length,
        totalCoins: totalCoins,
        estudantesPositivos: positiveBalance,
        estudantesNegativos: negativeBalance,
        mediaCoins: students.length > 0 ? (totalCoins / students.length).toFixed(2) : 0,
        estudantes: students.sort((a, b) => b.coins - a.coins)
    };

    const reportText = `
RELATÓRIO MAKER COINS - TURMA ${report.turma}
Gerado em: ${report.data}

ESTATÍSTICAS GERAIS:
- Total de Estudantes: ${report.totalEstudantes}
- Total de MKR Coins: ${report.totalCoins}
- Média por Estudante: ${report.mediaCoins} MKR
- Estudantes com Saldo Positivo: ${report.estudantesPositivos}
- Estudantes com Saldo Negativo: ${report.estudantesNegativos}

RANKING DE ESTUDANTES:
${report.estudantes.map((s, i) => `${i + 1}º - ${s.name}: ${s.coins} MKR`).join('\n')}

---
Relatório gerado pelo Sistema Maker Coins
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const filename = `relatorio_${selectedClass}_${new Date().toISOString().split('T')[0]}.txt`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Relatório gerado com sucesso!', 'success');
    addTerminalLog(`Relatório completo gerado: ${filename}`, 'success');
}

/**
 * Export original functions for backward compatibility
 */
// Use IIFE to avoid hoisting issues
(function () {
    window.toggleJustificativa = toggleJustificativa;
    window.setClass = setClass;
    window.saveData = saveData;
    window.displaySavedData = displaySavedData;
    window.deleteData = deleteData;
    window.exportToTXT = exportToTXT;
    window.mostrarHistorico = mostrarHistorico;
    window.showJustification = showJustification;
    window.importarAlunos = importarAlunos;
    window.mostrarNomeArquivo = mostrarNomeArquivo;
    window.mostrarNomeArquivoData = mostrarNomeArquivoData;
    window.importarDadosComCoins = importarDadosComCoins;
    window.alterarTodos = alterarTodos;
    window.toggleTerminal = toggleTerminal;
    window.closeTerminal = closeTerminal;
    window.minimizeTerminal = minimizeTerminal;
    window.maximizeTerminal = maximizeTerminal;
    window.toggleFabMenu = toggleFabMenu;
    window.refreshData = refreshData;
    window.backupData = backupData;
    window.toggleTheme = toggleTheme;
    window.showSettings = showSettings;
    window.generateReport = generateReport;
})();
