import { buildFormGroup, firstError } from './dynamic-form';
import { FormFieldConfig } from './content.model';

describe('buildFormGroup', () => {
  const fields: FormFieldConfig[] = [
    { key: 'email', type: 'email', label: 'Email', required: true },
    { key: 'code', type: 'text', label: 'Code', pattern: '^[A-Z]{2}[0-9]{4}$' },
    { key: 'agree', type: 'checkbox', label: 'Agree', required: true },
    { key: 'track', type: 'select', label: 'Track', defaultValue: 'foundations', options: [] },
  ];

  it('creates one control per field with defaults', () => {
    const form = buildFormGroup(fields);
    expect(Object.keys(form.controls)).toEqual(['email', 'code', 'agree', 'track']);
    expect(form.controls['agree'].value).toBe(false);
    expect(form.controls['track'].value).toBe('foundations');
  });

  it('applies validators from the config', () => {
    const form = buildFormGroup(fields);
    expect(form.valid).toBe(false);
    form.setValue({ email: 'asha@example.com', code: 'TR1234', agree: true, track: 'accelerated' });
    expect(form.valid).toBe(true);
    form.controls['code'].setValue('tr12');
    expect(firstError(fields[1], form.controls['code'].errors)?.key).toBe('forms.errors.pattern');
  });

  it('uses a dedicated message for unticked required checkboxes', () => {
    const form = buildFormGroup(fields);
    expect(firstError(fields[2], form.controls['agree'].errors)?.key).toBe('forms.errors.mustAccept');
  });
});
