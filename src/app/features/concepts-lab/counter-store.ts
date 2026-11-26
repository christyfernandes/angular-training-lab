import { Injectable, Service, signal } from '@angular/core';

/** Provided per component (see di-demo.ts `providers`), so each panel has its own count. */
@Injectable()
export class LocalCounter {
  readonly value = signal(0);
  readonly id = Math.random().toString(36).slice(2, 6);
  increment(): void {
    this.value.update((v) => v + 1);
  }
}

/** A root singleton: every panel injects the same instance. */
@Service()
export class SharedCounter {
  readonly value = signal(0);
  readonly id = Math.random().toString(36).slice(2, 6);
  increment(): void {
    this.value.update((v) => v + 1);
  }
}
