import { InjectionToken, Type } from '@angular/core';
import { SectionType } from './content.model';

/** Lazily loads the component for one section type. */
export type SectionLoader = () => Promise<Type<unknown>>;
export type SectionRegistry = Readonly<Partial<Record<SectionType, SectionLoader>>>;

/**
 * Maps a JSON `type` to the component that renders it.
 *
 * Concepts:
 * - Each component is a dynamic import(), so a page only downloads the section types it uses.
 * - It is an InjectionToken with a default factory: a feature or a test can provide its own
 *   registry (e.g. a mock, or extra section types) without touching the renderer.
 *   This is the open/closed principle: add section types, don't edit the engine.
 */
export const SECTION_REGISTRY = new InjectionToken<SectionRegistry>('SECTION_REGISTRY', {
  providedIn: 'root',
  factory: () => ({
    hero: () => import('../sections/hero-section').then((m) => m.HeroSectionView),
    'rich-text': () => import('../sections/rich-text-section').then((m) => m.RichTextSectionView),
    'feature-grid': () => import('../sections/feature-grid-section').then((m) => m.FeatureGridSectionView),
    'product-strip': () => import('../sections/product-strip-section').then((m) => m.ProductStripSectionView),
    'cta-banner': () => import('../sections/cta-banner-section').then((m) => m.CtaBannerSectionView),
    faq: () => import('../sections/faq-section').then((m) => m.FaqSectionView),
    form: () => import('../sections/form-section').then((m) => m.FormSectionView),
  }),
});
