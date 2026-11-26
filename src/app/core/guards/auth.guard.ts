import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Only signed-in users may enter.
 *
 * Concept: `canMatch` (instead of `canActivate`) runs BEFORE a lazy route is matched, so the
 * route's JavaScript chunk is not even downloaded for users who cannot use it.
 * Returning a UrlTree performs a redirect.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  const returnUrl = '/' + segments.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl } });
};

/**
 * Guard factory: `canMatch: [authGuard, roleGuard('admin')]`.
 * Concept: a function that returns a guard lets one implementation serve many routes.
 */
export function roleGuard(...roles: UserRole[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    if (auth.hasRole(...roles)) {
      return true;
    }
    inject(NotificationService).error(inject(TranslateService).instant('errors.forbidden'));
    return inject(Router).createUrlTree(['/']);
  };
}

/** Keeps signed-in users away from the login page. */
export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isAuthenticated() ? inject(Router).createUrlTree(['/account']) : true;
};
