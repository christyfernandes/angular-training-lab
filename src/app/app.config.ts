import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withViewTransitions,
} from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AppConfigService } from './core/config/app-config.service';
import { API_BASE_URL } from './core/config/tokens';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { TranslatedTitleStrategy } from './core/router/translated-title.strategy';
import { NotificationService } from './core/services/notification.service';
import { AppInitService } from './core/startup/app-init.service';

/**
 * Application-wide providers. There is no AppModule: standalone apps are configured here.
 * New Angular 22 apps are zoneless and use OnPush change detection by default.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      // Route params, query params and resolved data arrive as component inputs.
      withComponentInputBinding(),
      // Cross-fade between pages using the browser's View Transitions API.
      withViewTransitions(),
      // Restore scroll position on back/forward, scroll to top on new pages, support #anchors.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Runs in an injection context, so inject() works. Typical cause: a lazy chunk that
      // no longer exists after a new deployment.
      withNavigationErrorHandler(() => {
        inject(NotificationService).error(inject(TranslateService).instant('errors.navigation'));
      }),
    ),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },

    // Interceptors run in this order for requests, and in reverse for responses.
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),

    provideTranslateService({
      fallbackLang: 'en',
      // useHttpBackend: translation files skip the interceptors. Without it there is a DI cycle:
      // TranslateService → loader → HttpClient → errorInterceptor → TranslateService (NG0200).
      // It also keeps auth headers and the loading bar away from static files.
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', useHttpBackend: true }),
    }),

    // The API URL comes from the runtime config (public/config/app-config.json), so the same
    // build can point at dev, QA or production. The factory runs on first injection, which
    // AppInitService guarantees is after the config has loaded.
    { provide: API_BASE_URL, useFactory: () => inject(AppConfigService).config().apiBaseUrl },

    // Startup logic: Angular waits for this Promise before rendering the first screen.
    // See core/startup/app-init.service.ts for the ordered steps.
    provideAppInitializer(() => inject(AppInitService).init()),
  ],
};
