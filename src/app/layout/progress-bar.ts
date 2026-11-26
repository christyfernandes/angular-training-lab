import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indeterminate progress bar pinned to the top of the viewport. */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden',
    '[class.opacity-0]': '!active()',
    role: 'progressbar',
    '[attr.aria-hidden]': '!active()',
    'aria-label': 'Loading',
  },
  template: `<div class="bar h-full w-1/3 bg-primary"></div>`,
  styles: `
    :host { transition: opacity 200ms ease; }
    .bar { animation: slide 1.1s ease-in-out infinite; }
    @keyframes slide {
      from { transform: translateX(-100%); }
      to { transform: translateX(300%); }
    }
  `,
})
export class ProgressBar {
  readonly active = input(false, { transform: booleanAttribute });
}
