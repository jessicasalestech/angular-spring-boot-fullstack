import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    loadComponent: () => import('./features/task-list/task-list').then((m) => m.TaskList),
    title: 'Task Board · Tasks',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'Task Board · About',
  },
  { path: '**', redirectTo: 'tasks' },
];
