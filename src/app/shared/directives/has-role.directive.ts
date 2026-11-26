import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Structural directive: renders its template only for users with one of the given roles.
 *
 *   <a *appHasRole="['admin', 'moderator']" routerLink="/admin">Admin</a>
 *
 * Concepts: TemplateRef + ViewContainerRef (how @if-like behaviour is built), and an
 * `effect()` that reacts to both the input and the signed-in user changing.
 *
 * Note: hiding UI is not security. The route is protected separately by roleGuard,
 * and a real backend must check permissions too.
 */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  readonly appHasRole = input.required<UserRole[]>();

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);
  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.auth.hasRole(...this.appHasRole());
      if (allowed && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
