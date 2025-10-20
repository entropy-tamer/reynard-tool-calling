/**
 * @file Interaction-related type definitions
 *
 * Contains types for user interactions, JavaScript execution, and automation steps.
 */

export interface InteractionStep {
  type: "click" | "type" | "select" | "hover" | "scroll" | "wait";
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
