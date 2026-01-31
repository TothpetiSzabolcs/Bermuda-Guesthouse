import { test, expect } from '@playwright/test';

test.describe('Gallery Flow', () => {
  test('should navigate gallery categories, open lightbox, and use prev/next', async ({ page }) => {
    await page.goto('/gallery');
    
    // Wait for gallery to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the gallery landing page
    await expect(page.getByRole('heading', { name: /galéria|gallery|galerie/i })).toBeVisible();
    
    // Look for category buttons/cards
    const categoryButtons = await page.locator('button[role="button"], .group.rounded-2xl').all();
    expect(categoryButtons.length).toBeGreaterThan(0);
    
    // Click on the first category
    await categoryButtons[0].click();
    
    // Wait for category page to load
    await page.waitForTimeout(1000);
    
    // Verify we're in a category detail view
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Wait for images to load or handle empty state
    const imageButtons = await page.locator('button[aria-label], button.rounded-xl').all();
    
    // If no images, just test navigation back
    if (imageButtons.length === 0) {
      // Skip lightbox testing if no images available
      const backToCategoriesButton = page.getByRole('button', { name: /vissza a kategóriákhoz|back to categories/i });
      await expect(backToCategoriesButton).toBeVisible();
      await backToCategoriesButton.click();
      await page.waitForTimeout(1000);
      await expect(page.getByRole('heading', { name: /galéria|gallery|galerie/i })).toBeVisible();
      return;
    }
    
    await imageButtons[0].click();
    
    // Verify lightbox is open (should have navigation buttons and close button)
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
    await expect(page.getByLabel(/bezárás|close|schließen/i)).toBeVisible();
    
    // Check for prev/next navigation buttons
    const prevButton = page.locator('button[aria-label="Előző"], button[aria-label="Previous"]');
    const nextButton = page.locator('button[aria-label="Következő"], button[aria-label="Next"]');
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // Test prev navigation
    await prevButton.click();
    await page.waitForTimeout(500);
    
    // Test next navigation
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // Test keyboard navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // Close lightbox
    await page.getByLabel(/bezárás|close|schließen/i).click();
    await page.waitForTimeout(500);
    
    // Verify lightbox is closed
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible();
    
    // Go back to categories
    await page.getByRole('button', { name: /vissza a kategóriákhoz|back to categories/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify we're back on the category selection page
    await expect(page.getByRole('heading', { name: /galéria|gallery|galerie/i })).toBeVisible();
  });
});