import { LearningPath, Stage, Step, TrackId } from './learning-path.model';

/** Pure helpers (no Angular), so the progress rules are trivial to unit test. */

export function stepsForTrack(stage: Stage, track: TrackId): Step[] {
  return stage.steps.filter((s) => s.track === 'both' || s.track === track);
}

export function stageProgress(stage: Stage, track: TrackId, done: ReadonlySet<string>): { done: number; total: number } {
  const steps = stepsForTrack(stage, track);
  return { done: steps.filter((s) => done.has(s.id)).length, total: steps.length };
}

/** The first stage that still has an unfinished step for this track (or the last stage). */
export function currentStage(path: LearningPath, track: TrackId, done: ReadonlySet<string>): Stage {
  return path.stages.find((stage) => stepsForTrack(stage, track).some((s) => !done.has(s.id))) ?? path.stages[path.stages.length - 1];
}

export function nextStep(path: LearningPath, track: TrackId, done: ReadonlySet<string>): { stage: Stage; step: Step } | null {
  for (const stage of path.stages) {
    const step = stepsForTrack(stage, track).find((s) => !done.has(s.id));
    if (step) return { stage, step };
  }
  return null;
}

/** A Markdown summary learners paste into their PR or the team channel. */
export function progressMarkdown(path: LearningPath, track: TrackId, done: ReadonlySet<string>): string {
  const trackName = path.tracks.find((t) => t.id === track)?.name ?? track;
  const lines = [`### Angular training progress (${trackName} track)`, '', '| Stage | Done |', '| --- | --- |'];
  for (const stage of path.stages) {
    const p = stageProgress(stage, track, done);
    lines.push(`| ${stage.label}: ${stage.title} | ${p.done}/${p.total}${p.done === p.total ? ' complete' : ''} |`);
  }
  const next = nextStep(path, track, done);
  lines.push('', next ? `Next: ${next.stage.label} – ${next.step.title}` : 'All stages complete.');
  return lines.join('\n');
}
