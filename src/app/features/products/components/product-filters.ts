import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductCategory, ProductSort } from '../../../core/models/product.model';

/**
 * Filter bar for the product list.
 *
 * Concepts:
 * - `model()` for the search text: the parent binds it two-way with [(search)].
 * - Plain `input()` + `output()` for category and sort: the parent owns those values
 *   (they live in the URL) and decides what to do when they change.
 * - Template reference variables (#searchBox) to read DOM values without $event casts.
 */
@Component({
  selector: 'app-product-filters',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_auto_auto]" role="search">
      <div>
        <label class="field-label" for="search">{{ 'filters.search' | translate }}</label>
        <input
          #searchBox
          id="search"
          type="search"
          class="field-input"
          [placeholder]="'filters.searchPlaceholder' | translate"
          [value]="search()"
          (input)="search.set(searchBox.value)"
        />
      </div>
      <div>
        <label class="field-label" for="category">{{ 'filters.category' | translate }}</label>
        <select #categorySelect id="category" class="field-input sm:w-52" (change)="categoryChange.emit(categorySelect.value)">
          <option value="" [selected]="!category()">{{ 'filters.allCategories' | translate }}</option>
          @for (c of categories(); track c.slug) {
            <option [value]="c.slug" [selected]="c.slug === category()">{{ c.name }}</option>
          }
        </select>
      </div>
      <div>
        <label class="field-label" for="sort">{{ 'filters.sort' | translate }}</label>
        <select #sortSelect id="sort" class="field-input sm:w-48" (change)="onSortSelected(sortSelect.value)">
          @for (option of sortOptions; track option) {
            <option [value]="option" [selected]="option === sort()">{{ 'filters.sortOptions.' + option | translate }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class ProductFilters {
  readonly search = model('');
  readonly category = input('');
  readonly sort = input<ProductSort>('relevance');
  readonly categories = input<ProductCategory[]>([]);

  readonly categoryChange = output<string>();
  readonly sortChange = output<ProductSort>();

  protected readonly sortOptions: ProductSort[] = ['relevance', 'price-asc', 'price-desc', 'rating-desc'];

  protected onSortSelected(value: string): void {
    const sort = this.sortOptions.find((option) => option === value) ?? 'relevance';
    this.sortChange.emit(sort);
  }
}
