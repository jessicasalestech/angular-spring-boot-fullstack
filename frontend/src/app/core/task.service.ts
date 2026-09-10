import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { HealthResponse, Task, TaskPayload } from './task.model';

/**
 * Thin HttpClient wrapper around the Spring Boot task API.
 *
 * <p>Requests use the relative path {@code /api/tasks} so the Angular dev server
 * proxy (proxy.conf.json) forwards them to http://localhost:8081 without CORS.</p>
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private static readonly BASE_URL = '/api/tasks';

  private readonly http = inject(HttpClient);

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(TaskService.BASE_URL);
  }

  get(id: number): Observable<Task> {
    return this.http.get<Task>(`${TaskService.BASE_URL}/${id}`);
  }

  create(payload: TaskPayload): Observable<Task> {
    return this.http.post<Task>(TaskService.BASE_URL, payload);
  }

  update(id: number, payload: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${TaskService.BASE_URL}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${TaskService.BASE_URL}/${id}`);
  }

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>('/api/health');
  }
}
