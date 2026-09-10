import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TaskService } from './task.service';
import { Task, TaskPayload } from './task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const sampleTask: Task = {
    id: 1,
    title: 'Write tests',
    description: 'Cover the service',
    status: 'TODO',
    dueDate: '2026-12-01',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  };

  const payload: TaskPayload = {
    title: 'Write tests',
    description: 'Cover the service',
    status: 'TODO',
    dueDate: '2026-12-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('list() performs a GET and unwraps the array', () => {
    let result: Task[] | undefined;
    service.list().subscribe((tasks) => (result = tasks));

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('GET');
    request.flush([sampleTask]);

    expect(result).toEqual([sampleTask]);
  });

  it('get() performs a GET on the item URL', () => {
    let result: Task | undefined;
    service.get(1).subscribe((task) => (result = task));

    const request = httpMock.expectOne('/api/tasks/1');
    expect(request.request.method).toBe('GET');
    request.flush(sampleTask);

    expect(result).toEqual(sampleTask);
  });

  it('create() posts the payload as JSON', () => {
    let result: Task | undefined;
    service.create(payload).subscribe((task) => (result = task));

    const request = httpMock.expectOne('/api/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(sampleTask, { status: 201, statusText: 'Created' });

    expect(result).toEqual(sampleTask);
  });

  it('update() puts the payload to the item URL', () => {
    let result: Task | undefined;
    service.update(1, payload).subscribe((task) => (result = task));

    const request = httpMock.expectOne('/api/tasks/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...sampleTask, status: 'DONE' });

    expect(result?.status).toBe('DONE');
  });

  it('delete() sends a DELETE and completes without a body', () => {
    let completed = false;
    service.delete(1).subscribe({ complete: () => (completed = true) });

    const request = httpMock.expectOne('/api/tasks/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBeTrue();
  });

  it('health() calls the health endpoint', () => {
    let status = '';
    service.health().subscribe((response) => (status = response.status));

    const request = httpMock.expectOne('/api/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'UP', service: 'task-api', timestamp: '2026-01-01T10:00:00Z' });

    expect(status).toBe('UP');
  });

  it('propagates API errors to the subscriber', () => {
    let errorStatus: number | undefined;
    service.list().subscribe({
      error: (error) => (errorStatus = error.status),
    });

    httpMock.expectOne('/api/tasks').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(errorStatus).toBe(500);
  });
});
