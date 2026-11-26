import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge, BadgeTone, Button, Spinner } from '@lab/ui-kit';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../core/services/notification.service';
import { StepKind, TrackId } from './learning-path.model';
import { stageProgress, stepsForTrack } from './learning-path.utils';
import { LearningStore } from './learning.store';

const KIND_TONES: Record<StepKind, BadgeTone> = {
  setup: 'neutral',
  read: 'primary',
  watch: 'accent',
  explore: 'success',
  study: 'neutral',
  exercise: 'warning',
  check: 'neutral',
};

/**
 * /learn and /learn/:stage – the learning path inside the app.
 * Each step links to its reading or video, the page to open in this app, and the files to read.
 */
@Component({
  selector: 'app-learn-page',
  imports: [RouterLink, TranslatePipe, Badge, Button, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './learn-page.html',
})
export default class LearnPage {
  /** From /learn/:stage via router input binding; absent on /learn. */
  readonly stage = input<string>();

  protected readonly store = inject(LearningStore);
  private readonly notifications = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  protected readonly kindTones = KIND_TONES;

  protected readonly selected = computed(() => {
    if (!this.store.path.hasValue()) return null;
    const stages = this.store.path.value().stages;
    return stages.find((s) => s.id === this.stage()) ?? this.store.current();
  });

  protected readonly selectedIndex = computed(() => {
    const selected = this.selected();
    return this.store.path.hasValue() && selected ? this.store.path.value().stages.indexOf(selected) : -1;
  });

  protected readonly steps = computed(() => {
    const stage = this.selected();
    return stage ? stepsForTrack(stage, this.store.track()) : [];
  });

  protected readonly overall = computed(() => {
    if (!this.store.path.hasValue()) return { done: 0, total: 0 };
    return this.store.path.value().stages.reduce(
      (acc, stage) => {
        const p = stageProgress(stage, this.store.track(), this.store.done());
        return { done: acc.done + p.done, total: acc.total + p.total };
      },
      { done: 0, total: 0 },
    );
  });

  protected progressOf(stageId: string): { done: number; total: number } {
    const stage = this.store.path.value()?.stages.find((s) => s.id === stageId);
    return stage ? stageProgress(stage, this.store.track(), this.store.done()) : { done: 0, total: 0 };
  }

  protected percent(p: { done: number; total: number }): number {
    return p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
  }

  protected trackName(id: string): string {
    return this.store.path.value()?.tracks.find((t) => t.id === id)?.name ?? id;
  }

  protected setTrack(track: TrackId): void {
    this.store.track.set(track);
  }

  protected async copyProgress(): Promise<void> {
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(this.store.summary());
      this.notifications.success(this.translate.instant('learn.copied'));
    } catch {
      this.notifications.error(this.translate.instant('learn.copyFailed'));
    }
  }
}
