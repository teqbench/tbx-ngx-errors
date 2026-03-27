import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';
import type { TbxNgxErrorContextModel } from '../models/error-context.model';

/**
 * Builds a structured TbxNgxErrorContextModel from a caught error value and
 * delegates to the provided TbxNgxErrorLoggerService.
 *
 * Centralises the repeated logError pattern used across services and
 * components that catch their own errors and route them through the
 * pluggable error logging pipeline.
 *
 * @param message  Human-readable description of the failed operation.
 * @param error    The caught error value (may or may not be an Error instance).
 * @param logger   The injected TbxNgxErrorLoggerService to delegate to.
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
