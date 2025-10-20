/**
 * @file PDF generation operations
 *
 * Handles PDF generation functionality for the browser automation service.
 */

import { Buffer } from "buffer";
import type { APIRequestContext } from "playwright";
import type { PDFOptions } from "../types/browser.js";

/**
 * Generates a PDF from the specified URL using the browser automation service.
 *
 * @param requestContext - The Playwright request context
 * @param url - The URL to convert to PDF
 * @param options - PDF generation configuration options
 * @returns The PDF as a Buffer
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
