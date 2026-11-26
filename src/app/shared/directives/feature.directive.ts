import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureName } from '../../core/config/app-config.model';
import { AppConfigService } from '../../core/config/app-config.service';

/**
 * Renders its template only when a feature flag is on.
 *   <section *appFeature="'productReviews'">…</section>
 */
@Directive({ selector: '[appFeature]' })
export class FeatureDirective {
  readonly appFeature = input.required<FeatureName>();
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly config = inject(AppConfigService);
  private rendered = false;

  constructor() {
    effect(() => {
      const enabled = this.config.features()[this.appFeature()];
      if (enabled && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!enabled && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
