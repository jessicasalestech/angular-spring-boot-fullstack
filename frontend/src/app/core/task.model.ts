/**
 * Domain model shared by the task service and the UI components.
 * Mirrors the JSON contract exposed by the Spring Boot API.
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export interface Task {
  readonly id: number;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly dueDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Payload sent to POST /api/tasks and PUT /api/tasks/{id}. */
export interface TaskPayload {
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly dueDate: string | null;
}

/** Body returned by GET /api/health. */
export interface HealthResponse {
  readonly status: string;
  readonly service: string;
  readonly timestamp: string;
}
