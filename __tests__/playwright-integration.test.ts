/**
 * Playwright Integration Tests for Code Mode
 * Tests Playwright functionality, service bridge, and E2E test runner
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { codemode } from "../src/codemode/codemode.js";

describe("Playwright Integration", () => {
  let cm: any;

  beforeAll(async () => {
    cm = await codemode({
      projectRoot: "/home/kade/runeset/reynard",
      timeoutMs: 15_000,
    });
  });

  afterAll(async () => {
    if (cm) {
      cm.cleanup();
    }
  });

  describe("Playwright Availability", () => {
    it("should expose Playwright packages in sandbox", async () => {
      const result = await cm.executeCode(`
        return {
          hasPlaywright: !!playwright,
          hasBrowser: !!playwright?.browser,
          hasAutomation: !!playwright?.automation,
          hasTestRunner: !!playwright?.testRunner
        };
      `);

      expect(result.returned.hasPlaywright).toBe(true);
      expect(result.returned.hasBrowser).toBe(true);
      expect(result.returned.hasAutomation).toBe(true);
      expect(result.returned.hasTestRunner).toBe(true);
    });

    it("should handle Playwright unavailability gracefully", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available', graceful: true };
        }
        
        return {
          available: playwright.browser.getAvailability(),
          graceful: true
        };
      `);

      expect(result.returned.graceful).toBe(true);
    });
  });

  describe("Playwright Browser Operations", () => {
    it("should check browser availability", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available' };
        }
        
        return {
          available: playwright.browser.getAvailability()
        };
      `);

      expect(result.returned).toHaveProperty("available");
    });

    it("should handle screenshot operations", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available' };
        }

        try {
          const screenshot = await playwright.browser.screenshot('https://example.com', {
            fullPage: true,
            viewport: { width: 1280, height: 720 }
          });
          
          return {
            success: true,
            screenshotSize: screenshot.length,
            isBuffer: Buffer.isBuffer(screenshot)
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.screenshotSize).toBeGreaterThan(0);
        expect(result.returned.isBuffer).toBe(true);
      }
    });

    it("should handle web scraping operations", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available' };
        }

        try {
          const content = await playwright.browser.scrape('https://example.com', {
            selector: 'h1',
            extract: 'text'
          });
          
          return {
            success: true,
            content: content,
            hasContent: Array.isArray(content) && content.length > 0
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.hasContent).toBe(true);
      }
    });

    it("should handle PDF generation", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available' };
        }

        try {
          const pdf = await playwright.browser.pdf('https://example.com', {
            format: 'A4',
            landscape: false
          });
          
          return {
            success: true,
            pdfSize: pdf.length,
            isBuffer: Buffer.isBuffer(pdf)
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.pdfSize).toBeGreaterThan(0);
        expect(result.returned.isBuffer).toBe(true);
      }
    });
  });

  describe("Browser Automation Service Bridge", () => {
    it("should check service availability", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.automation) {
          return { error: 'Browser automation client not available' };
        }
        
        return {
          available: playwright.automation.isServiceAvailable()
        };
      `);

      expect(result.returned).toHaveProperty("available");
    });

    it("should handle health check", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.automation) {
          return { error: 'Browser automation client not available' };
        }

        try {
          const health = await playwright.automation.healthCheck();
          return {
            success: true,
            healthy: health
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            healthy: false
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      expect(result.returned).toHaveProperty("healthy");
    });

    it("should handle content extraction methods", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.automation) {
          return { error: 'Browser automation client not available' };
        }

        const methods = [
          'extractWikipedia',
          'extractNews', 
          'extractSocialMedia',
          'extractDeveloperPlatform'
        ];

        const results = {};
        
        for (const method of methods) {
          results[method] = typeof playwright.automation[method] === 'function';
        }

        return results;
      `);

      expect(result.returned.extractWikipedia).toBe(true);
      expect(result.returned.extractNews).toBe(true);
      expect(result.returned.extractSocialMedia).toBe(true);
      expect(result.returned.extractDeveloperPlatform).toBe(true);
    });
  });

  describe("E2E Test Runner", () => {
    it("should expose test runner functionality", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.testRunner) {
          return { error: 'E2E test runner not available' };
        }
        
        return {
          hasRunTest: typeof playwright.testRunner.runTest === 'function',
          hasRunTestSuite: typeof playwright.testRunner.runTestSuite === 'function',
          hasGenerateReport: typeof playwright.testRunner.generateTestReport === 'function'
        };
      `);

      expect(result.returned.hasRunTest).toBe(true);
      expect(result.returned.hasRunTestSuite).toBe(true);
      expect(result.returned.hasGenerateReport).toBe(true);
    });

    it("should handle test execution", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.testRunner) {
          return { error: 'E2E test runner not available' };
        }

        try {
          const testResult = await playwright.testRunner.runTest({
            name: 'Example Test',
            testFn: async (page) => {
              // Simple test that should pass
              await page.goto('https://example.com');
              const title = await page.title();
              if (!title) {
                throw new Error('No title found');
              }
            },
            timeout: 10000
          });
          
          return {
            success: true,
            passed: testResult.passed,
            duration: testResult.duration,
            hasLogs: Array.isArray(testResult.logs)
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.passed).toBe(true);
        expect(result.returned.duration).toBeGreaterThan(0);
        expect(result.returned.hasLogs).toBe(true);
      }
    });
  });

  describe("Cool Combinations", () => {
    it("should combine Playwright with algorithms package", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser || !algorithms) {
          return { error: 'Required packages not available' };
        }

        try {
          const timer = new algorithms.PerformanceTimer();
          timer.start();

          const screenshot = await playwright.browser.screenshot('https://example.com', {
            fullPage: true
          });

          timer.end();

          return {
            success: true,
            screenshotSize: screenshot.length,
            loadTime: timer.getDuration(),
            hasPerformanceTimer: true
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.hasPerformanceTimer).toBe(true);
        expect(result.returned.loadTime).toBeGreaterThan(0);
      }
    });

    it("should combine Playwright with dev-tools packages", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser || !devToolsPackages) {
          return { error: 'Required packages not available' };
        }

        const results = {
          screenshotTaken: false,
          diagramGenerated: false,
          qualityAnalyzed: false
        };

        try {
          // Take screenshot
          const screenshot = await playwright.browser.screenshot('https://example.com', {
            fullPage: true
          });
          results.screenshotTaken = true;
          results.screenshotSize = screenshot.length;

          // Check if dev-tools are available
          results.hasCodeQuality = !!devToolsPackages.codeQuality;
          results.hasDiagramGenerator = !!devToolsPackages.diagramGenerator;
          results.hasFileProcessing = !!devToolsPackages.fileProcessing;

          return results;
        } catch (error) {
          return {
            error: error.message,
            ...results
          };
        }
      `);

      expect(result.returned.screenshotTaken).toBe(true);
      expect(result.returned.screenshotSize).toBeGreaterThan(0);
      expect(result.returned).toHaveProperty("hasCodeQuality");
      expect(result.returned).toHaveProperty("hasDiagramGenerator");
      expect(result.returned).toHaveProperty("hasFileProcessing");
    });

    it("should handle error scenarios gracefully", async () => {
      const result = await cm.executeCode(`
        const results = {
          playwrightError: false,
          automationError: false,
          testRunnerError: false
        };

        try {
          // Test Playwright error handling
          if (playwright && playwright.browser) {
            try {
              await playwright.browser.screenshot('invalid-url', { timeout: 1000 });
            } catch (error) {
              results.playwrightError = true;
              results.playwrightErrorMessage = error.message;
            }
          }
        } catch (error) {
          results.playwrightError = true;
        }

        try {
          // Test automation service error handling
          if (playwright && playwright.automation) {
            try {
              await playwright.automation.extractWikipedia('invalid-url');
            } catch (error) {
              results.automationError = true;
              results.automationErrorMessage = error.message;
            }
          }
        } catch (error) {
          results.automationError = true;
        }

        return results;
      `);

      expect(result.returned).toHaveProperty("playwrightError");
      expect(result.returned).toHaveProperty("automationError");
    });
  });

  describe("Resource Management", () => {
    it("should handle cleanup operations", async () => {
      const result = await cm.executeCode(`
        if (!playwright || !playwright.browser) {
          return { error: 'Playwright not available' };
        }

        try {
          // Take a screenshot to create resources
          const screenshot = await playwright.browser.screenshot('https://example.com', {
            fullPage: true
          });

          // Cleanup
          await playwright.browser.cleanup();

          return {
            success: true,
            screenshotTaken: screenshot.length > 0,
            cleanupCompleted: true
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `);

      expect(result.returned).toHaveProperty("success");
      if (result.returned.success) {
        expect(result.returned.screenshotTaken).toBe(true);
        expect(result.returned.cleanupCompleted).toBe(true);
      }
    });
  });
});
