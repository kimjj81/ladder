// Storage Manager for localStorage operations
class StorageManager {
    constructor() {
        this.storageKey = 'ladder-game-data';
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
        this.errorHandler = window.ErrorHandler ? new ErrorHandler() : null;
        this.init();
    }

    init() {
        // Check if localStorage is available
        if (!this.isStorageAvailable()) {
            console.warn('localStorage not available, using fallback storage');
            this.initializeFallbackStorage();
            return;
        }

        // Initialize storage structure if it doesn't exist
        if (!this.getAllSavedGames()) {
            this.initializeStorage();
        }
        console.log('StorageManager initialized');
    }

    initializeStorage() {
        const initialData = {
            games: {},
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        } catch (e) {
            console.error('Failed to initialize storage:', e);
        }
    }

    // Generate unique ID for games
    generateGameId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Initialize fallback storage for unsupported browsers
    initializeFallbackStorage() {
        this.fallbackStorage = {
            games: {},
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                fallbackMode: true
            }
        };
        console.log('Fallback storage initialized');
    }

    // Save game configuration with enhanced error handling
    saveGame(gameData, customName = null) {
        try {
            // Enhanced validation using error handler if available
            if (this.errorHandler) {
                const validation = this.errorHandler.validateGameState(gameData);
                if (!validation.isValid) {
                    const errorMessages = validation.errors
                        .filter(error => error.severity === 'error')
                        .map(error => error.message);
                    
                    if (errorMessages.length > 0) {
                        throw new Error(`게임 데이터 검증 실패: ${errorMessages[0]}`);
                    }
                }
            } else {
                // Fallback validation
                if (!gameData || !gameData.topSlots || !gameData.bottomSlots) {
                    throw new Error('Invalid game data provided');
                }
            }

            const gameId = this.generateGameId();
            
            // Create game object
            const game = {
                id: gameId,
                name: customName || this.generateGameName(gameData),
                slotCount: gameData.slotCount,
                topSlots: [...gameData.topSlots],
                bottomSlots: [...gameData.bottomSlots],
                createdAt: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            };

            if (!this.isStorageAvailable()) {
                // Use fallback storage
                return this.saveFallbackGame(game);
            }

            const allData = this.getStorageData() || this.initializeStorageData();
            
            // Add to games collection
            allData.games[gameId] = game;
            allData.metadata.lastModified = new Date().toISOString();

            // Enhanced storage size checking
            const dataString = JSON.stringify(allData);
            const currentSize = dataString.length;
            const sizeInMB = (currentSize / 1024 / 1024).toFixed(2);
            
            console.log(`Storage size check: ${sizeInMB}MB / ${(this.maxStorageSize / 1024 / 1024).toFixed(2)}MB`);
            
            if (currentSize > this.maxStorageSize) {
                // Try progressive cleanup strategies
                const cleanupResult = this.performProgressiveCleanup(allData, currentSize);
                
                if (cleanupResult.success) {
                    const newDataString = JSON.stringify(allData);
                    localStorage.setItem(this.storageKey, newDataString);
                    console.log(`Game saved after cleanup: ${gameId} (freed ${cleanupResult.freedSpace}MB)`);
                    return gameId;
                } else {
                    const error = new Error('Storage quota would be exceeded even after cleanup');
                    error.name = 'QuotaExceededError';
                    error.details = {
                        currentSize: sizeInMB,
                        maxSize: (this.maxStorageSize / 1024 / 1024).toFixed(2),
                        gamesCount: Object.keys(allData.games).length
                    };
                    throw error;
                }
            }

            localStorage.setItem(this.storageKey, dataString);
            console.log('Game saved successfully:', gameId);
            return gameId;

        } catch (e) {
            console.error('Save game error:', e);
            
            // Use error handler if available
            if (this.errorHandler) {
                const errorInfo = this.errorHandler.handleStorageError(e, 'save');
                
                // Try fallback save for quota errors
                if (errorInfo.type === 'quota_exceeded') {
                    try {
                        const fallbackGame = {
                            id: this.generateGameId(),
                            name: customName || this.generateGameName(gameData),
                            slotCount: gameData.slotCount,
                            topSlots: [...gameData.topSlots],
                            bottomSlots: [...gameData.bottomSlots],
                            createdAt: new Date().toISOString(),
                            lastUsed: new Date().toISOString(),
                            fallbackSave: true
                        };
                        
                        const fallbackId = this.saveFallbackGame(fallbackGame);
                        console.log('Fallback save successful:', fallbackId);
                        return fallbackId;
                    } catch (fallbackError) {
                        console.error('Fallback save failed:', fallbackError);
                        throw new Error('저장 공간이 부족하고 임시 저장도 실패했습니다.');
                    }
                }
                
                // Re-throw with user-friendly message
                throw new Error(errorInfo.message);
            }

            // Handle specific error types without error handler
            if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                const details = e.details || {};
                throw new Error(`저장 공간이 부족합니다 (현재: ${details.currentSize || '?'}MB). 일부 게임을 삭제해주세요.`);
            }
            
            if (e.message.includes('Invalid game data') || e.message.includes('게임 데이터 검증 실패')) {
                throw new Error('게임 데이터가 올바르지 않습니다.');
            }
            
            throw new Error('게임 저장에 실패했습니다: ' + e.message);
        }
    }

    // Progressive cleanup strategies for storage management
    performProgressiveCleanup(allData, currentSize) {
        const originalSize = currentSize;
        let cleanupAttempts = 0;
        const maxAttempts = 3;
        
        while (currentSize > this.maxStorageSize && cleanupAttempts < maxAttempts) {
            cleanupAttempts++;
            console.log(`Cleanup attempt ${cleanupAttempts}/${maxAttempts}`);
            
            let cleanupResult;
            
            switch (cleanupAttempts) {
                case 1:
                    // First attempt: Remove oldest games (keep 15)
                    cleanupResult = this.cleanupOldGames(allData, 15);
                    break;
                case 2:
                    // Second attempt: Remove more old games (keep 10)
                    cleanupResult = this.cleanupOldGames(allData, 10);
                    break;
                case 3:
                    // Final attempt: Keep only 5 most recent games
                    cleanupResult = this.cleanupOldGames(allData, 5);
                    break;
            }
            
            if (cleanupResult.success) {
                const newDataString = JSON.stringify(allData);
                currentSize = newDataString.length;
                console.log(`After cleanup ${cleanupAttempts}: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
            } else {
                break;
            }
        }
        
        const freedSpace = ((originalSize - currentSize) / 1024 / 1024).toFixed(2);
        
        return {
            success: currentSize <= this.maxStorageSize,
            freedSpace: freedSpace,
            finalSize: (currentSize / 1024 / 1024).toFixed(2),
            cleanupAttempts: cleanupAttempts
        };
    }

    // Fallback save for when localStorage is not available
    saveFallbackGame(game) {
        if (!this.fallbackStorage) {
            this.initializeFallbackStorage();
        }
        
        this.fallbackStorage.games[game.id] = game;
        this.fallbackStorage.metadata.lastModified = new Date().toISOString();
        
        console.log('Game saved to fallback storage:', game.id);
        return game.id;
    }

    // Clean up old games to free space
    cleanupOldGames(allData, maxGamesToKeep = 10) {
        try {
            const games = Object.values(allData.games);
            if (games.length <= maxGamesToKeep) {
                return { success: false, message: 'No games to cleanup' };
            }

            // Sort by last used date and keep only the most recent ones
            const sortedGames = games.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
            const gamesToKeep = sortedGames.slice(0, maxGamesToKeep);
            const gamesToDelete = sortedGames.slice(maxGamesToKeep);

            // Clear old games
            allData.games = {};
            gamesToKeep.forEach(game => {
                allData.games[game.id] = game;
            });

            console.log(`Cleaned up ${gamesToDelete.length} old games`);
            return { 
                success: true, 
                deletedCount: gamesToDelete.length,
                message: `${gamesToDelete.length}개의 오래된 게임을 정리했습니다.`
            };
        } catch (e) {
            console.error('Failed to cleanup old games:', e);
            return { success: false, message: 'Cleanup failed' };
        }
    }

    // Initialize storage data structure
    initializeStorageData() {
        return {
            games: {},
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
    }

    // Generate automatic game name
    generateGameName(gameData) {
        const date = new Date();
        const dateStr = date.toLocaleDateString('ko-KR');
        const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        // Use first few non-empty slots as name hint
        const sampleSlots = [...gameData.topSlots, ...gameData.bottomSlots]
            .filter(slot => slot && slot.trim() !== '')
            .slice(0, 2);
        
        let nameHint = '';
        if (sampleSlots.length > 0) {
            nameHint = ` (${sampleSlots.join(', ')})`;
            if (nameHint.length > 20) {
                nameHint = nameHint.substring(0, 17) + '...)';
            }
        }
        
        return `${gameData.slotCount}명 게임${nameHint} - ${dateStr} ${timeStr}`;
    }

    // Load specific game with fallback support
    loadGame(gameId) {
        try {
            let allData, game;
            
            if (this.isStorageAvailable()) {
                allData = this.getStorageData();
                game = allData?.games[gameId];
                
                if (game) {
                    // Update last used timestamp
                    game.lastUsed = new Date().toISOString();
                    allData.metadata.lastModified = new Date().toISOString();
                    localStorage.setItem(this.storageKey, JSON.stringify(allData));
                }
            } else if (this.fallbackStorage) {
                // Use fallback storage
                game = this.fallbackStorage.games[gameId];
                if (game) {
                    game.lastUsed = new Date().toISOString();
                    this.fallbackStorage.metadata.lastModified = new Date().toISOString();
                }
            }
            
            if (!game) {
                throw new Error('Game not found');
            }

            console.log('Game loaded successfully:', gameId);
            return game;

        } catch (e) {
            console.error('Failed to load game:', e);
            
            if (this.errorHandler) {
                const errorInfo = this.errorHandler.handleStorageError(e, 'load');
                throw new Error(errorInfo.message);
            }
            
            throw new Error('게임 로드에 실패했습니다: ' + e.message);
        }
    }

    // Get all saved games with fallback support
    getAllSavedGames() {
        try {
            let allData;
            
            if (this.isStorageAvailable()) {
                allData = this.getStorageData();
            } else if (this.fallbackStorage) {
                allData = this.fallbackStorage;
            }
            
            if (!allData || !allData.games) {
                return [];
            }

            // Convert to array and sort by last used (most recent first)
            const games = Object.values(allData.games).sort((a, b) => {
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            });

            // Add fallback indicator if using fallback storage
            if (allData.metadata?.fallbackMode) {
                games.forEach(game => {
                    game.fallbackMode = true;
                });
            }

            return games;

        } catch (e) {
            console.error('Failed to get saved games:', e);
            
            if (this.errorHandler) {
                this.errorHandler.logError('getAllSavedGames', e);
            }
            
            return [];
        }
    }

    // Delete specific game
    deleteGame(gameId) {
        try {
            const allData = this.getStorageData();
            
            if (!allData.games[gameId]) {
                throw new Error('Game not found');
            }

            delete allData.games[gameId];
            allData.metadata.lastModified = new Date().toISOString();
            
            localStorage.setItem(this.storageKey, JSON.stringify(allData));
            console.log('Game deleted successfully:', gameId);
            return true;

        } catch (e) {
            console.error('Failed to delete game:', e);
            throw new Error('게임 삭제에 실패했습니다: ' + e.message);
        }
    }

    // Update game name
    updateGameName(gameId, newName) {
        try {
            const allData = this.getStorageData();
            const game = allData.games[gameId];
            
            if (!game) {
                throw new Error('Game not found');
            }

            game.name = newName;
            game.lastUsed = new Date().toISOString();
            allData.metadata.lastModified = new Date().toISOString();
            
            localStorage.setItem(this.storageKey, JSON.stringify(allData));
            console.log('Game name updated successfully:', gameId);
            return true;

        } catch (e) {
            console.error('Failed to update game name:', e);
            throw new Error('게임 이름 변경에 실패했습니다: ' + e.message);
        }
    }

    // Get storage data
    getStorageData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to parse storage data:', e);
            return null;
        }
    }

    // Export all data
    exportData() {
        try {
            const allData = this.getStorageData();
            return {
                ...allData,
                exportedAt: new Date().toISOString()
            };
        } catch (e) {
            console.error('Failed to export data:', e);
            return {};
        }
    }

    // Import data
    importData(data) {
        try {
            // Validate data structure
            if (!data.games || !data.metadata) {
                throw new Error('Invalid data format');
            }

            // Merge with existing data
            const existingData = this.getStorageData() || { games: {}, metadata: {} };
            
            // Add imported games with new IDs to avoid conflicts
            Object.values(data.games).forEach(game => {
                const newId = this.generateGameId();
                existingData.games[newId] = {
                    ...game,
                    id: newId,
                    lastUsed: new Date().toISOString()
                };
            });

            existingData.metadata.lastModified = new Date().toISOString();
            existingData.metadata.lastImport = new Date().toISOString();

            localStorage.setItem(this.storageKey, JSON.stringify(existingData));
            console.log('Data imported successfully');
            return Object.keys(data.games).length;

        } catch (e) {
            console.error('Failed to import data:', e);
            throw new Error('데이터 가져오기에 실패했습니다: ' + e.message);
        }
    }

    // Get storage usage statistics
    getStorageStats() {
        try {
            const allData = this.getStorageData();
            const dataString = JSON.stringify(allData);
            const gamesCount = allData ? Object.keys(allData.games || {}).length : 0;
            
            return {
                gamesCount,
                storageUsed: dataString.length,
                storageLimit: this.maxStorageSize,
                usagePercent: Math.round((dataString.length / this.maxStorageSize) * 100)
            };
        } catch (e) {
            return {
                gamesCount: 0,
                storageUsed: 0,
                storageLimit: this.maxStorageSize,
                usagePercent: 0
            };
        }
    }

    // Clear all data
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.initializeStorage();
            console.log('All data cleared');
            return true;
        } catch (e) {
            console.error('Failed to clear data:', e);
            return false;
        }
    }

    // Check if localStorage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Export for use in other files
window.StorageManager = StorageManager;