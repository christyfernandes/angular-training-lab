import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '../core/services/notification.service';

/** Renders NotificationService toasts. `aria-live` makes screen readers announce them. */
@Component({
  selector: 'app-toast-outlet',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      aria-live="polite"
    >
      @for (toast of notifications.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-sm text-fg shadow-lg"
          [class.border-success]="toast.kind === 'success'"
          [class.border-danger]="toast.kind === 'error'"
          [class.border-line]="toast.kind === 'info'"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        >
          <span
            class="mt-1 size-2 shrink-0 rounded-full"
            [class.bg-success]="toast.kind === 'success'"
            [class.bg-danger]="toast.kind === 'error'"
            [class.bg-primary]="toast.kind === 'info'"
            aria-hidden="true"
          ></span>
          <p class="flex-1">{{ toast.message }}</p>
          <button
            type="button"
            class="text-fg-muted hover:text-fg"
            [attr.aria-label]="'common.dismiss' | translate"
            (click)="notifications.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastOutlet {
  protected readonly notifications = inject(NotificationService);
}
