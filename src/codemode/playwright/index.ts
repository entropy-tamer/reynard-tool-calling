/**
 * @file Main Playwright Code Mode exports
 *
 * Central export point for all Playwright Code Mode functionality.
 * Provides a clean, organized API for browser automation capabilities.
 */

// Core functionality
export * from "./core/index.js";

// Client implementations
export {
  PlaywrightWrapper,
  playwrightWrapper,
  BrowserAutomationClient,
  browserAutomationClient,
} from "./clients/index.js";

// Operations (excluding conflicting exports)
export {
  takeScreenshotViaService,
  takeScreenshotDirect,
  scrapeContentViaService,
  scrapeContentDirect,
} from "./operations/index.js";

// Services (excluding conflicting exports)
export {
  extractWikipedia,
  extractNews,
  extractSocialMedia,
  extractDeveloperPlatform,
  takeScreenshot,
  scrapeContent,
  interact,
  executeJavaScript,
  extractWikipediaContent,
  extractNewsContent,
  extractSocialMediaContent,
  extractDeveloperPlatformContent,
  performInteractions,
  executeJavaScriptCode,
  takeScreenshotImage,
  scrapePageContent,
} from "./services/index.js";

// Testing
export * from "./testing/index.js";

// Types
export * from "./types/index.js";
