import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task } from '../../core/task.model';
import { TaskList } from './task-list';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let httpMock: HttpTestingController;

  const todo: Task = {
    id: 1,
    title: 'Write the API',
    description: 'Expose CRUD endpoints',
    status: 'TODO',
    dueDate: '2026-12-01',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  };

  const done: Task = {
    id: 2,
    title: 'Ship the UI',
    description: null,
    status: 'DONE',
    dueDate: null,
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  };

  const items = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-testid="task-item"]'));

  const buttonWithText = (scope: HTMLElement, text: string): HTMLButtonElement => {
    const button = Array.from(scope.querySelectorAll('button')).find((candidate) =>
      (candidate.textContent ?? '').includes(text),
    );
    return button as HTMLButtonElement;
  };

  const loadWith = (tasks: Task[]): void => {
    fixture.detectChanges();
    httpMock.expectOne('/api/tasks').flush(tasks);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders the tasks returned by the API', () => {
    loadWith([todo, done]);

    expect(items().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Write the API');
    expect(fixture.nativeElement.textContent).toContain('Ship the UI');
  });

  it('shows the empty state when there are no tasks', () => {
    loadWith([]);

    expect(items().length).toBe(0);
    expect(fixture.nativeElement.querySelector('[data-testid="empty-state"]')).toBeTruthy();
  });

  it('filters the list by status', () => {
    loadWith([todo, done]);
    expect(items().length).toBe(2);

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.chip'),
    ) as HTMLButtonElement[];
    const inProgressChip = chips.find((chip) => (chip.textContent ?? '').includes('In progress'))!;
    inProgressChip.click();
    fixture.detectChanges();

    expect(items().length).toBe(0);
    expect(fixture.nativeElement.querySelector('[data-testid="empty-state"]')).toBeTruthy();

    const doneChip = chips.find((chip) => (chip.textContent ?? '').includes('Done'))!;
    doneChip.click();
    fixture.detectChanges();

    expect(items().length).toBe(1);
    expect(items()[0].textContent).toContain('Ship the UI');
  });

  it('deletes a task and removes it from the list', () => {
    loadWith([todo, done]);

    buttonWithText(items()[0], 'Delete').click();

    const request = httpMock.expectOne('/api/tasks/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(items().length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Write the API');
  });

  it('advances a task status with PUT and re-renders the updated task', () => {
    loadWith([todo]);

    buttonWithText(items()[0], 'Advance').click();

    const request = httpMock.expectOne('/api/tasks/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.status).toBe('IN_PROGRESS');
    request.flush({ ...todo, status: 'IN_PROGRESS' });
    fixture.detectChanges();

    expect(items()[0].getAttribute('data-status')).toBe('IN_PROGRESS');
  });

  it('surfaces a friendly message when loading fails', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/tasks').flush('boom', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain('500');
  });

  it('reloads the list when Refresh is clicked', () => {
    loadWith([todo]);

    buttonWithText(fixture.nativeElement, 'Refresh').click();
    fixture.detectChanges();

    httpMock.expectOne('/api/tasks').flush([todo, done]);
    fixture.detectChanges();

    expect(items().length).toBe(2);
  });
});
