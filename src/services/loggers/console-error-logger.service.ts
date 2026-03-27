import { Injectable } from '@angular/core';

import type { TbxNgxErrorContextModel } from '../../models/error-context.model';
import { TbxNgxErrorLoggerService } from './error-logger.service';

/**
 * Default error logger that writes structured output to the browser console.
 *
 * HTTP errors and application errors are formatted distinctly for quick
 * identification during development. Replace with a remote logger
 * (Sentry, LogRocket, custom API) for production use.
 */
@Injectable()
export class TbxNgxConsoleErrorLoggerService extends TbxNgxErrorLoggerService {
    log(context: TbxNgxErrorContextModel, error: unknown): void {
        const prefix = context.isHttpError
            ? `[HTTP ${context.httpStatus}] ${context.httpUrl}`
            : `[AppError] ${context.message}`;

        console.error(`${prefix} (${context.timestamp})`, { context, error });
    }
}
