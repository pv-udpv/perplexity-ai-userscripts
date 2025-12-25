#!/usr/bin/env tsx

/**
 * GitHub Gist Sync Script
 * 
 * Syncs userscripts to GitHub Gist based on manifest.json configuration.
 * Only syncs scripts with `distribution.gist.enabled: true` in their manifest.
 */

import { readFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

interface GistDistribution {
  enabled: boolean;
  gistId: string;
  filename?: string;
  description?: string;
}

interface Manifest {
  name: string;
  version: string;
  distribution?: {
    gist?: GistDistribution;
    greasyfork?: { enabled: boolean };
  };
}

interface GistFile {
  content: string;
}

interface GistPayload {
  description?: string;
  files: Record<string, GistFile>;
}

interface GistUpdateResult {
  gistId: string;
  filesUpdated: string[];
  success: boolean;
  error?: string;
}

class GistSyncError extends Error {
  constructor(
    message: string,
    public readonly gistId: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'GistSyncError';
  }
}

class GistSyncer {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    if (!token) {
      throw new Error('GitHub token is required');
    }
    this.token = token;
  }

  /**
   * Update a gist with new files
   */
  async updateGist(gistId: string, payload: GistPayload): Promise<void> {
    const url = `${this.baseUrl}/gists/${gistId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorBody;
      } catch {
        errorMessage = errorBody;
      }

      throw new GistSyncError(
        `Failed to update gist: ${errorMessage}`,
        gistId,
        response.status
      );
    }

    const result = await response.json();
    console.log(`✅ Updated gist ${gistId}`);
    console.log(`🔗 ${result.html_url}`);
  }

  /**
   * Scan scripts directory for manifests with gist distribution enabled
   */
  async scanScriptsForGistSync(scriptsDir: string, distDir: string): Promise<Map<string, GistPayload>> {
    const gistMap = new Map<string, GistPayload>();

    const entries = await readdir(scriptsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'shared') continue;

      const scriptPath = join(scriptsDir, entry.name);
      const manifestPath = join(scriptPath, 'manifest.json');

      if (!existsSync(manifestPath)) {
        console.log(`⚠️  No manifest.json in ${entry.name}, skipping`);
        continue;
      }

      try {
        const manifestContent = await readFile(manifestPath, 'utf-8');
        const manifest: Manifest = JSON.parse(manifestContent);

        const gistConfig = manifest.distribution?.gist;
        
        if (!gistConfig?.enabled) {
          console.log(`⏭️  Gist sync disabled for ${entry.name}`);
          continue;
        }

        if (!gistConfig.gistId) {
          console.warn(`⚠️  No gistId specified for ${entry.name}, skipping`);
          continue;
        }

        // Find compiled .user.js file
        const userscriptName = gistConfig.filename || `${entry.name}.user.js`;
        const distFilePath = join(distDir, userscriptName);

        if (!existsSync(distFilePath)) {
          console.warn(`⚠️  Compiled file not found: ${distFilePath}`);
          continue;
        }

        const userscriptContent = await readFile(distFilePath, 'utf-8');
        
        // Group files by gistId
        if (!gistMap.has(gistConfig.gistId)) {
          gistMap.set(gistConfig.gistId, {
            description: gistConfig.description || `Perplexity AI userscripts (auto-synced)`,
            files: {},
          });
        }

        const payload = gistMap.get(gistConfig.gistId)!;
        payload.files[userscriptName] = { content: userscriptContent };

        console.log(`📦 Queued ${userscriptName} → gist ${gistConfig.gistId}`);
      } catch (error) {
        console.error(`❌ Error processing ${entry.name}:`, error);
        continue;
      }
    }

    return gistMap;
  }

  /**
   * Add additional files (README, docs) to gist payload
   */
  async addAdditionalFiles(
    payload: GistPayload,
    files: string[]
  ): Promise<void> {
    for (const filePath of files) {
      if (!existsSync(filePath)) {
        console.log(`⏭️  File not found: ${filePath}`);
        continue;
      }

      const content = await readFile(filePath, 'utf-8');
      const filename = basename(filePath);
      payload.files[filename] = { content };
      console.log(`📄 Added ${filename}`);
    }
  }

  /**
   * Sync all configured gists
   */
  async syncAll(scriptsDir: string, distDir: string, additionalFiles: string[] = []): Promise<GistUpdateResult[]> {
    console.log('🔍 Scanning for scripts with gist sync enabled...');
    
    const gistMap = await this.scanScriptsForGistSync(scriptsDir, distDir);

    if (gistMap.size === 0) {
      console.log('⚠️  No scripts configured for gist sync');
      return [];
    }

    console.log(`\n📊 Found ${gistMap.size} gist(s) to update\n`);

    // Add additional files to first gist (or all gists if needed)
    const firstGistId = Array.from(gistMap.keys())[0];
    const firstPayload = gistMap.get(firstGistId)!;
    await this.addAdditionalFiles(firstPayload, additionalFiles);

    const results: GistUpdateResult[] = [];

    for (const [gistId, payload] of gistMap.entries()) {
      try {
        console.log(`\n🚀 Updating gist ${gistId}...`);
        await this.updateGist(gistId, payload);
        
        results.push({
          gistId,
          filesUpdated: Object.keys(payload.files),
          success: true,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to update gist ${gistId}:`, errorMessage);
        
        results.push({
          gistId,
          filesUpdated: [],
          success: false,
          error: errorMessage,
        });
      }
    }

    return results;
  }
}

// CLI Entry Point
async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GIST_TOKEN;
  
  if (!token) {
    console.error('❌ Missing required environment variable: GITHUB_TOKEN or GIST_TOKEN');
    console.error('\nFor GitHub Actions, ensure either:');
    console.error('  1. GIST_TOKEN secret is configured (recommended)');
    console.error('  2. GITHUB_TOKEN has gist permissions (requires organization settings)');
    process.exit(1);
  }

  const scriptsDir = process.env.SCRIPTS_DIR || './scripts';
  const distDir = process.env.DIST_DIR || './dist';
  const additionalFiles = [
    'README.md',
    'INSTALLATION.md',
    'PLUGIN_DEVELOPMENT_GUIDE.md',
  ];

  console.log('🎯 GitHub Gist Sync');
  console.log('━'.repeat(50));
  console.log(`Scripts directory: ${scriptsDir}`);
  console.log(`Dist directory: ${distDir}`);
  console.log(`Additional files: ${additionalFiles.join(', ')}`);
  console.log('━'.repeat(50) + '\n');

  const syncer = new GistSyncer(token);
  
  try {
    const results = await syncer.syncAll(scriptsDir, distDir, additionalFiles);
    
    console.log('\n' + '━'.repeat(50));
    console.log('📋 Summary');
    console.log('━'.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Updated gists:');
      successful.forEach(r => {
        console.log(`  - ${r.gistId} (${r.filesUpdated.length} files)`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed gists:');
      failed.forEach(r => {
        console.log(`  - ${r.gistId}: ${r.error}`);
      });
      process.exit(1);
    }
    
    console.log('\n🎉 Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Fatal error during sync:');
    console.error(error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { GistSyncer, GistSyncError };
export type { Manifest, GistDistribution, GistPayload, GistUpdateResult };
