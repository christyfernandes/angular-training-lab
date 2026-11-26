/**
 * Text that content authors can translate inside JSON:
 *   "title": "Festive sale"                         ← same text for every language
 *   "title": { "en": "Festive sale", "hi": "त्योहार सेल" }  ← per language, falls back to English
 */
export type LocalizedText = string | Readonly<Record<string, string>>;

export function pickLocalized(text: LocalizedText | null | undefined, lang: string, fallbackLang = 'en'): string {
  if (text === null || text === undefined) return '';
  if (typeof text === 'string') return text;
  return text[lang] ?? text[fallbackLang] ?? Object.values(text)[0] ?? '';
}

export function isLocalizedText(value: unknown): value is LocalizedText {
  if (typeof value === 'string') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).length > 0 &&
    Object.values(value).every((v) => typeof v === 'string')
  );
}
