import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Task, TASK_STATUS_LABELS, TASK_STATUSES, TaskStatus } from '../../core/task.model';
import { TaskService } from '../../core/task.service';
import { TaskForm } from '../task-form/task-form';

type StatusFilter = TaskStatus | 'ALL';

/**
 * Renders the task list, allows filtering by status and deleting tasks,
 * and hosts the creation form.
 */
@Component({
  selector: 'app-task-list',
  imports: [FormsModule, TaskForm],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly statuses = TASK_STATUSES;
  protected readonly labels = TASK_STATUS_LABELS;
  protected readonly filter = signal<StatusFilter>('ALL');

  protected readonly visibleTasks = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    return filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter);
  });

  protected readonly counts = computed(() => {
    const tasks = this.tasks();
    return {
      all: tasks.length,
      TODO: tasks.filter((task) => task.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
      DONE: tasks.filter((task) => task.status === 'DONE').length,
    };
  });

  ngOnInit(): void {
    this.load();
  }

  protected setFilter(filter: StatusFilter): void {
    this.filter.set(filter);
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(`Could not load tasks (HTTP ${error.status || 'network error'}).`);
        this.loading.set(false);
      },
    });
  }

  protected onTaskCreated(task: Task): void {
    this.tasks.update((tasks) => [task, ...tasks]);
  }

  protected advanceStatus(task: Task): void {
    const next: TaskStatus = task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE';

    this.taskService
      .update(task.id, {
        title: task.title,
        description: task.description,
        status: next,
        dueDate: task.dueDate,
      })
      .subscribe({
        next: (updated) =>
          this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t))),
        error: (error: HttpErrorResponse) => this.error.set(`Update failed (HTTP ${error.status}).`),
      });
  }

  protected remove(task: Task): void {
    this.taskService.delete(task.id).subscribe({
      next: () => this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id)),
      error: (error: HttpErrorResponse) => this.error.set(`Delete failed (HTTP ${error.status}).`),
    });
  }

  protected trackById(_index: number, task: Task): number {
    return task.id;
  }
}
