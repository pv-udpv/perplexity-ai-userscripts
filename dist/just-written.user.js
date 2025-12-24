// ==UserScript==
// @name         Just Written - Simple Perplexity AI Script
// @namespace    https://github.com/pv-udpv/perplexity-ai-userscripts
// @version      1.0.0
// @author       pv-udpv
// @description  A simple example userscript demonstrating keyboard shortcuts, message monitoring, and UI injection for Perplexity AI.
// @license      MIT
// @source       https://github.com/pv-udpv/perplexity-ai-userscripts.git
// @match        https://www.perplexity.ai/*
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const t={isActive:true,messageCount:0};function s(e,i){console.log("[just-written]",e);}function o(){s("Initializing..."),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();}function n(){s("Setting up features"),document.addEventListener("keydown",a),r(),c(),s("Setup complete");}function a(e){e.ctrlKey&&e.shiftKey&&e.code==="KeyM"&&(e.preventDefault(),t.isActive=!t.isActive,s(`Monitoring ${t.isActive?"enabled":"disabled"}`)),e.ctrlKey&&e.shiftKey&&e.code==="KeyC"&&(e.preventDefault(),t.messageCount=0,s("Message count reset"));}function r(){new MutationObserver(()=>{if(!t.isActive)return;const i=document.querySelectorAll('[role="article"], .message, [data-message]');i.length>t.messageCount&&(t.messageCount=i.length,s(`Messages detected: ${t.messageCount}`),d());}).observe(document.body,{childList:true,subtree:true,characterData:true}),s("Message observer attached");}function c(){const e=document.createElement("div");e.id="just-written-status",e.style.cssText=`
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 15px;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    user-select: none;
  `,e.textContent="✓ Just-Written Active",e.addEventListener("click",()=>{t.isActive=!t.isActive,e.style.background=t.isActive?"rgba(76, 175, 80, 0.9)":"rgba(244, 67, 54, 0.9)",e.textContent=t.isActive?"✓ Active":"✗ Paused";}),document.body.appendChild(e),s("Status indicator added");}function d(){const e=document.getElementById("just-written-status");e&&(e.textContent=`Messages: ${t.messageCount}`);}o();

})();