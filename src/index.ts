/**
 * Pluggable two-layer error handling pipeline for Angular
 *
 * @remarks
 * Provides an HTTP error interceptor ({@link tbxNgxHttpErrorInterceptor}) and a global
 * error handler ({@link TbxNgxGlobalErrorHandlerService}), unified through a swappable
 * {@link TbxNgxErrorLoggerService} abstraction. All errors — HTTP and application — flow
 * through a single extension point, making it simple to plug in remote logging backends
 * like Sentry or LogRocket.
 *
 * Key exports:
 *
 * - {@link TbxNgxErrorContextModel} — Structured context attached to every error.
 * - {@link TbxNgxErrorLoggerService} — Abstract logger that backends implement.
 * - {@link TbxNgxConsoleErrorLoggerService} — Default console-based logger.
 * - {@link TbxNgxCompositeErrorLoggerService} — Fan-out logger for multiple backends.
 * - {@link TbxNgxGlobalErrorHandlerService} — Angular ErrorHandler implementation.
 * - {@link tbxNgxHttpErrorInterceptor} — HTTP interceptor function.
 * - {@link logClientError} — Utility for manually logging caught errors.
 *
 * @packageDocumentation
 */

// Models and Interfaces
export * from './models/error-context.model';
export * from './services/loggers/error-logger.service';

// Logging Implementations
export * from './services/loggers/console-error-logger.service';
export * from './services/loggers/composite-error-logger.service';

// Handlers and Interceptors
export * from './services/handlers/global-error-handler.service';
export * from './interceptors/http-error.interceptor';

// Utilities
export * from './utils/client-error-logger.util';
