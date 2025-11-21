/**
 * Advanced Mobile System v2
 * Otimizações críticas de performance e UX
 */

class AdvancedMobileSystem {
    constructor() {
        // Device detection
        this.device = {
            mobile: false,
            tablet: false,
            touch: false,
            ios: false,
            android: false,
            standalone: window.matchMedia('(display-mode: standalone)').matches
        };

        // Screen state
        this.screen = {
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: 'portrait',
            dpr: window.devicePixelRatio || 1
        };

        // Performance
        this.perf = {
            connection: this.detectConnection(),
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            prefersData: false,
            fps: 60
        };

        // State
        this.state = {
            scrolled: false,
            keyboardOpen: false,
            pulling: false,
            lastScrollY: 0,
            scrollDirection: 'down'
        };

        // Timers
        this.timers = {
            resize: null,
            scroll: null,
            orientation: null,
            fps: null
        };

        // Cache
        this.cache = {
            elements: new Map(),
            intersectionObserver: null,
            resizeObserver: null
        };

        this.init();
    }

    async init() {
        console.log('🚀 Advanced Mobile System v2 iniciando...');

        // Detecções
        await this.detectAll();

        // Setup
        this.setupObservers();
        this.setupScrollHandling();
        this.setupKeyboardHandling();
        this.setupTouchHandling();
        this.setupPullToRefresh();

        // Otimizações
        this.applyPerformanceOptimizations();
        this.optimizeImages();
        this.lazyLoadComponents();

        // Listeners
        this.attachEventListeners();

        console.log('✅ Mobile System ativo:', {
            device: this.device,
            screen: this.screen,
            perf: this.perf
        });
    }

    /**
     * DETECÇÃO AVANÇADA
     */
    async detectAll() {
        const ua = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;

        // Device type
        this.device.mobile = width <= 768;
        this.device.tablet = width > 768 && width <= 1024;
        this.device.touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this.device.ios = /iphone|ipad|ipod/.test(ua);
        this.device.android = /android/.test(ua);

        // Screen
        this.screen.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

        // Apply classes
        this.updateBodyClasses();

        // Network info
        if ('connection' in navigator) {
            const conn = navigator.connection;
            this.perf.prefersData = conn.saveData || false;

            conn.addEventListener('change', () => {
                this.perf.connection = this.detectConnection();
                this.adjustForConnection();
            });
        }
    }

    detectConnection() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (!conn) return 'unknown';

        const type = conn.effectiveType;
        const downlink = conn.downlink;

        if (type === 'slow-2g' || type === '2g' || downlink < 0.5) {
            return 'slow';
        } else if (type === '3g' || downlink < 1.5) {
            return 'medium';
        }

        return 'fast';
    }

    updateBodyClasses() {
        const classes = {
            'is-mobile': this.device.mobile,
            'is-tablet': this.device.tablet,
            'is-touch': this.device.touch,
            'is-ios': this.device.ios,
            'is-android': this.device.android,
            'is-standalone': this.device.standalone,
            [`orientation-${this.screen.orientation}`]: true,
            [`connection-${this.perf.connection}`]: true
        };

        Object.entries(classes).forEach(([cls, active]) => {
            document.body.classList.toggle(cls, active);
        });
    }

    /**
     * OBSERVERS
     */
    setupObservers() {
        // Intersection Observer para lazy loading
        this.cache.intersectionObserver = new IntersectionObserver(
            (entries) => this.handleIntersection(entries), {
                root: null,
                rootMargin: '50px',
                threshold: 0.01
            }
        );

        // Resize Observer para elementos específicos
        if ('ResizeObserver' in window) {
            this.cache.resizeObserver = new ResizeObserver(
                (entries) => this.handleResize(entries)
            );
        }

        // Observe lazy elements
        this.observeLazyElements();
    }

    observeLazyElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(el => {
            this.cache.intersectionObserver.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Load image
                if (el.dataset.src) {
                    el.src = el.dataset.src;
                    delete el.dataset.src;
                }

                // Load component
                if (el.dataset.component) {
                    this.loadComponent(el, el.dataset.component);
                }

                // Stop observing
                this.cache.intersectionObserver.unobserve(el);
            }
        });
    }

    /**
     * SCROLL HANDLING AVANÇADO
     */
    setupScrollHandling() {
        let ticking = false;
        let lastKnownScrollPosition = 0;

        const handleScroll = () => {
            lastKnownScrollPosition = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateScrollState(lastKnownScrollPosition);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollState(scrollY) {
        // Direction
        const direction = scrollY > this.state.lastScrollY ? 'down' : 'up';
        this.state.scrollDirection = direction;
        this.state.lastScrollY = scrollY;

        // Scrolled state
        const scrolled = scrollY > 50;
        if (scrolled !== this.state.scrolled) {
            this.state.scrolled = scrolled;
            document.body.classList.toggle('scrolled', scrolled);
        }

        // Hide/show header based on scroll direction
        if (this.device.mobile) {
            if (direction === 'down' && scrollY > 100) {
                this.hideHeader();
            } else if (direction === 'up') {
                this.showHeader();
            }
        }
    }

    hideHeader() {
        const header = document.querySelector('.crypto-header');
        if (header && !header.classList.contains('hidden')) {
            header.style.transform = 'translateY(-100%)';
            header.classList.add('hidden');
        }
    }

    showHeader() {
        const header = document.querySelector('.crypto-header');
        if (header && header.classList.contains('hidden')) {
            header.style.transform = 'translateY(0)';
            header.classList.remove('hidden');
        }
    }

    /**
     * KEYBOARD HANDLING
     */
    setupKeyboardHandling() {
        if (!this.device.mobile) return;

        const initialHeight = window.innerHeight;

        // Visual Viewport API (melhor método)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const currentHeight = window.visualViewport.height;
                const diff = initialHeight - currentHeight;

                this.state.keyboardOpen = diff > 150;
                this.handleKeyboardState();
            });
        } else {
            // Fallback
            window.addEventListener('resize', () => {
                const currentHeight = window.innerHeight;
                const diff = initialHeight - currentHeight;

                this.state.keyboardOpen = diff > 150;
                this.handleKeyboardState();
            });
        }

        // Focus handling
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.handleInputFocus(e.target);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.handleInputBlur(e.target);
            }
        });
    }

    handleKeyboardState() {
        document.body.classList.toggle('keyboard-open', this.state.keyboardOpen);

        if (this.state.keyboardOpen) {
            // Ocultar elementos que interferem
            this.hideFloatingElements();
        } else {
            // Restaurar elementos
            this.showFloatingElements();
        }
    }

    handleInputFocus(input) {
        // Scroll suave para o input
        setTimeout(() => {
            const rect = input.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

            if (!isInView) {
                input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 300);

        // Adicionar padding bottom temporário
        const container = input.closest('.crypto-panel');
        if (container) {
            container.style.paddingBottom = '50vh';
        }
    }

    handleInputBlur(input) {
        // Remover padding extra
        const container = input.closest('.crypto-panel');
        if (container) {
            container.style.paddingBottom = '';
        }
    }

    hideFloatingElements() {
        const selectors = [
            '.floating-button',
            '.fab-container',
            '.live-terminal',
            '.network-indicator'
        ];

        selectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.style.transform = 'translateY(200px)';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
        });
    }

    showFloatingElements() {
        const selectors = [
            '.floating-button',
            '.fab-container',
            '.live-terminal',
            '.network-indicator'
        ];

        selectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.style.transform = '';
                el.style.opacity = '';
                el.style.pointerEvents = '';
            }
        });
    }

    /**
     * TOUCH HANDLING AVANÇADO
     */
    setupTouchHandling() {
        if (!this.device.touch) return;

        // Haptic feedback simulation
        const addRipple = (element, x, y) => {
            const ripple = document.createElement('span');
            ripple.className = 'touch-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            element.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        };

        // Touch feedback para botões
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.crypto-button, .crypto-tab, .user-card, .stat-card');

            if (target) {
                const rect = target.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;

                // Vibração leve
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }

                // Ripple effect
                if (!this.perf.reducedMotion) {
                    addRipple(target, x, y);
                }
            }
        }, { passive: true });

        // Prevenir long-press menu em elementos interativos
        const preventContext = (e) => {
            if (e.target.closest('.crypto-button, .crypto-tab')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', preventContext);
    }

    /**
     * PULL TO REFRESH
     */
    setupPullToRefresh() {
        if (!this.device.mobile) return;

        let startY = 0;
        let currentY = 0;
        let pulling = false;

        const indicator = this.createPullIndicator();

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;

            currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 0 && diff < 150) {
                this.state.pulling = true;
                document.body.classList.add('pulling');
                indicator.style.transform = `translateX(-50%) translateY(${Math.min(diff, 80)}px)`;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (pulling && this.state.pulling) {
                const diff = currentY - startY;

                if (diff > 80) {
                    this.handleRefresh();
                }
            }

            pulling = false;
            this.state.pulling = false;
            document.body.classList.remove('pulling');
            indicator.style.transform = '';
        }, { passive: true });
    }

    createPullIndicator() {
        const existing = document.querySelector('.pull-to-refresh');
        if (existing) return existing;

        const indicator = document.createElement('div');
        indicator.className = 'pull-to-refresh';
        indicator.innerHTML = '<i class="fas fa-arrow-down"></i> Puxe para atualizar';
        document.body.appendChild(indicator);

        return indicator;
    }

    async handleRefresh() {
        console.log('🔄 Refresh triggered');

        const indicator = document.querySelector('.pull-to-refresh');
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
        }

        // Vibração
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Simular refresh (implementar sua lógica aqui)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Recarregar dados
        if (typeof window.refreshData === 'function') {
            await window.refreshData();
        }

        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-check"></i> Atualizado!';
            setTimeout(() => {
                indicator.innerHTML = '<i class="fas fa-arrow-down"></i> Puxe para atualizar';
            }, 1000);
        }
    }

    /**
     * PERFORMANCE OPTIMIZATIONS
     */
    applyPerformanceOptimizations() {
        if (!this.device.mobile) return;

        // Remover Matrix Background
        const matrix = document.getElementById('matrix-bg');
        if (matrix) {
            matrix.remove();
        }

        // Simplificar animações
        if (this.perf.reducedMotion || this.perf.connection === 'slow') {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.style.setProperty('--transition-duration', '0.1s');
        }

        // Ajustar qualidade baseado na conexão
        if (this.perf.connection === 'slow') {
            this.reducedQualityMode();
        }

        // Limitar FPS em dispositivos antigos
        if (this.screen.dpr < 2) {
            this.limitFPS();
        }

        // Desabilitar hover states em touch
        if (this.device.touch) {
            document.body.classList.add('no-hover');
        }
    }

    reducedQualityMode() {
        console.log('📶 Modo economia ativado');

        // Reduzir sombras
        document.documentElement.style.setProperty('--box-shadow-quality', 'low');

        // Simplificar gradientes
        const panels = document.querySelectorAll('.crypto-panel, .stat-card');
        panels.forEach(panel => {
            panel.style.background = '#1a1a1a';
        });
    }

    limitFPS() {
        let lastFrame = 0;
        const targetFPS = 30;
        const frameTime = 1000 / targetFPS;

        const throttleAnimations = (callback) => {
            const now = performance.now();
            const elapsed = now - lastFrame;

            if (elapsed >= frameTime) {
                lastFrame = now;
                callback();
            }
        };

        // Aplicar throttle em animações
        this.timers.fps = setInterval(() => {
            throttleAnimations(() => {
                // Suas animações aqui
            });
        }, frameTime);
    }

    /**
     * IMAGE OPTIMIZATION
     */
    optimizeImages() {
        const images = document.querySelectorAll('img:not([loading])');

        images.forEach(img => {
            // Lazy loading
            img.loading = 'lazy';

            // Decode async
            img.decoding = 'async';

            // Baixar qualidade em conexão lenta
            if (this.perf.connection === 'slow' && img.dataset.lowres) {
                img.src = img.dataset.lowres;
            }
        });
    }

    /**
     * LAZY LOAD COMPONENTS
     */
    lazyLoadComponents() {
        const components = document.querySelectorAll('[data-component]');

        components.forEach(el => {
            this.cache.intersectionObserver.observe(el);
        });
    }

    async loadComponent(container, componentName) {
        console.log(`📦 Carregando componente: ${componentName}`);

        // Skeleton
        container.innerHTML = '<div class="skeleton" style="height: 100px;"></div>';

        // Simular carregamento (implementar sua lógica)
        await new Promise(resolve => setTimeout(resolve, 300));

        // Carregar conteúdo real
        if (typeof window[`load${componentName}`] === 'function') {
            await window[`load${componentName}`](container);
        }
    }

    /**
     * EVENT LISTENERS
     */
    attachEventListeners() {
        // Resize
        window.addEventListener('resize', () => {
            clearTimeout(this.timers.resize);
            this.timers.resize = setTimeout(() => this.handleWindowResize(), 200);
        });

        // Orientation
        window.addEventListener('orientationchange', () => {
            clearTimeout(this.timers.orientation);
            this.timers.orientation = setTimeout(() => this.handleOrientationChange(), 100);
        });

        // Visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseExpensiveOperations();
            } else {
                this.resumeExpensiveOperations();
            }
        });

        // Online/Offline
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleWindowResize() {
        const oldMobile = this.device.mobile;

        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.device.mobile = this.screen.width <= 768;

        if (oldMobile !== this.device.mobile) {
            console.log('📱 Mudança de dispositivo detectada');
            this.updateBodyClasses();
            this.applyPerformanceOptimizations();
        }
    }

    handleOrientationChange() {
        const oldOrientation = this.screen.orientation;
        this.screen.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

        if (oldOrientation !== this.screen.orientation) {
            console.log(`📱 Orientação: ${this.screen.orientation}`);
            this.updateBodyClasses();

            // Ajustar layout
            this.adjustForOrientation();
        }
    }

    adjustForOrientation() {
        const stats = document.querySelector('.stats-dashboard');
        if (!stats) return;

        if (this.screen.orientation === 'landscape' && this.screen.height < 500) {
            stats.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (this.screen.width < 480) {
            stats.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    }

    handleOnline() {
        console.log('🌐 Online');
        this.showNotification('Conexão restaurada', 'success');
    }

    handleOffline() {
        console.log('📡 Offline');
        this.showNotification('Sem conexão com a internet', 'error');
    }

    pauseExpensiveOperations() {
        console.log('⏸️ Pausando operações');

        if (window.priceUpdateInterval) {
            clearInterval(window.priceUpdateInterval);
        }
    }

    resumeExpensiveOperations() {
        console.log('▶️ Resumindo operações');

        if (typeof window.updateCryptoPrices === 'function') {
            window.priceUpdateInterval = setInterval(window.updateCryptoPrices, 30000);
        }
    }

    /**
     * UTILITIES
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        const container = document.querySelector('.notification-container') || this.createNotificationContainer();
        container.appendChild(notification);

        // Auto remove
        setTimeout(() => notification.remove(), 3000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * PUBLIC API
     */
    isMobile() {
        return this.device.mobile;
    }

    isTablet() {
        return this.device.tablet;
    }

    getOrientation() {
        return this.screen.orientation;
    }

    getConnection() {
        return this.perf.connection;
    }

    refresh() {
        this.detectAll();
        this.applyPerformanceOptimizations();
    }

    destroy() {
        // Clean timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });

        // Disconnect observers
        if (this.cache.intersectionObserver) {
            this.cache.intersectionObserver.disconnect();
        }

        if (this.cache.resizeObserver) {
            this.cache.resizeObserver.disconnect();
        }

        console.log('🗑️ Mobile System destroyed');
    }
}

// Auto-initialize
(function() {
    if (typeof window !== 'undefined') {
        const init = () => {
            window.advancedMobile = new AdvancedMobileSystem();

            // Global helpers
            window.isMobile = () => window.advancedMobile ? .isMobile() || false;
            window.isTablet = () => window.advancedMobile ? .isTablet() || false;
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMobileSystem;
}
