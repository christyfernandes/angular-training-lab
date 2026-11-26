import { parsePageConfig, sectionProblem } from './parse-page';

describe('parsePageConfig', () => {
  const valid = { id: 'hero', type: 'hero', title: { en: 'Hello', hi: 'नमस्ते' } };

  it('throws when the page shape is wrong', () => {
    expect(() => parsePageConfig({ title: 'No slug', sections: [] })).toThrow();
  });

  it('keeps valid sections and skips bad ones with a warning', () => {
    const warnings: string[] = [];
    const page = parsePageConfig(
      { slug: 'demo', title: 'Demo', sections: [valid, { id: 'x', type: 'carousel' }, { ...valid }] },
      (w) => warnings.push(w),
    );
    expect(page.sections.map((s) => s.id)).toEqual(['hero']);
    expect(warnings).toHaveLength(2); // unknown type + duplicate id
  });

  it('explains what is wrong with a section', () => {
    expect(sectionProblem({ id: 'cta', type: 'cta-banner', title: 'Go' })).toContain('action');
    expect(sectionProblem({ id: 'f', type: 'form', submitLabel: 'Send', successMessage: 'Thanks', fields: [{ key: 'a', type: 'colour', label: 'A' }] })).toContain('unknown type');
    expect(sectionProblem(valid)).toBeNull();
  });
});
