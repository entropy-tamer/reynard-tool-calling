/**
 * @file Playwright wrapper for Code Mode sandbox
 *
 * This module provides a comprehensive wrapper around Playwright's browser automation
 * capabilities, designed specifically for use within the Code Mode sandbox environment.
 * It offers simplified access to common browser operations like screenshots, web scraping,
 * PDF generation, and test execution with proper resource management and error handling.
 *
 * Key features:
 * - Automatic browser lifecycle management
 * - Graceful fallback when Playwright is not available
 * - Resource cleanup to prevent memory leaks
 * - Simplified API for common browser automation tasks
 * - Support for both headless and headed browser modes
 * - Comprehensive error handling and logging
 *
 * The wrapper is designed to be used in sandboxed environments where Playwright
 * may not be available, providing graceful degradation and clear error messages.
 *
 * @author Reynard AI Tool-Calling System
 * @version 1.0.0
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { playwrightWrapper } from './playwright-wrapper';
 *
 * // Take a screenshot
 * const screenshot = await playwrightWrapper.screenshot('https://example.com');
 *
 * // Scrape content
 * const content = await playwrightWrapper.scrape('https://example.com', {
 *   selector: 'h1',
 *   extract: 'text'
 * });
 * ```
 */

import { Browser, chromium } from "playwright";

import type { ScreenshotOptions, ScrapeOptions, PDFOptions, BrowserOptions, TestResult } from "./types.js";

/**
 * Playwright wrapper class that provides simplified browser automation capabilities.
 *
 * This class manages the entire browser lifecycle, including creation, page management,
 * and cleanup. It provides a high-level API for common browser automation tasks while
 * handling the complexity of resource management and error handling internally.
 *
 * The wrapper automatically detects Playwright availability and provides graceful
 * degradation when the library is not installed or available in the environment.
 *
 * @class PlaywrightWrapper
 * @example
 * ```typescript
 * const wrapper = new PlaywrightWrapper();
 *
 * // Check if Playwright is available
 * if (wrapper.getAvailability()) {
 *   const screenshot = await wrapper.screenshot('https://example.com');
 * }
 * ```
 */
export class PlaywrightWrapper {
     * @private
  private browser: any = null;
     * @private
  private context: any = null;
     * @private
  private pages: any[] = [];
     * @private
  private isAvailable: boolean = false;

  /**
   * Creates a new PlaywrightWrapper instance.
   *
   * The constructor automatically checks for Playwright availability and sets up
   * the internal state accordingly. This check is performed asynchronously and
   * does not block the constructor.
   *
   * @class
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * // Availability check happens automatically
   * ```
   */
  constructor() {
    this.checkAvailability();
  }

  /**
   * Checks if Playwright is available in the current environment.
   *
   * This method attempts to dynamically import Playwright to determine if it's
   * installed and accessible. The result is stored in the `isAvailable` property
   * and used by other methods to provide appropriate error messages or fallbacks.
   *
   * @private
   * @async
   * @returns {Promise<void>} Resolves when availability check is complete
   *
   * @example
   * ```typescript
   * // This method is called automatically in the constructor
   * await wrapper.checkAvailability();
   * ```
   */
  private async checkAvailability(): Promise<void> {
    try {
      // Try to import Playwright to check if it's available
      await import("playwright");
      this.isAvailable = true;
    } catch (error) {
      console.warn("⚠️ Playwright not available:", error);
      this.isAvailable = false;
    }
  }

  /**
   * Creates and configures a new browser instance for automation.
   *
   * This method launches a Chromium browser with the specified options and creates
   * a new browser context. If a browser is already running, it returns the existing
   * instance. The method handles browser lifecycle management and provides appropriate
   * error messages when Playwright is not available.
   *
   * @async
   * @param {BrowserOptions} [options={}] - Configuration options for the browser
   * @param {boolean} [options.headless=true] - Whether to run in headless mode
   * @param {number} [options.timeout=30000] - Browser launch timeout in milliseconds
   * @param {Object} [options.viewport] - Viewport dimensions (default: 1280x720)
   * @param {string} [options.userAgent] - Custom user agent string
   * @returns {Promise<Browser>} The created browser instance
   * @throws {Error} If Playwright is not available or browser creation fails
   *
   * @example
   * ```typescript
   * // Create browser with default options
   * const browser = await wrapper.createBrowser();
   *
   * // Create browser with custom options
   * const browser = await wrapper.createBrowser({
   *   headless: false,
   *   viewport: { width: 1920, height: 1080 },
   *   userAgent: 'Custom Agent'
   * });
   * ```
   */
  async createBrowser(options: BrowserOptions = {}): Promise<Browser> {
    if (!this.isAvailable) {
      throw new Error("Playwright is not available. Please install with: pnpm playwright-install");
    }

    if (this.browser) {
      return this.browser;
    }

    try {
      this.browser = await chromium.launch({
        headless: options.headless ?? true,
        timeout: options.timeout ?? 30000,
      });

      this.context = await this.browser.newContext({
        viewport: options.viewport ?? { width: 1280, height: 720 },
        userAgent: options.userAgent,
      });

      return this.browser;
    } catch (error) {
      throw new Error(`Failed to create browser: ${error}`);
    }
  }

  /**
   * Takes a screenshot of the specified URL.
   *
   * This method navigates to the given URL, waits for the page to load completely,
   * and captures a screenshot. The method automatically manages page lifecycle
   * and ensures proper cleanup after the screenshot is taken.
   *
   * @async
   * @param {string} url - The URL to screenshot
   * @param {ScreenshotOptions} [options={}] - Screenshot configuration options
   * @param {boolean} [options.fullPage=true] - Whether to capture the full page
   * @param {string} [options.format='png'] - Image format (png, jpeg, webp)
   * @param {number} [options.quality] - Image quality (0-100, for jpeg/webp)
   * @param {number} [options.timeout=30000] - Navigation timeout in milliseconds
   * @returns {Promise<Buffer>} The screenshot as a Buffer
   * @throws {Error} If Playwright is not available or screenshot fails
   *
   * @example
   * ```typescript
   * // Take a full page screenshot
   * const screenshot = await wrapper.screenshot('https://example.com');
   *
   * // Take a screenshot with custom options
   * const screenshot = await wrapper.screenshot('https://example.com', {
   *   fullPage: false,
   *   format: 'jpeg',
   *   quality: 80
   * });
   * ```
   */
  async screenshot(url: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    if (!this.isAvailable) {
      throw new Error("Playwright is not available");
    }

    await this.createBrowser();
    const page = await this.context!.newPage();
    this.pages.push(page);

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: options.timeout ?? 30000,
      });

      const screenshot = await page.screenshot({
        fullPage: options.fullPage ?? true,
        type: options.format ?? "png",
        quality: options.quality,
      });

      return screenshot;
    } finally {
      await page.close();
      this.pages = this.pages.filter(p => p !== page);
    }
  }

  /**
   * Scrapes content from the specified URL.
   *
   * This method provides flexible web scraping capabilities, allowing extraction of
   * specific elements, text content, HTML, or attributes. It can wait for specific
   * elements to load and supports various extraction modes for different use cases.
   *
   * @async
   * @param {string} url - The URL to scrape
   * @param {ScrapeOptions} [options={}] - Scraping configuration options
   * @param {string} [options.selector] - CSS selector for specific elements
   * @param {string} [options.extract='text'] - Extraction mode: 'text', 'html', 'attributes', 'all'
   * @param {string[]} [options.attributes] - Specific attributes to extract (when extract='attributes')
   * @param {string} [options.waitFor] - CSS selector to wait for before scraping
   * @param {number} [options.timeout=30000] - Navigation and wait timeout in milliseconds
   * @returns {Promise<any>} Scraped content based on extraction mode
   * @throws {Error} If Playwright is not available or scraping fails
   *
   * @example
   * ```typescript
   * // Scrape all text from h1 elements
   * const headings = await wrapper.scrape('https://example.com', {
   *   selector: 'h1',
   *   extract: 'text'
   * });
   *
   * // Scrape specific attributes
   * const links = await wrapper.scrape('https://example.com', {
   *   selector: 'a',
   *   extract: 'attributes',
   *   attributes: ['href', 'title']
   * });
   *
   * // Scrape full page content
   * const pageData = await wrapper.scrape('https://example.com');
   * ```
   */
  async scrape(url: string, options: ScrapeOptions = {}): Promise<any> {
    if (!this.isAvailable) {
      throw new Error("Playwright is not available");
    }

    await this.createBrowser();
    const page = await this.context!.newPage();
    this.pages.push(page);

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: options.timeout ?? 30000,
      });

      if (options.waitFor) {
        await page.waitForSelector(options.waitFor, { timeout: options.timeout ?? 10000 });
      }

      if (options.selector) {
        const elements = await page.$$(options.selector);

        if (options.extract === "text" || !options.extract) {
          return await Promise.all(elements.map((el: any) => el.textContent()));
        } else if (options.extract === "html") {
          return await Promise.all(elements.map((el: any) => el.innerHTML()));
        } else if (options.extract === "attributes" && options.attributes) {
          const results = [];
          for (const element of elements) {
            const attrs: Record<string, string | null> = {};
            for (const attr of options.attributes) {
              attrs[attr] = await element.getAttribute(attr);
            }
            results.push(attrs);
          }
          return results;
        } else if (options.extract === "all") {
          return await Promise.all(
            elements.map(async (el: any) => ({
              text: await el.textContent(),
              html: await el.innerHTML(),
              tagName: await el.evaluate((el: any) => el.tagName),
            }))
          );
        }
      } else {
        // Return page content
        return {
          title: await page.title(),
          url: page.url(),
          content: await page.content(),
        };
      }
    } finally {
      await page.close();
      this.pages = this.pages.filter(p => p !== page);
    }
  }

  /**
   * Generates a PDF from the specified URL.
   *
   * This method navigates to the given URL, waits for the page to load completely,
   * and generates a PDF document with the specified formatting options. The method
   * automatically manages page lifecycle and ensures proper cleanup.
   *
   * @async
   * @param {string} url - The URL to convert to PDF
   * @param {PDFOptions} [options={}] - PDF generation configuration options
   * @param {string} [options.format='A4'] - Page format (A4, A3, Letter, etc.)
   * @param {boolean} [options.landscape=false] - Whether to use landscape orientation
   * @param {Object} [options.margin] - Page margins configuration
   * @param {number} [options.timeout=30000] - Navigation timeout in milliseconds
   * @returns {Promise<Buffer>} The PDF as a Buffer
   * @throws {Error} If Playwright is not available or PDF generation fails
   *
   * @example
   * ```typescript
   * // Generate PDF with default settings
   * const pdf = await wrapper.pdf('https://example.com');
   *
   * // Generate PDF with custom options
   * const pdf = await wrapper.pdf('https://example.com', {
   *   format: 'A3',
   *   landscape: true,
   *   margin: { top: '1cm', bottom: '1cm' }
   * });
   * ```
   */
  async pdf(url: string, options: PDFOptions = {}): Promise<Buffer> {
    if (!this.isAvailable) {
      throw new Error("Playwright is not available");
    }

    await this.createBrowser();
    const page = await this.context!.newPage();
    this.pages.push(page);

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: options.timeout ?? 30000,
      });

      const pdf = await page.pdf({
        format: options.format ?? "A4",
        landscape: options.landscape ?? false,
        margin: options.margin,
        timeout: options.timeout ?? 30000,
      });

      return pdf;
    } finally {
      await page.close();
      this.pages = this.pages.filter(p => p !== page);
    }
  }

  /**
   * Runs a test function with browser automation capabilities.
   *
   * This method provides a testing framework that sets up a browser environment,
   * captures console logs and errors, and executes the provided test function.
   * It returns detailed test results including execution time, logs, and screenshots.
   *
   * @async
   * @param {Function} testFn - The test function to execute
   * @param {BrowserOptions} [options={}] - Browser configuration options for the test
   * @returns {Promise<TestResult>} Test execution results
   * @throws {Error} If Playwright is not available
   *
   * @example
   * ```typescript
   * const result = await wrapper.runTest(async () => {
   *   // Test code here
   *   const page = wrapper.context.newPage();
   *   await page.goto('https://example.com');
   *   // ... test assertions
   * });
   *
   * console.log(`Test ${result.passed ? 'passed' : 'failed'} in ${result.duration}ms`);
   * ```
   */
  async runTest(testFn: () => Promise<void>, options: BrowserOptions = {}): Promise<TestResult> {
    if (!this.isAvailable) {
      throw new Error("Playwright is not available");
    }

    const startTime = Date.now();
    const logs: string[] = [];
    const screenshots: string[] = [];

    try {
      await this.createBrowser(options);
      const page = await this.context!.newPage();
      this.pages.push(page);

      // Set up console logging
      page.on("console", (msg: any) => {
        logs.push(`[${msg.type()}] ${msg.text()}`);
      });

      // Set up error handling
      page.on("pageerror", (error: any) => {
        logs.push(`[ERROR] ${error.message}`);
      });

      // Run the test function with page available
      await testFn();

      return {
        passed: true,
        duration: Date.now() - startTime,
        logs,
        screenshots,
      };
    } catch (error) {
      return {
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        logs,
        screenshots,
      };
    }
  }

  /**
   * Cleans up all browser resources and closes connections.
   *
   * This method performs comprehensive cleanup of all browser resources including
   * pages, contexts, and the browser instance itself. It's designed to prevent
   * memory leaks and ensure proper resource disposal. The method is safe to call
   * multiple times and handles errors gracefully.
   *
   * @async
   * @returns {Promise<void>} Resolves when cleanup is complete
   *
   * @example
   * ```typescript
   * // Always cleanup after use
   * try {
   *   await wrapper.screenshot('https://example.com');
   * } finally {
   *   await wrapper.cleanup();
   * }
   * ```
   */
  async cleanup(): Promise<void> {
    try {
      // Close all pages
      for (const page of this.pages) {
        await page.close();
      }
      this.pages = [];

      // Close context
      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.warn("Error during Playwright cleanup:", error);
    }
  }

  /**
   * Returns the current availability status of Playwright.
   *
   * This method provides a synchronous way to check if Playwright is available
   * in the current environment. The availability is determined during instance
   * creation and can be used to conditionally execute browser automation code.
   *
   * @returns {boolean} True if Playwright is available, false otherwise
   *
   * @example
   * ```typescript
   * if (wrapper.getAvailability()) {
   *   // Safe to use Playwright features
   *   await wrapper.screenshot('https://example.com');
   * } else {
   *   console.log('Playwright not available, using fallback');
   * }
   * ```
   */
  getAvailability(): boolean {
    return this.isAvailable;
  }
}

/**
 * Singleton instance of PlaywrightWrapper for global use.
 *
 * This exported instance provides a convenient way to access Playwright
 * functionality throughout the application without needing to create
 * multiple wrapper instances. The singleton pattern ensures consistent
 * state and resource management across the application.
 *
 * @constant {PlaywrightWrapper} playwrightWrapper
 * @example
 * ```typescript
 * import { playwrightWrapper } from './playwright-wrapper';
 *
 * // Use the singleton instance
 * if (playwrightWrapper.getAvailability()) {
 *   const screenshot = await playwrightWrapper.screenshot('https://example.com');
 * }
 * ```
 */
export const playwrightWrapper = new PlaywrightWrapper();
