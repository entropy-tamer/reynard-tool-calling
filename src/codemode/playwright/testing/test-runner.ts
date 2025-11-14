/**
 * @file E2E Test Runner - Playwright-based test execution
 *
 * This module provides a comprehensive E2E test runner using Playwright for
 * browser automation. It supports test suites, individual test execution,
 * detailed reporting, and proper resource management with cleanup.
 */

import { Browser, BrowserContext, chromium } from "playwright";
import type { TestSuite, TestConfig, TestResult } from "../types/index.js";
import { executeTest } from "./test-executor.js";

/**
 * E2E test runner that executes tests using Playwright browser automation.
 *
 * This class provides comprehensive test execution capabilities including
 * test suite management, browser lifecycle management, and detailed
 * reporting. It handles browser setup, test execution, and cleanup
 * automatically.
 *
 * @example
 * ```typescript
 * const runner = new TestRunner();
 *
 * const testSuite = {
 *   name: 'Login Tests',
 *   tests: [
 *     {
 *       name: 'Valid login',
 *       testFn: async (page) => {
 *         await page.goto('/login');
 *         await page.fill('#username', 'user');
 *         await page.click('#submit');
 *       }
 *     }
 *   ]
 * };
 *
 * const results = await runner.runTestSuite(testSuite);
 * console.log(`Tests passed: ${results.filter(r => r.passed).length}`);
 * ```
 */
export class TestRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  /**
   * Creates a new TestRunner instance.
   *
   * The constructor initializes the test runner but does not create browser
   * instances. Browsers are created lazily when tests are executed to
   * optimize resource usage.
   *
   * @example
   * ```typescript
   * const runner = new TestRunner();
   * // Browser will be created when tests are run
   * ```
   */
  constructor() {
    // Browser instances are created lazily
  }

  /**
   * Initialize browser and context
   * @param config
   */
  async initialize(config: TestConfig = {}): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: config.headless ?? true,
        timeout: config.timeout ?? 30000,
      });

      const contextOptions: { viewport: { width: number; height: number }; userAgent?: string } = {
        viewport: config.viewport ?? { width: 1280, height: 720 },
      };
      if (config.userAgent) {
        contextOptions.userAgent = config.userAgent;
      }
      this.context = await this.browser.newContext(contextOptions);
    } catch (error) {
      throw new Error(`Failed to initialize test runner: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Run single test suite
   * @param testSuite
   * @param config
   */
  async runTestSuite(testSuite: TestSuite, config: TestConfig = {}): Promise<TestResult[]> {
    if (!this.context) {
      await this.initialize(config);
    }

    const results: TestResult[] = [];

    for (const testCase of testSuite.tests) {
      const result = await executeTest(this.context!, testCase, config);
      results.push(result);
    }

    return results;
  }

  /**
   * Run multiple test suites
   * @param testSuites
   * @param config
   */
  async runMultipleTestSuites(testSuites: TestSuite[], config: TestConfig = {}): Promise<TestResult[]> {
    const allResults: TestResult[] = [];

    for (const testSuite of testSuites) {
      const suiteResults = await this.runTestSuite(testSuite, config);
      allResults.push(...suiteResults);
    }

    return allResults;
  }

  /**
   * @example
   * Cleanup browser resources
   */
  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const testRunner = new TestRunner();
export const e2eTestRunner = testRunner;
