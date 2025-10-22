/**
 * @file Backend Client Integration
 * 
 * Wraps reynard-api-client for seamless backend access in tools.
 */

import { createReynardApiClient } from '@reynard/services/api-client';

export interface BackendClientConfig {
  basePath?: string;
  timeout?: number;
  apiKey?: string;
}

export class BackendClient {
  private client: any;
  private config: BackendClientConfig;

  constructor(config: BackendClientConfig = {}) {
    this.config = {
      basePath: process.env.BACKEND_BASE_URL || 'http://localhost:8000',
      timeout: 30000,
      ...config
    };
    
    this.client = createReynardApiClient({
      basePath: this.config.basePath,
      timeout: this.config.timeout
    });
  }

  // ECS World Integration
  async getAgentPersona(agentId: string) {
    return this.client.ecs.getAgentPersona({ agentId });
  }

  async generateAgentName(options: { specialist: string; style: string }) {
    return this.client.ecs.generateName(options);
  }

  async createOffspring(parent1Id: string, parent2Id: string) {
    return this.client.ecs.createOffspring({ parent1Id, parent2Id });
  }

  // RAG Integration
  async semanticSearch(query: string, options?: any) {
    return this.client.rag.queryRag({ query, ...options });
  }

  async embedText(text: string) {
    return this.client.rag.embedText({ text });
  }

  // Caption Integration
  async generateCaption(imageData: string) {
    return this.client.caption.generateCaption({ image: imageData });
  }

  // Authentication
  async authenticate(credentials: any) {
    return this.client.auth.authenticate(credentials);
  }

  // Health Check
  async getHealth() {
    return this.client.health.getHealth();
  }
}

// Global backend client instance
let globalBackendClient: BackendClient | null = null;

export function getBackendClient(config?: BackendClientConfig): BackendClient {
  if (!globalBackendClient) {
    globalBackendClient = new BackendClient(config);
  }
  return globalBackendClient;
}
