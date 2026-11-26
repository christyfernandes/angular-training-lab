import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationEventsService } from './core/router/navigation-events.service';
import { LoadingService } from './core/services/loading.service';
import { AnnouncementBar } from './layout/announcement-bar';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { ProgressBar } from './layout/progress-bar';
import { ToastOutlet } from './layout/toast-outlet';

/** Root component: the application shell. Pages render inside <router-outlet />. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, AnnouncementBar, Header, Footer, ProgressBar, ToastOutlet],
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <app-progress-bar [active]="isBusy()" />
    <a href="#main" class="skip-link">{{ 'a11y.skipToContent' | translate }}</a>
    <app-announcement-bar />
    <app-header />
    <main id="main" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast-outlet />
  `,
})
export class App {
  private readonly loading = inject(LoadingService);
  private readonly navigation = inject(NavigationEventsService);

  /** One bar for both HTTP activity and router navigations (guards, resolvers, lazy chunks). */
  protected readonly isBusy = computed(() => this.loading.isLoading() || this.navigation.isNavigating());
}
