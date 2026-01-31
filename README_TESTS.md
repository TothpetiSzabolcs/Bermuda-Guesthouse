# Testing Documentation

This document provides instructions for running and understanding the test suite for the Guesthouse application.

## Backend Tests

### Overview

The backend uses **Vitest** as the testing framework with **Supertest** for API endpoint testing. Tests are located in the `backend/tests/` directory.

### Prerequisites

1. MongoDB should be running (either locally or via Docker)
2. Environment variables should be properly configured in `backend/.env`

### Environment Variables for Testing

Make sure your `backend/.env` file includes:

```env
MONGODB_URI=mongodb://localhost:27017/guesthouse
MONGODB_TEST_URI=mongodb://localhost:27017/guesthouse_test
```

The test suite uses a separate test database to avoid interfering with development data.

### Running Tests

#### Run all tests
```bash
cd backend
npm test
```

#### Run tests in watch mode
```bash
cd backend
npm run test -- --watch
```

#### Run specific test file
```bash
cd backend
npm run tests tests/public-gallery.test.js
```

#### Run tests with coverage
```bash
cd backend
npm run test -- --coverage
```

### Test Structure

#### Public Gallery API Tests (`tests/public-gallery.test.js`)

This test suite covers all public gallery endpoints:

- **GET /api/public/gallery** - Main gallery listing with pagination and filtering
  - Pagination validation (page, limit, hasNext, hasPrev)
  - Category filtering
  - Resource type filtering (image/video)
  - Sorting (new/old)
  - Error handling (missing propertySlug, non-existent property)

- **GET /api/public/gallery/covers** - Category covers
  - Returns cover images/videos for each category
  - Prefers `isCover=true` items
  - Supports custom category lists
  - Error handling for missing parameters

- **GET /api/public/gallery/stats** - Gallery statistics
  - Total count
  - Breakdown by category
  - Breakdown by resource type
  - Error handling for missing parameters

- **GET /api/public/gallery/random** - Random gallery items
  - Returns random items with optional limit
  - Category filtering support
  - Error handling for missing parameters

### Test Data

Tests use a dedicated test database and create isolated test data:
- Test property with known slug (`test-property`)
- Sample gallery images and videos with different categories
- Mix of active/inactive items to test filtering

Tests automatically clean up after themselves using `afterAll` hooks.

### API Contract Validation

All tests validate:
- HTTP status codes
- Response structure and required fields
- Data types and formats
- Business logic (pagination, filtering, sorting)
- Error handling and edge cases

### Adding New Tests

When adding new API endpoints, follow this pattern:

1. Create descriptive test groups with `describe()`
2. Use `beforeAll()` to set up test data
3. Use `afterAll()` to clean up test data
4. Test both happy path and error cases
5. Validate response structure and business logic
6. Include edge cases and boundary conditions

Example test structure:
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'

describe('New API Endpoint', () => {
  beforeAll(async () => {
    // Setup test data
  })

  afterAll(async () => {
    // Cleanup test data
  })

  it('should return correct response', async () => {
    const response = await request(app)
      .get('/api/new-endpoint')
      .query({ requiredParam: 'value' })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('expectedField')
  })
})
```

### Troubleshooting

#### Tests fail with database connection error
- Ensure MongoDB is running
- Check MONGODB_URI and MONGODB_TEST_URI environment variables
- Verify database permissions

#### Tests timeout
- Check if database operations are completing
- Look for infinite loops or hanging promises
- Consider increasing timeout if operations are legitimately slow

#### Port conflicts
- Ensure no other instances of the app are running
- Check that the test server isn't conflicting with development server

### Continuous Integration

These tests are designed to run in CI/CD environments. The test suite:
- Uses isolated test database
- Cleans up after itself
- Has no external dependencies besides MongoDB
- Runs quickly (< 30 seconds typical)

For CI configuration, ensure:
- MongoDB is available as a service
- Environment variables are properly set
- Test timeout allows for database operations