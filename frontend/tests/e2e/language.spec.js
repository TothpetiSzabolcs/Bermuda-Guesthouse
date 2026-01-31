import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('should change language and update UI text', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the language selector
    const languageSelector = page.getByLabel(/nyelv|language|sprache/i);
    await expect(languageSelector).toBeVisible();
    
    // Get initial language (should be Hungarian by default)
    const initialLanguage = await languageSelector.inputValue();
    expect(['hu', 'en', 'de']).toContain(initialLanguage);
    
    // Change to English
    await languageSelector.selectOption('en');
    await page.waitForTimeout(500);
    
    // Verify language changed to English
    const englishLanguage = await languageSelector.inputValue();
    expect(englishLanguage).toBe('en');
    
    // Check navigation changed to English (use first match)
    const galleryLinkEn = page.getByRole('link', { name: 'gallery' }).first();
    await expect(galleryLinkEn).toBeVisible();
    
    // Change to German
    await languageSelector.selectOption('de');
    await page.waitForTimeout(500);
    
    // Verify language changed to German
    const germanLanguage = await languageSelector.inputValue();
    expect(germanLanguage).toBe('de');
    
    // Check navigation changed to German (use first match)
    const galleryLinkDe = page.getByRole('link', { name: 'galerie' }).first();
    await expect(galleryLinkDe).toBeVisible();
    
    // Change back to Hungarian
    await languageSelector.selectOption('hu');
    await page.waitForTimeout(500);
    
    // Verify language changed back to Hungarian
    const finalLanguage = await languageSelector.inputValue();
    expect(finalLanguage).toBe('hu');
    
    // Check navigation changed back to Hungarian (use first match)
    const galleryLinkHu = page.getByRole('link', { name: 'galéria' }).first();
    await expect(galleryLinkHu).toBeVisible();
  });
});