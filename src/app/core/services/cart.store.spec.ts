import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from '../config/tokens';
import { Product } from '../models/product.model';
import { CartStore } from './cart.store';

const product = (id: number, price: number, discountPercentage = 0): Product =>
  ({ id, title: `Product ${id}`, price, discountPercentage, thumbnail: '', images: [], tags: [] }) as unknown as Product;

describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    // Swap real localStorage for an in-memory fake through DI.
    const data = new Map<string, string>();
    const fakeStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    } as Storage;

    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: fakeStorage }] });
    store = TestBed.inject(CartStore);
  });

  it('starts empty', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.count()).toBe(0);
  });

  it('merges quantities when the same product is added twice', () => {
    store.add(product(1, 10));
    store.add(product(1, 10), 2);
    expect(store.items()).toHaveLength(1);
    expect(store.count()).toBe(3);
  });

  it('computes subtotal, discounted total and savings', () => {
    store.add(product(1, 100, 10), 2); // 2 × 100, 10% off
    store.add(product(2, 50)); // 1 × 50
    expect(store.subtotal()).toBe(250);
    expect(store.total()).toBe(230);
    expect(store.savings()).toBe(20);
  });

  it('removes an item when its quantity drops to zero', () => {
    store.add(product(1, 10));
    store.setQuantity(1, 0);
    expect(store.isEmpty()).toBe(true);
  });
});
