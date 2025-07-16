// Simple validation test for game start error handling
function validateGameStartErrorHandling() {
    console.log('🧪 Testing game start validation...');
    
    if (!window.ladderGame) {
        console.error('❌ LadderGame not available');
        return false;
    }
    
    const game = window.ladderGame;
    
    // Save original state
    const originalState = {
        slotCount: game.slotCount,
        topSlots: [...game.topSlots],
        bottomSlots: [...game.bottomSlots],
        gameState: game.gameState
    };
    
    try {
        // Test 1: Empty slots should prevent game start
        console.log('Test 1: Empty slots validation');
        game.slotCount = 3;
        game.topSlots = ['테스트1', '테스트2', ''];  // Empty slot
        game.bottomSlots = ['결과1', '결과2', '결과3'];
        game.gameState = 'ready';  // Force ready state
        
        let errorThrown = false;
        try {
            game.startGame();
        } catch (error) {
            errorThrown = true;
            console.log('✅ PASS: Empty slots correctly prevented game start');
            console.log('   Error:', error.message);
        }
        
        if (!errorThrown) {
            console.log('❌ FAIL: Game started with empty slots');
            return false;
        }
        
        // Test 2: All slots filled should allow game start
        console.log('Test 2: Valid game state');
        game.slotCount = 3;
        game.topSlots = ['테스트1', '테스트2', '테스트3'];
        game.bottomSlots = ['결과1', '결과2', '결과3'];
        game.gameState = 'ready';
        
        // Mock the methods to prevent actual game start
        const originalGenerateLadder = game.generateLadder;
        const originalShowLadderDisplay = game.showLadderDisplay;
        
        game.generateLadder = function() {
            console.log('   Mock: Ladder generated');
        };
        game.showLadderDisplay = function() {
            console.log('   Mock: Ladder displayed');
        };
        
        let gameStarted = false;
        try {
            game.startGame();
            gameStarted = true;
            console.log('✅ PASS: Game started successfully with valid data');
        } catch (error) {
            console.log('❌ FAIL: Game failed to start with valid data');
            console.log('   Error:', error.message);
            return false;
        }
        
        // Restore original methods
        game.generateLadder = originalGenerateLadder;
        game.showLadderDisplay = originalShowLadderDisplay;
        
        if (!gameStarted) {
            console.log('❌ FAIL: Game did not start with valid data');
            return false;
        }
        
        console.log('🎉 All validation tests passed!');
        return true;
        
    } finally {
        // Restore original state
        game.slotCount = originalState.slotCount;
        game.topSlots = originalState.topSlots;
        game.bottomSlots = originalState.bottomSlots;
        game.gameState = originalState.gameState;
    }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(validateGameStartErrorHandling, 1000);
        });
    } else {
        setTimeout(validateGameStartErrorHandling, 1000);
    }
}