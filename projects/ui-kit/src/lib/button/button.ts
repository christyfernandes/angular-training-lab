import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Spinner } from '../spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-55 select-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'border border-line bg-surface text-fg hover:bg-surface-muted',
  ghost: 'text-fg hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-[0.95rem]',
  lg: 'h-12 px-6 text-base',
};

/**
 * Button styling applied to native <button> and <a> elements.
 *
 * Why an attribute selector? `<button uiButton>` keeps the real <button> in the DOM, so
 * keyboard support, `type="submit"`, `disabled`, and routerLink on <a> all keep working.
 *
 * Concepts: attribute selectors, `booleanAttribute` input transform, host class binding,
 * content projection with <ng-content>.
 *
 * @example <button uiButton variant="secondary" [loading]="saving()">Save</button>
 */
@Component({
  selector: 'button[uiButton], a[uiButton]',
  imports: [Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() || null',
  },
  template: `
    @if (loading()) {
      <ui-spinner size="sm" [label]="loadingLabel()" />
    }
    <ng-content />
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** `<button uiButton loading>` works because of the booleanAttribute transform. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly block = input(false, { transform: booleanAttribute });
  readonly loadingLabel = input('Loading');

  protected readonly classes = computed(() =>
    [
      BASE,
      VARIANTS[this.variant()],
      SIZES[this.size()],
      this.block() ? 'w-full' : '',
      this.loading() ? 'pointer-events-none' : '',
    ].join(' '),
  );
}
