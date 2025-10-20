/**
 * @file Scraping operations
 *
 * Handles content scraping functionality for both direct Playwright
 * and browser automation service operations.
 */

import type { APIRequestContext } from "playwright";
import type { ScrapeOptions, ContentExtractionResult } from "../types/index.js";
import { BrowserManager } from "../core/browser-manager.js";

/**
 * Scrapes content using the browser automation service.
 *
 * @param requestContext - The Playwright request context
 * @param url - The URL to scrape content from
 * @param selector - Optional CSS selector to filter content
 * @returns Scraped content with metadata
 * @example
 */
export async function scrapeContentViaService(
  requestContext: APIRequestContext,
  url: string,
  selector?: string
): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/scrape", {
      data: { url, selector },
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to scrape content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Scrapes content using direct Playwright browser automation.
 *
 * @param browserManager - The browser manager instance
 * @param url - The URL to scrape content from
 * @param options - Scraping configuration options
 * @returns Scraped content
 * @example
 */
export async function scrapeContentDirect(
  browserManager: BrowserManager,
  url: string,
  options: ScrapeOptions = {}
): Promise<unknown> {
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
    if (options.waitFor) {
      await page.waitForSelector(options.waitFor, { timeout: options.timeout ?? 10000 });
    }

    if (options.selector) {
      const elements = await page.$$(options.selector);
      if (options.extract === "text" || !options.extract) {
        return await Promise.all(elements.map(el => el.textContent()));
      } else if (options.extract === "html") {
        return await Promise.all(elements.map(el => el.innerHTML()));
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
          elements.map(async el => ({
            text: await el.textContent(),
            html: await el.innerHTML(),
            tagName: await el.evaluate(el => el.tagName),
          }))
        );
      }
      return elements;
    } else {
      return { title: await page.title(), url: page.url(), content: await page.content() };
    }
  } finally {
    await page.close();
  }
}
