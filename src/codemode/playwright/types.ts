/**
 * TypeScript types for Playwright Code Mode integration
 */

export interface ScreenshotOptions {
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  quality?: number;
  format?: 'png' | 'jpeg';
  timeout?: number;
}

export interface ScrapeOptions {
  selector?: string;
  waitFor?: string;
  timeout?: number;
  extract?: 'text' | 'html' | 'attributes' | 'all';
  attributes?: string[];
}

export interface PDFOptions {
  format?: 'A4' | 'A3' | 'Letter';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  timeout?: number;
}

export interface BrowserOptions {
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;
  userAgent?: string;
}

export interface TestResult {
  passed: boolean;
  error?: string;
  duration: number;
  screenshots?: string[];
  logs: string[];
}

export interface InteractionStep {
  type: 'click' | 'type' | 'select' | 'hover' | 'scroll' | 'wait';
  selector?: string;
  text?: string;
  value?: string;
  options?: string[];
  x?: number;
  y?: number;
  timeout?: number;
}

export interface JavaScriptExecutionOptions {
  timeout?: number;
  returnByValue?: boolean;
  awaitPromise?: boolean;
}

export interface ContentExtractionResult {
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  images?: string[];
  links?: string[];
  timestamp: string;
}

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
