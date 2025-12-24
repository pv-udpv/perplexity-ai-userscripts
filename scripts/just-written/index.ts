/**
 * Just Written - Simple example userscript for Perplexity AI
 *
 * This is a minimal but complete example of a modern userscript
 * using TypeScript and proper event handling.
 */

interface AppState {
  isActive: boolean;
  messageCount: number;
}

const state: AppState = {
  isActive: true,
  messageCount: 0,
};

function log(message: string, data?: unknown): void {
  const prefix = '[just-written]';
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

/**
 * Initialize the script.
 */
function init(): void {
  log('Initializing...');

  // Wait for page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScript);
  } else {
    setupScript();
  }
}

/**
 * Setup script features.
 */
function setupScript(): void {
  log('Setting up features');

  // Add keyboard shortcut
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Monitor chat messages
  observeMessages();

  // Inject UI
  addStatusIndicator();

  log('Setup complete');
}

/**
 * Handle keyboard shortcuts.
 */
function handleKeyboardShortcuts(event: KeyboardEvent): void {
  // Ctrl+Shift+M - Toggle message monitoring
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyM') {
    event.preventDefault();
    state.isActive = !state.isActive;
    log(`Monitoring ${state.isActive ? 'enabled' : 'disabled'}`);
  }

  // Ctrl+Shift+C - Clear message count
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
    event.preventDefault();
    state.messageCount = 0;
    log('Message count reset');
  }
}

/**
 * Observe chat messages using MutationObserver.
 */
function observeMessages(): void {
  const observer = new MutationObserver(() => {
    if (!state.isActive) return;

    // Count message-like elements (adjust selector based on actual Perplexity DOM)
    const messages = document.querySelectorAll('[role="article"], .message, [data-message]');
    if (messages.length > state.messageCount) {
      state.messageCount = messages.length;
      log(`Messages detected: ${state.messageCount}`);
      updateStatusIndicator();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  log('Message observer attached');
}

/**
 * Add status indicator to page.
 */
function addStatusIndicator(): void {
  const indicator = document.createElement('div');
  indicator.id = 'just-written-status';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 15px;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    user-select: none;
  `;
  indicator.textContent = '✓ Just-Written Active';
  indicator.addEventListener('click', () => {
    state.isActive = !state.isActive;
    indicator.style.background = state.isActive ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
    indicator.textContent = state.isActive ? '✓ Active' : '✗ Paused';
  });

  document.body.appendChild(indicator);
  log('Status indicator added');
}

/**
 * Update status indicator with current state.
 */
function updateStatusIndicator(): void {
  const indicator = document.getElementById('just-written-status');
  if (indicator) {
    indicator.textContent = `Messages: ${state.messageCount}`;
  }
}

// Start the script
init();
