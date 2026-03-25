import { CompositeErrorLoggerService } from './composite-error-logger.service';
import { ErrorLoggerService } from './error-logger.service';
import type { ErrorContextModel } from '../../models/error-context.model';

/**
 * Unit tests for CompositeErrorLoggerService.
 * Verifies the broadcast pattern and ensures no failures when no loggers are present.
 */

class MockLogger extends ErrorLoggerService {
    log = vi.fn();
}

describe('CompositeErrorLoggerService', () => {
    // Tells TypeScript: "Treat this as an ErrorContextModel, I know some fields are missing."
    const mockContext = {
        timestamp: '2026-03-06T00:00:00Z',
        url: 'http://localhost',
        message: 'Test Error',
        isHttpError: false,
    } as ErrorContextModel;

    it('should delegate the log call to all registered loggers', () => {
        const composite = new CompositeErrorLoggerService();
        const logger1 = new MockLogger();
        const logger2 = new MockLogger();

        composite.addLogger(logger1);
        composite.addLogger(logger2);

        const error = new Error('Fail');
        composite.log(mockContext, error);

        expect(logger1.log).toHaveBeenCalledWith(mockContext, error);
        expect(logger2.log).toHaveBeenCalledWith(mockContext, error);
    });

    it('should not throw when logging with zero registered loggers', () => {
        const composite = new CompositeErrorLoggerService();
        expect(() => composite.log(mockContext, 'error')).not.toThrow();
    });

    it('should continue dispatching to remaining loggers when one throws', () => {
        const composite = new CompositeErrorLoggerService();
        const failingLogger = new MockLogger();
        failingLogger.log.mockImplementation(() => {
            throw new Error('Logger exploded');
        });
        const survivingLogger = new MockLogger();

        composite.addLogger(failingLogger);
        composite.addLogger(survivingLogger);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Fail');
        composite.log(mockContext, error);

        expect(survivingLogger.log).toHaveBeenCalledWith(mockContext, error);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
