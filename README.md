# @teqbench/tbx-ngx-errors

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-errors-main-build-number.json)

> Pluggable two-layer error handling pipeline for Angular. Provides an HTTP error interceptor, a global error handler, and a swappable ErrorLoggerService abstraction that unifies all error routing through a single extension point.

## Installation

Configure npm to use GitHub Packages for the `@teqbench` scope:

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
    ErrorLoggerService,
    ConsoleErrorLoggerService,
    GlobalErrorHandlerService,
    httpErrorInterceptor,
} from '@teqbench/tbx-ngx-errors';
import { ErrorHandler } from '@angular/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
        { provide: ErrorLoggerService, useClass: ConsoleErrorLoggerService },
    ],
};
```

## API Reference

| Export                        | Kind        | Description                                                   |
| ----------------------------- | ----------- | ------------------------------------------------------------- |
| `ErrorContextModel`           | Interface   | Structured context attached to every error in the pipeline    |
| `ErrorLoggerService`          | Abstract    | Extension point — swap to route errors to any backend         |
| `ConsoleErrorLoggerService`   | Service     | Default logger that writes to the browser console             |
| `CompositeErrorLoggerService` | Service     | Broadcasts errors to multiple registered loggers              |
| `GlobalErrorHandlerService`   | Service     | Angular `ErrorHandler` implementation for uncaught app errors |
| `httpErrorInterceptor`        | Interceptor | Functional HTTP interceptor for failed responses              |
| `logClientError`              | Utility     | Helper to build context and log from catch blocks             |

## Compatibility

| Dependency | Version  |
| ---------- | -------- |
| Angular    | ^21.0.0  |
| RxJS       | ^7.8.0   |
| TypeScript | ~5.9.0   |
| Node.js    | >=24.0.0 |

## License

[Apache-2.0](LICENSE) — Copyright 2025 TeqBench
