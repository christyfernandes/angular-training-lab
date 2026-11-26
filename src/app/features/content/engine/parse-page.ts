import { isLocalizedText } from '../../../core/models/localized-text';
import { FormFieldConfig, PageConfig, PageSection } from './content.model';

/**
 * Validates page JSON at runtime. TypeScript types disappear after compilation, and JSON
 * written by people (or a CMS) WILL contain mistakes, so we check:
 * - the page itself (slug, title, sections array) → throw: nothing sensible to render
 * - each section → skip it with a warning: one bad section must not break the page
 */
export function parsePageConfig(raw: unknown, warn: (message: string) => void = console.warn): PageConfig {
  if (!isRecord(raw) || typeof raw['slug'] !== 'string' || !isLocalizedText(raw['title']) || !Array.isArray(raw['sections'])) {
    throw new Error('Invalid page: expected { slug, title, sections[] }');
  }

  const seen = new Set<string>();
  const sections = raw['sections'].filter((section, index): section is PageSection => {
    const problem = sectionProblem(section);
    if (problem) {
      warn(`[content] ${raw['slug']}: section #${index} skipped – ${problem}`);
      return false;
    }
    const id = (section as PageSection).id;
    if (seen.has(id)) {
      warn(`[content] ${raw['slug']}: duplicate section id "${id}" skipped`);
      return false;
    }
    seen.add(id);
    return true;
  });

  return {
    slug: raw['slug'],
    title: raw['title'],
    description: isLocalizedText(raw['description']) ? raw['description'] : undefined,
    version: typeof raw['version'] === 'number' ? raw['version'] : undefined,
    sections,
  };
}

/** Returns a human-readable problem, or null when the section is valid. */
export function sectionProblem(section: unknown): string | null {
  if (!isRecord(section)) return 'not an object';
  if (typeof section['id'] !== 'string' || !section['id']) return 'missing "id"';
  const text = (key: string, optional = false) =>
    (optional && section[key] === undefined) || isLocalizedText(section[key]) ? null : `"${key}" must be text`;
  const list = (key: string) => (Array.isArray(section[key]) && section[key].length > 0 ? null : `"${key}" must be a non-empty list`);
  const action = (value: unknown) => isRecord(value) && isLocalizedText(value['label']) && (typeof value['route'] === 'string' || typeof value['url'] === 'string');

  switch (section['type']) {
    case 'hero':
      return text('title') ?? text('body', true);
    case 'rich-text':
      return list('paragraphs') ?? ((section['paragraphs'] as unknown[]).every(isLocalizedText) ? null : 'every paragraph must be text');
    case 'feature-grid':
      return list('items') ?? ((section['items'] as unknown[]).every((i) => isRecord(i) && isLocalizedText(i['title']) && isLocalizedText(i['body'])) ? null : 'every item needs "title" and "body"');
    case 'product-strip':
      return text('title') ?? (isRecord(section['query']) ? null : '"query" is required');
    case 'cta-banner':
      return text('title') ?? (action(section['action']) ? null : '"action" needs a "label" and a "route" or "url"');
    case 'faq':
      return list('items') ?? ((section['items'] as unknown[]).every((i) => isRecord(i) && isLocalizedText(i['question']) && isLocalizedText(i['answer'])) ? null : 'every item needs "question" and "answer"');
    case 'form':
      return text('submitLabel') ?? text('successMessage') ?? list('fields') ?? fieldsProblem(section['fields'] as unknown[]);
    default:
      return `unknown type "${String(section['type'])}"`;
  }
}

const FIELD_TYPES: FormFieldConfig['type'][] = ['text', 'email', 'number', 'textarea', 'select', 'checkbox'];

function fieldsProblem(fields: unknown[]): string | null {
  const keys = new Set<string>();
  for (const field of fields) {
    if (!isRecord(field) || typeof field['key'] !== 'string' || !isLocalizedText(field['label'])) return 'every field needs "key" and "label"';
    if (!FIELD_TYPES.includes(field['type'] as FormFieldConfig['type'])) return `field "${field['key']}" has an unknown type`;
    if (field['type'] === 'select' && !Array.isArray(field['options'])) return `select field "${field['key']}" needs "options"`;
    if (keys.has(field['key'])) return `duplicate field key "${field['key']}"`;
    keys.add(field['key']);
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
