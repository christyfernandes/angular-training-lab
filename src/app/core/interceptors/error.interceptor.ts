import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Lets a caller handle errors itself (no toast, no redirect). Used during startup, when
 * redirecting to /login before the first navigation would break deep links.
 */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

/**
 * Central place for cross-cutting HTTP error handling.
 *
 * - 401 (expired or invalid token): end the session and send the user to log in.
 * - 0 (network down / CORS) and 5xx: show a toast.
 * - Other 4xx: re-thrown untouched so the caller can show a specific message
 *   (for example, the login form shows "wrong username or password" inline).
 *
 * The error is always re-thrown, so callers and httpResource still see it.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isLoginCall = req.url.endsWith('/auth/login');
        if (error.status === 401 && !isLoginCall && auth.isAuthenticated()) {
          auth.logout(false);
          notifications.error(translate.instant('errors.sessionExpired'));
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        } else if (error.status === 0) {
          notifications.error(translate.instant('errors.offline'));
        } else if (error.status >= 500) {
          notifications.error(translate.instant('errors.server'));
        }
      }
      return throwError(() => error);
    }),
  );
};
