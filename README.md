# Agify API Automated Tests

[![API Tests](https://github.com/Esthertests/Kaluza_test/actions/workflows/test.yml/badge.svg)](https://github.com/Esthertests/Kaluza_test/actions/workflows/test.yml)

Automated API contract and functional tests for the Agify API (https://api.agify.io) using TypeScript, Cucumber, and Playwright.

## Requirements

- Node.js: v20.x or higher
- npm: v10.x or higher

## CI/CD

[GitHub Actions workflow](https://github.com/Estherokafor05/kaluza/actions) runs tests on push/PR and uploads HTML reports as artifacts.

## Setup

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your API key if you have one
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run Playwright tests

```bash
npx playwright test
```

### Generate HTML report

```bash
npm run test:report
```

The HTML report will be generated in `reports/cucumber-report.html`.

### Generate Playwright report

```bash
npx playwright show-report
```

Playwright HTML reports are generated in `test-results/` directory.

### Build TypeScript

```bash
npm run build
```

### Lint code

```bash
npm run lint
```

## Configuration

### Playwright Configuration

The project includes a comprehensive Playwright configuration (`playwright.config.ts`) that supports:
- Multi-browser testing (Chromium, Firefox, WebKit)
- API request context with rate limiting
- Environment-based configuration
- HTML reporting
- Retry logic for CI environments

### Environment Variables

```bash
# API base URL (optional)
AGIFY_BASE_URL=https://api.agify.io

# API key for increased rate limits (optional but recommended)
AGIFY_API_KEY=your-api-key-here

# Request timeout (optional, default: 8000ms)
AGIFY_TIMEOUT=8000
```

**Get an API key:** Visit https://agify.io/store to subscribe and get higher rate limits (1000+ requests/day).

**Usage:**
```bash
# With API key
AGIFY_API_KEY=your-key npm test

# Or create .env file (not committed to git)
echo "AGIFY_API_KEY=your-key" > .env
npm test
```

Default base URL: `https://api.agify.io`

## Test Coverage

The test suite validates:

### Functional Tests
- **Single name requests** - Basic age estimation for individual names
- **Country-specific requests** - Age estimation with country_id parameter for localization
- **Multiple names requests** - Batch processing of multiple names in single API call
- **Missing parameter handling** - API behavior when no parameters are provided (422 error)
- **Empty name parameter** - API handling of empty string name parameter
- **Invalid character handling** - API processing of special characters (@#$%)
- **Invalid country code** - API behavior with invalid country_id values
- **Mixed valid/invalid inputs** - Partial invalid input in batch requests
- **Very long names** - API handling of excessively long input strings (1000+ characters)
- **Stress testing** - API behavior with large number of names (100 names)
- **HTTP method validation** - API rejection of non-GET methods (POST returns 404)
- **Response format validation** - JSON structure and required fields verification

### Contract Tests
- **Response schema validation** - Validates name (string), age (int|null), count (int) fields
- **HTTP status codes** - Tests 200 (success), 422 (unprocessable entity), 404 (not found)
- **Response content-type** - Ensures application/json content type
- **Response time validation** - Performance testing under 2 seconds
- **Multi-browser compatibility** - Cross-browser testing (Chromium, Firefox, WebKit)
- **Array response validation** - Batch requests return proper array format
- **Error message validation** - Correct error messages for missing/invalid parameters

### Test Scenarios (14 Total)

The test suite includes the following specific scenarios:

1. **Single name request** - Basic age estimation for "michael"
2. **Single name with country_id** - Localized age estimation with "US" country code
3. **Multiple names request** - Batch processing of "michael", "matthew", "jane"
4. **Request with no parameters** - Tests 422 error for missing name parameter
5. **Request with empty name parameter** - Tests API handling of empty string
6. **Request with invalid characters** - Tests special characters "@#$%"
7. **Request with invalid country code** - Tests invalid country_id "XYZ"
8. **Multiple names with partial invalid input** - Mixed valid/invalid names
9. **Request with excessively long name** - Tests 1000+ character names
10. **Request with many names (stress test)** - Tests 100 names (expects 422 error)
11. **Validate HTTP status code 200** - Confirms success status for valid requests
12. **Validate HTTP status code for invalid requests** - Confirms 422 for missing parameters
13. **Verify response format (JSON structure)** - Validates response schema and required fields
14. **Verify API rejects non-GET methods** - Tests POST method rejection (404 error)

### Playwright Integration
- API request context with built-in rate limiting
- Browser-based testing capabilities
- Cross-browser test execution
- Enhanced error handling and retry logic
- Comprehensive HTML reporting

## Project Structure

```
.
├── package.json
├── package-lock.json
├── tsconfig.json
├── playwright.config.ts
├── cucumber.js
├── eslint.config.mjs
├── src/
│   ├── config/
│   │   └── api.ts
│   └── schemas/
│       └── agifyResponse.ts
├── tests/
│   ├── features/
│   │   └── agify.feature
│   ├── steps/
│   │   └── agify.steps.ts
│   └── world/
│       └── customWorld.ts
├── reports/
│   └── cucumber-report.html
├── test-results/
└── README.md
```

## Technologies Used

- **@cucumber/cucumber** (v10.9.0): BDD test framework
- **@playwright/test** (v1.56.1): Browser automation and API testing
- **playwright** (v1.56.1): Core Playwright library
- **TypeScript** (v5.7.2): Type-safe JavaScript
- **ts-node** (v10.9.2): TypeScript execution
- **dotenv** (v17.2.3): Environment variable management
- **eslint** (v9.17.0): Linting with TypeScript support
- **@types/node** (v20.17.9): Node.js type definitions

## Assumptions

The following assumptions were made based on observed API behavior:

1. **Empty name parameter**: The API accepts `name=` (empty string) and returns 200 with a valid response rather than rejecting it as invalid. This is documented in the test scenarios.

2. **Whitespace-only names**: The API accepts names containing only whitespace (e.g., "   ") and returns 200 with a valid response.

3. **Missing name parameter**: The API returns 422 (Unprocessable Entity) when the `name` parameter is completely missing from the request.

4. **Response time SLA**: A 2-second response time threshold was chosen as a reasonable performance baseline for a public API.

5. **Very long names**: The API was tested with 1000-character names to validate edge case handling.

## Known Issues and Observations

1. **Rate Limiting**:
   - Free tier: 100 requests per day
   - Rate limit resets at midnight UTC
   - If you see 429 errors, either wait for reset or get an API key from https://agify.io/store
   - With an API key, you get 1000+ requests/day
   - Check remaining quota: `curl -I "https://api.agify.io/?name=test"` (look for `x-rate-limit-remaining`)

2. The Agify API does not strictly validate input and accepts empty/whitespace names, returning valid responses rather than client errors. This behavior is documented in the test scenarios.

3. The API returns `age: null` for names with insufficient data, which is correctly validated by the schema.

4. Unicode names are properly handled by the API (tested with José, Özil, 李).

## Test Results

When not rate-limited:
- 14 scenarios (14 passed)
- 59 steps (59 passed)
- Execution time: ~2.3 seconds

**Note:** If running tests multiple times in quick succession, you may hit the API rate limit. Space out test runs by a few minutes for consistent results.

See `reports/cucumber-report.html` for detailed test results.
