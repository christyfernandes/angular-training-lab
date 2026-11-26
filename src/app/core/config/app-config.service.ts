import { HttpBackend, HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { AppConfig, DEFAULT_APP_CONFIG, FeatureName } from './app-config.model';
import { parseAppConfig } from './parse-app-config';

export type ConfigSource = 'defaults' | 'remote';

/**
 * Holds the runtime configuration.
 *
 * Concepts:
 * - `new HttpClient(inject(HttpBackend))` creates a client that SKIPS all interceptors.
 *   The interceptors depend on services that need this config, so going through them
 *   during startup would create a chicken-and-egg problem.
 * - Config is exposed as signals, so templates and computed() react if it is reloaded.
 */
@Service()
export class AppConfigService {
  private readonly http = new HttpClient(inject(HttpBackend));

  private readonly _config = signal<AppConfig>(DEFAULT_APP_CONFIG);
  private readonly _source = signal<ConfigSource>('defaults');
  private readonly _warnings = signal<string[]>([]);

  readonly config = this._config.asReadonly();
  readonly source = this._source.asReadonly();
  readonly warnings = this._warnings.asReadonly();
  readonly features = computed(() => this._config().features);

  /** Called once by AppInitService. Never throws: falls back to defaults. */
  async load(url = '/config/app-config.json'): Promise<void> {
    const warnings: string[] = [];
    try {
      // The timestamp defeats HTTP caches, so a changed file is picked up on the next page load.
      const raw = await firstValueFrom(
        this.http.get<unknown>(url, { params: { t: Date.now() } }).pipe(timeout(5000)),
      );
      this._config.set(parseAppConfig(raw, (message) => warnings.push(message)));
      this._source.set('remote');
    } catch (error) {
      warnings.push(`could not load ${url}; using built-in defaults`);
      console.warn('[config]', error);
    }
    this._warnings.set(warnings);
    warnings.forEach((w) => console.warn('[config]', w));
  }

  isEnabled(feature: FeatureName): boolean {
    return this._config().features[feature];
  }
}
