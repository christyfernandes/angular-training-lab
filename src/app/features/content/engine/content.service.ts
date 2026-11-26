import { HttpResourceRequest } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { AppConfigService } from '../../../core/config/app-config.service';

/** Knows where page JSON lives. Switch `contentBaseUrl` in app-config.json to use a CMS or CDN. */
@Service()
export class ContentService {
  private readonly config = inject(AppConfigService);

  pageRequest(slug: string): HttpResourceRequest | undefined {
    if (!/^[a-z0-9-]+$/.test(slug)) return undefined; // never build URLs from unchecked input
    return { url: `${this.config.config().contentBaseUrl}/pages/${slug}.json` };
  }
}
