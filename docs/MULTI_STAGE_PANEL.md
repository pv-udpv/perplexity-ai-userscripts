# Multi-Stage Side Panel UI

HARPA-style multi-stage side panel implementation for Perplexity AI userscript framework.

## Overview

The Multi-Stage Panel system provides a flexible, responsive side panel with 4 size states, smooth transitions, keyboard shortcuts, and persistent state management. Perfect for feedback panels, settings, and interactive tools.

## Features

- **4 Panel Sizes**: `collapsed` (52px) → `quarter` (25vw) → `half` (50vw) → `full` (100vw)
- **Smooth Transitions**: CSS-based 300ms cubic-bezier animations
- **Persistent State**: Automatically saves/loads state from localStorage
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + J`: Toggle panel open/close
  - `[`: Shrink panel (previous size)
  - `]`: Expand panel (next size)
  - `Escape`: Close panel
- **Responsive Design**:
  - Desktop: Fixed right, vertical layout
  - Mobile: Bottom sheet, full-width
- **Backdrop Overlay**: Semi-transparent backdrop on mobile for full/half modes
- **Tab System**: Built-in tab navigation (Report, Discuss, Settings)
- **Accessibility**: ARIA labels, role attributes, keyboard navigation
- **Mobile Optimized**: Touch-friendly, bottom sheet behavior

## Quick Start

### Basic Usage

```typescript
import { createMultiStagePanel } from '@core/ui/multi-stage-panel';

// Create a panel
const panel = createMultiStagePanel({
  id: 'my-panel',
  title: 'My Panel',
  initialSize: 'quarter',
  enableBackdrop: true,
  enableKeyboardShortcuts: true,
  tabs: [
    { id: 'report', label: 'Report', icon: '📝' },
    { id: 'discuss', label: 'Discuss', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ],
});

// Show the panel
panel.show();

// Set content for a tab
panel.setTabContent('report', '<div>Your content here</div>');
```

### Using in a Plugin

```typescript
import type { Plugin, CoreAPI } from '@core/types';

const MyPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  
  async onEnable() {
    const core = (window as any).__PPLX_CORE__;
    
    // Create multi-stage panel
    const panel = core.ui.createMultiStagePanel({
      id: 'my-panel',
      title: 'My Panel',
      initialSize: 'quarter',
    });
    
    // Add content
    const content = document.createElement('div');
    content.innerHTML = '<h1>Hello World!</h1>';
    panel.setTabContent('report', content);
    
    // Show panel
    panel.show();
  },
};

export default MyPlugin;
```

## API Reference

### Configuration

```typescript
interface MultiStagePanelConfig {
  id?: string;                    // Unique panel ID (auto-generated if not provided)
  title: string;                  // Panel title shown in header
  initialSize?: PanelSize;        // Initial size state (default: 'quarter')
  enableBackdrop?: boolean;       // Show backdrop on mobile (default: true)
  enableKeyboardShortcuts?: boolean; // Enable keyboard shortcuts (default: true)
  tabs?: TabConfig[];             // Tab configuration
  position?: 'right' | 'bottom';  // Panel position (auto-detected based on screen size)
}

type PanelSize = 'collapsed' | 'quarter' | 'half' | 'full';

interface TabConfig {
  id: string;      // Tab ID
  label: string;   // Tab label
  icon?: string;   // Optional emoji or icon
}
```

### Methods

#### Panel Control

```typescript
// Show the panel
panel.show(): void

// Hide the panel
panel.hide(): void

// Toggle panel visibility
panel.toggle(): void

// Check if panel is visible
panel.isVisible(): boolean

// Destroy panel and clean up
panel.destroy(): void
```

#### Size Management

```typescript
// Set specific size
panel.setSize(size: PanelSize): void

// Expand to next larger size
panel.expand(): void

// Shrink to next smaller size
panel.shrink(): void
```

#### Tab Management

```typescript
// Switch to a tab
panel.switchTab(tabId: string): void

// Get tab content element
panel.getTabContent(tabId: string): HTMLElement | undefined

// Set content for a tab
panel.setTabContent(tabId: string, content: HTMLElement | string): void
```

#### State Management

```typescript
// Get current panel state
panel.getState(): MultiStagePanelState

interface MultiStagePanelState {
  size: PanelSize;
  isOpen: boolean;
  lastMode?: 'chat' | 'command' | 'inspector';
  activeTab?: string;
}
```

## Panel Sizes

### Size Specifications

| Size | Desktop Width | Mobile Behavior | Icon Only |
|------|--------------|-----------------|-----------|
| `collapsed` | 52px | Bottom sheet (52px height) | ✅ |
| `quarter` | 25vw (min 280px, max 420px) | Bottom sheet (70vh) | ❌ |
| `half` | 50vw (min 360px, max 640px) | Bottom sheet (70vh) | ❌ |
| `full` | 100vw | Full screen (100vh) | ❌ |

### Size Transitions

```
collapsed ←→ quarter ←→ half ←→ full
   52px       25vw      50vw    100vw
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + J` | Toggle panel open/close |
| `[` | Shrink panel (move to previous size) |
| `]` | Expand panel (move to next size) |
| `Escape` | Close panel |

**Note**: Shrink/expand shortcuts only work when panel is focused (clicked inside).

## Responsive Behavior

### Desktop (≥768px)

- **Position**: Fixed right side
- **Layout**: Vertical, full height
- **Transition**: Slide from right
- **Backdrop**: Not shown

### Mobile (<768px)

- **Position**: Fixed bottom
- **Layout**: Bottom sheet, full width
- **Transition**: Slide from bottom
- **Backdrop**: Shown for `half` and `full` sizes
- **Height**: 
  - `collapsed`: 52px
  - `quarter`: 70vh
  - `half`: 70vh
  - `full`: 100vh

## State Persistence

Panel state is automatically saved to localStorage and restored on reload:

```typescript
// Stored state includes:
{
  size: 'quarter',        // Current panel size
  isOpen: false,          // Panel visibility
  activeTab: 'report'     // Active tab
}
```

Storage key format: `pplx-multi-stage-panel-state-{panelId}`

## Styling & Theming

### CSS Variables

The panel supports CSS custom properties for theming:

```css
:root {
  --pplx-panel-bg: #ffffff;           /* Panel background */
  --pplx-panel-border: #e0e0e0;       /* Border color */
  --pplx-panel-header-bg: #f5f5f5;    /* Header background */
  --pplx-panel-text: #333333;         /* Text color */
  --pplx-panel-accent: #2196f3;       /* Accent color (active tab) */
}
```

### Custom Styling

```typescript
const panel = createMultiStagePanel({
  id: 'my-panel',
  title: 'My Panel',
});

// Access panel element for custom styling
const panelElement = document.getElementById('my-panel');
panelElement.style.setProperty('--pplx-panel-bg', '#1a1a1a');
```

## Tab System

### Tab Configuration

```typescript
const panel = createMultiStagePanel({
  tabs: [
    { id: 'report', label: 'Report', icon: '📝' },
    { id: 'discuss', label: 'Discuss', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ],
});
```

### Tab Content

```typescript
// Set HTML content
panel.setTabContent('report', '<div>HTML content</div>');

// Set DOM element
const content = document.createElement('div');
content.innerHTML = '<h1>My Content</h1>';
panel.setTabContent('report', content);

// Switch to a tab programmatically
panel.switchTab('discuss');
```

### Tab Events

Tabs automatically:
- Update ARIA attributes
- Show/hide content
- Save active tab to localStorage
- Apply visual styling for active state

## Examples

### Example 1: Feedback Panel

See `src/plugins/feedback-panel/index.ts` for a complete example with:
- 3 tabs (Report, Discuss, Settings)
- Form handling
- Success/error messages
- Integration with GitHub (placeholder)

### Example 2: Simple Panel

```typescript
const panel = createMultiStagePanel({
  id: 'simple-panel',
  title: 'Simple Panel',
  initialSize: 'quarter',
  tabs: [
    { id: 'content', label: 'Content', icon: '📄' },
  ],
});

panel.setTabContent('content', `
  <div style="padding: 20px;">
    <h2>Hello!</h2>
    <p>This is a simple panel.</p>
  </div>
`);

panel.show();
```

### Example 3: Settings Panel

```typescript
const panel = createMultiStagePanel({
  id: 'settings-panel',
  title: 'Settings',
  initialSize: 'half',
  tabs: [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ],
});

// General settings
panel.setTabContent('general', `
  <div style="padding: 20px;">
    <label>
      <input type="checkbox" id="enable-notifications" />
      Enable notifications
    </label>
  </div>
`);

// Advanced settings
panel.setTabContent('advanced', `
  <div style="padding: 20px;">
    <label>
      <input type="checkbox" id="debug-mode" />
      Debug mode
    </label>
  </div>
`);

panel.show();
```

## Accessibility

### ARIA Attributes

The panel automatically sets appropriate ARIA attributes:

```html
<div role="complementary" aria-label="Panel Title">
  <div class="pplx-multi-panel-tabs" role="tablist">
    <button role="tab" aria-selected="true">Tab 1</button>
    <button role="tab" aria-selected="false">Tab 2</button>
  </div>
  <div class="pplx-multi-panel-tab-content" role="tabpanel">
    Content
  </div>
</div>
```

### Keyboard Navigation

- Tab through controls: `Tab`/`Shift+Tab`
- Activate buttons: `Enter`/`Space`
- Close panel: `Escape`
- Navigate sizes: `[`/`]`

### Screen Reader Support

- Header controls have `aria-label` attributes
- Tab buttons announce selection state
- Panel has descriptive `role="complementary"`

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (bottom sheet)

## Performance

- **Animation**: GPU-accelerated CSS transforms
- **State**: Debounced localStorage writes
- **Memory**: Cleanup on destroy
- **Responsive**: Single resize listener

## Integration with Feedback Panel (Issue #25, #28)

The Multi-Stage Panel is designed to integrate with:

- **Issue #25**: Auto-scaffold userscripts (provides UI container)
- **Issue #28**: Feedback Panel with GitHub Integration
  - Report tab: Create GitHub issues
  - Discuss tab: View/reply to GitHub comments
  - Settings tab: StackBlitz integration, preferences

## Future Enhancements

Planned features:
- [ ] Custom animations (Framer Motion optional)
- [ ] Panel resize handle (drag to resize)
- [ ] Multiple panels (panel manager)
- [ ] Panel presets (save/load size configs)
- [ ] Focus trap mode (modal-style)
- [ ] Custom tab icons (not just emoji)
- [ ] Panel docking positions (top, left, right, bottom)

## Troubleshooting

### Panel not showing

```typescript
// Check if panel is in DOM
const panelElement = document.getElementById('my-panel');
console.log('Panel exists:', !!panelElement);

// Check visibility state
console.log('Panel visible:', panel.isVisible());

// Force show
panel.show();
```

### Keyboard shortcuts not working

```typescript
// Ensure shortcuts are enabled
const panel = createMultiStagePanel({
  enableKeyboardShortcuts: true, // Must be true
});

// Check if panel is focused for [ and ]
// Click inside panel first
```

### State not persisting

```typescript
// Check localStorage availability
console.log('localStorage available:', !!window.localStorage);

// Manually save state
panel.show();
panel.setSize('half');

// Check stored value
const key = 'pplx-multi-stage-panel-state-my-panel';
console.log(localStorage.getItem(key));
```

### Mobile backdrop not showing

```typescript
// Ensure backdrop is enabled and size is half/full
const panel = createMultiStagePanel({
  enableBackdrop: true, // Must be true
});

panel.setSize('half'); // or 'full'
```

## License

MIT License - See repository LICENSE file

## Contributing

Contributions welcome! See CONTRIBUTING.md for guidelines.

## Related

- **Issue #25**: Feedback Panel with GitHub Integration (parent)
- **Issue #28**: Auto-scaffold userscripts
- **Issue #30**: HARPA-style multi-stage side panel (this feature)
- Architecture reference: `perplexity-dump_2025-12-27T13-39-52.json`
