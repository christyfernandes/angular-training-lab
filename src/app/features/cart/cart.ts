import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { CartStore, unitPrice } from '../../core/services/cart.store';
import { LanguageService } from '../../core/services/language.service';
import { NotificationService } from '../../core/services/notification.service';

/** Cart page: reads everything from CartStore signals; holds no state of its own. */
@Component({
  selector: 'app-cart',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe, TranslatePipe, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.html',
})
export default class Cart {
  protected readonly cart = inject(CartStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly locale = inject(LanguageService).locale;
  protected readonly unitPrice = unitPrice;

  protected checkout(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.cart.clear();
    this.notifications.success(this.translate.instant('cart.orderPlaced'));
    void this.router.navigateByUrl('/products');
  }
}
