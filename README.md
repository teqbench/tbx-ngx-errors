# @teqbench/tbx-ngx-errors

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-number.json)

> Pluggable multi-layer error handling pipeline for [Angular ↗](https://angular.dev). Provides an HTTP error interceptor, a global error handler, and a manual client-error logger utility — all unified through a swappable `TbxNgxErrorLoggerService` abstraction that routes every error (caught and uncaught, HTTP and application) through a single extension point.

<details>
<summary><strong>Table of contents</strong></summary>

- [Overview](#overview)
- [At a glance](#at-a-glance)
- [When to use](#when-to-use)
- [Installation](#installation)
- [Usage](#usage)
- [Concepts](#concepts)
- [API Reference](#api-reference)
- [Accessibility](#accessibility)
- [Compatibility](#compatibility)
- [Versioning & releases](#versioning--releases)
- [Contributing](#contributing)
- [Security](#security)
- [Feedback](#feedback)
- [License](#license)

</details>

## Overview

`@teqbench/tbx-ngx-errors` provides a unified error-handling pipeline for [Angular ↗](https://angular.dev) applications. Rather than sprinkling logging calls across every service, component, and catch block, the package captures errors at three well-defined layers and routes all of them through a single, swappable logger abstraction.

The three capture layers are independent and composable: `tbxNgxHttpErrorInterceptor` captures failed HTTP responses before they propagate; `TbxNgxGlobalErrorHandlerService` implements [Angular's `ErrorHandler` ↗](https://angular.dev/api/core/ErrorHandler) to catch uncaught application errors (and deliberately skips HTTP errors so layer one owns them); `logClientError` gives services and components an ergonomic utility for logging errors caught explicitly in try/catch blocks. All three build the same `TbxNgxErrorContextModel` — a structured record with timestamp, URL, message, stack, and HTTP-specific fields — and delegate to the injected `TbxNgxErrorLoggerService`.

The logger itself is the extension point. A default console logger ships with the package; a composite logger fans out to any number of registered backends, so consumers can write to the console, ship to [Sentry ↗](https://sentry.io) or [LogRocket ↗](https://logrocket.com), and raise a UI toast from a single error event without modifying any of the capture layers. The package is built for [Angular ↗](https://angular.dev) 21+ zoneless applications, is [SSR ↗](https://angular.dev/guide/ssr)-safe (guards against `window` access in the interceptor and handler), and carries no `@teqbench` runtime dependencies.

## At a glance

- **HTTP error interceptor** — functional interceptor that captures failed HTTP responses and delegates to the logging pipeline.
- **Global error handler** — [Angular ↗](https://angular.dev) `ErrorHandler` implementation that captures uncaught application errors, skipping HTTP errors already handled by the interceptor.
- **Manual client-error logger** — `logClientError` utility for routing explicitly caught errors through the same pipeline from any service or component.
- **Pluggable logger abstraction** — abstract `TbxNgxErrorLoggerService` acts as the single swap point for routing errors to any backend.
- **Console logger** — default `TbxNgxConsoleErrorLoggerService` for local development.
- **Composite fan-out logger** — `TbxNgxCompositeErrorLoggerService` broadcasts each error to multiple registered backends (console + remote + UI toast).
- **Structured error context** — every error flows through as a `TbxNgxErrorContextModel` with timestamp, URL, message, stack, and optional HTTP status and URL.
- **SSR-safe** — `window` access in the interceptor and global handler is guarded so errors raised during server-side rendering do not crash.
- **Promise rejection unwrapping** — the global handler automatically unwraps [Angular ↗](https://angular.dev)-wrapped promise rejections before logging.
- **Zoneless ready** — built for [Angular ↗](https://angular.dev) 21+ zoneless applications with no [Zone.js ↗](https://github.com/angular/angular/tree/main/packages/zone.js) dependency.

## When to use

Reach for this package when your [Angular ↗](https://angular.dev) application needs:

- A unified extension point for routing every error — caught and uncaught, HTTP and application — through a single logger abstraction.
- To plug in a remote logging backend like [Sentry ↗](https://sentry.io) or [LogRocket ↗](https://logrocket.com) without editing every catch block.
- Composition of multiple loggers (e.g., console for dev plus a remote backend for production) via a fan-out composite.

Skip it when your app only needs ad-hoc try/catch logging and has no plans for a centralized logging backend — the plumbing is overkill for that case.

## Installation

Configure [npm ↗](https://www.npmjs.com) to use [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) for the `@teqbench` scope:

```bash
echo "@teqbench:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the package:

```bash
npm install @teqbench/tbx-ngx-errors
```

### Prerequisites

This package has no runtime `@teqbench` dependencies and ships only an abstract logger and three capture layers. A concrete `TbxNgxErrorLoggerService` implementation must be registered via [Angular ↗](https://angular.dev) DI for any error to actually be logged — the bundled `TbxNgxConsoleErrorLoggerService` is suitable for development.

## Usage

### Basic setup

Wire all three capture layers and the default console logger in `app.config.ts`:

```typescript
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    TbxNgxErrorLoggerService,
    TbxNgxConsoleErrorLoggerService,
    TbxNgxGlobalErrorHandlerService,
    tbxNgxHttpErrorInterceptor,
} from '@teqbench/tbx-ngx-errors';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([tbxNgxHttpErrorInterceptor])),
        { provide: ErrorHandler, useClass: TbxNgxGlobalErrorHandlerService },
        { provide: TbxNgxErrorLoggerService, useClass: TbxNgxConsoleErrorLoggerService },
    ],
};
```

### Custom logger implementation

Extend `TbxNgxErrorLoggerService` to route errors to any backend. Every capture layer calls the same `log(context, error)` signature.

```typescript
import { Injectable } from '@angular/core';
import { TbxNgxErrorLoggerService, TbxNgxErrorContextModel } from '@teqbench/tbx-ngx-errors';

@Injectable()
export class SentryErrorLogger extends TbxNgxErrorLoggerService {
    log(context: TbxNgxErrorContextModel, error: unknown): void {
        // Sentry.captureException is a hypothetical remote-logging call
        Sentry.captureException(error, { extra: context });
    }
}

// app.config.ts
{ provide: TbxNgxErrorLoggerService, useClass: SentryErrorLogger }
```

### Composite fan-out — multiple backends at once

`TbxNgxCompositeErrorLoggerService` broadcasts each error to every registered child logger. Each is invoked inside its own try/catch, so a failure in one backend does not block the others.

```typescript
import {
    TbxNgxErrorLoggerService,
    TbxNgxConsoleErrorLoggerService,
    TbxNgxCompositeErrorLoggerService,
} from '@teqbench/tbx-ngx-errors';

// app.config.ts
{
    provide: TbxNgxErrorLoggerService,
    useFactory: () => {
        const composite = new TbxNgxCompositeErrorLoggerService();
        composite.addLogger(new TbxNgxConsoleErrorLoggerService());
        // SentryErrorLogger is a hypothetical consumer-defined subclass
        composite.addLogger(inject(SentryErrorLogger));
        return composite;
    },
}
```

### Manual client-error logging

Use `logClientError` from any service or component to route an explicitly caught error through the same pipeline the interceptor and global handler use.

```typescript
import { inject } from '@angular/core';
import { logClientError, TbxNgxErrorLoggerService } from '@teqbench/tbx-ngx-errors';

private readonly logger = inject(TbxNgxErrorLoggerService);

async onSave() {
    try {
        await this.riskyOperation();
    } catch (error) {
        logClientError('Save failed', error, this.logger);
    }
}
```

### Narrowing the error context

`TbxNgxErrorContextModel` carries three optional consumer-use fields — `severity`, `code`, `category` — typed as generics that default to `string`. Narrow them with enums or literal unions when constructing contexts manually.

```typescript
type Severity = 'fatal' | 'recoverable';
type Category = 'network' | 'auth' | 'validation';

const context: TbxNgxErrorContextModel<Severity, number, Category> = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    message: 'Token refresh failed',
    stack: undefined,
    isHttpError: false,
    httpStatus: undefined,
    httpUrl: undefined,
    severity: 'recoverable',
    code: 4010,
    category: 'auth',
};
```

## Concepts

- **Capture layer** — one of three places where errors enter the pipeline: the HTTP interceptor, the global error handler, or a manual `logClientError` call.
- **Logger abstraction** — the abstract `TbxNgxErrorLoggerService` that every capture layer delegates to; consumers swap in a concrete implementation via [Angular ↗](https://angular.dev) DI.
- **Error context model** — `TbxNgxErrorContextModel`: a structured record built by every capture layer with timestamp, URL, message, stack, and HTTP-specific fields.
- **Composite logger** — a logger that broadcasts each error to a list of registered child loggers, enabling fan-out to multiple backends without altering the capture layers.
- **HTTP vs application error** — HTTP errors are captured by the interceptor and skipped by the global handler; uncaught application errors are captured by the global handler.
- **Manual capture** — logging an explicitly caught error through `logClientError` rather than letting it propagate to the global handler.
- **Extension point** — the single site (`TbxNgxErrorLoggerService`) where a consumer plugs in remote logging or UI surfacing without touching any capture layer.

## API Reference

### TbxNgxErrorContextModel

Interface describing the structured context attached to every error.

| Property      | Type                                     | Description                                                                                             |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `timestamp`   | `string`                                 | [ISO 8601 ↗](https://www.iso.org/iso-8601-date-and-time-format.html) timestamp when captured.           |
| `url`         | `string`                                 | Browser URL at the time of the error (empty string under [SSR ↗](https://angular.dev/guide/ssr)).       |
| `message`     | `string`                                 | Extracted error message, or stringified value for non-`Error` types.                                    |
| `stack`       | `string \| undefined`                    | Stack trace (for `Error` instances only).                                                               |
| `isHttpError` | `boolean`                                | `true` when the error originated from an HTTP response.                                                 |
| `httpStatus`  | `number \| undefined`                    | HTTP status code (populated by the interceptor; `undefined` for app errors).                            |
| `httpUrl`     | `string \| undefined`                    | HTTP request URL (populated by the interceptor; `undefined` for app errors).                            |
| `severity?`   | `TSeverity` (generic, defaults `string`) | Optional consumer field — the pipeline never sets this; supply it when constructing a context manually. |
| `code?`       | `TCode` (generic, defaults `string`)     | Optional consumer field — the pipeline never sets this.                                                 |
| `category?`   | `TCategory` (generic, defaults `string`) | Optional consumer field — the pipeline never sets this.                                                 |

### TbxNgxErrorLoggerService (abstract)

Extension point for error reporting backends.

| Member                | Signature                                                    | Description                                        |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `log(context, error)` | `(context: TbxNgxErrorContextModel, error: unknown) => void` | Abstract — implement to route errors to a backend. |

### TbxNgxConsoleErrorLoggerService

Default logger that writes a formatted message to `console.error`. HTTP and application errors are prefixed distinctly (`[HTTP <status>] <url>` vs `[AppError] <message>`).

### TbxNgxCompositeErrorLoggerService

Fan-out logger that broadcasts each error to a list of registered child loggers.

| Method                | Signature                                                    | Description                                                                                                                              |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `addLogger(logger)`   | `(logger: TbxNgxErrorLoggerService) => void`                 | Register a child logger.                                                                                                                 |
| `log(context, error)` | `(context: TbxNgxErrorContextModel, error: unknown) => void` | Dispatch to every registered child; each invocation is isolated in its own try/catch so one backend's failure does not block the others. |

### TbxNgxGlobalErrorHandlerService

[Angular ↗](https://angular.dev) [`ErrorHandler` ↗](https://angular.dev/api/core/ErrorHandler) implementation.

| Method               | Signature                  | Description                                                                                                                                                                                       |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handleError(error)` | `(error: unknown) => void` | Build a context for the uncaught error and delegate to the injected `TbxNgxErrorLoggerService`. Skips `HttpErrorResponse` (owned by the interceptor). Unwraps Angular-wrapped promise rejections. |

### tbxNgxHttpErrorInterceptor

Functional HTTP interceptor. Captures failed responses, builds an HTTP-flavored context (`isHttpError: true`, `httpStatus`, `httpUrl`), logs via `TbxNgxErrorLoggerService`, and re-throws so subscriber error callbacks still fire.

```typescript
provideHttpClient(withInterceptors([tbxNgxHttpErrorInterceptor]));
```

### logClientError

Utility for routing a manually caught error through the logging pipeline.

| Parameter | Type                       | Description                                         |
| --------- | -------------------------- | --------------------------------------------------- |
| `message` | `string`                   | Human-readable description of the failed operation. |
| `error`   | `unknown`                  | The caught error value (may or may not be `Error`). |
| `logger`  | `TbxNgxErrorLoggerService` | The injected logger to delegate to.                 |

## Accessibility

- This package provides services, interceptors, and utilities only. It has no direct UI surface, no rendered DOM, and no keyboard, focus, color, or motion considerations. Surfacing errors to users visually (toast, banner, dialog) is the consuming application's responsibility — accessibility for those surfaces is owned by the chosen UI package.

## Compatibility

| Dependency                                     | Version  |
| ---------------------------------------------- | -------- |
| [Angular ↗](https://angular.dev)               | ^21.0.0  |
| [RxJS ↗](https://rxjs.dev)                     | ^7.8.0   |
| [TypeScript ↗](https://www.typescriptlang.org) | ~5.9.0   |
| [Node.js ↗](https://nodejs.org)                | >=24.0.0 |

## Versioning & releases

This package follows [Semantic Versioning ↗](https://semver.org). Versions and changelog entries are produced automatically by [Release Please ↗](https://github.com/googleapis/release-please) from [Conventional Commits ↗](https://www.conventionalcommits.org) on `main`. See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) authentication, branch conventions, commit format, and the PR workflow.

## Security

See [SECURITY.md](SECURITY.md) for the supported-version policy and how to report a vulnerability privately.

## Feedback

- [Report a bug ↗](https://github.com/teqbench/tbx-ngx-errors/issues/new?template=bug_report.md)
- [Request a feature ↗](https://github.com/teqbench/tbx-ngx-errors/issues/new?template=feature_request.md)

## License

[AGPL-3.0](LICENSE) — Copyright 2026 TeqBench
