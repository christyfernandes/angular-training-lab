import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Button } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { pickLocalized } from '../../core/models/localized-text';
import { ContentService } from './engine/content.service';
import { PageRenderer } from './engine/page-renderer';
import { parsePageConfig } from './engine/parse-page';
import { injectLang } from './engine/section-base';

/**
 * Route: /pages/:slug → public/content/pages/<slug>.json
 *
 * Editors add or change pages by editing JSON; no rebuild needed. `parse` validates the JSON
 * inside httpResource, so `value()` is always a well-formed PageConfig.
 */
@Component({
  selector: 'app-content-page',
  imports: [RouterLink, TranslatePipe, Button, PageRenderer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page.error()) {
      <section class="mx-auto max-w-lg py-16 text-center">
        <h1 class="text-2xl font-bold">{{ 'content.notFoundTitle' | translate }}</h1>
        <p class="mt-2 text-fg-muted">{{ 'content.notFoundBody' | translate }}</p>
        <a uiButton routerLink="/" class="mt-6">{{ 'notFound.home' | translate }}</a>
      </section>
    } @else if (page.hasValue()) {
      <app-page-renderer [page]="page.value()" />
    } @else {
      <div class="flex flex-col gap-6">
        <div class="skeleton h-56"></div>
        <div class="skeleton h-40"></div>
      </div>
    }
  `,
})
export default class ContentPage {
  /** From the :slug route param via component input binding. */
  readonly slug = input.required<string>();

  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private readonly lang = injectLang();

  protected readonly page = httpResource(() => this.content.pageRequest(this.slug()), {
    parse: (raw) => parsePageConfig(raw),
  });

  constructor() {
    // The page title comes from the JSON, in the current language.
    effect(() => {
      if (this.page.hasValue()) {
        const pageTitle = pickLocalized(this.page.value().title, this.lang());
        this.title.setTitle(`${pageTitle} | ${this.translate.instant('app.name')}`);
      }
    });
  }
}
