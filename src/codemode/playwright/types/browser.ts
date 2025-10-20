/**
 * @file Browser-related type definitions
 *
 * Contains types for browser configuration, options, and basic operations.
 */

export interface BrowserOptions {
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;
  userAgent?: string;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  quality?: number;
  format?: "png" | "jpeg";
  timeout?: number;
}

export interface ScrapeOptions {
  selector?: string;
  waitFor?: string;
  timeout?: number;
  extract?: "text" | "html" | "attributes" | "all";
  attributes?: string[];
}

export interface PDFOptions {
  format?: "A4" | "A3" | "Letter";
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  timeout?: number;
}
