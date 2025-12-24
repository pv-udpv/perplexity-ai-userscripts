/**
 * UI Manager for MCP Auto-Approve
 * 
 * Handles countdown overlay, config panel, and notifications.
 */

import { initializeLogger } from '@shared';
import type { ConfigManager } from './config';

const logger = initializeLogger('mcp-ui');

/**
 * UI Manager class
 */
export class UIManager {
  private activeCountdown: { cancel: () => void } | null = null;

  /**
   * Show countdown overlay with cancel button
   * 
   * @param seconds - Countdown duration
   * @returns Promise that resolves to true if cancelled, false if completed
   */
  showCountdown(seconds: number): Promise<boolean> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'mcp-countdown-overlay';
      overlay.innerHTML = `
        <div class="mcp-countdown-container">
          <div class="mcp-countdown-content">
            <div class="mcp-countdown-icon">🤖</div>
            <div class="mcp-countdown-value">${seconds}</div>
            <div class="mcp-countdown-text">Auto-approving in ${seconds}s...</div>
            <button class="mcp-countdown-cancel">Cancel (Esc)</button>
          </div>
          <div class="mcp-countdown-progress">
            <div class="mcp-countdown-progress-bar" style="animation-duration: ${seconds}s"></div>
          </div>
        </div>
      `;

      this.injectStyles();
      document.body.appendChild(overlay);

      let remaining = seconds;
      const interval = setInterval(() => {
        remaining--;
        const valueEl = overlay.querySelector('.mcp-countdown-value');
        const textEl = overlay.querySelector('.mcp-countdown-text');

        if (valueEl) valueEl.textContent = String(remaining);
        if (textEl) textEl.textContent = `Auto-approving in ${remaining}s...`;

        if (remaining === 0) {
          clearInterval(interval);
          overlay.remove();
          this.activeCountdown = null;
          resolve(false); // Not cancelled
        }
      }, 1000);

      // Cancel button handler
      const cancelBtn = overlay.querySelector('.mcp-countdown-cancel');
      cancelBtn?.addEventListener('click', () => {
        clearInterval(interval);
        overlay.remove();
        this.activeCountdown = null;
        logger.info('Countdown cancelled by user');
        resolve(true); // Cancelled
      });

      // Store reference for external cancellation (Esc key)
      this.activeCountdown = {
        cancel: () => {
          clearInterval(interval);
          overlay.remove();
          this.activeCountdown = null;
          resolve(true);
        },
      };
    });
  }

  /**
   * Cancel active countdown (called on Esc key)
   */
  cancelActiveCountdown(): void {
    if (this.activeCountdown) {
      this.activeCountdown.cancel();
    }
  }

  /**
   * Show toast notification
   */
  showNotification(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `mcp-toast mcp-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('mcp-toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Open config panel
   */
  openConfigPanel(configManager: ConfigManager): void {
    const panel = document.createElement('div');
    panel.className = 'mcp-config-panel';

    const config = configManager.getConfig();

    panel.innerHTML = `
      <div class="mcp-config-header">
        <h2>🤖 MCP Auto-Approve Settings</h2>
        <button class="mcp-config-close">✕</button>
      </div>
      <div class="mcp-config-body">
        <div class="mcp-config-section">
          <label>
            <input type="checkbox" id="mcp-enabled" ${config.enabled ? 'checked' : ''}>
            Enable Auto-Approve
          </label>
        </div>
        <div class="mcp-config-section">
          <label>
            Default Delay (seconds):
            <input type="number" id="mcp-default-delay" value="${config.defaultDelay}" min="0" max="60">
          </label>
        </div>
        <div class="mcp-config-section">
          <h3>Rules</h3>
          <div id="mcp-rules-container">
            ${this.renderRules(config.providers[0]?.rules || [])}
          </div>
          <button id="mcp-add-rule">+ Add Rule</button>
        </div>
      </div>
      <div class="mcp-config-footer">
        <button id="mcp-save">Save</button>
        <button id="mcp-export">Export Config</button>
        <button id="mcp-import">Import Config</button>
      </div>
    `;

    this.injectStyles();
    document.body.appendChild(panel);

    // Event listeners
    panel.querySelector('.mcp-config-close')?.addEventListener('click', () => panel.remove());

    panel.querySelector('#mcp-save')?.addEventListener('click', () => {
      this.saveConfig(configManager, panel);
    });

    panel.querySelector('#mcp-export')?.addEventListener('click', () => {
      this.exportConfig(configManager);
    });

    panel.querySelector('#mcp-import')?.addEventListener('click', () => {
      this.importConfig(configManager);
    });
  }

  /**
   * Render rules list
   */
  private renderRules(rules: any[]): string {
    return rules
      .map(
        (rule, index) => `
        <div class="mcp-rule" data-index="${index}">
          <div><strong>Pattern:</strong> ${rule.repoPattern}</div>
          <div><strong>Operations:</strong> ${rule.operations.join(', ')}</div>
          <div><strong>Delay:</strong> ${rule.delay}s</div>
          <div><strong>Auto-Approve:</strong> ${rule.autoApprove ? '✅' : '❌'}</div>
        </div>
      `
      )
      .join('');
  }

  /**
   * Save config from panel
   */
  private saveConfig(configManager: ConfigManager, panel: HTMLElement): void {
    const config = configManager.getConfig();

    const enabled = (panel.querySelector('#mcp-enabled') as HTMLInputElement).checked;
    const defaultDelay = parseInt(
      (panel.querySelector('#mcp-default-delay') as HTMLInputElement).value,
      10
    );

    config.enabled = enabled;
    config.defaultDelay = defaultDelay;

    configManager.updateConfig(config);
    this.showNotification('Configuration saved', 'success');
    panel.remove();
  }

  /**
   * Export config as JSON
   */
  private exportConfig(configManager: ConfigManager): void {
    const json = configManager.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcp-auto-approve-config.json';
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('Configuration exported', 'success');
  }

  /**
   * Import config from JSON file
   */
  private importConfig(configManager: ConfigManager): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        await configManager.importConfig(text);
        this.showNotification('Configuration imported', 'success');
      } catch (error) {
        this.showNotification('Failed to import configuration', 'error');
      }
    });

    input.click();
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    if (document.getElementById('mcp-auto-approve-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'mcp-auto-approve-styles';
    styles.textContent = `
      /* Countdown Overlay */
      .mcp-countdown-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .mcp-countdown-container {
        background: #1a1a1a;
        border-radius: 12px;
        padding: 20px;
        min-width: 280px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
        border: 1px solid #333;
      }

      .mcp-countdown-content {
        text-align: center;
      }

      .mcp-countdown-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .mcp-countdown-value {
        font-size: 64px;
        font-weight: bold;
        color: #00ff88;
        line-height: 1;
        margin-bottom: 8px;
      }

      .mcp-countdown-text {
        color: #999;
        font-size: 14px;
        margin-bottom: 16px;
      }

      .mcp-countdown-cancel {
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .mcp-countdown-cancel:hover {
        background: #ff6666;
      }

      .mcp-countdown-progress {
        margin-top: 16px;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
      }

      .mcp-countdown-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #00ff88, #00cc66);
        animation: countdown-progress linear forwards;
      }

      @keyframes countdown-progress {
        from { width: 100%; }
        to { width: 0%; }
      }

      /* Toast Notifications */
      .mcp-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 999998;
        transition: opacity 0.3s;
      }

      .mcp-toast-success {
        background: #00cc66;
        color: white;
      }

      .mcp-toast-warning {
        background: #ff9900;
        color: white;
      }

      .mcp-toast-error {
        background: #ff4444;
        color: white;
      }

      .mcp-toast-fade-out {
        opacity: 0;
      }

      /* Config Panel */
      .mcp-config-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        border-radius: 12px;
        width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        border: 1px solid #333;
        z-index: 999997;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .mcp-config-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #333;
      }

      .mcp-config-header h2 {
        margin: 0;
        font-size: 20px;
        color: #fff;
      }

      .mcp-config-close {
        background: none;
        border: none;
        color: #999;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .mcp-config-close:hover {
        background: #333;
        color: #fff;
      }

      .mcp-config-body {
        padding: 24px;
        max-height: calc(80vh - 140px);
        overflow-y: auto;
        color: #ccc;
      }

      .mcp-config-section {
        margin-bottom: 24px;
      }

      .mcp-config-section h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #fff;
      }

      .mcp-config-section label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .mcp-config-section input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .mcp-config-section input[type="number"] {
        background: #2a2a2a;
        border: 1px solid #444;
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        width: 80px;
        margin-left: 8px;
      }

      .mcp-rule {
        background: #2a2a2a;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.6;
      }

      .mcp-config-footer {
        display: flex;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #333;
      }

      .mcp-config-footer button {
        flex: 1;
        padding: 10px 16px;
        border-radius: 6px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .mcp-config-footer button:hover {
        opacity: 0.8;
      }

      #mcp-save {
        background: #00cc66;
        color: white;
      }

      #mcp-export, #mcp-import {
        background: #444;
        color: #ccc;
      }

      #mcp-add-rule {
        background: #333;
        color: #ccc;
        border: 1px dashed #555;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
        margin-top: 8px;
        transition: background 0.2s;
      }

      #mcp-add-rule:hover {
        background: #444;
      }
    `;

    document.head.appendChild(styles);
  }
}
