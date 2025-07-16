/**
 * Error Handler and Browser Compatibility Utility
 * Handles various error scenarios and provides graceful degradation
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrorLogSize = 50;
        this.init();
    }

    init() {
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        // Check browser compatibility
        this.browserSupport = this.checkBrowserSupport();
        
        console.log('ErrorHandler initialized', this.browserSupport);
    }

    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
            
            // Prevent the default browser behavior
            event.preventDefault();
        });
    }

    checkBrowserSupport() {
        const support = {
            localStorage: this.checkLocalStorageSupport(),
            canvas: this.checkCanvasSupport(),
            touchEvents: this.checkTouchSupport(),
            cssGrid: this.checkCSSGridSupport(),
            es6: this.checkES6Support(),
            webGL: this.checkWebGLSupport()
        };

        // Log browser support status
        console.log('Browser Support Check:', support);
        
        return support;
    }

    checkLocalStorageSupport() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not supported:', e);
            return false;
        }
    }

    checkCanvasSupport() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            return !!(ctx && typeof ctx.fillRect === 'function');
        } catch (e) {
            console.warn('Canvas not supported:', e);
            return false;
        }
    }

    checkTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    checkCSSGridSupport() {
        return CSS.supports('display', 'grid');
    }

    checkES6Support() {
        try {
            // Test for basic ES6 features
            eval('const test = () => {}; class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!(gl && gl instanceof WebGLRenderingContext);
        } catch (e) {
            return false;
        }
    }

    // Input validation methods
    validateSlotCount(value) {
        const errors = [];
        
        if (value === null || value === undefined || value === '') {
            errors.push({
                type: 'required',
                message: '참가자 수를 입력해주세요 👥',
                severity: 'error'
            });
            return { isValid: false, errors };
        }

        const numValue = parseInt(value);
        
        if (isNaN(numValue)) {
            errors.push({
                type: 'invalid_type',
                message: '숫자만 입력 가능합니다 🔢',
                severity: 'error'
            });
            return { isValid: false, errors };
        }

        if (numValue < 2) {
            errors.push({
                type: 'min_value',
                message: '최소 2명 이상이어야 합니다 👥',
                severity: 'error'
            });
        }

        if (numValue > 20) {
            errors.push({
                type: 'max_value',
                message: '최대 20명까지 가능합니다 📊',
                severity: 'error'
            });
        }

        // Performance warning for large numbers
        if (numValue > 15) {
            errors.push({
                type: 'performance_warning',
                message: '참가자가 많으면 화면이 복잡해질 수 있습니다 ⚠️',
                severity: 'warning'
            });
        }

        return {
            isValid: errors.filter(e => e.severity === 'error').length === 0,
            errors,
            value: numValue
        };
    }

    validateSlotContent(content, maxLength = 20) {
        const errors = [];
        
        if (!content || content.trim() === '') {
            errors.push({
                type: 'required',
                message: '내용을 입력해주세요 ✏️',
                severity: 'error'
            });
            return { isValid: false, errors };
        }

        const trimmedContent = content.trim();
        
        if (trimmedContent.length > maxLength) {
            errors.push({
                type: 'max_length',
                message: `최대 ${maxLength}자까지 입력 가능합니다 📝`,
                severity: 'error'
            });
        }

        // Check for potentially problematic characters
        const problematicChars = /[<>\"'&]/g;
        if (problematicChars.test(trimmedContent)) {
            errors.push({
                type: 'invalid_characters',
                message: '특수문자는 사용할 수 없습니다 🚫',
                severity: 'warning'
            });
        }

        return {
            isValid: errors.filter(e => e.severity === 'error').length === 0,
            errors,
            value: trimmedContent
        };
    }

    // Storage error handling
    handleStorageError(error, operation = 'storage') {
        console.error(`Storage error during ${operation}:`, error);
        
        if (error.name === 'QuotaExceededError' || 
            error.message.includes('quota') || 
            error.message.includes('storage')) {
            
            return {
                type: 'quota_exceeded',
                title: '저장 공간 부족 💾',
                message: '브라우저 저장 공간이 부족합니다. 일부 저장된 게임을 삭제해주세요.',
                suggestions: [
                    '저장된 게임 목록에서 오래된 게임 삭제',
                    '브라우저 캐시 정리',
                    '다른 브라우저 사용'
                ],
                severity: 'error'
            };
        }

        if (!this.browserSupport.localStorage) {
            return {
                type: 'storage_unsupported',
                title: '저장 기능 미지원 ⚠️',
                message: '현재 브라우저에서는 게임 저장 기능을 사용할 수 없습니다.',
                suggestions: [
                    '최신 브라우저로 업데이트',
                    '시크릿 모드 해제',
                    '브라우저 설정에서 쿠키/저장소 허용'
                ],
                severity: 'warning'
            };
        }

        return {
            type: 'storage_generic',
            title: '저장 오류 ❌',
            message: '게임 저장 중 오류가 발생했습니다.',
            suggestions: [
                '페이지 새로고침 후 다시 시도',
                '브라우저 재시작'
            ],
            severity: 'error'
        };
    }

    // Canvas fallback handling
    createCanvasFallback(container, ladderData) {
        if (!container) return null;

        console.log('Creating canvas fallback with SVG');
        
        // Remove existing canvas
        const existingCanvas = container.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        // Create SVG fallback
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '400');
        svg.setAttribute('viewBox', '0 0 800 400');
        svg.style.cssText = `
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            margin: 1rem 0;
        `;

        if (ladderData) {
            this.drawSVGLadder(svg, ladderData);
        } else {
            // Show fallback message
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '400');
            text.setAttribute('y', '200');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#666');
            text.setAttribute('font-size', '18');
            text.setAttribute('font-family', 'system-ui, sans-serif');
            text.textContent = '🎲 사다리가 여기에 표시됩니다';
            svg.appendChild(text);
        }

        container.appendChild(svg);
        return svg;
    }

    drawSVGLadder(svg, ladderData) {
        const { verticalLines, horizontalBars } = ladderData;
        const width = 800;
        const height = 400;
        const padding = 40;
        const slotWidth = (width - padding * 2) / (verticalLines - 1);
        const levelHeight = (height - padding * 2) / (horizontalBars.length + 2);

        // Draw vertical lines
        for (let i = 0; i < verticalLines; i++) {
            const x = padding + i * slotWidth;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', padding);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height - padding);
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
        }

        // Draw horizontal bars
        horizontalBars.forEach(levelData => {
            const y = padding + (levelData.level + 1) * levelHeight;
            
            levelData.bars.forEach(barIndex => {
                const x1 = padding + barIndex * slotWidth;
                const x2 = padding + (barIndex + 1) * slotWidth;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y);
                line.setAttribute('stroke', '#666');
                line.setAttribute('stroke-width', '3');
                line.setAttribute('stroke-linecap', 'round');
                svg.appendChild(line);
            });
        });
    }

    // Network error handling
    handleNetworkError(error, context = 'network') {
        console.error(`Network error in ${context}:`, error);
        
        return {
            type: 'network_error',
            title: '연결 오류 🌐',
            message: '인터넷 연결을 확인해주세요.',
            suggestions: [
                '인터넷 연결 상태 확인',
                '페이지 새로고침',
                '잠시 후 다시 시도'
            ],
            severity: 'error'
        };
    }

    // Generic error logging
    logError(type, details) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorEntry);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }

        console.error('Error logged:', errorEntry);
        
        // Send error to analytics if available (non-blocking)
        this.sendErrorToAnalytics(errorEntry);
    }

    // Send error to analytics (optional, non-blocking)
    sendErrorToAnalytics(errorEntry) {
        try {
            // Only send critical errors to avoid spam
            if (errorEntry.type === 'JavaScript Error' || 
                errorEntry.type === 'Unhandled Promise Rejection') {
                
                // Use gtag if available (Google Analytics)
                if (typeof gtag === 'function') {
                    gtag('event', 'exception', {
                        description: `${errorEntry.type}: ${errorEntry.details.message || 'Unknown error'}`,
                        fatal: false
                    });
                }
            }
        } catch (e) {
            // Silently fail - don't let analytics errors break the app
            console.debug('Analytics error reporting failed:', e);
        }
    }

    // Show user-friendly error messages
    showErrorMessage(container, errorInfo) {
        if (!container) {
            container = document.querySelector('.game-container') || document.body;
        }

        // Remove existing error messages
        const existingErrors = container.querySelectorAll('.error-notification');
        existingErrors.forEach(error => error.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = `error-notification error-${errorInfo.severity}`;
        
        let iconMap = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        errorDiv.innerHTML = `
            <div class="error-header">
                <span class="error-icon">${iconMap[errorInfo.severity] || '❌'}</span>
                <h4 class="error-title">${errorInfo.title}</h4>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="error-content">
                <p class="error-message">${errorInfo.message}</p>
                ${errorInfo.suggestions ? `
                    <div class="error-suggestions">
                        <p><strong>해결 방법:</strong></p>
                        <ul>
                            ${errorInfo.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        errorDiv.style.cssText = `
            background: ${errorInfo.severity === 'error' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 
                        errorInfo.severity === 'warning' ? 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)' :
                        'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)'};
            color: white;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            animation: errorSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: relative;
        `;

        // Add animation styles if not already added
        if (!document.querySelector('#error-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'error-animation-styles';
            style.textContent = `
                @keyframes errorSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .error-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                
                .error-icon {
                    font-size: 1.5rem;
                }
                
                .error-title {
                    margin: 0;
                    flex: 1;
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                
                .error-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }
                
                .error-close:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .error-message {
                    margin: 0 0 1rem 0;
                    line-height: 1.5;
                }
                
                .error-suggestions {
                    background: rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-top: 1rem;
                }
                
                .error-suggestions ul {
                    margin: 0.5rem 0 0 0;
                    padding-left: 1.5rem;
                }
                
                .error-suggestions li {
                    margin: 0.25rem 0;
                }
            `;
            document.head.appendChild(style);
        }

        container.insertBefore(errorDiv, container.firstChild);

        // Auto-remove after delay for non-critical errors
        if (errorInfo.severity !== 'error') {
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.animation = 'errorSlideOut 0.3s ease-in forwards';
                    setTimeout(() => {
                        if (errorDiv.parentNode) {
                            errorDiv.parentNode.removeChild(errorDiv);
                        }
                    }, 300);
                }
            }, 8000);
        }

        return errorDiv;
    }

    // Get error log for debugging
    getErrorLog() {
        return [...this.errorLog];
    }

    // Clear error log
    clearErrorLog() {
        this.errorLog = [];
    }

    // Check if feature is supported with fallback
    checkFeatureSupport(feature) {
        return this.browserSupport[feature] || false;
    }

    // Enhanced validation for game state
    validateGameState(gameData) {
        const errors = [];
        
        if (!gameData) {
            errors.push({
                type: 'missing_data',
                message: '게임 데이터가 없습니다 📋',
                severity: 'error'
            });
            return { isValid: false, errors };
        }

        // Check slot count
        if (!gameData.slotCount || gameData.slotCount < 2 || gameData.slotCount > 20) {
            errors.push({
                type: 'invalid_slot_count',
                message: '참가자 수가 올바르지 않습니다 (2-20명) 👥',
                severity: 'error'
            });
        }

        // Check top slots
        if (!gameData.topSlots || !Array.isArray(gameData.topSlots)) {
            errors.push({
                type: 'invalid_top_slots',
                message: '참가자 데이터가 올바르지 않습니다 👆',
                severity: 'error'
            });
        } else {
            const emptyTopSlots = gameData.topSlots.filter(slot => !slot || slot.trim() === '').length;
            if (emptyTopSlots > 0) {
                errors.push({
                    type: 'empty_top_slots',
                    message: `${emptyTopSlots}개의 참가자 이름이 비어있습니다 ✏️`,
                    severity: 'error'
                });
            }
        }

        // Check bottom slots
        if (!gameData.bottomSlots || !Array.isArray(gameData.bottomSlots)) {
            errors.push({
                type: 'invalid_bottom_slots',
                message: '결과 데이터가 올바르지 않습니다 👇',
                severity: 'error'
            });
        } else {
            const emptyBottomSlots = gameData.bottomSlots.filter(slot => !slot || slot.trim() === '').length;
            if (emptyBottomSlots > 0) {
                errors.push({
                    type: 'empty_bottom_slots',
                    message: `${emptyBottomSlots}개의 결과가 비어있습니다 ✏️`,
                    severity: 'error'
                });
            }
        }

        // Check for duplicate entries
        if (gameData.topSlots && gameData.bottomSlots) {
            const duplicateTop = this.findDuplicates(gameData.topSlots);
            const duplicateBottom = this.findDuplicates(gameData.bottomSlots);
            
            if (duplicateTop.length > 0) {
                errors.push({
                    type: 'duplicate_top_slots',
                    message: `중복된 참가자: ${duplicateTop.join(', ')} 👥`,
                    severity: 'warning'
                });
            }
            
            if (duplicateBottom.length > 0) {
                errors.push({
                    type: 'duplicate_bottom_slots',
                    message: `중복된 결과: ${duplicateBottom.join(', ')} 🎯`,
                    severity: 'warning'
                });
            }
        }

        return {
            isValid: errors.filter(e => e.severity === 'error').length === 0,
            errors
        };
    }

    // Find duplicate entries in an array
    findDuplicates(arr) {
        const seen = new Set();
        const duplicates = new Set();
        
        arr.forEach(item => {
            if (item && item.trim()) {
                const trimmed = item.trim().toLowerCase();
                if (seen.has(trimmed)) {
                    duplicates.add(item.trim());
                } else {
                    seen.add(trimmed);
                }
            }
        });
        
        return Array.from(duplicates);
    }

    // Handle canvas rendering errors
    handleCanvasError(error, container, ladderData) {
        console.error('Canvas rendering error:', error);
        
        // Log the error
        this.logError('Canvas Rendering Error', {
            message: error.message,
            stack: error.stack,
            canvasSupported: this.browserSupport.canvas
        });

        // Show user-friendly error message
        const errorInfo = {
            type: 'canvas_error',
            title: '그래픽 렌더링 오류 🎨',
            message: 'Canvas 그래픽을 표시할 수 없어 대체 방식으로 표시합니다.',
            suggestions: [
                '브라우저를 최신 버전으로 업데이트',
                '하드웨어 가속 활성화',
                '다른 브라우저 사용'
            ],
            severity: 'warning'
        };

        this.showErrorMessage(container, errorInfo);

        // Create fallback rendering
        return this.createCanvasFallback(container, ladderData);
    }

    // Handle memory-related errors
    handleMemoryError(error, context = 'memory') {
        console.error(`Memory error in ${context}:`, error);
        
        return {
            type: 'memory_error',
            title: '메모리 부족 🧠',
            message: '브라우저 메모리가 부족합니다. 페이지를 새로고침하거나 다른 탭을 닫아주세요.',
            suggestions: [
                '페이지 새로고침',
                '다른 브라우저 탭 닫기',
                '브라우저 재시작',
                '참가자 수 줄이기'
            ],
            severity: 'error'
        };
    }

    // Enhanced browser compatibility check with specific recommendations
    getCompatibilityRecommendations() {
        const recommendations = [];
        const support = this.browserSupport;

        if (!support.localStorage) {
            recommendations.push({
                feature: 'localStorage',
                issue: '게임 저장 기능을 사용할 수 없습니다',
                solutions: [
                    '시크릿/프라이빗 모드를 해제하세요',
                    '브라우저 설정에서 쿠키와 사이트 데이터를 허용하세요',
                    'Chrome, Firefox, Safari, Edge 최신 버전을 사용하세요'
                ],
                severity: 'warning'
            });
        }

        if (!support.canvas) {
            recommendations.push({
                feature: 'canvas',
                issue: '사다리 그래픽이 단순하게 표시됩니다',
                solutions: [
                    '브라우저를 최신 버전으로 업데이트하세요',
                    '하드웨어 가속을 활성화하세요',
                    'Chrome, Firefox, Safari, Edge를 사용하세요'
                ],
                severity: 'info'
            });
        }

        if (!support.es6) {
            recommendations.push({
                feature: 'es6',
                issue: '일부 기능이 제대로 작동하지 않을 수 있습니다',
                solutions: [
                    '브라우저를 최신 버전으로 업데이트하세요',
                    'Internet Explorer 대신 Edge를 사용하세요',
                    'Chrome, Firefox, Safari 최신 버전을 사용하세요'
                ],
                severity: 'error'
            });
        }

        if (!support.touchEvents && this.isMobileDevice()) {
            recommendations.push({
                feature: 'touchEvents',
                issue: '터치 조작이 원활하지 않을 수 있습니다',
                solutions: [
                    '모바일 브라우저를 최신 버전으로 업데이트하세요',
                    'Chrome 모바일 또는 Safari를 사용하세요'
                ],
                severity: 'warning'
            });
        }

        return recommendations;
    }

    // Check if device is mobile
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Create comprehensive error report for debugging
    createErrorReport() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            browserSupport: this.browserSupport,
            compatibilityRecommendations: this.getCompatibilityRecommendations(),
            errorLog: this.getErrorLog(),
            performance: {
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : 'Not available',
                timing: performance.timing ? {
                    loadEventEnd: performance.timing.loadEventEnd,
                    navigationStart: performance.timing.navigationStart,
                    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
                } : 'Not available'
            }
        };
    }

    // Show compatibility warnings on app initialization
    showCompatibilityWarnings(container) {
        const recommendations = this.getCompatibilityRecommendations();
        const criticalIssues = recommendations.filter(r => r.severity === 'error');
        const warnings = recommendations.filter(r => r.severity === 'warning');

        // Show critical issues immediately
        criticalIssues.forEach(issue => {
            this.showErrorMessage(container, {
                type: issue.feature,
                title: `${issue.feature} 호환성 문제 ❌`,
                message: issue.issue,
                suggestions: issue.solutions,
                severity: 'error'
            });
        });

        // Show warnings after a delay
        setTimeout(() => {
            warnings.forEach(issue => {
                this.showErrorMessage(container, {
                    type: issue.feature,
                    title: `${issue.feature} 제한 ⚠️`,
                    message: issue.issue,
                    suggestions: issue.solutions,
                    severity: 'warning'
                });
            });
        }, 2000);
    }
}

// Export for use in other files
window.ErrorHandler = ErrorHandler;