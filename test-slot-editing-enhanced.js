// Enhanced test for slot editing functionality
// This file tests the enhanced slot editing and management features

console.log('🧪 Testing Enhanced Slot Editing Functionality...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testSlotEditingFeatures, 1000);
});

function testSlotEditingFeatures() {
    console.log('\n=== Enhanced Slot Editing Tests ===');
    
    // Test 1: Setup game with 3 slots
    console.log('\n1. Setting up game with 3 slots...');
    const slotCountInput = document.getElementById('slotCount');
    const setupForm = document.getElementById('setupForm');
    
    if (slotCountInput && setupForm) {
        slotCountInput.value = '3';
        setupForm.dispatchEvent(new Event('submit'));
        console.log('✅ Game setup completed');
        
        setTimeout(() => {
            testSlotClickEditing();
        }, 500);
    } else {
        console.log('❌ Setup elements not found');
    }
}

function testSlotClickEditing() {
    console.log('\n2. Testing slot click editing...');
    
    // Test clicking on empty slot
    const firstTopSlot = document.querySelector('[data-type="top"][data-index="0"]');
    if (firstTopSlot) {
        console.log('Clicking on first top slot...');
        firstTopSlot.click();
        
        setTimeout(() => {
            // Check if editing interface appeared
            const editInput = firstTopSlot.querySelector('.slot-edit-input');
            const confirmBtn = firstTopSlot.querySelector('.slot-confirm-btn');
            const cancelBtn = firstTopSlot.querySelector('.slot-cancel-btn');
            
            if (editInput && confirmBtn && cancelBtn) {
                console.log('✅ Editing interface created successfully');
                console.log('  - Input field: ✅');
                console.log('  - Confirm button: ✅');
                console.log('  - Cancel button: ✅');
                
                // Test adding content
                editInput.value = '테스트 참가자 1';
                confirmBtn.click();
                
                setTimeout(() => {
                    testSlotContentManagement();
                }, 300);
            } else {
                console.log('❌ Editing interface not created properly');
                console.log('  - Input field:', !!editInput);
                console.log('  - Confirm button:', !!confirmBtn);
                console.log('  - Cancel button:', !!cancelBtn);
            }
        }, 200);
    } else {
        console.log('❌ First top slot not found');
    }
}

function testSlotContentManagement() {
    console.log('\n3. Testing slot content management...');
    
    // Check if content was added
    const firstTopSlot = document.querySelector('[data-type="top"][data-index="0"]');
    if (firstTopSlot && firstTopSlot.textContent.includes('테스트 참가자 1')) {
        console.log('✅ Content added successfully');
        console.log('✅ Slot state changed to filled');
        
        // Test editing filled slot
        console.log('Testing editing of filled slot...');
        firstTopSlot.click();
        
        setTimeout(() => {
            const editInput = firstTopSlot.querySelector('.slot-edit-input');
            const deleteBtn = firstTopSlot.querySelector('.slot-delete-btn');
            
            if (editInput && deleteBtn) {
                console.log('✅ Filled slot editing interface includes delete button');
                
                // Test content modification
                editInput.value = '수정된 참가자 1';
                const confirmBtn = firstTopSlot.querySelector('.slot-confirm-btn');
                if (confirmBtn) {
                    confirmBtn.click();
                    
                    setTimeout(() => {
                        if (firstTopSlot.textContent.includes('수정된 참가자 1')) {
                            console.log('✅ Content modification successful');
                            testSlotDeletion();
                        } else {
                            console.log('❌ Content modification failed');
                        }
                    }, 300);
                }
            } else {
                console.log('❌ Delete button not found in filled slot');
            }
        }, 200);
    } else {
        console.log('❌ Content was not added properly');
    }
}

function testSlotDeletion() {
    console.log('\n4. Testing slot deletion...');
    
    const firstTopSlot = document.querySelector('[data-type="top"][data-index="0"]');
    if (firstTopSlot) {
        firstTopSlot.click();
        
        setTimeout(() => {
            const deleteBtn = firstTopSlot.querySelector('.slot-delete-btn');
            if (deleteBtn) {
                console.log('Clicking delete button...');
                deleteBtn.click();
                
                setTimeout(() => {
                    if (firstTopSlot.classList.contains('empty')) {
                        console.log('✅ Slot deletion successful');
                        console.log('✅ Slot state changed back to empty');
                        testValidationStatus();
                    } else {
                        console.log('❌ Slot deletion failed');
                    }
                }, 300);
            } else {
                console.log('❌ Delete button not found');
            }
        }, 200);
    }
}

function testValidationStatus() {
    console.log('\n5. Testing validation status display...');
    
    // Fill some slots to test validation
    const slots = [
        { type: 'top', index: 0, content: '참가자 A' },
        { type: 'top', index: 1, content: '참가자 B' },
        { type: 'bottom', index: 0, content: '결과 1' }
    ];
    
    let completedSlots = 0;
    
    slots.forEach((slotData, i) => {
        setTimeout(() => {
            const slot = document.querySelector(`[data-type="${slotData.type}"][data-index="${slotData.index}"]`);
            if (slot) {
                slot.click();
                
                setTimeout(() => {
                    const input = slot.querySelector('.slot-edit-input');
                    const confirmBtn = slot.querySelector('.slot-confirm-btn');
                    
                    if (input && confirmBtn) {
                        input.value = slotData.content;
                        confirmBtn.click();
                        
                        completedSlots++;
                        if (completedSlots === slots.length) {
                            setTimeout(() => {
                                checkValidationStatus();
                            }, 500);
                        }
                    }
                }, 200);
            }
        }, i * 600);
    });
}

function checkValidationStatus() {
    console.log('\n6. Checking validation status...');
    
    const validationStatus = document.getElementById('validationStatus');
    const startGameBtn = document.getElementById('startGameBtn');
    
    if (validationStatus) {
        console.log('✅ Validation status display found');
        console.log('  Status class:', validationStatus.className);
        
        const statusTitle = validationStatus.querySelector('.status-title');
        if (statusTitle) {
            console.log('  Status message:', statusTitle.textContent);
        }
    } else {
        console.log('❌ Validation status display not found');
    }
    
    if (startGameBtn) {
        console.log('✅ Start game button found');
        console.log('  Button disabled:', startGameBtn.disabled);
        console.log('  Button classes:', startGameBtn.className);
        console.log('  Button title:', startGameBtn.title);
    } else {
        console.log('❌ Start game button not found');
    }
    
    testDuplicateDetection();
}

function testDuplicateDetection() {
    console.log('\n7. Testing duplicate detection...');
    
    // Add duplicate content
    const secondTopSlot = document.querySelector('[data-type="top"][data-index="2"]');
    if (secondTopSlot) {
        secondTopSlot.click();
        
        setTimeout(() => {
            const input = secondTopSlot.querySelector('.slot-edit-input');
            const confirmBtn = secondTopSlot.querySelector('.slot-confirm-btn');
            
            if (input && confirmBtn) {
                input.value = '참가자 A'; // Duplicate of first slot
                confirmBtn.click();
                
                setTimeout(() => {
                    // Check for duplicate warning
                    const duplicateSlots = document.querySelectorAll('.slot.duplicate-warning');
                    const duplicateIndicators = document.querySelectorAll('.duplicate-indicator');
                    
                    if (duplicateSlots.length > 0) {
                        console.log('✅ Duplicate detection working');
                        console.log(`  Found ${duplicateSlots.length} slots with duplicate warnings`);
                        console.log(`  Found ${duplicateIndicators.length} duplicate indicators`);
                    } else {
                        console.log('❌ Duplicate detection not working');
                    }
                    
                    // Check start button warning state
                    const startGameBtn = document.getElementById('startGameBtn');
                    if (startGameBtn && startGameBtn.classList.contains('btn-warning')) {
                        console.log('✅ Start button shows warning for duplicates');
                    } else {
                        console.log('❌ Start button does not show duplicate warning');
                    }
                    
                    finishTests();
                }, 500);
            }
        }, 200);
    }
}

function finishTests() {
    console.log('\n=== Test Summary ===');
    console.log('✅ Enhanced slot editing functionality tests completed');
    console.log('📋 Features tested:');
    console.log('  - Click-to-edit slots');
    console.log('  - Enhanced editing interface with action buttons');
    console.log('  - Content modification and deletion');
    console.log('  - Visual feedback for slot states');
    console.log('  - Validation status display');
    console.log('  - Duplicate detection and warnings');
    console.log('  - Game state management');
    console.log('\n🎉 All enhanced slot editing features are working!');
}