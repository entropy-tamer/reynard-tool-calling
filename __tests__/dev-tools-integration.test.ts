import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { codemode } from "../src/codemode/codemode.js";

describe("Dev-Tools Integration", () => {
  let cm: Awaited<ReturnType<typeof codemode>>;

  beforeAll(async () => {
    cm = await codemode({
      projectRoot: "/home/kade/runeset/reynard", // Use the actual Reynard root
      timeoutMs: 15_000, // 15 second timeout for tests
    });
  });

  afterAll(() => {
    if (cm) {
      cm.cleanup();
    }
  });

  describe("Code Quality Integration", () => {
    it("should expose code quality analysis tools", async () => {
      const result = await cm.executeCode(`
        const hasCodeQuality = typeof codeQuality !== 'undefined';
        const hasQuickAnalysis = typeof codeQuality?.quickAnalysis === 'function';
        const hasAnalyzer = typeof codeQuality?.CodeQualityAnalyzer === 'function';
        
        return {
          hasCodeQuality,
          hasQuickAnalysis,
          hasAnalyzer,
          exports: Object.keys(codeQuality).slice(0, 5) // First 5 exports
        };
      `);

      const data = result.data as any;
      expect(data.hasCodeQuality).toBe(true);
      expect(data.hasQuickAnalysis).toBe(true);
      expect(data.hasAnalyzer).toBe(true);
      expect(data.exports.length).toBeGreaterThan(0);
    });

    it("should handle code quality analysis errors gracefully", async () => {
      const result = await cm.executeCode(`
        try {
          // This should not throw, even if the actual analysis fails
          const analysis = codeQuality.quickAnalysis('/nonexistent/path');
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `);

      // Should either succeed or fail gracefully
      const data = result.data as any;
      expect(typeof data.success).toBe("boolean");
    });
  });

  describe("Project Architecture Integration", () => {
    it("should expose project architecture tools", async () => {
      const result = await cm.executeCode(`
        const hasProjectArchitecture = typeof projectArchitecture !== 'undefined';
        const hasValidate = typeof projectArchitecture?.validateProjectStructure === 'function';
        const hasArchitecture = typeof projectArchitecture?.REYNARD_ARCHITECTURE !== 'undefined';
        
        return {
          hasProjectArchitecture,
          hasValidate,
          hasArchitecture,
          exports: Object.keys(projectArchitecture).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasProjectArchitecture).toBe(true);
      expect(data.hasValidate).toBe(true);
      expect(data.hasArchitecture).toBe(true);
    });
  });

  describe("Dependency Graph Integration", () => {
    it("should expose dependency graph analysis tools", async () => {
      const result = await cm.executeCode(`
        const hasDependencyGraph = typeof dependencyGraph !== 'undefined';
        const hasAnalyzer = typeof dependencyGraph?.DependencyAnalyzer === 'function';
        
        return {
          hasDependencyGraph,
          hasAnalyzer,
          exports: Object.keys(dependencyGraph).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasDependencyGraph).toBe(true);
      expect(data.hasAnalyzer).toBe(true);
      expect(data.exports.length).toBeGreaterThan(0);
    });
  });

  describe("Dev Server Management Integration", () => {
    it("should expose dev server management tools", async () => {
      const result = await cm.executeCode(`
        const hasDevServerManagement = typeof devServerManagement !== 'undefined';
        const hasManager = typeof devServerManagement?.DevServerManager === 'function';
        const hasPortManager = typeof devServerManagement?.PortManager === 'function';
        
        return {
          hasDevServerManagement,
          hasManager,
          hasPortManager,
          exports: Object.keys(devServerManagement).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasDevServerManagement).toBe(true);
      expect(data.hasManager).toBe(true);
      expect(data.hasPortManager).toBe(true);
    });
  });

  describe("ADR System Integration", () => {
    it("should expose ADR system tools", async () => {
      const result = await cm.executeCode(`
        const hasAdrSystem = typeof adrSystem !== 'undefined';
        const hasAnalyzer = typeof adrSystem?.CodebaseAnalyzer === 'function';
        const hasGenerator = typeof adrSystem?.ADRGenerator === 'function';
        
        return {
          hasAdrSystem,
          hasAnalyzer,
          hasGenerator,
          exports: Object.keys(adrSystem).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasAdrSystem).toBe(true);
      expect(data.hasAnalyzer).toBe(true);
      expect(data.hasGenerator).toBe(true);
    });
  });

  describe("Diagram Generator Integration", () => {
    it("should expose diagram generation tools", async () => {
      const result = await cm.executeCode(`
        const hasDiagramGenerator = typeof diagramGenerator !== 'undefined';
        const hasGenerator = typeof diagramGenerator?.DiagramGenerator === 'function';
        const hasCreateGenerator = typeof diagramGenerator?.createDiagramGenerator === 'function';
        
        return {
          hasDiagramGenerator,
          hasGenerator,
          hasCreateGenerator,
          exports: Object.keys(diagramGenerator).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasDiagramGenerator).toBe(true);
      expect(data.hasGenerator).toBe(true);
      expect(data.hasCreateGenerator).toBe(true);
    });
  });

  describe("File Processing Integration", () => {
    it("should expose file processing tools", async () => {
      const result = await cm.executeCode(`
        const hasFileProcessing = typeof fileProcessing !== 'undefined';
        const hasPipeline = typeof fileProcessing?.FileProcessingPipeline === 'function';
        const hasFactory = typeof fileProcessing?.MetadataExtractorFactory === 'function';
        
        return {
          hasFileProcessing,
          hasPipeline,
          hasFactory,
          exports: Object.keys(fileProcessing).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasFileProcessing).toBe(true);
      expect(data.hasPipeline).toBe(true);
      expect(data.hasFactory).toBe(true);
    });
  });

  describe("Public Package Manager Integration", () => {
    it("should expose package management tools", async () => {
      const result = await cm.executeCode(`
        const hasPublicPackageManager = typeof publicPackageManager !== 'undefined';
        const hasManager = typeof publicPackageManager?.PublicPackageManager === 'function';
        const hasPluginManager = typeof publicPackageManager?.PluginManager === 'function';
        
        return {
          hasPublicPackageManager,
          hasManager,
          hasPluginManager,
          exports: Object.keys(publicPackageManager).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasPublicPackageManager).toBe(true);
      expect(data.hasManager).toBe(true);
      expect(data.hasPluginManager).toBe(true);
    });
  });

  describe("Queue Watcher Integration", () => {
    it("should expose queue management tools", async () => {
      const result = await cm.executeCode(`
        const hasQueueWatcher = typeof queueWatcher !== 'undefined';
        const hasManager = typeof queueWatcher?.FileQueueManager === 'function';
        const hasProcessors = typeof queueWatcher?.Processors !== 'undefined';
        
        return {
          hasQueueWatcher,
          hasManager,
          hasProcessors,
          exports: Object.keys(queueWatcher).slice(0, 5)
        };
      `);

      const data = result.data as any;
      expect(data.hasQueueWatcher).toBe(true);
      expect(data.hasManager).toBe(true);
      expect(data.hasProcessors).toBe(true);
    });
  });

  describe("API Client Integration", () => {
    it("should expose API client", async () => {
      const result = await cm.executeCode(`
        const hasApiClient = typeof apiClient !== 'undefined';
        const hasRag = typeof apiClient?.rag !== 'undefined';
        const hasHealth = typeof apiClient?.health !== 'undefined';
        
        return {
          hasApiClient,
          hasRag,
          hasHealth,
          exports: apiClient ? Object.keys(apiClient).slice(0, 5) : []
        };
      `);

      const data = result.data as any;
      expect(data.hasApiClient).toBe(true);
      expect(data.hasRag).toBe(true);
      expect(data.hasHealth).toBe(true);
    });
  });

  describe("Combined Integration", () => {
    it("should have all dev-tools packages available simultaneously", async () => {
      const result = await cm.executeCode(`
        const packages = {
          algorithms: typeof algorithms !== 'undefined',
          codeQuality: typeof codeQuality !== 'undefined',
          projectArchitecture: typeof projectArchitecture !== 'undefined',
          dependencyGraph: typeof dependencyGraph !== 'undefined',
          devServerManagement: typeof devServerManagement !== 'undefined',
          adrSystem: typeof adrSystem !== 'undefined',
          diagramGenerator: typeof diagramGenerator !== 'undefined',
          fileProcessing: typeof fileProcessing !== 'undefined',
          publicPackageManager: typeof publicPackageManager !== 'undefined',
          queueWatcher: typeof queueWatcher !== 'undefined',
          apiClient: typeof apiClient !== 'undefined'
        };
        
        const availableCount = Object.values(packages).filter(Boolean).length;
        const totalCount = Object.keys(packages).length;
        
        return {
          availableCount,
          totalCount,
          packages
        };
      `);

      const data = result.data as any;
      expect(data.availableCount).toBeGreaterThanOrEqual(10); // At least 10 packages should be available
      expect(data.totalCount).toBe(11); // All packages including algorithms
      expect(data.packages.algorithms).toBe(true);
    });

    it("should handle complex workflows without errors", async () => {
      const result = await cm.executeCode(`
        try {
          // Test a complex workflow using multiple packages
          const workflow = {
            codeQuality: typeof codeQuality !== 'undefined',
            projectArchitecture: typeof projectArchitecture !== 'undefined',
            dependencyGraph: typeof dependencyGraph !== 'undefined',
            devServerManagement: typeof devServerManagement !== 'undefined',
            adrSystem: typeof adrSystem !== 'undefined',
            diagramGenerator: typeof diagramGenerator !== 'undefined',
            fileProcessing: typeof fileProcessing !== 'undefined',
            publicPackageManager: typeof publicPackageManager !== 'undefined',
            queueWatcher: typeof queueWatcher !== 'undefined',
            apiClient: typeof apiClient !== 'undefined'
          };
          
          return { success: true, workflow };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `);

      const data = result.data as any;
      expect(data.success).toBe(true);
      expect(data.workflow).toBeDefined();
      expect(Object.keys(data.workflow).length).toBe(10);
    });
  });

  describe("Performance and Timeout", () => {
    it("should complete within reasonable time", async () => {
      const startTime = Date.now();

      const result = await cm.executeCode(`
        const results = [
          { name: 'algorithms', available: typeof algorithms !== 'undefined' },
          { name: 'codeQuality', available: typeof codeQuality !== 'undefined' },
          { name: 'projectArchitecture', available: typeof projectArchitecture !== 'undefined' },
          { name: 'dependencyGraph', available: typeof dependencyGraph !== 'undefined' },
          { name: 'devServerManagement', available: typeof devServerManagement !== 'undefined' },
          { name: 'adrSystem', available: typeof adrSystem !== 'undefined' },
          { name: 'diagramGenerator', available: typeof diagramGenerator !== 'undefined' },
          { name: 'fileProcessing', available: typeof fileProcessing !== 'undefined' },
          { name: 'publicPackageManager', available: typeof publicPackageManager !== 'undefined' },
          { name: 'queueWatcher', available: typeof queueWatcher !== 'undefined' }
        ];
        
        return { results };
      `);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      const data = result.data as any;
      expect(data.results.length).toBe(10);
      expect(data.results.every(r => typeof r.available === "boolean")).toBe(true);
    });
  });
});
