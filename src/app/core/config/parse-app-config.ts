import { isLocalizedText } from '../models/localized-text';
import { Announcement, AppConfig, DEFAULT_APP_CONFIG, FeatureFlags, NavLink } from './app-config.model';

const BRANDS = ['peacock', 'marigold', 'jamun'] as const;
const TONES = ['info', 'success', 'warning'] as const;

/**
 * Turns untrusted JSON into a valid AppConfig.
 *
 * Rule of thumb: never trust a config file. Every field is checked; anything missing or of the
 * wrong type falls back to the default, and a warning explains what was ignored. A typo in
 * the JSON should degrade one setting, not crash the app at startup.
 */
export function parseAppConfig(raw: unknown, warn: (message: string) => void = () => {}): AppConfig {
  const d = DEFAULT_APP_CONFIG;
  if (!isRecord(raw)) {
    warn('config is not an object; using defaults');
    return d;
  }

  const str = (key: keyof AppConfig, fallback: string): string => {
    const value = raw[key];
    if (value === undefined) return fallback;
    if (typeof value === 'string' && value.trim()) return value.trim();
    warn(`"${key}" must be a non-empty string; using "${fallback}"`);
    return fallback;
  };

  const brand = raw['defaultBrand'];
  const features = isRecord(raw['features']) ? raw['features'] : {};

  return {
    apiBaseUrl: str('apiBaseUrl', d.apiBaseUrl).replace(/\/+$/, ''),
    contentBaseUrl: str('contentBaseUrl', d.contentBaseUrl).replace(/\/+$/, ''),
    defaultLanguage: str('defaultLanguage', d.defaultLanguage),
    defaultBrand: BRANDS.includes(brand as never) ? (brand as AppConfig['defaultBrand']) : d.defaultBrand,
    features: Object.fromEntries(
      (Object.keys(d.features) as (keyof FeatureFlags)[]).map((name) => {
        const value = features[name];
        if (value !== undefined && typeof value !== 'boolean') warn(`features.${name} must be true or false`);
        return [name, typeof value === 'boolean' ? value : d.features[name]];
      }),
    ) as unknown as FeatureFlags,
    navigation: parseNavigation(raw['navigation'], warn),
    announcement: parseAnnouncement(raw['announcement'], warn),
  };
}

function parseNavigation(value: unknown, warn: (m: string) => void): NavLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item, i): item is NavLink => {
    const ok = isRecord(item) && isLocalizedText(item['label']) && typeof item['route'] === 'string';
    if (!ok) warn(`navigation[${i}] needs a "label" and a "route"; skipped`);
    return ok;
  });
}

function parseAnnouncement(value: unknown, warn: (m: string) => void): Announcement | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || typeof value['id'] !== 'string' || !isLocalizedText(value['message'])) {
    warn('announcement needs an "id" and a "message"; hidden');
    return null;
  }
  const tone = TONES.includes(value['tone'] as never) ? (value['tone'] as Announcement['tone']) : 'info';
  const link = isRecord(value['link']) && isLocalizedText(value['link']['label']) && typeof value['link']['route'] === 'string'
    ? { label: value['link']['label'], route: value['link']['route'] }
    : undefined;
  return { id: value['id'], tone, message: value['message'], link };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
