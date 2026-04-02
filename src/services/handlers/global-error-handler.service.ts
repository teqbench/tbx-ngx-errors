import { ErrorHandler, Injectable, inject, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TbxNgxErrorLoggerService } from '../loggers/error-logger.service';
import type { TbxNgxErrorContextModel } from '../../models/error-context.model';

/**
 * {@link https://angular.dev | Angular} {@link https://angular.dev/api/core/ErrorHandler | ErrorHandler} that captures uncaught application errors and routes them through the logging pipeline
 *
 * @remarks
 * HTTP errors are skipped because they are already handled by
 * {@link tbxNgxHttpErrorInterceptor}. Promise rejections are automatically unwrapped
 * before logging. Uses {@link https://angular.dev/api/core/Injector | Injector} to lazily resolve {@link TbxNgxErrorLoggerService},
 * avoiding a circular dependency on `ErrorHandler` during DI initialization.
 *
 * @usage
 * Provide as {@link https://angular.dev | Angular}'s `ErrorHandler` in `app.config.ts` to capture all uncaught
 * application errors and route them through the pluggable logging pipeline.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * { provide: ErrorHandler, useClass: TbxNgxGlobalErrorHandlerService }
 * ```
 *
 * @category Services
 * @displayName Global Error Handler Service
 * @order 5
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related tbxNgxHttpErrorInterceptor
 * @related TbxNgxErrorContextModel
 *
 * @see {@link https://angular.dev/api/core/ErrorHandler | Angular ErrorHandler}
 *
 * @public
 */
@Injectable()
export class TbxNgxGlobalErrorHandlerService implements ErrorHandler {
    // inject() is used instead of constructor injection to avoid a circular
    // dependency on ErrorHandler during DI initialization.
    private readonly injector = inject(Injector);

    /**
     * Handle an uncaught error by building context and delegating to the logger
     *
     * @param error - The uncaught error value.
     *
     * @public
     */
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

    /**
     * Construct a TbxNgxErrorContextModel from an arbitrary error value
     *
     * @internal
     */
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
