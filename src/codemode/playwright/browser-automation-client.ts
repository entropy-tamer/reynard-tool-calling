/**
 * Browser Automation Client - Bridge to Python FastAPI service
 * Provides access to advanced extractors and human-like interactions
 */

import { request, type APIRequestContext } from "playwright";
import type { ContentExtractionResult, InteractionStep, JavaScriptExecutionOptions } from "./types.js";

/**
 *
 */
export class BrowserAutomationClient {
  private isAvailable: boolean = false;
  private requestContext: APIRequestContext | null = null;
  private readonly baseUrl: string = "http://localhost:8001";

  /**
   *
   * @example
   */
  constructor() {
    this.initializeRequestContext();
  }

  /**
   *
   * @example
   */
  private async initializeRequestContext() {
    try {
      this.requestContext = await request.newContext({
        baseURL: this.baseUrl,
        timeout: 30000,
      });

      // Test connection with health check
      const response = await this.requestContext.get("/health");
      if (response.ok()) {
        this.isAvailable = true;
        console.log("✅ Browser automation client connected successfully");
      } else {
        console.warn("⚠️ Browser automation service health check failed");
        this.isAvailable = false;
      }
    } catch (error) {
      console.warn(
        "⚠️ Browser automation client not available:",
        error instanceof Error ? error.message : "Unknown error"
      );
      this.isAvailable = false;
    }
  }

  /**
   *
   * @param url
   * @example
   */
  async extractWikipedia(url: string): Promise<ContentExtractionResult> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/extract/wikipedia", {
        data: { url },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to extract Wikipedia content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @example
   */
  async extractNews(url: string): Promise<ContentExtractionResult> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/extract/news", {
        data: { url },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to extract news content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @example
   */
  async extractSocialMedia(url: string): Promise<ContentExtractionResult> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/extract/social_media", {
        data: { url },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to extract social media content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @example
   */
  async extractDeveloperPlatform(url: string): Promise<ContentExtractionResult> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/extract/developer_platform", {
        data: { url },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to extract developer platform content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @param interactions
   * @example
   */
  async interact(url: string, interactions: InteractionStep[]): Promise<ContentExtractionResult> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/interact", {
        data: { url, interactions },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to interact with ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   *
   * @param url
   * @param script
   * @param options
   * @example
   */
  async executeJavaScript(url: string, script: string, options: JavaScriptExecutionOptions = {}): Promise<any> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/javascript", {
        data: { url, script, options },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to execute JavaScript on ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @param options
   * @example
   */
  async takeScreenshot(url: string, options: any = {}): Promise<Buffer> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/screenshot", {
        data: { url, ...options },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return Buffer.from(await response.body());
    } catch (error) {
      throw new Error(
        `Failed to take screenshot of ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @param options
   * @example
   */
  async generatePDF(url: string, options: any = {}): Promise<Buffer> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/pdf", {
        data: { url, pdf_options: options },
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      return Buffer.from(await response.body());
    } catch (error) {
      throw new Error(
        `Failed to generate PDF from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   *
   * @param url
   * @param selector
   * @example
   */
  async scrapeContent(url: string, selector?: string): Promise<any> {
    if (!this.isAvailable || !this.requestContext) {
      throw new Error("Browser automation service is not available");
    }

    try {
      const response = await this.requestContext.post("/scrape", {
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
   *
   * @example
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   *
   * @example
   */
  async healthCheck(): Promise<boolean> {
    if (!this.requestContext) {
      this.isAvailable = false;
      return false;
    }

    try {
      const response = await this.requestContext.get("/health");
      this.isAvailable = response.ok();
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   *
   * @example
   */
  async cleanup(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
    this.isAvailable = false;
  }
}

// Export singleton instance
export const browserAutomationClient = new BrowserAutomationClient();
