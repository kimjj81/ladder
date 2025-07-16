// Saved Games Manager for handling saved games UI
class SavedGamesManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.errorHandler = window.ErrorHandler ? new ErrorHandler() : null;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('savedGamesContainer');
        this.setupEventListeners();
        this.loadSavedGames();
        console.log('SavedGamesManager initialized');
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshSavedGamesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadSavedGames();
            });
        }

        // Clear all button
        const clearAllBtn = document.getElementById('clearAllGamesBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.handleClearAll();
            });
        }

        // Listen for navigation to saved games section
        document.addEventListener('click', (e) => {
            if (e.target.matches('.menu-item[href="#saved-games"]')) {
                setTimeout(() => this.loadSavedGames(), 100);
            }
        });
    }

    loadSavedGames() {
        try {
            const savedGames = this.storageManager.getAllSavedGames();
            const stats = this.storageManager.getStorageStats();
            
            // Check for storage issues and show warnings
            this.checkStorageHealth(stats);
            
            this.updateStats(stats);
            this.renderSavedGames(savedGames);
            
        } catch (error) {
            console.error('Failed to load saved games:', error);
            
            if (this.errorHandler) {
                const errorInfo = this.errorHandler.handleStorageError(error, 'load saved games');
                this.errorHandler.showErrorMessage(this.container, errorInfo);
            } else {
                this.showError('저장된 게임을 불러오는데 실패했습니다.');
            }
        }
    }

    // Check storage health and show warnings
    checkStorageHealth(stats) {
        if (!this.errorHandler) return;

        const container = document.querySelector('#saved-games-section');
        
        // Check storage quota
        if (stats.usagePercent > 90) {
            const errorInfo = {
                type: 'storage_warning',
                title: '저장 공간 부족 경고 ⚠️',
                message: `저장 공간이 ${stats.usagePercent}% 사용되었습니다. 곧 새로운 게임을 저장할 수 없게 됩니다.`,
                suggestions: [
                    '오래된 게임 삭제',
                    '사용하지 않는 게임 정리',
                    '브라우저 데이터 정리'
                ],
                severity: 'warning'
            };
            this.errorHandler.showErrorMessage(container, errorInfo);
        } else if (stats.usagePercent > 75) {
            const errorInfo = {
                type: 'storage_info',
                title: '저장 공간 알림 ℹ️',
                message: `저장 공간이 ${stats.usagePercent}% 사용되었습니다.`,
                severity: 'info'
            };
            this.errorHandler.showErrorMessage(container, errorInfo);
        }

        // Check for fallback mode
        const savedGames = this.storageManager.getAllSavedGames();
        const hasFallbackGames = savedGames.some(game => game.fallbackMode);
        
        if (hasFallbackGames) {
            const errorInfo = {
                type: 'fallback_mode',
                title: '임시 저장 모드 ⚠️',
                message: '일부 게임이 임시 저장되었습니다. 브라우저를 닫으면 사라질 수 있습니다.',
                suggestions: [
                    '브라우저 업데이트',
                    '시크릿 모드 해제',
                    '브라우저 설정에서 저장소 허용'
                ],
                severity: 'warning'
            };
            this.errorHandler.showErrorMessage(container, errorInfo);
        }
    }

    updateStats(stats) {
        const countElement = document.getElementById('savedGamesCount');
        const usageElement = document.getElementById('storageUsage');
        
        if (countElement) {
            countElement.textContent = `${stats.gamesCount}개의 저장된 게임`;
        }
        
        if (usageElement) {
            usageElement.textContent = `저장공간: ${stats.usagePercent}%`;
            
            // Color code based on usage
            if (stats.usagePercent > 80) {
                usageElement.style.color = '#dc3545';
            } else if (stats.usagePercent > 60) {
                usageElement.style.color = '#ffc107';
            } else {
                usageElement.style.color = '#28a745';
            }
        }
    }

    renderSavedGames(savedGames) {
        if (!this.container) return;

        if (savedGames.length === 0) {
            this.container.innerHTML = `
                <div class="no-saved-games">
                    <div class="no-games-icon">📂</div>
                    <h3>저장된 게임이 없습니다</h3>
                    <p>사다리타기 게임을 설정한 후 "게임 저장" 버튼을 눌러 저장해보세요!</p>
                    <button type="button" class="btn btn-primary" onclick="window.app.navigateToPage('ladder-game')">
                        <span class="btn-icon">🎮</span>
                        게임 만들기
                    </button>
                </div>
            `;
            return;
        }

        const gamesHTML = savedGames.map(game => this.renderGameCard(game)).join('');
        this.container.innerHTML = `
            <div class="saved-games-grid">
                ${gamesHTML}
            </div>
        `;
        
        // Set up event listeners for the rendered cards
        this.setupCardEventListeners();
    }

    renderGameCard(game) {
        const createdDate = new Date(game.createdAt).toLocaleDateString('ko-KR');
        const lastUsedDate = new Date(game.lastUsed).toLocaleDateString('ko-KR');
        const isRecent = new Date(game.lastUsed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Preview of slots (first few items)
        const topPreview = game.topSlots.slice(0, 3).join(', ');
        const bottomPreview = game.bottomSlots.slice(0, 3).join(', ');
        const hasMore = game.topSlots.length > 3 || game.bottomSlots.length > 3;

        return `
            <div class="saved-game-card ${isRecent ? 'recent' : ''}" data-game-id="${game.id}">
                <div class="game-card-header">
                    <h4 class="game-name" title="${game.name}">${game.name}</h4>
                    <div class="game-actions">
                        <button class="btn-icon-small edit-name-btn" title="이름 변경" data-game-id="${game.id}">
                            ✏️
                        </button>
                        <button class="btn-icon-small delete-game-btn" title="삭제" data-game-id="${game.id}">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="game-info">
                    <div class="game-meta">
                        <span class="slot-count">${game.slotCount}명</span>
                        <span class="created-date">생성: ${createdDate}</span>
                        ${isRecent ? '<span class="recent-badge">최근</span>' : ''}
                    </div>
                    
                    <div class="game-preview">
                        <div class="preview-section">
                            <strong>참가자:</strong> ${topPreview}${hasMore ? '...' : ''}
                        </div>
                        <div class="preview-section">
                            <strong>결과:</strong> ${bottomPreview}${hasMore ? '...' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="game-card-actions">
                    <button class="btn btn-primary btn-sm load-game-btn" data-game-id="${game.id}">
                        <span class="btn-icon">📂</span>
                        불러오기
                    </button>
                    <button class="btn btn-info btn-sm randomize-game-btn" data-game-id="${game.id}">
                        <span class="btn-icon">🎯</span>
                        바로 섞기
                    </button>
                </div>
            </div>
        `;
    }

    setupCardEventListeners() {
        if (!this.container) return;

        // Load game buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.load-game-btn') || e.target.closest('.load-game-btn')) {
                const btn = e.target.matches('.load-game-btn') ? e.target : e.target.closest('.load-game-btn');
                const gameId = btn.dataset.gameId;
                this.handleLoadGame(gameId);
            }
        });

        // Randomize game buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.randomize-game-btn') || e.target.closest('.randomize-game-btn')) {
                const btn = e.target.matches('.randomize-game-btn') ? e.target : e.target.closest('.randomize-game-btn');
                const gameId = btn.dataset.gameId;
                this.handleRandomizeGame(gameId);
            }
        });

        // Delete game buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.delete-game-btn')) {
                const gameId = e.target.dataset.gameId;
                this.handleDeleteGame(gameId);
            }
        });

        // Edit name buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.edit-name-btn')) {
                const gameId = e.target.dataset.gameId;
                this.handleEditName(gameId);
            }
        });
    }

    handleLoadGame(gameId) {
        try {
            if (window.ladderGame) {
                window.ladderGame.loadGameConfiguration(gameId);
                // Navigate to ladder game section
                window.app.navigateToPage('ladder-game');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showError('게임을 불러오는데 실패했습니다.');
        }
    }

    handleRandomizeGame(gameId) {
        try {
            // Load the game first
            const game = this.storageManager.loadGame(gameId);
            
            if (window.ladderGame) {
                // Apply configuration
                window.ladderGame.slotCount = game.slotCount;
                window.ladderGame.topSlots = [...game.topSlots];
                window.ladderGame.bottomSlots = [...game.bottomSlots];
                window.ladderGame.applyLoadedConfiguration();
                
                // Start the game immediately (which will randomize)
                window.ladderGame.startGame();
                
                // Navigate to ladder game section
                window.app.navigateToPage('ladder-game');
                
                this.showSuccess(`"${game.name}" 게임으로 바로 시작했습니다!`);
            }
        } catch (error) {
            console.error('Failed to randomize game:', error);
            this.showError('게임을 시작하는데 실패했습니다.');
        }
    }

    handleDeleteGame(gameId) {
        const game = this.storageManager.getAllSavedGames().find(g => g.id === gameId);
        if (!game) return;

        const confirmed = confirm(`"${game.name}" 게임을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        if (!confirmed) return;

        try {
            this.storageManager.deleteGame(gameId);
            this.showSuccess('게임이 삭제되었습니다.');
            this.loadSavedGames(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete game:', error);
            this.showError('게임 삭제에 실패했습니다.');
        }
    }

    handleEditName(gameId) {
        const game = this.storageManager.getAllSavedGames().find(g => g.id === gameId);
        if (!game) return;

        const newName = prompt('새로운 게임 이름을 입력하세요:', game.name);
        if (newName === null || newName.trim() === game.name) return;

        const trimmedName = newName.trim();
        if (trimmedName === '') {
            alert('게임 이름을 입력해주세요.');
            return;
        }

        try {
            this.storageManager.updateGameName(gameId, trimmedName);
            this.showSuccess('게임 이름이 변경되었습니다.');
            this.loadSavedGames(); // Refresh the list
        } catch (error) {
            console.error('Failed to update game name:', error);
            this.showError('게임 이름 변경에 실패했습니다.');
        }
    }

    handleClearAll() {
        const stats = this.storageManager.getStorageStats();
        if (stats.gamesCount === 0) {
            alert('삭제할 게임이 없습니다.');
            return;
        }

        const confirmed = confirm(
            `모든 저장된 게임(${stats.gamesCount}개)을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
        );
        if (!confirmed) return;

        try {
            this.storageManager.clearAllData();
            this.showSuccess('모든 게임이 삭제되었습니다.');
            this.loadSavedGames(); // Refresh the list
        } catch (error) {
            console.error('Failed to clear all games:', error);
            this.showError('게임 삭제에 실패했습니다.');
        }
    }

    showSuccess(message) {
        this.showMessage('success', message);
    }

    showError(message) {
        this.showMessage('error', message);
    }

    showMessage(type, message) {
        // Use the same message system as LadderGame
        if (window.ladderGame && window.ladderGame.showMessage) {
            window.ladderGame.showMessage(type, message);
        } else {
            // Fallback alert
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other components to initialize
    setTimeout(() => {
        if (!window.savedGamesManager) {
            window.savedGamesManager = new SavedGamesManager();
            
            // Set up event listeners for saved games cards after rendering
            const observer = new MutationObserver(() => {
                if (window.savedGamesManager) {
                    window.savedGamesManager.setupCardEventListeners();
                }
            });
            
            const container = document.getElementById('savedGamesContainer');
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        }
    }, 500);
});

// Export for use in other files
window.SavedGamesManager = SavedGamesManager;