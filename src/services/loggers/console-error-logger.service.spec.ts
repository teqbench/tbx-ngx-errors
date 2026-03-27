import { TbxNgxConsoleErrorLoggerService } from './console-error-logger.service';
import type { TbxNgxErrorContextModel } from '../../models/error-context.model';
import { StatusCodes } from 'http-status-codes';

describe('TbxNgxConsoleErrorLoggerService', () => {
    let logger: TbxNgxConsoleErrorLoggerService;
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        logger = new TbxNgxConsoleErrorLoggerService();
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be created', () => {
        expect(logger).toBeTruthy();
    });

    it('should format application errors with message prefix', () => {
        const context: TbxNgxErrorContextModel = {
            timestamp: '2025-01-15T12:00:00.000Z',
            url: 'http://localhost/',
            message: 'test error',
            stack: 'Error: test error\n    at <anonymous>',
            isHttpError: false,
            httpStatus: undefined,
            httpUrl: undefined,
        };
        const error = new Error('test error');

        logger.log(context, error);

        expect(consoleSpy).toHaveBeenCalledWith(
            '[AppError] test error (2025-01-15T12:00:00.000Z)',
            { context, error }
        );
    });

    it('should format HTTP errors with status and request URL', () => {
        const context: TbxNgxErrorContextModel = {
            timestamp: '2025-01-15T12:00:00.000Z',
            url: 'http://localhost/dashboard',
            message: 'Http failure response for /api/users: 500 Server Error',
            stack: undefined,
            isHttpError: true,
            httpStatus: 500,
            httpUrl: '/api/users',
        };
        const error = { status: StatusCodes.INTERNAL_SERVER_ERROR };

        logger.log(context, error);

        expect(consoleSpy).toHaveBeenCalledWith(
            '[HTTP 500] /api/users (2025-01-15T12:00:00.000Z)',
            { context, error }
        );
    });
});
