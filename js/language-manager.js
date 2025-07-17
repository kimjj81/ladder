// Language Manager for internationalization
class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = {
            en: {
                // Page title and meta
                'page.title': 'Ladder Game',
                'page.description': 'Ladder Game - Fun web game for random selection',
                'page.keywords': 'ladder game, random selection, web game',
                
                // Header
                'header.title': '🎯 Ladder Game',
                'header.subtitle': 'Random Selection Game',
                'nav.game': 'Play Game',
                'nav.saved': 'Saved Games',
                'nav.about': 'About',
                
                // Game Setup
                'game.title': 'Ladder Game',
                'setup.title': '🎯 Game Setup',
                'setup.description': 'Enter the number of participants and start the ladder game!',
                'setup.participants': 'Number of Participants (2-20)',
                'setup.participants.placeholder': 'Enter number of participants',
                'setup.start': 'Start Game',
                
                // Slot Input
                'slots.title': '✏️ Enter Participants and Results',
                'slots.participants': '👆 Participants (Top)',
                'slots.results': '👇 Results (Bottom)',
                'slots.reset': 'Reset Setup',
                'slots.save': 'Save Game',
                'slots.randomize': 'Randomize',
                'slots.generate': 'Generate Ladder',
                
                // Slot Input Component
                'input.placeholder': 'Enter content and press Enter',
                'input.hint.participant': 'Enter participant {0} name',
                'input.hint.result': 'Enter result {0}',
                'input.current.participant': 'Participant {0}',
                'input.current.result': 'Result {0}',
                'input.progress': '{0} / {1} completed',
                'input.progress.completed': 'completed',
                'input.shortcuts': '💡 <strong>Shortcuts:</strong> Ctrl+Del or Ctrl+Backspace to delete current slot',
                'input.nav.prev': 'Previous',
                'input.nav.next': 'Next',
                'input.error.empty': 'Please enter content',
                
                // Canvas and Ladder
                'canvas.loading': '🎲 Drawing ladder...',
                'canvas.complete': '✨ Complete! ✨',
                'ladder.reveal.all': 'Reveal All',
                
                // Results Table
                'results.title': '🎯 Ladder Game Results',
                'results.summary': '{0} connections completed',
                'results.participant': 'Participant',
                'results.result': 'Result',
                'results.clear': 'Clear Results',
                'results.export': 'Copy Results',
                'results.export.empty': 'No results to copy.',
                'results.export.success': 'Results copied to clipboard!',
                'results.export.error': 'Copy failed. Please copy manually.',
                'results.export.text': 'Ladder Game Results:\n\n{0}',
                
                // Saved Games
                'saved.title': 'Saved Games',
                'saved.count': '{0} saved games',
                'saved.storage': 'Storage: {0}%',
                'saved.refresh': 'Refresh',
                'saved.clear.all': 'Delete All',
                
                // About
                'about.title': 'About the Game',
                'about.description1': 'Ladder Game is a fun game used to randomly select one option from multiple choices.',
                'about.description2': 'Enter the items to choose from at the top, the results at the bottom, and draw the ladder to see the results!',
                
                // Error Messages
                'error.participant.empty': 'Please enter participant name',
                'error.result.empty': 'Please enter result',
                'error.invalid.characters': 'Invalid characters detected',
                'error.too.long': 'Text is too long (max 20 characters)',
                'error.browser.not.supported': 'Your browser may not support all features',
                'error.performance.warning': 'Performance Warning',
                'error.memory.warning': 'Memory Limit',
                
                // Performance warnings
                'performance.low': 'Device performance is low, game may be slow.',
                'performance.suggestions': 'Limit participants to 10 or fewer|Close other apps or tabs|Reduce animation effects',
                'memory.low': 'Available memory is limited.',
                'memory.suggestions': 'Limit participants to 15 or fewer|Close other browser tabs|Restart browser',
                
                // Footer
                'footer.copyright': '© 2025 Ladder Game. All rights reserved.',
                
                // Loading states
                'loading.generating': 'Generating...',
                'loading.saving': 'Saving...',
                'loading.loading': 'Loading...',
            },
            ko: {
                // Page title and meta
                'page.title': '사다리타기 게임',
                'page.description': '사다리타기 게임 - 랜덤 선택을 위한 재미있는 웹 게임',
                'page.keywords': '사다리타기, 게임, 랜덤선택, 웹게임',
                
                // Header
                'header.title': '🎯 사다리타기',
                'header.subtitle': '랜덤 선택 게임',
                'nav.game': '게임하기',
                'nav.saved': '저장된 게임',
                'nav.about': '게임 설명',
                
                // Game Setup
                'game.title': '사다리타기 게임',
                'setup.title': '🎯 게임 설정',
                'setup.description': '참가자 수를 입력하고 사다리타기를 시작해보세요!',
                'setup.participants': '참가자 수 (2-20명)',
                'setup.participants.placeholder': '참가자 수를 입력하세요',
                'setup.start': '게임 시작하기',
                
                // Slot Input
                'slots.title': '✏️ 참가자 및 결과 입력',
                'slots.participants': '👆 참가자 (위쪽)',
                'slots.results': '👇 결과 (아래쪽)',
                'slots.reset': '다시 설정',
                'slots.save': '게임 저장',
                'slots.randomize': '다시 섞기',
                'slots.generate': '사다리 생성하기',
                
                // Slot Input Component
                'input.placeholder': '내용을 입력하고 Enter를 누르세요',
                'input.hint.participant': '참가자 {0} 이름을 입력하세요',
                'input.hint.result': '결과 {0}을 입력하세요',
                'input.current.participant': '참가자 {0}',
                'input.current.result': '결과 {0}',
                'input.progress': '{0} / {1} 완료',
                'input.progress.completed': '완료',
                'input.shortcuts': '💡 <strong>단축키:</strong> Ctrl+Del 또는 Ctrl+Backspace로 현재 슬롯 삭제',
                'input.nav.prev': '이전',
                'input.nav.next': '다음',
                'input.error.empty': '내용을 입력해주세요',
                
                // Canvas and Ladder
                'canvas.loading': '🎲 사다리 그리는 중...',
                'canvas.complete': '✨ 완성! ✨',
                'ladder.reveal.all': '한번에 열기',
                
                // Results Table
                'results.title': '🎯 사다리타기 결과',
                'results.summary': '{0}개 연결 완료',
                'results.participant': '참가자',
                'results.result': '결과',
                'results.clear': '결과 지우기',
                'results.export': '결과 복사',
                'results.export.empty': '복사할 결과가 없습니다.',
                'results.export.success': '결과가 클립보드에 복사되었습니다!',
                'results.export.error': '복사 실패. 수동으로 복사해주세요.',
                'results.export.text': '사다리타기 결과:\n\n{0}',
                
                // Saved Games
                'saved.title': '저장된 게임',
                'saved.count': '{0}개의 저장된 게임',
                'saved.storage': '저장공간: {0}%',
                'saved.refresh': '새로고침',
                'saved.clear.all': '모두 삭제',
                
                // About
                'about.title': '게임 설명',
                'about.description1': '사다리타기는 여러 선택지 중에서 랜덤하게 하나를 선택할 때 사용하는 재미있는 게임입니다.',
                'about.description2': '상단에 선택할 항목들을, 하단에 결과들을 입력하고 사다리를 그려서 결과를 확인해보세요!',
                
                // Error Messages
                'error.participant.empty': '참가자 이름을 입력해주세요',
                'error.result.empty': '결과를 입력해주세요',
                'error.invalid.characters': '잘못된 문자가 감지되었습니다',
                'error.too.long': '텍스트가 너무 깁니다 (최대 20자)',
                'error.browser.not.supported': '브라우저가 일부 기능을 지원하지 않을 수 있습니다',
                'error.performance.warning': '성능 경고',
                'error.memory.warning': '메모리 제한',
                
                // Performance warnings
                'performance.low': '기기 성능이 낮아 게임이 느려질 수 있습니다.',
                'performance.suggestions': '참가자 수를 10명 이하로 제한|다른 앱이나 탭 닫기|애니메이션 효과 줄이기',
                'memory.low': '사용 가능한 메모리가 제한적입니다.',
                'memory.suggestions': '참가자 수를 15명 이하로 제한|다른 브라우저 탭 닫기|브라우저 재시작',
                
                // Footer
                'footer.copyright': '© 2025 사다리타기 게임. All rights reserved.',
                
                // Loading states
                'loading.generating': '생성 중...',
                'loading.saving': '저장 중...',
                'loading.loading': '로딩 중...',
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('LanguageManager initialized with language:', this.currentLanguage);
        this.updatePageLanguage();
        
        // Wait for DOM to be ready then update all i18n elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateAllI18nElements();
            });
        } else {
            this.updateAllI18nElements();
        }
    }
    
    detectLanguage() {
        // Check browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        
        // Check if browser language is Korean
        if (browserLanguage.startsWith('ko')) {
            return 'ko';
        }
        
        // Default to English
        return 'en';
    }
    
    updatePageLanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update page title and meta tags
        document.title = this.t('page.title');
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.t('page.description');
        }
        
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.content = this.t('page.keywords');
        }
    }
    
    // Translation function with placeholder support
    t(key, ...args) {
        const translation = this.translations[this.currentLanguage][key] || 
                           this.translations.en[key] || 
                           key;
        
        // Replace placeholders {0}, {1}, etc.
        return translation.replace(/{(\d+)}/g, (match, index) => {
            return args[index] !== undefined ? args[index] : match;
        });
    }
    
    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // Check if current language is Korean
    isKorean() {
        return this.currentLanguage === 'ko';
    }
    
    // Check if current language is English
    isEnglish() {
        return this.currentLanguage === 'en';
    }
    
    // Format text with multiple placeholders
    format(text, ...args) {
        return text.replace(/{(\d+)}/g, (match, index) => {
            return args[index] !== undefined ? args[index] : match;
        });
    }
    
    // Get translation with fallback
    getTranslation(key, fallback = null) {
        return this.translations[this.currentLanguage][key] || 
               this.translations.en[key] || 
               fallback || 
               key;
    }
    
    // Get all translations for current language
    getAllTranslations() {
        return this.translations[this.currentLanguage];
    }
    
    // Helper for getting array of suggestions (split by |)
    getSuggestions(key) {
        const text = this.t(key);
        return text.split('|').map(s => s.trim());
    }
    
    // Update all elements with data-i18n attributes
    updateAllI18nElements() {
        // Update text content
        const textElements = document.querySelectorAll('[data-i18n]');
        textElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });
        
        // Update HTML content (for elements with HTML)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            if (key) {
                element.innerHTML = this.t(key);
            }
        });
        
        // Update placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.t(key);
            }
        });
        
        // Update title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });
        
        console.log('Updated all i18n elements');
    }
    
    // Refresh all translations (useful after dynamic content changes)
    refreshTranslations() {
        this.updateAllI18nElements();
    }
}

// Create global language manager instance
window.LanguageManager = LanguageManager;
window.languageManager = new LanguageManager();