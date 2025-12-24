/**
 * Configuration Manager for MCP Auto-Approve
 * 
 * Handles config loading, validation, and rule matching.
 */

import { storage, initializeLogger } from '@shared';
import type {
  MCPAutoApproveConfig,
  MCPPayload,
  ApprovalDecision,
  ApprovalRule,
} from './types';
import { matchPattern } from './utils';

const logger = initializeLogger('mcp-config');

/**
 * Default configuration
 */
const DEFAULT_CONFIG: MCPAutoApproveConfig = {
  enabled: true,
  defaultDelay: 3,
  providers: [
    {
      name: 'github',
      rules: [
        // Example rule: Auto-approve for personal repos
        {
          repoPattern: 'pv-udpv/*',
          operations: ['create', 'update'],
          pathPatterns: ['scripts/**', 'docs/**', '*.md'],
          autoApprove: true,
          delay: 2,
          requireConfirmation: true,
          notifyOnApproval: false,
        },
        // Security: Never auto-approve deletes
        {
          repoPattern: '*',
          operations: ['delete'],
          autoApprove: false,
          delay: 0,
        },
      ],
    },
  ],
};

/**
 * Configuration Manager
 */
export class ConfigManager {
  private config: MCPAutoApproveConfig;

  constructor() {
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Load configuration from storage
   */
  async load(): Promise<void> {
    try {
      const stored = await storage.get<MCPAutoApproveConfig>('mcp-auto-approve-config');

      if (stored) {
        this.config = this.validateConfig(stored);
        logger.info('Configuration loaded from storage');
      } else {
        // First run: save default config
        await this.save();
        logger.info('Default configuration initialized');
      }
    } catch (error) {
      logger.error('Failed to load configuration', error);
      this.config = DEFAULT_CONFIG;
    }
  }

  /**
   * Save configuration to storage
   */
  async save(): Promise<void> {
    try {
      await storage.set('mcp-auto-approve-config', this.config);
      logger.info('Configuration saved');
    } catch (error) {
      logger.error('Failed to save configuration', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): MCPAutoApproveConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: MCPAutoApproveConfig): Promise<void> {
    this.config = this.validateConfig(newConfig);
    await this.save();
  }

  /**
   * Validate configuration structure
   */
  private validateConfig(config: MCPAutoApproveConfig): MCPAutoApproveConfig {
    // Basic validation
    if (!config.providers || !Array.isArray(config.providers)) {
      logger.warn('Invalid config: providers must be an array');
      return DEFAULT_CONFIG;
    }

    // Ensure default delay is reasonable
    if (config.defaultDelay < 0 || config.defaultDelay > 60) {
      logger.warn('Invalid defaultDelay, using 3 seconds');
      config.defaultDelay = 3;
    }

    return config;
  }

  /**
   * Evaluate approval rules for a given MCP payload
   */
  async evaluateApprovalRules(payload: MCPPayload): Promise<ApprovalDecision> {
    const provider = this.config.providers.find((p) => p.name === payload.provider);

    if (!provider) {
      logger.debug('No provider config found', { provider: payload.provider });
      return {
        autoApprove: false,
        rule: {} as ApprovalRule,
        delay: 0,
        reason: 'No provider configuration',
      };
    }

    // Find matching rule
    for (const rule of provider.rules) {
      if (this.ruleMatches(rule, payload)) {
        logger.info('Matching rule found', { rule, payload });

        return {
          autoApprove: rule.autoApprove,
          rule,
          delay: rule.delay ?? this.config.defaultDelay,
        };
      }
    }

    logger.debug('No matching rule found', payload);
    return {
      autoApprove: false,
      rule: {} as ApprovalRule,
      delay: 0,
      reason: 'No matching rule',
    };
  }

  /**
   * Check if a rule matches the payload
   */
  private ruleMatches(rule: ApprovalRule, payload: MCPPayload): boolean {
    // Check operation
    if (!rule.operations.includes(payload.operation)) {
      return false;
    }

    // Check repository pattern
    if (payload.repository && !matchPattern(payload.repository, rule.repoPattern)) {
      return false;
    }

    // Check file path patterns (if specified)
    if (rule.pathPatterns && payload.filePath) {
      const pathMatches = rule.pathPatterns.some((pattern) =>
        matchPattern(payload.filePath!, pattern)
      );

      if (!pathMatches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  async importConfig(json: string): Promise<void> {
    try {
      const config = JSON.parse(json);
      await this.updateConfig(config);
      logger.info('Configuration imported successfully');
    } catch (error) {
      logger.error('Failed to import configuration', error);
      throw new Error('Invalid JSON configuration');
    }
  }
}
