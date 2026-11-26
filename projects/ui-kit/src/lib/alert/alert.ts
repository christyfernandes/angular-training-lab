import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<AlertTone, string> = {
  info: 'border-primary/40 bg-primary-soft',
  success: 'border-success/40 bg-success/10',
  warning: 'border-warning/40 bg-warning/10',
  danger: 'border-danger/40 bg-danger/10',
};

/**
 * Inline message with an optional dismiss button.
 *
 * Concepts: `output()` for events, `role` chosen from an input, default + named projection.
 */
@Component({
  selector: 'ui-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "tone() === 'danger' ? 'alert' : 'status'",
    '[class]': 'classes()',
  },
  template: `
    <div class="flex-1 text-sm leading-relaxed">
      @if (heading()) {
        <p class="mb-1 font-semibold text-fg">{{ heading() }}</p>
      }
      <ng-content />
    </div>
    @if (dismissible()) {
      <button
        type="button"
        class="-m-1 rounded-md p-1 text-fg-muted hover:bg-surface-muted hover:text-fg"
        [attr.aria-label]="dismissLabel()"
        (click)="dismissed.emit()"
      >
        <svg viewBox="0 0 20 20" class="size-4" aria-hidden="true" fill="currentColor">
          <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>
    }
  `,
})
export class Alert {
  readonly tone = input<AlertTone>('info');
  readonly heading = input<string>();
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input('Dismiss');

  /** Emits when the close button is clicked. The parent decides whether to hide the alert. */
  readonly dismissed = output<void>();

  protected readonly classes = computed(
    () => `flex items-start gap-3 rounded-lg border px-4 py-3 text-fg ${TONES[this.tone()]}`,
  );
}
