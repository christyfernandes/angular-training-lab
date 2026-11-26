import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@lab/ui-kit';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { ActionLink } from '../engine/content.model';
import { injectLang } from '../engine/section-base';

/** A button-styled link from content JSON: in-app route or external URL. */
@Component({
  selector: 'app-content-action',
  imports: [RouterLink, Button, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let a = action();
    @if (a.route) {
      <a uiButton [variant]="a.variant ?? 'primary'" [size]="size()" [routerLink]="a.route" [queryParams]="a.queryParams">
        {{ a.label | localize: lang() }}
      </a>
    } @else if (a.url) {
      <a uiButton [variant]="a.variant ?? 'primary'" [size]="size()" [href]="a.url" target="_blank" rel="noopener">
        {{ a.label | localize: lang() }}
      </a>
    }
  `,
})
export class ContentAction {
  readonly action = input.required<ActionLink>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  protected readonly lang = injectLang();
}
