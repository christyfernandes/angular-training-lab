import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert, Badge, Button, Paginator, Spinner } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EMPTY_PRODUCT_PAGE, Product, ProductPage } from '../../core/models/product.model';
import { LanguageService } from '../../core/services/language.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';

const PAGE_SIZE = 10;

/**
 * Admin product table.
 *
 * Unlike the public catalogue (state in the URL), paging here is local component state:
 * a plain `signal()`. Compare both approaches and when each makes sense.
 */
@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, CurrencyPipe, TranslatePipe, Alert, Badge, Button, Paginator, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-products.html',
})
export default class AdminProducts {
  private readonly productService = inject(ProductService);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  protected readonly locale = inject(LanguageService).locale;

  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly deletingId = signal<number | null>(null);

  protected readonly products = httpResource<ProductPage>(
    () => this.productService.listRequest({ search: '', category: '', sort: 'relevance', page: this.page(), pageSize: PAGE_SIZE }),
    { defaultValue: EMPTY_PRODUCT_PAGE },
  );

  protected readonly paginatorLabels = computed(() => {
    this.locale();
    return {
      previous: this.translate.instant('pagination.previous'),
      next: this.translate.instant('pagination.next'),
      page: this.translate.instant('pagination.page'),
      navigation: this.translate.instant('pagination.label'),
    };
  });

  protected remove(product: Product): void {
    const confirmed = this.document.defaultView?.confirm(this.translate.instant('admin.confirmDelete', { title: product.title }));
    if (!confirmed) return;

    this.deletingId.set(product.id);
    this.productService.remove(product.id).subscribe({
      next: () => {
        // DummyJSON does not really delete, so update the local resource value to reflect it.
        this.products.update((page) => ({
          ...page,
          products: page.products.filter((p) => p.id !== product.id),
          total: page.total - 1,
        }));
        this.notifications.success(this.translate.instant('admin.deleted', { title: product.title }));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }
}
