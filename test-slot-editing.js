// Test script to verify slot editing functionality
// This can be run in the browser console

function testSlotEditingFeatures() {
    console.log('🧪 Testing Slot Editing Features...');
    
    // Test 1: Check if slot editing interface is available
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        console.log('✅ Setup form found');
        
        // Fill slot count and submit
        const slotCountInput = document.getElementById('slotCount');
        slotCountInput.value = '3';
        setupForm.dispatchEvent(new Event('submit'));
        
        setTimeout(() => {
            // Test 2: Check if slots are generated with click handlers
            const topSlots = document.querySelectorAll('#topSlots .slot');
            const bottomSlots = document.querySelectorAll('#bottomSlots .slot');
            
            if (topSlots.length === 3 && bottomSlots.length === 3) {
                console.log('✅ Slots generated correctly');
                
                // Test 3: Check if SlotInput component is initialized
                const slotInputBox = document.querySelector('.slot-input-box');
                if (slotInputBox) {
                    console.log('✅ SlotInput component initialized');
                    
                    // Test 4: Add content to first slot
                    slotInputBox.value = 'Test User 1';
                    slotInputBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                    
                    setTimeout(() => {
                        const firstSlot = document.querySelector('[data-type="top"][data-index="0"]');
                        if (firstSlot && firstSlot.textContent.includes('Test User 1')) {
                            console.log('✅ Content added to slot successfully');
                            
                            // Test 5: Click on filled slot to edit
                            firstSlot.click();
                            
                            setTimeout(() => {
                                const editInput = firstSlot.querySelector('.slot-edit-input');
                                if (editInput) {
                                    console.log('✅ Slot editing interface appears on click');
                                    
                                    // Test 6: Check for delete button
                                    const deleteBtn = firstSlot.querySelector('.slot-delete-btn');
                                    if (deleteBtn) {
                                        console.log('✅ Delete button available for filled slots');
                                        
                                        // Test delete functionality
                                        deleteBtn.click();
                                        
                                        setTimeout(() => {
                                            if (firstSlot.classList.contains('empty')) {
                                                console.log('✅ Slot deletion works correctly');
                                            } else {
                                                console.log('❌ Slot deletion failed');
                                            }
                                        }, 100);
                                    } else {
                                        console.log('❌ Delete button not found');
                                    }
                                } else {
                                    console.log('❌ Slot editing interface not found');
                                }
                            }, 100);
                        } else {
                            console.log('❌ Content not added to slot');
                        }
                    }, 100);
                } else {
                    console.log('❌ SlotInput component not found');
                }
            } else {
                console.log('❌ Slots not generated correctly');
            }
        }, 100);
    } else {
        console.log('❌ Setup form not found');
    }
}

// Test duplicate detection
function testDuplicateDetection() {
    console.log('🧪 Testing Duplicate Detection...');
    
    // This would need to be run after setting up slots and adding duplicate content
    const ladderGame = window.ladderGame;
    if (ladderGame) {
        // Simulate duplicate content
        ladderGame.topSlots = ['Alice', 'Bob', 'Alice'];
        ladderGame.bottomSlots = ['Prize 1', 'Prize 2', 'Prize 1'];
        
        const duplicates = ladderGame.checkForDuplicates();
        if (duplicates.length > 0) {
            console.log('✅ Duplicate detection working:', duplicates);
        } else {
            console.log('❌ Duplicate detection failed');
        }
    }
}

// Export for manual testing
window.testSlotEditingFeatures = testSlotEditingFeatures;
window.testDuplicateDetection = testDuplicateDetection;

console.log('Test functions loaded. Run testSlotEditingFeatures() or testDuplicateDetection() in console.');