import { httpResource } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { LearningPath, TrackId } from './learning-path.model';
import { currentStage, nextStep, progressMarkdown } from './learning-path.utils';

/**
 * Learning path data + the learner's progress.
 * The path comes from public/content/learning-path.json; progress is saved in this browser.
 */
@Service()
export class LearningStore {
  private readonly storage = inject(StorageService);

  readonly path = httpResource<LearningPath>(() => '/content/learning-path.json');

  readonly track = signal<TrackId>(this.storage.get<TrackId>('learn.track') ?? 'foundations');
  private readonly _done = signal<ReadonlySet<string>>(new Set(this.storage.get<string[]>('learn.done') ?? []));
  readonly done = this._done.asReadonly();

  readonly current = computed(() => (this.path.hasValue() ? currentStage(this.path.value(), this.track(), this._done()) : null));
  readonly next = computed(() => (this.path.hasValue() ? nextStep(this.path.value(), this.track(), this._done()) : null));

  constructor() {
    effect(() => this.storage.set('learn.track', this.track()));
    effect(() => this.storage.set('learn.done', [...this._done()]));
  }

  toggle(stepId: string): void {
    this._done.update((done) => {
      const next = new Set(done);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }

  summary(): string {
    return this.path.hasValue() ? progressMarkdown(this.path.value(), this.track(), this._done()) : '';
  }
}
