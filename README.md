# Karkhana – Angular Training Lab

A small but complete **Angular 22** shop used as the hands-on project for the *Modern Angular for Professionals* self-paced
training. Every screen demonstrates real-world Angular features, and the home page lists which file to open for each one.

> **New to the training? Read [START-HERE.md](START-HERE.md) first**, then open **Learn** in the running app.
>
> Data comes from the free [DummyJSON](https://dummyjson.com) API. Writes (create, edit, delete) are simulated by the API.
> Demo login: **emilys / emilyspass** (admin role).

## Quick start

Requires **Node.js 22.12+**.

```bash
npm install
npm start            # http://localhost:4200
npm run test:all     # unit tests for the app and the library (Vitest)
npm run build        # production build in dist/
```

## What it covers

| Area | Where to look |
| --- | --- |
| Standalone components, signal inputs/outputs, `model()` | `features/products/components/*`, `projects/ui-kit` |
| Signals: `signal`, `computed`, `effect`, `linkedSignal`, `untracked`, `resource` | `features/concepts-lab/signals-demo.ts` |
| Control flow `@if` `@for` `@switch` `@let` `@defer` | `features/concepts-lab/bindings-demo.html`, `features/home/home.html`, product detail |
| Data fetching with `httpResource` + `HttpClient` | `core/services/product.service.ts`, `features/products/product-list/*` |
| Interceptors (loading, auth, error) + `HttpContextToken` | `core/interceptors/*` |
| Routing: lazy routes, child routes, input binding, resolvers, title strategy, router events | `app.routes.ts`, `core/router/*`, `core/resolvers/*` |
| Guards: `canMatch`, role guard factory, guest guard, `canDeactivate` | `core/guards/*` |
| Forms: **Signal Forms** (login) and **Reactive Forms** with `FormArray` (admin editor) | `features/auth/login.ts`, `features/admin/product-editor.ts` |
| Services and DI: `@Service()`, `InjectionToken`, component providers, `injectAsync` | `core/services/*`, `core/config/tokens.ts`, `features/concepts-lab/di-demo.ts` |
| State: signal store (cart, auth, toasts) | `core/services/cart.store.ts` |
| Pipes: built-in, custom, chaining, locales | `shared/pipes/*`, `features/concepts-lab/pipes-demo.ts` |
| Directives: attribute, structural, host listeners | `shared/directives/*`, `projects/ui-kit/src/lib/directives/*` |
| Lifecycle hooks, `afterNextRender`, `DestroyRef` | `features/concepts-lab/lifecycle-*.ts` |
| Theming: Tailwind v4 tokens, dark mode, three brand palettes | `src/styles.css`, `core/services/theme.service.ts` |
| Translations at runtime (English, Hindi) and translated page titles | `public/i18n/*.json`, `core/services/language.service.ts`, `core/router/translated-title.strategy.ts` |
| Reusable component library | `projects/ui-kit` |
| Startup logic: `AppInitService`, runtime config, feature flags | `core/startup/`, `core/config/`, `public/config/app-config.json`, `/lab/startup` |
| Config-driven pages, sections and forms from JSON | `features/content/`, `public/content/pages/*.json`, `/pages/festive-sale` |
| Unit tests with Vitest + TestBed | `*.spec.ts` |

## Project structure

```
src/
  styles.css              Tailwind + theme token contract
  app/
    app.config.ts         All app-wide providers (router, http, i18n, initializer)
    app.routes.ts         Lazy routes, guards, resolvers
    core/                 Singletons: services, interceptors, guards, resolvers, router hooks
    layout/               Header, footer, toasts, progress bar
    shared/               Reusable pipes, directives, helpers
    features/             One folder per page or area (each lazy loaded)
public/i18n/              Translation files
projects/ui-kit/          The @lab/ui-kit component library
```

## Startup logic

`app.config.ts` registers one initializer: `provideAppInitializer(() => inject(AppInitService).init())`. Angular waits
for it before rendering anything. `core/startup/app-init.service.ts` runs ordered, timed steps:

1. **Load runtime config** from `public/config/app-config.json` (API URL, default language and brand, feature flags,
   header links, announcement). It uses an `HttpClient` built on `HttpBackend`, so it skips the interceptors, and it
   falls back to safe defaults if the file is missing or invalid.
2. **Apply theme defaults** (a user's saved choice wins).
3. **Load translations** (saved choice → browser language → configured default).
4. **Restore the session** by validating a stored token against `/auth/me` (silently; a 401 just logs out).

Open `/lab/startup` to see each step's timing and the config that was loaded. Because the config is fetched at runtime,
the same build can run in every environment: change the JSON, reload, done.

**Feature flags** in the config switch whole areas off with `featureGuard('name')` on routes and the `*appFeature`
directive in templates.

## Config-driven content

Pages that change often (campaigns, landing pages, FAQs, surveys) are JSON files in `public/content/pages/`, rendered
by a small engine in `features/content/engine/`:

```
JSON ─▶ httpResource(parse: parsePageConfig) ─▶ isVisible(rules) ─▶ SECTION_REGISTRY[type] ─▶ lazy component
```

```json
{
  "slug": "festive-sale",
  "title": { "en": "Festive sale", "hi": "त्योहार सेल" },
  "sections": [
    { "id": "hero", "type": "hero", "title": "…", "actions": [{ "label": "Shop", "route": "/products" }] },
    { "id": "phones", "type": "product-strip", "title": "…", "query": { "category": "smartphones", "limit": 4 } },
    { "id": "members", "type": "cta-banner", "title": "…", "action": { "label": "…", "route": "/cart" },
      "visibility": { "audience": "authenticated", "until": "2027-02-01T00:00:00+05:30" } }
  ]
}
```

- Section types: `hero`, `rich-text`, `feature-grid`, `product-strip` (live API data), `cta-banner`, `faq`, `form`.
- Text can be a plain string or `{ "en": "…", "hi": "…" }`.
- `visibility` supports `from`, `until`, `audience` (`guest` / `authenticated`) and `feature`.
- `form` sections build a Reactive Forms group from field definitions (`text`, `email`, `number`, `textarea`, `select`,
  `checkbox`) with `required`, `minLength`, `maxLength`, `min`, `max` and `pattern`.
- Invalid sections are skipped with a console warning; the rest of the page still renders.

**Add a section type in four steps:** add its interface to `content.model.ts`, add a validation case in
`parse-page.ts`, create a component with a `section = input.required<YourSection>()`, and register it in
`section-registry.ts`. The renderer itself never changes.

Use it at `/pages/<slug>` for whole pages, or embed a block in any template with
`<app-content-region slug="home-promos" />`. Point `contentBaseUrl` in the config at a CMS or CDN to manage content
outside the repository.

## Conventions used here (and in the training)

- Standalone components only; no NgModules.
- `inject()` instead of constructor parameters.
- Signals for state; RxJS only for event streams (search typing, router events).
- `input()`, `output()`, `model()` instead of decorators; `host: {}` instead of `@HostBinding`/`@HostListener`.
- Built-in control flow (`@if`, `@for`) instead of `*ngIf`/`*ngFor`.
- Page components use `export default` so routes can lazy load them with `loadComponent: () => import('./x')`.
- Components never hard-code colours: only semantic tokens (`bg-surface`, `text-fg-muted`, `bg-primary`).
- Translation keys for every user-facing string in the app. (Concepts Lab demo text is English-only on purpose,
  so it matches the code it explains.)

## Notes and gotchas you will meet

- **Translations bypass interceptors** (`useHttpBackend: true` in `app.config.ts`). Without it, the error interceptor
  injecting `TranslateService` creates a circular dependency (NG0200).
- **Read `error()` before `value()`** on a resource. Reading `value()` while the resource is in an error state throws.
- **`inject()` only works in an injection context** (constructors, field initializers, factories). A reactive callback
  such as the function you pass to `httpResource()` runs later, so inject services into fields first.
- **Production builds don't inline Google Fonts** (`"fonts": false` in `angular.json`) so builds also work behind
  corporate proxies.

## The learning path (one source of truth)

`public/content/learning-path.json` defines the stages, their ordered steps (read, watch, explore, study, exercise,
self-check), the concepts each step covers, and the curated resources. Two things are built from it:

- the in-app **Learn** page (`/learn`, `features/learn/`) with per-track progress saved in the browser, and
- the Markdown in `docs/` (`learning-path/`, `CONCEPT-MAP.md`, `RESOURCES.md`) and `EXERCISES.md`, via
  `npm run docs:learning`.

Trainers change the path by editing the JSON and re-running the script; never edit the generated Markdown by hand.

## Exercises

See [EXERCISES.md](EXERCISES.md) for the week-by-week exercises, the capstone and the definition of done. Each one names the files to change and how it will be
reviewed. Work on a branch and open a pull request per exercise.
