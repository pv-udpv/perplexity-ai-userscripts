/**
 * Manifest for Just-Written Script
 * 
 * Example of manifest-as-code for a simple userscript.
 */

import { createManifest } from '../shared/manifest';

export const manifest = createManifest('Perplexity Just Written', '1.0.0')
  .description('Simple userscript for Perplexity AI')
  .author('pv-udpv')
  .namespace('https://github.com/pv-udpv/perplexity-ai-userscripts')
  
  // URL Matching
  .match('https://www.perplexity.ai/*')
  .match('https://perplexity.ai/*')
  
  // Exclude admin pages
  .exclude('https://www.perplexity.ai/admin/*')
  
  // Execution
  .runAt('document-idle')
  .grant('GM.setValue', 'GM.getValue')
  .grant('GM.notification')
  
  // Only run in top frame
  .noframes()
  
  // Inject into page context
  .injectInto('page')
  
  // Build
  .build();
