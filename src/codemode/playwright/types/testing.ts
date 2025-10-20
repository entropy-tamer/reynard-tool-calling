/**
 * @file Testing-related type definitions
 *
 * Contains types for test execution, reporting, and configuration.
 */

export interface TestResult {
  passed: boolean;
  error?: string;
  duration: number;
  screenshots?: string[];
  logs: string[];
}

export interface TestCase {
  name: string;
  testFn: (page: any) => Promise<void>;
  timeout?: number;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

export interface TestConfig {
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;
  userAgent?: string;
  screenshotOnFailure?: boolean;
}
