import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AppConfigService } from '../../../core/config/app-config.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageConfig } from './content.model';
import { SectionHost } from './section-host';
import { isVisible } from './visibility';

/** Renders the visible sections of a page config, in order. */
@Component({
  selector: 'app-page-renderer',
  imports: [SectionHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-10' },
  template: `
    @for (section of visibleSections(); track section.id) {
      <app-section-host [section]="section" />
    }
  `,
})
export class PageRenderer {
  readonly page = input.required<PageConfig>();
  private readonly auth = inject(AuthService);
  private readonly config = inject(AppConfigService);

  /** Re-evaluated when the page, login state or feature flags change. */
  protected readonly visibleSections = computed(() => {
    const ctx = {
      now: new Date(),
      isAuthenticated: this.auth.isAuthenticated(),
      isFeatureEnabled: (f: Parameters<AppConfigService['isEnabled']>[0]) => this.config.features()[f],
    };
    return this.page().sections.filter((s) => isVisible(s.visibility, ctx));
  });
}
