/**
 * @file Client method implementations for browser automation
 *
 * This module provides the main method implementations for the browser automation
 * client, including content extraction, interaction, and operation methods.
 * These methods handle the core functionality of the client.
 */

import { Buffer } from "buffer";
import type { APIRequestContext } from "playwright";
import type {
  ContentExtractionResult,
  InteractionStep,
  JavaScriptExecutionOptions,
  ScreenshotOptions,
  PDFOptions,
} from "../types/index.js";
import { extractWikipedia, extractNews, extractSocialMedia, extractDeveloperPlatform } from "./extractors.js";
import { takeScreenshot, generatePDF, scrapeContent } from "./simple-operations.js";
import { interact, executeJavaScript } from "./browser-operations.js";

/**
 * Extracts content from Wikipedia pages using specialized parsing.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The Wikipedia URL to extract content from
 * @returns Extracted content with metadata
 * @example
 */
export async function extractWikipediaContent(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return extractWikipedia(requestContext, url);
}

/**
 * Extracts content from news websites using specialized parsing.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The news article URL to extract content from
 * @returns Extracted content with metadata
 * @example
 */
export async function extractNewsContent(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return extractNews(requestContext, url);
}

/**
 * Extracts content from social media platforms using specialized parsing.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The social media post URL to extract content from
 * @returns Extracted content with metadata
 * @example
 */
export async function extractSocialMediaContent(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return extractSocialMedia(requestContext, url);
}

/**
 * Extracts content from developer platforms using specialized parsing.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The developer platform URL to extract content from
 * @returns Extracted content with metadata
 * @example
 */
export async function extractDeveloperPlatformContent(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return extractDeveloperPlatform(requestContext, url);
}

/**
 * Performs user interactions on the specified URL.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The URL to perform interactions on
 * @param interactions - Array of interaction steps to execute
 * @returns Result of the interactions
 * @example
 */
export async function performInteractions(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string,
  interactions: InteractionStep[]
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return interact(requestContext, url, interactions);
}

/**
 * Executes JavaScript code on the specified URL.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The URL to execute JavaScript on
 * @param script - The JavaScript code to execute
 * @param options - Execution options
 * @returns The result of the JavaScript execution
 * @example
 */
export async function executeJavaScriptCode(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string,
  script: string,
  options: JavaScriptExecutionOptions = {}
): Promise<unknown> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return executeJavaScript(requestContext, url, script, options);
}

/**
 * Takes a screenshot of the specified URL.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The URL to capture a screenshot of
 * @param options - Screenshot configuration options
 * @returns The screenshot as a Buffer
 * @example
 */
export async function takeScreenshotImage(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string,
  options: ScreenshotOptions = {}
): Promise<Buffer> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return takeScreenshot(requestContext, url, options);
}

/**
 * Generates a PDF from the specified URL.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The URL to convert to PDF
 * @param options - PDF generation configuration options
 * @returns The PDF as a Buffer
 * @example
 */
export async function generatePDFDocument(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return generatePDF(requestContext, url, options);
}

/**
 * Scrapes content from the specified URL.
 *
 * @param requestContext - The request context to use
 * @param isAvailable - Whether the service is available
 * @param url - The URL to scrape content from
 * @param selector - Optional CSS selector to filter content
 * @returns Scraped content with metadata
 * @example
 */
export async function scrapePageContent(
  requestContext: APIRequestContext | null,
  isAvailable: boolean,
  url: string,
  selector?: string
): Promise<ContentExtractionResult> {
  if (!isAvailable || !requestContext) {
    throw new Error("Browser automation service is not available");
  }
  return scrapeContent(requestContext, url, selector);
}
