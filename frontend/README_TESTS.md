# E2E Tests Documentation

This document explains how to run and maintain the end-to-end tests for the Bermuda Guesthouse application.

## Overview

The E2E tests are built with [Playwright](https://playwright.dev/) and test critical user flows to ensure the application remains stable and functional across different browsers.

## Test Coverage

We have 5 critical test suites covering:

### 1. Home Page Loading (`home.spec.js`)
- ✅ Verifies header/navigation is present
- ✅ Checks hero section loads correctly
- ✅ Validates main heading and brand elements
- ✅ Ensures language selector and booking buttons are visible
- ✅ Tests responsive navigation elements

### 2. Rooms Flow (`rooms.spec.js`)
- ✅ Navigation from home to rooms section
- ✅ Room detail page loading
- ✅ Back navigation functionality with scroll to #rooms
- ✅ URL state management
- ✅ Room cards interaction

### 3. Gallery Flow (`gallery.spec.js`)
- ✅ Category selection from gallery landing
- ✅ Category page loading and image display
- ✅ Lightbox functionality (open/close)
- ✅ Lightbox navigation (prev/next buttons)
- ✅ Keyboard navigation support
- ✅ Back to categories functionality

### 4. Language Switching (`language.spec.js`)
- ✅ Language selector functionality
- ✅ UI text updates when switching languages
- ✅ Hungarian → English → German → Hungarian flow
- ✅ Navigation elements update correctly
- ✅ Content localization verification

### 5. 404 Error Handling (`404.spec.js`)
- ✅ Non-existent route handling
- ✅ Redirection to home page
- ✅ Invalid room slug handling
- ✅ Invalid gallery category handling
- ✅ Graceful error recovery

## Prerequisites

Make sure you have:

1. **Node.js** installed (v18+ recommended)
2. **Dependencies** installed:
   ```bash
   cd frontend
   npm install
   ```
3. **Playwright browsers** installed:
   ```bash
   npx playwright install
   ```

## Running Tests

### Local Development

```bash
# Run all tests in headless mode (default)
npm run test:e2e

# Run tests with UI (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (shows browser window)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

### CI/CD Environment

```bash
# Run tests on CI servers
npx playwright test

# Generate test report
npx playwright show-report
```

## Test Configuration

The Playwright configuration (`playwright.config.js`) includes:

- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Base URL**: `http://localhost:5173`
- **Test Directory**: `./tests/e2e/`
- **Parallel Execution**: Enabled for faster runs
- **Retry Logic**: 2 retries on CI, 0 locally
- **Trace**: On first retry for debugging
- **Auto Server**: Starts dev server automatically

## Writing New Tests

### Best Practices

1. **Use Stable Selectors**:
   ```javascript
   // ✅ Good - uses semantic roles and IDs
   await expect(page.getByRole('button', { name: 'Book Now' })).toBeVisible();
   await expect(page.locator('#hero')).toBeInViewport();
   
   // ❌ Bad - brittle CSS class selectors
   await expect(page.locator('.btn-primary-large')).toBeVisible();
   ```

2. **Wait for Network Idle**:
   ```javascript
   await page.waitForLoadState('networkidle');
   ```

3. **Use Descriptive Test Names**:
   ```javascript
   test('should navigate gallery and use lightbox controls', async ({ page }) => {
   ```

4. **Test Multiple Browsers**: Tests run automatically on Chromium, Firefox, and WebKit.

### Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');
    
    // Act
    await page.getByRole('button', { name: 'Click me' }).click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Debugging

### Using Test Runner UI
```bash
npm run test:e2e:ui
```
- Shows live browser
- Step-by-step execution
- DOM inspection
- Network monitoring

### Using Debug Mode
```bash
npm run test:e2e:debug
```
- Pauses execution at each step
- Allows manual browser interaction
- Opens DevTools automatically

### Viewing Test Reports
After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Environment Variables

- `CI` - Automatically detected, enables CI-specific settings
- `BASE_URL` - Override default test URL if needed

## Troubleshooting

### Common Issues

1. **Tests fail with "No element found"**
   - Check if the dev server is running
   - Verify selectors are using stable attributes
   - Add explicit waits: `await page.waitForSelector()`

2. **Slow test execution**
   - Reduce unnecessary waits
   - Use `networkidle` instead of fixed timeouts
   - Enable parallel execution

3. **Flaky tests**
   - Add retry logic in config
   - Use more explicit waits
   - Check for race conditions

### Getting Help

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Test Guides](https://playwright.dev/docs/writing-tests)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Maintenance

- **Update dependencies**: Regularly update `@playwright/test`
- **Review test failures**: Address flaky tests promptly  
- **Add tests for new features**: Maintain coverage
- **Clean up outdated tests**: Remove tests for deprecated features

## Future Enhancements

- Visual regression testing
- Performance testing integration
- Mobile-specific test scenarios
- Accessibility testing
- API integration testing