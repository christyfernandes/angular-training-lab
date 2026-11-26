import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EMPTY_PRODUCT_PAGE, Product, ProductPage } from '../../core/models/product.model';
import { CartStore } from '../../core/services/cart.store';
import { LanguageService } from '../../core/services/language.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../products/components/product-card';

/** Top-rated products. Loaded lazily from the home page through @defer. */
@Component({
  selector: 'app-featured-products',
  imports: [TranslatePipe, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products.error()) {
      <p class="text-fg-muted">{{ 'products.loadErrorBody' | translate }}</p>
    } @else {
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (product of products.value().products; track product.id) {
          <app-product-card [product]="product" [locale]="locale()" (addToCart)="add($event)" />
        }
      </div>
    }
  `,
})
export class FeaturedProducts {
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly productService = inject(ProductService);
  protected readonly locale = inject(LanguageService).locale;

  // Note: inject() must run in the field initializer, NOT inside the reactive callback below,
  // because the callback runs later, outside the injection context.
  protected readonly products = httpResource<ProductPage>(() => this.productService.topRatedRequest(4), {
    defaultValue: EMPTY_PRODUCT_PAGE,
  });

  protected add(product: Product): void {
    this.cart.add(product);
    this.notifications.success(this.translate.instant('cart.added', { title: product.title }));
  }
}
