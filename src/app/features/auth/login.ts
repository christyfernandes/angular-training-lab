import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Alert, AutofocusDirective, Button } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { LoginCredentials } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Login page built with Signal Forms (stable in Angular 22).
 *
 * Concepts:
 * - The MODEL is a plain writable signal; `form()` wraps it in a typed field tree.
 * - Validation rules live in a schema function, next to the model.
 * - `[formField]` binds an input to a field; `[formRoot]` handles submit + novalidate.
 * - The async `submission.action` returns server errors, which appear on the form like any
 *   other validation error.
 *
 * Compare with the admin product editor, which uses Reactive Forms – you will meet both
 * in real codebases.
 */
@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, TranslatePipe, Alert, Button, AutofocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export default class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  /** From ?returnUrl=… (set by authGuard) via component input binding. */
  readonly returnUrl = input<string>();

  protected readonly model = signal<LoginCredentials>({ username: '', password: '' });

  // Error messages are translation keys, translated in the template.
  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.username, { message: 'login.errors.usernameRequired' });
      required(path.password, { message: 'login.errors.passwordRequired' });
      minLength(path.password, 6, { message: 'login.errors.passwordTooShort' });
    },
    {
      submission: {
        action: async () => {
          try {
            const user = await firstValueFrom(this.auth.login(this.model()));
            this.notifications.success(this.translate.instant('login.welcome', { name: user.firstName }));
            await this.router.navigateByUrl(this.safeReturnUrl());
            return undefined; // success: no errors
          } catch {
            // A form-level error. It shows in loginForm().errors().
            return { kind: 'server', message: 'login.errors.invalidCredentials' };
          }
        },
      },
    },
  );

  protected readonly showPassword = signal(false);

  protected fillDemoAccount(): void {
    this.model.set({ username: 'emilys', password: 'emilyspass' });
  }

  /** Only allow in-app paths, never absolute URLs (prevents open-redirect attacks). */
  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/account';
  }
}
