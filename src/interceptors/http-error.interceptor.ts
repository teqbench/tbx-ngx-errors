import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import type { TbxNgxErrorContextModel } from '../models/error-context.model';
import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';

/**
 * HTTP error interceptor that captures failed responses, builds structured
 * TbxNgxErrorContextModel with HTTP-specific details, and delegates to the same
 * TbxNgxErrorLoggerService backend used by TbxNgxGlobalErrorHandlerService.
 *
 * Every HTTP error is logged, then re-thrown so subscribers can handle
 * it in their own error callbacks (e.g., showing form validation messages).
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
