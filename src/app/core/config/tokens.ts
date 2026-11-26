import { InjectionToken } from '@angular/core';

/**
 * Base URL of the REST API (https://dummyjson.com).
 *
 * Concept: an InjectionToken lets you inject a plain value (not a class). It is provided in
 * app.config.ts, so tests or other environments can swap it without touching services.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/**
 * Browser storage abstraction.
 *
 * Concept: a token with a `factory` is self-providing (no entry needed in app.config.ts).
 * Falling back to an in-memory store keeps the app working in tests, private browsing
 * modes that throw on access, and server-side rendering.
 */
export const BROWSER_STORAGE = new InjectionToken<Storage>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      const probe = '__lab_probe__';
      globalThis.localStorage.setItem(probe, probe);
      globalThis.localStorage.removeItem(probe);
      return globalThis.localStorage;
    } catch {
      return createMemoryStorage();
    }
  },
});

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()].at(index) ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}
