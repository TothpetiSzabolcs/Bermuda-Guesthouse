import { test, expect } from '@playwright/test';

test.describe('404 Error Handling', () => {
  test('should handle non-existent routes gracefully', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-page');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Based on the App.jsx, unknown routes redirect to home page
    // So we should end up on the home page
    expect(page.url()).toContain('/');
    
    // Verify we're on the home page by checking for key elements
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Test another non-existent route
    await page.goto('/another/random/path');
    await page.waitForLoadState('networkidle');
    
    // Should still redirect to home
    expect(page.url()).toContain('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });
  
  test('should handle non-existent room pages', async ({ page }) => {
    // Navigate to a non-existent room page
    await page.goto('/rooms/non-existent-room-slug');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should redirect to home page (based on App.jsx route handling)
    expect(page.url()).toContain('/');
    
    // Verify we're on the home page
    await expect(page.getByRole('banner')).toBeVisible();
  });
  
  test('should handle non-existent gallery categories', async ({ page }) => {
    // Navigate to a non-existent gallery category
    await page.goto('/gallery/non-existent-category');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should redirect to gallery page (based on GalleryPage.jsx logic)
    expect(page.url()).toContain('/gallery');
    
    // Verify we're on the gallery page
    await expect(page.getByRole('heading', { name: /galéria|gallery|galerie/i })).toBeVisible();
  });
});