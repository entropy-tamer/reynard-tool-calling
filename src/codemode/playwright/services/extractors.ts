/**
 * @file Content extraction methods for browser automation client
 *
 * This module provides specialized content extraction methods for different
 * types of websites including Wikipedia, news sites, social media platforms,
 * and developer platforms. Each extractor is optimized for the specific
 * content structure and layout of its target platform.
 */

import type { APIRequestContext } from "playwright";
import type { ContentExtractionResult } from "../types/index.js";

/**
 * Extracts content from Wikipedia pages using specialized parsing.
 *
 * This method uses the browser automation service to extract structured
 * content from Wikipedia articles, including the main text, metadata,
 * images, and links. The extraction is optimized for Wikipedia's specific
 * markup structure and content organization.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The Wikipedia URL to extract content from
 * @returns {Promise<ContentExtractionResult>} Extracted content with metadata
 *
 * @example
 * ```typescript
 * const content = await extractWikipedia(requestContext, 'https://en.wikipedia.org/wiki/JavaScript');
 * console.log(content.title); // "JavaScript"
 * console.log(content.content); // Main article text
 * ```
 */
export async function extractWikipedia(
  requestContext: APIRequestContext,
  url: string
): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/extract/wikipedia", {
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
 * Extracts content from news websites using specialized parsing.
 *
 * This method extracts structured content from news articles, including
 * the headline, article text, publication date, author information,
 * and related metadata. The extraction handles various news site layouts
 * and content structures.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The news article URL to extract content from
 * @returns {Promise<ContentExtractionResult>} Extracted content with metadata
 *
 * @example
 * ```typescript
 * const content = await extractNews(requestContext, 'https://example-news.com/article');
 * console.log(content.title); // Article headline
 * console.log(content.metadata?.author); // Author name
 * ```
 */
export async function extractNews(requestContext: APIRequestContext, url: string): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/extract/news", {
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
 * Extracts content from social media platforms using specialized parsing.
 *
 * This method extracts content from social media posts, including text,
 * images, engagement metrics, and user information. The extraction is
 * optimized for various social media platforms and their content structures.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The social media post URL to extract content from
 * @returns {Promise<ContentExtractionResult>} Extracted content with metadata
 *
 * @example
 * ```typescript
 * const content = await extractSocialMedia(requestContext, 'https://twitter.com/user/status/123');
 * console.log(content.content); // Post text
 * console.log(content.metadata?.likes); // Engagement metrics
 * ```
 */
export async function extractSocialMedia(
  requestContext: APIRequestContext,
  url: string
): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/extract/social_media", {
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
 * Extracts content from developer platforms using specialized parsing.
 *
 * This method extracts content from developer platforms like GitHub, GitLab,
 * Stack Overflow, and documentation sites. It handles code blocks, API
 * documentation, issue descriptions, and other developer-focused content.
 *
 * @param {APIRequestContext} requestContext - The Playwright request context
 * @param {string} url - The developer platform URL to extract content from
 * @returns {Promise<ContentExtractionResult>} Extracted content with metadata
 *
 * @example
 * ```typescript
 * const content = await extractDeveloperPlatform(requestContext, 'https://github.com/user/repo');
 * console.log(content.content); // Repository description
 * console.log(content.metadata?.language); // Primary programming language
 * ```
 */
export async function extractDeveloperPlatform(
  requestContext: APIRequestContext,
  url: string
): Promise<ContentExtractionResult> {
  try {
    const response = await requestContext.post("/extract/developer_platform", {
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
