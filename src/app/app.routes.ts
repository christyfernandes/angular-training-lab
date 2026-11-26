import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { featureGuard } from './core/guards/feature.guard';
import { productResolver } from './core/resolvers/product.resolver';

/**
 * Every feature is lazy loaded: its code is downloaded the first time the route is visited.
 * `loadComponent: () => import('./x')` works without `.then(m => m.X)` because each page
 * component is the file's `export default`.
 *
 * `title` values are translation keys, resolved by TranslatedTitleStrategy.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'titles.home',
    loadComponent: () => import('./features/home/home'),
  },
  {
    // The learning path, driven by public/content/learning-path.json
    path: 'learn',
    title: 'titles.learn',
    loadComponent: () => import('./features/learn/learn-page'),
  },
  {
    path: 'learn/:stage',
    title: 'titles.learn',
    loadComponent: () => import('./features/learn/learn-page'),
  },
  {
    path: 'products',
    title: 'titles.products',
    loadComponent: () => import('./features/products/product-list/product-list'),
  },
  {
    path: 'products/:id',
    title: 'titles.productDetail',
    resolve: { product: productResolver },
    loadComponent: () => import('./features/products/product-detail/product-detail'),
  },
  {
    path: 'cart',
    title: 'titles.cart',
    loadComponent: () => import('./features/cart/cart'),
  },
  {
    path: 'login',
    title: 'titles.login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login'),
  },
  {
    path: 'account',
    title: 'titles.account',
    canMatch: [authGuard],
    loadComponent: () => import('./features/account/account'),
  },
  {
    path: 'admin',
    canMatch: [featureGuard('admin'), authGuard, roleGuard('admin', 'moderator')],
    loadChildren: () => import('./features/admin/admin.routes'),
  },
  {
    path: 'lab',
    canMatch: [featureGuard('conceptsLab')],
    loadChildren: () => import('./features/concepts-lab/lab.routes'),
  },
  {
    // Config-driven pages: public/content/pages/<slug>.json
    path: 'pages/:slug',
    title: 'titles.contentPage',
    canMatch: [featureGuard('campaignPages')],
    loadComponent: () => import('./features/content/content-page'),
  },
  {
    path: 'not-found',
    title: 'titles.notFound',
    loadComponent: () => import('./features/not-found/not-found'),
  },
  { path: '**', redirectTo: 'not-found' },
];
