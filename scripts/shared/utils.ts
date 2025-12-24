/**
 * Utility Functions for Perplexity Userscripts
 *
 * Common patterns extracted from userscripts:
 * - Debounce/throttle for event handlers
 * - Async utilities (sleep, retry with backoff)
 * - Safe DOM queries
 * - ID generation
 *
 * Pattern from: Complexity extension (pnd280/complexity)
 */

/**
 * Debounce a function - delays execution until specified time after last call
 * Useful for input handlers, resize listeners, etc.
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 * @example
 * const handleInput = debounce((value: string) => {
 *   console.log('Search:', value);
 * }, 300);
 * input.addEventListener('input', (e) => handleInput(e.target.value));
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function - ensures execution at most once per specified interval
 * Useful for scroll/resize events
 * @param func - Function to throttle
 * @param limit - Minimum interval between executions in milliseconds
 * @returns Throttled function
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scrolled');
 * }, 100);
 * window.addEventListener('scroll', handleScroll);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep for a given duration
 * Useful for adding delays in async operations
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 * @example
 * await sleep(1000); // Wait 1 second
 * console.log('After 1 second');
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param fn - Async function to retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 * @returns Promise resolving to function result
 * @throws Error if all attempts fail
 * @example
 * const data = await retryWithBackoff(
 *   () => fetch('/api/data').then(r => r.json()),
 *   3,
 *   100
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 100,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed without error');
}

/**
 * Safe DOM query with error handling
 * @param selector - CSS selector string
 * @param parent - Parent element to search within (default: document)
 * @returns Element or null if not found
 * @example
 * const btn = querySafe<HTMLButtonElement>('.submit-btn');
 * if (btn) btn.click();
 */
export function querySafe<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document,
): T | null {
  try {
    return parent.querySelector<T>(selector);
  } catch (error) {
    console.error(`[querySafe] Invalid selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safe DOM query all with error handling
 * @param selector - CSS selector string
 * @param parent - Parent element to search within (default: document)
 * @returns Array of elements
 * @example
 * const messages = querySafeAll<HTMLDivElement>('[role="article"]');
 * console.log(`Found ${messages.length} messages`);
 */
export function querySafeAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document,
): T[] {
  try {
    return Array.from(parent.querySelectorAll<T>(selector));
  } catch (error) {
    console.error(`[querySafeAll] Invalid selector "${selector}":`, error);
    return [];
  }
}

/**
 * Check if element is currently visible in viewport
 * @param element - Element to check
 * @returns True if element is in viewport
 * @example
 * if (isElementInViewport(element)) {
 *   console.log('Element is visible');
 * }
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Generate a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique string ID
 * @example
 * const id = generateId('request');
 * // Returns: 'request-1234567890-abc123def456'
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}
