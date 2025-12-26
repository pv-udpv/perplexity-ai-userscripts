#!/usr/bin/env node

/**
 * DOM Structure Extraction Tool
 * 
 * Extracts DOM elements with data-testid attributes from a target URL
 * using headless Chrome via Puppeteer.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Extract DOM structure from a URL
 */
async function extractDOMStructure(url) {
  console.log(`🔍 Analyzing ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract all elements with data-testid
    const elements = await page.evaluate(() => {
      const map = {};
      const testIdElements = document.querySelectorAll('[data-testid]');
      
      function generateSelector(el) {
        if (el.id) return `#${el.id}`;
        
        // Filter out auto-generated hash-based classes (e.g., CSS-in-JS hashes)
        // that typically match pattern: 6+ alphanumeric characters
        const classes = el.className && typeof el.className === 'string' 
          ? el.className.split(' ').filter(c => c && !c.match(/^[a-z0-9]{6,}$/i))
          : [];
        
        if (classes.length > 0 && classes.length <= 3) {
          return `.${classes.join('.')}`;
        }
        
        const testId = el.getAttribute('data-testid');
        if (testId) return `[data-testid="${testId}"]`;
        
        return el.tagName.toLowerCase();
      }
      
      function getXPath(el) {
        if (el.id) return `//*[@id="${el.id}"]`;
        
        const names = [];
        let current = el;
        
        while (current && current.parentElement) {
          let index = 1;
          let sibling = current.previousElementSibling;
          
          while (sibling) {
            if (sibling.tagName === current.tagName) {
              index++;
            }
            sibling = sibling.previousElementSibling;
          }
          
          const tagName = current.tagName.toLowerCase();
          names.unshift(`${tagName}[${index}]`);
          current = current.parentElement;
        }
        
        return '/' + names.join('/');
      }
      
      testIdElements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        const selector = generateSelector(el);
        const type = el.tagName.toLowerCase();
        const classes = el.className && typeof el.className === 'string'
          ? el.className.split(' ').filter(c => c).slice(0, 5).join(' ')
          : '';
        const text = el.textContent?.trim().substring(0, 100);
        
        const attributes = {};
        if (el.id) attributes.id = el.id;
        if (el.name) attributes.name = el.name;
        if (el.type) attributes.type = el.type;
        if (el.placeholder) attributes.placeholder = el.placeholder;
        if (el.value) attributes.value = el.value;
        if (el.href) attributes.href = el.href;
        if (el.role) attributes.role = el.role;
        
        map[testId] = {
          selector,
          type,
          classes,
          text,
          attributes,
          xpath: getXPath(el),
          parent: el.parentElement?.getAttribute('data-testid') || null,
          children: Array.from(el.children)
            .filter(c => c.hasAttribute('data-testid'))
            .map(c => c.getAttribute('data-testid'))
        };
      });
      
      return map;
    });
    
    console.log(`✅ Extracted ${Object.keys(elements).length} elements with data-testid`);
    
    await browser.close();
    
    return { elements };
  } catch (error) {
    console.error('❌ Error extracting DOM:', error.message);
    await browser.close();
    throw error;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const outputIndex = args.indexOf('--output');
  
  if (urlIndex === -1 || outputIndex === -1) {
    console.error('Usage: node extract-dom.js --url <URL> --output <output-file>');
    process.exit(1);
  }
  
  const url = args[urlIndex + 1];
  const output = args[outputIndex + 1];
  
  if (!url || !output) {
    console.error('❌ Error: URL and output file are required');
    process.exit(1);
  }
  
  try {
    const result = await extractDOMStructure(url);
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

module.exports = { extractDOMStructure };
