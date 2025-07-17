// Ladder Game Logic
class LadderGame {
    constructor() {
        this.slotCount = 0;
        this.topSlots = [];
        this.bottomSlots = [];
        this.currentSlotIndex = 0;
        this.currentSlotType = 'top'; // 'top' or 'bottom'
        this.gameState = 'setup'; // 'setup', 'input', 'ready', 'playing', 'complete'
        this.slotInput = null; // SlotInput component instance
        this.storageManager = new StorageManager(); // Storage manager for save/load
        this.errorHandler = window.ErrorHandler ? new ErrorHandler() : null; // Error handler
        this.ladderRenderer = null; // Ladder renderer instance
        this.compactLadderComponent = null; // Compact ladder component instance
        this.simpleLadderGame = null; // Simple ladder game instance
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkBrowserCompatibility();
        console.log('LadderGame initialized');
    }

    // Check browser compatibility and show warnings if needed
    checkBrowserCompatibility() {
        if (!this.errorHandler) return;

        const container = document.querySelector('.game-container');
        
        // Use the enhanced compatibility warning system
        this.errorHandler.showCompatibilityWarnings(container);
        
        // Additional game-specific checks
        this.checkGameSpecificCompatibility(container);
    }

    // Check game-specific compatibility issues
    checkGameSpecificCompatibility(container) {
        if (!this.errorHandler) return;

        const support = this.errorHandler.browserSupport;
        const additionalWarnings = [];

        // Check for performance-related issues
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2) {
            additionalWarnings.push({
                type: 'performance_warning',
                title: '성능 경고 ⚡',
                message: '기기 성능이 낮아 게임이 느려질 수 있습니다.',
                suggestions: [
                    '참가자 수를 10명 이하로 제한',
                    '다른 앱이나 탭 닫기',
                    '애니메이션 효과 줄이기'
                ],
                severity: 'info'
            });
        }

        // Check memory constraints
        if (performance.memory && performance.memory.jsHeapSizeLimit < 1073741824) { // Less than 1GB
            additionalWarnings.push({
                type: 'memory_warning',
                title: '메모리 제한 🧠',
                message: '사용 가능한 메모리가 제한적입니다.',
                suggestions: [
                    '참가자 수를 15명 이하로 제한',
                    '다른 브라우저 탭 닫기',
                    '브라우저 재시작'
                ],
                severity: 'info'
            });
        }

        // Show additional warnings after main compatibility warnings
        setTimeout(() => {
            additionalWarnings.forEach(warning => {
                this.errorHandler.showErrorMessage(container, warning);
            });
        }, 3000);
    }

    // Loading state methods for better UX
    showLoadingState(button, message) {
        if (!button) return;
        
        button.classList.add('loading');
        button.disabled = true;
        
        // Store original content
        button.dataset.originalContent = button.innerHTML;
        
        // Show loading message with spinner
        button.innerHTML = `
            <span class="loading-spinner"></span>
            <span class="loading-text">${message}</span>
        `;
        
        // Add loading spinner styles if not already added
        if (!document.querySelector('#loading-spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-spinner-styles';
            style.textContent = `
                .loading-spinner {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: loadingSpin 1s linear infinite;
                    margin-right: 0.5rem;
                }
                
                @keyframes loadingSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-text {
                    opacity: 0.9;
                }
                
                .btn.loading {
                    pointer-events: none;
                    opacity: 0.8;
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoadingState(button, icon, text) {
        if (!button) return;
        
        button.classList.remove('loading');
        button.disabled = false;
        
        // Restore original content or use provided content
        if (icon && text) {
            button.innerHTML = `<span class="btn-icon">${icon}</span> ${text}`;
        } else if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            delete button.dataset.originalContent;
        }
    }

    // Enhanced user feedback methods
    showSuccessMessage(message, container) {
        this.showMessage(message, 'success', container);
    }

    showErrorMessage(message, container) {
        this.showMessage(message, 'error', container);
    }

    showInfoMessage(message, container) {
        this.showMessage(message, 'info', container);
    }

    showMessage(message, type, container) {
        if (!container) {
            container = document.querySelector('.game-container');
        }
        
        if (!container) return;
        
        // Remove existing messages
        const existingMessages = container.querySelectorAll('.user-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `user-message user-message-${type}`;
        
        let icon = '💬';
        let bgColor = 'var(--primary-gradient)';
        
        switch (type) {
            case 'success':
                icon = '✅';
                bgColor = 'var(--success-gradient)';
                break;
            case 'error':
                icon = '❌';
                bgColor = 'var(--danger-gradient)';
                break;
            case 'info':
                icon = 'ℹ️';
                bgColor = 'var(--primary-gradient)';
                break;
        }
        
        messageEl.innerHTML = `
            <span class="message-icon">${icon}</span>
            <span class="message-text">${message}</span>
        `;
        
        messageEl.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            margin: 1rem 0;
            background: ${bgColor};
            color: white;
            border-radius: var(--radius-large);
            font-weight: 600;
            box-shadow: var(--shadow-soft);
            animation: messageSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: relative;
            overflow: hidden;
        `;
        
        // Add shimmer effect
        messageEl.innerHTML += `
            <div style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: messageShimmer 2s ease-in-out infinite;
            "></div>
        `;
        
        // Add animation styles if not already added
        if (!document.querySelector('#message-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'message-animation-styles';
            style.textContent = `
                @keyframes messageSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes messageShimmer {
                    0% { left: -100%; }
                    50% { left: 100%; }
                    100% { left: 100%; }
                }
                
                .message-icon {
                    font-size: 1.2rem;
                    animation: messageIconFloat 3s ease-in-out infinite;
                }
                
                @keyframes messageIconFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-2px) rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.insertBefore(messageEl, container.firstChild);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'messageSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                }, 300);
            }
        }, type === 'error' ? 5000 : 3000);
        
        // Add slide out animation
        if (!document.querySelector('#message-slideout-styles')) {
            const style = document.createElement('style');
            style.id = 'message-slideout-styles';
            style.textContent = `
                @keyframes messageSlideOut {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupEventListeners() {
        // Setup form submission
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSetupSubmit();
            });
        }

        // Slot count input validation
        const slotCountInput = document.getElementById('slotCount');
        if (slotCountInput) {
            slotCountInput.addEventListener('input', () => {
                this.validateSlotCount();
            });
            
            slotCountInput.addEventListener('blur', () => {
                this.validateSlotCount();
            });
        }

        // Reset setup button
        const resetSetupBtn = document.getElementById('resetSetupBtn');
        if (resetSetupBtn) {
            resetSetupBtn.addEventListener('click', () => {
                this.resetSetup();
            });
        }

        // Start game button
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Save game button
        const saveGameBtn = document.getElementById('saveGameBtn');
        if (saveGameBtn) {
            saveGameBtn.addEventListener('click', () => {
                this.handleSaveGame();
            });
        }

        // Randomize button
        const randomizeBtn = document.getElementById('randomizeBtn');
        if (randomizeBtn) {
            randomizeBtn.addEventListener('click', () => {
                this.randomizeWithSameSlots();
            });
        }
    }

    validateSlotCount() {
        const slotCountInput = document.getElementById('slotCount');
        const errorElement = document.getElementById('slotCountError');
        
        if (!slotCountInput || !errorElement) return false;

        // Clear previous error
        errorElement.textContent = '';
        slotCountInput.classList.remove('error');

        // Use enhanced error handler validation if available
        if (this.errorHandler) {
            const validation = this.errorHandler.validateSlotCount(slotCountInput.value);
            
            if (!validation.isValid) {
                const errorMessages = validation.errors
                    .filter(error => error.severity === 'error')
                    .map(error => error.message);
                
                if (errorMessages.length > 0) {
                    errorElement.textContent = errorMessages[0];
                    slotCountInput.classList.add('error');
                }
            }

            // Show warnings separately
            const warnings = validation.errors.filter(error => error.severity === 'warning');
            if (warnings.length > 0) {
                setTimeout(() => {
                    this.showInfoMessage(warnings[0].message);
                }, 100);
            }

            return validation.isValid;
        }

        // Fallback validation for when error handler is not available
        const value = parseInt(slotCountInput.value);
        let isValid = true;
        let errorMessage = '';

        if (isNaN(value)) {
            if (slotCountInput.value.trim() !== '') {
                errorMessage = '숫자를 입력해주세요 🔢';
                isValid = false;
            }
        } else if (value < 2) {
            errorMessage = '최소 2명 이상이어야 합니다 👥';
            isValid = false;
        } else if (value > 20) {
            errorMessage = '최대 20명까지 가능합니다 📊';
            isValid = false;
        }

        if (!isValid) {
            errorElement.textContent = errorMessage;
            slotCountInput.classList.add('error');
        }

        return isValid;
    }

    handleSetupSubmit() {
        if (!this.validateSlotCount()) {
            return;
        }

        const slotCountInput = document.getElementById('slotCount');
        const setupBtn = document.querySelector('.setup-btn');
        const count = parseInt(slotCountInput.value);
        
        // Add loading state
        this.showLoadingState(setupBtn, '게임 준비 중...');
        
        // Simulate setup delay for better UX
        setTimeout(() => {
            this.setSlotCount(count);
            this.showSlotsSetup();
            this.hideLoadingState(setupBtn, '🚀', '게임 시작하기');
        }, 800);
    }

    setSlotCount(count) {
        this.slotCount = count;
        this.topSlots = new Array(count).fill('');
        this.bottomSlots = new Array(count).fill('');
        this.currentSlotIndex = 0;
        this.currentSlotType = 'top';
        this.gameState = 'input';
        
        console.log(`Slot count set to: ${count}`);
    }

    showSlotsSetup() {
        const setupDiv = document.getElementById('ladderSetup');
        const slotsDiv = document.getElementById('slotsSetup');
        
        if (setupDiv && slotsDiv) {
            setupDiv.style.display = 'none';
            slotsDiv.style.display = 'block';
            
            this.generateSlots();
            this.initializeSlotInput();
        }
    }

    generateSlots() {
        this.generateTopSlots();
        this.generateBottomSlots();
        this.updateGameState();
    }

    initializeSlotInput() {
        // Create container for slot input component
        const slotsDiv = document.getElementById('slotsSetup');
        if (!slotsDiv) return;

        // Find the slots-actions div to insert input component before it
        const slotsActions = slotsDiv.querySelector('.slots-actions');
        if (!slotsActions) return;

        // Create container for slot input
        const inputContainer = document.createElement('div');
        inputContainer.id = 'slotInputContainer';
        
        // Insert before slots-actions
        slotsDiv.insertBefore(inputContainer, slotsActions);

        // Initialize SlotInput component
        this.slotInput = new SlotInput(inputContainer, (data) => {
            this.handleSlotInputCallback(data);
        });

        // Activate the slot input
        this.slotInput.activate(this.slotCount, 'top', 0);
    }

    handleSlotInputCallback(data) {
        switch (data.action) {
            case 'add':
                this.addSlotContent(data.content, data.type, data.index);
                this.updateSlotDisplay(data.type, data.index);
                this.updateGameState();
                // Notify SlotInput that display is updated so it can update progress
                if (this.slotInput) {
                    this.slotInput.updateProgress();
                }
                break;
            
            case 'delete':
                this.deleteSlotContent(data.type, data.index);
                break;
            
            case 'get_content':
                const content = data.type === 'top' ? this.topSlots[data.index] : this.bottomSlots[data.index];
                this.slotInput.setInputContent(content);
                break;
            
            case 'complete':
                console.log('All slots filled via input component');
                this.updateGameState();
                break;
        }
    }

    generateTopSlots() {
        const container = document.getElementById('topSlots');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < this.slotCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot empty';
            slot.dataset.index = i;
            slot.dataset.type = 'top';
            slot.textContent = `참가자 ${i + 1}`;
            
            slot.addEventListener('click', () => {
                this.editSlot('top', i);
            });
            
            container.appendChild(slot);
        }
    }

    generateBottomSlots() {
        const container = document.getElementById('bottomSlots');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < this.slotCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot empty';
            slot.dataset.index = i;
            slot.dataset.type = 'bottom';
            slot.textContent = `결과 ${i + 1}`;
            
            slot.addEventListener('click', () => {
                this.editSlot('bottom', i);
            });
            
            container.appendChild(slot);
        }
    }

    editSlot(type, index) {
        // If SlotInput component is available, use it for editing
        if (this.slotInput && this.slotInput.isActive) {
            this.slotInput.editSlot(type, index);
            return;
        }

        // Fallback to inline editing if SlotInput is not available
        const slot = document.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        if (!slot) return;

        // Prevent editing if slot is already being edited
        if (slot.classList.contains('editing')) {
            return;
        }

        const currentValue = type === 'top' ? this.topSlots[index] : this.bottomSlots[index];
        const placeholder = type === 'top' ? `참가자 ${index + 1} 이름` : `결과 ${index + 1}`;
        
        // Store original content for cancel functionality
        slot.dataset.originalContent = currentValue;
        
        // Create input container with delete button
        const inputContainer = document.createElement('div');
        inputContainer.className = 'slot-edit-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.placeholder = placeholder;
        input.className = 'slot-edit-input';
        input.maxLength = 20; // Limit input length

        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'slot-edit-actions';
        actionsContainer.style.cssText = `
            display: flex;
            gap: 0.25rem;
            align-items: center;
            flex-shrink: 0;
        `;

        // Create delete button for filled slots
        if (currentValue && currentValue.trim() !== '') {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.className = 'slot-delete-btn';
            deleteBtn.title = '내용 삭제 (Ctrl+Del)';
            deleteBtn.type = 'button';

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSlotContent(type, index);
            });

            actionsContainer.appendChild(deleteBtn);
        }

        // Create confirm button
        const confirmBtn = document.createElement('button');
        confirmBtn.innerHTML = '✅';
        confirmBtn.className = 'slot-confirm-btn';
        confirmBtn.title = '확인 (Enter)';
        confirmBtn.type = 'button';
        confirmBtn.style.cssText = `
            background: #28a745;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        confirmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            finishEdit();
        });

        // Create cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '❌';
        cancelBtn.className = 'slot-cancel-btn';
        cancelBtn.title = '취소 (Esc)';
        cancelBtn.type = 'button';
        cancelBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelEdit();
        });

        actionsContainer.appendChild(confirmBtn);
        actionsContainer.appendChild(cancelBtn);

        inputContainer.appendChild(input);
        inputContainer.appendChild(actionsContainer);

        slot.innerHTML = '';
        slot.appendChild(inputContainer);
        slot.classList.add('active', 'editing');
        
        // Add editing visual feedback
        this.showSlotFeedback(type, index, 'editing');
        
        input.focus();
        input.select();

        const finishEdit = () => {
            const value = input.value.trim();
            const previousValue = slot.dataset.originalContent || '';
            
            // Only update if value changed
            if (value !== previousValue) {
                this.addSlotContent(value, type, index);
            }
            
            slot.classList.remove('editing');
            this.updateSlotDisplay(type, index);
            this.updateGameState();
            
            // Clear original content
            delete slot.dataset.originalContent;
        };

        const cancelEdit = () => {
            slot.classList.remove('editing');
            this.updateSlotDisplay(type, index);
            
            // Clear original content
            delete slot.dataset.originalContent;
        };

        // Enhanced keyboard handling
        input.addEventListener('keydown', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            } else if (e.key === 'Delete' && e.ctrlKey) {
                e.preventDefault();
                this.deleteSlotContent(type, index);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                finishEdit();
                // Move to next slot for editing
                this.moveToNextSlotForEditing(type, index);
            }
        });

        // Handle blur event with delay to allow button clicks
        let blurTimeout;
        input.addEventListener('blur', (e) => {
            blurTimeout = setTimeout(() => {
                // Check if focus moved to one of our action buttons
                const activeElement = document.activeElement;
                if (!activeElement || 
                    (!activeElement.classList.contains('slot-delete-btn') &&
                     !activeElement.classList.contains('slot-confirm-btn') &&
                     !activeElement.classList.contains('slot-cancel-btn'))) {
                    finishEdit();
                }
            }, 100);
        });

        // Clear blur timeout if focus returns to input
        input.addEventListener('focus', () => {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
        });

        // Add hover effects to action buttons
        [confirmBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    deleteSlotContent(type, index) {
        // Clear the slot content
        if (type === 'top') {
            this.topSlots[index] = '';
        } else if (type === 'bottom') {
            this.bottomSlots[index] = '';
        }

        // Update display and game state
        this.updateSlotDisplay(type, index);
        this.updateGameState();

        // Update SlotInput progress if active
        if (this.slotInput && this.slotInput.isActive) {
            this.slotInput.updateProgress();
        }

        // Show feedback
        this.showSlotFeedback(type, index, 'deleted');
        
        console.log(`Deleted slot content: type: ${type}, index: ${index}`);
    }

    showSlotFeedback(type, index, action) {
        const slot = document.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        if (!slot) return;

        // Remove any existing feedback first
        const existingFeedback = slot.querySelector('.slot-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'slot-feedback';
        
        let message = '';
        let className = '';
        let backgroundColor = '';
        
        switch (action) {
            case 'deleted':
                message = '삭제됨';
                className = 'feedback-delete';
                backgroundColor = '#dc3545';
                break;
            case 'updated':
                message = '수정됨';
                className = 'feedback-update';
                backgroundColor = '#ffc107';
                break;
            case 'added':
                message = '추가됨';
                className = 'feedback-add';
                backgroundColor = '#28a745';
                break;
            case 'editing':
                message = '편집 중';
                className = 'feedback-editing';
                backgroundColor = '#17a2b8';
                break;
        }

        feedback.textContent = message;
        feedback.className = `slot-feedback ${className}`;
        feedback.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${backgroundColor};
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            z-index: 10;
            animation: ${action === 'editing' ? 'feedbackStay 0.3s ease-out forwards' : 'feedbackPop 2s ease-out forwards'};
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        // Add animation keyframes if not already added
        if (!document.querySelector('#slot-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'slot-feedback-styles';
            style.textContent = `
                @keyframes feedbackPop {
                    0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
                    20% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
                    40% { transform: translateX(-50%) translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.9); }
                }
                @keyframes feedbackStay {
                    0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
                    100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        slot.style.position = 'relative';
        slot.appendChild(feedback);

        // Remove feedback after animation (except for editing feedback)
        if (action !== 'editing') {
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 2000);
        }
    }

    moveToNextSlotForEditing(currentType, currentIndex) {
        let nextType = currentType;
        let nextIndex = currentIndex;

        // Calculate next slot position
        if (currentType === 'top') {
            if (currentIndex < this.slotCount - 1) {
                nextIndex = currentIndex + 1;
            } else {
                // Move to bottom slots
                nextType = 'bottom';
                nextIndex = 0;
            }
        } else if (currentType === 'bottom') {
            if (currentIndex < this.slotCount - 1) {
                nextIndex = currentIndex + 1;
            } else {
                // Wrap around to first top slot
                nextType = 'top';
                nextIndex = 0;
            }
        }

        // Start editing the next slot after a short delay
        setTimeout(() => {
            this.editSlot(nextType, nextIndex);
        }, 100);
    }

    addSlotContent(content, type, index) {
        // Enhanced content validation
        if (this.errorHandler) {
            const validation = this.errorHandler.validateSlotContent(content);
            
            if (!validation.isValid) {
                const errorMessages = validation.errors
                    .filter(error => error.severity === 'error')
                    .map(error => error.message);
                
                if (errorMessages.length > 0) {
                    this.showErrorMessage(errorMessages[0]);
                    return false;
                }
            }

            // Show warnings for problematic characters
            const warnings = validation.errors.filter(error => error.severity === 'warning');
            if (warnings.length > 0) {
                this.showInfoMessage(warnings[0].message);
            }

            // Use validated content
            content = validation.value;
        }

        const previousContent = type === 'top' ? this.topSlots[index] : this.bottomSlots[index];
        const hadContent = previousContent && previousContent.trim() !== '';
        
        // Check for duplicates
        const duplicateInfo = this.checkForDuplicateContent(content, type, index);
        if (duplicateInfo.hasDuplicate) {
            this.showInfoMessage(`⚠️ "${content}"는 이미 ${duplicateInfo.location}에 있습니다`);
        }
        
        if (type === 'top') {
            this.topSlots[index] = content;
        } else if (type === 'bottom') {
            this.bottomSlots[index] = content;
        }
        
        // Show appropriate feedback
        if (content && content.trim() !== '') {
            if (hadContent) {
                this.showSlotFeedback(type, index, 'updated');
            } else {
                this.showSlotFeedback(type, index, 'added');
            }
        }
        
        console.log(`Added slot content: ${content}, type: ${type}, index: ${index}`);
        return true;
    }

    // Check for duplicate content across slots
    checkForDuplicateContent(content, currentType, currentIndex) {
        if (!content || content.trim() === '') {
            return { hasDuplicate: false };
        }

        const trimmedContent = content.trim().toLowerCase();
        
        // Check top slots
        for (let i = 0; i < this.topSlots.length; i++) {
            if (currentType === 'top' && i === currentIndex) continue;
            
            const slotContent = this.topSlots[i];
            if (slotContent && slotContent.trim().toLowerCase() === trimmedContent) {
                return {
                    hasDuplicate: true,
                    location: `참가자 ${i + 1}`,
                    type: 'top',
                    index: i
                };
            }
        }

        // Check bottom slots
        for (let i = 0; i < this.bottomSlots.length; i++) {
            if (currentType === 'bottom' && i === currentIndex) continue;
            
            const slotContent = this.bottomSlots[i];
            if (slotContent && slotContent.trim().toLowerCase() === trimmedContent) {
                return {
                    hasDuplicate: true,
                    location: `결과 ${i + 1}`,
                    type: 'bottom',
                    index: i
                };
            }
        }

        return { hasDuplicate: false };
    }

    updateSlotDisplay(type, index) {
        const slot = document.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        if (!slot) return;

        const content = type === 'top' ? this.topSlots[index] : this.bottomSlots[index];
        const defaultText = type === 'top' ? `참가자 ${index + 1}` : `결과 ${index + 1}`;
        
        slot.classList.remove('active');
        
        if (content && content.trim() !== '') {
            slot.classList.remove('empty');
            slot.classList.add('filled');
            slot.textContent = content;
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.textContent = defaultText;
        }
    }

    updateGameState() {
        const allTopFilled = this.topSlots.every(slot => slot && slot.trim() !== '');
        const allBottomFilled = this.bottomSlots.every(slot => slot && slot.trim() !== '');
        const allSlotsFilled = allTopFilled && allBottomFilled;
        
        // Check for duplicates
        const duplicateWarnings = this.checkForDuplicates();
        
        // Update validation status display
        this.updateValidationStatus(allTopFilled, allBottomFilled, duplicateWarnings);
        
        const startGameBtn = document.getElementById('startGameBtn');
        const saveGameBtn = document.getElementById('saveGameBtn');
        const randomizeBtn = document.getElementById('randomizeBtn');
        
        if (startGameBtn) {
            if (allSlotsFilled) {
                startGameBtn.disabled = false;
                startGameBtn.classList.remove('btn-secondary');
                startGameBtn.classList.add('btn-primary');
                this.gameState = 'ready';
                
                // Update button text based on duplicates
                const btnText = startGameBtn.querySelector('.btn-text') || startGameBtn;
                if (duplicateWarnings.length > 0) {
                    btnText.innerHTML = '<span class="btn-icon">⚠️</span> 중복 있음 - 사다리 생성하기';
                    startGameBtn.title = '중복된 내용이 있습니다: ' + duplicateWarnings.join(', ');
                    startGameBtn.classList.add('btn-warning');
                } else {
                    btnText.innerHTML = '<span class="btn-icon">🎲</span> 사다리 생성하기';
                    startGameBtn.title = '모든 슬롯이 채워졌습니다. 사다리를 생성할 수 있습니다!';
                    startGameBtn.classList.remove('btn-warning');
                }
            } else {
                startGameBtn.disabled = true;
                startGameBtn.classList.remove('btn-primary', 'btn-warning');
                startGameBtn.classList.add('btn-secondary');
                this.gameState = 'input';
                
                const btnText = startGameBtn.querySelector('.btn-text') || startGameBtn;
                btnText.innerHTML = '<span class="btn-icon">🎲</span> 사다리 생성하기';
                
                // Calculate missing slots for tooltip
                const emptyTopSlots = this.topSlots.filter(slot => !slot || slot.trim() === '').length;
                const emptyBottomSlots = this.bottomSlots.filter(slot => !slot || slot.trim() === '').length;
                const totalEmpty = emptyTopSlots + emptyBottomSlots;
                
                startGameBtn.title = `${totalEmpty}개의 슬롯을 더 채워주세요 (참가자: ${emptyTopSlots}개, 결과: ${emptyBottomSlots}개)`;
            }
        }

        // Update save game button
        if (saveGameBtn) {
            saveGameBtn.disabled = !allSlotsFilled;
            if (allSlotsFilled) {
                saveGameBtn.title = '현재 게임 설정을 저장합니다';
            } else {
                saveGameBtn.title = '모든 슬롯을 채운 후 저장할 수 있습니다';
            }
        }

        // Update randomize button
        if (randomizeBtn) {
            randomizeBtn.disabled = !allSlotsFilled;
            if (allSlotsFilled) {
                randomizeBtn.title = '같은 슬롯으로 새로운 사다리를 생성합니다';
            } else {
                randomizeBtn.title = '모든 슬롯을 채운 후 사용할 수 있습니다';
            }
        }
        
        // Update slot validation display
        this.updateSlotValidation();
    }

    updateValidationStatus(allTopFilled, allBottomFilled, duplicateWarnings) {
        // Create or update validation status display
        let statusContainer = document.getElementById('validationStatus');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.id = 'validationStatus';
            statusContainer.className = 'validation-status';
            
            // Insert before slots actions
            const slotsActions = document.querySelector('.slots-actions');
            if (slotsActions && slotsActions.parentNode) {
                slotsActions.parentNode.insertBefore(statusContainer, slotsActions);
            }
        }

        // Calculate completion stats
        const filledTopSlots = this.topSlots.filter(slot => slot && slot.trim() !== '').length;
        const filledBottomSlots = this.bottomSlots.filter(slot => slot && slot.trim() !== '').length;
        const totalFilled = filledTopSlots + filledBottomSlots;
        const totalSlots = this.slotCount * 2;
        const completionPercent = Math.round((totalFilled / totalSlots) * 100);

        let statusHTML = '';
        let statusClass = '';

        if (allTopFilled && allBottomFilled) {
            if (duplicateWarnings.length > 0) {
                statusClass = 'status-warning';
                statusHTML = `
                    <div class="status-icon">⚠️</div>
                    <div class="status-content">
                        <div class="status-title">모든 슬롯 완료 - 중복 발견</div>
                        <div class="status-message">중복된 내용: ${duplicateWarnings.join(', ')}</div>
                    </div>
                `;
            } else {
                statusClass = 'status-success';
                statusHTML = `
                    <div class="status-icon">✅</div>
                    <div class="status-content">
                        <div class="status-title">모든 슬롯 완료!</div>
                        <div class="status-message">사다리를 생성할 준비가 되었습니다</div>
                    </div>
                `;
            }
        } else {
            statusClass = 'status-progress';
            const emptyTopSlots = this.slotCount - filledTopSlots;
            const emptyBottomSlots = this.slotCount - filledBottomSlots;
            
            statusHTML = `
                <div class="status-icon">📝</div>
                <div class="status-content">
                    <div class="status-title">진행률: ${completionPercent}% (${totalFilled}/${totalSlots})</div>
                    <div class="status-message">
                        ${emptyTopSlots > 0 ? `참가자 ${emptyTopSlots}개` : ''}
                        ${emptyTopSlots > 0 && emptyBottomSlots > 0 ? ', ' : ''}
                        ${emptyBottomSlots > 0 ? `결과 ${emptyBottomSlots}개` : ''} 
                        ${emptyTopSlots > 0 || emptyBottomSlots > 0 ? '더 입력해주세요' : ''}
                    </div>
                    <div class="status-progress-bar">
                        <div class="status-progress-fill" style="width: ${completionPercent}%"></div>
                    </div>
                </div>
            `;
        }

        statusContainer.className = `validation-status ${statusClass}`;
        statusContainer.innerHTML = statusHTML;
    }

    checkForDuplicates() {
        const duplicates = [];
        const allContents = [...this.topSlots, ...this.bottomSlots];
        const contentCounts = {};
        
        // Count occurrences of each content
        allContents.forEach(content => {
            if (content && content.trim() !== '') {
                const trimmed = content.trim().toLowerCase();
                contentCounts[trimmed] = (contentCounts[trimmed] || 0) + 1;
            }
        });
        
        // Find duplicates
        Object.keys(contentCounts).forEach(content => {
            if (contentCounts[content] > 1) {
                duplicates.push(content);
            }
        });
        
        return duplicates;
    }

    updateSlotValidation() {
        const duplicates = this.checkForDuplicates();
        const allSlots = document.querySelectorAll('.slot');
        
        // Clear previous duplicate warnings
        allSlots.forEach(slot => {
            slot.classList.remove('duplicate-warning');
            const warning = slot.querySelector('.duplicate-indicator');
            if (warning) {
                warning.remove();
            }
        });
        
        // Add duplicate warnings
        if (duplicates.length > 0) {
            allSlots.forEach(slot => {
                const content = slot.textContent.trim().toLowerCase();
                if (duplicates.includes(content)) {
                    slot.classList.add('duplicate-warning');
                    
                    // Add duplicate indicator
                    const indicator = document.createElement('div');
                    indicator.className = 'duplicate-indicator';
                    indicator.innerHTML = '⚠️';
                    indicator.title = '중복된 내용입니다';
                    indicator.style.cssText = `
                        position: absolute;
                        top: -8px;
                        left: -8px;
                        background: #ffc107;
                        color: #856404;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.7rem;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        z-index: 5;
                    `;
                    
                    slot.style.position = 'relative';
                    slot.appendChild(indicator);
                }
            });
        }
    }

    resetSetup() {
        const setupDiv = document.getElementById('ladderSetup');
        const slotsDiv = document.getElementById('slotsSetup');
        const slotCountInput = document.getElementById('slotCount');
        const errorElement = document.getElementById('slotCountError');
        
        // Deactivate SlotInput component if it exists
        if (this.slotInput) {
            this.slotInput.deactivate();
            this.slotInput = null;
        }
        
        // Remove SlotInput container if it exists
        const inputContainer = document.getElementById('slotInputContainer');
        if (inputContainer && inputContainer.parentNode) {
            inputContainer.parentNode.removeChild(inputContainer);
        }
        
        // Reset form
        if (slotCountInput) {
            slotCountInput.value = '';
            slotCountInput.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        // Reset game state
        this.slotCount = 0;
        this.topSlots = [];
        this.bottomSlots = [];
        this.currentSlotIndex = 0;
        this.currentSlotType = 'top';
        this.gameState = 'setup';
        
        // Show setup form
        if (setupDiv && slotsDiv) {
            setupDiv.style.display = 'block';
            slotsDiv.style.display = 'none';
        }
        
        console.log('Setup reset');
    }

    startGame() {
        try {
            if (this.gameState !== 'ready') {
                console.log('Game not ready to start');
                throw new Error('게임이 시작할 준비가 되지 않았습니다');
            }

            // Always validate game state, even without error handler
            const allTopFilled = this.topSlots.every(slot => slot && slot.trim() !== '');
            const allBottomFilled = this.bottomSlots.every(slot => slot && slot.trim() !== '');
            
            if (!allTopFilled || !allBottomFilled) {
                const emptyTopSlots = this.topSlots.filter(slot => !slot || slot.trim() === '').length;
                const emptyBottomSlots = this.bottomSlots.filter(slot => !slot || slot.trim() === '').length;
                const errorMessage = `게임을 시작할 수 없습니다. ${emptyTopSlots + emptyBottomSlots}개의 빈 슬롯이 있습니다.`;
                
                this.showErrorMessage(errorMessage);
                throw new Error(errorMessage);
            }

            // Enhanced validation using error handler if available
            if (this.errorHandler) {
                const gameData = {
                    slotCount: this.slotCount,
                    topSlots: this.topSlots,
                    bottomSlots: this.bottomSlots
                };
                
                const validation = this.errorHandler.validateGameState(gameData);
                
                if (!validation.isValid) {
                    const errorMessages = validation.errors
                        .filter(error => error.severity === 'error')
                        .map(error => error.message);
                    
                    if (errorMessages.length > 0) {
                        this.showErrorMessage(errorMessages[0]);
                        throw new Error(errorMessages[0]);
                    }
                }

                // Show warnings if any
                const warnings = validation.errors.filter(error => error.severity === 'warning');
                warnings.forEach(warning => {
                    this.showInfoMessage(warning.message);
                });
            }

            const startGameBtn = document.getElementById('startGameBtn');
            
            // Show loading state with cute animation
            this.showLoadingState(startGameBtn, '🎲 사다리 생성 중...');
            
            // Add cute success message
            this.showSuccessMessage('🎉 사다리를 생성하고 있어요!');
            
            this.gameState = 'playing';
            console.log('Starting ladder game with:', {
                topSlots: this.topSlots,
                bottomSlots: this.bottomSlots,
                count: this.slotCount
            });
            
            // Simulate ladder generation delay for better UX
            setTimeout(() => {
                try {
                    // Generate ladder connections
                    this.generateLadder();
                    
                    // Show ladder display
                    this.showLadderDisplay();
                    
                    // Hide loading state
                    this.hideLoadingState(startGameBtn, '🎲', '사다리 생성하기');
                    
                    // Show completion message
                    this.showSuccessMessage('✨사다리가 완성되었어요! 위쪽 슬롯을 클릭해서 결과를 확인해보세요!');
                    
                    console.log('Game started successfully');
                } catch (error) {
                    this.handleGameStartError(error, startGameBtn);
                }
            }, 1200);

        } catch (error) {
            console.error('Error starting game:', error);
            this.handleGameStartError(error);
        }
    }

    // Handle errors during game start
    handleGameStartError(error, startBtn = null) {
        console.error('Game start error:', error);
        
        if (this.errorHandler) {
            this.errorHandler.logError('Game Start Error', {
                message: error.message,
                stack: error.stack,
                gameState: this.gameState,
                slotCount: this.slotCount
            });
        }

        // Hide loading state
        if (startBtn) {
            this.hideLoadingState(startBtn, '🎲', '사다리 생성하기');
        }

        // Show user-friendly error message
        let errorMessage = '게임 시작 중 오류가 발생했습니다 😅';
        
        if (error.message.includes('memory') || error.message.includes('Memory')) {
            errorMessage = '메모리가 부족합니다. 참가자 수를 줄이거나 페이지를 새로고침해주세요 🧠';
        } else if (error.message.includes('canvas') || error.message.includes('Canvas')) {
            errorMessage = '그래픽 렌더링에 문제가 있습니다. 대체 방식으로 표시합니다 🎨';
        }

        this.showErrorMessage(errorMessage);

        // Reset game state
        this.gameState = 'ready';
    }

    generateLadder() {
        // Generate random connections between top and bottom slots
        this.connections = this.generateRandomConnections();
        
        // Generate ladder structure with horizontal bars
        this.ladderStructure = this.generateLadderStructure();
        
        console.log('Ladder generated:', {
            connections: this.connections,
            structure: this.ladderStructure
        });
    }

    generateRandomConnections() {
        // Create a shuffled array to ensure each top slot connects to exactly one bottom slot
        const bottomIndices = Array.from({length: this.slotCount}, (_, i) => i);
        
        // Fisher-Yates shuffle algorithm
        for (let i = bottomIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bottomIndices[i], bottomIndices[j]] = [bottomIndices[j], bottomIndices[i]];
        }
        
        return bottomIndices;
    }

    generateLadderStructure() {
        const structure = {
            verticalLines: this.slotCount,
            horizontalBars: [],
            paths: []
        };
        
        // Generate random horizontal bars between vertical lines
        const numLevels = Math.max(5, this.slotCount * 2); // At least 5 levels, more for larger ladders
        
        for (let level = 0; level < numLevels; level++) {
            const levelBars = [];
            let i = 0;
            
            while (i < this.slotCount - 1) {
                // Random chance to place a horizontal bar
                if (Math.random() < 0.4) { // 40% chance for each possible position
                    levelBars.push(i);
                    i += 2; // Skip next position to avoid overlapping bars
                } else {
                    i++;
                }
            }
            
            if (levelBars.length > 0) {
                structure.horizontalBars.push({
                    level: level,
                    bars: levelBars
                });
            }
        }
        
        // Generate paths from top to bottom
        structure.paths = this.generatePaths(structure.horizontalBars, numLevels);
        
        return structure;
    }

    generatePaths(horizontalBars, numLevels) {
        const paths = [];
        
        for (let startIndex = 0; startIndex < this.slotCount; startIndex++) {
            const pathSegments = this.tracePath(startIndex, horizontalBars, numLevels);
            const finalPosition = this.getFinalPosition(pathSegments);
            
            paths.push({
                start: startIndex,
                end: finalPosition,
                segments: pathSegments
            });
        }
        
        return paths;
    }

    getFinalPosition(segments) {
        // Find the final position by looking at the last vertical segment
        const lastVerticalSegment = segments.filter(s => s.type === 'vertical').pop();
        return lastVerticalSegment ? lastVerticalSegment.x : 0;
    }

    tracePath(startIndex, horizontalBars, numLevels) {
        const segments = [];
        let currentPosition = startIndex;
        
        // Start with vertical segment from top
        segments.push({
            type: 'vertical',
            x: currentPosition,
            y1: 0,
            y2: 1
        });
        
        // Process each level
        for (let level = 0; level < numLevels; level++) {
            const levelData = horizontalBars.find(h => h.level === level);
            
            if (levelData) {
                // Check if there's a horizontal bar at current position
                const barAtLeft = levelData.bars.includes(currentPosition - 1);
                const barAtRight = levelData.bars.includes(currentPosition);
                
                if (barAtRight) {
                    // Move right
                    segments.push({
                        type: 'horizontal',
                        x1: currentPosition,
                        x2: currentPosition + 1,
                        y: level + 1
                    });
                    currentPosition++;
                } else if (barAtLeft) {
                    // Move left
                    segments.push({
                        type: 'horizontal',
                        x1: currentPosition - 1,
                        x2: currentPosition,
                        y: level + 1
                    });
                    currentPosition--;
                }
            }
            
            // Add vertical segment to next level
            if (level < numLevels - 1) {
                segments.push({
                    type: 'vertical',
                    x: currentPosition,
                    y1: level + 1,
                    y2: level + 2
                });
            }
        }
        
        // Final vertical segment to bottom
        segments.push({
            type: 'vertical',
            x: currentPosition,
            y1: numLevels,
            y2: numLevels + 1
        });
        
        return segments;
    }

    showLadderDisplay() {
        // Hide slots setup and show ladder display
        const slotsDiv = document.getElementById('slotsSetup');
        if (slotsDiv) {
            slotsDiv.style.display = 'none';
        }
        
        // Create simple ladder display
        this.createSimpleLadderDisplay();
    }

    createLadderDisplay() {
        let ladderContainer = document.getElementById('ladderDisplay');
        
        if (!ladderContainer) {
            ladderContainer = document.createElement('div');
            ladderContainer.id = 'ladderDisplay';
            ladderContainer.className = 'ladder-display';
            
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.appendChild(ladderContainer);
            }
        }
        
        ladderContainer.innerHTML = `
            <div class="ladder-header">
                <h3 class="ladder-title">🎲 사다리타기 결과</h3>
                <p class="ladder-description">위쪽 참가자를 클릭하여 결과를 확인하세요!</p>
            </div>
            
            <div class="ladder-slots-top">
                ${this.topSlots.map((slot, index) => `
                    <div class="ladder-slot top-slot" data-index="${index}">
                        <span class="slot-content">${slot}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="ladder-canvas-container">
                <canvas id="ladderCanvas" class="ladder-canvas"></canvas>
            </div>
            
            <div class="ladder-slots-bottom">
                ${this.bottomSlots.map((slot, index) => `
                    <div class="ladder-slot bottom-slot" data-index="${index}">
                        <span class="slot-content">${slot}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="ladder-controls">
                <button class="btn btn-primary" id="revealAllBtn">
                    <span class="btn-icon">🎯</span>
                    한번에 열기
                </button>
                <button class="btn btn-secondary" id="resetLadderBtn">
                    <span class="btn-icon">🔄</span>
                    새로 만들기
                </button>
                <button class="btn btn-secondary" id="backToSetupBtn">
                    <span class="btn-icon">⬅️</span>
                    설정으로 돌아가기
                </button>
            </div>
        `;
        
        ladderContainer.style.display = 'block';
        
        // Setup event listeners for ladder display
        this.setupLadderEventListeners();
    }

    createCompactLadderDisplay() {
        // Create or get ladder display container
        let ladderContainer = document.getElementById('ladderDisplay');
        
        if (!ladderContainer) {
            ladderContainer = document.createElement('div');
            ladderContainer.id = 'ladderDisplay';
            ladderContainer.className = 'ladder-display compact-display';
            
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.appendChild(ladderContainer);
            }
        }
        
        // Initialize compact ladder component
        if (!this.compactLadderComponent) {
            this.compactLadderComponent = new window.CompactLadderComponent(ladderContainer);
        }
        
        // Setup the game data in the compact component
        this.compactLadderComponent.setupGame(
            this.slotCount,
            this.topSlots,
            this.bottomSlots,
            this.connections
        );
        
        // Override the component's reveal methods to use our game logic
        this.setupCompactComponentEventHandlers();
        
        ladderContainer.style.display = 'block';
        console.log('Compact ladder display created');
    }

    setupCompactComponentEventHandlers() {
        if (!this.compactLadderComponent) return;
        
        // Override the revealConnection method to use our reveal logic
        const originalRevealConnection = this.compactLadderComponent.revealConnection.bind(this.compactLadderComponent);
        this.compactLadderComponent.revealConnection = (topIndex) => {
            // Call our reveal path logic first
            this.revealPathCompact(topIndex);
            // Then call the component's reveal logic
            originalRevealConnection(topIndex);
        };
        
        // Override the reset button to use our reset logic
        const resetBtn = this.compactLadderComponent.resetBtn;
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetLadder();
            });
        }
    }

    revealPathCompact(topIndex) {
        // Similar to revealPath but without popup
        if (!this.ladderStructure || !this.ladderStructure.paths) return;
        
        const path = this.ladderStructure.paths[topIndex];
        if (!path) return;
        
        // Prevent multiple reveals of the same path
        if (this.revealedPaths && this.revealedPaths.has(topIndex)) {
            return;
        }
        
        // Initialize revealed paths set if not exists
        if (!this.revealedPaths) {
            this.revealedPaths = new Set();
        }
        
        // Mark as revealed
        this.revealedPaths.add(topIndex);
        
        console.log(`Path revealed in compact mode: ${this.topSlots[topIndex]} → ${this.bottomSlots[path.end]}`);
    }

    createSimpleLadderDisplay() {
        // Create or get ladder display container
        let ladderContainer = document.getElementById('ladderDisplay');
        
        if (!ladderContainer) {
            ladderContainer = document.createElement('div');
            ladderContainer.id = 'ladderDisplay';
            ladderContainer.className = 'ladder-display simple-display';
            
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.appendChild(ladderContainer);
            }
        }
        
        // Initialize simple ladder game
        if (!this.simpleLadderGame) {
            this.simpleLadderGame = new window.SimpleLadderGame(ladderContainer);
        }
        
        // Setup the game data in the simple component
        this.simpleLadderGame.setupGame(
            this.slotCount,
            this.topSlots,
            this.bottomSlots,
            this.connections
        );
        
        // Override the reset button to use our reset logic
        this.setupSimpleLadderEventHandlers();
        
        ladderContainer.style.display = 'block';
        console.log('Simple ladder display created');
    }

    setupSimpleLadderEventHandlers() {
        if (!this.simpleLadderGame) return;
        
        // Reset 버튼에 추가 로직 연결
        const resetBtn = this.simpleLadderGame.resetBtn;
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // 새로운 연결 생성
                this.generateLadder();
                // 게임 재설정
                this.simpleLadderGame.setupGame(
                    this.slotCount,
                    this.topSlots,
                    this.bottomSlots,
                    this.connections
                );
            });
        }
    }

    setupLadderEventListeners() {
        // Top slot click handlers for individual path reveal
        const topSlots = document.querySelectorAll('.top-slot');
        topSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.revealPath(index);
            });
        });
        
        // Reveal all button
        const revealAllBtn = document.getElementById('revealAllBtn');
        if (revealAllBtn) {
            revealAllBtn.addEventListener('click', () => {
                this.revealAllPaths();
            });
        }
        
        // Reset ladder button
        const resetLadderBtn = document.getElementById('resetLadderBtn');
        if (resetLadderBtn) {
            resetLadderBtn.addEventListener('click', () => {
                this.resetLadder();
            });
        }
        
        // Back to setup button
        const backToSetupBtn = document.getElementById('backToSetupBtn');
        if (backToSetupBtn) {
            backToSetupBtn.addEventListener('click', () => {
                this.backToSetup();
            });
        }
    }

    initializeLadderRenderer() {
        const canvas = document.getElementById('ladderCanvas');
        const canvasContainer = document.querySelector('.ladder-canvas-container');
        
        if (!canvas || !canvasContainer) {
            console.error('Canvas or container not found');
            this.handleCanvasInitError('Canvas elements not found', canvasContainer);
            return;
        }
        
        // Check canvas support
        const hasCanvasSupport = this.errorHandler ? 
            this.errorHandler.checkFeatureSupport('canvas') : 
            this.checkBasicCanvasSupport();
        
        if (!hasCanvasSupport) {
            console.log('Canvas not supported, using fallback');
            this.handleCanvasUnsupported(canvasContainer);
            return;
        }
        
        try {
            // Set canvas size based on container and slot count
            this.resizeCanvas(canvas);
            
            // Initialize renderer with error handling
            this.ladderRenderer = new LadderRenderer(canvas);
            
            // Check if renderer initialized properly
            if (!this.ladderRenderer || !this.ladderRenderer.ctx) {
                throw new Error('Failed to initialize canvas renderer');
            }
            
            // Draw the ladder with animation and error handling
            this.drawLadderWithErrorHandling();
            
        } catch (error) {
            console.error('Canvas rendering failed:', error);
            this.handleCanvasRenderError(error, canvasContainer);
        }
    }

    // Handle canvas rendering with comprehensive error handling
    drawLadderWithErrorHandling() {
        try {
            if (!this.ladderStructure) {
                throw new Error('Ladder structure not generated');
            }

            // Check for memory constraints before rendering
            if (this.slotCount > 15 && this.isLowMemoryDevice()) {
                console.log('Using simplified rendering for low memory device');
                this.ladderRenderer.drawLadder(this.ladderStructure, false); // No animation
            } else {
                this.ladderRenderer.drawLadder(this.ladderStructure, true);
            }
            
        } catch (error) {
            console.error('Error during ladder drawing:', error);
            
            // Try fallback rendering
            const canvasContainer = document.querySelector('.ladder-canvas-container');
            this.handleCanvasRenderError(error, canvasContainer);
        }
    }

    // Check if device has memory constraints
    isLowMemoryDevice() {
        if (performance.memory) {
            const memoryLimit = performance.memory.jsHeapSizeLimit;
            const usedMemory = performance.memory.usedJSHeapSize;
            const memoryUsagePercent = (usedMemory / memoryLimit) * 100;
            
            return memoryUsagePercent > 70 || memoryLimit < 1073741824; // Less than 1GB
        }
        
        // Fallback check for mobile devices
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
               navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    }

    // Handle canvas unsupported scenario
    handleCanvasUnsupported(container) {
        if (this.errorHandler) {
            const errorInfo = {
                type: 'canvas_unsupported',
                title: '그래픽 기능 제한 ℹ️',
                message: '브라우저에서 Canvas를 지원하지 않아 단순한 형태로 표시됩니다.',
                suggestions: [
                    '최신 브라우저로 업데이트',
                    'Chrome, Firefox, Safari, Edge 사용'
                ],
                severity: 'info'
            };
            this.errorHandler.showErrorMessage(document.querySelector('.game-container'), errorInfo);
        }
        
        this.createCanvasFallback(container);
    }

    // Handle canvas initialization errors
    handleCanvasInitError(error, container) {
        console.error('Canvas initialization error:', error);
        
        if (this.errorHandler) {
            this.errorHandler.logError('Canvas Initialization Error', {
                message: error,
                slotCount: this.slotCount,
                userAgent: navigator.userAgent
            });
            
            const errorInfo = {
                type: 'canvas_init_error',
                title: '그래픽 초기화 오류 ⚠️',
                message: '사다리 그래픽 초기화에 실패했습니다. 단순한 형태로 표시됩니다.',
                severity: 'warning'
            };
            this.errorHandler.showErrorMessage(document.querySelector('.game-container'), errorInfo);
        }
        
        this.createCanvasFallback(container);
    }

    // Handle canvas rendering errors
    handleCanvasRenderError(error, container) {
        console.error('Canvas render error:', error);
        
        if (this.errorHandler) {
            this.errorHandler.logError('Canvas Render Error', {
                message: error.message,
                stack: error.stack,
                slotCount: this.slotCount,
                ladderStructure: this.ladderStructure ? 'present' : 'missing'
            });
            
            // Use the error handler's canvas error handling
            this.errorHandler.handleCanvasError(error, container, this.ladderStructure);
        } else {
            // Fallback error handling
            this.createCanvasFallback(container);
        }
    }

    // Basic canvas support check for fallback
    checkBasicCanvasSupport() {
        try {
            const testCanvas = document.createElement('canvas');
            const ctx = testCanvas.getContext('2d');
            return !!(ctx && typeof ctx.fillRect === 'function');
        } catch (e) {
            return false;
        }
    }

    // Create canvas fallback using SVG or simple HTML
    createCanvasFallback(container) {
        if (!container) return;

        // Use error handler's canvas fallback if available
        if (this.errorHandler) {
            this.errorHandler.createCanvasFallback(container, this.ladderStructure);
            return;
        }

        // Simple HTML fallback
        this.createSimpleHTMLLadder(container);
    }

    // Create simple HTML-based ladder fallback
    createSimpleHTMLLadder(container) {
        container.innerHTML = `
            <div class="ladder-fallback">
                <div class="fallback-message">
                    <p>🎲 사다리 결과 (단순 표시)</p>
                    <small>브라우저 제한으로 단순하게 표시됩니다</small>
                </div>
                <div class="ladder-connections">
                    ${this.createHTMLConnections()}
                </div>
            </div>
        `;

        // Add fallback styles
        this.addFallbackStyles();
    }

    // Create HTML representation of ladder connections
    createHTMLConnections() {
        if (!this.ladderStructure || !this.ladderStructure.paths) {
            return '<p>연결 정보를 표시할 수 없습니다.</p>';
        }

        let html = '<div class="connection-list">';
        
        for (let i = 0; i < this.topSlots.length; i++) {
            const path = this.ladderStructure.paths[i];
            const destination = path ? path.destination : i;
            
            html += `
                <div class="connection-item" data-top-index="${i}">
                    <span class="connection-from">${this.topSlots[i]}</span>
                    <span class="connection-arrow">→</span>
                    <span class="connection-to">${this.bottomSlots[destination]}</span>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    // Add styles for HTML fallback
    addFallbackStyles() {
        if (document.querySelector('#ladder-fallback-styles')) return;

        const style = document.createElement('style');
        style.id = 'ladder-fallback-styles';
        style.textContent = `
            .ladder-fallback {
                background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 2rem;
                margin: 1rem 0;
                text-align: center;
            }
            
            .fallback-message {
                margin-bottom: 1.5rem;
            }
            
            .fallback-message p {
                font-size: 1.2rem;
                font-weight: 600;
                color: #333;
                margin: 0 0 0.5rem 0;
            }
            
            .fallback-message small {
                color: #666;
                font-size: 0.9rem;
            }
            
            .connection-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .connection-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: white;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .connection-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            .connection-from, .connection-to {
                font-weight: 600;
                color: #333;
                flex: 1;
                text-align: center;
            }
            
            .connection-arrow {
                color: #667eea;
                font-size: 1.2rem;
                margin: 0 1rem;
            }
            
            @media (max-width: 768px) {
                .connection-item {
                    flex-direction: column;
                    gap: 0.5rem;
                    text-align: center;
                }
                
                .connection-arrow {
                    transform: rotate(90deg);
                    margin: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    resizeCanvas(canvas) {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const slotWidth = Math.max(80, Math.min(120, containerWidth / this.slotCount));
        const canvasWidth = slotWidth * this.slotCount;
        const canvasHeight = Math.max(300, this.ladderStructure.horizontalBars.length * 30 + 100);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
    }

    showResults(animated = true) {
        console.log(`Showing results, animated: ${animated}`);
        this.showLadderDisplay();
    }

    revealPath(topIndex) {
        if (!this.ladderRenderer) return;
        
        const path = this.ladderStructure.paths[topIndex];
        if (!path) return;
        
        // Prevent multiple reveals of the same path
        if (this.revealedPaths && this.revealedPaths.has(topIndex)) {
            return;
        }
        
        // Initialize revealed paths set if not exists
        if (!this.revealedPaths) {
            this.revealedPaths = new Set();
        }
        
        // Mark this path as revealed
        this.revealedPaths.add(topIndex);
        
        // Clear previous single path highlights (but keep revealed paths)
        document.querySelectorAll('.ladder-slot.highlighted:not(.revealed)').forEach(slot => {
            slot.classList.remove('highlighted');
        });
        
        // Add visual feedback to clicked slot
        const clickedSlot = document.querySelector(`.top-slot[data-index="${topIndex}"]`);
        if (clickedSlot) {
            clickedSlot.classList.add('clicked');
            setTimeout(() => {
                clickedSlot.classList.remove('clicked');
            }, 300);
        }
        
        // Highlight the clicked top slot with revealed state
        this.highlightSlot('top', topIndex, true, true);
        
        // Highlight the corresponding bottom slot with revealed state
        this.highlightSlot('bottom', path.end, true, true);
        
        // Skip popup if using compact component
        if (!this.compactLadderComponent && this.ladderRenderer) {
            // Animate path reveal with enhanced effects (only in traditional mode)
            this.ladderRenderer.highlightPath(path, {
                animated: true,
                showResult: true,
                onComplete: () => {
                    // Show result popup (only in traditional mode)
                    this.showPathResult(topIndex, path.end);
                }
            });
        }
        
        // Update reveal all button state
        this.updateRevealAllButton();
        
        console.log(`Path revealed: ${this.topSlots[topIndex]} → ${this.bottomSlots[path.end]}`);
    }

    revealAllPaths() {
        if (!this.ladderRenderer) return;
        
        // Initialize revealed paths set if not exists
        if (!this.revealedPaths) {
            this.revealedPaths = new Set();
        }
        
        // Mark all paths as revealed
        for (let i = 0; i < this.slotCount; i++) {
            this.revealedPaths.add(i);
        }
        
        // Clear any existing highlights
        document.querySelectorAll('.ladder-slot.highlighted').forEach(slot => {
            slot.classList.remove('highlighted');
        });
        
        // Highlight all slots with revealed state
        for (let i = 0; i < this.slotCount; i++) {
            this.highlightSlot('top', i, true, true);
            const path = this.ladderStructure.paths[i];
            if (path) {
                this.highlightSlot('bottom', path.end, true, true);
            }
        }
        
        // Add visual feedback to reveal all button
        const revealAllBtn = document.getElementById('revealAllBtn');
        if (revealAllBtn) {
            revealAllBtn.classList.add('revealing');
            revealAllBtn.innerHTML = '<span class="btn-icon">⏳</span> 결과 표시 중...';
            revealAllBtn.disabled = true;
        }
        
        // Use compact component for reveal all instead of popup
        if (this.compactLadderComponent) {
            this.compactLadderComponent.revealAllConnections();
            
            // Update button state immediately for compact mode
            if (revealAllBtn) {
                setTimeout(() => {
                    revealAllBtn.classList.remove('revealing');
                    revealAllBtn.classList.add('completed');
                    revealAllBtn.innerHTML = '<span class="btn-icon">✅</span> 모든 결과 표시됨';
                    revealAllBtn.disabled = false;
                }, this.slotCount * 100 + 500); // Wait for animation to complete
            }
            
            // Update game state
            this.gameState = 'complete';
            console.log('All paths revealed in compact mode');
        } else {
            // Fallback to original method if compact component not available
            this.ladderRenderer.revealAllPaths(this.ladderStructure.paths, {
                staggerDelay: 150,
                showResults: true,
                onComplete: () => {
                    // Show all results popup (fallback)
                    this.showAllResults();
                    
                    // Update button state
                    if (revealAllBtn) {
                        revealAllBtn.classList.remove('revealing');
                        revealAllBtn.classList.add('completed');
                        revealAllBtn.innerHTML = '<span class="btn-icon">✅</span> 모든 결과 표시됨';
                        revealAllBtn.disabled = false;
                    }
                    
                    // Update game state
                    this.gameState = 'complete';
                }
            });
        }
        
        console.log('All paths revealed');
    }

    highlightSlot(type, index, highlight, revealed = false) {
        const slot = document.querySelector(`.${type}-slot[data-index="${index}"]`);
        if (slot) {
            if (highlight) {
                slot.classList.add('highlighted');
                if (revealed) {
                    slot.classList.add('revealed');
                }
            } else {
                slot.classList.remove('highlighted');
                if (!revealed) {
                    slot.classList.remove('revealed');
                }
            }
        }
    }

    showPathResult(topIndex, bottomIndex) {
        const topSlot = this.topSlots[topIndex];
        const bottomSlot = this.bottomSlots[bottomIndex];
        
        // Create result popup
        const popup = document.createElement('div');
        popup.className = 'path-result-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h4>🎯 결과 확인</h4>
                    <button class="popup-close" aria-label="닫기">×</button>
                </div>
                <div class="popup-body">
                    <div class="result-connection">
                        <div class="result-from">
                            <span class="result-label">참가자</span>
                            <span class="result-value">${topSlot}</span>
                        </div>
                        <div class="result-arrow">→</div>
                        <div class="result-to">
                            <span class="result-label">결과</span>
                            <span class="result-value">${bottomSlot}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add popup styles
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // Add popup to document
        document.body.appendChild(popup);
        
        // Setup close handlers
        const closeBtn = popup.querySelector('.popup-close');
        const closePopup = () => {
            popup.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup();
            }
        });
        
        // Auto-close after 3 seconds
        setTimeout(closePopup, 3000);
    }

    showAllResults() {
        const results = [];
        for (let i = 0; i < this.slotCount; i++) {
            const path = this.ladderStructure.paths[i];
            if (path) {
                results.push({
                    from: this.topSlots[i],
                    to: this.bottomSlots[path.end]
                });
            }
        }
        
        // Create results popup
        const popup = document.createElement('div');
        popup.className = 'all-results-popup';
        popup.innerHTML = `
            <div class="popup-content large">
                <div class="popup-header">
                    <h4>🎯 전체 결과</h4>
                    <button class="popup-close" aria-label="닫기">×</button>
                </div>
                <div class="popup-body">
                    <div class="results-grid">
                        ${results.map((result, index) => `
                            <div class="result-item" style="animation-delay: ${index * 0.1}s">
                                <div class="result-connection">
                                    <div class="result-from">
                                        <span class="result-value">${result.from}</span>
                                    </div>
                                    <div class="result-arrow">→</div>
                                    <div class="result-to">
                                        <span class="result-value">${result.to}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add popup styles
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // Add popup to document
        document.body.appendChild(popup);
        
        // Setup close handlers
        const closeBtn = popup.querySelector('.popup-close');
        const closePopup = () => {
            popup.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup();
            }
        });
        
        // Auto-close after 5 seconds
        setTimeout(closePopup, 5000);
    }

    updateRevealAllButton() {
        const revealAllBtn = document.getElementById('revealAllBtn');
        if (!revealAllBtn || !this.revealedPaths) return;
        
        const totalRevealed = this.revealedPaths.size;
        const totalSlots = this.slotCount;
        
        if (totalRevealed === 0) {
            revealAllBtn.innerHTML = '<span class="btn-icon">🎯</span> 한번에 열기';
            revealAllBtn.classList.remove('partially-revealed', 'all-revealed');
        } else if (totalRevealed < totalSlots) {
            revealAllBtn.innerHTML = `<span class="btn-icon">🎯</span> 나머지 열기 (${totalSlots - totalRevealed}개)`;
            revealAllBtn.classList.add('partially-revealed');
            revealAllBtn.classList.remove('all-revealed');
        } else {
            revealAllBtn.innerHTML = '<span class="btn-icon">✅</span> 모든 결과 표시됨';
            revealAllBtn.classList.add('all-revealed');
            revealAllBtn.classList.remove('partially-revealed');
            revealAllBtn.disabled = true;
        }
    }

    resetLadder() {
        // Generate new ladder with same slots
        this.generateLadder();
        
        // Clear revealed paths
        this.revealedPaths = new Set();
        
        // Reset compact component if it exists
        if (this.compactLadderComponent) {
            this.compactLadderComponent.setupGame(
                this.slotCount,
                this.topSlots,
                this.bottomSlots,
                this.connections
            );
        } else {
            // Clear highlights and revealed states (traditional mode)
            document.querySelectorAll('.ladder-slot.highlighted, .ladder-slot.revealed').forEach(slot => {
                slot.classList.remove('highlighted', 'revealed');
            });
        }
        
        // Reset reveal all button
        this.updateRevealAllButton();
        
        // Redraw ladder
        if (this.ladderRenderer) {
            this.ladderRenderer.drawLadder(this.ladderStructure, true);
        }
        
        // Reset game state
        this.gameState = 'playing';
        
        console.log('Ladder reset with new connections');
    }

    backToSetup() {
        // Hide ladder display
        const ladderDisplay = document.getElementById('ladderDisplay');
        if (ladderDisplay) {
            ladderDisplay.style.display = 'none';
        }
        
        // Show slots setup
        const slotsDiv = document.getElementById('slotsSetup');
        if (slotsDiv) {
            slotsDiv.style.display = 'block';
        }
        
        // Clear revealed paths
        this.revealedPaths = new Set();
        
        // Reset game state
        this.gameState = 'ready';
        
        console.log('Returned to setup');
    }

    // Save current game configuration
    saveConfiguration(customName = null) {
        try {
            // Validate that we have a complete configuration
            if (this.slotCount === 0 || this.topSlots.length === 0 || this.bottomSlots.length === 0) {
                throw new Error('게임 설정이 완료되지 않았습니다.');
            }

            // Check if all slots are filled
            const allTopFilled = this.topSlots.every(slot => slot && slot.trim() !== '');
            const allBottomFilled = this.bottomSlots.every(slot => slot && slot.trim() !== '');
            
            if (!allTopFilled || !allBottomFilled) {
                throw new Error('모든 슬롯을 채워주세요.');
            }

            const gameData = {
                slotCount: this.slotCount,
                topSlots: this.topSlots,
                bottomSlots: this.bottomSlots
            };

            const gameId = this.storageManager.saveGame(gameData, customName);
            this.showSaveSuccessMessage(gameId);
            return gameId;

        } catch (error) {
            this.showSaveErrorMessage(error.message);
            throw error;
        }
    }

    // Load game configuration by ID
    loadGameConfiguration(gameId) {
        try {
            const game = this.storageManager.loadGame(gameId);
            
            // Apply the loaded configuration
            this.slotCount = game.slotCount;
            this.topSlots = [...game.topSlots];
            this.bottomSlots = [...game.bottomSlots];
            
            // Update UI to reflect loaded configuration
            this.applyLoadedConfiguration();
            this.showLoadSuccessMessage(game.name);
            
            return game;

        } catch (error) {
            this.showLoadErrorMessage(error.message);
            throw error;
        }
    }

    // Apply loaded configuration to UI
    applyLoadedConfiguration() {
        // Update slot count input
        const slotCountInput = document.getElementById('slotCount');
        if (slotCountInput) {
            slotCountInput.value = this.slotCount;
        }

        // Show slots setup and generate slots
        this.showSlotsSetup();
        
        // Update game state
        this.gameState = 'ready';
        this.updateGameState();
    }

    // Generate new ladder connections with same slots (randomize)
    randomizeWithSameSlots() {
        if (this.gameState !== 'ready' && this.gameState !== 'complete') {
            console.log('Cannot randomize: game not ready');
            return;
        }

        // Check if all slots are filled
        const allTopFilled = this.topSlots.every(slot => slot && slot.trim() !== '');
        const allBottomFilled = this.bottomSlots.every(slot => slot && slot.trim() !== '');
        
        if (!allTopFilled || !allBottomFilled) {
            this.showMessage('error', '모든 슬롯을 채운 후 다시 섞을 수 있습니다 ❌', 3000);
            return;
        }

        // Start a new game with the same slots (this will generate new connections)
        this.startGame();
        
        this.showMessage('success', '같은 슬롯으로 새로운 사다리를 생성했습니다! 🎯', 3000);
        console.log('Randomized ladder with same slots');
    }

    // Show save success message
    showSaveSuccessMessage(gameId) {
        this.showMessage('success', '게임이 성공적으로 저장되었습니다! 💾', 3000);
    }

    // Show save error message
    showSaveErrorMessage(errorMessage) {
        this.showMessage('error', `저장 실패: ${errorMessage} ❌`, 5000);
    }

    // Show load success message
    showLoadSuccessMessage(gameName) {
        this.showMessage('success', `"${gameName}" 게임을 불러왔습니다! 📂`, 3000);
    }

    // Show load error message
    showLoadErrorMessage(errorMessage) {
        this.showMessage('error', `불러오기 실패: ${errorMessage} ❌`, 5000);
    }

    // Handle save game button click
    handleSaveGame() {
        // Show save dialog
        const customName = prompt('게임 이름을 입력하세요 (선택사항):', '');
        
        // User cancelled
        if (customName === null) {
            return;
        }
        
        try {
            this.saveConfiguration(customName.trim() || null);
        } catch (error) {
            console.error('Save failed:', error);
        }
    }

    // Generic message display
    showMessage(type, message, duration = 3000) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.game-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `game-message message-${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 600;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;

        // Add animation styles if not already added
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageEl);

        // Auto remove after duration
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
}

// Initialize ladder game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.ladderGame) {
        window.ladderGame = new LadderGame();
    }
});

// Export for use in other files
window.LadderGame = LadderGame;