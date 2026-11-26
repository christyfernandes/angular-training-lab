import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Accessible loading indicator.
 *
 * Concepts: signal inputs with defaults, `computed()` for derived classes, `host` metadata
 * instead of @HostBinding.
 */
@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    class: 'inline-flex items-center gap-2 text-current',
  },
  template: `
    <span
      class="inline-block animate-spin rounded-full border-current border-r-transparent"
      [class]="sizeClass()"
      aria-hidden="true"
    ></span>
    <span class="sr-only">{{ label() }}</span>
  `,
})
export class Spinner {
  readonly size = input<SpinnerSize>('md');
  /** Text announced to screen readers. Pass a translated string from the app. */
  readonly label = input('Loading');

  protected readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'size-4 border-2';
      case 'lg':
        return 'size-10 border-4';
      default:
        return 'size-6 border-[3px]';
    }
  });
}
