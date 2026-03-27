/**
 * Public API Surface for @teqbench/tbx-ngx-errors.
 *
 * Pluggable two-layer error handling pipeline for Angular:
 * HTTP interceptor + global error handler, unified through a swappable
 * TbxNgxErrorLoggerService abstraction. All exports below form the package's
 * public API for consuming applications.
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
