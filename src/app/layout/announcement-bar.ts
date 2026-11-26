import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AppConfigService } from '../core/config/app-config.service';
import { LanguageService } from '../core/services/language.service';
import { StorageService } from '../core/services/storage.service';
import { LocalizePipe } from '../shared/pipes/localize.pipe';

/**
 * Site-wide message driven by `announcement` in app-config.json.
 * Dismissal is remembered per announcement id, so a new id shows again for everyone.
 */
@Component({
  selector: 'app-announcement-bar',
  imports: [RouterLink, TranslatePipe, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible(); as a) {
      <div
        class="border-b px-4 py-2 text-sm"
        [class]="toneClasses[a.tone]"
        role="region"
        [attr.aria-label]="'announcement.label' | translate"
      >
        <div class="mx-auto flex max-w-6xl items-center gap-3">
          <p class="flex-1">
            {{ a.message | localize: lang() }}
            @if (a.link) {
              <a [routerLink]="a.link.route" class="ml-1 font-semibold text-primary underline">{{ a.link.label | localize: lang() }}</a>
            }
          </p>
          <button type="button" class="text-fg-muted hover:text-fg" [attr.aria-label]="'common.dismiss' | translate" (click)="dismiss(a.id)">✕</button>
        </div>
      </div>
    }
  `,
})
export class AnnouncementBar {
  private readonly config = inject(AppConfigService);
  private readonly storage = inject(StorageService);
  protected readonly lang = inject(LanguageService).current;

  protected readonly toneClasses = {
    info: 'bg-primary-soft border-primary',
    success: 'bg-success/10 border-success',
    warning: 'bg-warning/10 border-warning',
  } as const;

  private readonly dismissedId = signal(this.storage.get<string>('announcement.dismissed'));

  protected readonly visible = computed(() => {
    const announcement = this.config.config().announcement;
    return announcement && announcement.id !== this.dismissedId() ? announcement : null;
  });

  protected dismiss(id: string): void {
    this.storage.set('announcement.dismissed', id);
    this.dismissedId.set(id);
  }
}
