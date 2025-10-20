# Playwright Code Mode - Modular Architecture

This directory contains a well-organized, modular TypeScript implementation for Playwright browser automation capabilities.

## 📁 Directory Structure

```
playwright/
├── types/                    # Type definitions organized by domain
│   ├── browser.ts           # Browser configuration and options
│   ├── interactions.ts      # User interactions and JavaScript execution
│   ├── content.ts          # Content extraction results
│   ├── testing.ts          # Test execution and reporting
│   ├── client.ts           # Client interface definitions
│   └── index.ts            # Central type exports
├── core/                    # Core functionality
│   ├── browser-manager.ts  # Browser lifecycle management
│   ├── request-manager.ts  # HTTP client management
│   └── index.ts            # Core exports
├── operations/              # Direct browser operations
│   ├── screenshot.ts       # Screenshot capture
│   ├── scraping.ts         # Content scraping
│   ├── pdf.ts             # PDF generation
│   └── index.ts           # Operations exports
├── services/               # Service layer implementations
│   ├── extractors.ts      # Content extraction methods
│   ├── simple-operations.ts # Basic operations
│   ├── browser-operations.ts # Complex operations
│   ├── client-methods.ts  # Client method implementations
│   └── index.ts          # Service exports
├── clients/               # Client implementations
│   ├── playwright-wrapper.ts # Direct Playwright wrapper
│   ├── browser-automation-client.ts # Python service bridge
│   └── index.ts          # Client exports
├── testing/              # Testing utilities
│   ├── test-runner.ts    # E2E test runner
│   ├── test-executor.ts  # Test execution
│   ├── test-reporter.ts  # Test reporting
│   └── index.ts         # Testing exports
├── index.ts             # Main exports
└── README.md           # This file
```

## 🎯 Key Features

### Modular Design

- **Single Responsibility**: Each module has a focused purpose
- **Clear Separation**: Types, core functionality, operations, services, and clients are separated
- **Easy Maintenance**: Changes to one module don't affect others

### Type Safety

- **Domain-Specific Types**: Types are organized by functionality
- **Comprehensive Coverage**: All interfaces and types are properly defined
- **Zero TypeScript Errors**: Full type checking passes

### Multiple Client Options

- **Direct Playwright**: For simple browser automation
- **Service Bridge**: For advanced operations via Python FastAPI service
- **Testing Framework**: For E2E test execution

## 🚀 Usage Examples

### Direct Playwright Operations

```typescript
import { playwrightWrapper } from "./playwright/clients/playwright-wrapper.js";

// Take a screenshot
const screenshot = await playwrightWrapper.screenshot("https://example.com");

// Scrape content
const content = await playwrightWrapper.scrape("https://example.com", {
  selector: ".article",
  extract: "text",
});
```

### Browser Automation Service

```typescript
import { browserAutomationClient } from "./playwright/clients/browser-automation-client.js";

// Extract Wikipedia content
const wikiContent = await browserAutomationClient.extractWikipedia("https://en.wikipedia.org/wiki/JavaScript");

// Perform interactions
const interactions = [
  { type: "click", selector: "#login-button" },
  { type: "type", selector: "#username", text: "user@example.com" },
];
const result = await browserAutomationClient.interact("https://example.com/login", interactions);
```

### Testing

```typescript
import { testRunner } from "./playwright/testing/test-runner.js";

const testSuite = {
  name: "Login Tests",
  tests: [
    {
      name: "Valid login",
      testFn: async page => {
        await page.goto("/login");
        await page.fill("#username", "user");
        await page.click("#submit");
      },
    },
  ],
};

const results = await testRunner.runTestSuite(testSuite);
```

## 🔧 Development

### Type Checking

```bash
npx tsc --noEmit --project . --skipLibCheck
```

### Linting

```bash
npx eslint src/codemode/playwright/
```

## 📋 Migration Notes

This modular structure replaces the previous monolithic files:

- `types.ts` → `types/` directory with domain-specific files
- `playwright-wrapper.ts` → `clients/playwright-wrapper.ts`
- `browser-automation-client.ts` → `clients/browser-automation-client.ts`
- Service files moved to `services/` directory
- Testing files moved to `testing/` directory

All imports have been updated to use the new modular structure, and the main `index.ts` provides a clean API for importing functionality.
