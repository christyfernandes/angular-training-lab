import { DEFAULT_APP_CONFIG } from './app-config.model';
import { parseAppConfig } from './parse-app-config';

describe('parseAppConfig', () => {
  it('returns defaults for non-object input', () => {
    expect(parseAppConfig('nope')).toEqual(DEFAULT_APP_CONFIG);
  });

  it('keeps valid values and trims trailing slashes', () => {
    const config = parseAppConfig({ apiBaseUrl: 'https://api.example.com/', defaultBrand: 'jamun', features: { admin: false } });
    expect(config.apiBaseUrl).toBe('https://api.example.com');
    expect(config.defaultBrand).toBe('jamun');
    expect(config.features.admin).toBe(false);
    expect(config.features.conceptsLab).toBe(true); // missing flag → default
  });

  it('falls back field by field and reports why', () => {
    const warnings: string[] = [];
    const config = parseAppConfig({ apiBaseUrl: 42, defaultBrand: 'neon', features: { admin: 'yes' } }, (w) => warnings.push(w));
    expect(config.apiBaseUrl).toBe(DEFAULT_APP_CONFIG.apiBaseUrl);
    expect(config.defaultBrand).toBe('peacock');
    expect(config.features.admin).toBe(true);
    expect(warnings.length).toBe(2);
  });

  it('drops invalid navigation links and announcements', () => {
    const config = parseAppConfig({
      navigation: [{ label: 'Sale', route: '/pages/sale' }, { label: 'No route' }],
      announcement: { message: 'missing id' },
    });
    expect(config.navigation).toHaveLength(1);
    expect(config.announcement).toBeNull();
  });
});
