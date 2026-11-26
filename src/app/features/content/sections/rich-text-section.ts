import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { RichTextSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';

/**
 * Plain paragraphs only. Rendering author-supplied HTML with [innerHTML] invites XSS;
 * if you need rich formatting, use a vetted Markdown renderer and keep Angular's sanitizer on.
 */
@Component({
  selector: 'app-rich-text-section',
  imports: [LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    <div class="max-w-3xl">
      @if (s.title) {
        <h2 class="text-2xl font-bold">{{ s.title | localize: lang() }}</h2>
      }
      @for (p of s.paragraphs; track $index) {
        <p class="mt-3 text-lg leading-relaxed text-fg-muted">{{ p | localize: lang() }}</p>
      }
    </div>
  `,
})
export class RichTextSectionView {
  readonly section = input.required<RichTextSection>();
  protected readonly lang = injectLang();
}
