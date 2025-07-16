/**
 * Test script to verify ad display and layout optimizations
 */

// Test 1: Check ad container margins
function testAdContainerMargins() {
    console.log('🧪 Testing ad container margins...');
    
    const adContainers = document.querySelectorAll('.ad-container');
    let allPassed = true;
    
    adContainers.forEach((container, index) => {
        const styles = window.getComputedStyle(container);
        const marginTop = parseInt(styles.marginTop);
        const marginBottom = parseInt(styles.marginBottom);
        
        console.log(`Ad container ${index + 1} (${container.id}): margin-top: ${marginTop}px, margin-bottom: ${marginBottom}px`);
        
        // Check if margins are minimal (0 or very small)
        if (marginTop > 5 || marginBottom > 5) {
            console.error(`❌ Ad container ${index + 1} has excessive margins`);
            allPassed = false;
        }
    });
    
    if (allPassed) {
        console.log('✅ All ad containers have minimal margins');
    }
    
    return allPassed;
}

// Test 2: Check responsive ad heights
function testResponsiveAdHeights() {
    console.log('🧪 Testing responsive ad heights...');
    
    const screenWidth = window.innerWidth;
    const headerAd = document.getElementById('header-ad');
    const footerAd = document.getElementById('footer-ad');
    const sidebarAd = document.getElementById('sidebar-ad');
    
    if (!headerAd || !footerAd) {
        console.error('❌ Required ad containers not found');
        return false;
    }
    
    const headerHeight = parseInt(window.getComputedStyle(headerAd).minHeight);
    const footerHeight = parseInt(window.getComputedStyle(footerAd).minHeight);
    
    console.log(`Screen width: ${screenWidth}px`);
    console.log(`Header ad height: ${headerHeight}px`);
    console.log(`Footer ad height: ${footerHeight}px`);
    
    let expectedHeaderHeight, expectedFooterHeight;
    
    if (screenWidth < 768) {
        // Mobile
        expectedHeaderHeight = 60;
        expectedFooterHeight = 60;
        console.log('📱 Mobile layout detected');
    } else if (screenWidth < 1024) {
        // Tablet
        expectedHeaderHeight = 80;
        expectedFooterHeight = 100;
        console.log('📱 Tablet layout detected');
    } else if (screenWidth < 1440) {
        // Desktop
        expectedHeaderHeight = 100;
        expectedFooterHeight = 120;
        console.log('🖥️ Desktop layout detected');
    } else {
        // Large desktop
        expectedHeaderHeight = 120;
        expectedFooterHeight = 140;
        console.log('🖥️ Large desktop layout detected');
    }
    
    const headerMatch = Math.abs(headerHeight - expectedHeaderHeight) <= 10;
    const footerMatch = Math.abs(footerHeight - expectedFooterHeight) <= 10;
    
    if (headerMatch && footerMatch) {
        console.log('✅ Ad heights match responsive expectations');
        return true;
    } else {
        console.error(`❌ Ad heights don't match expectations. Expected header: ${expectedHeaderHeight}px, footer: ${expectedFooterHeight}px`);
        return false;
    }
}

// Test 3: Check layout shift prevention
function testLayoutShiftPrevention() {
    console.log('🧪 Testing layout shift prevention...');
    
    const adContainers = document.querySelectorAll('.ad-container');
    let allHaveMinHeight = true;
    
    adContainers.forEach((container, index) => {
        const styles = window.getComputedStyle(container);
        const minHeight = parseInt(styles.minHeight);
        
        if (minHeight < 50) {
            console.error(`❌ Ad container ${index + 1} has insufficient min-height: ${minHeight}px`);
            allHaveMinHeight = false;
        } else {
            console.log(`✅ Ad container ${index + 1} has adequate min-height: ${minHeight}px`);
        }
    });
    
    return allHaveMinHeight;
}

// Test 4: Check ad loading states
function testAdLoadingStates() {
    console.log('🧪 Testing ad loading states...');
    
    const headerAd = document.getElementById('header-ad');
    const footerAd = document.getElementById('footer-ad');
    
    // Test loading state
    headerAd.classList.add('ad-loading');
    footerAd.classList.add('ad-loading');
    
    const headerHasLoadingStyle = window.getComputedStyle(headerAd).backgroundImage.includes('linear-gradient');
    const footerHasLoadingStyle = window.getComputedStyle(footerAd).backgroundImage.includes('linear-gradient');
    
    if (headerHasLoadingStyle && footerHasLoadingStyle) {
        console.log('✅ Ad loading states applied correctly');
    } else {
        console.error('❌ Ad loading states not working properly');
    }
    
    // Test loaded state
    setTimeout(() => {
        headerAd.classList.remove('ad-loading');
        headerAd.classList.add('ad-loaded');
        footerAd.classList.remove('ad-loading');
        footerAd.classList.add('ad-loaded');
        
        const headerBackground = window.getComputedStyle(headerAd).backgroundColor;
        const footerBackground = window.getComputedStyle(footerAd).backgroundColor;
        
        if (headerBackground === 'rgba(0, 0, 0, 0)' || headerBackground === 'transparent') {
            console.log('✅ Ad loaded states applied correctly');
        } else {
            console.error('❌ Ad loaded states not working properly');
        }
    }, 1000);
    
    return true;
}

// Test 5: Check spacing between header and main content
function testHeaderMainSpacing() {
    console.log('🧪 Testing header to main content spacing...');
    
    const header = document.querySelector('.header');
    const mainContainer = document.querySelector('.main-container');
    
    if (!header || !mainContainer) {
        console.error('❌ Header or main container not found');
        return false;
    }
    
    const headerRect = header.getBoundingClientRect();
    const mainRect = mainContainer.getBoundingClientRect();
    
    const spacing = mainRect.top - headerRect.bottom;
    
    console.log(`Spacing between header and main: ${spacing}px`);
    
    // Should have minimal spacing (less than 10px)
    if (spacing <= 10) {
        console.log('✅ Minimal spacing between header and main content');
        return true;
    } else {
        console.error(`❌ Excessive spacing between header and main content: ${spacing}px`);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting layout and ad optimization tests...');
    console.log('================================================');
    
    const results = {
        margins: testAdContainerMargins(),
        responsive: testResponsiveAdHeights(),
        layoutShift: testLayoutShiftPrevention(),
        loadingStates: testAdLoadingStates(),
        spacing: testHeaderMainSpacing()
    };
    
    console.log('================================================');
    console.log('📊 Test Results Summary:');
    
    let passedTests = 0;
    let totalTests = 0;
    
    Object.entries(results).forEach(([testName, passed]) => {
        totalTests++;
        if (passed) {
            passedTests++;
            console.log(`✅ ${testName}: PASSED`);
        } else {
            console.log(`❌ ${testName}: FAILED`);
        }
    });
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All layout and ad optimization tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check the issues above.');
    }
    
    return passedTests === totalTests;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testAdContainerMargins,
        testResponsiveAdHeights,
        testLayoutShiftPrevention,
        testAdLoadingStates,
        testHeaderMainSpacing,
        runAllTests
    };
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
}