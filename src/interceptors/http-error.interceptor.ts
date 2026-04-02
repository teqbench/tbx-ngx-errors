import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import type { TbxNgxErrorContextModel } from '../models/error-context.model';
import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';

/**
 * HTTP error interceptor that captures failed responses and delegates to the logging pipeline
 *
 * @remarks
 * Builds a structured {@link TbxNgxErrorContextModel} with HTTP-specific details
 * (status code, request URL) and delegates to the same {@link TbxNgxErrorLoggerService}
 * backend used by {@link TbxNgxGlobalErrorHandlerService}.
 *
 * Every HTTP error is logged, then re-thrown so subscribers can handle it in their own
 * error callbacks (e.g., showing form validation messages).
 *
 * @usage
 * Register as an HTTP interceptor in `app.config.ts` using `provideHttpClient` with
 * `withInterceptors` to automatically capture and log all HTTP errors.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * provideHttpClient(withInterceptors([tbxNgxHttpErrorInterceptor]))
 * ```
 *
 * @category Interceptors
 * @displayName HTTP Error Interceptor
 * @order 6
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related TbxNgxGlobalErrorHandlerService
 * @related TbxNgxErrorContextModel
 *
 * @public
 */
export const tbxNgxHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const logger = inject(TbxNgxErrorLoggerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const context: TbxNgxErrorContextModel = {
                timestamp: new Date().toISOString(),
                // Guard against SSR — window is undefined in Node.js,
                // and interceptors run during server-side rendering when
                // the app pre-fetches data.
                /* v8 ignore next */
                url: typeof window !== 'undefined' ? window.location.href : '',
                message: error.message,
                stack: undefined,
                isHttpError: true,
                httpStatus: error.status,
                // error.url is the final URL after any server-side redirects —
                // more accurate for debugging. It is null on network errors
                // (no response received), in which case we fall back to the
                // original request URL. Angular's HttpTestingController always
                // populates error.url, making the fallback unreachable in tests.
                /* v8 ignore next */
                httpUrl: error.url ?? req.url,
            };

            logger.log(context, error);

            return throwError(() => error);
        })
    );
};
