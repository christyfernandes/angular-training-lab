import { LearningPath } from './learning-path.model';
import { currentStage, nextStep, progressMarkdown, stageProgress, stepsForTrack } from './learning-path.utils';

const path = {
  version: 1,
  title: 'Test path',
  intro: '',
  tracks: [
    { id: 'foundations', name: 'Foundations', description: '' },
    { id: 'accelerated', name: 'Accelerated', description: '' },
  ],
  concepts: [],
  resources: [],
  stages: [
    {
      id: 'week-1', label: 'Week 1', title: 'Basics', goal: '', hours: 1,
      steps: [
        { id: 'a', kind: 'read', title: 'A', track: 'both', minutes: 1, concepts: [] },
        { id: 'b', kind: 'exercise', title: 'B', track: 'foundations', minutes: 1, concepts: [] },
        { id: 'c', kind: 'exercise', title: 'C', track: 'accelerated', minutes: 1, concepts: [] },
      ],
    },
    {
      id: 'week-2', label: 'Week 2', title: 'More', goal: '', hours: 1,
      steps: [{ id: 'd', kind: 'read', title: 'D', track: 'both', minutes: 1, concepts: [] }],
    },
  ],
} as LearningPath;

describe('learning path utils', () => {
  it('filters steps by track', () => {
    expect(stepsForTrack(path.stages[0], 'foundations').map((s) => s.id)).toEqual(['a', 'b']);
    expect(stepsForTrack(path.stages[0], 'accelerated').map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('counts progress per track', () => {
    expect(stageProgress(path.stages[0], 'foundations', new Set(['a', 'c']))).toEqual({ done: 1, total: 2 });
  });

  it('moves on only when a stage is complete for the chosen track', () => {
    expect(currentStage(path, 'accelerated', new Set(['a'])).id).toBe('week-1');
    expect(currentStage(path, 'accelerated', new Set(['a', 'c'])).id).toBe('week-2');
    expect(nextStep(path, 'foundations', new Set(['a', 'b', 'd']))).toBeNull();
  });

  it('builds a Markdown summary for pull requests', () => {
    const md = progressMarkdown(path, 'foundations', new Set(['a', 'b']));
    expect(md).toContain('| Week 1: Basics | 2/2 complete |');
    expect(md).toContain('Next: Week 2 – D');
  });
});
