import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Alert, Button, Paginator, PaginatorLabels } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { EMPTY_PRODUCT_PAGE, Product, ProductPage, ProductQuery, ProductSort } from '../../../core/models/product.model';
import { CartStore } from '../../../core/services/cart.store';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductService } from '../../../core/services/product.service';
import { toOneOf, toPage, toText } from '../../../shared/utils/route-inputs';
import { ProductCard } from '../components/product-card';
import { ProductFilters } from '../components/product-filters';

const PAGE_SIZE = 12;
const SORTS: readonly ProductSort[] = ['relevance', 'price-asc', 'price-desc', 'rating-desc'];

/**
 * Product catalogue. The URL is the single source of truth for filters:
 * /products?q=phone&sort=price-asc&page=2 can be bookmarked, shared and navigated with Back.
 *
 * Data flow:
 *   URL query params → inputs (withComponentInputBinding) → computed query
 *   → httpResource (re-fetches automatically when the query changes) → template
 */
@Component({
  selector: 'app-product-list',
  imports: [TranslatePipe, ProductCard, ProductFilters, Paginator, Alert, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.html',
})
export default class ProductList {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartStore);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly locale = inject(LanguageService).locale;

  // 1. Query params bound to inputs. Names match the URL: ?q=&category=&sort=&page=
  readonly q = input('', { transform: toText });
  readonly category = input('', { transform: toText });
  readonly sort = input<ProductSort, string | undefined>('relevance', { transform: toOneOf(SORTS, 'relevance') });
  readonly page = input(1, { transform: toPage });

  protected readonly pageSize = PAGE_SIZE;

  // 2. Local, editable copy of the search text. linkedSignal resets it whenever the URL's
  //    q changes (e.g. Back button), but the user can type freely in between.
  protected readonly searchText = linkedSignal(() => this.q());

  // 3. One object describing what to fetch.
  private readonly query = computed<ProductQuery>(() => ({
    search: this.q(),
    category: this.category(),
    sort: this.sort(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));

  // 4. Reactive data fetching: httpResource re-runs whenever query() changes and cancels
  //    the previous request (like switchMap).
  protected readonly products = httpResource<ProductPage>(() => this.productService.listRequest(this.query()), {
    defaultValue: EMPTY_PRODUCT_PAGE,
  });

  protected readonly categories = toSignal(this.productService.categories$, { initialValue: [] });

  protected readonly paginatorLabels = computed<PaginatorLabels>(() => {
    this.locale(); // re-translate when the language changes
    return {
      previous: this.translate.instant('pagination.previous'),
      next: this.translate.instant('pagination.next'),
      page: this.translate.instant('pagination.page'),
      navigation: this.translate.instant('pagination.label'),
    };
  });

  constructor() {
    // Debounce typing before touching the URL. Signals → Observable → RxJS operators.
    toObservable(this.searchText)
      .pipe(
        map((text) => text.trim()),
        debounceTime(350),
        distinctUntilChanged(),
        filter((text) => text !== this.q()),
        takeUntilDestroyed(),
      )
      .subscribe((text) => this.updateUrl({ q: text || null, category: null, page: null }, true));
  }

  protected onCategoryChange(category: string): void {
    this.updateUrl({ category: category || null, q: null, page: null });
  }

  protected onSortChange(sort: ProductSort): void {
    this.updateUrl({ sort: sort === 'relevance' ? null : sort, page: null });
  }

  protected onPageChange(page: number): void {
    this.updateUrl({ page: page === 1 ? null : page });
  }

  protected addToCart(product: Product): void {
    this.cart.add(product);
    this.notifications.success(this.translate.instant('cart.added', { title: product.title }));
  }

  protected clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  /** `null` removes a param; 'merge' keeps the others. */
  private updateUrl(params: Params, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
