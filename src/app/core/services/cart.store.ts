import { computed, effect, inject, Service, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';

const CART_KEY = 'cart.items';

export function unitPrice(item: Pick<CartItem, 'price' | 'discountPercentage'>): number {
  return Math.round(item.price * (1 - item.discountPercentage / 100) * 100) / 100;
}

/**
 * Shopping cart state – a small signal-based store, no library needed.
 *
 * Concepts:
 * - Immutable updates with `signal.update()` (always return a new array).
 * - Many `computed()` values derived from one source of truth.
 * - `effect()` to persist to storage whenever items change.
 */
@Service()
export class CartStore {
  private readonly storage = inject(StorageService);
  private readonly _items = signal<CartItem[]>(this.storage.get<CartItem[]>(CART_KEY) ?? []);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);
  readonly subtotal = computed(() => round(this._items().reduce((sum, i) => sum + i.price * i.quantity, 0)));
  readonly total = computed(() => round(this._items().reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0)));
  readonly savings = computed(() => round(this.subtotal() - this.total()));

  constructor() {
    effect(() => this.storage.set(CART_KEY, this._items()));
  }

  add(product: Product, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        return items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      const item: CartItem = {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        quantity,
      };
      return [...items, item];
    });
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update((items) => items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
