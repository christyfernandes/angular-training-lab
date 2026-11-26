import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Badge, Button, Spinner } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { API_BASE_URL } from '../../core/config/tokens';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Account page (protected by authGuard).
 *
 * The profile request needs a Bearer token; authInterceptor adds it, so this component
 * does not know anything about tokens. Try deleting the token in DevTools → Application →
 * Local Storage and reloading: errorInterceptor handles the 401.
 */
@Component({
  selector: 'app-account',
  imports: [TranslatePipe, Badge, Button, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.html',
})
export default class Account {
  protected readonly auth = inject(AuthService);
  private readonly apiBase = inject(API_BASE_URL);

  protected readonly profile = httpResource<User>(() => `${this.apiBase}/auth/me`);

  constructor() {
    // Keep the cached user in AuthService fresh once the profile arrives.
    effect(() => {
      if (this.profile.hasValue()) {
        this.auth.updateUser(this.profile.value());
      }
    });
  }
}
