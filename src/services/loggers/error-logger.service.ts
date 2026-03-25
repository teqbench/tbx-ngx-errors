import type { ErrorContextModel } from '../../models/error-context.model';

/**
 * Abstract error logger — the extension point for error reporting backends.
 *
 * Both the GlobalErrorHandlerService and httpErrorInterceptor delegate to this
 * class, so swapping the implementation in app.config.ts routes all
 * errors (HTTP and application) to the same backend.
 *
 * The default implementation is ConsoleErrorLoggerService. To integrate a remote
 * service, extend this class and provide it:
 *
 * @example
 * ```typescript
 * // app.config.ts
 * { provide: ErrorLoggerService, useClass: SentryErrorLogger }
 * ```
 */
export abstract class ErrorLoggerService {
    abstract log(context: ErrorContextModel, error: unknown): void;
}
