import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Per-request opt-out flag. Set it with:
 *   new HttpContext().set(SKIP_GLOBAL_LOADER, true)
 * HttpContext carries metadata for interceptors without polluting headers or URLs.
 */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

/** Drives the thin progress bar at the top of the page. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
