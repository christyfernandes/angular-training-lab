import { Directive, ElementRef, inject, output } from '@angular/core';

/**
 * Emits when the user clicks outside the host element or presses Escape.
 * Used to close menus and popovers.
 *
 * Concepts: `host` listeners on global targets (`document:click`), `output()`.
 */
@Directive({
  selector: '[appClickOutside]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'appClickOutside.emit()',
  },
})
export class ClickOutsideDirective {
  readonly appClickOutside = output<void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }
}
