import { Service, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * App-wide toast messages.
 *
 * Concept: a "signal store" – private writable signal, public read-only view, and methods
 * that are the only way to change state. Components can read but never mutate directly.
 */
@Service()
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private show(message: string, kind: ToastKind, durationMs = 4000): void {
    const toast: Toast = { id: this.nextId++, kind, message };
    // Keep at most 4 toasts on screen.
    this._toasts.update((list) => [...list.slice(-3), toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }
}
