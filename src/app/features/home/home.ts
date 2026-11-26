import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentRegion } from '../content/content-region';
import { FeaturedProducts } from './featured-products';

interface ConceptLink {
  concept: string;
  route: string;
  file: string;
}

/**
 * Landing page. The concept map tells learners where each Angular feature is demonstrated
 * and which file to open.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe, Button, FeaturedProducts, ContentRegion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export default class Home {
  protected readonly concepts: ConceptLink[] = [
    { concept: 'The learning path itself: one JSON file drives this page and the docs', route: '/learn', file: 'public/content/learning-path.json, features/learn/*' },
    { concept: 'Signals, computed, effect, linkedSignal, resource', route: '/lab/signals', file: 'features/concepts-lab/signals-demo.ts' },
    { concept: 'Template bindings, control flow, @let', route: '/lab/bindings', file: 'features/concepts-lab/bindings-demo.ts' },
    { concept: 'Lifecycle hooks, afterNextRender, DestroyRef', route: '/lab/lifecycle', file: 'features/concepts-lab/lifecycle-demo.ts' },
    { concept: 'Built-in and custom pipes', route: '/lab/pipes', file: 'features/concepts-lab/pipes-demo.ts' },
    { concept: 'Dependency injection, providers, injectAsync', route: '/lab/di', file: 'features/concepts-lab/di-demo.ts' },
    { concept: 'httpResource, URL-driven state, debounced search', route: '/products', file: 'features/products/product-list/product-list.ts' },
    { concept: 'Resolver, linkedSignal, @defer, NgOptimizedImage', route: '/products/1', file: 'features/products/product-detail/product-detail.ts' },
    { concept: 'Signal store (cart), computed totals', route: '/cart', file: 'core/services/cart.store.ts' },
    { concept: 'Signal Forms, async submit, server errors', route: '/login', file: 'features/auth/login.ts' },
    { concept: 'Auth interceptor, authenticated httpResource', route: '/account', file: 'core/interceptors/auth.interceptor.ts' },
    { concept: 'Reactive Forms, FormArray, CanDeactivate guard', route: '/admin/products/new', file: 'features/admin/product-editor.ts' },
    { concept: 'Guards (canMatch, role factory), lazy child routes', route: '/admin', file: 'core/guards/auth.guard.ts' },
    { concept: 'Theming with Tailwind v4 tokens, dark mode', route: '/', file: 'styles.css + core/services/theme.service.ts' },
    { concept: 'Runtime translations, translated page titles', route: '/', file: 'core/services/language.service.ts' },
    { concept: 'Reusable component library', route: '/lab/bindings', file: 'projects/ui-kit/src/public-api.ts' },
    { concept: 'Startup logic: AppInitService, runtime config, feature flags', route: '/lab/startup', file: 'core/startup/app-init.service.ts' },
    { concept: 'Config-driven pages from JSON (section registry)', route: '/pages/festive-sale', file: 'features/content/engine/*' },
    { concept: 'Config-driven forms from JSON', route: '/pages/about-the-lab', file: 'features/content/engine/dynamic-form.ts' },
  ];
}
