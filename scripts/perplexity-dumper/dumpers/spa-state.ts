import type { SPAStateData } from '../types';

function checkReactAvailability(hook: any): any {
  try {
    const renderer = Array.from(hook.renderers.values())[0] as any;
    if (!renderer) return null;

    // Basic React availability check
    const fiber = renderer.getFiberRoots?.();
    if (!fiber) return null;

    return {
      available: true,
      version: hook.version,
    };
  } catch (error) {
    console.error('Failed to check React availability:', error);
    return null;
  }
}

export function dumpSPAState(): SPAStateData {
  const state: SPAStateData = {
    react: null,
    vue: null,
    globalObjects: {},
    router: null,
  };

  // React DevTools
  const reactRoot = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (reactRoot?.renderers?.size) {
    state.react = checkReactAvailability(reactRoot);
  }

  // Vue DevTools
  if ((window as any).__VUE__) {
    state.vue = (window as any).__VUE__;
  }

  // Global Perplexity objects
  Object.keys(window)
    .filter((key) => key.startsWith('_pplx') || key.startsWith('__PPLX') || key.toLowerCase().includes('perplexity'))
    .forEach((key) => {
      try {
        state.globalObjects[key] = (window as any)[key];
      } catch (error) {
        state.globalObjects[key] = '<Error accessing property>';
      }
    });

  // Router state
  if (window.location) {
    state.router = {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: (window.history as any).state,
    };
  }

  return state;
}
