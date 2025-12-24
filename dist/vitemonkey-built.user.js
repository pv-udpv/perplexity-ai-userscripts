// ==UserScript==
// @name         ViteMonkey Built - Perplexity AI Template
// @namespace    https://github.com/pv-udpv/perplexity-ai-userscripts
// @version      1.0.0
// @author       pv-udpv
// @description  Template for ViteMonkey-based Perplexity AI userscript with modern TypeScript, logging, and configuration management.
// @license      MIT
// @source       https://github.com/pv-udpv/perplexity-ai-userscripts.git
// @match        https://www.perplexity.ai/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    var a=(e=>(e[e.DEBUG=0]="DEBUG",e[e.INFO=1]="INFO",e[e.WARN=2]="WARN",e[e.ERROR=3]="ERROR",e))(a||{});function f(e,n=1){const i=`[${e}]`,r=o=>o>=n;return {debug(...o){r(0)&&console.log(i,...o);},info(...o){r(1)&&console.log(i,...o);},warn(...o){r(2)&&console.warn(i,...o);},error(...o){r(3)&&console.error(i,...o);}}}const t=f("vitemonkey-built",a.DEBUG),u={enabled:true,debugMode:false,updateInterval:5e3};async function s(){t.info("Initializing ViteMonkey userscript...");try{const e=await y();if(t.debug("Config loaded:",e),!e.enabled){t.info("Script disabled by user");return}await m(".perplexity-container",5e3),t.info("Perplexity UI detected"),b(e),g(e),t.info("Script initialized successfully");}catch(e){t.error("Failed to initialize script:",e);}}async function y(){try{const e=typeof GM_getValue<"u"?GM_getValue("config",null):null;return e?JSON.parse(e):u}catch(e){return t.warn("Failed to load config, using defaults:",e),u}}async function p(e){try{typeof GM_setValue<"u"?GM_setValue("config",JSON.stringify(e)):localStorage.setItem("vitemonkey-built-config",JSON.stringify(e)),t.debug("Config saved");}catch(n){t.error("Failed to save config:",n);}}function m(e,n=1e4){return new Promise((i,r)=>{const o=document.querySelector(e);if(o){i(o);return}const c=new MutationObserver(()=>{const d=document.querySelector(e);d&&(c.disconnect(),clearTimeout(l),i(d));});c.observe(document.documentElement,{childList:true,subtree:true});const l=setTimeout(()=>{c.disconnect(),r(new Error(`Element not found: ${e}`));},n);})}function b(e){document.addEventListener("keydown",n=>{n.ctrlKey&&n.shiftKey&&n.key==="D"&&(n.preventDefault(),e.debugMode=!e.debugMode,t.info(`Debug mode ${e.debugMode?"enabled":"disabled"}`),p(e).catch(t.error));}),document.addEventListener("perplexity:query-sent",n=>{t.debug("Query sent:",n.detail);});}function g(e){try{if(!document.querySelector(".perplexity-container")){t.warn("Could not find Perplexity container for UI injection");return}const i=document.createElement("button");i.textContent="ViteMonkey Script Active",i.className="vitemonkey-status-btn",i.style.cssText=`
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `,i.addEventListener("click",()=>{t.info("ViteMonkey button clicked"),i.textContent=i.textContent==="ViteMonkey Script Active"?"Clicked!":"ViteMonkey Script Active";}),document.body.appendChild(i),t.info("UI elements injected");}catch(n){t.error("Failed to setup UI:",n);}}function x(){t.info("Cleaning up resources..."),document.querySelectorAll(".vitemonkey-status-btn").forEach(e=>e.remove());}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{s().catch(t.error);}):s().catch(t.error);window.addEventListener("beforeunload",x);

})();