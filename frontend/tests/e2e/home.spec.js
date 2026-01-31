import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display basic elements (hero/nav)', async ({ page }) => {
    await page.goto('/');
    
    // Check if header is present
    await expect(page.getByRole('banner')).toBeVisible();
    
    // Check navigation links are present
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check hero section
    await expect(page.locator('#hero')).toBeVisible();
    
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check brand name/logo area - look for either the logo or brand text
    const logo = page.locator('img[alt*="Bermunda"], img[alt*="Vendégház"], span:has-text("Bermunda")').first();
    await expect(logo).toBeVisible();
    
    // Check language selector
    await expect(page.getByLabel(/nyelv|language|sprache/i)).toBeVisible();
    
    // Check booking button
    await expect(page.getByRole('button', { name: /foglalás|book|buchen/i })).toBeVisible();
    
    // Check hero CTA button (the first one in hero section)
    const heroCta = page.locator('#hero').getByRole('link', { name: /szobák|rooms|zimmer/i }).first();
    await expect(heroCta).toBeVisible();
  });
});