import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Frame for one demo: a heading, the live example, and the file to read. */
@Component({
  selector: 'app-demo-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-xl border border-line bg-surface p-5' },
  template: `
    <h2 class="text-lg font-bold">{{ heading() }}</h2>
    @if (file()) {
      <p class="mt-0.5 text-xs text-fg-muted"><code>{{ file() }}</code></p>
    }
    <div class="mt-4">
      <ng-content />
    </div>
  `,
})
export class DemoPanel {
  readonly heading = input.required<string>();
  readonly file = input<string>();
}
