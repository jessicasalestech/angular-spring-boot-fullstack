import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('creates the app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the project title and both navigation links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Task Board');

    const links = Array.from(compiled.querySelectorAll('.shell__nav a')).map((link) =>
      (link.textContent ?? '').trim(),
    );
    expect(links).toEqual(['Tasks', 'About']);
  });

  it('exposes the task, about and default redirect routes', () => {
    const paths = routes.map((route) => route.path);
    expect(paths).toContain('tasks');
    expect(paths).toContain('about');
    expect(paths).toContain('**');
  });
});
