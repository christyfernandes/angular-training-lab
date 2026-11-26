import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Alert, Button } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { Product, ProductDraft } from '../../core/models/product.model';
import { LanguageService } from '../../core/services/language.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../products/components/product-card';

/** Custom validator: every tag must be unique (case-insensitive). Works on a FormArray. */
export const uniqueTagsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const tags = (control.value as string[]).map((t) => t.trim().toLowerCase()).filter(Boolean);
  return new Set(tags).size === tags.length ? null : { duplicateTags: true };
};

/**
 * Create / edit a product with typed Reactive Forms.
 *
 * Concepts:
 * - NonNullableFormBuilder → fully typed FormGroup (form.value is a typed object).
 * - Built-in and custom validators, a FormArray for a dynamic list (tags).
 * - ngOnInit to fill the form from the resolved `product` input (inputs are ready by then).
 * - `toSignal(form.valueChanges)` drives a live preview that reuses <app-product-card>.
 * - Implements HasUnsavedChanges so unsavedChangesGuard can warn before leaving.
 */
@Component({
  selector: 'app-product-editor',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, Alert, Button, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-editor.html',
})
export default class ProductEditor implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productService = inject(ProductService);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  protected readonly locale = inject(LanguageService).locale;

  /** Present on /admin/products/:id/edit (resolved), absent on /admin/products/new. */
  readonly product = input<Product>();
  protected readonly isEdit = computed(() => this.product() !== undefined);

  protected readonly categories = toSignal(this.productService.categories$, { initialValue: [] });
  protected readonly saving = signal(false);
  private saved = false;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    category: ['', Validators.required],
    brand: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    discountPercentage: [0, [Validators.min(0), Validators.max(90)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    tags: this.fb.array<FormControl<string>>([], { validators: uniqueTagsValidator }),
  });

  /** Typed shortcut to the FormArray for the template. */
  protected get tags(): FormArray<FormControl<string>> {
    return this.form.controls.tags;
  }

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Live preview: a Product-shaped object built from the current form value. */
  protected readonly preview = computed<Product>(() => {
    const value = this.formValue();
    const original = this.product();
    return {
      id: original?.id ?? 0,
      title: value.title || this.translate.instant('editor.previewTitle'),
      description: value.description ?? '',
      category: value.category ?? '',
      brand: value.brand,
      price: Number(value.price) || 0,
      discountPercentage: Number(value.discountPercentage) || 0,
      stock: Number(value.stock) || 0,
      tags: value.tags ?? [],
      rating: original?.rating ?? 0,
      thumbnail: original?.thumbnail ?? '',
      images: original?.images ?? [],
    };
  });

  ngOnInit(): void {
    const product = this.product();
    if (product) {
      this.form.patchValue({
        title: product.title,
        description: product.description,
        category: product.category,
        brand: product.brand ?? '',
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
      });
      product.tags.forEach((tag) => this.addTag(tag));
      this.form.markAsPristine();
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  protected addTag(value = ''): void {
    this.tags.push(this.fb.control(value, Validators.required));
    if (!value) this.tags.markAsDirty();
  }

  protected removeTag(index: number): void {
    this.tags.removeAt(index);
    this.tags.markAsDirty();
  }

  protected showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const draft: ProductDraft = this.form.getRawValue();
    const existing = this.product();
    const request$ = existing ? this.productService.update(existing.id, draft) : this.productService.create(draft);

    this.saving.set(true);
    request$.subscribe({
      next: (result) => {
        this.saved = true;
        this.saving.set(false);
        const key = existing ? 'editor.updated' : 'editor.created';
        this.notifications.success(this.translate.instant(key, { title: result.title }));
        void this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error(this.translate.instant('editor.saveFailed'));
      },
    });
  }
}
