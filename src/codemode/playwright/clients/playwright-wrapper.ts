/**
 * @file Playwright Wrapper - Direct Playwright browser automation
 *
 * Provides direct Playwright browser automation capabilities with proper
 * resource management and graceful fallback when Playwright is not available.
 */

import { Buffer } from "buffer";
import type { ScreenshotOptions, ScrapeOptions, BrowserOptions } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";
import { takeScreenshotDirect, scrapeContentDirect } from "../operations/index.js";

/**
 * Playwright wrapper class for direct browser automation.
 *
 * This class provides a clean interface for direct Playwright operations
 * without requiring an external service. It handles browser lifecycle
 * management and provides fallback capabilities.
 */
export class PlaywrightWrapper {
  private browserManager: BrowserManager;

  /**
   * Creates a new PlaywrightWrapper instance.
   *
   * Initializes the browser manager for handling browser lifecycle
   * and automation operations.
   *
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * const browser = await wrapper.createBrowser();
   * ```
   */
  constructor() {
    this.browserManager = new BrowserManager();
  }

  /**
   * Creates a browser instance with the specified options.
   *
   * @param options - Browser configuration options
   * @returns The created browser instance
   *
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * const browser = await wrapper.createBrowser({ headless: false });
   * ```
   */
  async createBrowser(options: BrowserOptions = {}): Promise<any> {
    return this.browserManager.createBrowser(options);
  }

  /**
   * Takes a screenshot of the specified URL.
   *
   * @param url - The URL to capture a screenshot of
   * @param options - Screenshot configuration options
   * @returns The screenshot as a Buffer
   *
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * const screenshot = await wrapper.screenshot('https://example.com', {
   *   fullPage: true,
   *   viewport: { width: 1920, height: 1080 }
   * });
   * ```
   */
  async screenshot(url: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    return takeScreenshotDirect(this.browserManager, url, options);
  }

  /**
   * Scrapes content from the specified URL.
   *
   * @param url - The URL to scrape content from
   * @param options - Scraping configuration options
   * @returns Scraped content
   *
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * const content = await wrapper.scrape('https://example.com', {
   *   selector: 'article',
   *   waitFor: 'networkidle'
   * });
   * ```
   */
  async scrape(url: string, options: ScrapeOptions = {}): Promise<unknown> {
    return scrapeContentDirect(this.browserManager, url, options);
  }

  /**
   * Checks if Playwright is available and ready.
   *
   * @returns True if Playwright is available
   *
   * @example
   * ```typescript
   * const wrapper = new PlaywrightWrapper();
   * if (wrapper.getAvailability()) {
   *   console.log('Playwright is ready for use');
   * }
   * ```
   */
  getAvailability(): boolean {
    return this.browserManager.isReady();
  }

  /**
   * Cleans up browser resources.
   * @example
   */
  async cleanup(): Promise<void> {
    await this.browserManager.cleanup();
  }
}

/** Singleton instance for global use. */
export const playwrightWrapper = new PlaywrightWrapper();
