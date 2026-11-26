import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

/**
 * Loads the product BEFORE the page is shown, so the component always has data.
 *
 * With `withComponentInputBinding()`, the resolved value arrives in the component as an input:
 * route `resolve: { product: productResolver }`  →  `product = input.required<Product>()`.
 *
 * Returning a RedirectCommand turns a failure into a redirect instead of a broken page.
 */
export const productResolver: ResolveFn<Product> = (route) => {
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));
  const notFound = new RedirectCommand(router.parseUrl('/not-found'), { skipLocationChange: true });

  if (!Number.isInteger(id) || id < 1) {
    return notFound;
  }

  return inject(ProductService)
    .getById(id)
    .pipe(catchError(() => of(notFound)));
};
