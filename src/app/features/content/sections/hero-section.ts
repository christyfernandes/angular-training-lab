import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { HeroSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';
import { ContentAction } from './content-action';

/** Every section component has the same contract: one `section` input with its JSON. */
@Component({
  selector: 'app-hero-section',
  imports: [LocalizePipe, ContentAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    <div class="grid items-center gap-8 rounded-2xl bg-primary px-6 py-10 text-on-primary sm:px-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 class="text-4xl font-extrabold leading-tight sm:text-5xl">{{ s.title | localize: lang() }}</h1>
        @if (s.body) {
          <p class="mt-4 max-w-xl text-lg leading-relaxed opacity-90">{{ s.body | localize: lang() }}</p>
        }
        @if (s.actions?.length) {
          <div class="mt-6 flex flex-wrap gap-3">
            @for (action of s.actions; track $index) {
              <app-content-action [action]="action" size="lg" />
            }
          </div>
        }
      </div>
      @if (s.image) {
        <img [src]="s.image" alt="" class="hidden max-h-64 w-full rounded-xl bg-surface object-contain p-4 lg:block" />
      }
    </div>
  `,
})
export class HeroSectionView {
  readonly section = input.required<HeroSection>();
  protected readonly lang = injectLang();
}
