import type { TbxNgxErrorContextModel } from '../../models/error-context.model';

/**
 * Abstract error logger — the extension point for error reporting backends
 *
 * @remarks
 * Both {@link TbxNgxGlobalErrorHandlerService} and {@link tbxNgxHttpErrorInterceptor}
 * delegate to this class, so swapping the implementation in `app.config.ts` routes all
 * errors (HTTP and application) to the same backend.
 *
 * The default implementation is {@link TbxNgxConsoleErrorLoggerService}. To integrate a
 * remote service, extend this class and provide it.
 *
 * @usage
 * Extend this class to create a custom error logging backend. Provide the subclass
 * via Angular DI to route all pipeline errors to the custom destination.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * { provide: TbxNgxErrorLoggerService, useClass: SentryErrorLogger }
 * ```
 *
 * @category Services
 * @category Interface
 * @displayName Error Logger Service
 * @order 1
 * @since 1.0.0
 * @related TbxNgxErrorContextModel
 * @related TbxNgxConsoleErrorLoggerService
 * @related TbxNgxCompositeErrorLoggerService
 *
 * @public
 */
export abstract class TbxNgxErrorLoggerService {
    /**
     * Log an error with its structured context
     *
     * @param context - Structured metadata describing the error.
     * @param error - The original error value.
     *
     * @public
     */
    abstract log(context: TbxNgxErrorContextModel, error: unknown): void;
}
