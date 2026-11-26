import { Routes } from '@angular/router';
import LabLayout from './lab-layout';

/**
 * Nested routes: LabLayout renders a side menu and its own <router-outlet /> for children.
 */
export default [
  {
    path: '',
    component: LabLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'signals' },
      { path: 'signals', title: 'titles.labSignals', loadComponent: () => import('./signals-demo') },
      { path: 'bindings', title: 'titles.labBindings', loadComponent: () => import('./bindings-demo') },
      { path: 'lifecycle', title: 'titles.labLifecycle', loadComponent: () => import('./lifecycle-demo') },
      { path: 'pipes', title: 'titles.labPipes', loadComponent: () => import('./pipes-demo') },
      { path: 'di', title: 'titles.labDi', loadComponent: () => import('./di-demo') },
      { path: 'startup', title: 'titles.labStartup', loadComponent: () => import('./startup-demo') },
    ],
  },
] satisfies Routes;
