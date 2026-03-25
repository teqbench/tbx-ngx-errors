import { Injectable } from '@angular/core';

import type { ErrorContextModel } from '../../models/error-context.model';
import { ErrorLoggerService } from './error-logger.service';

/**
 * Default error logger that writes structured output to the browser console.
 *
 * HTTP errors and application errors are formatted distinctly for quick
 * identification during development. Replace with a remote logger
 * (Sentry, LogRocket, custom API) for production use.
 */
@Injectable()
export class ConsoleErrorLoggerService extends ErrorLoggerService {
    log(context: ErrorContextModel, error: unknown): void {
        const prefix = context.isHttpError
            ? `[HTTP ${context.httpStatus}] ${context.httpUrl}`
            : `[AppError] ${context.message}`;

        console.error(`${prefix} (${context.timestamp})`, { context, error });
    }
}
