// Modern Crypto Portal JavaScript - Enhanced Index
let infoModalOpen = false;
let statsUpdateInterval = null;
let backgroundAnimationActive = true;

/**
 * Authentication System
 */
function authenticate() {
    const password = prompt('Digite a senha para acessar o painel de administração:');
    const correctPassword = 'Mantra2222';

    if (password === correctPassword) {
        showNotification('Acesso autorizado! Redirecionando...', 'success');
        addSystemLog('Acesso administrativo autorizado', 'success');

        setTimeout(() => {
            window.location.href = 'atualizacao.html';
        }, 1000);
    } else if (password !== null) { // User didn't cancel
        showNotification('Senha incorreta. Acesso negado.', 'error');
        addSystemLog('Tentativa de acesso negada - senha incorreta', 'warning');
    }
}

/**
 * Enhanced Notification System
 */
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `system-notification ${type}`;

    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <div class="notification-text">
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Position notifications
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    notification.style.pointerEvents = 'all';
    container.appendChild(notification);

    // Auto-remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
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
 * System Logging
 */
function addSystemLog(message, type = 'info') {
    const timestamp = new Date().toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);

    // Could be extended to show in a debug panel if needed
}

/**
 * Stats Management
 */
function updateSystemStats() {
    const stats = calculateGlobalStats();

    const totalUsersElement = document.getElementById('total-users');
    const totalCoinsElement = document.getElementById('total-coins');

    if (totalUsersElement) {
        animateCounter(totalUsersElement, stats.totalUsers);
    }

    if (totalCoinsElement) {
        animateCounter(totalCoinsElement, stats.totalCoins);
    }

    addSystemLog(`Estatísticas atualizadas: ${stats.totalUsers} usuários, ${stats.totalCoins} coins`, 'info');
}

function calculateGlobalStats() {
    let totalUsers = 0;
    let totalCoins = 0;

    // Count all students across all classes (3rd and 5th year)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Match both 5A/B/C and 3A/B/C
        if (key.match(/^[35][ABC]_/) && !key.includes('_historico')) {
            totalUsers++;
            totalCoins += parseInt(localStorage.getItem(key)) || 0;
        }
    }

    return { totalUsers, totalCoins };
}

function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent.replace(/\D/g, '')) || 0;
    const increment = Math.ceil(Math.abs(targetValue - currentValue) / 30);

    if (currentValue !== targetValue) {
        const newValue = currentValue < targetValue
            ? Math.min(currentValue + increment, targetValue)
            : Math.max(currentValue - increment, targetValue);

        element.textContent = formatNumber(newValue);

        if (newValue !== targetValue) {
            setTimeout(() => animateCounter(element, targetValue), 50);
        }
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Info Modal Management
 */
function toggleInfoModal() {
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    infoModalOpen = !infoModalOpen;

    if (infoModalOpen) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        addSystemLog('Modal de informações aberto', 'info');
    } else {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
        addSystemLog('Modal de informações fechado', 'info');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('info-modal');
    if (modal && infoModalOpen && e.target === modal) {
        toggleInfoModal();
    }
});

/**
 * Background Animation Control
 */
function toggleBackgroundAnimation() {
    const bgAnimation = document.querySelector('.bg-animation');
    if (!bgAnimation) return;

    backgroundAnimationActive = !backgroundAnimationActive;
    bgAnimation.style.animationPlayState = backgroundAnimationActive ? 'running' : 'paused';

    const floatingIcons = document.querySelectorAll('.floating-icons i');
    floatingIcons.forEach(icon => {
        icon.style.animationPlayState = backgroundAnimationActive ? 'running' : 'paused';
    });

    addSystemLog(`Animação de fundo ${backgroundAnimationActive ? 'ativada' : 'desativada'}`, 'info');
}

/**
 * Theme Management
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('portal-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        addSystemLog(`Tema carregado: ${savedTheme}`, 'info');
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('portal-theme', newTheme);

    showNotification(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`, 'info');
    addSystemLog(`Tema alterado: ${newTheme}`, 'info');
}

/**
 * Navigation Enhancement
 */
function enhanceNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');

    navButtons.forEach(button => {
        // Add hover sound effect (could be implemented)
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-8px) scale(1.02)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });

        // Add ripple effect on click
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Performance Monitoring
 */
function logPerformanceMetrics() {
    if (performance && performance.memory) {
        const memory = performance.memory;
        addSystemLog(`Memória: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB usados`, 'info');
    }

    const loadTime = performance.now();
    addSystemLog(`Tempo de carregamento: ${loadTime.toFixed(2)}ms`, 'info');
}

/**
 * Accessibility Features
 */
function setupAccessibility() {
    // High contrast mode
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        document.body.classList.add('reduced-motion');
        toggleBackgroundAnimation(); // Disable animations
        addSystemLog('Modo de movimento reduzido ativado', 'info');
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && infoModalOpen) {
            toggleInfoModal();
        }

        // Alt + H for help/info
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            toggleInfoModal();
        }

        // Alt + T for theme toggle
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

/**
 * Data Health Check
 */
function performDataHealthCheck() {
    let healthyEntries = 0;
    let corruptedEntries = 0;
    const issues = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.match(/^[5][ABC]_/)) {
                const value = localStorage.getItem(key);

                if (key.includes('_historico')) {
                    try {
                        const history = JSON.parse(value);
                        if (Array.isArray(history)) {
                            healthyEntries++;
                        } else {
                            corruptedEntries++;
                            issues.push(`Histórico inválido: ${key}`);
                        }
                    } catch (e) {
                        corruptedEntries++;
                        issues.push(`JSON corrompido: ${key}`);
                    }
                } else {
                    const coins = parseInt(value);
                    if (!isNaN(coins) && isFinite(coins)) {
                        healthyEntries++;
                    } else {
                        corruptedEntries++;
                        issues.push(`Valor inválido: ${key} = ${value}`);
                    }
                }
            }
        }

        const healthStatus = {
            healthy: healthyEntries,
            corrupted: corruptedEntries,
            issues: issues,
            percentage: healthyEntries / (healthyEntries + corruptedEntries) * 100
        };

        if (corruptedEntries > 0) {
            addSystemLog(`Verificação de integridade: ${corruptedEntries} problemas encontrados`, 'warning');
            showNotification(`Atenção: ${corruptedEntries} entradas corrompidas detectadas`, 'warning');
        } else {
            addSystemLog(`Verificação de integridade: todos os dados estão íntegros`, 'success');
        }

        return healthStatus;

    } catch (error) {
        addSystemLog(`Erro na verificação de integridade: ${error.message}`, 'error');
        return null;
    }
}

/**
 * System Diagnostics
 */
function runSystemDiagnostics() {
    addSystemLog('Iniciando diagnóstico do sistema...', 'info');

    const diagnostics = {
        localStorage: typeof Storage !== 'undefined',
        dataHealth: performDataHealthCheck(),
        performance: {
            loadTime: performance.now(),
            memory: performance.memory ? performance.memory.usedJSHeapSize : 'N/A'
        },
        browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled
        }
    };

    addSystemLog('Diagnóstico completo', 'success');
    return diagnostics;
}

/**
 * Export/Import System Data
 */
function createSystemBackup() {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '2.0-portal',
            systemInfo: {
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            },
            data: {}
        };

        // Collect all relevant data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.match(/^[5][ABC]_/) || key.includes('-theme')) {
                backup.data[key] = localStorage.getItem(key);
            }
        }

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        const filename = `makercoin_system_backup_${new Date().toISOString().split('T')[0]}.json`;

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Backup do sistema criado com sucesso!', 'success');
        addSystemLog(`Backup completo criado: ${filename}`, 'success');

    } catch (error) {
        addSystemLog(`Erro ao criar backup: ${error.message}`, 'error');
        showNotification('Erro ao criar backup do sistema', 'error');
    }
}

/**
 * Initialization Functions
 */
function initializePortal() {
    addSystemLog('Inicializando Portal Maker Coins...', 'info');

    // Initialize components
    initializeTheme();
    setupAccessibility();
    enhanceNavigation();

    // Run diagnostics
    const diagnostics = runSystemDiagnostics();

    // Update stats
    updateSystemStats();

    // Setup intervals
    statsUpdateInterval = setInterval(updateSystemStats, 30000); // Every 30 seconds

    // Performance logging
    setTimeout(logPerformanceMetrics, 1000);

    addSystemLog('Portal inicializado com sucesso', 'success');
    showNotification('Sistema Maker Coins carregado!', 'success', 2000);
}

function setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            addSystemLog('Portal reativado', 'info');
            updateSystemStats();
        }
    });

    // Handle online/offline status
    window.addEventListener('online', function () {
        addSystemLog('Conexão restaurada', 'success');
        showNotification('Conexão com a internet restaurada', 'success');
    });

    window.addEventListener('offline', function () {
        addSystemLog('Conexão perdida', 'warning');
        showNotification('Conexão com a internet perdida', 'warning');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
        if (statsUpdateInterval) {
            clearInterval(statsUpdateInterval);
        }
        addSystemLog('Portal finalizado', 'info');
    });
}

/**
 * CSS Injection for Dynamic Styles
 */
function injectDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .system-notification {
            background: var(--gradient-panel);
            border: 1px solid var(--border-accent);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease forwards;
            max-width: 400px;
        }
        
        .system-notification.success {
            border-color: var(--success);
        }
        
        .system-notification.error {
            border-color: var(--danger);
        }
        
        .system-notification.warning {
            border-color: var(--warning);
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            color: var(--text-primary);
        }
        
        .notification-content i {
            font-size: 1.2rem;
            margin-top: 0.2rem;
        }
        
        .notification-text strong {
            display: block;
            margin-bottom: 0.3rem;
            font-family: 'Orbitron', monospace;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.2rem;
            transition: all 0.3s ease;
            margin-left: auto;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
            transform: scale(1.1);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;

    document.head.appendChild(style);
}

/**
 * DOM Ready Initialization
 */
document.addEventListener('DOMContentLoaded', function () {
    try {
        // Inject dynamic styles
        injectDynamicStyles();

        // Setup event listeners
        setupEventListeners();

        // Initialize portal
        initializePortal();

        addSystemLog('DOM carregado e portal pronto', 'success');

    } catch (error) {
        console.error('Initialization error:', error);
        addSystemLog(`Erro na inicialização: ${error.message}`, 'error');
    }
});

/**
 * Global Error Handling
 */
window.addEventListener('error', function (e) {
    addSystemLog(`Erro global: ${e.error?.message || e.message}`, 'error');
    showNotification('Erro inesperado detectado', 'error');
});

window.addEventListener('unhandledrejection', function (e) {
    addSystemLog(`Promise rejeitada: ${e.reason}`, 'error');
});

/**
 * Extra Modals Logic (Extrato & Premios)
 */
function openExtraModal(type) {
    const modal = document.getElementById('extra-modal');
    const title = document.getElementById('extra-modal-title');
    const body = document.getElementById('extra-modal-body');

    if (!modal || !title || !body) return;

    body.innerHTML = '';

    if (type === 'extrato') {
        title.innerHTML = '<i class="fas fa-history"></i> Extrato Global';
        renderGlobalHistory(body);
    } else if (type === 'premios') {
        title.innerHTML = '<i class="fas fa-gift"></i> Prêmios Maker';
        renderAwards(body);
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    addSystemLog(`Modal extra aberto: ${type}`, 'info');
}

function closeExtraModal() {
    const modal = document.getElementById('extra-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        addSystemLog('Modal extra fechado', 'info');
    }
}

function renderGlobalHistory(container) {
    const history = [];

    // Scan all history in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('_historico')) {
            try {
                const studentName = key.split('_')[1];
                const studentHistory = JSON.parse(localStorage.getItem(key)) || [];
                studentHistory.forEach(entry => {
                    history.push({
                        ...entry,
                        student: studentName.charAt(0).toUpperCase() + studentName.slice(1)
                    });
                });
            } catch (e) {
                console.error('Error parsing history for', key);
            }
        }
    }

    // Sort by date (descending)
    history.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    // Limit to latest 15
    const latest = history.slice(0, 15);

    if (latest.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--nb-text-secondary); padding: 20px;">Nenhuma transação registrada no sistema.</p>';
        return;
    }

    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    latest.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <div style="font-size: 12px; color: var(--nb-primary-light);">${item.data || 'Data N/D'}</div>
            <div style="font-weight: 600;">${item.student}</div>
            <div style="font-size: 14px; color: var(--nb-text-secondary);">${item.descricao || 'Transferência corrigida'}</div>
            <div style="font-weight: 700; color: ${item.valor >= 0 ? 'var(--nb-neon-green)' : '#ff4d4d'};">
                ${item.valor >= 0 ? '+' : ''}${item.valor} MKR
            </div>
        `;
        timeline.appendChild(div);
    });

    container.appendChild(timeline);
}

function renderAwards(container) {
    // Development Notice
    const notice = document.createElement('div');
    notice.style.cssText = `
        background: rgba(255, 100, 0, 0.15);
        border: 1px solid #ff6400;
        color: #ffb86c;
        padding: 12px;
        border-radius: 12px;
        font-size: 13px;
        text-align: center;
        margin-bottom: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    `;
    notice.innerHTML = '<i class="fas fa-tools"></i> MÓDULO EM DESENVOLVIMENTO';
    container.appendChild(notice);

    const awards = [
        { id: 1, name: 'Certificado Maker', cost: 50, icon: 'fa-certificate', desc: 'Certificado digital de participação.' },
        { id: 2, name: 'Voucher Cantina', cost: 200, icon: 'fa-hamburger', desc: 'Vale lanche promocional.' },
        { id: 3, name: 'Medalha Bronze', cost: 500, icon: 'fa-medal', desc: 'Medalha física de bronze.' },
        { id: 4, name: 'Kit Maker Pro', cost: 1000, icon: 'fa-tools', desc: 'Ferramentas exclusivas para projetos.' }
    ];

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '16px';
    grid.style.marginTop = '10px';

    awards.forEach(award => {
        const item = document.createElement('div');
        item.className = 'nb-card';
        item.style.padding = '16px';
        item.style.margin = '0';
        item.style.textAlign = 'center';
        item.style.opacity = '0.7'; // Fade out a bit to show it's disabled
        item.innerHTML = `
            <i class="fas ${award.icon}" style="font-size: 24px; color: var(--nb-primary-light); margin-bottom: 8px;"></i>
            <div style="font-size: 14px; font-weight: 700;">${award.name}</div>
            <div style="font-size: 12px; color: var(--nb-neon-green); margin: 4px 0;">${award.cost} MKR</div>
            <button class="nb-btn-primary" style="padding: 8px; font-size: 10px; margin-top: 8px; background: #444; cursor: not-allowed;" disabled>BLOQUEADO</button>
        `;
        grid.appendChild(item);
    });

    container.appendChild(grid);
}

// Global Exports
window.authenticate = authenticate;
window.toggleInfoModal = toggleInfoModal;
window.toggleTheme = toggleTheme;
window.createSystemBackup = createSystemBackup;
window.runSystemDiagnostics = runSystemDiagnostics;
window.openExtraModal = openExtraModal;
window.closeExtraModal = closeExtraModal;
