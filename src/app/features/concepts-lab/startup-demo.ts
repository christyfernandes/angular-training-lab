import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Badge } from '@lab/ui-kit';
import { FeatureName } from '../../core/config/app-config.model';
import { AppConfigService } from '../../core/config/app-config.service';
import { AppInitService } from '../../core/startup/app-init.service';
import { DemoPanel } from './demo-panel';

/** Shows what happened during startup: each step, its timing, and the config that was loaded. */
@Component({
  selector: 'app-startup-demo',
  imports: [DemoPanel, Badge, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <app-demo-panel heading="1. Startup sequence (provideAppInitializer)" file="core/startup/app-init.service.ts">
        <p class="text-sm text-fg-muted">Angular waited {{ init.totalMs() }} ms for these steps before rendering the first screen.</p>
        <ol class="mt-3 divide-y divide-line rounded-lg border border-line">
          @for (step of init.steps(); track step.name; let i = $index) {
            <li class="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <span class="w-5 text-fg-muted">{{ i + 1 }}</span>
              <span class="flex-1 font-semibold">{{ step.name }}</span>
              <span class="text-fg-muted">{{ step.detail }}</span>
              <ui-badge [tone]="step.status === 'ok' ? 'success' : 'danger'">{{ step.status }}</ui-badge>
              <span class="w-14 text-right tabular-nums text-fg-muted">{{ step.durationMs }} ms</span>
            </li>
          }
        </ol>
      </app-demo-panel>

      <app-demo-panel heading="2. Runtime config and feature flags" file="public/config/app-config.json, core/config/*">
        <p class="text-sm">
          Source: <ui-badge [tone]="config.source() === 'remote' ? 'success' : 'warning'">{{ config.source() }}</ui-badge>
          Edit <code>public/config/app-config.json</code> and reload – no rebuild needed.
        </p>
        @if (config.warnings().length) {
          <ul class="mt-2 list-disc pl-5 text-sm text-warning">
            @for (w of config.warnings(); track $index) { <li>{{ w }}</li> }
          </ul>
        }
        <div class="mt-3 flex flex-wrap gap-2">
          @for (name of featureNames; track name) {
            <ui-badge [tone]="config.features()[name] ? 'success' : 'neutral'">{{ name }}: {{ config.features()[name] ? 'on' : 'off' }}</ui-badge>
          }
        </div>
        <pre class="mt-3 max-h-72 overflow-auto rounded-lg bg-surface-muted p-3 text-xs">{{ config.config() | json }}</pre>
      </app-demo-panel>
    </div>
  `,
})
export default class StartupDemo {
  protected readonly init = inject(AppInitService);
  protected readonly config = inject(AppConfigService);
  protected readonly featureNames = Object.keys(this.config.features()) as FeatureName[];
}
