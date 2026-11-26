import { afterNextRender, booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Focuses the host element once it has been rendered.
 *
 * Concepts: attribute directive, `inject(ElementRef)`, `afterNextRender()` (runs only in
 * the browser, after the DOM is painted – the safe place for DOM APIs like focus()).
 *
 * @example <input uiAutofocus /> or <input [uiAutofocus]="isNew()" />
 */
@Directive({
  selector: '[uiAutofocus]',
})
export class AutofocusDirective {
  readonly uiAutofocus = input(true, { transform: booleanAttribute });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      if (this.uiAutofocus()) {
        this.host.nativeElement.focus();
      }
    });
  }
}
