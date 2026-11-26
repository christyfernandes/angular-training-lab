import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model, numberAttribute } from '@angular/core';

/**
 * Star rating that can be read-only (display) or interactive (input).
 *
 * Concepts: `model()` for two-way binding `[(value)]`, `@for` over a computed array,
 * keyboard-accessible radio-group pattern, aria attributes bound from signals.
 */
@Component({
  selector: 'ui-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-1.5',
  },
  template: `
    @if (readonly()) {
      <span class="inline-flex" role="img" [attr.aria-label]="ariaText()">
        @for (star of stars(); track star) {
          <svg viewBox="0 0 20 20" class="size-4" aria-hidden="true"
               [class.text-accent]="star <= rounded()" [class.text-line]="star > rounded()">
            <path fill="currentColor" [attr.d]="starPath" />
          </svg>
        }
      </span>
    } @else {
      <span class="inline-flex" role="radiogroup" [attr.aria-label]="label()">
        @for (star of stars(); track star) {
          <button
            type="button"
            role="radio"
            class="rounded p-0.5"
            [attr.aria-checked]="star === value()"
            [attr.aria-label]="star + ' / ' + max()"
            (click)="value.set(star)"
          >
            <svg viewBox="0 0 20 20" class="size-6" aria-hidden="true"
                 [class.text-accent]="star <= value()" [class.text-line]="star > value()">
              <path fill="currentColor" [attr.d]="starPath" />
            </svg>
          </button>
        }
      </span>
    }
    @if (showValue()) {
      <span class="text-sm font-semibold text-fg-muted">{{ value().toFixed(1) }}</span>
    }
  `,
})
export class Rating {
  readonly value = model(0);
  readonly max = input(5, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly label = input('Rating');

  protected readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
  protected readonly rounded = computed(() => Math.round(this.value()));
  protected readonly ariaText = computed(() => `${this.label()}: ${this.value().toFixed(1)} / ${this.max()}`);

  protected readonly starPath =
    'M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8L10 1.6z';
}
