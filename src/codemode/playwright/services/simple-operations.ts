/**
 * @file Simple browser operations for automation client
 *
 * This module provides simple browser operations including screenshots,
 * PDF generation, and basic content scraping. These operations are
 * straightforward and don't require complex interaction sequences.
 */

import type { APIRequestContext } from "playwright";
import { Buffer } from "buffer";
import type { ScreenshotOptions, PDFOptions, ContentExtractionResult } from "../types/index.js";

/**
 * Takes a screenshot of the specified URL using the browser automation service.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The URL to capture a screenshot of
 * @param {ScreenshotOptions} [options={}] - Screenshot configuration options
 * @returns {Promise<Buffer>} The screenshot as a Buffer
 * @example
 */
export async function takeScreenshot(
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
 * Generates a PDF from the specified URL using the browser automation service.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The URL to convert to PDF
 * @param {PDFOptions} [options={}] - PDF generation configuration options
 * @returns {Promise<Buffer>} The PDF as a Buffer
 * @example
 */
export async function generatePDF(
  requestContext: APIRequestContext,
  url: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  try {
    const response = await requestContext.post("/pdf", {
      data: { url, pdf_options: options },
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    return Buffer.from(await response.body());
  } catch (error) {
    throw new Error(`Failed to generate PDF from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Scrapes content from the specified URL using the browser automation service.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The URL to scrape content from
 * @param {string} [selector] - Optional CSS selector to filter content
 * @returns {Promise<ContentExtractionResult>} Scraped content with metadata
 * @example
 */
export async function scrapeContent(
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
