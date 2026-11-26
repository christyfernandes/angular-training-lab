import { Injectable, signal } from '@angular/core';

/**
 * Shared log for the lifecycle demo.
 *
 * Not @Service(): this class is provided in the demo component's `providers`, so each demo
 * page gets a fresh instance that its children share (hierarchical DI).
 */
@Injectable()
export class LifecycleLog {
  private readonly _entries = signal<string[]>([]);
  readonly entries = this._entries.asReadonly();
  private counter = 0;

  add(message: string): void {
    const line = `${String(++this.counter).padStart(2, '0')}  ${message}`;
    // Deferred to a microtask so logging from inside a lifecycle hook never changes
    // parent template data in the middle of change detection.
    queueMicrotask(() => this._entries.update((entries) => [...entries.slice(-30), line]));
  }

  clear(): void {
    this.counter = 0;
    this._entries.set([]);
  }
}
