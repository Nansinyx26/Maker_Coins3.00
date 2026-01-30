/**
 * Sistema Mobile Responsivo - JavaScript
 * Funcional para qualquer dispositivo móvel
 */

class MobileSystem {
    constructor() {
        this.deviceInfo = {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            isTouchDevice: false,
            isIOS: false,
            isAndroid: false,
            orientation: 'portrait',
            viewport: { width: 0, height: 0 }
        };

        this.breakpoints = {
            mobile: 768,
            tablet: 1024
        };

        this.resizeTimeout = null;
        this.orientationTimeout = null;
        this.keyboardTimeout = null;
        this.initialViewportHeight = window.innerHeight;

        this.init();
    }

    /**
     * Inicializar sistema
     */
    init() {
        console.log('📱 Inicializando Mobile System...');

        this.detectDevice();
        this.setDeviceClasses();
        this.setupEventListeners();
        this.setupTouchFeedback();
        this.handleOrientation();
        this.optimizePerformance();
        this.setupKeyboardDetection();

        console.log('✅ Mobile System ativo:', this.deviceInfo);
    }

    /**
     * Detectar tipo de dispositivo
     */
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const viewport = this.getViewportSize();

        // Detecção básica
        this.deviceInfo.isMobile = viewport.width <= this.breakpoints.mobile;
        this.deviceInfo.isTablet = viewport.width > this.breakpoints.mobile &&
            viewport.width <= this.breakpoints.tablet;
        this.deviceInfo.isDesktop = viewport.width > this.breakpoints.tablet;

        // Touch e SO
        this.deviceInfo.isTouchDevice = 'ontouchstart' in window;
        this.deviceInfo.isIOS = /iphone|ipad|ipod/i.test(userAgent);
        this.deviceInfo.isAndroid = /android/i.test(userAgent);

        // Orientação e viewport
        this.deviceInfo.orientation = this.getOrientation();
        this.deviceInfo.viewport = viewport;
    }

    /**
     * Obter tamanho do viewport
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    /**
     * Obter orientação
     */
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * Definir classes CSS baseadas no dispositivo
     */
    setDeviceClasses() {
        const body = document.body;

        // Remover classes existentes
        body.classList.remove('is-mobile', 'is-tablet', 'is-desktop', 'is-touch', 'is-ios', 'is-android');

        // Adicionar classes do dispositivo
        if (this.deviceInfo.isMobile) body.classList.add('is-mobile');
        if (this.deviceInfo.isTablet) body.classList.add('is-tablet');
        if (this.deviceInfo.isDesktop) body.classList.add('is-desktop');
        if (this.deviceInfo.isTouchDevice) body.classList.add('is-touch');
        if (this.deviceInfo.isIOS) body.classList.add('is-ios');
        if (this.deviceInfo.isAndroid) body.classList.add('is-android');

        // Ajustar fonte base
        this.adjustBaseFontSize();

        console.log('🏷️ Classes aplicadas:', {
            mobile: this.deviceInfo.isMobile,
            tablet: this.deviceInfo.isTablet,
            desktop: this.deviceInfo.isDesktop
        });
    }

    /**
     * Ajustar tamanho da fonte base
     */
    adjustBaseFontSize() {
        const html = document.documentElement;

        if (this.deviceInfo.isMobile) {
            html.style.fontSize = this.deviceInfo.viewport.width < 480 ? '14px' : '15px';
        } else if (this.deviceInfo.isTablet) {
            html.style.fontSize = '15px';
        } else {
            html.style.fontSize = '16px';
        }
    }

    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Resize da janela
        window.addEventListener('resize', this.handleResize.bind(this));

        // Mudança de orientação
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

        // Visibilidade da página
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        console.log('👂 Event listeners configurados');
    }

    /**
     * Tratar redimensionamento
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const oldDevice = { ...this.deviceInfo };

            this.detectDevice();

            // Se mudou tipo de dispositivo, reconfigurar
            if (oldDevice.isMobile !== this.deviceInfo.isMobile ||
                oldDevice.isTablet !== this.deviceInfo.isTablet) {
                this.setDeviceClasses();
                this.adjustForDeviceChange();
            }

            this.adjustGridColumns();

            console.log('📏 Resize detectado:', this.deviceInfo.viewport);
        }, 250);
    }

    /**
     * Tratar mudança de orientação
     */
    handleOrientationChange() {
        clearTimeout(this.orientationTimeout);
        this.orientationTimeout = setTimeout(() => {
            const oldOrientation = this.deviceInfo.orientation;
            const newOrientation = this.getOrientation();

            if (oldOrientation !== newOrientation) {
                this.deviceInfo.orientation = newOrientation;
                document.body.classList.remove(`orientation-${oldOrientation}`);
                document.body.classList.add(`orientation-${newOrientation}`);

                this.adjustForOrientation(newOrientation);

                console.log('🔄 Orientação mudou para:', newOrientation);
            }
        }, 100);
    }

    /**
     * Tratar orientação
     */
    handleOrientation() {
        document.body.classList.add(`orientation-${this.deviceInfo.orientation}`);
        this.adjustForOrientation(this.deviceInfo.orientation);
    }

    /**
     * Ajustar para mudança de dispositivo
     */
    adjustForDeviceChange() {
        if (this.deviceInfo.isMobile) {
            this.optimizeForMobile();
        } else {
            this.optimizeForDesktop();
        }
    }

    /**
     * Ajustar colunas do grid
     */
    adjustGridColumns() {
        const statsGrid = document.querySelector('.stats-dashboard');
        if (!statsGrid) return;

        const isLandscape = this.deviceInfo.orientation === 'landscape';
        const width = this.deviceInfo.viewport.width;

        if (width <= 480 && !isLandscape) {
            statsGrid.style.gridTemplateColumns = '1fr';
        } else if (width <= 768 && isLandscape) {
            statsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (width <= 768) {
            statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            statsGrid.style.removeProperty('grid-template-columns');
        }
    }

    /**
     * Ajustar para orientação
     */
    adjustForOrientation(orientation) {
        if (!this.deviceInfo.isMobile) return;

        this.adjustGridColumns();

        // Ajustar elementos específicos
        const elements = {
            header: document.querySelector('.nb-header'),
            terminal: document.querySelector('.live-terminal'),
            floating: document.querySelector('.fab-container')
        };

        if (orientation === 'landscape') {
            if (elements.header) {
                elements.header.style.padding = '10px 20px';
            }
            if (elements.terminal) {
                elements.terminal.style.maxHeight = '120px';
            }
        } else {
            if (elements.header) {
                elements.header.style.removeProperty('padding');
            }
            if (elements.terminal) {
                elements.terminal.style.removeProperty('max-height');
            }
        }
    }

    /**
     * Configurar feedback de toque
     */
    setupTouchFeedback() {
        if (!this.deviceInfo.isTouchDevice) return;

        const touchSelectors = [
            '.nb-btn-primary',
            '.nb-btn-secondary',
            '.nb-icon-btn',
            '.nb-action-btn',
            '.nb-tab',
            '.nb-card',
            '.nb-list-item'
        ];

        touchSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => this.addTouchFeedback(el));
        });

        console.log('👆 Touch feedback configurado');
    }

    /**
     * Adicionar feedback de toque a elemento
     */
    addTouchFeedback(element) {
        let touchStartTime = 0;

        const handleTouchStart = (e) => {
            touchStartTime = Date.now();
            element.style.transform = 'scale(0.95)';
            element.style.transition = 'transform 0.1s ease';
        };

        const handleTouchEnd = (e) => {
            const touchDuration = Date.now() - touchStartTime;

            setTimeout(() => {
                element.style.transform = '';
                element.style.transition = '';
            }, 150);

            // Prevenir taps acidentais muito rápidos
            if (touchDuration < 50) {
                e.preventDefault();
            }
        };

        const handleTouchCancel = () => {
            element.style.transform = '';
            element.style.transition = '';
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    }

    /**
     * Configurar detecção de teclado virtual
     */
    setupKeyboardDetection() {
        if (!this.deviceInfo.isMobile) return;

        const handleViewportChange = () => {
            clearTimeout(this.keyboardTimeout);
            this.keyboardTimeout = setTimeout(() => {
                const currentHeight = window.innerHeight;
                const heightDiff = this.initialViewportHeight - currentHeight;
                const isKeyboardOpen = heightDiff > 150;

                document.body.classList.toggle('keyboard-open', isKeyboardOpen);
                this.adjustForKeyboard(isKeyboardOpen);

                console.log(isKeyboardOpen ? '⌨️ Teclado aberto' : '⌨️ Teclado fechado');
            }, 100);
        };

        // Usar Visual Viewport API se disponível
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            window.addEventListener('resize', handleViewportChange);
        }

        // Prevenir zoom em inputs iOS
        this.preventInputZoom();
    }

    /**
     * Ajustar para teclado virtual
     */
    adjustForKeyboard(isOpen) {
        const elements = {
            terminal: document.querySelector('.live-terminal'),
            floating: document.querySelector('.floating-button')
        };

        Object.values(elements).forEach(el => {
            if (el) el.style.display = isOpen ? 'none' : '';
        });

        // Scroll para input ativo
        if (isOpen) {
            const activeInput = document.activeElement;
            if (activeInput && activeInput.matches('input, textarea')) {
                setTimeout(() => {
                    activeInput.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        }
    }

    /**
     * Prevenir zoom em inputs (iOS)
     */
    preventInputZoom() {
        if (!this.deviceInfo.isIOS) return;

        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.style.fontSize || parseInt(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }

    /**
     * Tratar mudança de visibilidade
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAnimations();
        } else {
            this.resumeAnimations();
        }
    }

    /**
     * Pausar animações quando página oculta
     */
    pauseAnimations() {
        const animatedElements = document.querySelectorAll([
            '.loading-spinner',
            '.terminal-cursor',
            '[data-animation]'
        ].join(', '));

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    /**
     * Retomar animações
     */
    resumeAnimations() {
        const animatedElements = document.querySelectorAll([
            '.loading-spinner',
            '.terminal-cursor',
            '[data-animation]'
        ].join(', '));

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    /**
     * Otimizar performance
     */
    optimizePerformance() {
        // Reduzir animações em mobile
        if (this.deviceInfo.isMobile) {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            document.documentElement.style.setProperty('--transition-duration', '0.15s');
        }

        // Otimizar scroll
        this.optimizeScrolling();

        console.log('⚡ Performance otimizada');
    }

    /**
     * Otimizar scrolling
     */
    optimizeScrolling() {
        const scrollContainers = document.querySelectorAll([
            '.terminal-output',
            '.market-ticker',
            '.tab-group',
            '.notification-container'
        ].join(', '));

        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.overscrollBehavior = 'contain';
        });
    }

    /**
     * Otimizar para mobile
     */
    optimizeForMobile() {
        // Reduzir elementos pesados
        document.documentElement.style.setProperty('--particle-count', '5');

        // Melhorar performance
        document.body.style.touchAction = 'manipulation';

        console.log('📱 Otimizado para mobile');
    }

    /**
     * Otimizar para desktop
     */
    optimizeForDesktop() {
        // Restaurar elementos completos
        document.documentElement.style.removeProperty('--particle-count');

        // Remover otimizações mobile
        document.body.style.removeProperty('touch-action');

        console.log('🖥️ Otimizado para desktop');
    }

    /**
     * Adicionar listeners dinâmicos para novos elementos
     */
    addDynamicListeners() {
        // Observer para novos elementos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && this.deviceInfo.isTouchDevice) {
                        // Adicionar touch feedback a novos elementos
                        const touchElements = node.querySelectorAll([
                            '.crypto-button',
                            '.crypto-tab',
                            '.user-card',
                            '.ticker-item'
                        ].join(', '));

                        touchElements.forEach(el => this.addTouchFeedback(el));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * API pública - Obter informações do dispositivo
     */
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    /**
     * API pública - Verificar se é mobile
     */
    isMobile() {
        return this.deviceInfo.isMobile;
    }

    /**
     * API pública - Verificar se é tablet
     */
    isTablet() {
        return this.deviceInfo.isTablet;
    }

    /**
     * API pública - Verificar se suporta toque
     */
    isTouchDevice() {
        return this.deviceInfo.isTouchDevice;
    }

    /**
     * API pública - Obter orientação atual
     */
    getOrientation() {
        return this.deviceInfo.orientation;
    }

    /**
     * API pública - Forçar redetecção
     */
    refresh() {
        console.log('🔄 Atualizando detecção...');
        this.detectDevice();
        this.setDeviceClasses();
        this.adjustGridColumns();
        this.handleOrientation();
    }

    /**
     * Limpar recursos
     */
    destroy() {
        clearTimeout(this.resizeTimeout);
        clearTimeout(this.orientationTimeout);
        clearTimeout(this.keyboardTimeout);

        console.log('🗑️ Mobile System finalizado');
    }
}

// Auto-inicializar quando DOM estiver pronto
function initMobileSystem() {
    if (typeof window !== 'undefined') {
        window.mobileSystem = new MobileSystem();

        // API global simplificada
        window.isMobile = () => window.mobileSystem.isMobile();
        window.isTablet = () => window.mobileSystem.isTablet();
        window.isTouchDevice = () => window.mobileSystem.isTouchDevice();
    }
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSystem);
} else {
    initMobileSystem();
}

// Reagir a mudanças de tamanho (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.mobileSystem) {
            window.mobileSystem.refresh();
        }
    }, 250);
});

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileSystem;
}
