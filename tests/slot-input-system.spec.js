const { test, expect } = require('@playwright/test');

test.describe('Slot Input System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial setup form', async ({ page }) => {
    // Check if the setup form is visible
    await expect(page.locator('#ladderSetup')).toBeVisible();
    await expect(page.locator('#slotCount')).toBeVisible();
    await expect(page.locator('.setup-btn')).toBeVisible();
  });

  test('should validate slot count input', async ({ page }) => {
    const slotCountInput = page.locator('#slotCount');
    const errorMessage = page.locator('#slotCountError');
    
    // Test invalid input (too low)
    await slotCountInput.fill('1');
    await slotCountInput.blur();
    await expect(errorMessage).toContainText('최소 2명 이상이어야 합니다');
    
    // Test invalid input (too high)
    await slotCountInput.fill('25');
    await slotCountInput.blur();
    await expect(errorMessage).toContainText('최대 20명까지 가능합니다');
    
    // Test valid input
    await slotCountInput.fill('4');
    await slotCountInput.blur();
    await expect(errorMessage).toBeEmpty();
  });

  test('should create slots setup interface after valid submission', async ({ page }) => {
    // Fill valid slot count and submit
    await page.locator('#slotCount').fill('4');
    await page.locator('.setup-btn').click();
    
    // Check if slots setup is shown
    await expect(page.locator('#slotsSetup')).toBeVisible();
    await expect(page.locator('#ladderSetup')).toBeHidden();
    
    // Check if slots are generated
    await expect(page.locator('#topSlots .slot')).toHaveCount(4);
    await expect(page.locator('#bottomSlots .slot')).toHaveCount(4);
    
    // Check if slot input component is created
    await expect(page.locator('#slotInputContainer')).toBeVisible();
    await expect(page.locator('.slot-input-box')).toBeVisible();
  });

  test('should highlight current slot and show progress', async ({ page }) => {
    // Setup game with 3 slots
    await page.locator('#slotCount').fill('3');
    await page.locator('.setup-btn').click();
    
    // Wait for slot input to be initialized
    await page.waitForSelector('.slot-input-box');
    
    // Check initial state
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 1');
    await expect(page.locator('.current-progress')).toContainText('0');
    await expect(page.locator('.total-slots')).toContainText('6');
    
    // Check if first top slot is highlighted
    await expect(page.locator('[data-type="top"][data-index="0"]')).toHaveClass(/active/);
  });

  test('should handle Enter key to add content and move to next slot', async ({ page }) => {
    // Setup game with 3 slots
    await page.locator('#slotCount').fill('3');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    await inputBox.waitFor();
    
    // Add content to first slot
    await inputBox.fill('Alice');
    await inputBox.press('Enter');
    
    // Check if content was added and moved to next slot
    await expect(page.locator('[data-type="top"][data-index="0"]')).toContainText('Alice');
    await expect(page.locator('[data-type="top"][data-index="0"]')).toHaveClass(/filled/);
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 2');
    await expect(page.locator('.current-progress')).toContainText('1');
    
    // Check if second slot is now highlighted
    await expect(page.locator('[data-type="top"][data-index="1"]')).toHaveClass(/active/);
  });

  test('should navigate between slots using navigation buttons', async ({ page }) => {
    // Setup game with 3 slots
    await page.locator('#slotCount').fill('3');
    await page.locator('.setup-btn').click();
    
    await page.waitForSelector('.slot-input-box');
    
    // Add content to first slot
    await page.locator('.slot-input-box').fill('Alice');
    await page.locator('.slot-input-box').press('Enter');
    
    // Now at second slot, use previous button
    await page.locator('.prev-btn').click();
    
    // Should be back at first slot
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 1');
    await expect(page.locator('[data-type="top"][data-index="0"]')).toHaveClass(/active/);
    await expect(page.locator('.slot-input-box')).toHaveValue('Alice');
    
    // Use next button
    await page.locator('.next-btn').click();
    
    // Should be at second slot
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 2');
    await expect(page.locator('[data-type="top"][data-index="1"]')).toHaveClass(/active/);
  });

  test('should transition from top slots to bottom slots', async ({ page }) => {
    // Setup game with 2 slots for faster testing
    await page.locator('#slotCount').fill('2');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    await inputBox.waitFor();
    
    // Fill both top slots
    await inputBox.fill('Alice');
    await inputBox.press('Enter');
    await inputBox.fill('Bob');
    await inputBox.press('Enter');
    
    // Should now be at first bottom slot
    await expect(page.locator('.current-slot-indicator')).toContainText('결과 1');
    await expect(page.locator('[data-type="bottom"][data-index="0"]')).toHaveClass(/active/);
    await expect(page.locator('.current-progress')).toContainText('2');
  });

  test('should enable start game button when all slots are filled', async ({ page }) => {
    // Setup game with 2 slots
    await page.locator('#slotCount').fill('2');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    const startGameBtn = page.locator('#startGameBtn');
    
    await inputBox.waitFor();
    
    // Initially disabled
    await expect(startGameBtn).toBeDisabled();
    
    // Fill all slots
    await inputBox.fill('Alice');
    await inputBox.press('Enter');
    await inputBox.fill('Bob');
    await inputBox.press('Enter');
    await inputBox.fill('Prize 1');
    await inputBox.press('Enter');
    await inputBox.fill('Prize 2');
    await inputBox.press('Enter');
    
    // Should be enabled now
    await expect(startGameBtn).toBeEnabled();
    await expect(page.locator('.current-progress')).toContainText('4');
  });

  test('should allow clicking on slots to edit them', async ({ page }) => {
    // Setup game with 2 slots
    await page.locator('#slotCount').fill('2');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    await inputBox.waitFor();
    
    // Fill first slot
    await inputBox.fill('Alice');
    await inputBox.press('Enter');
    
    // Click on the first slot to edit it
    await page.locator('[data-type="top"][data-index="0"]').click();
    
    // Should be back at first slot with content loaded
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 1');
    await expect(page.locator('[data-type="top"][data-index="0"]')).toHaveClass(/active/);
    await expect(inputBox).toHaveValue('Alice');
  });

  test('should handle arrow key navigation', async ({ page }) => {
    // Setup game with 3 slots
    await page.locator('#slotCount').fill('3');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    await inputBox.waitFor();
    
    // Add content to first slot
    await inputBox.fill('Alice');
    await inputBox.press('Enter');
    
    // Use arrow up to go back
    await inputBox.press('ArrowUp');
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 1');
    
    // Use arrow down to go forward
    await inputBox.press('ArrowDown');
    await expect(page.locator('.current-slot-indicator')).toContainText('참가자 2');
  });

  test('should show error for empty input', async ({ page }) => {
    // Setup game with 2 slots
    await page.locator('#slotCount').fill('2');
    await page.locator('.setup-btn').click();
    
    const inputBox = page.locator('.slot-input-box');
    await inputBox.waitFor();
    
    // Try to submit empty input
    await inputBox.press('Enter');
    
    // Should show error
    await expect(page.locator('.input-error')).toContainText('내용을 입력해주세요');
    await expect(inputBox).toHaveClass(/error/);
  });

  test('should reset properly', async ({ page }) => {
    // Setup game with 2 slots
    await page.locator('#slotCount').fill('2');
    await page.locator('.setup-btn').click();
    
    await page.waitForSelector('.slot-input-box');
    
    // Add some content
    await page.locator('.slot-input-box').fill('Alice');
    await page.locator('.slot-input-box').press('Enter');
    
    // Reset
    await page.locator('#resetSetupBtn').click();
    
    // Should be back to setup form
    await expect(page.locator('#ladderSetup')).toBeVisible();
    await expect(page.locator('#slotsSetup')).toBeHidden();
    await expect(page.locator('#slotCount')).toHaveValue('');
  });
});