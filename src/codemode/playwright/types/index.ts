/**
 * @file Central type exports for Playwright Code Mode
 *
 * Re-exports all types from focused modules for easy importing.
 */

// Browser types
export type { BrowserOptions, ScreenshotOptions, ScrapeOptions, PDFOptions } from "./browser.js";

// Interaction types
export type { InteractionStep, JavaScriptExecutionOptions } from "./interactions.js";

// Content types
export type { ContentExtractionResult } from "./content.js";

// Testing types
export type { TestResult, TestCase, TestSuite, TestConfig } from "./testing.js";

// Client types
export type { BrowserAutomationClient } from "./client.js";
