import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { Task, TASK_STATUSES, TaskStatus } from '../../core/task.model';
import { TaskService } from '../../core/task.service';

interface TaskFormModel {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
}

/**
 * Reactive form used to create a task through the API.
 */
@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  /** Emitted with the task created by the API. */
  readonly created = output<Task>();

  private readonly taskService = inject(TaskService);

  protected readonly statuses = TASK_STATUSES;
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected model: TaskFormModel = {
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
  };

  protected submit(form: NgForm): void {
    if (form.invalid || this.submitting()) {
      form.control.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.taskService
      .create({
        title: this.model.title.trim(),
        description: this.model.description.trim() || null,
        status: this.model.status,
        dueDate: this.model.dueDate || null,
      })
      .subscribe({
        next: (task) => {
          this.submitting.set(false);
          this.success.set(`Created “${task.title}”.`);
          this.created.emit(task);
          form.resetForm({ status: 'TODO', title: '', description: '', dueDate: '' });
          this.model = { title: '', description: '', status: 'TODO', dueDate: '' };
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(this.describeError(error));
        },
      });
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 400 && error.error?.errors) {
      return Object.values(error.error.errors as Record<string, string>).join(' ');
    }
    if (error.status === 0) {
      return 'Cannot reach the API. Is the Spring Boot backend running on port 8081?';
    }
    return `Could not create the task (HTTP ${error.status}).`;
  }
}
