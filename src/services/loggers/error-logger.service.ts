import type { TbxNgxErrorContextModel } from '../../models/error-context.model';

/**
 * Abstract error logger — the extension point for error reporting backends
 *
 * @remarks
 * Both {@link TbxNgxGlobalErrorHandlerService} and {@link tbxNgxHttpErrorInterceptor}
 * delegate to this class, so swapping the implementation in `app.config.ts` routes all
 * errors (HTTP and application) to the same backend.
 *
 * The package ships {@link TbxNgxConsoleErrorLoggerService} as a ready-made implementation,
 * but consumers must explicitly register it (or a custom subclass) via
 * `{ provide: TbxNgxErrorLoggerService, useClass: ... }` in `app.config.ts`.
 *
 * @usage
 * Extend this class to create a custom error logging backend. Provide the subclass
 * via {@link https://angular.dev | Angular} DI to route all pipeline errors to the custom destination.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * // SentryErrorLogger is a hypothetical consumer-defined subclass
 * { provide: TbxNgxErrorLoggerService, useClass: SentryErrorLogger }
 * ```
 *
 * @category Services
 * @category Contract
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
