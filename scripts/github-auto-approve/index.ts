/**
 * GitHub Auto-Approve - Perplexity AI Userscript
 * 
 * Automatically approves GitHub operations based on configurable rules.
 * 
 * Features:
 * - Repository whitelisting with wildcards
 * - Operation type filtering (create, update, delete)
 * - File path pattern matching
 * - Visual countdown with cancel option
 * - Keyboard shortcut (Ctrl+Shift+G) for config panel
 * - Audit logging
 * 
 * @author pv-udpv
 * @license MIT
 */

import type {
  AutoApproveConfig,
  GitHubOperation,
  CountdownState,
  AuditLogEntry,
  OperationType,
  ApprovalRule,
} from './types';
import {
  logger,
  loadConfig,
  saveConfig,
  findMatchingRule,
  generateId,
  DEFAULT_CONFIG,
} from './utils';

// Active countdowns
const activeCountdowns = new Map<string, CountdownState>();

// Global configuration
let config: AutoApproveConfig = DEFAULT_CONFIG;

/**
 * Initialize the userscript.
 */
async function init(): Promise<void> {
  logger.info('Initializing GitHub Auto-Approve...');
  
  try {
    // Load configuration
    config = await loadConfig();
    logger.debug('Config loaded:', config);
    
    if (!config.enabled) {
      logger.info('Auto-approve is disabled');
      return;
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup mutation observer to detect GitHub approval prompts
    setupMutationObserver();
    
    logger.info('Initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize:', error);
  }
}

/**
 * Setup keyboard shortcuts.
 */
function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    // Ctrl+Shift+G - Open config panel
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyG') {
      event.preventDefault();
      openConfigPanel();
    }
  });
  
  logger.debug('Keyboard shortcuts registered');
}

/**
 * Setup mutation observer to detect GitHub approval prompts.
 */
function setupMutationObserver(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length === 0) {
        continue;
      }
      
      // Check each added node
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        
        const element = node as HTMLElement;
        
        // Check if this element or its descendants contain GitHub approval prompts
        checkForGitHubPrompts(element);
      });
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // Also check existing elements
  checkForGitHubPrompts(document.body);
  
  logger.debug('Mutation observer setup complete');
}

/**
 * Check an element and its descendants for GitHub approval prompts.
 */
function checkForGitHubPrompts(element: HTMLElement): void {
  // Look for elements with GitHub logo or approval buttons
  const potentialPrompts = [element];
  potentialPrompts.push(...Array.from(element.querySelectorAll<HTMLElement>('div, section')));
  
  for (const prompt of potentialPrompts) {
    // Check for GitHub logo
    const hasGitHubLogo = prompt.querySelector('img[alt*="GitHub"], img[src*="github"]');
    
    // Check for approval button with Russian text "Одобрить" or English "Approve"
    const approveButton = findApproveButton(prompt);
    
    if (hasGitHubLogo && approveButton) {
      // Found a GitHub approval prompt
      handleGitHubPrompt(prompt, approveButton);
    }
  }
}

/**
 * Find approve button in element.
 */
function findApproveButton(element: HTMLElement): HTMLButtonElement | null {
  const buttons = element.querySelectorAll<HTMLButtonElement>('button');
  
  for (const button of buttons) {
    const text = button.textContent?.trim().toLowerCase() || '';
    // Check for Russian "Одобрить" or English "Approve"
    if (text.includes('одобрить') || text === 'approve') {
      return button;
    }
  }
  
  return null;
}

/**
 * Handle GitHub approval prompt.
 */
function handleGitHubPrompt(element: HTMLElement, approveButton: HTMLButtonElement): void {
  // Check if we've already processed this prompt
  if (element.dataset.autoApproveProcessed === 'true') {
    return;
  }
  element.dataset.autoApproveProcessed = 'true';
  
  // Extract operation details
  const operation = extractOperationDetails(element, approveButton);
  
  logger.debug('GitHub operation detected:', operation);
  
  // Check if there's a matching rule
  const matchingRule = findMatchingRule(
    config,
    operation.repository,
    operation.operationType,
    operation.filePaths
  );
  
  if (!matchingRule) {
    logger.debug('No matching rule for operation');
    return;
  }
  
  logger.info('Matching rule found:', matchingRule);
  
  // Start countdown for auto-approval
  startCountdown(operation, matchingRule.delay);
}

/**
 * Extract operation details from approval prompt.
 */
function extractOperationDetails(
  element: HTMLElement,
  approveButton: HTMLButtonElement
): GitHubOperation {
  // Try to extract repository name
  let repository = 'unknown/unknown';
  const textContent = element.textContent || '';
  
  // Look for pattern like "owner/repo" in text
  const repoMatch = textContent.match(/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
  if (repoMatch) {
    repository = repoMatch[1];
  }
  
  // Detect operation type from keywords
  let operationType: OperationType = 'unknown';
  const lowerText = textContent.toLowerCase();
  
  if (lowerText.includes('create') || lowerText.includes('creating') || lowerText.includes('add')) {
    operationType = 'create';
  } else if (lowerText.includes('update') || lowerText.includes('updating') || lowerText.includes('modify') || lowerText.includes('edit')) {
    operationType = 'update';
  } else if (lowerText.includes('delete') || lowerText.includes('deleting') || lowerText.includes('remove')) {
    operationType = 'delete';
  }
  
  // Try to extract file paths
  const filePaths: string[] = [];
  // Look for code blocks or specific file path patterns
  const fileMatches = textContent.match(/[\w/-]+\.(ts|js|json|md|tsx|jsx|py|go|java|rb|php|css|html|yaml|yml|xml)/gi);
  if (fileMatches) {
    filePaths.push(...fileMatches);
  }
  
  return {
    repository,
    operationType,
    filePaths,
    description: textContent.substring(0, 200), // First 200 chars
    element,
    approveButton,
  };
}

/**
 * Start countdown for auto-approval.
 */
function startCountdown(operation: GitHubOperation, delay: number): void {
  const id = generateId();
  
  // Create visual overlay
  const overlay = createCountdownOverlay(id, delay);
  operation.element.appendChild(overlay);
  
  let remaining = delay;
  
  const timerId = window.setInterval(() => {
    remaining--;
    updateCountdownOverlay(overlay, remaining, delay);
    
    if (remaining <= 0) {
      clearInterval(timerId);
      activeCountdowns.delete(id);
      performAutoApproval(operation);
    }
  }, 1000);
  
  const countdownState: CountdownState = {
    id,
    remaining,
    total: delay,
    timerId,
    operation,
    overlay,
  };
  
  activeCountdowns.set(id, countdownState);
  
  logger.debug(`Countdown started: ${delay}s for ${operation.repository}`);
}

/**
 * Create countdown overlay UI.
 */
function createCountdownOverlay(id: string, delay: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'github-auto-approve-countdown';
  overlay.dataset.countdownId = id;
  overlay.style.cssText = `
    position: relative;
    margin-top: 8px;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `;
  
  const message = document.createElement('div');
  message.className = 'countdown-message';
  message.textContent = `Auto-approving in ${delay}s...`;
  message.style.cssText = `
    font-weight: 500;
    margin-bottom: 8px;
  `;
  
  const progressBar = document.createElement('div');
  progressBar.className = 'countdown-progress';
  progressBar.style.cssText = `
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 8px;
  `;
  
  const progressFill = document.createElement('div');
  progressFill.className = 'countdown-progress-fill';
  progressFill.style.cssText = `
    width: 100%;
    height: 100%;
    background: white;
    transition: width 1s linear;
  `;
  progressBar.appendChild(progressFill);
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  cancelButton.addEventListener('mouseenter', () => {
    cancelButton.style.background = 'rgba(255, 255, 255, 0.3)';
  });
  cancelButton.addEventListener('mouseleave', () => {
    cancelButton.style.background = 'rgba(255, 255, 255, 0.2)';
  });
  cancelButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancelCountdown(id);
  });
  
  overlay.appendChild(message);
  overlay.appendChild(progressBar);
  overlay.appendChild(cancelButton);
  
  return overlay;
}

/**
 * Update countdown overlay.
 */
function updateCountdownOverlay(overlay: HTMLElement, remaining: number, total: number): void {
  const message = overlay.querySelector<HTMLElement>('.countdown-message');
  const progressFill = overlay.querySelector<HTMLElement>('.countdown-progress-fill');
  
  if (message) {
    message.textContent = `Auto-approving in ${remaining}s...`;
  }
  
  if (progressFill) {
    const percentage = (remaining / total) * 100;
    progressFill.style.width = `${percentage}%`;
  }
}

/**
 * Cancel countdown.
 */
function cancelCountdown(id: string): void {
  const countdown = activeCountdowns.get(id);
  if (!countdown) {
    return;
  }
  
  clearInterval(countdown.timerId);
  activeCountdowns.delete(id);
  
  if (countdown.overlay) {
    countdown.overlay.remove();
  }
  
  // Log cancellation
  const auditEntry: AuditLogEntry = {
    timestamp: Date.now(),
    repository: countdown.operation.repository,
    operationType: countdown.operation.operationType,
    action: 'cancelled',
  };
  logger.audit(auditEntry);
  
  logger.info('Auto-approval cancelled');
}

/**
 * Perform auto-approval.
 */
function performAutoApproval(operation: GitHubOperation): void {
  if (!operation.approveButton) {
    logger.error('Approve button not found');
    return;
  }
  
  try {
    // Click the approve button
    operation.approveButton.click();
    
    // Log approval
    const auditEntry: AuditLogEntry = {
      timestamp: Date.now(),
      repository: operation.repository,
      operationType: operation.operationType,
      action: 'auto-approved',
      matchedRule: 'Auto-approved by rule',
    };
    logger.audit(auditEntry);
    
    logger.info(`Auto-approved: ${operation.repository} - ${operation.operationType}`);
    
    // Remove overlay if still present
    const overlay = operation.element.querySelector('.github-auto-approve-countdown');
    if (overlay) {
      overlay.remove();
    }
  } catch (error) {
    logger.error('Failed to auto-approve:', error);
  }
}

/**
 * Open configuration panel.
 */
function openConfigPanel(): void {
  // Remove existing panel if any
  const existing = document.getElementById('github-auto-approve-config-panel');
  if (existing) {
    existing.remove();
    return;
  }
  
  const panel = createConfigPanel();
  document.body.appendChild(panel);
  
  logger.debug('Config panel opened');
}

/**
 * Create configuration panel UI.
 */
function createConfigPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'github-auto-approve-config-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 100000;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'GitHub Auto-Approve Settings';
  title.style.cssText = `
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  `;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  `;
  closeButton.addEventListener('click', () => panel.remove());
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    max-height: calc(80vh - 140px);
  `;
  
  // Enabled toggle
  const enabledSection = document.createElement('div');
  enabledSection.style.cssText = `margin-bottom: 20px;`;
  
  const enabledLabel = document.createElement('label');
  enabledLabel.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  const enabledCheckbox = document.createElement('input');
  enabledCheckbox.type = 'checkbox';
  enabledCheckbox.checked = config.enabled;
  enabledCheckbox.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
  `;
  
  enabledLabel.appendChild(enabledCheckbox);
  enabledLabel.appendChild(document.createTextNode('Enable Auto-Approve'));
  enabledSection.appendChild(enabledLabel);
  
  // Default delay
  const delaySection = document.createElement('div');
  delaySection.style.cssText = `margin-bottom: 20px;`;
  
  const delayLabel = document.createElement('label');
  delayLabel.textContent = 'Default Delay (seconds):';
  delayLabel.style.cssText = `
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
  `;
  
  const delayInput = document.createElement('input');
  delayInput.type = 'number';
  delayInput.min = '0';
  delayInput.max = '60';
  delayInput.value = config.defaultDelay.toString();
  delayInput.style.cssText = `
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  `;
  
  delaySection.appendChild(delayLabel);
  delaySection.appendChild(delayInput);
  
  // Rules section
  const rulesSection = document.createElement('div');
  rulesSection.style.cssText = `margin-bottom: 20px;`;
  
  const rulesTitle = document.createElement('h3');
  rulesTitle.textContent = 'Approval Rules';
  rulesTitle.style.cssText = `
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  `;
  
  const rulesHelp = document.createElement('p');
  rulesHelp.innerHTML = `
    <strong>Repository patterns:</strong> Use <code>owner/repo</code>, <code>owner/*</code>, or <code>*</code><br>
    <strong>Path patterns:</strong> Use <code>docs/**</code>, <code>*.md</code>, etc.
  `;
  rulesHelp.style.cssText = `
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.5;
  `;
  
  const rulesList = document.createElement('div');
  rulesList.className = 'rules-list';
  
  // Display current rules
  config.rules.forEach((rule, index) => {
    const ruleElement = createRuleElement(rule, index);
    rulesList.appendChild(ruleElement);
  });
  
  const addRuleButton = document.createElement('button');
  addRuleButton.textContent = '+ Add Rule';
  addRuleButton.style.cssText = `
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  addRuleButton.addEventListener('click', () => {
    const newRule = {
      repoPattern: '*',
      operations: ['create' as const, 'update' as const],
      delay: config.defaultDelay,
      autoApprove: true,
    };
    config.rules.push(newRule);
    const ruleElement = createRuleElement(newRule, config.rules.length - 1);
    rulesList.appendChild(ruleElement);
  });
  
  rulesSection.appendChild(rulesTitle);
  rulesSection.appendChild(rulesHelp);
  rulesSection.appendChild(rulesList);
  rulesSection.appendChild(addRuleButton);
  
  content.appendChild(enabledSection);
  content.appendChild(delaySection);
  content.appendChild(rulesSection);
  
  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  `;
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.style.cssText = `
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  saveButton.addEventListener('click', () => {
    config.enabled = enabledCheckbox.checked;
    config.defaultDelay = parseInt(delayInput.value, 10);
    
    saveConfig(config)
      .then(() => {
        logger.info('Configuration saved');
        panel.remove();
      })
      .catch((error: Error) => {
        logger.error('Failed to save config:', error);
        alert('Failed to save configuration');
      });
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    padding: 10px 20px;
    background: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  cancelButton.addEventListener('click', () => panel.remove());
  
  footer.appendChild(cancelButton);
  footer.appendChild(saveButton);
  
  panel.appendChild(header);
  panel.appendChild(content);
  panel.appendChild(footer);
  
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
  `;
  backdrop.addEventListener('click', () => {
    panel.remove();
    backdrop.remove();
  });
  
  // Insert backdrop before panel
  document.body.appendChild(backdrop);
  
  return panel;
}

/**
 * Create rule element for config panel.
 */
function createRuleElement(rule: ApprovalRule, index: number): HTMLElement {
  const ruleElement = document.createElement('div');
  ruleElement.style.cssText = `
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 12px;
    background: #f9f9f9;
  `;
  
  const repoInput = document.createElement('input');
  repoInput.type = 'text';
  repoInput.value = rule.repoPattern;
  repoInput.placeholder = 'owner/repo or owner/* or *';
  repoInput.style.cssText = `
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    margin-bottom: 8px;
  `;
  repoInput.addEventListener('change', () => {
    if (config.rules[index]) {
      config.rules[index].repoPattern = repoInput.value;
    }
  });
  
  const operationsLabel = document.createElement('div');
  operationsLabel.textContent = 'Operations:';
  operationsLabel.style.cssText = `
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
  `;
  
  const operationsDiv = document.createElement('div');
  operationsDiv.style.cssText = `
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  `;
  
  ['create', 'update', 'delete'].forEach((op: string) => {
    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      cursor: pointer;
    `;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = rule.operations.includes(op as OperationType);
    checkbox.addEventListener('change', () => {
      const currentRule = config.rules[index];
      if (!currentRule) return;
      
      if (checkbox.checked) {
        if (!currentRule.operations.includes(op as OperationType)) {
          currentRule.operations.push(op as OperationType);
        }
      } else {
        currentRule.operations = currentRule.operations.filter((o: OperationType) => o !== op);
      }
    });
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(op));
    operationsDiv.appendChild(label);
  });
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete Rule';
  deleteButton.style.cssText = `
    padding: 4px 8px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    margin-top: 4px;
  `;
  deleteButton.addEventListener('click', () => {
    config.rules.splice(index, 1);
    ruleElement.remove();
  });
  
  ruleElement.appendChild(repoInput);
  ruleElement.appendChild(operationsLabel);
  ruleElement.appendChild(operationsDiv);
  ruleElement.appendChild(deleteButton);
  
  return ruleElement;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void init().catch((error: Error) => logger.error(error));
  });
} else {
  void init().catch((error: Error) => logger.error(error));
}
