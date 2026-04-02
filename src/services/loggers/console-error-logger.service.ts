import { Injectable } from '@angular/core';

import type { TbxNgxErrorContextModel } from '../../models/error-context.model';
import { TbxNgxErrorLoggerService } from './error-logger.service';

/**
 * Default error logger that writes structured output to the browser console
 *
 * @remarks
 * HTTP errors and application errors are formatted distinctly for quick identification
 * during development. Replace with a remote logger ({@link https://sentry.io | Sentry},
 * {@link https://logrocket.com | LogRocket}, custom API) for production use.
 *
 * @usage
 * Use as the default logger during development. For production, swap in a remote
 * logging implementation via the {@link TbxNgxErrorLoggerService} DI token.
 *
 * @category Services
 * @displayName Console Error Logger Service
 * @order 3
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related TbxNgxCompositeErrorLoggerService
 *
 * @public
 */
@Injectable()
export class TbxNgxConsoleErrorLoggerService extends TbxNgxErrorLoggerService {
    /**
     * Log an error to the browser console with a formatted prefix
     *
     * @param context - Structured metadata describing the error.
     * @param error - The original error value.
     *
     * @public
     */
    log(context: TbxNgxErrorContextModel, error: unknown): void {
        const prefix = context.isHttpError
            ? `[HTTP ${context.httpStatus}] ${context.httpUrl}`
            : `[AppError] ${context.message}`;

        console.error(`${prefix} (${context.timestamp})`, { context, error });
    }
}
