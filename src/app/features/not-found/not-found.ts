import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-lg py-16 text-center">
      <p class="font-display text-7xl font-extrabold text-primary">404</p>
      <h1 class="mt-4 text-2xl font-bold">{{ 'notFound.title' | translate }}</h1>
      <p class="mt-2 text-fg-muted">{{ 'notFound.body' | translate }}</p>
      <a uiButton routerLink="/" class="mt-6">{{ 'notFound.home' | translate }}</a>
    </section>
  `,
})
export default class NotFound {}
