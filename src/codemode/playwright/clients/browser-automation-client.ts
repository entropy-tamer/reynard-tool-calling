/**
 * @file Browser Automation Client - Bridge to Python FastAPI service
 *
 * This module provides a comprehensive client for browser automation operations
 * through a Python FastAPI service. It offers access to advanced content extractors,
 * human-like interactions, and browser operations with proper error handling
 * and connection management.
 */

import { Buffer } from "buffer";
import type {
  ContentExtractionResult,
  InteractionStep,
  JavaScriptExecutionOptions,
  ScreenshotOptions,
  PDFOptions,
} from "../types/index.js";
import { RequestManager } from "../core/request-manager.js";
import {
  extractWikipediaContent,
  extractNewsContent,
  extractSocialMediaContent,
  extractDeveloperPlatformContent,
  performInteractions,
  executeJavaScriptCode,
  takeScreenshotImage,
  generatePDFDocument,
  scrapePageContent,
} from "../services/client-methods.js";

/**
 * Browser automation client that provides access to advanced web automation
 * capabilities through a Python FastAPI service. This client handles connection
 * management, health checks, and provides a unified interface for various
 * browser automation operations.
 *
 * @example
 * ```typescript
 * const client = new BrowserAutomationClient();
 *
 * // Check if service is available
 * if (client.isServiceAvailable()) {
 *   const content = await client.extractWikipedia('https://en.wikipedia.org/wiki/JavaScript');
 *   console.log(content.title);
 * }
 * ```
 */
export class BrowserAutomationClient {
  private requestManager: RequestManager;

  /**
   * Creates a new BrowserAutomationClient instance and initializes the connection
   * @param baseUrl - The base URL for the browser automation service
   * @example
   * ```typescript
   * const client = new BrowserAutomationClient('http://localhost:8001');
   * ```
   */
  constructor(baseUrl: string = "http://localhost:8001") {
    this.requestManager = new RequestManager(baseUrl);
    this.initializeRequestContext();
  }

  /**
   * Initializes the request context and performs a health check.
   *
   * This method sets up the Playwright request context for communicating
   * with the browser automation service. It performs a health check to
   * verify the service is running and accessible.
   * @example
   * ```typescript
   * // This method is called automatically in the constructor
   * await client.initializeRequestContext();
   * ```
   */
  private async initializeRequestContext(): Promise<void> {
    await this.requestManager.initialize();
  }

  /**
   * Extract Wikipedia content
   * @param url - The Wikipedia URL to extract content from
   * @returns Extracted content with metadata
   * @example
   * ```typescript
   * const content = await client.extractWikipedia('https://en.wikipedia.org/wiki/JavaScript');
   * console.log(content.title);
   * ```
   */
  async extractWikipedia(url: string): Promise<ContentExtractionResult> {
    return extractWikipediaContent(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url
    );
  }

  /**
   * Extract news content
   * @param url - The news article URL to extract content from
   * @returns Extracted content with metadata
   * @example
   * ```typescript
   * const content = await client.extractNews('https://example-news.com/article');
   * console.log(content.title);
   * ```
   */
  async extractNews(url: string): Promise<ContentExtractionResult> {
    return extractNewsContent(this.requestManager.getRequestContext(), this.requestManager.isServiceAvailable(), url);
  }

  /**
   * Extract social media content
   * @param url - The social media post URL to extract content from
   * @returns Extracted content with metadata
   * @example
   * ```typescript
   * const content = await client.extractSocialMedia('https://twitter.com/user/status/123');
   * console.log(content.content);
   * ```
   */
  async extractSocialMedia(url: string): Promise<ContentExtractionResult> {
    return extractSocialMediaContent(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url
    );
  }

  /**
   * Extract developer platform content
   * @param url - The developer platform URL to extract content from
   * @returns Extracted content with metadata
   * @example
   * ```typescript
   * const content = await client.extractDeveloperPlatform('https://github.com/user/repo');
   * console.log(content.content);
   * ```
   */
  async extractDeveloperPlatform(url: string): Promise<ContentExtractionResult> {
    return extractDeveloperPlatformContent(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url
    );
  }

  /**
   * Perform user interactions
   * @param url - The URL to perform interactions on
   * @param interactions - Array of interaction steps to execute
   * @returns Result of the interactions with final page state
   * @example
   * ```typescript
   * const interactions = [
   *   { type: 'click', selector: '#login-button' },
   *   { type: 'type', selector: '#username', text: 'user@example.com' }
   * ];
   * const result = await client.interact('https://example.com/login', interactions);
   * ```
   */
  async interact(url: string, interactions: InteractionStep[]): Promise<ContentExtractionResult> {
    return performInteractions(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url,
      interactions
    );
  }

  /**
   * Execute JavaScript
   * @param url - The URL to execute JavaScript on
   * @param script - The JavaScript code to execute
   * @param options - Execution options
   * @returns The result of the JavaScript execution
   * @example
   * ```typescript
   * const script = 'return { title: document.title, url: window.location.href }';
   * const result = await client.executeJavaScript('https://example.com', script);
   * ```
   */
  async executeJavaScript(url: string, script: string, options: JavaScriptExecutionOptions = {}): Promise<unknown> {
    return executeJavaScriptCode(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url,
      script,
      options
    );
  }

  /**
   * Take screenshot
   * @param url - The URL to capture a screenshot of
   * @param options - Screenshot configuration options
   * @returns The screenshot as a Buffer
   * @example
   * ```typescript
   * const screenshot = await client.takeScreenshot('https://example.com', { fullPage: true });
   * ```
   */
  async takeScreenshot(url: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    return takeScreenshotImage(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url,
      options
    );
  }

  /**
   * Generate PDF
   * @param url - The URL to convert to PDF
   * @param options - PDF generation configuration options
   * @returns The PDF as a Buffer
   * @example
   * ```typescript
   * const pdf = await client.generatePDF('https://example.com', { format: 'A4' });
   * ```
   */
  async generatePDF(url: string, options: PDFOptions = {}): Promise<Buffer> {
    return generatePDFDocument(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url,
      options
    );
  }

  /**
   * Scrape content
   * @param url - The URL to scrape content from
   * @param selector - Optional CSS selector to filter content
   * @returns Scraped content with metadata
   * @example
   * ```typescript
   * const content = await client.scrapeContent('https://example.com', '.article');
   * ```
   */
  async scrapeContent(url: string, selector?: string): Promise<ContentExtractionResult> {
    return scrapePageContent(
      this.requestManager.getRequestContext(),
      this.requestManager.isServiceAvailable(),
      url,
      selector
    );
  }

  /**
   * Check service availability
   * @returns True if the service is available and healthy
   * @example
   * ```typescript
   * if (client.isServiceAvailable()) {
   *   console.log('Service is ready');
   * }
   * ```
   */
  isServiceAvailable(): boolean {
    return this.requestManager.isServiceAvailable();
  }

  /**
   * Health check
   * @returns True if the service is healthy, false otherwise
   * @example
   * ```typescript
   * const isHealthy = await client.healthCheck();
   * ```
   */
  async healthCheck(): Promise<boolean> {
    return this.requestManager.healthCheck();
  }

  /**
   * Cleanup
   * @example
   * ```typescript
   * await client.cleanup();
   * ```
   */
  async cleanup(): Promise<void> {
    await this.requestManager.cleanup();
  }
}

// Export singleton instance
export const browserAutomationClient = new BrowserAutomationClient();
