import { DOCUMENT, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/** Any routed component that can hold unsaved work implements this. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Asks before leaving a page with unsaved edits.
 * Concept: CanDeactivateFn<T> receives the component instance, typed by the interface.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  const message = inject(TranslateService).instant('editor.confirmLeave');
  return inject(DOCUMENT).defaultView?.confirm(message) ?? true;
};
