import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { productResolver } from '../../core/resolvers/product.resolver';

/**
 * Child routes, lazy loaded as one group by `loadChildren` in app.routes.ts.
 * The parent route's canMatch guards protect everything below.
 */
export default [
  {
    path: '',
    title: 'titles.admin',
    loadComponent: () => import('./admin-products'),
  },
  {
    path: 'products/new',
    title: 'titles.newProduct',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./product-editor'),
  },
  {
    path: 'products/:id/edit',
    title: 'titles.editProduct',
    resolve: { product: productResolver },
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./product-editor'),
  },
] satisfies Routes;
