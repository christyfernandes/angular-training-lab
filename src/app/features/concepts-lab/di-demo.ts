import { ChangeDetectionStrategy, Component, inject, InjectionToken, injectAsync, signal } from '@angular/core';
import { Button } from '@lab/ui-kit';
import { API_BASE_URL } from '../../core/config/tokens';
import { LocalCounter, SharedCounter } from './counter-store';
import { DemoPanel } from './demo-panel';

/** A token with a default factory: no provider needed unless you want to override it. */
export const TRAINING_GREETING = new InjectionToken<string>('TRAINING_GREETING', {
  providedIn: 'root',
  factory: () => 'Welcome to dependency injection',
});

/** Optional token that nobody provides. */
export const FEATURE_FLAGS = new InjectionToken<Record<string, boolean>>('FEATURE_FLAGS');

/** One panel. Its `providers` create a NEW LocalCounter for each <app-counter-panel>. */
@Component({
  selector: 'app-counter-panel',
  imports: [Button],
  providers: [LocalCounter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-line p-4">
      <p class="font-semibold">Panel</p>
      <p class="mt-2 text-sm">Local counter <code>#{{ local.id }}</code>: <strong>{{ local.value() }}</strong></p>
      <p class="text-sm">Shared counter <code>#{{ shared.id }}</code>: <strong>{{ shared.value() }}</strong></p>
      <div class="mt-3 flex gap-2">
        <button uiButton size="sm" variant="secondary" type="button" (click)="local.increment()">+ local</button>
        <button uiButton size="sm" variant="secondary" type="button" (click)="shared.increment()">+ shared</button>
      </div>
    </div>
  `,
})
export class CounterPanel {
  protected readonly local = inject(LocalCounter);
  protected readonly shared = inject(SharedCounter);
}

@Component({
  selector: 'app-di-demo',
  imports: [DemoPanel, CounterPanel, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <app-demo-panel heading="1. Hierarchical injectors" file="di-demo.ts, counter-store.ts">
        <p class="mb-4 text-sm text-fg-muted">
          Each panel provides its own LocalCounter (different ids). SharedCounter is a root singleton (same id everywhere).
        </p>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-counter-panel />
          <app-counter-panel />
        </div>
      </app-demo-panel>

      <app-demo-panel heading="2. InjectionTokens and optional dependencies" file="di-demo.ts, core/config/tokens.ts">
        <ul class="list-disc space-y-1 pl-5 text-sm">
          <li><code>inject(TRAINING_GREETING)</code> → “{{ greeting }}” (from the token's factory)</li>
          <li><code>inject(API_BASE_URL)</code> → {{ apiBase }} (provided in app.config.ts)</li>
          <li><code>inject(FEATURE_FLAGS, {{ '{' }} optional: true {{ '}' }})</code> → {{ flags === null ? 'null (not provided)' : 'provided' }}</li>
        </ul>
      </app-demo-panel>

      <app-demo-panel heading="3. injectAsync() – lazy-loaded services (Angular 22)" file="di-demo.ts, report-exporter.ts">
        <p class="text-sm text-fg-muted">
          The ReportExporter code is downloaded only when you click. Watch the Network tab.
        </p>
        <button uiButton type="button" class="mt-3" [loading]="exporting()" (click)="exportCart()">Export cart as CSV</button>
        @if (csv()) {
          <pre class="mt-3 max-h-48 overflow-auto rounded-lg bg-surface-muted p-3 text-xs">{{ csv() }}</pre>
        }
      </app-demo-panel>
    </div>
  `,
})
export default class DiDemo {
  protected readonly greeting = inject(TRAINING_GREETING);
  protected readonly apiBase = inject(API_BASE_URL);
  protected readonly flags = inject(FEATURE_FLAGS, { optional: true });

  /** Returns a function; calling it loads the chunk (once) and resolves the service instance. */
  private readonly loadExporter = injectAsync(() => import('./report-exporter'));

  protected readonly exporting = signal(false);
  protected readonly csv = signal('');

  protected async exportCart(): Promise<void> {
    this.exporting.set(true);
    try {
      const exporter = await this.loadExporter();
      this.csv.set(exporter.cartAsCsv());
    } finally {
      this.exporting.set(false);
    }
  }
}
