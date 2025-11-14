/**
 * @file Screenshot operations
 *
 * Handles screenshot capture functionality for both direct Playwright
 * and browser automation service operations.
 */

import { Buffer } from "buffer";
import type { APIRequestContext } from "playwright";
import type { ScreenshotOptions } from "../types/browser.js";
import { BrowserManager } from "../core/browser-manager.js";

/**
 * Takes a screenshot using the browser automation service.
 *
 * @param requestContext - The Playwright request context
 * @param url - The URL to capture a screenshot of
 * @param options - Screenshot configuration options
 * @returns The screenshot as a Buffer
 * @example
 */
export async function takeScreenshotViaService(
  requestContext: APIRequestContext,
  url: string,
  options: ScreenshotOptions = {}
): Promise<Buffer> {
  try {
    const response = await requestContext.post("/screenshot", {
      data: { url, ...options },
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    return Buffer.from(await response.body());
  } catch (error) {
    throw new Error(`Failed to take screenshot of ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Takes a screenshot using direct Playwright browser automation.
 *
 * @param browserManager - The browser manager instance
 * @param url - The URL to capture a screenshot of
 * @param options - Screenshot configuration options
 * @returns The screenshot as a Buffer
 * @example
 */
export async function takeScreenshotDirect(
  browserManager: BrowserManager,
  url: string,
  options: ScreenshotOptions = {}
): Promise<Buffer> {
  if (!browserManager.isReady()) {
    throw new Error("Browser is not available");
  }

  await browserManager.createBrowser();
  const context = browserManager.getContext();
  if (!context) {
    throw new Error("Browser context is not available");
  }

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: options.timeout ?? 30000 });
    const screenshotOptions: { fullPage: boolean; type: "png" | "jpeg"; quality?: number } = {
      fullPage: options.fullPage ?? true,
      type: options.format ?? "png",
    };
    if (options.quality !== undefined) {
      screenshotOptions.quality = options.quality;
    }
    return await page.screenshot(screenshotOptions);
  } finally {
    await page.close();
  }
}
