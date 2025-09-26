/**
 * Mobile Detection and Responsivity Handler
 * Automatically detects mobile devices and activates responsive features
 * Compatible with Maker Coins System
 */

class MobileResponsivityHandler {
    constructor() {
        this.deviceInfo = {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            isTouchDevice: false,
            isIOS: false,
            isAndroid: false,
            orientation: 'portrait',
            viewport: { width: 0, height: 0 },
            pixelRatio: window.devicePixelRatio || 1
        };
        
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        this.touchHandlers = new Map();
        this.resizeTimeout = null;
        this.keyboardTimeout = null;
        this.initialViewportHeight = window.innerHeight;
        
        this.init();
    }

    /**
     * Initialize the mobile handler
     */
    init() {
        this.detectDevice();
        this.setDeviceClasses();
        this.setupEventListeners();
        this.loadResponsiveCSS();
        this.optimizeForDevice();
        
        // Dispatch ready event
        this.dispatchEvent('mobile-handler-ready', this.deviceInfo);
        
        console.log('🔱 Mobile Responsivity Handler initialized:', this.deviceInfo);
    }

    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const viewport = this.getViewportSize();
        
        // Device type detection
        this.deviceInfo.isMobile = this.detectMobile(userAgent, viewport);
        this.deviceInfo.isTablet = this.detectTablet(userAgent, viewport);
        this.deviceInfo.isDesktop = !this.deviceInfo.isMobile && !this.deviceInfo.isTablet;
        
        // Touch capability
        this.deviceInfo.isTouchDevice = this.detectTouchDevice();
        
        // OS detection
        this.deviceInfo.isIOS = /iphone|ipad|ipod/i.test(userAgent);
        this.deviceInfo.isAndroid = /android/i.test(userAgent);
        
        // Orientation and viewport
        this.deviceInfo.orientation = this.getOrientation();
        this.deviceInfo.viewport = viewport;
    }

    detectMobile(userAgent, viewport) {
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        return mobileRegex.test(userAgent) || viewport.width <= this.breakpoints.mobile;
    }

    detectTablet(userAgent, viewport) {
        const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
        return tabletRegex.test(userAgent) && 
               viewport.width > this.breakpoints.mobile && 
               viewport.width <= this.breakpoints.tablet;
    }

    detectTouchDevice() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            visualWidth: window.visualViewport?.width || window.innerWidth,
            visualHeight: window.visualViewport?.height || window.innerHeight
        };
    }

    /**
     * Set CSS classes based on device detection
     */
    setDeviceClasses() {
        const body = document.body;
        const html = document.documentElement;
        
        // Remove existing classes
        body.className = body.className.replace(/\b(is-mobile|is-tablet|is-desktop|is-touch|is-ios|is-android|orientation-\w+)\b/g, '');
        
        // Add device classes
        if (this.deviceInfo.isMobile) body.classList.add('is-mobile');
        if (this.deviceInfo.isTablet) body.classList.add('is-tablet');
        if (this.deviceInfo.isDesktop) body.classList.add('is-desktop');
        if (this.deviceInfo.isTouchDevice) body.classList.add('is-touch');
        if (this.deviceInfo.isIOS) body.classList.add('is-ios');
        if (this.deviceInfo.isAndroid) body.classList.add('is-android');
        
        body.classList.add(`orientation-${this.deviceInfo.orientation}`);
        
        // Set CSS custom properties
        html.style.setProperty('--viewport-width', this.deviceInfo.viewport.width + 'px');
        html.style.setProperty('--viewport-height', this.deviceInfo.viewport.height + 'px');
        html.style.setProperty('--pixel-ratio', this.deviceInfo.pixelRatio);
        
        // Set data attributes
        body.dataset.device = this.deviceInfo.isMobile ? 'mobile' : this.deviceInfo.isTablet ? 'tablet' : 'desktop';
        body.dataset.orientation = this.deviceInfo.orientation;
        body.dataset.touch = this.deviceInfo.isTouchDevice;
    }

    /**
     * Load responsive CSS dynamically if needed
     */
    loadResponsiveCSS() {
        if (!this.deviceInfo.isMobile && !this.deviceInfo.isTablet) return;
        
        // Check if mobile CSS is already loaded
        const existingCSS = document.querySelector('link[data-mobile-css]');
        if (existingCSS) return;
        
        // Create and load mobile CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/mobile-responsive.css';
        link.dataset.mobileCss = 'true';
        link.onload = () => console.log('📱 Mobile CSS loaded');
        link.onerror = () => console.warn('⚠️ Mobile CSS failed to load');
        
        document.head.appendChild(link);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Resize and orientation change
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // Touch events
        if (this.deviceInfo.isTouchDevice) {
            this.setupTouchHandlers();
        }
        
        // Keyboard detection for mobile
        if (this.deviceInfo.isMobile) {
            this.setupKeyboardDetection();
        }
        
        // Visual viewport for modern browsers
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', this.handleVisualViewportResize.bind(this));
        }
        
        // Page visibility for mobile optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    /**
     * Handle window resize
     */
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const oldViewport = this.deviceInfo.viewport;
            const newViewport = this.getViewportSize();
            const oldOrientation = this.deviceInfo.orientation;
            const newOrientation = this.getOrientation();
            
            // Update device info
            this.deviceInfo.viewport = newViewport;
            this.deviceInfo.orientation = newOrientation;
            
            // Re-detect device type based on new size
            const wasMobile = this.deviceInfo.isMobile;
            this.detectDevice();
            
            // Update classes if device type changed
            if (wasMobile !== this.deviceInfo.isMobile) {
                this.setDeviceClasses();
                this.loadResponsiveCSS();
            }
            
            // Update CSS custom properties
            document.documentElement.style.setProperty('--viewport-width', newViewport.width + 'px');
            document.documentElement.style.setProperty('--viewport-height', newViewport.height + 'px');
            
            // Handle orientation change
            if (oldOrientation !== newOrientation) {
                this.handleOrientationSpecificChanges(newOrientation);
            }
            
            // Dispatch events
            this.dispatchEvent('viewport-change', {
                old: oldViewport,
                new: newViewport,
                orientation: newOrientation
            });
            
        }, 250);
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        setTimeout(() => {
            const newOrientation = this.getOrientation();
            
            if (this.deviceInfo.orientation !== newOrientation) {
                document.body.classList.remove(`orientation-${this.deviceInfo.orientation}`);
                document.body.classList.add(`orientation-${newOrientation}`);
                
                this.deviceInfo.orientation = newOrientation;
                this.handleOrientationSpecificChanges(newOrientation);
                
                this.dispatchEvent('orientation-change', {
                    orientation: newOrientation,
                    viewport: this.getViewportSize()
                });
            }
        }, 100);
    }

    /**
     * Handle orientation-specific changes
     */
    handleOrientationSpecificChanges(orientation) {
        if (!this.deviceInfo.isMobile) return;
        
        const elements = {
            statsPanel: document.querySelector('.stats-panel'),
            sortControls: document.querySelector('.sort-controls'),
            terminal: document.querySelector('.live-terminal'),
            fabMenu: document.querySelector('.fab-container')
        };
        
        if (orientation === 'landscape') {
            // Landscape optimizations
            if (elements.statsPanel) {
                elements.statsPanel.style.setProperty('flex-direction', 'row', 'important');
            }
            
            if (elements.terminal) {
                elements.terminal.style.maxHeight = '200px';
            }
        } else {
            // Portrait optimizations
            if (elements.statsPanel) {
                elements.statsPanel.style.removeProperty('flex-direction');
            }
            
            if (elements.terminal) {
                elements.terminal.style.removeProperty('max-height');
            }
        }
    }

    /**
     * Setup touch event handlers
     */
    setupTouchHandlers() {
        // Add touch feedback to interactive elements
        const touchElements = document.querySelectorAll(`
            .crypto-button, .nav-button, .class-tab, .sort-btn,
            .user-card, .autocomplete-item, .terminal-tab,
            .fab-main, .fab-item, .crypto-tab
        `);
        
        touchElements.forEach(element => {
            this.addTouchFeedback(element);
        });
        
        // Optimize scrolling
        this.optimizeScrolling();
        
        // Add swipe gestures where appropriate
        this.addSwipeGestures();
    }

    /**
     * Add touch feedback to elements
     */
    addTouchFeedback(element) {
        if (this.touchHandlers.has(element)) return;
        
        let touchStartTime, touchStartPos;
        
        const touchStart = (e) => {
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            
            element.classList.add('touch-active');
            this.createRippleEffect(element, touch.clientX, touch.clientY);
        };
        
        const touchEnd = (e) => {
            const duration = Date.now() - touchStartTime;
            
            setTimeout(() => element.classList.remove('touch-active'), 150);
            
            // Prevent accidental taps
            if (duration < 50) {
                e.preventDefault();
            }
        };
        
        const touchMove = (e) => {
            const touch = e.touches[0];
            const distance = Math.sqrt(
                Math.pow(touch.clientX - touchStartPos.x, 2) + 
                Math.pow(touch.clientY - touchStartPos.y, 2)
            );
            
            if (distance > 20) {
                element.classList.remove('touch-active');
            }
        };
        
        element.addEventListener('touchstart', touchStart, { passive: true });
        element.addEventListener('touchend', touchEnd, { passive: false });
        element.addEventListener('touchmove', touchMove, { passive: true });
        
        this.touchHandlers.set(element, { touchStart, touchEnd, touchMove });
    }

    /**
     * Create ripple effect for touch feedback
     */
    createRippleEffect(element, x, y) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.className = 'touch-ripple';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x - rect.left - size / 2}px;
            top: ${y - rect.top - size / 2}px;
            background: rgba(0, 255, 136, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-expand 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';
        
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Setup virtual keyboard detection
     */
    setupKeyboardDetection() {
        const handleKeyboard = () => {
            clearTimeout(this.keyboardTimeout);
            this.keyboardTimeout = setTimeout(() => {
                const currentHeight = window.visualViewport?.height || window.innerHeight;
                const heightDiff = this.initialViewportHeight - currentHeight;
                const isKeyboardOpen = heightDiff > 150;
                
                document.body.classList.toggle('keyboard-open', isKeyboardOpen);
                this.adjustForKeyboard(isKeyboardOpen);
                
                this.dispatchEvent('keyboard-toggle', { 
                    isOpen: isKeyboardOpen, 
                    heightDiff 
                });
            }, 100);
        };
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleKeyboard);
        } else {
            window.addEventListener('resize', handleKeyboard);
        }
        
        // Prevent zoom on input focus (iOS)
        this.preventInputZoom();
    }

    /**
     * Adjust layout when virtual keyboard opens/closes
     */
    adjustForKeyboard(isOpen) {
        const elements = {
            terminal: document.querySelector('.live-terminal'),
            fab: document.querySelector('.fab-container'),
            floatingBtn: document.querySelector('.floating-button')
        };
        
        Object.values(elements).forEach(el => {
            if (el) el.style.display = isOpen ? 'none' : '';
        });
        
        if (isOpen) {
            const activeElement = document.activeElement;
            if (activeElement?.matches('input, textarea')) {
                setTimeout(() => {
                    activeElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            }
        }
    }

    /**
     * Prevent zoom on input focus for iOS
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
     * Optimize scrolling for mobile
     */
    optimizeScrolling() {
        const scrollContainers = document.querySelectorAll(`
            .terminal-output, .autocomplete-list, .user-list,
            .history-container, .notification-container
        `);
        
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.overscrollBehavior = 'contain';
        });
    }

    /**
     * Add swipe gestures for tab navigation
     */
    addSwipeGestures() {
        const tabContainers = document.querySelectorAll('.crypto-tabs, .class-tabs');
        
        tabContainers.forEach(container => {
            let startX, startY, endX, endY;
            
            container.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
            }, { passive: true });
            
            container.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                endX = touch.clientX;
                endY = touch.clientY;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                
                // Only process horizontal swipes
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    const tabs = container.querySelectorAll('.crypto-tab, .class-tab');
                    const activeTab = container.querySelector('.active');
                    const activeIndex = Array.from(tabs).indexOf(activeTab);
                    
                    if (deltaX > 0 && activeIndex > 0) {
                        // Swipe right - previous tab
                        tabs[activeIndex - 1].click();
                    } else if (deltaX < 0 && activeIndex < tabs.length - 1) {
                        // Swipe left - next tab
                        tabs[activeIndex + 1].click();
                    }
                }
            }, { passive: true });
        });
    }

    /**
     * Handle visual viewport resize (modern browsers)
     */
    handleVisualViewportResize() {
        const visualViewport = this.getViewportSize();
        
        document.documentElement.style.setProperty('--visual-viewport-width', visualViewport.visualWidth + 'px');
        document.documentElement.style.setProperty('--visual-viewport-height', visualViewport.visualHeight + 'px');
        
        this.dispatchEvent('visual-viewport-change', visualViewport);
    }

    /**
     * Handle page visibility change for mobile optimization
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - reduce activity
            this.pauseAnimations();
        } else {
            // Page is visible - resume activity
            this.resumeAnimations();
        }
    }

    /**
     * Pause animations and heavy operations when page is hidden
     */
    pauseAnimations() {
        const animatedElements = document.querySelectorAll(`
            #matrix-bg, .floating-icons, .particle,
            .terminal-cursor, .loading-spinner
        `);
        
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    /**
     * Resume animations when page becomes visible
     */
    resumeAnimations() {
        const animatedElements = document.querySelectorAll(`
            #matrix-bg, .floating-icons, .particle,
            .terminal-cursor, .loading-spinner
        `);
        
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    /**
     * Device-specific optimizations
     */
    optimizeForDevice() {
        if (this.deviceInfo.isMobile) {
            this.optimizeForMobile();
        }
        
        if (this.deviceInfo.isIOS) {
            this.optimizeForIOS();
        }
        
        if (this.deviceInfo.isAndroid) {
            this.optimizeForAndroid();
        }
    }

    optimizeForMobile() {
        // Reduce particle count for mobile
        document.documentElement.style.setProperty('--particle-count', '10');
        
        // Optimize animations
        document.documentElement.style.setProperty('--animation-speed', '0.5s');
        
        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-expand {
                to { transform: scale(4); opacity: 0; }
            }
            
            .touch-active {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForIOS() {
        // iOS-specific optimizations
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
        
        // Fix iOS viewport issues
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
    }

    optimizeForAndroid() {
        // Android-specific optimizations
        document.body.style.touchAction = 'manipulation';
        
        // Improve Android scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    /**
     * Utility methods
     */
    dispatchEvent(name, detail = null) {
        window.dispatchEvent(new CustomEvent(`mobile-${name}`, { 
            detail: detail || this.deviceInfo 
        }));
    }

    // Public API methods
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    isMobileDevice() {
        return this.deviceInfo.isMobile;
    }

    isTabletDevice() {
        return this.deviceInfo.isTablet;
    }

    isTouchSupported() {
        return this.deviceInfo.isTouchDevice;
    }

    getCurrentOrientation() {
        return this.deviceInfo.orientation;
    }

    getViewportInfo() {
        return { ...this.deviceInfo.viewport };
    }

    // Clean up method
    destroy() {
        clearTimeout(this.resizeTimeout);
        clearTimeout(this.keyboardTimeout);
        
        this.touchHandlers.forEach((handlers, element) => {
            element.removeEventListener('touchstart', handlers.touchStart);
            element.removeEventListener('touchend', handlers.touchEnd);
            element.removeEventListener('touchmove', handlers.touchMove);
        });
        
        this.touchHandlers.clear();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileHandler = new MobileResponsivityHandler();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    window.mobileHandler = new MobileResponsivityHandler();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileResponsivityHandler;
}
