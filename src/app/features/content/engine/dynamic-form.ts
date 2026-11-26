import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { FormFieldConfig } from './content.model';

export type DynamicFormGroup = FormGroup<Record<string, FormControl<string | number | boolean | null>>>;

/**
 * Builds a Reactive Forms FormGroup from JSON field definitions.
 *
 * This is the core of a config-driven form: fields, order, validation and options all come
 * from data, so a new survey or lead form is a JSON change, not a code change.
 * Kept as a pure function (no DI) so it is easy to unit test.
 */
export function buildFormGroup(fields: readonly FormFieldConfig[]): DynamicFormGroup {
  const controls: Record<string, FormControl<string | number | boolean | null>> = {};
  for (const field of fields) {
    controls[field.key] = new FormControl(initialValue(field), { validators: validatorsFor(field) });
  }
  return new FormGroup(controls);
}

export function validatorsFor(field: FormFieldConfig): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (field.required) validators.push(field.type === 'checkbox' ? Validators.requiredTrue : Validators.required);
  if (field.type === 'email') validators.push(Validators.email);
  if (field.minLength !== undefined) validators.push(Validators.minLength(field.minLength));
  if (field.maxLength !== undefined) validators.push(Validators.maxLength(field.maxLength));
  if (field.min !== undefined) validators.push(Validators.min(field.min));
  if (field.max !== undefined) validators.push(Validators.max(field.max));
  if (field.pattern) validators.push(Validators.pattern(field.pattern));
  return validators;
}

function initialValue(field: FormFieldConfig): string | number | boolean | null {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'checkbox') return false;
  if (field.type === 'number') return null;
  return '';
}

/** Maps the first validation error of a control to a translation key + params. */
export function firstError(field: FormFieldConfig, errors: Record<string, unknown> | null): { key: string; params?: object } | null {
  if (!errors) return null;
  if (errors['required']) return { key: field.type === 'checkbox' ? 'forms.errors.mustAccept' : 'forms.errors.required' };
  if (errors['email']) return { key: 'forms.errors.email' };
  if (errors['minlength']) return { key: 'forms.errors.minLength', params: { min: field.minLength } };
  if (errors['maxlength']) return { key: 'forms.errors.maxLength', params: { max: field.maxLength } };
  if (errors['min']) return { key: 'forms.errors.min', params: { min: field.min } };
  if (errors['max']) return { key: 'forms.errors.max', params: { max: field.max } };
  if (errors['pattern']) return { key: 'forms.errors.pattern' };
  return { key: 'forms.errors.invalid' };
}
