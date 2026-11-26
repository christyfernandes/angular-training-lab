import { FeatureName } from '../../../core/config/app-config.model';
import { LocalizedText } from '../../../core/models/localized-text';
import { ProductSort } from '../../../core/models/product.model';

/**
 * The JSON contract between content authors and the app.
 *
 * A page is a list of sections. Each section has a `type` that selects the component that
 * renders it. TypeScript models this as a discriminated union: once code checks
 * `section.type === 'hero'`, the compiler knows every other field of a HeroSection.
 */
export interface PageConfig {
  slug: string;
  title: LocalizedText;
  description?: LocalizedText;
  /** Bump when the content changes; handy for cache-busting and audits. */
  version?: number;
  sections: PageSection[];
}

export type PageSection =
  | HeroSection
  | RichTextSection
  | FeatureGridSection
  | ProductStripSection
  | CtaBannerSection
  | FaqSection
  | FormSection;

export type SectionType = PageSection['type'];

interface SectionBase {
  /** Unique within the page; used for tracking in @for and as an anchor (#id). */
  id: string;
  visibility?: VisibilityRule;
}

/** When a section should show. All conditions must pass. */
export interface VisibilityRule {
  /** ISO date-time; hidden before this moment. Great for scheduled campaigns. */
  from?: string;
  /** ISO date-time; hidden from this moment on. */
  until?: string;
  audience?: 'all' | 'guest' | 'authenticated';
  /** Only when this feature flag is on in app-config.json. */
  feature?: FeatureName;
}

export interface ActionLink {
  label: LocalizedText;
  /** In-app route, e.g. "/products". */
  route?: string;
  queryParams?: Record<string, string>;
  /** External link, opened in a new tab. Used only when `route` is absent. */
  url?: string;
  variant?: 'primary' | 'secondary';
}

export interface HeroSection extends SectionBase {
  type: 'hero';
  title: LocalizedText;
  body?: LocalizedText;
  image?: string;
  actions?: ActionLink[];
}

export interface RichTextSection extends SectionBase {
  type: 'rich-text';
  title?: LocalizedText;
  paragraphs: LocalizedText[];
}

export interface FeatureGridSection extends SectionBase {
  type: 'feature-grid';
  title?: LocalizedText;
  columns?: 2 | 3 | 4;
  items: { title: LocalizedText; body: LocalizedText; link?: ActionLink }[];
}

export interface ProductStripSection extends SectionBase {
  type: 'product-strip';
  title: LocalizedText;
  /** Live data inside config-driven layout: the JSON says WHAT to show, the API supplies it. */
  query: { category?: string; search?: string; sort?: ProductSort; limit?: number };
  seeAll?: ActionLink;
}

export interface CtaBannerSection extends SectionBase {
  type: 'cta-banner';
  title: LocalizedText;
  body?: LocalizedText;
  tone?: 'primary' | 'accent';
  action: ActionLink;
}

export interface FaqSection extends SectionBase {
  type: 'faq';
  title?: LocalizedText;
  items: { question: LocalizedText; answer: LocalizedText }[];
}

export interface FormSection extends SectionBase {
  type: 'form';
  title?: LocalizedText;
  description?: LocalizedText;
  submitLabel: LocalizedText;
  successMessage: LocalizedText;
  fields: FormFieldConfig[];
}

export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface FormFieldConfig {
  /** Property name in the submitted value. */
  key: string;
  type: FormFieldType;
  label: LocalizedText;
  placeholder?: LocalizedText;
  hint?: LocalizedText;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** A regular expression the value must match, e.g. "^[0-9]{10}$". */
  pattern?: string;
  options?: { value: string; label: LocalizedText }[];
  defaultValue?: string | number | boolean;
}
