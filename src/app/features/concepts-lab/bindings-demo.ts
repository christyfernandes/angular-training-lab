import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Alert, Badge, BadgeTone, Button, ButtonVariant, Card, Rating } from '@lab/ui-kit';
import { DemoPanel } from './demo-panel';

type TaskStatus = 'todo' | 'doing' | 'done';

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

/**
 * Every kind of template binding in one place, plus the ui-kit components.
 */
@Component({
  selector: 'app-bindings-demo',
  imports: [DemoPanel, Alert, Badge, Button, Card, Rating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bindings-demo.html',
})
export default class BindingsDemo {
  // Interpolation & property binding
  protected readonly name = signal('Angular');
  protected readonly disabled = signal(false);
  protected readonly progress = signal(40);

  // Two-way binding with a model() input on a library component
  protected readonly myRating = signal(3);

  // Event binding
  protected readonly lastKey = signal('—');
  protected readonly clicks = signal(0);

  // Control flow
  protected readonly tasks = signal<Task[]>([
    { id: 1, title: 'Read the signals guide', status: 'done' },
    { id: 2, title: 'Build the product card', status: 'doing' },
    { id: 3, title: 'Write a guard', status: 'todo' },
  ]);
  protected readonly doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);
  private nextId = 4;

  protected readonly variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  protected readonly tones: BadgeTone[] = ['neutral', 'primary', 'accent', 'success', 'warning', 'danger'];

  protected setProgress(value: string): void {
    this.progress.set(Number(value));
  }

  protected addTask(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    this.tasks.update((tasks) => [...tasks, { id: this.nextId++, title: trimmed, status: 'todo' }]);
  }

  protected advance(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = { todo: 'doing', doing: 'done', done: 'todo' };
    this.tasks.update((tasks) => tasks.map((t) => (t.id === task.id ? { ...t, status: next[t.status] } : t)));
  }

  protected remove(id: number): void {
    this.tasks.update((tasks) => tasks.filter((t) => t.id !== id));
  }
}
