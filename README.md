# @teqbench/tbx-ngx-errors

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-number.json)

> Pluggable two-layer error handling pipeline for [Angular ↗](https://angular.dev). Provides an HTTP error interceptor, a global error handler, and a swappable TbxNgxErrorLoggerService abstraction that unifies all error routing through a single extension point.

## Installation

Configure [npm ↗](https://www.npmjs.com) to use [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) for the `@teqbench` scope:

```bash
echo "@teqbench:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the package:

```bash
npm install @teqbench/tbx-ngx-errors
```

## Usage

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    TbxNgxErrorLoggerService,
    TbxNgxConsoleErrorLoggerService,
    TbxNgxGlobalErrorHandlerService,
    tbxNgxHttpErrorInterceptor,
} from '@teqbench/tbx-ngx-errors';
import { ErrorHandler } from '@angular/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([tbxNgxHttpErrorInterceptor])),
        { provide: ErrorHandler, useClass: TbxNgxGlobalErrorHandlerService },
        { provide: TbxNgxErrorLoggerService, useClass: TbxNgxConsoleErrorLoggerService },
    ],
};
```

## API Reference

| Export                              | Kind        | Description                                                                            |
| ----------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `TbxNgxErrorContextModel`           | Interface   | Structured context attached to every error in the pipeline                             |
| `TbxNgxErrorLoggerService`          | Abstract    | Extension point — swap to route errors to any backend                                  |
| `TbxNgxConsoleErrorLoggerService`   | Service     | Default logger that writes to the browser console                                      |
| `TbxNgxCompositeErrorLoggerService` | Service     | Broadcasts errors to multiple registered loggers                                       |
| `TbxNgxGlobalErrorHandlerService`   | Service     | [Angular ↗](https://angular.dev) `ErrorHandler` implementation for uncaught app errors |
| `tbxNgxHttpErrorInterceptor`        | Interceptor | Functional HTTP interceptor for failed responses                                       |
| `logClientError`                    | Utility     | Helper to build context and log from catch blocks                                      |

## Compatibility

| Dependency                                     | Version  |
| ---------------------------------------------- | -------- |
| [Angular ↗](https://angular.dev)               | ^21.0.0  |
| [RxJS ↗](https://rxjs.dev)                     | ^7.8.0   |
| [TypeScript ↗](https://www.typescriptlang.org) | ~5.9.0   |
| [Node.js ↗](https://nodejs.org)                | >=24.0.0 |

## Feedback

- [Report a bug](https://github.com/teqbench/tbx-ngx-errors/issues/new?template=bug_report.md)
- [Request a feature](https://github.com/teqbench/tbx-ngx-errors/issues/new?template=feature_request.md)

## License

[AGPL-3.0](LICENSE) — Copyright 2026 TeqBench
