import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Surface container with three projection slots.
 *
 * Concepts: multi-slot content projection using `select`, boolean inputs, host class bindings.
 *
 * @example
 * <ui-card>
 *   <h3 uiCardHeader>Title</h3>
 *   Body content goes into the default slot.
 *   <div uiCardFooter><button uiButton>Action</button></div>
 * </ui-card>
 */
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content select="[uiCardMedia]" />
    <div class="flex flex-1 flex-col gap-3" [class.p-5]="padded()">
      <ng-content select="[uiCardHeader]" />
      <div class="flex-1">
        <ng-content />
      </div>
      <ng-content select="[uiCardFooter]" />
    </div>
  `,
})
export class Card {
  readonly padded = input(true, { transform: booleanAttribute });
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () =>
      'flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-fg' +
      (this.interactive() ? ' transition-[border-color,box-shadow] hover:border-primary hover:shadow-md' : ''),
  );
}
