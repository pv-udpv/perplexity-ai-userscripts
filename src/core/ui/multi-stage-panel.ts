/**
 * Multi-Stage Panel System
 * 
 * Implements HARPA-style multi-stage side panel with 4 states:
 * - collapsed (52px, icons only)
 * - quarter (25vw, min 280px, max 420px)
 * - half (50vw, min 360px, max 640px)  
 * - full (100vw on mobile, 100vw on desktop)
 * 
 * Features:
 * - Smooth transitions
 * - Persistent state (localStorage)
 * - Keyboard shortcuts (Cmd/Ctrl+J, [, ])
 * - Mobile bottom sheet behavior
 * - Backdrop overlay
 * - Tab system (Report, Discuss, Settings)
 * - ARIA accessibility
 */

import type { PanelConfig } from '../types';
import { generateId } from '../browser/dom-utils';

export type PanelSize = 'collapsed' | 'quarter' | 'half' | 'full';
export type PanelMode = 'chat' | 'command' | 'inspector';
export type PanelTab = 'report' | 'discuss' | 'settings';

export interface MultiStagePanelState {
  size: PanelSize;
  isOpen: boolean;
  lastMode?: PanelMode;
  activeTab?: PanelTab;
}

export interface MultiStagePanelConfig extends Omit<PanelConfig, 'width' | 'position'> {
  initialSize?: PanelSize;
  enableBackdrop?: boolean;
  enableKeyboardShortcuts?: boolean;
  tabs?: { id: PanelTab; label: string; icon?: string }[];
  position?: 'right' | 'bottom'; // right for desktop, bottom for mobile
}

const SIZE_TO_WIDTH: Record<PanelSize, string> = {
  collapsed: '52px',
  quarter: 'clamp(280px, 25vw, 420px)',
  half: 'clamp(360px, 50vw, 640px)',
  full: '100vw',
};

const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = 'pplx-multi-stage-panel-state';

/**
 * Multi-Stage Panel Class
 */
export class MultiStagePanel {
  id: string;
  private config: Required<MultiStagePanelConfig>;
  private element: HTMLElement;
  private backdropElement: HTMLElement | null = null;
  private state: MultiStagePanelState;
  private contentElement: HTMLElement;
  private headerElement: HTMLElement;
  private tabsElement: HTMLElement | null = null;
  private tabContentElements: Map<PanelTab, HTMLElement> = new Map();

  constructor(config: MultiStagePanelConfig) {
    this.id = config.id || generateId('multi-panel');
    
    // Load saved state or use defaults
    this.state = this.loadState() || {
      size: config.initialSize || 'quarter',
      isOpen: false,
      activeTab: config.tabs?.[0]?.id || 'report',
    };

    this.config = {
      id: this.id,
      title: config.title,
      position: config.position || this.getDefaultPosition(),
      content: config.content,
      collapsible: config.collapsible ?? true,
      draggable: config.draggable ?? false,
      resizable: config.resizable ?? true,
      width: undefined, // Not used in multi-stage
      initialSize: config.initialSize || 'quarter',
      enableBackdrop: config.enableBackdrop ?? true,
      enableKeyboardShortcuts: config.enableKeyboardShortcuts ?? true,
      tabs: config.tabs || [
        { id: 'report', label: 'Report', icon: '📝' },
        { id: 'discuss', label: 'Discuss', icon: '💬' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
      ],
    };

    this.element = this.createPanelElement();
    this.headerElement = this.element.querySelector('.pplx-multi-panel-header')!;
    this.contentElement = this.element.querySelector('.pplx-multi-panel-content')!;
    this.tabsElement = this.element.querySelector('.pplx-multi-panel-tabs');

    this.setupTabs();
    this.attachEventListeners();
    this.setupKeyboardShortcuts();
    this.setupResponsive();
    
    // Apply initial state
    this.applyState();
  }

  /**
   * Create panel element structure
   */
  private createPanelElement(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = `pplx-multi-panel pplx-multi-panel-${this.config.position}`;
    panel.id = this.id;
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', this.config.title);
    
    const isMobile = this.isMobile();
    const position = isMobile ? 'bottom' : 'right';

    panel.style.cssText = `
      position: fixed;
      ${position === 'bottom' ? 'bottom: 0; left: 0; right: 0;' : 'top: 0; right: 0;'}
      ${position === 'bottom' ? 'height: 70vh;' : 'height: 100vh;'}
      width: ${SIZE_TO_WIDTH[this.state.size]};
      background: var(--pplx-panel-bg, #ffffff);
      border-${position === 'bottom' ? 'top' : 'left'}: 1px solid var(--pplx-panel-border, #e0e0e0);
      box-shadow: ${position === 'bottom' ? '0 -4px 20px rgba(0, 0, 0, 0.15)' : '-2px 0 20px rgba(0, 0, 0, 0.15)'};
      z-index: 10000;
      display: none;
      flex-direction: column;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                  width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translate${position === 'bottom' ? 'Y' : 'X'}(100%);
      overflow: hidden;
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'pplx-multi-panel-header';
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid var(--pplx-panel-border, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pplx-panel-header-bg, #f5f5f5);
      flex-shrink: 0;
    `;

    const titleGroup = document.createElement('div');
    titleGroup.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    const title = document.createElement('h3');
    title.className = 'pplx-multi-panel-title';
    title.textContent = this.config.title;
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--pplx-panel-text, #333333);
    `;

    titleGroup.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'pplx-multi-panel-controls';
    controls.style.cssText = 'display: flex; gap: 8px; align-items: center;';

    // Shrink button
    const shrinkBtn = this.createControlButton('←', 'Shrink (])', 'shrink');
    shrinkBtn.addEventListener('click', () => this.shrink());
    controls.appendChild(shrinkBtn);

    // Expand button
    const expandBtn = this.createControlButton('→', 'Expand ([)', 'expand');
    expandBtn.addEventListener('click', () => this.expand());
    controls.appendChild(expandBtn);

    // Close button
    const closeBtn = this.createControlButton('×', 'Close (Ctrl+J)', 'close');
    closeBtn.addEventListener('click', () => this.hide());
    controls.appendChild(closeBtn);

    header.appendChild(titleGroup);
    header.appendChild(controls);

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'pplx-multi-panel-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.style.cssText = `
      display: flex;
      border-bottom: 1px solid var(--pplx-panel-border, #e0e0e0);
      background: var(--pplx-panel-bg, #ffffff);
      flex-shrink: 0;
    `;

    this.config.tabs.forEach((tab) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = 'pplx-multi-panel-tab';
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', tab.id === this.state.activeTab ? 'true' : 'false');
      tabBtn.setAttribute('data-tab', tab.id);
      tabBtn.innerHTML = `${tab.icon || ''} ${tab.label}`;
      tabBtn.style.cssText = `
        flex: 1;
        padding: 12px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        color: var(--pplx-panel-text, #666666);
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
      `;
      
      if (tab.id === this.state.activeTab) {
        tabBtn.style.borderBottomColor = 'var(--pplx-panel-accent, #2196f3)';
        tabBtn.style.color = 'var(--pplx-panel-accent, #2196f3)';
        tabBtn.style.fontWeight = '600';
      }

      tabBtn.addEventListener('click', () => this.switchTab(tab.id));
      tabs.appendChild(tabBtn);
    });

    // Content container
    const content = document.createElement('div');
    content.className = 'pplx-multi-panel-content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `;

    panel.appendChild(header);
    panel.appendChild(tabs);
    panel.appendChild(content);

    return panel;
  }

  /**
   * Create control button
   */
  private createControlButton(icon: string, title: string, type: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `pplx-multi-panel-btn pplx-multi-panel-btn-${type}`;
    btn.innerHTML = icon;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.style.cssText = `
      background: none;
      border: none;
      font-size: ${type === 'close' ? '24px' : '18px'};
      cursor: pointer;
      color: var(--pplx-panel-text, #666666);
      padding: 4px 8px;
      width: ${type === 'close' ? '32px' : '28px'};
      height: ${type === 'close' ? '32px' : '28px'};
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(0, 0, 0, 0.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'none';
    });

    return btn;
  }

  /**
   * Setup tabs with content areas
   */
  private setupTabs(): void {
    this.config.tabs.forEach((tab) => {
      const tabContent = document.createElement('div');
      tabContent.className = 'pplx-multi-panel-tab-content';
      tabContent.setAttribute('role', 'tabpanel');
      tabContent.setAttribute('data-tab', tab.id);
      tabContent.style.cssText = `
        display: ${tab.id === this.state.activeTab ? 'block' : 'none'};
        padding: 16px;
        height: 100%;
        overflow-y: auto;
      `;

      // Add placeholder content
      tabContent.innerHTML = `
        <div style="color: var(--pplx-panel-text, #666); padding: 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${tab.icon || '📄'}</div>
          <h3 style="margin: 0 0 8px; font-size: 18px;">${tab.label}</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.7;">
            Content for ${tab.label} tab will be loaded here
          </p>
        </div>
      `;

      this.tabContentElements.set(tab.id, tabContent);
      this.contentElement.appendChild(tabContent);
    });
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    if (!this.config.enableKeyboardShortcuts) return;

    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl+J - Toggle panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        this.toggle();
      }

      // [ - Shrink
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only if panel is open and focused
        if (this.state.isOpen && document.activeElement?.closest(`#${this.id}`)) {
          e.preventDefault();
          this.shrink();
        }
      }

      // ] - Expand
      if (e.key === ']' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only if panel is open and focused
        if (this.state.isOpen && document.activeElement?.closest(`#${this.id}`)) {
          e.preventDefault();
          this.expand();
        }
      }

      // Escape - Close
      if (e.key === 'Escape' && this.state.isOpen) {
        this.hide();
      }
    });
  }

  /**
   * Setup responsive behavior
   */
  private setupResponsive(): void {
    this.handleResize();
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    const isMobile = this.isMobile();
    const position = isMobile ? 'bottom' : 'right';
    
    // Update position
    this.element.className = `pplx-multi-panel pplx-multi-panel-${position}`;
    
    // Update styles for mobile/desktop
    if (isMobile) {
      this.element.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: ${this.state.size === 'full' ? '100vh' : '70vh'};
        width: 100%;
        background: var(--pplx-panel-bg, #ffffff);
        border-top: 1px solid var(--pplx-panel-border, #e0e0e0);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: ${this.state.isOpen ? 'flex' : 'none'};
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(${this.state.isOpen ? '0' : '100%'});
        overflow: hidden;
      `;
    } else {
      this.element.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: ${SIZE_TO_WIDTH[this.state.size]};
        background: var(--pplx-panel-bg, #ffffff);
        border-left: 1px solid var(--pplx-panel-border, #e0e0e0);
        box-shadow: -2px 0 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: ${this.state.isOpen ? 'flex' : 'none'};
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(${this.state.isOpen ? '0' : '100%'});
        overflow: hidden;
      `;
    }
  }

  /**
   * Check if mobile
   */
  private isMobile(): boolean {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  /**
   * Get default position based on screen size
   */
  private getDefaultPosition(): 'right' | 'bottom' {
    return this.isMobile() ? 'bottom' : 'right';
  }

  /**
   * Show panel
   */
  show(): void {
    if (this.state.isOpen) return;

    // Inject into DOM if not already
    if (!document.body.contains(this.element)) {
      document.body.appendChild(this.element);
    }

    // Show backdrop on mobile for full/half modes
    if (this.config.enableBackdrop && this.isMobile() && 
        (this.state.size === 'full' || this.state.size === 'half')) {
      this.showBackdrop();
    }

    this.element.style.display = 'flex';
    
    // Trigger reflow for animation
    void this.element.offsetHeight;
    
    const isMobile = this.isMobile();
    this.element.style.transform = isMobile ? 'translateY(0)' : 'translateX(0)';
    this.state.isOpen = true;
    
    this.saveState();
  }

  /**
   * Hide panel
   */
  hide(): void {
    if (!this.state.isOpen) return;

    const isMobile = this.isMobile();
    this.element.style.transform = isMobile ? 'translateY(100%)' : 'translateX(100%)';
    
    this.hideBackdrop();
    
    setTimeout(() => {
      this.element.style.display = 'none';
      this.state.isOpen = false;
      this.saveState();
    }, 300);
  }

  /**
   * Toggle panel
   */
  toggle(): void {
    if (this.state.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Expand panel to next size
   */
  expand(): void {
    const sizes: PanelSize[] = ['collapsed', 'quarter', 'half', 'full'];
    const currentIndex = sizes.indexOf(this.state.size);
    
    if (currentIndex < sizes.length - 1) {
      this.setSize(sizes[currentIndex + 1]);
    }
  }

  /**
   * Shrink panel to previous size
   */
  shrink(): void {
    const sizes: PanelSize[] = ['collapsed', 'quarter', 'half', 'full'];
    const currentIndex = sizes.indexOf(this.state.size);
    
    if (currentIndex > 0) {
      this.setSize(sizes[currentIndex - 1]);
    }
  }

  /**
   * Set panel size
   */
  setSize(size: PanelSize): void {
    this.state.size = size;
    
    if (!this.isMobile()) {
      this.element.style.width = SIZE_TO_WIDTH[size];
    }
    
    // Update backdrop visibility
    if (this.config.enableBackdrop && this.isMobile() && this.state.isOpen) {
      if (size === 'full' || size === 'half') {
        this.showBackdrop();
      } else {
        this.hideBackdrop();
      }
    }
    
    this.saveState();
  }

  /**
   * Switch tab
   */
  switchTab(tabId: PanelTab): void {
    this.state.activeTab = tabId;

    // Update tab buttons
    const tabButtons = this.tabsElement?.querySelectorAll('.pplx-multi-panel-tab');
    tabButtons?.forEach((btn) => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      
      if (isActive) {
        (btn as HTMLElement).style.borderBottomColor = 'var(--pplx-panel-accent, #2196f3)';
        (btn as HTMLElement).style.color = 'var(--pplx-panel-accent, #2196f3)';
        (btn as HTMLElement).style.fontWeight = '600';
      } else {
        (btn as HTMLElement).style.borderBottomColor = 'transparent';
        (btn as HTMLElement).style.color = 'var(--pplx-panel-text, #666666)';
        (btn as HTMLElement).style.fontWeight = 'normal';
      }
    });

    // Update tab content visibility
    this.tabContentElements.forEach((content, id) => {
      content.style.display = id === tabId ? 'block' : 'none';
    });

    this.saveState();
  }

  /**
   * Get tab content element
   */
  getTabContent(tabId: PanelTab): HTMLElement | undefined {
    return this.tabContentElements.get(tabId);
  }

  /**
   * Set content for a specific tab
   */
  setTabContent(tabId: PanelTab, content: HTMLElement | string): void {
    const tabContent = this.tabContentElements.get(tabId);
    if (!tabContent) return;

    if (typeof content === 'string') {
      tabContent.innerHTML = content;
    } else {
      tabContent.innerHTML = '';
      tabContent.appendChild(content);
    }
  }

  /**
   * Show backdrop
   */
  private showBackdrop(): void {
    if (this.backdropElement) return;

    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'pplx-multi-panel-backdrop';
    this.backdropElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    this.backdropElement.addEventListener('click', () => this.hide());
    document.body.appendChild(this.backdropElement);

    // Trigger animation
    requestAnimationFrame(() => {
      if (this.backdropElement) {
        this.backdropElement.style.opacity = '1';
      }
    });
  }

  /**
   * Hide backdrop
   */
  private hideBackdrop(): void {
    if (!this.backdropElement) return;

    this.backdropElement.style.opacity = '0';
    
    setTimeout(() => {
      if (this.backdropElement) {
        this.backdropElement.remove();
        this.backdropElement = null;
      }
    }, 300);
  }

  /**
   * Apply current state to UI
   */
  private applyState(): void {
    if (this.state.isOpen) {
      this.show();
    }
    
    if (this.state.activeTab) {
      this.switchTab(this.state.activeTab);
    }
    
    this.setSize(this.state.size);
  }

  /**
   * Load state from localStorage
   */
  private loadState(): MultiStagePanelState | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${this.id}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to load panel state:', e);
      return null;
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      localStorage.setItem(`${STORAGE_KEY}-${this.id}`, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save panel state:', e);
    }
  }

  /**
   * Get current state
   */
  getState(): MultiStagePanelState {
    return { ...this.state };
  }

  /**
   * Check if panel is visible
   */
  isVisible(): boolean {
    return this.state.isOpen;
  }

  /**
   * Destroy panel
   */
  destroy(): void {
    this.hide();
    this.hideBackdrop();
    
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }
}

/**
 * Create a multi-stage panel
 */
export function createMultiStagePanel(config: MultiStagePanelConfig): MultiStagePanel {
  return new MultiStagePanel(config);
}
