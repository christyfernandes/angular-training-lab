import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Alert, Button } from '@lab/ui-kit';
import { TranslatePipe } from '@ngx-translate/core';
import { pickLocalized } from '../../../core/models/localized-text';
import { NotificationService } from '../../../core/services/notification.service';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { FormFieldConfig, FormSection } from '../engine/content.model';
import { buildFormGroup, firstError } from '../engine/dynamic-form';
import { injectLang } from '../engine/section-base';

/**
 * A form whose fields come entirely from JSON.
 * `computed()` rebuilds the FormGroup only if the section config itself changes.
 */
@Component({
  selector: 'app-form-section',
  imports: [ReactiveFormsModule, TranslatePipe, LocalizePipe, Alert, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-section.html',
})
export class FormSectionView {
  readonly section = input.required<FormSection>();
  protected readonly lang = injectLang();
  private readonly notifications = inject(NotificationService);

  protected readonly form = computed(() => buildFormGroup(this.section().fields));
  protected readonly submitted = signal(false);

  protected fieldId(field: FormFieldConfig): string {
    return `${this.section().id}-${field.key}`;
  }

  protected errorFor(field: FormFieldConfig): { key: string; params?: object } | null {
    const control = this.form().controls[field.key];
    return control.invalid && (control.touched || control.dirty) ? firstError(field, control.errors) : null;
  }

  protected submit(): void {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    // A real app would POST form.getRawValue() to an endpoint named in the JSON.
    console.info('[form submit]', this.section().id, form.getRawValue());
    this.notifications.success(pickLocalized(this.section().successMessage, this.lang()));
    this.submitted.set(true);
    form.reset();
  }
}
