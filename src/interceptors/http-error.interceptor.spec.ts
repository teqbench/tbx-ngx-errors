import { StatusCodes, ReasonPhrases, getReasonPhrase } from 'http-status-codes';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { TbxNgxErrorContextModel } from '../models/error-context.model';
import { TbxNgxErrorLoggerService } from '../services/loggers/error-logger.service';
import { tbxNgxHttpErrorInterceptor } from './http-error.interceptor';

class MockErrorLogger extends TbxNgxErrorLoggerService {
    calls: { context: TbxNgxErrorContextModel; error: unknown }[] = [];

    log(context: TbxNgxErrorContextModel, error: unknown): void {
        this.calls.push({ context, error });
    }
}

describe('tbxNgxHttpErrorInterceptor', () => {
    let http: HttpClient;
    let httpTesting: HttpTestingController;
    let logger: MockErrorLogger;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TbxNgxErrorLoggerService, useClass: MockErrorLogger },
                provideHttpClient(withInterceptors([tbxNgxHttpErrorInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpClient);
        httpTesting = TestBed.inject(HttpTestingController);
        logger = TestBed.inject(TbxNgxErrorLoggerService) as MockErrorLogger;
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('should pass through successful requests without logging', () => {
        let result: unknown;
        http.get('/api/test').subscribe((res) => (result = res));

        httpTesting.expectOne('/api/test').flush({ ok: true });

        expect(result).toEqual({ ok: true });
        expect(logger.calls.length).toBe(0);
    });

    it('should log HTTP errors through TbxNgxErrorLoggerService', () => {
        let error: unknown;
        http.get('/api/test').subscribe({ error: (e) => (error = e) });

        httpTesting.expectOne('/api/test').flush(null, {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });

        expect(error).toBeTruthy();
        expect(logger.calls.length).toBe(1);
    });

    it('should build TbxNgxErrorContextModel with HTTP-specific fields', () => {
        http.get('/api/users').subscribe({ error: () => {} });

        httpTesting
            .expectOne('/api/users')
            .flush(null, { status: StatusCodes.NOT_FOUND, statusText: ReasonPhrases.NOT_FOUND });

        const { context } = logger.calls[0];
        expect(context.isHttpError).toBe(true);
        expect(context.httpStatus).toBe(StatusCodes.NOT_FOUND);
        expect(context.httpUrl).toContain('/api/users');
        expect(context.url).toBe(window.location.href);
        expect(new Date(context.timestamp).toISOString()).toBe(context.timestamp);
    });

    it('should re-throw the error for subscriber handling', () => {
        let subscriberError: unknown;
        http.get('/api/test').subscribe({ error: (e) => (subscriberError = e) });

        httpTesting.expectOne('/api/test').flush(null, {
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
        });

        expect(subscriberError).toBeTruthy();
        expect((subscriberError as { status: number }).status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should populate httpUrl from the response URL', () => {
        http.get('/api/users').subscribe({ error: () => {} });

        httpTesting.expectOne('/api/users').flush(null, {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });

        expect(logger.calls[0].context.httpUrl).toContain('/api/users');
    });

    it('should handle different status codes consistently', () => {
        const statuses = [
            StatusCodes.BAD_REQUEST,
            StatusCodes.UNAUTHORIZED,
            StatusCodes.FORBIDDEN,
            StatusCodes.NOT_FOUND,
            StatusCodes.INTERNAL_SERVER_ERROR,
            StatusCodes.BAD_GATEWAY,
            StatusCodes.SERVICE_UNAVAILABLE,
        ];

        statuses.forEach((status) => {
            http.get(`/api/status/${status}`).subscribe({ error: () => {} });
        });

        statuses.forEach((status) => {
            httpTesting.expectOne(`/api/status/${status}`).flush(null, {
                status,
                statusText: getReasonPhrase(status),
            });
        });

        expect(logger.calls.length).toBe(statuses.length);
        statuses.forEach((status, i) => {
            expect(logger.calls[i].context.httpStatus).toBe(status);
            expect(logger.calls[i].context.isHttpError).toBe(true);
        });
    });
});
