import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/tokens';
import { AuthService } from '../services/auth.service';

/**
 * Adds `Authorization: Bearer <token>` to requests for OUR API only.
 *
 * Security note: never attach tokens to every request – third-party hosts (CDNs, analytics,
 * translation files) must not receive them. Requests are immutable, so we `clone()`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const apiBase = inject(API_BASE_URL);

  if (!token || !req.url.startsWith(apiBase)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
