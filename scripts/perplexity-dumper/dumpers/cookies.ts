import type { CookieData } from '../types';

function parseCookie(cookieString: string): CookieData[] {
  const cookies: CookieData[] = [];

  cookieString.split(';').forEach((cookieSegment) => {
    const trimmedSegment = cookieSegment.trim();

    // Skip empty segments that can occur due to leading/trailing semicolons
    if (!trimmedSegment) {
      return;
    }

    const separatorIndex = trimmedSegment.indexOf('=');

    // If there is no "=", this is a malformed cookie segment; log and skip it.
    if (separatorIndex === -1) {
      console.warn('Ignoring malformed cookie segment without "=":', trimmedSegment);
      return;
    }

    const name = trimmedSegment.slice(0, separatorIndex).trim();
    const value = trimmedSegment.slice(separatorIndex + 1).trim();

    // If the name is empty, this is also malformed; log and skip it.
    if (!name) {
      console.warn('Ignoring cookie segment with empty name:', trimmedSegment);
      return;
    }

    cookies.push({ name, value });
  });

  return cookies;
}

export async function dumpCookies(): Promise<CookieData[]> {
  try {
    return parseCookie(document.cookie);
  } catch (error) {
    console.error('Failed to dump cookies:', error);
    return [];
  }
}
