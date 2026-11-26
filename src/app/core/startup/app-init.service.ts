import { Injector, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { ThemeService } from '../services/theme.service';

export interface StartupStep {
  name: string;
  status: 'ok' | 'failed' | 'skipped';
  durationMs: number;
  detail?: string;
}

/**
 * Orchestrates everything that must happen BEFORE the first screen renders.
 * Registered in app.config.ts with:
 *
 *   provideAppInitializer(() => inject(AppInitService).init())
 *
 * Angular waits for the returned Promise before bootstrapping the root component and running
 * the first navigation, so guards and pages can rely on config, language and session.
 *
 * Order matters:
 *   1. Runtime config   – everything else reads it (API URL, defaults, feature flags)
 *   2. Theme defaults   – avoids a flash of the wrong colours
 *   3. Language         – avoids a flash of untranslated keys
 *   4. Session restore  – validates a stored token so guards see the real login state
 *
 * Each step is timed and isolated: a failing optional step is logged, not fatal.
 * Keep startup fast – every millisecond here delays the first paint.
 */
@Service()
export class AppInitService {
  private readonly injector = inject(Injector);
  private readonly configService = inject(AppConfigService);

  private readonly _steps = signal<StartupStep[]>([]);
  readonly steps = this._steps.asReadonly();
  readonly totalMs = signal(0);

  async init(): Promise<void> {
    const started = performance.now();

    await this.step('Load runtime config', async () => {
      await this.configService.load();
      return `source: ${this.configService.source()}`;
    });

    // Why injector.get() instead of field inject()? These services read the config (for
    // example API_BASE_URL) when they are constructed. Creating them only AFTER step 1
    // guarantees they see the loaded values, not the defaults.
    const config = this.configService.config();

    await this.step('Apply theme defaults', async () => {
      this.injector.get(ThemeService).applyDefaultBrand(config.defaultBrand);
      return `default brand: ${config.defaultBrand}`;
    });

    await this.step('Load translations', async () => {
      const language = this.injector.get(LanguageService);
      await firstValueFrom(language.init(config.defaultLanguage));
      return `language: ${language.current()}`;
    });

    await this.step('Restore session', async () => {
      const auth = this.injector.get(AuthService);
      if (!auth.isAuthenticated()) return 'no stored session';
      await auth.restoreSession();
      return auth.isAuthenticated() ? `signed in as ${auth.user()?.username}` : 'stored token expired';
    });

    this.totalMs.set(Math.round(performance.now() - started));
  }

  private async step(name: string, run: () => Promise<string | void>): Promise<void> {
    const t0 = performance.now();
    try {
      const detail = await run();
      this.record({ name, status: 'ok', durationMs: Math.round(performance.now() - t0), detail: detail ?? undefined });
    } catch (error) {
      console.error(`[startup] ${name} failed`, error);
      this.record({ name, status: 'failed', durationMs: Math.round(performance.now() - t0), detail: String(error) });
    }
  }

  private record(step: StartupStep): void {
    this._steps.update((steps) => [...steps, step]);
  }
}
