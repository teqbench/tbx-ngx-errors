import { Injectable } from '@angular/core';
import type { TbxNgxErrorContextModel } from '../../models/error-context.model';
import { TbxNgxErrorLoggerService } from './error-logger.service';

/**
 * Composite logger that broadcasts errors to multiple registered backends
 *
 * @remarks
 * Enables a fan-out pattern, allowing the consuming app to log to the console
 * (for developers) and a notification service (for users) simultaneously without
 * modifying any of the capture layers — {@link TbxNgxGlobalErrorHandlerService},
 * {@link tbxNgxHttpErrorInterceptor}, or {@link logClientError}.
 *
 * @usage
 * Use when the application needs to dispatch errors to more than one destination
 * (e.g., console + {@link https://sentry.io | Sentry} + toast notification). Create an instance, register
 * backends with {@link TbxNgxCompositeErrorLoggerService.addLogger | addLogger}, and
 * provide it as the {@link TbxNgxErrorLoggerService} implementation.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * {
 *   provide: TbxNgxErrorLoggerService,
 *   useFactory: () => {
 *     const composite = new TbxNgxCompositeErrorLoggerService();
 *     composite.addLogger(new TbxNgxConsoleErrorLoggerService());
 *     // ToastErrorLogger is a hypothetical consumer-defined subclass
 *     composite.addLogger(inject(ToastErrorLogger));
 *     return composite;
 *   }
 * }
 * ```
 *
 * @category Services
 * @displayName Composite Error Logger Service
 * @order 4
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related TbxNgxConsoleErrorLoggerService
 *
 * @public
 */
@Injectable()
export class TbxNgxCompositeErrorLoggerService extends TbxNgxErrorLoggerService {
    private readonly loggers: TbxNgxErrorLoggerService[] = [];

    /**
     * Register a new logger implementation into the broadcast pipe
     *
     * @param logger - The logger to add to the composite.
     *
     * @public
     */
    addLogger(logger: TbxNgxErrorLoggerService): void {
        this.loggers.push(logger);
    }

    /**
     * Dispatch the error and context to all registered loggers
     *
     * @remarks
     * Each logger is called inside its own try/catch. If a logger throws, the failure
     * is written to `console.error` and the remaining loggers still execute.
     *
     * @param context - Structured metadata describing the error.
     * @param error - The original error value.
     *
     * @public
     */
    log(context: TbxNgxErrorContextModel, error: unknown): void {
        this.loggers.forEach((logger) => {
            try {
                logger.log(context, error);
            } catch (e) {
                console.error('TbxNgxCompositeErrorLoggerService: logger failed', e);
            }
        });
    }
}
