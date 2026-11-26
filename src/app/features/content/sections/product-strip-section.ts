import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EMPTY_PRODUCT_PAGE, Product, ProductPage } from '../../../core/models/product.model';
import { CartStore } from '../../../core/services/cart.store';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { ProductCard } from '../../products/components/product-card';
import { ProductStripSection } from '../engine/content.model';
import { injectLang } from '../engine/section-base';
import { ContentAction } from './content-action';

/**
 * Config-driven layout + live API data: the JSON decides WHICH products (category, search,
 * sort, limit); httpResource fetches them; the existing ProductCard renders them.
 */
@Component({
  selector: 'app-product-strip-section',
  imports: [TranslatePipe, LocalizePipe, ProductCard, ContentAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = section();
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h2 class="text-2xl font-bold">{{ s.title | localize: lang() }}</h2>
      @if (s.seeAll) {
        <app-content-action [action]="s.seeAll" size="sm" />
      }
    </div>
    @if (products.error()) {
      <p class="text-fg-muted">{{ 'products.loadErrorBody' | translate }}</p>
    } @else if (products.isLoading() && products.value().products.length === 0) {
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (i of placeholders(); track i) {
          <div class="skeleton aspect-[3/4]"></div>
        }
      </div>
    } @else {
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (product of products.value().products; track product.id) {
          <app-product-card [product]="product" [locale]="locale()" (addToCart)="add($event)" />
        }
      </div>
    }
  `,
})
export class ProductStripSectionView {
  readonly section = input.required<ProductStripSection>();
  protected readonly lang = injectLang();
  protected readonly locale = inject(LanguageService).locale;
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  private readonly limit = computed(() => Math.min(Math.max(this.section().query.limit ?? 4, 1), 12));
  protected readonly placeholders = computed(() => Array.from({ length: this.limit() }, (_, i) => i));

  protected readonly products = httpResource<ProductPage>(
    () => {
      const q = this.section().query;
      return this.productService.listRequest({
        search: q.search ?? '',
        category: q.category ?? '',
        sort: q.sort ?? 'relevance',
        page: 1,
        pageSize: this.limit(),
      });
    },
    { defaultValue: EMPTY_PRODUCT_PAGE },
  );

  protected add(product: Product): void {
    this.cart.add(product);
    this.notifications.success(this.translate.instant('cart.added', { title: product.title }));
  }
}
