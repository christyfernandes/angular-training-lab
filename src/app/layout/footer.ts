import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-fg-muted sm:flex-row sm:justify-between sm:px-6">
        <p>{{ 'footer.about' | translate }}</p>
        <p>
          {{ 'footer.data' | translate }}
          <a class="font-semibold text-primary hover:underline" href="https://dummyjson.com" target="_blank" rel="noopener">
            DummyJSON
          </a>
        </p>
      </div>
    </footer>
  `,
})
export class Footer {}
