# Test Framework Documentation

## Overview
This project uses **Playwright** for End-to-End (E2E) testing. The architecture is designed for scalability, reliability, and ease of maintenance.

## Structure
```
tests/
├── e2e/                      # Test files (*.spec.ts)
├── support/                  # Framework infrastructure
│   ├── fixtures/             # Test fixtures and composition
│   │   ├── factories/        # Data factories (UserFactory, etc.)
│   │   └── index.ts          # Main fixture entry point
│   └── helpers/              # Shared utility functions
└── README.md                 # This file
```

## Setup
1. **Install Dependencies:**
   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. **Environment:**
   Ensure your `.env` file contains the necessary test variables (see `.env.example`).
   ```bash
   cp .env.example .env
   ```

## Running Tests
- **Run all tests:**
  ```bash
  npm run test:e2e
  ```
- **Run with UI:**
  ```bash
  npx playwright test --ui
  ```
- **Debug mode:**
  ```bash
  npx playwright test --debug
  ```

## Architecture Patterns

### Fixtures
We use Playwright's fixture system to inject dependencies and manage state.
**Do not** import factories directly in tests. Use the fixture argument.

```typescript
// ✅ GOOD
test('example', async ({ userFactory }) => { ... });
```

### Data Factories
Factories are located in `tests/support/fixtures/factories`. They handle:
- Data generation (using Faker)
- API interaction (for seeding)
- Auto-cleanup (via the `cleanup()` method called by the fixture)

### Selector Strategy
Prefer user-facing locators or data attributes:
1. `page.getByRole('button', { name: 'Save' })`
2. `page.getByText('Welcome')`
3. `page.locator('[data-testid="submit-btn"]')`

**Avoid** XPath or brittle CSS selectors like `div > div:nth-child(3)`.
