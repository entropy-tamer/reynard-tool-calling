/**
 * @file Content extraction type definitions
 *
 * Contains types for content extraction results and metadata.
 */

export interface ContentExtractionResult {
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  images?: string[];
  links?: string[];
  timestamp: string;
}
