import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from '@lab/ui-kit';
import { DemoPanel } from './demo-panel';
import { LifecycleLog } from './lifecycle-log';
import { LifecycleProbe } from './lifecycle-probe';

@Component({
  selector: 'app-lifecycle-demo',
  imports: [DemoPanel, Button, LifecycleProbe],
  // Component-level provider: this page and its children share ONE LifecycleLog instance.
  providers: [LifecycleLog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-demo-panel heading="Lifecycle hooks in order" file="lifecycle-probe.ts">
      <div class="flex flex-wrap gap-2">
        <button uiButton type="button" (click)="visible.update((v) => !v)">{{ visible() ? 'Destroy' : 'Create' }} probe</button>
        <button uiButton variant="secondary" type="button" [disabled]="!visible()" (click)="bump()">Change input</button>
        <button uiButton variant="ghost" type="button" (click)="log.clear()">Clear log</button>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          @if (visible()) {
            <app-lifecycle-probe [message]="message()" />
          } @else {
            <p class="rounded-lg border border-dashed border-line p-4 text-fg-muted">Probe destroyed.</p>
          }
        </div>
        <ol class="max-h-72 overflow-auto rounded-lg bg-surface-muted p-3 font-mono text-xs leading-relaxed" aria-live="polite">
          @for (entry of log.entries(); track $index) {
            <li>{{ entry }}</li>
          }
        </ol>
      </div>
    </app-demo-panel>
  `,
})
export default class LifecycleDemo {
  protected readonly log = inject(LifecycleLog);
  protected readonly visible = signal(true);
  protected readonly message = signal('hello');
  private version = 1;

  protected bump(): void {
    this.message.set(`hello v${++this.version}`);
  }
}
