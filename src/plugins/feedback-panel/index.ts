/**
 * Feedback Panel Plugin
 * 
 * Demonstrates multi-stage panel with GitHub Integration support
 * Integrates with Issue #25 (Feedback Panel) and Issue #28 (GitHub Integration)
 */

import type { Plugin, CoreAPI } from '@core/types';
import type { MultiStagePanel } from '@core/ui/multi-stage-panel';

const FeedbackPanelPlugin: Plugin = {
  id: 'feedback-panel',
  name: 'Feedback Panel',
  version: '1.0.0',
  description: 'Multi-stage side panel for reporting issues and providing feedback',
  author: 'pv-udpv',
  
  requiredCoreVersion: '1.0.0',
  
  async onLoad(core: CoreAPI) {
    console.log('[Feedback Panel] Loading...');
  },
  
  async onEnable() {
    console.log('[Feedback Panel] Enabling...');
    
    const core = (window as any).__PPLX_CORE__;
    if (!core) {
      console.error('[Feedback Panel] Core API not available');
      return;
    }
    
    // Create multi-stage panel
    const panel = core.ui.createMultiStagePanel({
      id: 'feedback-panel',
      title: 'Feedback Panel',
      initialSize: 'quarter',
      enableBackdrop: true,
      enableKeyboardShortcuts: true,
      tabs: [
        { id: 'report', label: 'Report', icon: '📝' },
        { id: 'discuss', label: 'Discuss', icon: '💬' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
      ],
    }) as MultiStagePanel;
    
    // Setup tab content
    this.setupReportTab(panel);
    this.setupDiscussTab(panel);
    this.setupSettingsTab(panel);
    
    // Add trigger button
    this.addTriggerButton(panel);
    
    // Store panel reference
    (this as any).panel = panel;
    
    console.log('[Feedback Panel] Enabled successfully');
  },
  
  async onDisable() {
    console.log('[Feedback Panel] Disabling...');
    
    const panel = (this as any).panel;
    if (panel) {
      panel.destroy();
    }
    
    // Remove trigger button
    const triggerBtn = document.getElementById('feedback-panel-trigger');
    if (triggerBtn) {
      triggerBtn.remove();
    }
  },
  
  setupReportTab(panel: MultiStagePanel) {
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px;';
    
    content.innerHTML = `
      <style>
        .feedback-form-group {
          margin-bottom: 16px;
        }
        .feedback-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--pplx-panel-text, #333);
        }
        .feedback-input,
        .feedback-textarea,
        .feedback-select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--pplx-panel-border, #e0e0e0);
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          background: var(--pplx-panel-bg, #fff);
          color: var(--pplx-panel-text, #333);
        }
        .feedback-textarea {
          min-height: 120px;
          resize: vertical;
        }
        .feedback-button {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .feedback-button-primary {
          background: #2196f3;
          color: white;
        }
        .feedback-button-primary:hover {
          background: #1976d2;
        }
        .feedback-button-secondary {
          background: #f5f5f5;
          color: #333;
          margin-left: 8px;
        }
        .feedback-button-secondary:hover {
          background: #e0e0e0;
        }
      </style>
      
      <h3 style="margin: 0 0 20px; font-size: 18px; color: var(--pplx-panel-text, #333);">
        Report an Issue
      </h3>
      
      <div class="feedback-form-group">
        <label class="feedback-label" for="feedback-title">Title</label>
        <input 
          type="text" 
          id="feedback-title" 
          class="feedback-input"
          placeholder="Brief description of the issue"
        />
      </div>
      
      <div class="feedback-form-group">
        <label class="feedback-label" for="feedback-category">Category</label>
        <select id="feedback-category" class="feedback-select">
          <option value="bug">🐛 Bug</option>
          <option value="feature">✨ Feature Request</option>
          <option value="enhancement">🚀 Enhancement</option>
          <option value="question">❓ Question</option>
        </select>
      </div>
      
      <div class="feedback-form-group">
        <label class="feedback-label" for="feedback-description">Description</label>
        <textarea 
          id="feedback-description" 
          class="feedback-textarea"
          placeholder="Detailed description of the issue..."
        ></textarea>
      </div>
      
      <div class="feedback-form-group">
        <label class="feedback-label">
          <input type="checkbox" id="feedback-include-context" checked style="margin-right: 8px;" />
          Include browser and script version
        </label>
      </div>
      
      <div style="margin-top: 24px;">
        <button class="feedback-button feedback-button-primary" id="feedback-submit">
          📝 Submit Report
        </button>
        <button class="feedback-button feedback-button-secondary" id="feedback-cancel">
          Cancel
        </button>
      </div>
      
      <div id="feedback-status" style="margin-top: 16px; padding: 12px; border-radius: 4px; display: none;"></div>
    `;
    
    panel.setTabContent('report', content);
    
    // Add event listeners
    setTimeout(() => {
      const submitBtn = document.getElementById('feedback-submit');
      const cancelBtn = document.getElementById('feedback-cancel');
      
      submitBtn?.addEventListener('click', () => {
        const title = (document.getElementById('feedback-title') as HTMLInputElement)?.value;
        const category = (document.getElementById('feedback-category') as HTMLSelectElement)?.value;
        const description = (document.getElementById('feedback-description') as HTMLTextAreaElement)?.value;
        
        if (!title || !description) {
          alert('Please fill in all required fields');
          return;
        }
        
        // Show success message
        const statusDiv = document.getElementById('feedback-status');
        if (statusDiv) {
          statusDiv.style.display = 'block';
          statusDiv.style.background = '#e8f5e9';
          statusDiv.style.color = '#2e7d32';
          statusDiv.innerHTML = `
            <strong>✅ Report Submitted!</strong>
            <p style="margin: 8px 0 0;">Your feedback has been recorded. Thank you!</p>
          `;
        }
        
        // Clear form
        (document.getElementById('feedback-title') as HTMLInputElement).value = '';
        (document.getElementById('feedback-description') as HTMLTextAreaElement).value = '';
        
        console.log('[Feedback Panel] Report submitted:', { title, category, description });
      });
      
      cancelBtn?.addEventListener('click', () => {
        panel.hide();
      });
    }, 100);
  },
  
  setupDiscussTab(panel: MultiStagePanel) {
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px;';
    
    content.innerHTML = `
      <h3 style="margin: 0 0 20px; font-size: 18px; color: var(--pplx-panel-text, #333);">
        Discussions
      </h3>
      
      <div style="color: var(--pplx-panel-text, #666); text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
        <p style="margin: 0; font-size: 14px;">
          GitHub issue discussions will appear here
        </p>
        <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7;">
          Integration with Issue #25 and #28
        </p>
      </div>
    `;
    
    panel.setTabContent('discuss', content);
  },
  
  setupSettingsTab(panel: MultiStagePanel) {
    const content = document.createElement('div');
    content.style.cssText = 'padding: 20px;';
    
    content.innerHTML = `
      <h3 style="margin: 0 0 20px; font-size: 18px; color: var(--pplx-panel-text, #333);">
        Settings
      </h3>
      
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="auto-report-errors" style="margin-right: 12px;" />
          <span style="font-size: 14px; color: var(--pplx-panel-text, #333);">
            Auto-report errors
          </span>
        </label>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="share-analytics" style="margin-right: 12px;" />
          <span style="font-size: 14px; color: var(--pplx-panel-text, #333);">
            Share anonymous analytics
          </span>
        </label>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="enable-notifications" checked style="margin-right: 12px;" />
          <span style="font-size: 14px; color: var(--pplx-panel-text, #333);">
            Enable notifications
          </span>
        </label>
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="debug-mode" style="margin-right: 12px;" />
          <span style="font-size: 14px; color: var(--pplx-panel-text, #333);">
            Debug mode
          </span>
        </label>
      </div>
      
      <hr style="border: none; border-top: 1px solid var(--pplx-panel-border, #e0e0e0); margin: 32px 0;" />
      
      <div style="text-align: center;">
        <button 
          style="
            padding: 12px 24px;
            border: 2px solid #2196f3;
            border-radius: 4px;
            background: white;
            color: #2196f3;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          "
          onmouseover="this.style.background='#2196f3'; this.style.color='white';"
          onmouseout="this.style.background='white'; this.style.color='#2196f3';"
        >
          ✏️ Edit Code in StackBlitz
        </button>
        <p style="margin: 12px 0 0; font-size: 12px; color: var(--pplx-panel-text, #666); opacity: 0.7;">
          Opens live code editor (Integration with Issue #25)
        </p>
      </div>
    `;
    
    panel.setTabContent('settings', content);
  },
  
  addTriggerButton(panel: MultiStagePanel) {
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'feedback-panel-trigger';
    triggerBtn.innerHTML = '💬';
    triggerBtn.title = 'Open Feedback Panel (Ctrl+J)';
    triggerBtn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 24px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    triggerBtn.addEventListener('mouseenter', () => {
      triggerBtn.style.transform = 'scale(1.1) rotate(15deg)';
      triggerBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });
    
    triggerBtn.addEventListener('mouseleave', () => {
      triggerBtn.style.transform = 'scale(1) rotate(0deg)';
      triggerBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });
    
    triggerBtn.addEventListener('click', () => {
      panel.toggle();
    });
    
    document.body.appendChild(triggerBtn);
  },
};

export default FeedbackPanelPlugin;
