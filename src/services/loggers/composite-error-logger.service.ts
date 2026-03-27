import { Injectable } from '@angular/core';
import type { TbxNgxErrorContextModel } from '../../models/error-context.model';
import { TbxNgxErrorLoggerService } from './error-logger.service';

/**
 * A composite implementation of TbxNgxErrorLoggerService that broadcasts errors to
 * multiple registered backends.
 * This enables a "side-effect" pattern, allowing the consuming app to log
 * to the console (for developers) and a notification service (for users)
 * simultaneously without modifying the TbxNgxGlobalErrorHandlerService or
 * tbxNgxHttpErrorInterceptor.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * {
 * provide: TbxNgxErrorLoggerService,
 * useFactory: () => {
 * const composite = new TbxNgxCompositeErrorLoggerService();
 * composite.addLogger(new TbxNgxConsoleErrorLoggerService());
 * composite.addLogger(inject(ToastErrorLogger));
 * return composite;
 * }
 * }
 * ```
 */
@Injectable()
export class TbxNgxCompositeErrorLoggerService extends TbxNgxErrorLoggerService {
    private readonly loggers: TbxNgxErrorLoggerService[] = [];

    /** Registers a new logger implementation into the broadcast pipe. */
    addLogger(logger: TbxNgxErrorLoggerService): void {
        this.loggers.push(logger);
    }

    /** Dispatches the error and context to all registered loggers. */
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
