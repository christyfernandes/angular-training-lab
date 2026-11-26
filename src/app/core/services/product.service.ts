import { HttpClient, HttpContext, HttpResourceRequest } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_BASE_URL } from '../config/tokens';
import { SKIP_GLOBAL_LOADER } from '../interceptors/loading.interceptor';
import { Product, ProductCategory, ProductDraft, ProductQuery } from '../models/product.model';

/**
 * All product API knowledge lives here: URLs, query parameters and payload shapes.
 *
 * Two styles are shown on purpose:
 * 1. Request builders (`listRequest`) that components pass to `httpResource()` – reactive,
 *    signal-based fetching that re-runs when the inputs change.
 * 2. Observable methods (`getById`, `create`, `update`, `remove`) for one-off calls such as
 *    resolvers and form submissions.
 */
@Service()
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  /** Categories rarely change: fetch once and share the result (simple caching with shareReplay). */
  readonly categories$: Observable<ProductCategory[]> = this.http
    .get<ProductCategory[]>(`${this.apiBase}/products/categories`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  /**
   * Builds the request for a page of products.
   * DummyJSON cannot combine search and category, so category wins when both are set.
   */
  listRequest(query: ProductQuery): HttpResourceRequest {
    const params: Record<string, string | number> = {
      limit: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
    };

    const sort = SORTS[query.sort];
    if (sort) {
      params['sortBy'] = sort.sortBy;
      params['order'] = sort.order;
    }

    let url = `${this.apiBase}/products`;
    if (query.category) {
      url = `${this.apiBase}/products/category/${encodeURIComponent(query.category)}`;
    } else if (query.search) {
      url = `${this.apiBase}/products/search`;
      params['q'] = query.search;
    }

    return {
      url,
      params,
      // The product grid shows its own skeletons, so skip the global top loading bar.
      context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
    };
  }

  topRatedRequest(limit: number): HttpResourceRequest {
    return {
      url: `${this.apiBase}/products`,
      params: { limit, sortBy: 'rating', order: 'desc' },
    };
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiBase}/products/${id}`);
  }

  /** DummyJSON simulates writes: the response looks real but nothing is persisted. */
  create(draft: ProductDraft): Observable<Product> {
    return this.http.post<Product>(`${this.apiBase}/products/add`, draft);
  }

  update(id: number, draft: Partial<ProductDraft>): Observable<Product> {
    return this.http.put<Product>(`${this.apiBase}/products/${id}`, draft);
  }

  remove(id: number): Observable<Product & { isDeleted: boolean }> {
    return this.http.delete<Product & { isDeleted: boolean }>(`${this.apiBase}/products/${id}`);
  }
}

const SORTS: Record<ProductQuery['sort'], { sortBy: string; order: 'asc' | 'desc' } | null> = {
  relevance: null,
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating-desc': { sortBy: 'rating', order: 'desc' },
};
