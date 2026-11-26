import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-fg-muted',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent text-on-accent',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
};

/** Small status label. Concepts: union-typed inputs, a lookup table + computed for styling. */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `<ng-content />`,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(
    () => `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[this.tone()]}`,
  );
}
