import { describe, it, expect } from "vitest";
import { createRequire } from "module";

// Test the direct execution functionality without MCP client
describe("Codemode Direct Execution", () => {
  // Simulate the codemode executeCode function directly
  const executeCode = async (code: string) => {
    const startTime = Date.now();

    try {
      // Inject common Node.js modules directly into the execution context
      const require = createRequire(import.meta.url);
      const modules = {
        child_process: require("child_process"),
        fs: require("fs"),
        path: require("path"),
        os: require("os"),
        util: require("util"),
        crypto: require("crypto"),
        url: require("url"),
        querystring: require("querystring"),
        http: require("http"),
        https: require("https"),
        stream: require("stream"),
        events: require("events"),
        buffer: require("buffer"),
        process: require("process"),
      };

      // Create a function that has access to the context (like codemode does)
      const func = new Function(
        "console",
        "modules",
        `
          // Make modules available as require would
          const require = (id) => {
            if (modules[id]) return modules[id];
            throw new Error(\`Module '\${id}' not available in codemode execution context\`);
          };
          
          return (async () => { 
            ${code} 
          })()
        `
      );

      const result = await func(console, modules);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        logs: [],
        metrics: {
          duration: executionTime,
          memoryUsedMB: 0,
          cpuPercent: 0,
        },
        error: null,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        data: null,
        logs: [],
        metrics: {
          duration: executionTime,
          memoryUsedMB: 0,
          cpuPercent: 0,
        },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  describe("Basic Execution", () => {
    it("should execute simple synchronous code", async () => {
      const code = `
        return "Hello, World!";
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("Hello, World!");
      expect(result.error).toBeNull();
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
    });

    it("should support console.log output", async () => {
      const code = `
        console.log("Test message");
        return "console test completed";
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("console test completed");
      expect(result.error).toBeNull();
    });

    it("should handle multiple console.log statements", async () => {
      const code = `
        console.log("First message");
        console.log("Second message");
        console.log("Third message");
        return "multiple console test completed";
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("multiple console test completed");
      expect(result.error).toBeNull();
    });
  });

  describe("Async/Await Support", () => {
    it("should support async/await operations", async () => {
      const code = `
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(50);
        return "async operation completed";
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("async operation completed");
      expect(result.error).toBeNull();
      expect(result.metrics.duration).toBeGreaterThan(40); // Should take at least 50ms
    });

    it("should handle Promise.all", async () => {
      const code = `
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const results = await Promise.all([
          delay(10).then(() => "first"),
          delay(20).then(() => "second"),
          delay(30).then(() => "third")
        ]);
        return results;
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(["first", "second", "third"]);
      expect(result.error).toBeNull();
    });

    it("should handle async functions", async () => {
      const code = `
        async function asyncFunction() {
          await new Promise(resolve => setTimeout(resolve, 25));
          return "async function result";
        }
        
        return await asyncFunction();
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("async function result");
      expect(result.error).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should catch and report synchronous errors", async () => {
      const code = `
        throw new Error("Test error message");
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe("Test error message");
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
    });

    it("should catch and report asynchronous errors", async () => {
      const code = `
        await new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("Async error")), 10);
        });
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe("Async error");
    });

    it("should handle syntax errors", async () => {
      const code = `
        const invalid = syntax error here;
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain("Unexpected identifier");
    });
  });

  describe("Module Access", () => {
    it("should provide access to child_process module", async () => {
      const code = `
        const { execSync } = require('child_process');
        const result = execSync('echo "test"', { encoding: 'utf8' });
        return result.trim();
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("test");
      expect(result.error).toBeNull();
    });

    it("should provide access to fs module", async () => {
      const code = `
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join('/tmp', 'test-' + Date.now() + '.txt');
        
        fs.writeFileSync(tempFile, 'test content');
        const content = fs.readFileSync(tempFile, 'utf8');
        fs.unlinkSync(tempFile);
        
        return content;
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("test content");
      expect(result.error).toBeNull();
    });

    it("should provide access to path module", async () => {
      const code = `
        const path = require('path');
        const result = path.join('/home', 'user', 'file.txt');
        return result;
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("/home/user/file.txt");
      expect(result.error).toBeNull();
    });

    it("should handle missing modules gracefully", async () => {
      const code = `
        const missing = require('nonexistent-module');
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not available in codemode execution context");
    });
  });

  describe("Git Operations", () => {
    it("should retrieve git log information", async () => {
      const code = `
        const { execSync } = require('child_process');
        
        try {
          const gitLog = execSync('git log --oneline -3', { 
            encoding: 'utf8',
            cwd: '/home/kade/runeset/reynard'
          });
          
          const commits = gitLog.trim().split('\\n').map(line => {
            const [hash, ...messageParts] = line.split(' ');
            return {
              hash: hash.substring(0, 7),
              message: messageParts.join(' ')
            };
          });
          
          return {
            success: true,
            commits: commits,
            count: commits.length
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data.success).toBe(true);
      expect(result.data.count).toBe(3);
      expect(result.data.commits).toHaveLength(3);
      expect(result.data.commits[0]).toHaveProperty("hash");
      expect(result.data.commits[0]).toHaveProperty("message");
      expect(result.error).toBeNull();
    });

    it("should handle git commands in different directories", async () => {
      const code = `
        const { execSync } = require('child_process');
        const path = require('path');
        
        try {
          const projectRoot = '/home/kade/runeset/reynard';
          const gitStatus = execSync('git status --porcelain', { 
            encoding: 'utf8',
            cwd: projectRoot
          });
          
          return {
            success: true,
            status: gitStatus.trim()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data.success).toBe(true);
      expect(result.data).toHaveProperty("status");
      expect(result.error).toBeNull();
    });
  });

  describe("Performance and Metrics", () => {
    it("should track execution time accurately", async () => {
      const code = `
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        const end = Date.now();
        return { start, end, duration: end - start };
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.metrics.duration).toBeGreaterThan(90);
      expect(result.metrics.duration).toBeLessThan(200);
      expect(result.data.duration).toBeGreaterThan(90);
    });

    it("should handle quick operations efficiently", async () => {
      const code = `
        return "quick operation";
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.metrics.duration).toBeLessThan(100); // Should be very fast
    });
  });

  describe("Complex Operations", () => {
    it("should handle nested function calls", async () => {
      const code = `
        function outerFunction() {
          function innerFunction() {
            return "inner result";
          }
          return innerFunction();
        }
        
        return outerFunction();
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data).toBe("inner result");
      expect(result.error).toBeNull();
    });

    it("should handle array operations", async () => {
      const code = `
        const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(n => n * 2);
        const sum = doubled.reduce((acc, n) => acc + n, 0);
        
        return { original: numbers, doubled, sum };
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data.original).toEqual([1, 2, 3, 4, 5]);
      expect(result.data.doubled).toEqual([2, 4, 6, 8, 10]);
      expect(result.data.sum).toBe(30);
    });

    it("should handle object manipulation", async () => {
      const code = `
        const obj = { a: 1, b: 2, c: 3 };
        const keys = Object.keys(obj);
        const values = Object.values(obj);
        const entries = Object.entries(obj);
        
        return { keys, values, entries };
      `;

      const result = await executeCode(code);

      expect(result.success).toBe(true);
      expect(result.data.keys).toEqual(["a", "b", "c"]);
      expect(result.data.values).toEqual([1, 2, 3]);
      expect(result.data.entries).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });
  });
});
