import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ContentService } from './engine/content.service';
import { PageRenderer } from './engine/page-renderer';
import { parsePageConfig } from './engine/parse-page';

/**
 * Embeds a config-driven block inside a hand-built page:
 *   <app-content-region slug="home-promos" />
 * Marketing changes the promos JSON; developers never touch home.html for it.
 * If the JSON is missing or broken, the region renders nothing and the page still works.
 */
@Component({
  selector: 'app-content-region',
  imports: [PageRenderer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page.hasValue()) {
      <app-page-renderer [page]="page.value()" />
    }
  `,
})
export class ContentRegion {
  readonly slug = input.required<string>();
  private readonly content = inject(ContentService);
  protected readonly page = httpResource(() => this.content.pageRequest(this.slug()), {
    parse: (raw) => parsePageConfig(raw),
  });
}
