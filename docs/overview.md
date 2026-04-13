---
tagline: Pluggable multi-layer error handling pipeline for [Angular ↗](https://angular.dev). Provides an HTTP error interceptor, a global error handler, and a manual client-error logger utility — all unified through a swappable `TbxNgxErrorLoggerService` abstraction that routes every error (caught and uncaught, HTTP and application) through a single extension point.
---

## Overview

`@teqbench/tbx-ngx-errors` provides a unified error-handling pipeline for [Angular ↗](https://angular.dev) applications. Rather than sprinkling logging calls across every service, component, and catch block, the package captures errors at three well-defined layers and routes all of them through a single, swappable logger abstraction.

The three capture layers are independent and composable: `tbxNgxHttpErrorInterceptor` captures failed HTTP responses before they propagate; `TbxNgxGlobalErrorHandlerService` implements [Angular's `ErrorHandler` ↗](https://angular.dev/api/core/ErrorHandler) to catch uncaught application errors (and deliberately skips HTTP errors so layer one owns them); `logClientError` gives services and components an ergonomic utility for logging errors caught explicitly in try/catch blocks. All three build the same `TbxNgxErrorContextModel` — a structured record with timestamp, URL, message, stack, and HTTP-specific fields — and delegate to the injected `TbxNgxErrorLoggerService`.

The logger itself is the extension point. A default console logger ships with the package; a composite logger fans out to any number of registered backends, so consumers can write to the console, ship to [Sentry ↗](https://sentry.io) or [LogRocket ↗](https://logrocket.com), and raise a UI toast from a single error event without modifying any of the capture layers. The package is built for [Angular ↗](https://angular.dev) 21+ zoneless applications, is [SSR ↗](https://angular.dev/guide/ssr)-safe (guards against `window` access in the interceptor and handler), and carries no `@teqbench` runtime dependencies.

## When to use

Reach for this package when your [Angular ↗](https://angular.dev) application needs:

- A unified extension point for routing every error — caught and uncaught, HTTP and application — through a single logger abstraction.
- To plug in a remote logging backend like [Sentry ↗](https://sentry.io) or [LogRocket ↗](https://logrocket.com) without editing every catch block.
- Composition of multiple loggers (e.g., console for dev plus a remote backend for production) via a fan-out composite.

Skip it when your app only needs ad-hoc try/catch logging and has no plans for a centralized logging backend — the plumbing is overkill for that case.
