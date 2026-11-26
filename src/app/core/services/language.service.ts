import { computed, DOCUMENT, inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface SupportedLanguage {
  code: string;
  /** Name of the language in that language, so people can find their own. */
  label: string;
  /** Locale used by Angular's date/number/currency pipes. */
  locale: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'hi', label: 'हिन्दी', locale: 'hi' },
];

/**
 * Runtime language switching on top of ngx-translate.
 *
 * Translations are JSON files in public/i18n/<code>.json, loaded over HTTP on demand.
 * `init()` runs in an app initializer, so the first screen never shows raw keys.
 */
@Service()
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  readonly languages = SUPPORTED_LANGUAGES;

  /** ngx-translate exposes the active language as a signal. */
  readonly current = computed(() => this.translate.currentLang() ?? 'en');
  readonly locale = computed(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === this.current())?.locale ?? 'en-US',
  );

  /** Order of preference: the user's saved choice → the browser language → the configured default. */
  init(configuredDefault = 'en'): Observable<unknown> {
    const saved = this.storage.get<string>('lang');
    const browser = this.document.defaultView?.navigator.language.slice(0, 2);
    const initial =
      [saved, browser, configuredDefault].find((code) => SUPPORTED_LANGUAGES.some((l) => l.code === code)) ?? 'en';
    return this.load(initial);
  }

  /** Switch language from the UI. */
  use(code: string): void {
    this.load(code).subscribe();
  }

  private load(code: string): Observable<unknown> {
    this.document.documentElement.lang = code;
    this.storage.set('lang', code);
    return this.translate.use(code);
  }
}
