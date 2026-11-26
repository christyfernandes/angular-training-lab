import {
  AfterViewInit,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { LifecycleLog } from './lifecycle-log';

/**
 * Logs each lifecycle step. Toggle it and change its input from the parent page.
 *
 * Order: constructor → ngOnChanges → ngOnInit → ngAfterViewInit → afterNextRender
 *        … input changes → ngOnChanges …
 *        ngOnDestroy / DestroyRef.onDestroy
 */
@Component({
  selector: 'app-lifecycle-probe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border-2 border-dashed border-primary p-4">
      <p class="font-semibold">Probe component</p>
      <p class="text-sm">Input <code>message</code>: “{{ message() }}”</p>
    </div>
  `,
})
export class LifecycleProbe implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  readonly message = input.required<string>();
  private readonly log = inject(LifecycleLog);

  constructor() {
    // Inputs are NOT available yet in the constructor.
    this.log.add('constructor – inputs not set yet');

    // Runs once, in the browser, after the component's DOM is rendered.
    afterNextRender(() => this.log.add('afterNextRender – safe to measure/focus DOM'));

    // Modern alternative to ngOnDestroy; works in services and functions too.
    inject(DestroyRef).onDestroy(() => this.log.add('DestroyRef.onDestroy'));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['message'];
    this.log.add(`ngOnChanges – message: "${change?.previousValue ?? '∅'}" → "${change?.currentValue}"`);
  }

  ngOnInit(): void {
    this.log.add(`ngOnInit – inputs ready: "${this.message()}"`);
  }

  ngAfterViewInit(): void {
    this.log.add('ngAfterViewInit – child views created');
  }

  ngOnDestroy(): void {
    this.log.add('ngOnDestroy');
  }
}
