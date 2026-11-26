import { computed, DOCUMENT, effect, inject, Service, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ColorMode = 'light' | 'dark' | 'system';
export type Brand = 'peacock' | 'marigold' | 'jamun';

export const BRANDS: readonly Brand[] = ['peacock', 'marigold', 'jamun'];

/**
 * Light/dark mode and brand palette.
 *
 * Concepts:
 * - Writable `signal()`s hold the user's choice; `computed()` derives the effective mode.
 * - `effect()` syncs signal state to the outside world (the <html> element and storage).
 *   Effects are for side effects only – never use them to set other signals.
 * - The CSS side lives in src/styles.css (token contract + @theme inline).
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  readonly mode = signal<ColorMode>(this.storage.get<ColorMode>('theme.mode') ?? 'system');
  readonly brand = signal<Brand>(this.storage.get<Brand>('theme.brand') ?? 'peacock');

  private readonly systemPrefersDark = signal(false);

  readonly isDark = computed(() => {
    const mode = this.mode();
    return mode === 'dark' || (mode === 'system' && this.systemPrefersDark());
  });

  constructor() {
    const media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    if (media) {
      this.systemPrefersDark.set(media.matches);
      media.addEventListener('change', (e) => this.systemPrefersDark.set(e.matches));
    }

    // Side effect 1: reflect state onto <html>.
    effect(() => {
      const root = this.document.documentElement;
      root.classList.toggle('dark', this.isDark());
      root.dataset['brand'] = this.brand();
    });

    // Side effect 2: persist the user's choice.
    effect(() => {
      this.storage.set('theme.mode', this.mode());
      this.storage.set('theme.brand', this.brand());
    });
  }

  /** Called at startup with the brand from app-config.json; a user's own choice wins. */
  applyDefaultBrand(brand: Brand): void {
    if (this.storage.get<Brand>('theme.brand') === null) {
      this.brand.set(brand);
    }
  }

  toggleDark(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  setBrand(brand: Brand): void {
    this.brand.set(brand);
  }
}
