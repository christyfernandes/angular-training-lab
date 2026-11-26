import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Card } from '@lab/ui-kit';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { FeatureGridSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';
import { ContentAction } from './content-action';

const COLUMNS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' } as const;

@Component({
  selector: 'app-feature-grid-section',
  imports: [Card, LocalizePipe, ContentAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    @if (s.title) {
      <h2 class="mb-5 text-2xl font-bold">{{ s.title | localize: lang() }}</h2>
    }
    <div class="grid gap-4" [class]="columnClass()">
      @for (item of s.items; track $index) {
        <ui-card>
          <h3 uiCardHeader class="text-lg font-bold">{{ item.title | localize: lang() }}</h3>
          <p class="text-fg-muted">{{ item.body | localize: lang() }}</p>
          @if (item.link) {
            <div uiCardFooter><app-content-action [action]="item.link" size="sm" /></div>
          }
        </ui-card>
      }
    </div>
  `,
})
export class FeatureGridSectionView {
  readonly section = input.required<FeatureGridSection>();
  protected readonly lang = injectLang();
  /** Tailwind needs complete class names in source, so map numbers to literal classes. */
  protected readonly columnClass = computed(() => COLUMNS[this.section().columns ?? 3]);
}
