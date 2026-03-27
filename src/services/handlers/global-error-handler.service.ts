import { ErrorHandler, Injectable, inject, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TbxNgxErrorLoggerService } from '../loggers/error-logger.service';
import type { TbxNgxErrorContextModel } from '../../models/error-context.model';

@Injectable()
export class TbxNgxGlobalErrorHandlerService implements ErrorHandler {
    // inject() is used instead of constructor injection to avoid a circular
    // dependency on ErrorHandler during DI initialization.
    private readonly injector = inject(Injector);

    handleError(error: unknown): void {
        if (error instanceof HttpErrorResponse) {
            return;
        }

        try {
            const logger = this.injector.get(TbxNgxErrorLoggerService);

            let originalError = error;
            // Unwrap promise rejections without using 'any' — cast to a known shape
            // and extract the rejection value for structured logging.
            if (error && typeof error === 'object' && 'rejection' in error) {
                originalError = (error as { rejection: unknown }).rejection;
            }

            const context = this.buildContext(originalError);
            logger.log(context, originalError);
        } catch (metaError) {
            console.error('TbxNgxGlobalErrorHandlerService failed to log error:', error);
            console.error('Logging pipeline failure:', metaError);
        }
    }

    private buildContext(error: unknown): TbxNgxErrorContextModel {
        let message = 'An unknown error occurred';
        let stack: string | undefined;

        if (error instanceof Error) {
            message = error.message;
            stack = error.stack;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error === null || error === undefined) {
            message = 'null';
        } else {
            message = JSON.stringify(error);
        }

        return {
            timestamp: new Date().toISOString(),
            // Guard against SSR — window is undefined in Node.js,
            // and TbxNgxGlobalErrorHandlerService can fire during server-side
            // rendering if an unhandled error occurs in a server context.
            /* v8 ignore next */
            url: typeof window !== 'undefined' ? window.location.href : '',
            message,
            isHttpError: false,
            stack,

            // HTTP-specific fields are not applicable for app errors,
            // but must be set explicitly to satisfy the TbxNgxErrorContextModel interface.
            httpStatus: undefined,
            httpUrl: undefined,
        };
    }
}
