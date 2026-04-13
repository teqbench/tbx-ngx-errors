/**
 * Pluggable multi-layer error handling pipeline for {@link https://angular.dev | Angular}
 *
 * @remarks
 * Provides three error-capture layers — an HTTP error interceptor ({@link tbxNgxHttpErrorInterceptor}),
 * a global error handler ({@link TbxNgxGlobalErrorHandlerService}), and a manual client-error
 * logger utility ({@link logClientError}) — all unified through a swappable
 * {@link TbxNgxErrorLoggerService} abstraction. Every error, caught and uncaught, HTTP and
 * application, flows through a single extension point, making it simple to plug in remote
 * logging backends like {@link https://sentry.io | Sentry} or {@link https://logrocket.com | LogRocket}.
 *
 * Key exports:
 *
 * - {@link TbxNgxErrorContextModel} — Structured context attached to every error.
 * - {@link TbxNgxErrorLoggerService} — Abstract logger that backends implement.
 * - {@link TbxNgxConsoleErrorLoggerService} — Default console-based logger.
 * - {@link TbxNgxCompositeErrorLoggerService} — Fan-out logger for multiple backends.
 * - {@link TbxNgxGlobalErrorHandlerService} — {@link https://angular.dev | Angular} ErrorHandler implementation.
 * - {@link tbxNgxHttpErrorInterceptor} — HTTP interceptor function.
 * - {@link logClientError} — Utility for manually logging caught errors.
 *
 * @see {@link https://angular.dev | Angular}
 *
 * @packageDocumentation
 */

// Models
export * from './models/error-context.model';

// Services
export * from './services/loggers/error-logger.service';
export * from './services/loggers/console-error-logger.service';
export * from './services/loggers/composite-error-logger.service';
export * from './services/handlers/global-error-handler.service';

// Interceptors
export * from './interceptors/http-error.interceptor';

// Utilities
export * from './utils/client-error-logger.util';
