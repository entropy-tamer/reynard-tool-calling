/**
 * @file Test execution utilities for E2E test runner
 *
 * This module provides test execution functionality including individual test
 * execution, event handling setup, and test lifecycle management. It handles
 * the complex logic of running tests with proper error handling and logging.
 */

import { BrowserContext, Page, ConsoleMessage, Request, Response } from "playwright";
import type { TestResult, TestCase, TestConfig } from "../types/index.js";

/**
 * Executes a single test case with proper setup and teardown.
 *
 * This function runs a test case with comprehensive logging, error handling,
 * and screenshot capture on failure. It sets up event listeners for console
 * messages, page errors, and network requests to provide detailed test output.
 *
 * @param {BrowserContext} context - The browser context to run the test in
 * @param {TestCase} testCase - The test case to execute
 * @param {TestConfig} config - Test configuration options
 * @returns {Promise<TestResult>} Test execution results
 *
 * @example
 * ```typescript
 * const result = await executeTest(context, {
 *   name: 'Login test',
 *   testFn: async (page) => {
 *     await page.goto('/login');
 *     await page.fill('#username', 'user');
 *     await page.click('#submit');
 *   }
 * }, config);
 * ```
 */
export async function executeTest(
  context: BrowserContext,
  testCase: TestCase,
  config: TestConfig
): Promise<TestResult> {
  const page = await context.newPage();
  const startTime = Date.now();
  const logs: string[] = [];
  const screenshots: string[] = [];

  try {
    // Set up console logging
    page.on("console", (msg: ConsoleMessage) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Set up error handling
    page.on("pageerror", (error: Error) => {
      logs.push(`[ERROR] ${error.message}`);
    });

    // Set up request/response logging
    page.on("request", (request: Request) => {
      logs.push(`[REQUEST] ${request.method()} ${request.url()}`);
    });

    page.on("response", (response: Response) => {
      logs.push(`[RESPONSE] ${response.status()} ${response.url()}`);
    });

    // Run the test with timeout
    await Promise.race([
      testCase.testFn(page),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Test timeout")), testCase.timeout ?? config.timeout)
      ),
    ]);

    return {
      passed: true,
      duration: Date.now() - startTime,
      logs,
      screenshots,
    };
  } catch (error) {
    // Take screenshot on failure
    if (config.screenshotOnFailure) {
      try {
        const screenshotPath = `test-results/screenshots/failure-${Date.now()}.png`;
        await page.screenshot({
          fullPage: true,
          path: screenshotPath,
        });
        screenshots.push(screenshotPath);
      } catch (screenshotError) {
        logs.push(`[ERROR] Failed to take screenshot: ${screenshotError}`);
      }
    }

    return {
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
      logs,
      screenshots,
    };
  } finally {
    await page.close();
  }
}

/**
 * Sets up event listeners for a page to capture logs and errors.
 *
 * This function configures event listeners on a page to capture console
 * messages, page errors, and network activity for test debugging and
 * reporting purposes.
 *
 * @param {Page} page - The page to set up event listeners on
 * @param {string[]} logs - Array to store captured logs
 *
 * @example
 * ```typescript
 * const logs: string[] = [];
 * setupEventListeners(page, logs);
 * // Now logs will be captured automatically
 * ```
 */
export function setupEventListeners(page: Page, logs: string[]): void {
  page.on("console", (msg: ConsoleMessage) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (error: Error) => {
    logs.push(`[ERROR] ${error.message}`);
  });

  page.on("request", (request: Request) => {
    logs.push(`[REQUEST] ${request.method()} ${request.url()}`);
  });

  page.on("response", (response: Response) => {
    logs.push(`[RESPONSE] ${response.status()} ${response.url()}`);
  });
}

/**
 * Captures a screenshot on test failure with error handling.
 *
 * This function attempts to capture a full-page screenshot when a test
 * fails, with proper error handling to ensure the test execution
 * continues even if screenshot capture fails.
 *
 * @param {Page} page - The page to capture a screenshot of
 * @param {string[]} screenshots - Array to store screenshot paths
 * @param {string[]} logs - Array to store any error messages
 * @returns {Promise<void>} Resolves when screenshot capture is complete
 *
 * @example
 * ```typescript
 * const screenshots: string[] = [];
 * const logs: string[] = [];
 * await captureFailureScreenshot(page, screenshots, logs);
 * ```
 */
export async function captureFailureScreenshot(page: Page, screenshots: string[], logs: string[]): Promise<void> {
  try {
    const screenshotPath = `test-results/screenshots/failure-${Date.now()}.png`;
    await page.screenshot({
      fullPage: true,
      path: screenshotPath,
    });
    screenshots.push(screenshotPath);
  } catch (screenshotError) {
    logs.push(`[ERROR] Failed to take screenshot: ${screenshotError}`);
  }
}
