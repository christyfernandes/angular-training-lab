import { LocalizedText } from '../models/localized-text';

/**
 * Runtime configuration, loaded from /config/app-config.json at startup.
 *
 * Why runtime config instead of environment.ts files?
 * environment.ts is baked into the bundle at BUILD time, so every environment needs its own
 * build. A JSON file fetched at STARTUP lets one build run in dev, QA and production: ops just
 * swap the file (or mount it from a ConfigMap) – no rebuild, no redeploy of JavaScript.
 */
export interface AppConfig {
  apiBaseUrl: string;
  /** Where JSON page definitions live. Could be a CDN or a headless CMS endpoint. */
  contentBaseUrl: string;
  defaultLanguage: string;
  defaultBrand: 'peacock' | 'marigold' | 'jamun';
  features: FeatureFlags;
  /** Extra header links managed by content editors. */
  navigation: NavLink[];
  announcement: Announcement | null;
}

export interface FeatureFlags {
  conceptsLab: boolean;
  admin: boolean;
  campaignPages: boolean;
  productReviews: boolean;
}

export type FeatureName = keyof FeatureFlags;

export interface NavLink {
  label: LocalizedText;
  route: string;
  /** Only show the link when this feature is enabled. */
  feature?: FeatureName;
}

export interface Announcement {
  /** Change the id to show a new announcement to people who dismissed the old one. */
  id: string;
  tone: 'info' | 'success' | 'warning';
  message: LocalizedText;
  link?: { label: LocalizedText; route: string };
}

/** Safe defaults: the app still starts if the config file is missing or broken. */
export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: 'https://dummyjson.com',
  contentBaseUrl: '/content',
  defaultLanguage: 'en',
  defaultBrand: 'peacock',
  features: { conceptsLab: true, admin: true, campaignPages: true, productReviews: true },
  navigation: [],
  announcement: null,
};
