import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  JsonPipe,
  KeyValuePipe,
  PercentPipe,
  SlicePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TruncatePipe } from '@lab/ui-kit';
import { interval, map } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { DemoPanel } from './demo-panel';

/**
 * Pipes transform values for display. Built-in pipes are imported one by one (standalone).
 */
@Component({
  selector: 'app-pipes-demo',
  imports: [
    DemoPanel,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    I18nPluralPipe,
    JsonPipe,
    KeyValuePipe,
    PercentPipe,
    SlicePipe,
    TitleCasePipe,
    UpperCasePipe,
    TruncatePipe,
    DiscountPricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <app-demo-panel heading="1. Built-in pipes (locale follows the language switcher)" file="pipes-demo.ts">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="field-label" for="amount">Amount</label>
            <input id="amount" type="number" class="field-input" [value]="amount()" (input)="setAmount(amountBox.value)" #amountBox />
          </div>
          <div>
            <label class="field-label" for="text">Text</label>
            <input id="text" class="field-input" [value]="text()" (input)="text.set(textBox.value)" #textBox />
          </div>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead class="text-fg-muted"><tr><th class="py-2 pr-4">Expression</th><th class="py-2">Result</th></tr></thead>
            <tbody class="divide-y divide-line">
              <tr><td class="py-2 pr-4"><code>amount | currency:'INR':'symbol':'1.2-2':locale</code></td><td>{{ amount() | currency: 'INR' : 'symbol' : '1.2-2' : locale() }}</td></tr>
              <tr><td class="py-2 pr-4"><code>amount | number:'1.0-1':locale</code></td><td>{{ amount() | number: '1.0-1' : locale() }}</td></tr>
              <tr><td class="py-2 pr-4"><code>0.256 | percent:'1.0-1'</code></td><td>{{ 0.256 | percent: '1.0-1' : locale() }}</td></tr>
              <tr><td class="py-2 pr-4"><code>today | date:'fullDate':undefined:locale</code></td><td>{{ today | date: 'fullDate' : undefined : locale() }}</td></tr>
              <tr><td class="py-2 pr-4"><code>today | date:'shortTime'</code></td><td>{{ today | date: 'shortTime' : undefined : locale() }}</td></tr>
              <tr><td class="py-2 pr-4"><code>text | uppercase</code></td><td>{{ text() | uppercase }}</td></tr>
              <tr><td class="py-2 pr-4"><code>text | titlecase</code></td><td>{{ text() | titlecase }}</td></tr>
              <tr><td class="py-2 pr-4"><code>text | slice:0:10</code></td><td>{{ text() | slice: 0 : 10 }}</td></tr>
              <tr><td class="py-2 pr-4"><code>count | i18nPlural:map</code></td><td>{{ amount() | i18nPlural: itemPlural }}</td></tr>
              <tr><td class="py-2 pr-4"><code>clock$ | async</code></td><td>{{ clock$ | async | date: 'mediumTime' : undefined : locale() }}</td></tr>
            </tbody>
          </table>
        </div>
      </app-demo-panel>

      <app-demo-panel heading="2. Objects: json and keyvalue" file="pipes-demo.ts → config">
        <div class="grid gap-4 md:grid-cols-2">
          <pre class="overflow-auto rounded-lg bg-surface-muted p-3 text-xs">{{ config | json }}</pre>
          <dl class="text-sm">
            @for (entry of config | keyvalue; track entry.key) {
              <div class="flex justify-between border-b border-line py-1.5"><dt class="font-semibold">{{ entry.key }}</dt><dd>{{ entry.value }}</dd></div>
            }
          </dl>
        </div>
      </app-demo-panel>

      <app-demo-panel heading="3. Custom pipes and chaining" file="shared/pipes/discount-price.pipe.ts, ui-kit truncate.pipe.ts">
        <p class="text-sm"><code>amount | discountPrice:15 | currency:'USD'</code> →
          <strong>{{ amount() | discountPrice: 15 | currency: 'USD' : 'symbol' : '1.2-2' : locale() }}</strong></p>
        <p class="mt-2 text-sm"><code>longText | truncate:40</code> → <strong>{{ longText | truncate: 40 }}</strong></p>
        <p class="mt-3 text-sm text-fg-muted">
          Pipes are pure by default: Angular re-runs them only when an argument changes. That is why
          the locale is passed as an argument instead of being read inside the pipe.
        </p>
      </app-demo-panel>
    </div>
  `,
})
export default class PipesDemo {
  protected readonly locale = inject(LanguageService).locale;
  protected readonly amount = signal(1234.5);
  protected readonly text = signal('signals make angular simpler');
  protected readonly today = new Date();
  protected readonly clock$ = interval(1000).pipe(map(() => new Date()));
  protected readonly itemPlural = { '=0': 'No items', '=1': 'One item', other: '# items' };
  protected readonly config = { theme: 'peacock', zoneless: true, changeDetection: 'OnPush', version: 22 };
  protected readonly longText = 'Pure pipes are memoized: same inputs, same output, no extra work during change detection.';

  protected setAmount(value: string): void {
    this.amount.set(Number(value) || 0);
  }
}
