/**
 * Main Application Logic with Google Ads Integration
 * 
 * Google Ads Implementation Features:
 * - Asynchronous ad loading to prevent blocking game performance
 * - Responsive ad containers for header, sidebar (desktop-only), and footer
 * - Error handling with fallback display states
 * - Ad refresh functionality for single-page application navigation
 * - Performance optimization with visibility checks
 * - Cross-device compatibility (mobile, tablet, desktop)
 * 
 * Ad Placement Strategy:
 * - Header: Banner ad visible on all devices
 * - Sidebar: Vertical ad visible only on tablet and desktop
 * - Footer: Banner ad visible on all devices
 * 
 * Performance Considerations:
 * - Ads load after DOM is ready to prevent render blocking
 * - Only visible ads are refreshed during navigation
 * - Graceful degradation when AdSense fails to load
 */
class App {
    constructor() {
        this.currentSection = 'ladder-game';
        this.menuVisible = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Initialize ads after DOM is fully loaded to prevent blocking
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeGoogleAds();
            });
        } else {
            this.initializeGoogleAds();
        }
        console.log('App initialized');
    }

    setupEventListeners() {
        // Menu toggle functionality with touch support
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const menuBackdrop = document.getElementById('menuBackdrop');
        
        if (menuToggle) {
            // Add both click and touch events for better mobile support
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
            
            // Prevent double-tap zoom on mobile
            menuToggle.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
        }

        // Close menu when clicking/touching backdrop
        if (menuBackdrop) {
            menuBackdrop.addEventListener('click', () => {
                this.toggleMenu();
            });
            
            menuBackdrop.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Menu item navigation with touch support
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href) {
                    this.navigateToPage(href.substring(1)); // Remove # from href
                }
            });
            
            // Add touch feedback
            item.addEventListener('touchstart', () => {
                item.style.transform = 'scale(0.98)';
            });
            
            item.addEventListener('touchend', () => {
                item.style.transform = '';
            });
            
            item.addEventListener('touchcancel', () => {
                item.style.transform = '';
            });
        });

        // Close menu when clicking outside on mobile (fallback)
        document.addEventListener('click', (e) => {
            if (this.menuVisible && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target) &&
                !menuBackdrop.contains(e.target)) {
                this.toggleMenu();
            }
        });

        // Handle ESC key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuVisible) {
                this.toggleMenu();
            }
        });

        // Handle window resize and orientation change
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        window.addEventListener('orientationchange', () => {
            // Delay to allow for orientation change to complete
            setTimeout(() => {
                this.handleResize();
                this.handleOrientationChange();
            }, 100);
        });

        // Add touch event listeners for better mobile interaction
        this.setupTouchInteractions();
        
        // Handle viewport changes for mobile browsers
        this.setupViewportHandling();
    }

    toggleMenu() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const menuBackdrop = document.getElementById('menuBackdrop');
        
        this.menuVisible = !this.menuVisible;
        
        if (sidebar) {
            sidebar.classList.toggle('active', this.menuVisible);
        }
        
        // Add animation to hamburger menu
        if (menuToggle) {
            menuToggle.classList.toggle('active', this.menuVisible);
        }
        
        // Toggle backdrop
        if (menuBackdrop) {
            menuBackdrop.classList.toggle('active', this.menuVisible);
        }
        
        // Prevent body scroll when menu is open on mobile
        if (window.innerWidth < 1024) {
            document.body.style.overflow = this.menuVisible ? 'hidden' : '';
        }
    }

    navigateToPage(page) {
        // Hide all sections
        const sections = document.querySelectorAll('.game-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${page}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update menu active state
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${page}`) {
                item.classList.add('active');
            }
        });

        this.currentSection = page;

        // Close menu on mobile after navigation
        if (window.innerWidth < 1024 && this.menuVisible) {
            this.toggleMenu();
        }

        // Refresh ads after navigation to ensure they display properly
        setTimeout(() => {
            this.refreshAds();
        }, 100);

        console.log(`Navigated to: ${page}`);
    }

    handleResize() {
        // Close mobile menu if window becomes desktop size
        if (window.innerWidth >= 1024 && this.menuVisible) {
            this.toggleMenu();
        }
        
        // Reset body overflow on desktop
        if (window.innerWidth >= 1024) {
            document.body.style.overflow = '';
        }
    }

    initializeGoogleAds() {
        // Check if AdSense is available
        if (typeof window.adsbygoogle === 'undefined') {
            console.log('AdSense not loaded yet, retrying...');
            setTimeout(() => this.initializeGoogleAds(), 1000);
            return;
        }

        try {
            // Initialize ads after a short delay to ensure DOM is ready
            setTimeout(() => {
                this.loadAds();
            }, 500);
            
            console.log('Google Ads initialized successfully');
        } catch (error) {
            console.error('Error initializing Google Ads:', error);
            this.handleAdError();
        }
    }

    loadAds() {
        const adContainers = document.querySelectorAll('.adsbygoogle');
        
        adContainers.forEach((ad, index) => {
            try {
                // Only push ads that haven't been initialized yet
                if (!ad.hasAttribute('data-adsbygoogle-status')) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    console.log(`Ad ${index + 1} loaded successfully`);
                }
            } catch (error) {
                console.error(`Error loading ad ${index + 1}:`, error);
            }
        });

        // Remove placeholder styling from ad containers
        this.removeAdPlaceholders();
    }

    removeAdPlaceholders() {
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach(container => {
            // Remove the placeholder "광고 영역" text
            container.style.setProperty('--placeholder-display', 'none');
        });
    }

    handleAdError() {
        console.log('Ad loading failed, using fallback display');
        // Keep placeholder styling for development/testing
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach(container => {
            container.classList.add('ad-error');
        });
    }

    // Method to refresh ads (useful for SPA navigation)
    refreshAds() {
        if (typeof window.adsbygoogle !== 'undefined') {
            try {
                const adContainers = document.querySelectorAll('.adsbygoogle');
                adContainers.forEach(ad => {
                    // Only refresh visible ads to improve performance
                    if (this.isElementVisible(ad)) {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    }
                });
                console.log('Ads refreshed');
            } catch (error) {
                console.error('Error refreshing ads:', error);
            }
        }
    }

    // Helper method to check if element is visible
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

    // Setup touch interactions for better mobile experience
    setupTouchInteractions() {
        // Add touch feedback to all interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .slot, .nav-btn, .menu-item');
        
        interactiveElements.forEach(element => {
            // Add touch start feedback
            element.addEventListener('touchstart', (e) => {
                if (!element.classList.contains('disabled')) {
                    element.style.transform = 'scale(0.98)';
                    element.style.opacity = '0.8';
                }
            }, { passive: true });
            
            // Remove touch feedback
            const removeTouchFeedback = () => {
                element.style.transform = '';
                element.style.opacity = '';
            };
            
            element.addEventListener('touchend', removeTouchFeedback, { passive: true });
            element.addEventListener('touchcancel', removeTouchFeedback, { passive: true });
        });

        // Prevent default touch behaviors that might interfere with the app
        document.addEventListener('touchstart', (e) => {
            // Prevent pull-to-refresh on mobile browsers
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle swipe gestures for menu
        this.setupSwipeGestures();
    }

    // Setup swipe gestures for mobile menu
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Check if it's a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                isSwipeGesture = true;
                
                // Swipe right to open menu (from left edge)
                if (diffX < 0 && startX < 50 && !this.menuVisible) {
                    this.toggleMenu();
                }
                // Swipe left to close menu
                else if (diffX > 0 && this.menuVisible) {
                    this.toggleMenu();
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
            isSwipeGesture = false;
        }, { passive: true });
    }

    // Handle viewport changes for mobile browsers
    setupViewportHandling() {
        // Handle iOS Safari viewport changes
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });

        // Handle keyboard appearance on mobile
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                const viewport = window.visualViewport;
                document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
            });
        }
    }

    // Handle orientation changes
    handleOrientationChange() {
        // Close menu on orientation change to prevent layout issues
        if (this.menuVisible) {
            this.toggleMenu();
        }

        // Refresh layout after orientation change
        setTimeout(() => {
            // Trigger a resize event to update any canvas elements
            window.dispatchEvent(new Event('resize'));
            
            // Refresh ads to ensure proper sizing
            this.refreshAds();
        }, 200);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});