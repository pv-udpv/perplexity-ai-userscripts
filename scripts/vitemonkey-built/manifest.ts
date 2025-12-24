/**
 * Manifest for ViteMonkey-built Script
 * 
 * Example of manifest-as-code for a Vite-bundled userscript.
 */

import { createManifest } from '../shared/manifest';

export const manifest = createManifest('Perplexity ViteMonkey Built', '1.0.0')
  .description('Example ViteMonkey-built userscript for Perplexity AI')
  .author('pv-udpv')
  .namespace('https://github.com/pv-udpv/perplexity-ai-userscripts')
  .homepage('https://github.com/pv-udpv/perplexity-ai-userscripts')
  .license('MIT')
  
  // URL Matching
  .match('https://www.perplexity.ai/*')
  .match('https://perplexity.ai/*')
  
  // Execution
  .runAt('document-end')
  .grant('GM.setValue', 'GM.getValue', 'GM.deleteValue')
  .grant('GM.xmlHttpRequest', 'GM.notification')
  
  // Dependencies
  .require('https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js')
  
  // Resources
  .resource('icon', 'https://www.perplexity.ai/favicon.ico')
  
  // Network
  .connect('www.perplexity.ai', 'api.perplexity.ai')
  
  // Build
  .build();

// For debugging
if (import.meta.env?.DEV) {
  console.log('[ViteMonkey] Manifest:', manifest);
}
