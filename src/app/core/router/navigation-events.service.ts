import { inject, isDevMode, Service } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * Hooks into the router's navigation lifecycle.
 *
 * Router events in order: NavigationStart → RoutesRecognized → GuardsCheckStart/End →
 * ResolveStart/End → ActivationEnd → NavigationEnd (or NavigationCancel / NavigationError).
 *
 * Concepts: `router.events` is an Observable; `toSignal()` converts it for templates;
 * `takeUntilDestroyed()` cleans up subscriptions.
 */
@Service()
export class NavigationEventsService {
  private readonly router = inject(Router);

  /** True while a navigation (including guards and resolvers) is in progress. */
  readonly isNavigating = toSignal(
    this.router.events.pipe(
      filter(isBoundaryEvent),
      map((event) => event instanceof NavigationStart),
    ),
    { initialValue: false },
  );

  constructor() {
    // A typical "page view" hook – swap console.debug for your analytics call.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        if (isDevMode()) console.debug('[page view]', event.urlAfterRedirects);
      });
  }
}

function isBoundaryEvent(event: Event): boolean {
  return (
    event instanceof NavigationStart ||
    event instanceof NavigationEnd ||
    event instanceof NavigationCancel ||
    event instanceof NavigationError
  );
}
