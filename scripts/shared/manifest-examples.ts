/**
 * Manifest Examples
 * 
 * Common patterns and use cases for userscript manifests.
 */

import { createManifest, type UserscriptManifest } from './manifest';

/**
 * Example 1: Minimal Manifest
 */
export const minimalManifest: UserscriptManifest = {
  name: 'My Script',
  version: '1.0.0',
  match: ['https://example.com/*'],
};

/**
 * Example 2: Full-Featured Manifest
 */
export const fullManifest = createManifest('Full Featured Script', '2.1.0')
  // Metadata
  .description('A comprehensive userscript example')
  .author('Your Name')
  .namespace('com.yoursite')
  .license('MIT')
  
  // Links
  .homepage('https://github.com/yourusername/yourscript')
  .updateURL('https://github.com/yourusername/yourscript/raw/main/script.user.js')
  
  // Icons
  .icon('https://example.com/icon32.png')
  
  // URL Matching
  .match('https://example.com/*')
  .match('https://test.com/*')
  .exclude('https://example.com/admin/*')
  
  // Execution
  .runAt('document-start')
  .injectInto('content')
  .noframes()
  
  // Permissions
  .grant('GM.setValue', 'GM.getValue', 'GM.deleteValue', 'GM.listValues')
  .grant('GM.xmlHttpRequest', 'GM.notification')
  .grant('GM.addStyle', 'GM.setClipboard')
  
  // Dependencies
  .require('https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js')
  .require('https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js')
  
  // Resources
  .resource('config', 'https://example.com/config.json')
  .resource('style', 'https://example.com/style.css')
  
  // Network
  .connect('example.com', 'api.example.com', 'cdn.example.com')
  
  .build();

/**
 * Example 3: Storage-Only Script
 */
export const storageScript = createManifest('Storage Script', '1.0.0')
  .description('Script that only uses storage')
  .match('https://example.com/*')
  .grant('GM.setValue', 'GM.getValue', 'GM.deleteValue')
  .runAt('document-idle')
  .build();

/**
 * Example 4: API Integration Script
 */
export const apiScript = createManifest('API Integration', '1.0.0')
  .description('Script that calls external APIs')
  .match('https://example.com/*')
  .grant('GM.xmlHttpRequest')
  .connect('api.example.com', 'graph.facebook.com', 'api.github.com')
  .runAt('document-end')
  .build();

/**
 * Example 5: UI Enhancement Script
 */
export const uiScript = createManifest('UI Enhancer', '1.0.0')
  .description('Enhances website UI with custom styles')
  .match('https://example.com/*')
  .grant('GM.addStyle', 'GM.addElement')
  .resource('mainCSS', 'https://cdn.example.com/main.css')
  .resource('darkTheme', 'https://cdn.example.com/dark.css')
  .runAt('document-start')
  .build();

/**
 * Example 6: Page Context Script
 */
export const pageContextScript = createManifest('Page Context', '1.0.0')
  .description('Runs in page context for direct DOM access')
  .match('https://example.com/*')
  .grant('unsafeWindow')
  .injectInto('page')
  .runAt('document-start')
  .build();

/**
 * Example 7: Multi-Site Script
 */
export const multiSiteScript = createManifest('Multi-Site Utility', '1.0.0')
  .description('Works across multiple websites')
  .match('https://github.com/*')
  .match('https://gitlab.com/*')
  .match('https://bitbucket.org/*')
  .exclude('https://github.com/settings/*')
  .grant('GM.setValue', 'GM.getValue')
  .grant('GM.notification')
  .runAt('document-idle')
  .build();

/**
 * Example 8: Development Script (with all debug features)
 */
export const devScript = createManifest('Dev Script', '0.1.0')
  .description('[DEV] Development version with debug features')
  .author('Developer')
  .match('http://localhost:*/*')
  .match('https://dev.example.com/*')
  .grant('unsafeWindow')
  .grant('GM.log', 'GM.info')
  .grant('GM.setValue', 'GM.getValue')
  .injectInto('content')
  .runAt('document-start')
  .build();
