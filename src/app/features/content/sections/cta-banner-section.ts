import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { CtaBannerSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';
import { ContentAction } from './content-action';

@Component({
  selector: 'app-cta-banner-section',
  imports: [LocalizePipe, ContentAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    <div
      class="flex flex-col items-start justify-between gap-4 rounded-2xl border px-6 py-6 sm:flex-row sm:items-center"
      [class.border-primary]="s.tone !== 'accent'"
      [class.bg-primary-soft]="s.tone !== 'accent'"
      [class.border-accent]="s.tone === 'accent'"
      [class.bg-accent]="s.tone === 'accent'"
      [class.text-on-accent]="s.tone === 'accent'"
    >
      <div>
        <h2 class="text-xl font-bold">{{ s.title | localize: lang() }}</h2>
        @if (s.body) {
          <p class="mt-1 opacity-90">{{ s.body | localize: lang() }}</p>
        }
      </div>
      <app-content-action [action]="s.action" />
    </div>
  `,
})
export class CtaBannerSectionView {
  readonly section = input.required<CtaBannerSection>();
  protected readonly lang = injectLang();
}
