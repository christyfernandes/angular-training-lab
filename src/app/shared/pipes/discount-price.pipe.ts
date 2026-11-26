import { Pipe, PipeTransform } from '@angular/core';

/**
 * Applies a percentage discount: {{ product.price | discountPrice: product.discountPercentage }}
 *
 * Chain it with the built-in currency pipe for display:
 * {{ product.price | discountPrice: product.discountPercentage | currency: 'USD' : 'symbol' : '1.2-2' : locale() }}
 */
@Pipe({ name: 'discountPrice' })
export class DiscountPricePipe implements PipeTransform {
  transform(price: number, discountPercentage = 0): number {
    const pct = Math.min(Math.max(discountPercentage, 0), 100);
    return Math.round(price * (1 - pct / 100) * 100) / 100;
  }
}
