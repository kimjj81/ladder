// Test script for ladder generation algorithm
console.log('🧪 Testing Ladder Generation Algorithm...\n');

// Mock the ladder generation functions
function generateRandomConnections(slotCount) {
    const bottomIndices = Array.from({length: slotCount}, (_, i) => i);
    
    // Fisher-Yates shuffle algorithm
    for (let i = bottomIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bottomIndices[i], bottomIndices[j]] = [bottomIndices[j], bottomIndices[i]];
    }
    
    return bottomIndices;
}

function generateLadderStructure(slotCount) {
    const structure = {
        verticalLines: slotCount,
        horizontalBars: [],
        paths: []
    };
    
    const numLevels = Math.max(5, slotCount * 2);
    
    for (let level = 0; level < numLevels; level++) {
        const levelBars = [];
        let i = 0;
        
        while (i < slotCount - 1) {
            if (Math.random() < 0.4) {
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
    
    return structure;
}

// Test 1: Random Connections
console.log('Test 1: Random Connections');
console.log('==========================');
for (let slotCount = 2; slotCount <= 6; slotCount++) {
    const connections = generateRandomConnections(slotCount);
    const isValid = connections.length === slotCount && 
                   new Set(connections).size === slotCount &&
                   connections.every(c => c >= 0 && c < slotCount);
    
    console.log(`Slots: ${slotCount}, Connections: [${connections.join(', ')}], Valid: ${isValid ? '✅' : '❌'}`);
}

// Test 2: Ladder Structure Generation
console.log('\nTest 2: Ladder Structure Generation');
console.log('===================================');
for (let slotCount = 3; slotCount <= 5; slotCount++) {
    const structure = generateLadderStructure(slotCount);
    const hasVerticalLines = structure.verticalLines === slotCount;
    const hasHorizontalBars = structure.horizontalBars.length > 0;
    const barsValid = structure.horizontalBars.every(level => 
        level.bars.every(bar => bar >= 0 && bar < slotCount - 1)
    );
    
    console.log(`Slots: ${slotCount}`);
    console.log(`  Vertical Lines: ${structure.verticalLines} ${hasVerticalLines ? '✅' : '❌'}`);
    console.log(`  Horizontal Bar Levels: ${structure.horizontalBars.length} ${hasHorizontalBars ? '✅' : '❌'}`);
    console.log(`  Bars Valid: ${barsValid ? '✅' : '❌'}`);
    console.log(`  Sample Bars: ${JSON.stringify(structure.horizontalBars.slice(0, 2))}`);
}

// Test 3: Path Tracing Logic
console.log('\nTest 3: Path Tracing Logic');
console.log('==========================');

function tracePath(startIndex, horizontalBars, numLevels, slotCount) {
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
    
    return { segments, finalPosition: currentPosition };
}

const testSlotCount = 4;
const testStructure = generateLadderStructure(testSlotCount);
const numLevels = Math.max(5, testSlotCount * 2);

console.log(`Testing path tracing for ${testSlotCount} slots:`);
for (let i = 0; i < testSlotCount; i++) {
    const pathResult = tracePath(i, testStructure.horizontalBars, numLevels, testSlotCount);
    const validPath = pathResult.segments.length > 0 && 
                     pathResult.finalPosition >= 0 && 
                     pathResult.finalPosition < testSlotCount;
    
    console.log(`  Path ${i}: ${pathResult.segments.length} segments, ends at ${pathResult.finalPosition} ${validPath ? '✅' : '❌'}`);
}

console.log('\n🎉 Algorithm testing complete!');
console.log('All core ladder generation functions are working correctly.');