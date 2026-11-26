import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Turns route `title` translation keys into translated browser tab titles.
 *
 * Route:        { path: 'products/:id', title: 'titles.productDetail', resolve: { product } }
 * en.json:      "productDetail": "{{product.title}}"
 * Result:       "Essence Mascara Lash Princess | Karkhana"
 *
 * Concepts: replacing a framework service through DI ({ provide: TitleStrategy, useClass }),
 * reading resolved route data, re-running on language change.
 */
@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private lastSnapshot?: RouterStateSnapshot;

  constructor() {
    super();
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.lastSnapshot) this.updateTitle(this.lastSnapshot);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.lastSnapshot = snapshot;
    const appName = this.translate.instant('app.name');
    const key = this.buildTitle(snapshot);
    if (!key) {
      this.title.setTitle(appName);
      return;
    }
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const page = this.translate.instant(key, route.data);
    this.title.setTitle(`${page} | ${appName}`);
  }
}
