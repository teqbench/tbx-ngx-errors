import { logClientError } from './client-error-logger.util';
import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';

describe('logClientError', () => {
    const mockLogger = {
        log: vi.fn(),
    } as unknown as TbxNgxErrorLoggerService;

    beforeEach(() => vi.clearAllMocks());

    describe('when error is an Error instance', () => {
        it('should build TbxNgxErrorContextModel from the Error and delegate to logger', () => {
            const error = new Error('something failed');
            logClientError('Operation failed', error, mockLogger);

            expect(mockLogger.log).toHaveBeenCalledOnce();
            const [context, originalError] = (mockLogger.log as ReturnType<typeof vi.fn>).mock
                .calls[0];

            expect(context.message).toBe('Operation failed');
            expect(context.stack).toBe(error.stack);
            expect(context.isHttpError).toBe(false);
            expect(context.httpStatus).toBeUndefined();
            expect(context.httpUrl).toBeUndefined();
            expect(context.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
            expect(originalError).toBe(error);
        });
    });

    describe('when error is not an Error instance', () => {
        it('should coerce a string to an Error and use it for the stack', () => {
            logClientError('Op failed', 'raw string error', mockLogger);

            const [context] = (mockLogger.log as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(context.stack).toContain('raw string error');
        });

        it('should coerce an object to an Error', () => {
            logClientError('Op failed', { code: 500 }, mockLogger);

            const [context] = (mockLogger.log as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(context.stack).toBeDefined();
        });
    });

    describe('url field', () => {
        it('should use window.location.href in browser context (JSDOM)', () => {
            logClientError('Op failed', new Error('x'), mockLogger);

            const [context] = (mockLogger.log as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(context.url).toBe(window.location.href);
        });
    });
});
