/**
 * @file Complex browser operations for automation client
 *
 * This module provides complex browser automation operations including
 * user interactions and JavaScript execution. These operations require
 * more sophisticated handling and state management.
 */

import type { APIRequestContext } from "playwright";
import type { InteractionStep, JavaScriptExecutionOptions, ContentExtractionResult } from "../types/index.js";

/**
 * Performs user interactions on the specified URL using the browser automation service.
 *
 * This method executes a sequence of user interactions such as clicks, typing,
 * hovering, scrolling, and waiting. It's useful for automating complex user
 * workflows and testing interactive web applications.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The URL to perform interactions on
 * @param {InteractionStep[]} interactions - Array of interaction steps to execute
 * @returns {Promise<ContentExtractionResult>} Result of the interactions with final page state
 *
 * @example
 * ```typescript
 * const interactions = [
 *   { type: 'click', selector: '#login-button' },
 *   { type: 'type', selector: '#username', text: 'user@example.com' },
 *   { type: 'type', selector: '#password', text: 'password123' },
 *   { type: 'click', selector: '#submit' }
 * ];
 * const result = await interact(requestContext, 'https://example.com/login', interactions);
 * ```
 */
export async function interact(
  requestContext: APIRequestContext,
  url: string,
  interactions: InteractionStep[]
): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/interact", {
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
 * Executes JavaScript code on the specified URL using the browser automation service.
 *
 * This method runs custom JavaScript code in the context of the specified web page.
 * It can be used to extract data, manipulate the DOM, or perform complex operations
 * that require JavaScript execution in the browser environment.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The URL to execute JavaScript on
 * @param {string} script - The JavaScript code to execute
 * @param {JavaScriptExecutionOptions} [options={}] - Execution options
 * @returns {Promise<unknown>} The result of the JavaScript execution
 *
 * @example
 * ```typescript
 * const script = `
 *   return {
 *     title: document.title,
 *     url: window.location.href,
 *     userAgent: navigator.userAgent
 *   };
 * `;
 * const result = await executeJavaScript(requestContext, 'https://example.com', script);
 * console.log(result.title); // Page title
 * ```
 */
export async function executeJavaScript(
  requestContext: APIRequestContext,
  url: string,
  script: string,
  options: JavaScriptExecutionOptions = {}
): Promise<unknown> {
  try {
    const response = await requestContext.post("/javascript", {
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
