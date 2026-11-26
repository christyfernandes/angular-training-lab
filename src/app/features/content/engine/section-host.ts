import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, isDevMode, resource } from '@angular/core';
import { PageSection } from './content.model';
import { SECTION_REGISTRY } from './section-registry';

/**
 * Renders ONE section: looks up its component in the registry, lazy-loads it, and creates it
 * with NgComponentOutlet, passing the section JSON as the component's `section` input.
 */
@Component({
  selector: 'app-section-host',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.id]': 'section().id', class: 'block scroll-mt-24' },
  template: `
    @if (component.value(); as cmp) {
      <ng-container *ngComponentOutlet="cmp; inputs: inputs()" />
    } @else if (component.isLoading()) {
      <div class="skeleton h-32"></div>
    } @else if (showDevNotice) {
      <p class="rounded-lg border border-dashed border-warning p-4 text-sm text-warning">
        No component registered for section type "{{ section().type }}".
      </p>
    }
  `,
})
export class SectionHost {
  readonly section = input.required<PageSection>();
  private readonly registry = inject(SECTION_REGISTRY);
  protected readonly showDevNotice = isDevMode();

  protected readonly component = resource({
    params: () => this.section().type,
    loader: async ({ params }) => (await this.registry[params]?.()) ?? null,
  });

  protected readonly inputs = computed(() => ({ section: this.section() }));
}
