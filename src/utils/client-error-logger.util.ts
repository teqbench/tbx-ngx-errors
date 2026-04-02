import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';
import type { TbxNgxErrorContextModel } from '../models/error-context.model';

/**
 * Log a manually caught error through the pluggable logging pipeline
 *
 * @remarks
 * Builds a {@link TbxNgxErrorContextModel} from the caught value and delegates to the
 * provided {@link TbxNgxErrorLoggerService}, avoiding duplicated context-construction
 * logic across services and components that catch their own errors.
 *
 * @param message - Human-readable description of the failed operation.
 * @param error - The caught error value (may or may not be an Error instance).
 * @param logger - The injected {@link TbxNgxErrorLoggerService} to delegate to.
 *
 * @usage
 * Call from any service or component catch block to route manually caught errors
 * through the same logging pipeline used by the interceptor and global handler.
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logClientError('riskyOperation failed', error, this.logger);
 * }
 * ```
 *
 * @category Utilities
 * @displayName Log Client Error
 * @order 7
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related TbxNgxErrorContextModel
 *
 * @public
 */
export function logClientError(
    message: string,
    error: unknown,
    logger: TbxNgxErrorLoggerService
): void {
    const errorInstance = error instanceof Error ? error : new Error(String(error));

    const context: TbxNgxErrorContextModel = {
        timestamp: new Date().toISOString(),
        /* v8 ignore next */
        url: typeof window !== 'undefined' ? window.location.href : '',
        message,
        stack: errorInstance.stack,
        isHttpError: false,
        httpStatus: undefined,
        httpUrl: undefined,
    };

    logger.log(context, error);
}
