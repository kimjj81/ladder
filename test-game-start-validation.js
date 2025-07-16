// Test script to verify game start validation fix
console.log('Testing game start validation...');

// Mock DOM elements that the LadderGame expects
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {}
    }),
    head: { appendChild: () => {} }
};

global.window = {
    addEventListener: () => {},
    ErrorHandler: null
};

// Load the LadderGame class
const fs = require('fs');
const ladderGameCode = fs.readFileSync('js/ladder-game.js', 'utf8');

// Extract just the class definition (simplified approach)
eval(ladderGameCode);

// Test the validation
try {
    const game = new LadderGame();
    
    // Set up test scenario with empty slots
    game.slotCount = 3;
    game.topSlots = ['테스트1', '테스트2', ''];  // Empty slot
    game.bottomSlots = ['결과1', '결과2', '결과3'];
    game.gameState = 'ready';  // Force ready state
    
    // This should throw an error now
    game.startGame();
    
    console.log('❌ FAIL: Game started with empty slots');
} catch (error) {
    console.log('✅ PASS: Game correctly prevented start with empty slots');
    console.log('Error message:', error.message);
}

// Test with all slots filled
try {
    const game2 = new LadderGame();
    
    // Set up test scenario with all slots filled
    game2.slotCount = 3;
    game2.topSlots = ['테스트1', '테스트2', '테스트3'];
    game2.bottomSlots = ['결과1', '결과2', '결과3'];
    game2.gameState = 'ready';
    
    // Mock the methods that would be called
    game2.generateLadder = () => console.log('Ladder generated');
    game2.showLadderDisplay = () => console.log('Ladder displayed');
    game2.showLoadingState = () => {};
    game2.hideLoadingState = () => {};
    game2.showSuccessMessage = () => {};
    
    // This should work
    game2.startGame();
    
    console.log('✅ PASS: Game started successfully with all slots filled');
} catch (error) {
    console.log('❌ FAIL: Game failed to start with valid data');
    console.log('Error message:', error.message);
}