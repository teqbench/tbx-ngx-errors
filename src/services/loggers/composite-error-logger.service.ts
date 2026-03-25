import { Injectable } from '@angular/core';
import type { ErrorContextModel } from '../../models/error-context.model';
import { ErrorLoggerService } from './error-logger.service';

/**
 * A composite implementation of ErrorLoggerService that broadcasts errors to
 * multiple registered backends.
 * This enables a "side-effect" pattern, allowing the consuming app to log
 * to the console (for developers) and a notification service (for users)
 * simultaneously without modifying the GlobalErrorHandlerService or
 * httpErrorInterceptor.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * {
 * provide: ErrorLoggerService,
 * useFactory: () => {
 * const composite = new CompositeErrorLoggerService();
 * composite.addLogger(new ConsoleErrorLoggerService());
 * composite.addLogger(inject(ToastErrorLogger));
 * return composite;
 * }
 * }
 * ```
 */
@Injectable()
export class CompositeErrorLoggerService extends ErrorLoggerService {
    private readonly loggers: ErrorLoggerService[] = [];

    /** Registers a new logger implementation into the broadcast pipe. */
    addLogger(logger: ErrorLoggerService): void {
        this.loggers.push(logger);
    }

    /** Dispatches the error and context to all registered loggers. */
    log(context: ErrorContextModel, error: unknown): void {
        this.loggers.forEach((logger) => {
            try {
                logger.log(context, error);
            } catch (e) {
                console.error('CompositeErrorLoggerService: logger failed', e);
            }
        });
    }
}
