import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedText, pickLocalized } from '../../core/models/localized-text';

/**
 * Picks the right language from content JSON: {{ section.title | localize: lang() }}
 * The language is an argument (not read inside) so the pipe can stay pure.
 */
@Pipe({ name: 'localize' })
export class LocalizePipe implements PipeTransform {
  transform(text: LocalizedText | null | undefined, lang: string): string {
    return pickLocalized(text, lang);
  }
}
