// Modern Crypto Leaderboard JavaScript - Enhanced Frontend - VERSÃO CORRIGIDA
let currentClass = '5A';
let currentSort = 'coins';
let priceUpdateInterval = null;
let logUpdateInterval = null;
let leaderboardData = [];
let isLoading = false;

// Crypto price simulation
const marketData = {
    mkr: { price: 1247.89, change: 2.34, symbol: 'MKR' },
    edu: { price: 156.78, change: 5.67, symbol: 'EDU' }
};

/**
 * Utility Functions
 */
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

function getCurrentTimestamp() {
    return new Date().toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Market Price Updates
 */
function updateMarketPrices() {
    Object.keys(marketData).forEach(crypto => {
        const priceElement = document.getElementById(`${crypto}-live`);

        if (priceElement) {
            // Simulate price fluctuation (-1% to +1%)
            const changePercent = (Math.random() - 0.5) * 2;
            const currentPrice = marketData[crypto].price;
            const newPrice = currentPrice * (1 + changePercent / 100);

            marketData[crypto].price = newPrice;
            marketData[crypto].change = changePercent;

            priceElement.textContent = formatCurrency(newPrice);

            // Update change indicator
            const changeSpan = priceElement.nextElementSibling;
            if (changeSpan) {
                changeSpan.textContent = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                changeSpan.className = `change ${changePercent > 0 ? 'positive' : 'negative'}`;
            }
        }
    });
}

/**
 * Notification System
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

/**
 * Loading System
 */
function showLoading() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.style.display = 'flex';
        isLoading = true;
    }
}

function hideLoading() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.style.display = 'none';
        isLoading = false;
    }
}

/**
 * Mini Terminal Functions
 */
function addLog(message, type = 'info') {
    const logsContainer = document.getElementById('terminal-logs');
    if (!logsContainer) return;

    const logLine = document.createElement('div');
    logLine.className = 'log-line';
    logLine.innerHTML = `
        <span class="log-time">[${getCurrentTimestamp()}]</span>
        <span class="log-msg ${type}">${message}</span>
    `;

    logsContainer.appendChild(logLine);
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Keep only last 50 logs
    while (logsContainer.children.length > 50) {
        logsContainer.removeChild(logsContainer.firstChild);
    }
}

function toggleMiniTerminal() {
    const terminal = document.getElementById('mini-terminal');
    if (terminal) {
        terminal.classList.toggle('collapsed');
        const isCollapsed = terminal.classList.contains('collapsed');
        addLog(`Terminal ${isCollapsed ? 'minimizado' : 'expandido'}`, 'info');
    }
}

/**
 * Enhanced Class Management
 */
function showLeaderboard(className) {
    if (isLoading) return;

    showLoading();
    currentClass = className;

    // Update tab appearance
    updateClassButtons(className);

    // Simulate loading delay for better UX
    setTimeout(() => {
        displayLeaderboard();
        hideLoading();
        showToast(`Carregando dados da turma ${className}`, 'success');
        addLog(`Turma ${className} selecionada`, 'success');
    }, 800);
}

function updateClassButtons(className) {
    document.querySelectorAll('.nb-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-class') === className) {
            tab.classList.add('active');
        }
    });
}

/**
 * Enhanced Sort Management
 */
function toggleSort(sortType) {
    currentSort = sortType;
    updateSortButtons(sortType);
    displayLeaderboard();

    const sortName = sortType === 'alphabetical' ? 'alfabética' : 'por coins';
    showToast(`Ordenação alterada para ${sortName}`, 'info');
    addLog(`Ordenação: ${sortName}`, 'info');
}

function updateSortButtons(sortType) {
    const alphaButton = document.getElementById('sort-alpha');
    const coinsButton = document.getElementById('sort-coins');

    if (alphaButton && coinsButton) {
        alphaButton.style.background = sortType === 'alphabetical' ? 'var(--nb-purple)' : 'var(--nb-card-bg)';
        alphaButton.style.color = sortType === 'alphabetical' ? 'white' : 'var(--nb-text-primary)';

        coinsButton.style.background = sortType === 'coins' ? 'var(--nb-purple)' : 'var(--nb-card-bg)';
        coinsButton.style.color = sortType === 'coins' ? 'white' : 'var(--nb-text-primary)';
    }
}

/**
 * Enhanced Leaderboard Display - CORREÇÃO DO TOTAL MKR
 */
/**
 * Enhanced Leaderboard Display - API INTEGRATED
 */
async function displayLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    if (!isLoading) showLoading();

    try {
        const students = await apiClient.getRanking(currentClass);
        leaderboardData = students;

        leaderboard.innerHTML = '';

        let totalNomes = students.length;
        let totalCoins = students.reduce((sum, s) => sum + s.saldo, 0);

        // Apply sorting
        const sortedStudents = sortStudents([...students], currentSort);

        // Create student cards
        displayStudentCards(sortedStudents);

        // Update counters
        updateCounters(totalNomes, totalCoins);

        // Show empty state if needed
        if (students.length === 0) {
            displayEmptyMessage();
        }

        addLog(`${totalNomes} estudantes carregados da turma ${currentClass}`, 'info');
    } catch (error) {
        console.error('Error fetching ranking:', error);
        addLog(`Erro ao carregar ranking: ${error.message}`, 'error');
        showToast('Erro ao carregar ranking', 'error');
    } finally {
        hideLoading();
    }
}

function formatStudentName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
}

function sortStudents(students, sortType) {
    if (sortType === 'alphabetical') {
        return students.sort((a, b) =>
            a.nome.localeCompare(b.nome, 'pt-BR', {
                sensitivity: 'base',
                ignorePunctuation: true
            })
        );
    } else {
        return students.sort((a, b) => {
            if (b.saldo !== a.saldo) {
                return b.saldo - a.saldo;
            }
            return a.nome.localeCompare(b.nome, 'pt-BR', {
                sensitivity: 'base',
                ignorePunctuation: true
            });
        });
    }
}

function displayStudentCards(students) {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    students.forEach((student, index) => {
        const item = document.createElement('div');
        item.className = 'nb-list-item';

        const rankPrefix = currentSort === 'coins' ? index + 1 : '•';
        const initials = student.nome ? student.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

        item.innerHTML = `
            <div class="nb-list-rank">${rankPrefix}</div>
            <div class="nb-list-avatar">${initials}</div>
            <div class="nb-list-info">
                <div class="nb-list-name">${student.nome}</div>
                <div class="nb-list-class">${student.turma || currentClass} - Maker Coins Student</div>
            </div>
            <div class="nb-list-amount">${formatNumber(student.saldo)} MKR</div>
        `;

        item.onclick = () => showStudentDetails(student);
        leaderboard.appendChild(item);
    });
}

function createPositionBadge(index, sortType) {
    if (sortType !== 'coins') return '';

    const position = index + 1;
    let badgeClass = 'regular';
    let badgeIcon = position;

    switch (position) {
        case 1:
            badgeClass = 'gold';
            badgeIcon = '<i class="fas fa-crown"></i>';
            break;
        case 2:
            badgeClass = 'silver';
            badgeIcon = '<i class="fas fa-medal"></i>';
            break;
        case 3:
            badgeClass = 'bronze';
            badgeIcon = '<i class="fas fa-award"></i>';
            break;
    }

    return `<div class="position-badge ${badgeClass}">${badgeIcon}</div>`;
}

async function showStudentDetails(student) {
    // In full-stack mode, this could fetch student-specific history
    showToast(`
        <div class="student-details">
            <h3><i class="fas fa-user"></i> ${student.nome}</h3>
            <p>Saldo: ${formatNumber(student.saldo)} MKR</p>
            <p>Turma: ${student.turma}</p>
        </div>
    `, 'info');
}

/**
 * Enhanced Counter Update - CORREÇÃO DA ANIMAÇÃO
 */
function updateCounters(totalNomes, totalCoins) {
    const contadorNomes = document.getElementById('contador-nomes');
    const contadorCoins = document.getElementById('contador-coins');

    // CORREÇÃO: Verificar se os elementos existem antes de atualizar
    if (contadorNomes) {
        console.log(`Atualizando contador de nomes para: ${totalNomes}`);
        animateCounter(contadorNomes, totalNomes);
    } else {
        console.error('Elemento contador-nomes não encontrado no DOM');
    }

    if (contadorCoins) {
        console.log(`Atualizando contador de coins para: ${totalCoins}`);
        animateCounter(contadorCoins, totalCoins);
    } else {
        console.error('Elemento contador-coins não encontrado no DOM');
    }
}

/**
 * Enhanced Animation Counter - CORREÇÃO DA ANIMAÇÃO
 */
function animateCounter(element, targetValue) {
    // CORREÇÃO: Garantir que targetValue seja um número
    const target = parseInt(targetValue, 10) || 0;
    const currentValue = parseInt(element.textContent.replace(/[.,]/g, '')) || 0;

    console.log(`Animando de ${currentValue} para ${target}`);

    // Se os valores são iguais, não precisa animar
    if (currentValue === target) {
        element.textContent = formatNumber(target);
        return;
    }

    const difference = Math.abs(target - currentValue);
    const increment = Math.max(1, Math.ceil(difference / 20));

    if (currentValue < target) {
        const newValue = Math.min(currentValue + increment, target);
        element.textContent = formatNumber(newValue);
        if (newValue < target) {
            setTimeout(() => animateCounter(element, target), 50);
        }
    } else if (currentValue > target) {
        const newValue = Math.max(currentValue - increment, target);
        element.textContent = formatNumber(newValue);
        if (newValue > target) {
            setTimeout(() => animateCounter(element, target), 50);
        }
    }
}

function displayEmptyMessage() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;

    const user = JSON.parse(localStorage.getItem('makerUser') || '{}');
    const adminButton = user.role === 'admin' ? `
                <button class="nb-btn-primary" style="padding: 10px 20px; font-size: 14px;" onclick="window.location.href='atualizacao.html'">
                    <i class="fas fa-plus"></i> Adicionar Estudantes
                </button>` : '';

    leaderboard.innerHTML = `
        <div class="nb-empty-state">
            <div class="nb-empty-icon">
                <i class="fas fa-users-slash"></i>
            </div>
            <h3 class="nb-empty-title">Nenhum estudante encontrado</h3>
            <p class="nb-empty-desc">Esta turma ainda não possui estudantes cadastrados.</p>
            <div class="nb-empty-actions">
                <button class="nb-btn-secondary" style="padding: 10px 20px; font-size: 14px;" onclick="refreshLeaderboard()">
                    <i class="fas fa-sync-alt"></i> Atualizar
                </button>
                ${adminButton}
            </div>
        </div>
    `;
}

/**
 * Enhanced Refresh Function
 */
function refreshLeaderboard() {
    if (isLoading) return;

    showLoading();
    addLog('Atualizando dados...', 'info');

    setTimeout(() => {
        displayLeaderboard();
        hideLoading();
        showToast('Dados atualizados com sucesso!', 'success');
        addLog('Dados atualizados', 'success');
    }, 1000);
}

/**
 * Search and Filter Functions
 */
function searchStudents(query) {
    if (!query || query.length < 2) {
        displayLeaderboard();
        return;
    }

    const normalizedQuery = removerAcentos(query.toLowerCase());
    const filteredStudents = leaderboardData.filter(student =>
        removerAcentos(student.name.toLowerCase()).includes(normalizedQuery)
    );

    const sortedStudents = sortStudents(filteredStudents, currentSort);
    displayStudentCards(sortedStudents);

    addLog(`Pesquisa: "${query}" - ${filteredStudents.length} resultados`, 'info');
}

/**
 * Statistics Functions
 */
function calculateStatistics() {
    if (leaderboardData.length === 0) return null;

    const coins = leaderboardData.map(s => s.coins);
    const positive = coins.filter(c => c >= 0).length;
    const negative = coins.filter(c => c < 0).length;
    const total = coins.reduce((sum, c) => sum + c, 0);
    const average = total / coins.length;
    const max = Math.max(...coins);
    const min = Math.min(...coins);

    return {
        totalStudents: leaderboardData.length,
        totalCoins: total,
        averageCoins: average,
        positiveBalances: positive,
        negativeBalances: negative,
        maxBalance: max,
        minBalance: min
    };
}

function showStatistics() {
    const stats = calculateStatistics();
    if (!stats) {
        showToast('Nenhum dado disponível para estatísticas', 'warning');
        return;
    }

    const statsHtml = `
        <div class="statistics-panel">
            <h3><i class="fas fa-chart-bar"></i> Estatísticas da Turma ${currentClass}</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <i class="fas fa-users"></i>
                    <span>Estudantes: ${stats.totalStudents}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-coins"></i>
                    <span>Total MKR: ${formatNumber(stats.totalCoins)}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-calculator"></i>
                    <span>Média: ${formatNumber(Math.round(stats.averageCoins))}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-arrow-up"></i>
                    <span>Saldos +: ${stats.positiveBalances}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-arrow-down"></i>
                    <span>Saldos -: ${stats.negativeBalances}</span>
                </div>
            </div>
        </div>
    `;

    showToast(statsHtml, 'info');
    addLog('Estatísticas exibidas', 'info');
}

/**
 * Export Functions
 */
function exportLeaderboard() {
    if (leaderboardData.length === 0) {
        showToast('Nenhum dado para exportar', 'warning');
        return;
    }

    const sortedData = sortStudents([...leaderboardData], currentSort);
    let csvContent = 'Posição,Nome,MKR Coins,Status\n';

    sortedData.forEach((student, index) => {
        const position = currentSort === 'coins' ? index + 1 : '-';
        const status = student.coins >= 0 ? 'Positivo' : 'Negativo';
        csvContent += `${position},"${student.name}",${student.coins},${status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `leaderboard_${currentClass}_${new Date().toISOString().split('T')[0]}.csv`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Leaderboard exportado com sucesso!', 'success');
    addLog(`Leaderboard exportado: ${filename}`, 'success');
}

/**
 * Função para forçar atualização dos totais - USO DE EMERGÊNCIA
 */
function forceUpdateTotals() {
    console.log('Forçando atualização dos totais...');

    let totalNomes = 0;
    let totalCoins = 0;

    // Recalcular tudo do zero
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith(currentClass) && !key.includes('_historico')) {
            const coinValue = localStorage.getItem(key);
            const coins = parseInt(coinValue, 10);

            if (!isNaN(coins) && coinValue !== null && coinValue !== '') {
                totalNomes++;
                totalCoins += coins;
                console.log(`${key}: ${coins} (Total: ${totalCoins})`);
            }
        }
    }

    console.log(`RESULTADO FINAL - Estudantes: ${totalNomes}, Total MKR: ${totalCoins}`);

    // Atualizar diretamente sem animação
    const contadorNomes = document.getElementById('contador-nomes');
    const contadorCoins = document.getElementById('contador-coins');

    if (contadorNomes) {
        contadorNomes.textContent = formatNumber(totalNomes);
    }

    if (contadorCoins) {
        contadorCoins.textContent = formatNumber(totalCoins);
    }

    showToast(`Totais atualizados: ${totalNomes} estudantes, ${formatNumber(totalCoins)} MKR`, 'success');
    addLog(`Totais forçados - Nomes: ${totalNomes}, MKR: ${formatNumber(totalCoins)}`, 'success');

    return { totalNomes, totalCoins };
}

/**
 * Função de debug para verificar dados no localStorage
 */
function debugLocalStorage() {
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log(`Turma atual: ${currentClass}`);

    let debugTotal = 0;
    let debugCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith(currentClass) && !key.includes('_historico')) {
            const value = localStorage.getItem(key);
            const numValue = parseInt(value, 10);

            console.log(`${key}: "${value}" -> ${numValue} (válido: ${!isNaN(numValue)})`);

            if (!isNaN(numValue) && value !== null && value !== '') {
                debugCount++;
                debugTotal += numValue;
            }
        }
    }

    console.log(`TOTAL DEBUG: ${debugCount} estudantes, ${debugTotal} MKR`);
    console.log('=== FIM DEBUG ===');

    return { count: debugCount, total: debugTotal };
}

/**
 * Initialization Functions
 */
function initializeApp() {
    addLog('Sistema Maker Coins Leaderboard iniciado', 'success');

    // Set default class and sort
    updateClassButtons(currentClass);
    updateSortButtons(currentSort);

    // Load initial data
    displayLeaderboard();

    // Start intervals
    priceUpdateInterval = setInterval(updateMarketPrices, 15000);
    logUpdateInterval = setInterval(() => {
        addLog(`Sistema operacional - ${formatNumber(leaderboardData.length)} estudantes ativos`, 'info');
    }, 300000); // Every 5 minutes

    addLog('Todos os sistemas inicializados', 'success');
}

function setupEventListeners() {
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (!isLoading) {
            displayLeaderboard();
        }
    }, 30000);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            refreshLeaderboard();
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showStatistics();
        } else if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportLeaderboard();
        }
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            addLog('Aplicação reativada', 'info');
            refreshLeaderboard();
        }
    });
}

/**
 * Cleanup Functions
 */
function cleanup() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }

    if (logUpdateInterval) {
        clearInterval(logUpdateInterval);
    }

    addLog('Sistema finalizado', 'warning');
}

/**
 * Error Handling
 */
function handleError(error, context = 'Sistema') {
    console.error(`${context} Error:`, error);
    addLog(`Erro em ${context}: ${error.message}`, 'error');
    showToast(`Erro inesperado. Verifique o log do sistema.`, 'error');
}

/**
 * Performance Monitoring
 */
function logPerformance(operation, startTime) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    addLog(`Operação '${operation}' concluída em ${duration}ms`, 'info');
}

/**
 * Theme Management
 */
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('leaderboard-theme', newTheme);

    showToast(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`, 'info');
    addLog(`Tema alterado: ${newTheme}`, 'info');
}

/**
 * Advanced Features
 */
function showClassComparison() {
    const classes = ['5A', '5B', '5C'];
    const comparison = {};

    classes.forEach(className => {
        let total = 0;
        let count = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(className) && !key.includes('_historico')) {
                const coinValue = localStorage.getItem(key);
                const coins = parseInt(coinValue, 10);

                if (!isNaN(coins) && coinValue !== null && coinValue !== '') {
                    total += coins;
                    count++;
                }
            }
        }

        comparison[className] = {
            students: count,
            totalCoins: total,
            average: count > 0 ? Math.round(total / count) : 0
        };
    });

    let comparisonHtml = `
        <div class="class-comparison">
            <h3><i class="fas fa-balance-scale"></i> Comparação entre Turmas</h3>
            <div class="comparison-grid">
    `;

    Object.entries(comparison).forEach(([className, data]) => {
        comparisonHtml += `
            <div class="comparison-item">
                <h4>Turma ${className}</h4>
                <div class="comparison-stats">
                    <div class="stat"><i class="fas fa-users"></i> ${data.students} estudantes</div>
                    <div class="stat"><i class="fas fa-coins"></i> ${formatNumber(data.totalCoins)} MKR</div>
                    <div class="stat"><i class="fas fa-calculator"></i> Média: ${formatNumber(data.average)}</div>
                </div>
            </div>
        `;
    });

    comparisonHtml += `
            </div>
        </div>
    `;

    showToast(comparisonHtml, 'info');
    addLog('Comparação entre turmas exibida', 'info');
}

function generateQRCode() {
    const url = window.location.href;
    const qrData = `Maker Coins Leaderboard - ${currentClass}\n${url}`;

    showToast(`QR Code gerado para compartilhamento: ${url}`, 'success');
    addLog('QR Code gerado', 'info');
}

/**
 * Animation Effects
 */
function createParticleEffect() {
    const container = document.querySelector('.crypto-background');
    if (!container) return;

    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.setProperty('--i', i + 1);
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(particle);
    }
}

/**
 * Accessibility Functions
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
}

/**
 * Data Validation
 */
function validateLocalStorageData() {
    let validEntries = 0;
    let invalidEntries = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.match(/^[5][ABC]_/)) {
            const value = localStorage.getItem(key);
            if (key.includes('_historico')) {
                try {
                    JSON.parse(value);
                    validEntries++;
                } catch (e) {
                    invalidEntries++;
                    addLog(`Histórico corrompido detectado: ${key}`, 'warning');
                }
            } else {
                if (!isNaN(parseInt(value))) {
                    validEntries++;
                } else {
                    invalidEntries++;
                    addLog(`Valor inválido detectado: ${key} = ${value}`, 'warning');
                }
            }
        }
    }

    if (invalidEntries > 0) {
        showToast(`Atenção: ${invalidEntries} entradas inválidas detectadas`, 'warning');
    }

    addLog(`Validação: ${validEntries} válidas, ${invalidEntries} inválidas`, 'info');
    return invalidEntries === 0;
}

/**
 * Backup and Restore
 */
function createQuickBackup() {
    const backupData = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.match(/^[5][ABC]_/)) {
            backupData[key] = localStorage.getItem(key);
        }
    }

    const backup = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        data: backupData
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const filename = `makercoin_leaderboard_backup_${new Date().toISOString().split('T')[0]}.json`;

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Backup criado com sucesso!', 'success');
    addLog(`Backup criado: ${filename}`, 'success');
}

/**
 * DOM Ready and Initialization
 */
document.addEventListener('DOMContentLoaded', function () {
    try {
        // Initialize particle effects
        createParticleEffect();

        // Setup event listeners
        setupEventListeners();

        // Load saved theme
        const savedTheme = localStorage.getItem('leaderboard-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }

        // Validate data
        validateLocalStorageData();

        // Initialize app
        initializeApp();

        // Setup cleanup on page unload
        window.addEventListener('beforeunload', cleanup);

        addLog('Aplicação carregada com sucesso', 'success');

    } catch (error) {
        handleError(error, 'Inicialização');
    }
});

/**
 * Global Error Handlers
 */
window.addEventListener('error', function (e) {
    handleError(e.error, 'Global');
});

window.addEventListener('unhandledrejection', function (e) {
    handleError(e.reason, 'Promise');
});

/**
 * Export Functions for Global Access
 */
window.showLeaderboard = showLeaderboard;
window.toggleSort = toggleSort;
window.refreshLeaderboard = refreshLeaderboard;
window.toggleMiniTerminal = toggleMiniTerminal;
window.showStatistics = showStatistics;
window.exportLeaderboard = exportLeaderboard;
window.showClassComparison = showClassComparison;
window.toggleTheme = toggleTheme;
window.createQuickBackup = createQuickBackup;
window.forceUpdateTotals = forceUpdateTotals;
window.debugLocalStorage = debugLocalStorage;
