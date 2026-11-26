import { inject, Service } from '@angular/core';
import { CartStore, unitPrice } from '../../core/services/cart.store';

/**
 * A "heavy" service we do not want in the main bundle.
 * di-demo.ts loads it on demand with injectAsync(), so its code is a separate chunk.
 */
@Service()
export class ReportExporter {
  private readonly cart = inject(CartStore);

  cartAsCsv(): string {
    const header = 'product_id,title,quantity,unit_price';
    const rows = this.cart.items().map((i) => `${i.productId},"${i.title.replaceAll('"', '""')}",${i.quantity},${unitPrice(i)}`);
    return [header, ...rows].join('\n');
  }
}

export default ReportExporter;
