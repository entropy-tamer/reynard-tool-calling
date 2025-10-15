/**
 * E2E Test Runner for Code Mode
 * Wrapper for running Playwright tests from Code Mode sandbox
 */

// Optional import - may not be available in sandbox environment
// Disabled to prevent import errors in sandbox environment
import { chromium } from "playwright";

import type { TestResult } from "./types.js";

export interface TestConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  baseUrl?: string;
  screenshotOnFailure?: boolean;
  videoOnFailure?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  testFn: (page: any) => Promise<void>;
  timeout?: number;
}

/**
 *
 */
export class E2ETestRunner {
  private browser: any = null;
  private context: any = null;
  private config: TestConfig;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: TestConfig = {}) {
    this.config = {
      headless: true,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
      screenshotOnFailure: true,
      videoOnFailure: false,
      ...config,
    };
  }

  /**
   *
   * @example
   */
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        timeout: this.config.timeout,
      });

      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        recordVideo: this.config.videoOnFailure ? { dir: "test-results/videos" } : undefined,
      });
    } catch (error) {
      throw new Error(`Failed to initialize test runner: ${error}`);
    }
  }

  /**
   *
   * @param testCase
   * @example
   */
  async runTest(testCase: TestCase): Promise<TestResult> {
    if (!this.context) {
      await this.initialize();
    }

    const page = await this.context!.newPage();
    const startTime = Date.now();
    const logs: string[] = [];
    const screenshots: string[] = [];

    try {
      // Set up console logging
      page.on("console", (msg: any) => {
        logs.push(`[${msg.type()}] ${msg.text()}`);
      });

      // Set up error handling
      page.on("pageerror", (error: any) => {
        logs.push(`[ERROR] ${error.message}`);
      });

      // Set up request/response logging
      page.on("request", (request: any) => {
        logs.push(`[REQUEST] ${request.method()} ${request.url()}`);
      });

      page.on("response", (response: any) => {
        logs.push(`[RESPONSE] ${response.status()} ${response.url()}`);
      });

      // Run the test
      await Promise.race([
        testCase.testFn(page),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Test timeout")), testCase.timeout ?? this.config.timeout)
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
      if (this.config.screenshotOnFailure) {
        try {
          await page.screenshot({
            fullPage: true,
            path: `test-results/screenshots/failure-${Date.now()}.png`,
          });
          screenshots.push(`test-results/screenshots/failure-${Date.now()}.png`);
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
   *
   * @param testSuite
   * @example
   */
  async runTestSuite(testSuite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];

    console.log(`Running test suite: ${testSuite.name}`);

    for (const testCase of testSuite.tests) {
      console.log(`  Running test: ${testCase.name}`);
      const result = await this.runTest(testCase);
      results.push(result);

      if (result.passed) {
        console.log(`  ✅ ${testCase.name} passed (${result.duration}ms)`);
      } else {
        console.log(`  ❌ ${testCase.name} failed: ${result.error}`);
      }
    }

    return results;
  }

  /**
   *
   * @param testSuites
   * @example
   */
  async runMultipleTestSuites(testSuites: TestSuite[]): Promise<{ [suiteName: string]: TestResult[] }> {
    const allResults: { [suiteName: string]: TestResult[] } = {};

    for (const testSuite of testSuites) {
      allResults[testSuite.name] = await this.runTestSuite(testSuite);
    }

    return allResults;
  }

  /**
   *
   * @param results
   * @example
   */
  async generateTestReport(results: TestResult[]): Promise<string> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    const report = `
# Test Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(2)}%
- **Total Duration**: ${totalDuration}ms

## Test Results

${results
  .map(
    (result, index) => `
### Test ${index + 1}
- **Status**: ${result.passed ? "✅ PASSED" : "❌ FAILED"}
- **Duration**: ${result.duration}ms
${result.error ? `- **Error**: ${result.error}` : ""}
${result.screenshots?.length ? `- **Screenshots**: ${result.screenshots.join(", ")}` : ""}
${result.logs?.length ? `- **Logs**: ${result.logs.slice(0, 5).join(", ")}${result.logs.length > 5 ? "..." : ""}` : ""}
`
  )
  .join("\n")}
`;

    return report;
  }

  /**
   *
   * @example
   */
  async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.warn("Error during test runner cleanup:", error);
    }
  }
}

// Export singleton instance
export const e2eTestRunner = new E2ETestRunner();
