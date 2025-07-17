// UI Components for the ladder game
// This file will contain reusable UI components
// Placeholder for future implementation

class SlotInput {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.currentSlotIndex = 0;
        this.currentSlotType = 'top'; // 'top' or 'bottom'
        this.inputBox = null;
        this.navigationContainer = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        this.createInputInterface();
        this.setupEventListeners();
        console.log('SlotInput component initialized');
    }

    createInputInterface() {
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'slot-input-container';
        inputContainer.innerHTML = `
            <div class="input-section">
                <div class="input-group">
                    <input type="text" class="slot-input-box" data-i18n-placeholder="input.placeholder" placeholder="Enter content and press Enter" maxlength="20">
                    <div class="input-hint">
                        <span class="current-slot-indicator">Participant 1</span> entering...
                    </div>
                    <div class="input-help" data-i18n="input.shortcuts">
                        💡 <strong>Shortcuts:</strong> Ctrl+Del or Ctrl+Backspace to delete current slot
                    </div>
                </div>
                <div class="navigation-controls">
                    <button class="nav-btn prev-btn" title="Previous slot">
                        <span class="nav-icon">◀</span>
                        <span data-i18n="input.nav.prev">Previous</span>
                    </button>
                    <button class="nav-btn next-btn" title="Next slot">
                        <span data-i18n="input.nav.next">Next</span>
                        <span class="nav-icon">▶</span>
                    </button>
                </div>
            </div>
            <div class="input-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">
                    <span class="current-progress">0</span> / <span class="total-slots">0</span> <span data-i18n="input.progress.completed">completed</span>
                </div>
            </div>
        `;

        this.container.appendChild(inputContainer);
        
        // Store references
        this.inputBox = inputContainer.querySelector('.slot-input-box');
        this.navigationContainer = inputContainer.querySelector('.navigation-controls');
        this.currentSlotIndicator = inputContainer.querySelector('.current-slot-indicator');
        this.progressFill = inputContainer.querySelector('.progress-fill');
        this.currentProgressSpan = inputContainer.querySelector('.current-progress');
        this.totalSlotsSpan = inputContainer.querySelector('.total-slots');
        this.prevBtn = inputContainer.querySelector('.prev-btn');
        this.nextBtn = inputContainer.querySelector('.next-btn');
    }

    setupEventListeners() {
        if (!this.inputBox) return;

        // Track composition state for Korean input
        this.isComposing = false;

        // Composition events for Korean input handling
        this.inputBox.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        this.inputBox.addEventListener('compositionend', () => {
            this.isComposing = false;
        });

        // Enter key handling with Korean input support
        this.inputBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Only handle Enter if not composing Korean text
                if (!this.isComposing) {
                    this.handleEnterPress();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.moveToPreviousSlot();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.moveToNextSlot();
            } else if (e.key === 'Delete' && e.ctrlKey) {
                e.preventDefault();
                this.deleteCurrentSlotContent();
            } else if (e.key === 'Backspace' && e.ctrlKey) {
                e.preventDefault();
                this.deleteCurrentSlotContent();
            }
        });

        // Navigation buttons with touch support
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.moveToPreviousSlot();
            });
            
            // Add touch feedback
            this.addTouchFeedback(this.prevBtn);
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.moveToNextSlot();
            });
            
            // Add touch feedback
            this.addTouchFeedback(this.nextBtn);
        }

        // Input focus/blur handling
        this.inputBox.addEventListener('focus', () => {
            this.highlightCurrentSlot();
        });

        this.inputBox.addEventListener('input', () => {
            this.updateInputHint();
        });
    }

    activate(slotCount, startType = 'top', startIndex = 0) {
        this.slotCount = slotCount;
        this.totalSlots = slotCount * 2; // top + bottom slots
        this.currentSlotType = startType;
        this.currentSlotIndex = startIndex;
        this.isActive = true;
        
        this.updateTotalSlotsDisplay();
        this.updateCurrentSlot();
        this.highlightCurrentSlot();
        this.loadCurrentSlotContent();
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Focus input box
        if (this.inputBox) {
            this.inputBox.focus();
        }
    }

    deactivate() {
        this.isActive = false;
        this.clearHighlight();
        if (this.inputBox) {
            this.inputBox.blur();
        }
    }

    handleEnterPress() {
        if (!this.isActive) return;

        const content = this.inputBox.value.trim();
        if (content === '') {
            this.showInputError(window.languageManager?.t('input.error.empty') || 'Please enter content');
            return;
        }

        // Enhanced content validation using error handler if available
        if (window.ErrorHandler) {
            const errorHandler = new ErrorHandler();
            const validation = errorHandler.validateSlotContent(content);
            
            if (!validation.isValid) {
                const errorMessages = validation.errors
                    .filter(error => error.severity === 'error')
                    .map(error => error.message);
                
                if (errorMessages.length > 0) {
                    this.showInputError(errorMessages[0]);
                    return;
                }
            }

            // Show warnings for problematic characters
            const warnings = validation.errors.filter(error => error.severity === 'warning');
            if (warnings.length > 0) {
                this.showInputWarning(warnings[0].message);
            }
        }

        // Add content to current slot
        this.addContentToCurrentSlot(content);
        
        // Clear input
        this.inputBox.value = '';
        
        // Check if this was the last slot
        const isLastSlot = this.currentSlotType === 'bottom' && this.currentSlotIndex === this.slotCount - 1;
        
        if (isLastSlot) {
            // All slots filled, complete input
            this.completeInput();
        } else {
            // Move to next slot
            this.moveToNextSlot();
        }
    }

    addContentToCurrentSlot(content) {
        if (this.onComplete) {
            this.onComplete({
                type: this.currentSlotType,
                index: this.currentSlotIndex,
                content: content,
                action: 'add'
            });
        }
    }

    moveToNextSlot() {
        if (!this.isActive) return;

        if (this.currentSlotType === 'top') {
            if (this.currentSlotIndex < this.slotCount - 1) {
                this.currentSlotIndex++;
            } else {
                // Move to bottom slots
                this.currentSlotType = 'bottom';
                this.currentSlotIndex = 0;
            }
        } else if (this.currentSlotType === 'bottom') {
            if (this.currentSlotIndex < this.slotCount - 1) {
                this.currentSlotIndex++;
            } else {
                // All slots filled, complete input
                this.completeInput();
                return;
            }
        }

        this.updateCurrentSlot();
        this.highlightCurrentSlot();
        this.loadCurrentSlotContent();
        this.updateNavigationButtons();
    }

    moveToPreviousSlot() {
        if (!this.isActive) return;

        if (this.currentSlotType === 'top') {
            if (this.currentSlotIndex > 0) {
                this.currentSlotIndex--;
            }
        } else if (this.currentSlotType === 'bottom') {
            if (this.currentSlotIndex > 0) {
                this.currentSlotIndex--;
            } else {
                // Move to top slots
                this.currentSlotType = 'top';
                this.currentSlotIndex = this.slotCount - 1;
            }
        }

        this.updateCurrentSlot();
        this.highlightCurrentSlot();
        this.loadCurrentSlotContent();
        this.updateNavigationButtons();
    }

    editSlot(type, index) {
        if (!this.isActive) return;

        this.currentSlotType = type;
        this.currentSlotIndex = index;
        
        // Get current content of the slot
        if (this.onComplete) {
            this.onComplete({
                type: type,
                index: index,
                action: 'get_content'
            });
        }

        this.updateCurrentSlot();
        this.highlightCurrentSlot();
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Focus input box
        if (this.inputBox) {
            this.inputBox.focus();
        }
    }

    setInputContent(content) {
        if (this.inputBox) {
            this.inputBox.value = content || '';
        }
    }

    loadCurrentSlotContent() {
        if (!this.isActive) return;
        
        // Request current content from the callback
        if (this.onComplete) {
            this.onComplete({
                type: this.currentSlotType,
                index: this.currentSlotIndex,
                action: 'get_content'
            });
        }
    }

    highlightCurrentSlot() {
        if (!this.isActive) return;

        // Clear previous highlights
        this.clearHighlight();

        // Highlight current slot
        const currentSlot = document.querySelector(`[data-type="${this.currentSlotType}"][data-index="${this.currentSlotIndex}"]`);
        if (currentSlot) {
            currentSlot.classList.add('active');
            
            // Only scroll if the element is not fully visible
            const rect = currentSlot.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (!isVisible) {
                currentSlot.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest'
                });
            }
        }
    }

    clearHighlight() {
        const activeSlots = document.querySelectorAll('.slot.active');
        activeSlots.forEach(slot => {
            slot.classList.remove('active');
        });
    }

    updateCurrentSlot() {
        if (!this.currentSlotIndicator) return;

        const slotName = this.currentSlotType === 'top' 
            ? (window.languageManager?.t('input.current.participant', this.currentSlotIndex + 1) || `Participant ${this.currentSlotIndex + 1}`)
            : (window.languageManager?.t('input.current.result', this.currentSlotIndex + 1) || `Result ${this.currentSlotIndex + 1}`);
        
        this.currentSlotIndicator.textContent = slotName;
        this.updateInputHint();
    }

    updateInputHint() {
        const placeholder = this.currentSlotType === 'top' 
            ? (window.languageManager?.t('input.hint.participant', this.currentSlotIndex + 1) || `Enter participant ${this.currentSlotIndex + 1} name`)
            : (window.languageManager?.t('input.hint.result', this.currentSlotIndex + 1) || `Enter result ${this.currentSlotIndex + 1}`);
        
        if (this.inputBox) {
            this.inputBox.placeholder = placeholder;
        }
    }

    updateProgress() {
        if (!this.currentProgressSpan || !this.progressFill) return;

        // Calculate filled slots
        const filledSlots = this.getFilledSlotsCount();
        const progressPercent = (filledSlots / this.totalSlots) * 100;
        
        this.currentProgressSpan.textContent = filledSlots;
        this.progressFill.style.width = `${progressPercent}%`;
    }

    updateTotalSlotsDisplay() {
        if (this.totalSlotsSpan) {
            this.totalSlotsSpan.textContent = this.totalSlots;
        }
    }

    updateNavigationButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        // Update previous button
        const isFirstSlot = this.currentSlotType === 'top' && this.currentSlotIndex === 0;
        this.prevBtn.disabled = isFirstSlot;
        this.prevBtn.classList.toggle('disabled', isFirstSlot);

        // Update next button
        const isLastSlot = this.currentSlotType === 'bottom' && this.currentSlotIndex === this.slotCount - 1;
        this.nextBtn.disabled = isLastSlot;
        this.nextBtn.classList.toggle('disabled', isLastSlot);
    }

    getFilledSlotsCount() {
        const filledSlots = document.querySelectorAll('.slot.filled');
        return filledSlots.length;
    }

    completeInput() {
        console.log('Input completed - all slots filled');
        this.deactivate();
        if (this.onComplete) {
            this.onComplete({
                action: 'complete'
            });
        }
    }

    deleteCurrentSlotContent() {
        if (!this.isActive) return;

        // Clear the input box
        this.inputBox.value = '';

        // Delete content from current slot
        if (this.onComplete) {
            this.onComplete({
                type: this.currentSlotType,
                index: this.currentSlotIndex,
                content: '',
                action: 'delete'
            });
        }

        // Update progress
        this.updateProgress();
    }

    showInputError(message) {
        if (!this.inputBox) return;

        this.inputBox.classList.add('error');
        
        // Remove existing error messages first
        const existingErrors = this.container.querySelectorAll('.input-error');
        existingErrors.forEach(error => error.remove());
        
        // Show error message with fixed positioning to prevent layout shift
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        
        // Position relative to the input container to prevent layout shifts
        const inputRect = this.inputBox.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        errorDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 1000;
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, rgba(220, 53, 69, 0.95) 0%, rgba(255, 107, 157, 0.95) 100%);
            color: white;
            border-radius: var(--radius-medium);
            border-left: 4px solid #dc3545;
            box-shadow: var(--shadow-medium);
            backdrop-filter: blur(10px);
            font-weight: 600;
            animation: errorSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        // Make input container relative for absolute positioning
        this.inputBox.parentNode.style.position = 'relative';
        this.inputBox.parentNode.appendChild(errorDiv);
        
        // Add error animation styles if not already added
        if (!document.querySelector('#error-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'error-animation-styles';
            style.textContent = `
                @keyframes errorSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes errorSlideOut {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove error after 3 seconds with animation
        setTimeout(() => {
            this.inputBox.classList.remove('error');
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'errorSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 3000);
    }

    showInputWarning(message) {
        if (!this.inputBox) return;

        // Remove existing warning messages first
        const existingWarnings = this.container.querySelectorAll('.input-warning');
        existingWarnings.forEach(warning => warning.remove());

        // Show warning message with fixed positioning to prevent layout shift
        const warningDiv = document.createElement('div');
        warningDiv.className = 'input-warning';
        warningDiv.textContent = message;
        
        warningDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 999;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 235, 59, 0.95) 100%);
            color: #856404;
            border-radius: var(--radius-medium);
            border-left: 4px solid #ffc107;
            box-shadow: var(--shadow-soft);
            backdrop-filter: blur(10px);
            font-weight: 600;
            animation: warningSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        // Make input container relative for absolute positioning
        this.inputBox.parentNode.style.position = 'relative';
        this.inputBox.parentNode.appendChild(warningDiv);
        
        // Add warning animation styles if not already added
        if (!document.querySelector('#warning-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'warning-animation-styles';
            style.textContent = `
                @keyframes warningSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes warningSlideOut {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove warning after 4 seconds with animation
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.style.animation = 'warningSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (warningDiv.parentNode) {
                        warningDiv.parentNode.removeChild(warningDiv);
                    }
                }, 300);
            }
        }, 4000);
    }

    // Add touch feedback to interactive elements
    addTouchFeedback(element) {
        if (!element) return;

        element.addEventListener('touchstart', (e) => {
            if (!element.classList.contains('disabled') && !element.disabled) {
                element.style.transform = 'scale(0.96)';
                element.style.opacity = '0.8';
            }
        }, { passive: true });

        const removeTouchFeedback = () => {
            element.style.transform = '';
            element.style.opacity = '';
        };

        element.addEventListener('touchend', removeTouchFeedback, { passive: true });
        element.addEventListener('touchcancel', removeTouchFeedback, { passive: true });
    }
}

class LadderRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
        this.animationId = null;
        this.isAnimating = false;
        this.drawnSegments = [];
        this.highlightedPaths = [];
        
        // Drawing configuration
        this.config = {
            lineWidth: 3,
            verticalLineColor: '#333',
            horizontalBarColor: '#666',
            animationSpeed: 50, // milliseconds between segments
            segmentLength: 20,
            padding: 10
        };
        
        // Color palette for different paths
        this.pathColors = [
            '#ff4757', // Red
            '#2f3542', // Dark blue  
            '#ff6b00', // Orange
            '#5f27cd', // Purple
            '#00d2d3', // Cyan
            '#ff9ff3', // Pink
            '#54a0ff', // Blue
            '#5f27cd', // Purple variant
            '#ff3838', // Red variant
            '#1dd1a1', // Green
            '#feca57', // Yellow
            '#48dbfb', // Light blue
            '#ff6b6b', // Light red
            '#ee5a24', // Dark orange
            '#0abde3', // Teal
            '#c44569', // Dark pink
            '#40739e', // Steel blue
            '#487eb0', // Medium blue
            '#8c7ae6', // Light purple
            '#00a8ff'  // Sky blue
        ];
        
        console.log('LadderRenderer initialized');
    }

    drawLadder(ladderStructure, animated = true) {
        if (!this.ctx || !ladderStructure) return;
        
        this.clearCanvas();
        this.ladderStructure = ladderStructure;
        
        // Optimize canvas height for screen-fit display
        this.optimizeCanvasHeight();
        
        this.calculateDimensions();
        
        // Add cute loading state to canvas
        this.showCanvasLoading();
        
        setTimeout(() => {
            this.hideCanvasLoading();
            if (animated) {
                this.animateDrawing();
            } else {
                this.drawComplete();
            }
        }, 500);
    }
    
    optimizeCanvasHeight() {
        if (!this.canvas || !this.ladderStructure) return;
        
        const participantCount = this.ladderStructure.verticalLines;
        const optimalHeight = this.calculateOptimalHeight(participantCount);
        
        // Update canvas height
        this.canvas.height = optimalHeight;
        
        // Also update CSS height to maintain aspect ratio
        this.canvas.style.height = `${optimalHeight}px`;
        
        console.log('Canvas height optimized:', {
            participantCount,
            optimalHeight,
            screenHeight: window.innerHeight
        });
    }

    showCanvasLoading() {
        if (!this.ctx) return;
        
        const canvas = this.canvas;
        canvas.classList.add('loading');
        
        // Draw cute loading animation
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw loading text
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(window.languageManager?.t('canvas.loading') || '🎲 Drawing ladder...', canvas.width / 2, canvas.height / 2);
    }

    hideCanvasLoading() {
        if (!this.canvas) return;
        this.canvas.classList.remove('loading');
    }

    calculateOptimalHeight(participantCount) {
        // 화면 높이에 맞춰 최적의 사다리 높이 계산
        const screenHeight = window.innerHeight;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 60;
        const availableHeight = screenHeight - headerHeight - 100; // 여유 공간 100px
        
        // 참가자 수에 따라 최소 높이 계산
        const minHeight = Math.max(300, participantCount * 25);
        const maxHeight = Math.min(600, availableHeight);
        
        return Math.max(minHeight, Math.min(maxHeight, availableHeight));
    }

    calculateDimensions() {
        if (!this.ladderStructure) return;
        
        const { verticalLines, horizontalBars } = this.ladderStructure;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate spacing with optimized dimensions
        this.slotWidth = (canvasWidth - this.config.padding * 2) / (verticalLines - 1);
        this.levelHeight = Math.max(20, (canvasHeight - this.config.padding * 2) / (horizontalBars.length + 2));
        
        // Calculate positions
        this.startX = this.config.padding;
        this.startY = this.config.padding;
        this.endY = canvasHeight - this.config.padding;
        
        console.log('Dimensions calculated:', {
            slotWidth: this.slotWidth,
            levelHeight: this.levelHeight,
            startX: this.startX,
            startY: this.startY,
            participantCount: verticalLines
        });
    }

    animateDrawing() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.drawnSegments = [];
        
        // Create drawing sequence
        const drawingSequence = this.createDrawingSequence();
        let currentIndex = 0;
        
        // Enhanced animation timing for better visual appeal
        const drawNextSegment = () => {
            if (currentIndex >= drawingSequence.length) {
                this.isAnimating = false;
                console.log('Ladder drawing animation complete');
                
                // Add completion sparkle effect
                this.addCompletionEffect();
                return;
            }
            
            const segment = drawingSequence[currentIndex];
            this.drawSegmentWithEffect(segment);
            this.drawnSegments.push(segment);
            
            currentIndex++;
            
            // Variable timing for more natural animation
            const delay = segment.type === 'vertical' ? 
                this.config.animationSpeed * 0.8 : 
                this.config.animationSpeed * 1.2;
                
            this.animationId = setTimeout(drawNextSegment, delay);
        };
        
        drawNextSegment();
    }

    drawSegmentWithEffect(segment) {
        if (!this.ctx) return;
        
        // Draw segment with enhanced visual effects
        this.ctx.beginPath();
        this.ctx.strokeStyle = segment.color;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Add subtle glow effect
        this.ctx.shadowColor = segment.color;
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.moveTo(segment.x1, segment.y1);
        this.ctx.lineTo(segment.x2, segment.y2);
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Add sparkle effect at connection points
        if (segment.type === 'horizontal') {
            this.addSparkleEffect(segment.x1, segment.y1);
            this.addSparkleEffect(segment.x2, segment.y2);
        }
    }

    addSparkleEffect(x, y) {
        if (!this.ctx) return;
        
        // Draw small sparkle
        this.ctx.save();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 5;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Fade out sparkle
        setTimeout(() => {
            if (this.ctx) {
                this.ctx.clearRect(x - 5, y - 5, 10, 10);
                // Redraw the area without sparkle
                this.redrawArea(x - 5, y - 5, 10, 10);
            }
        }, 300);
    }

    addCompletionEffect() {
        if (!this.ctx || !this.canvas) return;
        
        // Add completion message with cute animation
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Create floating completion message
        const message = document.createElement('div');
        message.textContent = window.languageManager?.t('canvas.complete') || '✨ Complete! ✨';
        message.style.cssText = `
            position: fixed;
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-weight: 700;
            font-size: 1.1rem;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
            z-index: 1000;
            pointer-events: none;
            animation: completionFloat 3s ease-out forwards;
        `;
        
        // Add completion animation styles
        if (!document.querySelector('#completion-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'completion-animation-styles';
            style.textContent = `
                @keyframes completionFloat {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    40% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -80px) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    redrawArea(x, y, width, height) {
        // This would redraw the specific area - simplified for now
        // In a full implementation, you'd track what was drawn in this area
    }

    createDrawingSequence() {
        const sequence = [];
        const { verticalLines, horizontalBars } = this.ladderStructure;
        
        // First, draw all vertical lines
        for (let i = 0; i < verticalLines; i++) {
            const x = this.startX + i * this.slotWidth;
            sequence.push({
                type: 'vertical',
                x1: x,
                y1: this.startY,
                x2: x,
                y2: this.endY,
                color: this.config.verticalLineColor
            });
        }
        
        // Then, draw horizontal bars level by level
        horizontalBars.forEach(levelData => {
            const y = this.startY + (levelData.level + 1) * this.levelHeight;
            
            levelData.bars.forEach(barIndex => {
                const x1 = this.startX + barIndex * this.slotWidth;
                const x2 = this.startX + (barIndex + 1) * this.slotWidth;
                
                sequence.push({
                    type: 'horizontal',
                    x1: x1,
                    y1: y,
                    x2: x2,
                    y2: y,
                    color: this.config.horizontalBarColor
                });
            });
        });
        
        return sequence;
    }

    drawSegment(segment) {
        if (!this.ctx) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = segment.color;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.moveTo(segment.x1, segment.y1);
        this.ctx.lineTo(segment.x2, segment.y2);
        this.ctx.stroke();
    }

    drawComplete() {
        if (!this.ctx || !this.ladderStructure) return;
        
        const { verticalLines, horizontalBars } = this.ladderStructure;
        
        // Draw vertical lines
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.config.verticalLineColor;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < verticalLines; i++) {
            const x = this.startX + i * this.slotWidth;
            this.ctx.moveTo(x, this.startY);
            this.ctx.lineTo(x, this.endY);
        }
        this.ctx.stroke();
        
        // Draw horizontal bars
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.config.horizontalBarColor;
        
        horizontalBars.forEach(levelData => {
            const y = this.startY + (levelData.level + 1) * this.levelHeight;
            
            levelData.bars.forEach(barIndex => {
                const x1 = this.startX + barIndex * this.slotWidth;
                const x2 = this.startX + (barIndex + 1) * this.slotWidth;
                
                this.ctx.moveTo(x1, y);
                this.ctx.lineTo(x2, y);
            });
        });
        this.ctx.stroke();
    }

    getPathColor(pathIndex) {
        return this.pathColors[pathIndex % this.pathColors.length];
    }

    highlightPath(path, options = {}) {
        if (!this.ctx || !path || !path.segments) return;
        
        const {
            animated = true,
            showResult = false,
            onComplete = null,
            clearPrevious = false,
            pathIndex = 0,
            color = null
        } = options;
        
        // Assign color to path
        const pathColor = color || this.getPathColor(pathIndex);
        path.color = pathColor;
        
        // Clear previous highlights if requested
        if (clearPrevious) {
            this.clearHighlights();
        }
        
        // Add this path to highlighted paths
        this.highlightedPaths.push(path);
        
        // Animate path highlighting
        if (animated) {
            this.animatePathHighlight(path, { showResult, onComplete, color: pathColor });
        } else {
            this.drawPathHighlight(path, pathColor);
            if (onComplete) onComplete();
        }
    }

    animatePathHighlight(path, options = {}) {
        const { showResult = false, onComplete = null, color = null } = options;
        const segments = this.convertPathToCanvasSegments(path);
        let currentIndex = 0;
        
        const highlightNextSegment = () => {
            if (currentIndex >= segments.length) {
                console.log('Path highlight animation complete');
                if (onComplete) onComplete();
                return;
            }
            
            const segment = segments[currentIndex];
            this.drawHighlightSegment(segment, color || path.color, currentIndex === segments.length - 1);
            
            currentIndex++;
            setTimeout(highlightNextSegment, this.config.animationSpeed);
        };
        
        highlightNextSegment();
    }

    drawPathHighlight(path, color = null) {
        const segments = this.convertPathToCanvasSegments(path);
        const pathColor = color || path.color || this.pathColors[0];
        segments.forEach(segment => {
            this.drawHighlightSegment(segment, pathColor);
        });
    }

    convertPathToCanvasSegments(path) {
        const canvasSegments = [];
        
        path.segments.forEach(segment => {
            if (segment.type === 'vertical') {
                const x = this.startX + segment.x * this.slotWidth;
                const y1 = this.startY + segment.y1 * this.levelHeight;
                const y2 = this.startY + segment.y2 * this.levelHeight;
                
                canvasSegments.push({
                    type: 'vertical',
                    x1: x,
                    y1: y1,
                    x2: x,
                    y2: y2
                });
            } else if (segment.type === 'horizontal') {
                const x1 = this.startX + segment.x1 * this.slotWidth;
                const x2 = this.startX + segment.x2 * this.slotWidth;
                const y = this.startY + segment.y * this.levelHeight;
                
                canvasSegments.push({
                    type: 'horizontal',
                    x1: x1,
                    y1: y,
                    x2: x2,
                    y2: y
                });
            }
        });
        
        return canvasSegments;
    }

    drawHighlightSegment(segment, color = '#ff4757', isLast = false) {
        if (!this.ctx) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.config.lineWidth + 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Add glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        
        this.ctx.moveTo(segment.x1, segment.y1);
        this.ctx.lineTo(segment.x2, segment.y2);
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Add endpoint highlight for final segment
        if (isLast) {
            this.addEndpointHighlight(segment.x2, segment.y2, color);
        }
    }
    
    addEndpointHighlight(x, y, color) {
        if (!this.ctx) return;
        
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add white center
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    revealAllPaths(paths, options = {}) {
        if (!this.ctx || !paths) return;
        
        const {
            staggerDelay = 200,
            showResults = false,
            onComplete = null
        } = options;
        
        // Clear previous highlights
        this.clearHighlights();
        
        // Add all paths to highlighted paths with colors
        this.highlightedPaths = [...paths];
        
        let completedPaths = 0;
        const totalPaths = paths.length;
        
        // Animate all paths with staggered timing and different colors
        paths.forEach((path, index) => {
            const pathColor = this.getPathColor(index);
            path.color = pathColor;
            
            setTimeout(() => {
                this.animatePathHighlight(path, {
                    showResult: showResults,
                    color: pathColor,
                    onComplete: () => {
                        completedPaths++;
                        if (completedPaths === totalPaths && onComplete) {
                            onComplete();
                        }
                    }
                });
            }, index * staggerDelay);
        });
    }

    clearHighlights() {
        // Redraw the base ladder without highlights
        this.drawComplete();
        this.highlightedPaths = [];
    }

    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Cancel any ongoing animations
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
        
        this.isAnimating = false;
        this.drawnSegments = [];
        this.highlightedPaths = [];
    }

    // Utility method to resize canvas and redraw
    resize() {
        if (this.ladderStructure) {
            this.calculateDimensions();
            this.drawComplete();
            
            // Redraw any highlighted paths
            this.highlightedPaths.forEach(path => {
                this.animatePathHighlight(path);
            });
        }
    }
}

// Utility functions for UI
const UIUtils = {
    // Show loading state
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
        }
    },

    // Hide loading state
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
        }
    },

    // Show error message
    showError(message, container) {
        console.log('Error:', message);
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            container.appendChild(errorDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    },

    // Show success message
    showSuccess(message, container) {
        console.log('Success:', message);
        if (container) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.textContent = message;
            container.appendChild(successDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }
    }
};

class ResultsTable {
    constructor(container) {
        this.container = container;
        this.tableElement = null;
        this.results = [];
        this.isVisible = false;
        
        this.init();
        console.log('ResultsTable component initialized');
    }

    init() {
        this.createTableStructure();
        this.hide(); // Initially hidden
    }

    createTableStructure() {
        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'results-table-container';
        tableContainer.innerHTML = `
            <div class="results-header">
                <h3 class="results-title">
                    <span class="results-icon">🎯</span>
                    <span data-i18n="results.title">Ladder Game Results</span>
                </h3>
                <div class="results-summary">
                    <span class="total-results">0</span> <span data-i18n="results.summary.text">connections completed</span>
                </div>
            </div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th class="participant-col" data-i18n="results.participant">Participant</th>
                        <th class="arrow-col"></th>
                        <th class="result-col" data-i18n="results.result">Result</th>
                    </tr>
                </thead>
                <tbody class="results-body">
                </tbody>
            </table>
            <div class="results-footer">
                <div class="results-actions">
                    <button class="btn btn-secondary results-clear-btn">
                        <span class="btn-icon">🗑️</span>
                        <span data-i18n="results.clear">Clear Results</span>
                    </button>
                    <button class="btn btn-info results-export-btn">
                        <span class="btn-icon">📋</span>
                        <span data-i18n="results.export">Copy Results</span>
                    </button>
                </div>
            </div>
        `;

        this.container.appendChild(tableContainer);
        
        // Store references
        this.tableElement = tableContainer;
        this.tableBody = tableContainer.querySelector('.results-body');
        this.totalResultsSpan = tableContainer.querySelector('.total-results');
        this.clearBtn = tableContainer.querySelector('.results-clear-btn');
        this.exportBtn = tableContainer.querySelector('.results-export-btn');
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearResults();
            });
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }
    }

    displayResults(connections, options = {}) {
        const {
            topSlots = [],
            bottomSlots = [],
            animated = true,
            colors = null
        } = options;

        // Store results
        this.results = connections.map((connection, index) => ({
            participant: topSlots[index] || (window.languageManager?.t('input.current.participant', index + 1) || `Participant ${index + 1}`),
            result: bottomSlots[connection] || (window.languageManager?.t('input.current.result', connection + 1) || `Result ${connection + 1}`),
            color: colors ? colors[index] : null,
            index: index
        }));

        // Clear existing table
        this.clearTable();

        // Update summary
        this.updateSummary();

        // Add results with animation
        if (animated) {
            this.animateResults();
        } else {
            this.addAllResults();
        }

        // Show table
        this.show();
    }

    animateResults() {
        let delay = 0;
        const staggerDelay = 150;

        this.results.forEach((result, index) => {
            setTimeout(() => {
                this.addResultRow(result, index, true);
            }, delay);
            delay += staggerDelay;
        });
    }

    addAllResults() {
        this.results.forEach((result, index) => {
            this.addResultRow(result, index, false);
        });
    }

    addResultRow(result, index, animated = false) {
        const row = document.createElement('tr');
        row.className = 'result-row';
        
        if (animated) {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
        }

        // Apply color styling if available
        const colorClass = result.color ? `path-color-${index % 10}` : '';
        if (colorClass) {
            row.classList.add(colorClass);
        }

        row.innerHTML = `
            <td class="participant-cell" data-label="참가자">
                <div class="cell-content">
                    <span class="participant-indicator ${colorClass}"></span>
                    <span class="participant-name">${this.escapeHtml(result.participant)}</span>
                </div>
            </td>
            <td class="arrow-cell">
                <div class="connection-arrow ${colorClass}">➡️</div>
            </td>
            <td class="result-cell" data-label="결과">
                <div class="cell-content">
                    <span class="result-indicator ${colorClass}"></span>
                    <span class="result-name">${this.escapeHtml(result.result)}</span>
                </div>
            </td>
        `;

        this.tableBody.appendChild(row);

        // Animate in if requested
        if (animated) {
            setTimeout(() => {
                row.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    updateSummary() {
        if (this.totalResultsSpan) {
            this.totalResultsSpan.textContent = `${this.results.length}`;
        }
    }

    clearTable() {
        if (this.tableBody) {
            this.tableBody.innerHTML = '';
        }
    }

    clearResults() {
        this.results = [];
        this.clearTable();
        this.updateSummary();
        this.hide();
        
        // Dispatch clear event
        this.dispatchEvent('resultsCleared');
    }

    exportResults() {
        if (this.results.length === 0) {
            this.showMessage(window.languageManager?.t('results.export.empty') || 'No results to copy.', 'warning');
            return;
        }

        const resultText = this.results.map(result => 
            `${result.participant} ➡️ ${result.result}`
        ).join('\n');
        
        const fullText = window.languageManager?.t('results.export.text', resultText) || `Ladder Game Results:\n\n${resultText}`;

        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(fullText).then(() => {
                this.showMessage(window.languageManager?.t('results.export.success') || 'Results copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(fullText);
            });
        } else {
            this.fallbackCopyToClipboard(fullText);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showMessage(window.languageManager?.t('results.export.success') || 'Results copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showMessage(window.languageManager?.t('results.export.error') || 'Copy failed. Please copy manually.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    show() {
        if (this.tableElement) {
            this.tableElement.classList.add('visible');
            this.isVisible = true;
            
            // Smooth scroll to table
            setTimeout(() => {
                this.tableElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 300);
        }
    }

    hide() {
        if (this.tableElement) {
            this.tableElement.classList.remove('visible');
            this.isVisible = false;
        }
    }

    updateTable(connections, options = {}) {
        this.displayResults(connections, options);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showMessage(message, type = 'info') {
        // Show temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `results-message results-message-${type}`;
        messageDiv.textContent = message;
        
        if (this.tableElement) {
            this.tableElement.appendChild(messageDiv);
            
            setTimeout(() => {
                messageDiv.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }, 3000);
        }
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, { 
            detail: data,
            bubbles: true 
        });
        this.container.dispatchEvent(event);
    }

    getResults() {
        return this.results;
    }

    isEmpty() {
        return this.results.length === 0;
    }
}

// Export for use in other files
window.SlotInput = SlotInput;
window.LadderRenderer = LadderRenderer;
window.ResultsTable = ResultsTable;
window.UIUtils = UIUtils;