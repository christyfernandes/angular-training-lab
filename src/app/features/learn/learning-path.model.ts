/** Shape of public/content/learning-path.json – the single source of truth for the program. */
export type TrackId = 'foundations' | 'accelerated';
export type StepKind = 'setup' | 'read' | 'watch' | 'explore' | 'study' | 'exercise' | 'check';

export interface LearningPath {
  version: number;
  title: string;
  intro: string;
  tracks: { id: TrackId; name: string; description: string }[];
  concepts: { id: string; name: string }[];
  stages: Stage[];
  resources: { title: string; url: string; type: string; cost: string; bestFor: string }[];
}

export interface Stage {
  id: string;
  /** "Week 1", "Module" … */
  label: string;
  title: string;
  goal: string;
  hours: number;
  checkpoint?: { title: string; submit: string };
  steps: Step[];
}

export interface Step {
  id: string;
  kind: StepKind;
  title: string;
  track: TrackId | 'both';
  minutes: number;
  concepts: string[];
  /** External link (docs, video, course). */
  url?: string;
  /** In-app route to open while studying. */
  route?: string;
  /** Repository files to read. */
  files?: string[];
  /** What to pay attention to. */
  lookFor?: string;
  note?: string;
  questions?: string[];
  doneWhen?: string;
}
