/**
 * @file Browser Manager - Core browser lifecycle management
 *
 * Handles browser creation, context management, and resource cleanup.
 * Provides a clean abstraction over Playwright's browser APIs.
 */

import { Browser, BrowserContext, chromium } from "playwright";
import type { BrowserOptions } from "../types/browser.js";

/**
 * Manages browser instances and contexts with proper lifecycle management.
 *
 * This class provides a clean abstraction for browser management, handling
 * creation, context management, and proper cleanup of resources.
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private isAvailable: boolean = false;

  /**
   * Checks if Playwright is available and can be used.
   * @example
   */
  private async checkAvailability(): Promise<void> {
    try {
      await import("playwright");
      this.isAvailable = true;
    } catch (error) {
      console.warn("⚠️ Playwright not available:", error);
      this.isAvailable = false;
    }
  }

  /**
   * Creates a new browser instance with the specified options.
   *
   * @param options - Browser configuration options
   * @returns The created browser instance
   * @throws Error if Playwright is not available or browser creation fails
   * @example
   */
  async createBrowser(options: BrowserOptions = {}): Promise<Browser> {
    if (!this.isAvailable) {
      await this.checkAvailability();
    }

    if (!this.isAvailable) {
      throw new Error("Playwright is not available. Please install with: pnpm playwright-install");
    }

    if (this.browser) return this.browser;

    try {
      this.browser = await chromium.launch({
        headless: options.headless ?? true,
        timeout: options.timeout ?? 30000,
      });

      const contextOptions: { viewport: { width: number; height: number }; userAgent?: string } = {
        viewport: options.viewport ?? { width: 1280, height: 720 },
      };
      if (options.userAgent) {
        contextOptions.userAgent = options.userAgent;
      }
      this.context = await this.browser.newContext(contextOptions);

      return this.browser;
    } catch (error) {
      throw new Error(`Failed to create browser: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Gets the current browser context.
   *
   * @returns The current browser context or null if not initialized
   * @example
   */
  getContext(): BrowserContext | null {
    return this.context;
  }

  /**
   * Gets the current browser instance.
   *
   * @returns The current browser instance or null if not initialized
   * @example
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * Checks if the browser manager is available and ready.
   *
   * @returns True if Playwright is available and browser can be created
   * @example
   */
  isReady(): boolean {
    return this.isAvailable;
  }

  /**
   * Cleans up browser resources and closes all instances.
   *
   * This method should be called when the browser manager is no longer needed
   * to prevent resource leaks.
   * @example
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
