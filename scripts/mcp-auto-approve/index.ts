/**
 * MCP Auto-Approve Plugin
 * 
 * Automatically approves MCP (Model Context Protocol) operations based on configurable rules.
 * Uses BroadcastChannel for inter-context communication and fetch interception.
 * 
 * @see Issue #7
 */

import { storage, events, initializeLogger } from '@shared';
import { ConfigManager } from './config';
import { MCPInterceptor } from './interceptor';
import { UIManager } from './ui';
import type { MCPPayload, ApprovalDecision } from './types';

const logger = initializeLogger('mcp-auto-approve');
const configManager = new ConfigManager();
const uiManager = new UIManager();
const interceptor = new MCPInterceptor();

/**
 * Main plugin initialization
 */
async function initialize(): Promise<void> {
  logger.info('Initializing MCP Auto-Approve plugin');

  // Load configuration
  await configManager.load();
  logger.info('Configuration loaded', { config: configManager.getConfig() });

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Setup MCP interceptors
  setupMCPInterceptors();

  // Setup BroadcastChannel listener
  setupBroadcastChannel();

  logger.info('MCP Auto-Approve plugin initialized successfully');
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+M: Open config panel
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      uiManager.openConfigPanel(configManager);
    }

    // Esc: Cancel active countdown
    if (e.key === 'Escape') {
      uiManager.cancelActiveCountdown();
    }
  });
}

/**
 * Setup MCP call interceptors (fetch + WebSocket)
 */
function setupMCPInterceptors(): void {
  interceptor.interceptFetch(handleMCPCall);
  interceptor.interceptWebSocket(handleMCPCall);
  logger.info('MCP interceptors installed');
}

/**
 * Setup BroadcastChannel for cross-context communication
 */
function setupBroadcastChannel(): void {
  const mcpChannel = new BroadcastChannel('perplexity-mcp-channel');

  mcpChannel.addEventListener('message', (event) => {
    if (event.data.type === 'MCP_CALL') {
      handleMCPCall(event.data.payload);
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    mcpChannel.close();
  });
}

/**
 * Handle MCP call and evaluate approval rules
 */
async function handleMCPCall(payload: MCPPayload): Promise<void> {
  const config = configManager.getConfig();

  if (!config.enabled) {
    logger.debug('Plugin disabled, skipping MCP call', payload);
    return;
  }

  logger.info('MCP call detected', payload);

  // Find matching rule
  const decision = await configManager.evaluateApprovalRules(payload);

  if (!decision.autoApprove) {
    logger.info('No matching rule or auto-approve disabled', { payload, decision });
    return;
  }

  // Security check: never auto-approve delete without explicit whitelist
  if (payload.operation === 'delete' && !decision.rule.operations.includes('delete')) {
    logger.warn('Delete operation blocked by security policy', payload);
    uiManager.showNotification(
      'Delete operation requires manual approval',
      'warning'
    );
    return;
  }

  // Show countdown with cancel option
  const cancelled = await showApprovalCountdown(decision);

  if (cancelled) {
    logger.info('Auto-approval cancelled by user', payload);
    return;
  }

  // Execute approval
  await executeApproval(payload, decision);

  // Audit log
  logAuditTrail(payload, decision);

  // Optional notification
  if (decision.rule.notifyOnApproval) {
    uiManager.showNotification(
      `Auto-approved: ${payload.operation} on ${payload.resource}`,
      'success'
    );
  }
}

/**
 * Show countdown overlay with cancel option
 */
async function showApprovalCountdown(decision: ApprovalDecision): Promise<boolean> {
  if (!decision.rule.requireConfirmation) {
    // Silent delay without UI
    await sleep(decision.delay * 1000);
    return false;
  }

  return uiManager.showCountdown(decision.delay);
}

/**
 * Execute approval by clicking the approve button
 */
async function executeApproval(
  payload: MCPPayload,
  decision: ApprovalDecision
): Promise<void> {
  try {
    // Find and click approve button
    const approveButton = findApproveButton();

    if (!approveButton) {
      logger.error('Approve button not found', payload);
      uiManager.showNotification('Failed to find approve button', 'error');
      return;
    }

    logger.info('Clicking approve button', payload);
    approveButton.click();
  } catch (error) {
    logger.error('Failed to execute approval', { payload, error });
    uiManager.showNotification('Approval failed', 'error');
  }
}

/**
 * Find approve button in DOM
 */
function findApproveButton(): HTMLButtonElement | null {
  // Strategy 1: Find by GitHub logo + "Одобрить" text
  const githubLogo = document.querySelector('img[alt="GitHub Logo"], img[src*="github-avatar.svg"]');

  if (githubLogo) {
    const container = githubLogo.closest('div[class*="flex"]');
    const approveButton = container?.querySelector('button');

    if (approveButton && approveButton.textContent?.includes('Одобрить')) {
      return approveButton;
    }
  }

  // Strategy 2: Find by button text
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.find((btn) => btn.textContent?.includes('Одобрить')) || null;
}

/**
 * Log audit trail to console
 */
function logAuditTrail(payload: MCPPayload, decision: ApprovalDecision): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    provider: payload.provider,
    operation: payload.operation,
    resource: payload.resource,
    repository: payload.repository,
    filePath: payload.filePath,
    rule: {
      repoPattern: decision.rule.repoPattern,
      operations: decision.rule.operations,
      delay: decision.delay,
    },
  };

  console.group('🤖 MCP Auto-Approval Audit');
  console.log('Timestamp:', auditEntry.timestamp);
  console.log('Provider:', auditEntry.provider);
  console.log('Operation:', auditEntry.operation);
  console.log('Resource:', auditEntry.resource);
  console.log('Repository:', auditEntry.repository);
  console.log('File Path:', auditEntry.filePath);
  console.log('Matched Rule:', auditEntry.rule);
  console.groupEnd();

  // Store in audit log with error handling
  storage.get<any[]>('audit-log')
    .then((log) => {
      const updatedLog = [...(log || []), auditEntry].slice(-100); // Keep last 100
      return storage.set('audit-log', updatedLog);
    })
    .catch((error) => {
      logger.error('Failed to store audit log entry', error);
    });
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize plugin
initialize().catch((error) => {
  logger.error('Failed to initialize plugin', error);
});

// Export for testing
export { handleMCPCall, findApproveButton };
