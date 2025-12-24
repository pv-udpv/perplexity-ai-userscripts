/**
 * Type definitions for GitHub Auto-Approve userscript.
 */

/**
 * Operation type for GitHub actions.
 */
export type OperationType = 'create' | 'update' | 'delete' | 'unknown';

/**
 * Individual approval rule.
 */
export interface ApprovalRule {
  /** Repository pattern: 'owner/repo', 'owner/*', '*', or regex */
  repoPattern: string;
  
  /** Operations to auto-approve */
  operations: OperationType[];
  
  /** Optional file path patterns (glob) */
  pathPatterns?: string[];
  
  /** Delay in seconds before auto-approving */
  delay: number;
  
  /** Whether to auto-approve matching operations */
  autoApprove: boolean;
}

/**
 * Main configuration for auto-approve feature.
 */
export interface AutoApproveConfig {
  /** Whether auto-approve is globally enabled */
  enabled: boolean;
  
  /** Default delay in seconds */
  defaultDelay: number;
  
  /** List of approval rules */
  rules: ApprovalRule[];
}

/**
 * GitHub operation details extracted from approval prompt.
 */
export interface GitHubOperation {
  /** Repository name (owner/repo) */
  repository: string;
  
  /** Type of operation */
  operationType: OperationType;
  
  /** File paths involved (if detectable) */
  filePaths: string[];
  
  /** Operation description */
  description: string;
  
  /** DOM element containing the approval buttons */
  element: HTMLElement;
  
  /** The approve button element */
  approveButton: HTMLButtonElement | null;
}

/**
 * Countdown state for a pending auto-approval.
 */
export interface CountdownState {
  /** Unique ID for this countdown */
  id: string;
  
  /** Remaining seconds */
  remaining: number;
  
  /** Total delay */
  total: number;
  
  /** Timer ID for cancellation */
  timerId: number;
  
  /** Associated operation */
  operation: GitHubOperation;
  
  /** UI overlay element */
  overlay: HTMLElement | null;
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
  /** Timestamp of action */
  timestamp: number;
  
  /** Repository affected */
  repository: string;
  
  /** Operation type */
  operationType: OperationType;
  
  /** Whether it was auto-approved or manually handled */
  action: 'auto-approved' | 'cancelled' | 'manual';
  
  /** Rule that matched (if auto-approved) */
  matchedRule?: string;
}
