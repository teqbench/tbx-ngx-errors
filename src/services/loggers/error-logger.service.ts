import type { TbxNgxErrorContextModel } from '../../models/error-context.model';

/**
 * Abstract error logger — the extension point for error reporting backends.
 *
 * Both the TbxNgxGlobalErrorHandlerService and tbxNgxHttpErrorInterceptor delegate to this
 * class, so swapping the implementation in app.config.ts routes all
 * errors (HTTP and application) to the same backend.
 *
 * The default implementation is TbxNgxConsoleErrorLoggerService. To integrate a remote
 * service, extend this class and provide it:
 *
 * @example
 * ```typescript
 * // app.config.ts
 * { provide: TbxNgxErrorLoggerService, useClass: SentryErrorLogger }
 * ```
 */
export abstract class TbxNgxErrorLoggerService {
    abstract log(context: TbxNgxErrorContextModel, error: unknown): void;
}
