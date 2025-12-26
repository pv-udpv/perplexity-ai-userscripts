#!/usr/bin/env node

/**
 * API Extraction Tool
 * 
 * Extracts API endpoints and generates TypeScript interfaces
 * by intercepting network requests using headless Chrome.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Extract API endpoints from a URL
 */
async function extractAPIs(url) {
  console.log(`🔍 Analyzing API calls from ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const responses = {};
  
  // Intercept network responses
  page.on('response', async (response) => {
    const responseUrl = response.url();
    
    // Filter for API-like URLs
    if (
      responseUrl.includes('/api') || 
      responseUrl.includes('.json') ||
      responseUrl.includes('/graphql') ||
      responseUrl.includes('/v1/') ||
      responseUrl.includes('/v2/')
    ) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          const method = response.request().method();
          
          responses[responseUrl] = {
            status: response.status(),
            headers: response.headers(),
            body: data,
            method: method,
            timestamp: Date.now()
          };
          
          console.log(`📡 Captured: ${method} ${responseUrl}`);
        }
      } catch (e) {
        // Not JSON or failed to parse, skip
      }
    }
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Simulate user interactions to trigger more API calls
    const MAX_CLICKS = 5; // Limit clicks to avoid too many requests
    await page.evaluate((maxClicks) => {
      // Click buttons to trigger API calls
      const buttons = document.querySelectorAll('button, a');
      buttons.forEach((el, index) => {
        if (index < maxClicks) {
          try {
            el.click?.();
          } catch (e) {
            // Ignore errors from clicks
          }
        }
      });
      
      // Scroll to trigger lazy loading
      window.scrollTo(0, document.body.scrollHeight / 2);
    }, MAX_CLICKS);
    
    // Wait a bit for additional requests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await browser.close();
    
    // Generate TypeScript interfaces
    const interfaces = generateInterfaces(responses);
    
    console.log(`✅ Extracted ${Object.keys(responses).length} API endpoints`);
    
    return { apis: responses, interfaces };
  } catch (error) {
    console.error('❌ Error extracting APIs:', error.message);
    await browser.close();
    throw error;
  }
}

/**
 * Generate TypeScript interfaces from API responses
 */
function generateInterfaces(responses) {
  const interfaces = {};
  
  Object.entries(responses).forEach(([url, response]) => {
    const name = urlToInterfaceName(url);
    const body = response.body;
    
    interfaces[name] = {
      url: url,
      method: response.method,
      headers: response.headers,
      response: inferType(body)
    };
  });
  
  return interfaces;
}

/**
 * Infer TypeScript type from value
 */
function inferType(obj, depth = 0) {
  // Prevent infinite recursion
  if (depth > 5) return 'any';
  
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'any[]';
    // Infer type from first element
    return `${inferType(obj[0], depth + 1)}[]`;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const fields = {};
    Object.entries(obj).forEach(([key, value]) => {
      fields[key] = inferType(value, depth + 1);
    });
    return fields;
  }
  
  return typeof obj;
}

/**
 * Convert URL to valid interface name
 */
function urlToInterfaceName(url) {
  // Remove protocol and domain
  let name = url.replace(/https?:\/\/[^/]+/, '');
  
  // Remove query parameters
  name = name.split('?')[0];
  
  // Convert to PascalCase
  name = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Ensure it starts with a letter
  if (!/^[A-Z]/.test(name)) {
    name = 'Api' + name;
  }
  
  return name + 'Response';
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const outputIndex = args.indexOf('--output');
  
  if (urlIndex === -1 || outputIndex === -1) {
    console.error('Usage: node extract-api.js --url <URL> --output <output-file>');
    process.exit(1);
  }
  
  const url = args[urlIndex + 1];
  const output = args[outputIndex + 1];
  
  if (!url || !output) {
    console.error('❌ Error: URL and output file are required');
    process.exit(1);
  }
  
  try {
    const result = await extractAPIs(url);
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
    console.log(`📁 Saved to ${output}`);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractAPIs };
