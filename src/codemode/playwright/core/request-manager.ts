/**
 * @file Request Manager - HTTP client management for browser automation service
 *
 * Handles HTTP requests to the Python FastAPI browser automation service.
 * Provides connection management, health checks, and proper cleanup.
 */

import { request, type APIRequestContext } from "playwright";

/**
 * Manages HTTP requests to the browser automation service.
 *
 * This class handles the lifecycle of API request contexts, health checks,
 * and provides a clean interface for communicating with the Python service.
 */
export class RequestManager {
  private requestContext: APIRequestContext | null = null;
  private isAvailable: boolean = false;
  private readonly baseUrl: string;

  /**
   *
   * @param baseUrl
   * @example
   */
  constructor(baseUrl: string = "http://localhost:8001") {
    this.baseUrl = baseUrl;
  }

  /**
   * Initializes the request context and performs a health check.
   *
   * @returns Promise that resolves when initialization is complete
   * @example
   */
  async initialize(): Promise<void> {
    try {
      this.requestContext = await request.newContext({
        baseURL: this.baseUrl,
        timeout: 30000,
      });

      // Test connection with health check
      const response = await this.requestContext.get("/health");
      if (response.ok()) {
        console.log("✅ Browser automation client connected successfully");
        this.isAvailable = true;
      } else {
        console.warn("⚠️ Browser automation service health check failed");
        this.isAvailable = false;
      }
    } catch (error) {
      // Silently handle connection failure - this is expected when the Python service isn't running
      this.isAvailable = false;
    }
  }

  /**
   * Performs a health check on the browser automation service.
   *
   * @returns True if the service is healthy, false otherwise
   * @example
   */
  async healthCheck(): Promise<boolean> {
    if (!this.requestContext) {
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
   * Gets the current request context.
   *
   * @returns The current request context or null if not initialized
   * @example
   */
  getRequestContext(): APIRequestContext | null {
    return this.requestContext;
  }

  /**
   * Checks if the service is available and ready.
   *
   * @returns True if the service is available and healthy
   * @example
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Cleans up the request context and disposes of resources.
   *
   * This method should be called when the request manager is no longer needed
   * to prevent resource leaks.
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
