import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge, Button, Card, Rating, TruncatePipe } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';
import { DiscountPricePipe } from '../../../shared/pipes/discount-price.pipe';

/**
 * Presentational ("dumb") component: data in through inputs, events out through outputs.
 * It does not inject services, so it is reused in the product grid, home page and the
 * admin editor's live preview.
 */
@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe, DecimalPipe, TranslatePipe, Card, Badge, Button, Rating, TruncatePipe, DiscountPricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <ui-card interactive [padded]="false" class="h-full">
      <a uiCardMedia [routerLink]="link()" class="block bg-surface-muted" [attr.tabindex]="-1" aria-hidden="true">
        @if (p.thumbnail) {
          <img [ngSrc]="p.thumbnail" width="300" height="300" [priority]="priority()" alt="" class="aspect-square w-full object-contain p-4" />
        } @else {
          <div class="aspect-square w-full"></div>
        }
      </a>
      <div class="flex h-full flex-col gap-2 p-4">
        <div class="flex items-center gap-2">
          @if (p.discountPercentage >= 10) {
            <ui-badge tone="accent">-{{ p.discountPercentage | number: '1.0-0' }}%</ui-badge>
          }
          @if (p.stock > 0 && p.stock < 10) {
            <ui-badge tone="warning">{{ 'products.lowStock' | translate: { count: p.stock } }}</ui-badge>
          }
        </div>
        <h3 class="text-base font-bold leading-snug">
          <a [routerLink]="link()" class="hover:text-primary">{{ p.title | truncate: 48 }}</a>
        </h3>
        @if (p.brand) {
          <p class="text-sm text-fg-muted">{{ p.brand }}</p>
        }
        <ui-rating [value]="p.rating" readonly [label]="'products.rating' | translate" />
        <div class="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <div>
            <p class="text-lg font-bold">
              {{ p.price | discountPrice: p.discountPercentage | currency: 'USD' : 'symbol' : '1.2-2' : locale() }}
            </p>
            @if (hasDiscount()) {
              <p class="text-xs text-fg-muted line-through">{{ p.price | currency: 'USD' : 'symbol' : '1.2-2' : locale() }}</p>
            }
          </div>
          @if (!hideActions()) {
            <button uiButton size="sm" type="button" [disabled]="p.stock === 0" (click)="addToCart.emit(p)">
              {{ (p.stock === 0 ? 'products.soldOut' : 'products.addToCart') | translate }}
            </button>
          }
        </div>
      </div>
    </ui-card>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly locale = input('en-US');
  /** Mark above-the-fold images as priority for faster Largest Contentful Paint. */
  readonly priority = input(false, { transform: booleanAttribute });
  readonly hideActions = input(false, { transform: booleanAttribute });

  readonly addToCart = output<Product>();

  protected readonly link = computed(() => ['/products', this.product().id]);
  protected readonly hasDiscount = computed(() => this.product().discountPercentage > 0);
}
