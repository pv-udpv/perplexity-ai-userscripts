/**
 * TypeScript type definitions for MCP Auto-Approve plugin
 */

/**
 * MCP Provider types
 */
export type MCPProvider = 'github' | 'linear' | 'slack' | 'notion' | string;

/**
 * Operation types
 */
export type Operation = 'create' | 'update' | 'delete' | 'read';

/**
 * MCP call payload (intercepted from network)
 */
export interface MCPPayload {
  provider: MCPProvider;
  operation: Operation;
  resource: string; // e.g., 'file', 'issue', 'pr'
  repository?: string; // e.g., 'owner/repo'
  filePath?: string; // e.g., 'src/index.ts'
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Plugin configuration
 */
export interface MCPAutoApproveConfig {
  enabled: boolean;
  defaultDelay: number; // seconds
  providers: ProviderConfig[];
}

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  name: MCPProvider;
  rules: ApprovalRule[];
}

/**
 * Approval rule definition
 */
export interface ApprovalRule {
  // Repository matching
  repoPattern: string; // 'owner/repo', 'owner/*', '*', or regex

  // Operation filtering
  operations: Operation[];

  // File path patterns (glob)
  pathPatterns?: string[];

  // Auto-approve behavior
  autoApprove: boolean;
  delay: number; // seconds, overrides default
  requireConfirmation?: boolean; // show countdown with cancel
  notifyOnApproval?: boolean; // show toast notification
}

/**
 * Approval decision result
 */
export interface ApprovalDecision {
  autoApprove: boolean;
  rule: ApprovalRule;
  delay: number;
  reason?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: string;
  provider: MCPProvider;
  operation: Operation;
  resource: string;
  repository?: string;
  filePath?: string;
  rule: {
    repoPattern: string;
    operations: Operation[];
    delay: number;
  };
}
