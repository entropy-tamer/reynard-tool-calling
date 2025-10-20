/**
 * @file Client interface type definitions
 *
 * Contains the main client interface and related types.
 */

import type { Buffer } from "buffer";
import type { BrowserOptions, ScreenshotOptions, ScrapeOptions, PDFOptions } from "./browser.js";
import type { InteractionStep, JavaScriptExecutionOptions } from "./interactions.js";
import type { ContentExtractionResult } from "./content.js";
import type { TestResult } from "./testing.js";

export interface BrowserAutomationClient {
  // Direct Playwright API
  screenshot(url: string, options?: ScreenshotOptions): Promise<Buffer>;
  scrape(url: string, options?: ScrapeOptions): Promise<any>;
  pdf(url: string, options?: PDFOptions): Promise<Buffer>;
  runTest(testFn: () => Promise<void>, options?: BrowserOptions): Promise<TestResult>;

  // Python service bridge
  extractWikipedia(url: string): Promise<ContentExtractionResult>;
  extractNews(url: string): Promise<ContentExtractionResult>;
  extractSocialMedia(url: string): Promise<ContentExtractionResult>;
  extractDeveloperPlatform(url: string): Promise<ContentExtractionResult>;
  interact(url: string, interactions: InteractionStep[]): Promise<ContentExtractionResult>;
  executeJavaScript(url: string, script: string, options?: JavaScriptExecutionOptions): Promise<any>;

  // Utility methods
  isAvailable(): boolean;
  cleanup(): Promise<void>;
}
