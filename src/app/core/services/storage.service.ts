import { inject, Service } from '@angular/core';
import { BROWSER_STORAGE } from '../config/tokens';

/**
 * Typed JSON wrapper around localStorage.
 *
 * Concept: `@Service()` (new in Angular 22) is shorthand for `@Injectable({ providedIn: 'root' })`:
 * one shared instance for the whole app, created lazily the first time it is injected.
 */
@Service()
export class StorageService {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly prefix = 'lab.';

  get<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(this.prefix + key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled: the app keeps working, it just will not persist.
    }
  }

  remove(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }
}
