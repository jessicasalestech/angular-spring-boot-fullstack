# Task Board — Frontend (Angular 20)

The Angular single-page application for the full-stack portfolio project. See the
[root README](../README.md) for architecture, run and test instructions.

## Stack

- Angular 20 standalone components, signals, lazy-loaded routes
- HttpClient service (`src/app/core/task.service.ts`) talking to `/api/tasks`
- Dev proxy ([`proxy.conf.json`](proxy.conf.json)) forwards `/api` → `http://localhost:8081`
- Karma + Jasmine unit tests (`HttpClientTestingModule`) run headless on ChromeHeadless

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm install`        | Install dependencies                 |
| `npm start`          | Dev server on `http://localhost:4200`|
| `npm run build`      | Production build to `dist/frontend`  |
| `npx ng test`        | Interactive test runner              |
| `npx ng test --watch=false --browsers=ChromeHeadless --no-progress` | Headless tests |

> Windows note: set `CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe"`
> before running headless tests.