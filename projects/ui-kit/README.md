# @lab/ui-kit

Reusable, theme-aware UI building blocks for the Karkhana training app.

| Export | Kind | Shows you how to… |
| --- | --- | --- |
| `Button` (`button[uiButton]`, `a[uiButton]`) | Component | Style native elements with an attribute selector, `booleanAttribute` inputs, host class bindings |
| `Card` (`ui-card`) | Component | Build multi-slot content projection (`uiCardMedia`, `uiCardHeader`, default, `uiCardFooter`) |
| `Badge`, `Alert`, `Spinner` | Components | Use union-typed inputs, `output()`, accessible roles |
| `Paginator` (`ui-paginator`) | Component | Use `model()` for two-way binding, accept translated labels from the app |
| `Rating` (`ui-rating`) | Component | Switch between read-only display and an accessible radio-group input |
| `TruncatePipe` (`truncate`) | Pipe | Write a pure pipe |
| `AutofocusDirective` (`uiAutofocus`) | Directive | Use `afterNextRender` for DOM work |

## The token contract

The library ships **no colours of its own**. It uses semantic Tailwind classes such as `bg-surface`, `text-fg-muted`,
`border-line` and `bg-primary`. The consuming app defines those tokens (see `src/styles.css`). Change the tokens and every
component follows, including in dark mode.

## Building

```bash
npm run build:lib     # → dist/ui-kit, ready to publish to a private registry
npm run test:lib
```

Inside this workspace the app imports the library **from source** through the `@lab/ui-kit` path in `tsconfig.json`, so
changes show up immediately while `ng serve` runs, and Tailwind sees the library's classes.
