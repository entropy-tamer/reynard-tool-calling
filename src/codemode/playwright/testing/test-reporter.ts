/**
 * @file Test reporting utilities for E2E test runner
 *
 * This module provides test reporting functionality including test result
 * aggregation, report generation, and result analysis. It creates detailed
 * markdown reports with test statistics and failure analysis.
 */

import type { TestResult } from "../types/index.js";

/**
 * Generates a comprehensive test report from test results.
 *
 * This function creates a detailed markdown report that includes test
 * statistics, individual test results, error details, and performance
 * metrics. The report is formatted for easy reading and debugging.
 *
 * @param {TestResult[]} results - Array of test results to include in the report
 * @returns {Promise<string>} Generated markdown report
 *
 * @example
 * ```typescript
 * const results = await runTestSuite(testSuite);
 * const report = await generateTestReport(results);
 * console.log(report);
 * ```
 */
export async function generateTestReport(results: TestResult[]): Promise<string> {
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
 * Analyzes test results and provides performance insights.
 *
 * This function analyzes test results to provide insights about test
 * performance, common failure patterns, and optimization opportunities.
 *
 * @param {TestResult[]} results - Array of test results to analyze
 * @returns {Object} Analysis results with performance metrics
 *
 * @example
 * ```typescript
 * const results = await runTestSuite(testSuite);
 * const analysis = analyzeTestResults(results);
 * console.log(`Average test duration: ${analysis.averageDuration}ms`);
 * ```
 */
export function analyzeTestResults(results: TestResult[]) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = totalDuration / totalTests;

  const slowestTest = results.reduce((slowest, current) => (current.duration > slowest.duration ? current : slowest));

  const fastestTest = results.reduce((fastest, current) => (current.duration < fastest.duration ? current : fastest));

  const errorTypes = results
    .filter(r => !r.passed && r.error)
    .reduce(
      (acc, result) => {
        const errorType = result.error?.split(":")[0] || "Unknown";
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: (passedTests / totalTests) * 100,
    totalDuration,
    averageDuration,
    slowestTest: {
      duration: slowestTest.duration,
      error: slowestTest.error,
    },
    fastestTest: {
      duration: fastestTest.duration,
    },
    errorTypes,
  };
}

/**
 * Formats test results for console output.
 *
 * This function creates a formatted string suitable for console output,
 * providing a quick overview of test results with color-coded status
 * indicators and key metrics.
 *
 * @param {TestResult[]} results - Array of test results to format
 * @returns {string} Formatted console output
 *
 * @example
 * ```typescript
 * const results = await runTestSuite(testSuite);
 * console.log(formatConsoleOutput(results));
 * ```
 */
export function formatConsoleOutput(results: TestResult[]): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  let output = `\n📊 Test Results Summary\n`;
  output += `═══════════════════════\n`;
  output += `Total Tests: ${totalTests}\n`;
  output += `✅ Passed: ${passedTests}\n`;
  output += `❌ Failed: ${failedTests}\n`;
  output += `⏱️  Total Duration: ${totalDuration}ms\n`;
  output += `📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%\n\n`;

  if (failedTests > 0) {
    output += `❌ Failed Tests:\n`;
    results
      .filter(r => !r.passed)
      .forEach((result, index) => {
        output += `  ${index + 1}. ${result.error}\n`;
      });
  }

  return output;
}
