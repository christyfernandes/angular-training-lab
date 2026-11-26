import { ChangeDetectionStrategy, Component, computed, effect, linkedSignal, resource, signal, untracked } from '@angular/core';
import { Button, Spinner } from '@lab/ui-kit';
import { DemoPanel } from './demo-panel';

interface Course {
  id: string;
  name: string;
  modules: string[];
}

const COURSES: Course[] = [
  { id: 'basics', name: 'Angular basics', modules: ['Components', 'Templates', 'Signals'] },
  { id: 'routing', name: 'Routing', modules: ['Routes', 'Guards', 'Resolvers', 'Lazy loading'] },
  { id: 'data', name: 'Data', modules: ['HttpClient', 'httpResource', 'Interceptors'] },
];

/**
 * Signals from first principles.
 * Open this file side by side with the page and change things.
 */
@Component({
  selector: 'app-signals-demo',
  imports: [DemoPanel, Button, Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <app-demo-panel heading="1. signal() and computed()" file="signals-demo.ts → count, double, parity">
        <div class="flex flex-wrap items-center gap-3">
          <button uiButton variant="secondary" type="button" (click)="count.update((c) => c - 1)">−1</button>
          <span class="min-w-12 text-center text-2xl font-bold">{{ count() }}</span>
          <button uiButton variant="secondary" type="button" (click)="count.update((c) => c + 1)">+1</button>
          <button uiButton variant="ghost" type="button" (click)="count.set(0)">Reset</button>
        </div>
        <p class="mt-3">Double: <strong>{{ double() }}</strong> · Parity: <strong>{{ parity() }}</strong></p>
        <p class="mt-1 text-sm text-fg-muted">
          computed() values are lazy and cached: they only recalculate when a signal they read changes.
        </p>
      </app-demo-panel>

      <app-demo-panel heading="2. effect() and untracked()" file="signals-demo.ts → constructor">
        <p>Effects run side effects when the signals they read change. This one logs the count.</p>
        <ol class="mt-3 max-h-40 overflow-auto rounded-lg bg-surface-muted p-3 font-mono text-xs">
          @for (line of effectLog(); track $index) {
            <li>{{ line }}</li>
          } @empty {
            <li class="text-fg-muted">Change the counter above…</li>
          }
        </ol>
        <p class="mt-2 text-sm text-fg-muted">
          The effect reads <code>label()</code> inside <code>untracked()</code>, so typing a label does not re-run it.
        </p>
        <label class="field-label mt-3" for="label">Log label</label>
        <input id="label" class="field-input max-w-xs" [value]="label()" (input)="label.set(labelBox.value)" #labelBox />
      </app-demo-panel>

      <app-demo-panel heading="3. linkedSignal()" file="signals-demo.ts → selectedModule">
        <p>Pick a course, then a module. Changing the course resets the module – but you can still pick one yourself.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          @for (course of courses; track course.id) {
            <button uiButton size="sm" type="button" [variant]="course.id === courseId() ? 'primary' : 'secondary'" (click)="courseId.set(course.id)">
              {{ course.name }}
            </button>
          }
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          @for (module of selectedCourse().modules; track module) {
            <button uiButton size="sm" type="button" [variant]="module === selectedModule() ? 'primary' : 'ghost'" (click)="selectedModule.set(module)">
              {{ module }}
            </button>
          }
        </div>
        <p class="mt-3">Selected module: <strong>{{ selectedModule() }}</strong></p>
      </app-demo-panel>

      <app-demo-panel heading="4. resource() – async data as signals" file="signals-demo.ts → lesson">
        <p>A resource re-runs its loader when its params change and cancels the previous run via an AbortSignal.</p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button uiButton size="sm" variant="secondary" type="button" (click)="lessonNo.update((n) => Math.max(1, n - 1))">Previous lesson</button>
          <button uiButton size="sm" variant="secondary" type="button" (click)="lessonNo.update((n) => n + 1)">Next lesson</button>
          <button uiButton size="sm" variant="ghost" type="button" (click)="lesson.reload()">Reload</button>
          <label class="ml-2 flex items-center gap-2 text-sm">
            <input type="checkbox" [checked]="failNext()" (change)="failNext.set(failBox.checked)" #failBox />
            Make the next load fail
          </label>
        </div>
        <div class="mt-3 rounded-lg bg-surface-muted p-3">
          <p class="text-xs text-fg-muted">status(): {{ lesson.status() }}</p>
          @if (lesson.isLoading()) {
            <ui-spinner size="sm" />
          } @else if (lesson.error(); as err) {
            <p class="text-danger">Error: {{ err.message }}</p>
          } @else if (lesson.hasValue()) {
            <p class="font-semibold">{{ lesson.value() }}</p>
          }
        </div>
      </app-demo-panel>
    </div>
  `,
})
export default class SignalsDemo {
  protected readonly Math = Math;

  // 1. Writable signal + derived signals
  protected readonly count = signal(0);
  protected readonly double = computed(() => this.count() * 2);
  protected readonly parity = computed(() => (this.count() % 2 === 0 ? 'even' : 'odd'));

  // 2. Effects
  protected readonly label = signal('count');
  protected readonly effectLog = signal<string[]>([]);

  // 3. linkedSignal: writable, but resets when its source changes
  protected readonly courses = COURSES;
  protected readonly courseId = signal(COURSES[0].id);
  protected readonly selectedCourse = computed(() => COURSES.find((c) => c.id === this.courseId()) ?? COURSES[0]);
  protected readonly selectedModule = linkedSignal(() => this.selectedCourse().modules[0]);

  // 4. resource with a fake async loader (no HTTP needed)
  protected readonly lessonNo = signal(1);
  protected readonly failNext = signal(false);
  protected readonly lesson = resource({
    params: () => ({ n: this.lessonNo() }),
    loader: async ({ params, abortSignal }) => {
      await wait(700, abortSignal);
      if (untracked(this.failNext)) {
        this.failNext.set(false);
        throw new Error(`Lesson ${params.n} could not be loaded`);
      }
      return `Lesson ${params.n}: loaded at ${new Date().toLocaleTimeString()}`;
    },
  });

  constructor() {
    effect(() => {
      const value = this.count(); // tracked: the effect re-runs when count changes
      const name = untracked(this.label); // NOT tracked
      // Writing to a signal inside an effect is allowed but should be rare; here it is a log.
      this.effectLog.update((log) => [...log.slice(-9), `${name} = ${value}`]);
    });
  }
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
