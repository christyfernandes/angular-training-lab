import { ChangeDetectionStrategy, Component, computed, input, model, numberAttribute } from '@angular/core';

export interface PaginatorLabels {
  previous: string;
  next: string;
  /** Used for aria-labels, e.g. "Page 3". */
  page: string;
  /** Used for the nav landmark. */
  navigation: string;
}

const DEFAULT_LABELS: PaginatorLabels = {
  previous: 'Previous',
  next: 'Next',
  page: 'Page',
  navigation: 'Pagination',
};

/**
 * Page navigation.
 *
 * Concepts:
 * - `model()` creates a two-way bindable input: `[(page)]="page"` OR `[page]="p" (pageChange)="..."`.
 * - The library is translation-agnostic: the app passes translated `labels`.
 * - `computed()` derives the visible page window from inputs.
 */
@Component({
  selector: 'ui-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav [attr.aria-label]="labels().navigation" class="flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" class="pager-btn" [disabled]="page() <= 1" (click)="go(page() - 1)">
          {{ labels().previous }}
        </button>

        @for (item of window(); track $index) {
          @if (item === null) {
            <span class="px-1 text-fg-muted" aria-hidden="true">…</span>
          } @else {
            <button
              type="button"
              class="pager-btn min-w-10"
              [class.pager-current]="item === page()"
              [attr.aria-current]="item === page() ? 'page' : null"
              [attr.aria-label]="labels().page + ' ' + item"
              (click)="go(item)"
            >
              {{ item }}
            </button>
          }
        }

        <button type="button" class="pager-btn" [disabled]="page() >= totalPages()" (click)="go(page() + 1)">
          {{ labels().next }}
        </button>
      </nav>
    }
  `,
  styles: `
    .pager-btn {
      height: 2.5rem;
      padding-inline: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--app-line);
      background: var(--app-surface);
      color: var(--app-fg);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .pager-btn:hover:not(:disabled) { background: var(--app-surface-muted); }
    .pager-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pager-current,
    .pager-current:hover:not(:disabled) {
      background: var(--app-primary);
      border-color: var(--app-primary);
      color: var(--app-on-primary);
    }
  `,
})
export class Paginator {
  readonly total = input.required({ transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });
  readonly labels = input<PaginatorLabels>(DEFAULT_LABELS);

  /** Current page (1-based). Two-way bindable. */
  readonly page = model(1);

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  /** Pages to render, with `null` standing for an ellipsis: 1 … 4 5 6 … 20 */
  protected readonly window = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    const pages: (number | null)[] = [1];
    if (start > 2) pages.push(null);
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push(null);
    pages.push(total);
    return pages;
  });

  protected go(target: number): void {
    const next = Math.min(Math.max(1, target), this.totalPages());
    if (next !== this.page()) {
      this.page.set(next); // also emits (pageChange)
    }
  }
}
