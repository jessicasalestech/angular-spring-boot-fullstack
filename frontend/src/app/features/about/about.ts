import { Component, inject, signal } from '@angular/core';

import { TaskService } from '../../core/task.service';

/**
 * Small page explaining the architecture and showing the live API health status.
 */
@Component({
  selector: 'app-about',
  template: `
    <section class="panel">
      <h2>About this project</h2>
      <p>
        A full-stack portfolio project: an <strong>Angular 20</strong> single-page app talking to a
        <strong>Spring Boot 3</strong> REST API backed by an in-memory H2 database.
      </p>
      <ul>
        <li>Backend: Spring Web, Spring Data JPA, Bean Validation, MockMvc tests.</li>
        <li>Frontend: standalone components, signals, HttpClient, Karma/Jasmine tests.</li>
        <li>CI: GitHub Actions running <code>mvn verify</code> and <code>npm run build + test</code>.</li>
      </ul>

      @if (health(); as status) {
        <p class="status" data-testid="health">API health: <strong>{{ status.status }}</strong> — {{ status.service }}</p>
      } @else {
        <p class="status muted">Checking API health…</p>
      }
    </section>
  `,
  styles: [
    `
      .panel {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
      }
      h2 {
        margin-top: 0;
      }
      ul {
        color: #475569;
        line-height: 1.7;
      }
      .status {
        margin-bottom: 0;
      }
      .muted {
        color: #64748b;
      }
    `,
  ],
})
export class About {
  private readonly taskService = inject(TaskService);
  protected readonly health = signal<{ status: string; service: string } | null>(null);

  constructor() {
    this.taskService.health().subscribe({
      next: (health) => this.health.set(health),
      error: () => this.health.set({ status: 'DOWN', service: 'task-api (unreachable)' }),
    });
  }
}
