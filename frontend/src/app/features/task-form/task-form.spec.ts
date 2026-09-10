import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Task } from '../../core/task.model';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let httpMock: HttpTestingController;

  const createdTask: Task = {
    id: 10,
    title: 'New task',
    description: null,
    status: 'TODO',
    dueDate: null,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  };

  const setInput = (selector: string, value: string): void => {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const submit = (): void => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('renders the creation form', () => {
    expect(fixture.nativeElement.querySelector('#title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#status')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#dueDate')).toBeTruthy();
  });

  it('does not call the API when the title is empty', () => {
    submit();

    httpMock.expectNone('/api/tasks');
    expect(fixture.nativeElement.querySelector('[data-testid="title-error"]')).toBeTruthy();
  });

  it('marks the title field as invalid when touched and empty', () => {
    setInput('#title', '');
    submit();

    const error = fixture.nativeElement.querySelector('[data-testid="title-error"]') as HTMLElement;
    expect(error.textContent).toContain('title is required');
  });

  it('creates a task, emits the output and clears the form', () => {
    const emitted: Task[] = [];
    fixture.componentInstance.created.subscribe((task) => emitted.push(task));

    setInput('#title', 'New task');
    setInput('#description', 'Created from the form');
    submit();

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      title: 'New task',
      description: 'Created from the form',
      status: 'TODO',
      dueDate: null,
    });
    request.flush(createdTask, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    expect(emitted).toEqual([createdTask]);
    expect(fixture.nativeElement.querySelector('[data-testid="form-success"]')).toBeTruthy();
    expect((fixture.nativeElement.querySelector('#title') as HTMLInputElement).value).toBe('');
  });

  it('renders field errors returned by the API on a 400', () => {
    setInput('#title', 'ok');
    submit();

    httpMock.expectOne('/api/tasks').flush(
      { title: 'Validation failed', errors: { title: 'title is required' } },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-testid="form-error"]') as HTMLElement;
    expect(error.textContent).toContain('title is required');
  });

  it('explains what to do when the backend is unreachable', () => {
    setInput('#title', 'ok');
    submit();

    httpMock
      .expectOne('/api/tasks')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('[data-testid="form-error"]') as HTMLElement;
    expect(error.textContent).toContain('8081');
  });
});
