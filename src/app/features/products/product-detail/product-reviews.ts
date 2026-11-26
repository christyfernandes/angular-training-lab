import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Rating } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductReview } from '../../../core/models/product.model';

/**
 * Customer reviews. Rendered inside a @defer block on the detail page, so this component's
 * code is split into its own chunk and only loaded when it scrolls into view.
 */
@Component({
  selector: 'app-product-reviews',
  imports: [DatePipe, TranslatePipe, Rating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="text-xl font-bold">{{ 'detail.reviews' | translate: { count: reviews().length } }}</h2>
    <ul class="mt-4 grid gap-3 md:grid-cols-2">
      @for (review of reviews(); track review.reviewerEmail + review.date) {
        <li class="rounded-xl border border-line bg-surface p-4">
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold">{{ review.reviewerName }}</p>
            <ui-rating [value]="review.rating" readonly [label]="'products.rating' | translate" />
          </div>
          <p class="mt-2">{{ review.comment }}</p>
          <p class="mt-2 text-sm text-fg-muted">{{ review.date | date: 'mediumDate' : undefined : locale() }}</p>
        </li>
      } @empty {
        <li class="text-fg-muted">{{ 'detail.noReviews' | translate }}</li>
      }
    </ul>
  `,
})
export class ProductReviews {
  readonly reviews = input.required<ProductReview[]>();
  readonly locale = input('en-US');
}
