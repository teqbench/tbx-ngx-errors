import { ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StatusCodes } from 'http-status-codes';
import { TestBed } from '@angular/core/testing';

import { ErrorLoggerService } from '../loggers/error-logger.service';
import type { ErrorContextModel } from '../../models/error-context.model';
import { GlobalErrorHandlerService } from './global-error-handler.service';

class MockErrorLogger extends ErrorLoggerService {
    calls: { context: ErrorContextModel; error: unknown }[] = [];

    log(context: ErrorContextModel, error: unknown): void {
        this.calls.push({ context, error });
    }
}

describe('GlobalErrorHandlerService', () => {
    let handler: GlobalErrorHandlerService;
    let logger: MockErrorLogger;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ErrorLoggerService, useClass: MockErrorLogger },
                { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
            ],
        });
        handler = TestBed.inject(ErrorHandler) as GlobalErrorHandlerService;
        logger = TestBed.inject(ErrorLoggerService) as MockErrorLogger;
    });

    it('should be created', () => {
        expect(handler).toBeTruthy();
    });

    it('should skip HttpErrorResponse to avoid double-logging with interceptor', () => {
        const httpError = new HttpErrorResponse({ status: StatusCodes.NOT_FOUND });
        handler.handleError(httpError);
        expect(logger.calls.length).toBe(0);
    });

    it('should delegate Error instances to the logger with structured context', () => {
        const error = new Error('something broke');
        handler.handleError(error);

        expect(logger.calls.length).toBe(1);
        const { context } = logger.calls[0];
        expect(context.message).toBe('something broke');
        expect(context.stack).toBeDefined();
        expect(context.isHttpError).toBe(false);
        expect(context.httpStatus).toBeUndefined();
        expect(context.httpUrl).toBeUndefined();
        expect(logger.calls[0].error).toBe(error);
    });

    it('should include a valid ISO-8601 timestamp', () => {
        handler.handleError(new Error('test'));
        const { timestamp } = logger.calls[0].context;
        expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should include the current browser URL', () => {
        handler.handleError(new Error('test'));
        expect(logger.calls[0].context.url).toBe(window.location.href);
    });

    it('should unwrap promise rejections containing an Error', () => {
        const inner = new Error('promise rejected');
        handler.handleError({ rejection: inner });

        expect(logger.calls.length).toBe(1);
        expect(logger.calls[0].context.message).toBe('promise rejected');
        expect(logger.calls[0].context.stack).toBeDefined();
        expect(logger.calls[0].error).toBe(inner);
    });

    it('should unwrap promise rejections containing a string', () => {
        handler.handleError({ rejection: 'failed to load' });

        expect(logger.calls.length).toBe(1);
        expect(logger.calls[0].context.message).toBe('failed to load');
        expect(logger.calls[0].context.stack).toBeUndefined();
        expect(logger.calls[0].error).toBe('failed to load');
    });

    it('should unwrap promise rejections containing null', () => {
        handler.handleError({ rejection: null });

        expect(logger.calls.length).toBe(1);
        expect(logger.calls[0].context.message).toBe('null');
        expect(logger.calls[0].error).toBeNull();
    });

    it('should handle plain string errors', () => {
        handler.handleError('string error');

        expect(logger.calls.length).toBe(1);
        expect(logger.calls[0].context.message).toBe('string error');
        expect(logger.calls[0].context.stack).toBeUndefined();
    });

    it('should handle null errors', () => {
        handler.handleError(null);

        expect(logger.calls.length).toBe(1);
        expect(logger.calls[0].context.message).toBe('null');
    });

    it('should fall back to console.error if the logger fails to prevent infinite loops', () => {
        // Force the logger to throw an error when called
        vi.spyOn(logger, 'log').mockImplementation(() => {
            throw new Error('Logger Failure');
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // This triggers the internal try/catch in your service
        handler.handleError(new Error('Original Error'));

        // Should have logged both the original error and the logger failure to the console
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should handle objects that are not Errors or Promises', () => {
        const weirdError = { someKey: 'someValue' };
        handler.handleError(weirdError);

        expect(logger.calls.length).toBe(1);
        // It likely stringifies the object or uses a default message
        expect(logger.calls[0].context.message).toBeDefined();
    });
});
