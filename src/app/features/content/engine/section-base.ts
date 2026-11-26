import { inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

/** Shared by section components: the current language for the `localize` pipe. */
export function injectLang() {
  return inject(LanguageService).current;
}
