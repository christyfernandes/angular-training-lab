import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge, Button, Rating } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../../core/services/cart.store';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FeatureDirective } from '../../../shared/directives/feature.directive';
import { DiscountPricePipe } from '../../../shared/pipes/discount-price.pipe';
import { ProductReviews } from './product-reviews';

/**
 * Product page.
 *
 * Concepts:
 * - `product` is provided by productResolver and bound as an input by the router.
 * - `linkedSignal()` for state that must reset when the product changes (selected image,
 *   quantity) but can still be changed by the user.
 * - `@defer (on viewport)` lazy-loads the reviews section.
 */
@Component({
  selector: 'app-product-detail',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe, DecimalPipe, TranslatePipe, Badge, Button, Rating, DiscountPricePipe, ProductReviews, FeatureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.html',
})
export default class ProductDetail {
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly locale = inject(LanguageService).locale;

  /** From `resolve: { product: productResolver }` in app.routes.ts */
  readonly product = input.required<Product>();

  protected readonly gallery = computed(() => {
    const p = this.product();
    return p.images.length > 0 ? p.images : [p.thumbnail];
  });

  /** Resets to the first image whenever the product input changes. */
  protected readonly selectedImage = linkedSignal(() => this.gallery()[0]);

  /** Resets to the minimum order quantity whenever the product changes. */
  protected readonly quantity = linkedSignal(() => this.product().minimumOrderQuantity ?? 1);

  protected readonly inStock = computed(() => this.product().stock > 0);

  protected changeQuantity(delta: number): void {
    const min = this.product().minimumOrderQuantity ?? 1;
    this.quantity.update((q) => Math.min(Math.max(min, q + delta), this.product().stock));
  }

  protected addToCart(): void {
    const product = this.product();
    this.cart.add(product, this.quantity());
    this.notifications.success(this.translate.instant('cart.added', { title: product.title }));
  }
}
