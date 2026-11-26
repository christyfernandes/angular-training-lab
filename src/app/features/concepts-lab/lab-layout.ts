import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-lab-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-3xl font-extrabold">{{ 'lab.title' | translate }}</h1>
    <p class="mt-1 max-w-2xl text-fg-muted">{{ 'lab.intro' | translate }}</p>
    <div class="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
      <nav class="flex gap-1 overflow-x-auto md:flex-col" [attr.aria-label]="'lab.title' | translate">
        @for (item of items; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-soft text-primary"
            ariaCurrentWhenActive="page"
            class="whitespace-nowrap rounded-lg px-3 py-2 font-semibold text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            {{ item.label | translate }}
          </a>
        }
      </nav>
      <div class="min-w-0">
        <router-outlet />
      </div>
    </div>
  `,
})
export default class LabLayout {
  protected readonly items = [
    { path: 'signals', label: 'lab.nav.signals' },
    { path: 'bindings', label: 'lab.nav.bindings' },
    { path: 'lifecycle', label: 'lab.nav.lifecycle' },
    { path: 'pipes', label: 'lab.nav.pipes' },
    { path: 'di', label: 'lab.nav.di' },
    { path: 'startup', label: 'lab.nav.startup' },
  ];
}
