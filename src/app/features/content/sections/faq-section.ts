import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { FaqSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';

/** Native <details>/<summary>: keyboard and screen-reader support with zero JavaScript. */
@Component({
  selector: 'app-faq-section',
  imports: [LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    <div class="max-w-3xl">
      @if (s.title) {
        <h2 class="mb-4 text-2xl font-bold">{{ s.title | localize: lang() }}</h2>
      }
      <div class="divide-y divide-line rounded-xl border border-line bg-surface">
        @for (item of s.items; track $index) {
          <details class="group px-5 py-4">
            <summary class="cursor-pointer list-none font-semibold marker:hidden">
              <span class="mr-2 inline-block text-primary transition-transform group-open:rotate-90" aria-hidden="true">›</span>
              {{ item.question | localize: lang() }}
            </summary>
            <p class="mt-2 pl-5 text-fg-muted">{{ item.answer | localize: lang() }}</p>
          </details>
        }
      </div>
    </div>
  `,
})
export class FaqSectionView {
  readonly section = input.required<FaqSection>();
  protected readonly lang = injectLang();
}
