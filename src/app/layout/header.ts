import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Badge } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { AppConfigService } from '../core/config/app-config.service';
import { AuthService } from '../core/services/auth.service';
import { CartStore } from '../core/services/cart.store';
import { LanguageService } from '../core/services/language.service';
import { Brand, BRANDS, ThemeService } from '../core/services/theme.service';
import { ClickOutsideDirective } from '../shared/directives/click-outside.directive';
import { FeatureDirective } from '../shared/directives/feature.directive';
import { HasRoleDirective } from '../shared/directives/has-role.directive';
import { LocalizePipe } from '../shared/pipes/localize.pipe';

/**
 * Top navigation.
 * Concepts: routerLink + routerLinkActive, reading signals from several services,
 * a custom structural directive (*appHasRole), local UI state with signal().
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LocalizePipe, Badge, HasRoleDirective, FeatureDirective, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartStore);
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
  protected readonly brands = BRANDS;
  private readonly appConfig = inject(AppConfigService);

  /** Extra links from app-config.json `navigation`, filtered by feature flags. */
  protected readonly configLinks = computed(() => {
    const { navigation, features } = this.appConfig.config();
    return navigation.filter((link) => !link.feature || features[link.feature]);
  });

  protected readonly menuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  protected onBrandChange(value: string): void {
    this.theme.setBrand(value as Brand);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
  }
}
