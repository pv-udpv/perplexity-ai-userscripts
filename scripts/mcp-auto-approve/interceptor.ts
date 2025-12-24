/**
 * MCP Interceptor
 * 
 * Hooks into fetch and WebSocket APIs to detect MCP calls.
 */

import { initializeLogger } from '@shared';
import type { MCPPayload } from './types';
import { extractRepository } from './utils';

const logger = initializeLogger('mcp-interceptor');

/**
 * MCP Interceptor class
 */
export class MCPInterceptor {
  private originalFetch: typeof fetch;
  private originalWebSocketSend: typeof WebSocket.prototype.send;

  constructor() {
    this.originalFetch = window.fetch;
    this.originalWebSocketSend = WebSocket.prototype.send;
  }

  /**
   * Intercept fetch API
   */
  interceptFetch(handler: (payload: MCPPayload) => void): void {
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [url, options] = args;

      // Check if this is an MCP-related request
      if (this.isMCPRequest(url.toString())) {
        const payload = await this.extractPayloadFromFetch(url, options);

        if (payload) {
          logger.debug('MCP call detected (fetch)', payload);
          handler(payload);
        }
      }

      return this.originalFetch(...args);
    };

    logger.info('Fetch interceptor installed');
  }

  /**
   * Intercept WebSocket API
   */
  interceptWebSocket(handler: (payload: MCPPayload) => void): void {
    // Save reference to original send and instance context
    const originalSend = this.originalWebSocketSend;

    WebSocket.prototype.send = function (data: string | ArrayBufferLike | Blob | ArrayBufferView) {
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);

          if (parsed.type === 'mcp_call' || parsed.tool || parsed.provider) {
            const payload = MCPInterceptor.extractPayloadFromWebSocket(parsed);

            if (payload) {
              logger.debug('MCP call detected (WebSocket)', payload);
              handler(payload);
            }
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }

      // Call original send with correct context
      return originalSend.call(this, data);
    };

    logger.info('WebSocket interceptor installed');
  }

  /**
   * Check if URL is MCP-related
   */
  private isMCPRequest(url: string): boolean {
    return (
      url.includes('/api/mcp') ||
      url.includes('/copilot') ||
      url.includes('/tools') ||
      url.includes('/agent')
    );
  }

  /**
   * Extract MCP payload from fetch request
   */
  private async extractPayloadFromFetch(
    url: string | URL,
    options?: RequestInit
  ): Promise<MCPPayload | null> {
    try {
      if (!options?.body) {
        return null;
      }

      const body = JSON.parse(options.body as string);

      // Check for GitHub MCP call
      if (body.tool === 'github' || body.provider === '@GitHub' || body.provider === 'github') {
        return {
          provider: 'github',
          operation: this.detectOperation(body),
          resource: body.resource || 'file',
          repository: extractRepository(body.repository || body.repo || ''),
          filePath: body.path || body.filePath,
          metadata: body,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      logger.debug('Failed to extract payload from fetch', error);
      return null;
    }
  }

  /**
   * Extract MCP payload from WebSocket message
   */
  private static extractPayloadFromWebSocket(data: any): MCPPayload | null {
    try {
      const provider = data.provider?.toLowerCase() || data.tool?.toLowerCase();

      if (!provider) {
        return null;
      }

      return {
        provider,
        operation: data.operation || data.action || 'unknown',
        resource: data.resource || 'unknown',
        repository: extractRepository(data.repository || data.repo || ''),
        filePath: data.path || data.filePath,
        metadata: data,
        timestamp: Date.now(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect operation from request body
   */
  private detectOperation(body: any): 'create' | 'update' | 'delete' | 'read' {
    const method = body.method?.toLowerCase();
    const action = body.action?.toLowerCase();
    const operation = body.operation?.toLowerCase();

    if (method === 'post' || action === 'create' || operation === 'create') {
      return 'create';
    }

    if (method === 'put' || method === 'patch' || action === 'update' || operation === 'update') {
      return 'update';
    }

    if (method === 'delete' || action === 'delete' || operation === 'delete') {
      return 'delete';
    }

    return 'read';
  }
}
