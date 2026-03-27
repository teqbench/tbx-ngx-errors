/**
 * Structured context attached to every error passed through the error
 * handling pipeline. Both the tbxNgxHttpErrorInterceptor and the
 * TbxNgxGlobalErrorHandlerService produce this same shape, ensuring a
 * consistent contract for any logging backend.
 *
 * The generic type parameters allow consuming apps to narrow the
 * classification fields to application-specific enums or literal unions
 * while defaulting to plain strings for simple use cases.
 *
 * @typeParam TSeverity - Type for the severity field (e.g., a string enum).
 * @typeParam TCode - Type for the error code field (e.g., a string enum or number).
 * @typeParam TCategory - Type for the category field (e.g., a string enum).
 */
export interface TbxNgxErrorContextModel<TSeverity = string, TCode = string, TCategory = string> {
    /** ISO-8601 timestamp when the error was captured. */
    readonly timestamp: string;
    /** Browser URL at the time of the error. */
    readonly url: string;
    /** Extracted error message, or stringified value for non-Error types. */
    readonly message: string;
    /** Stack trace when available (Error instances only). */
    readonly stack: string | undefined;
    /** True when the error originated from an HTTP response. */
    readonly isHttpError: boolean;
    /** HTTP status code (populated by the interceptor, undefined for app errors). */
    readonly httpStatus: number | undefined;
    /** HTTP request URL (populated by the interceptor, undefined for app errors). */
    readonly httpUrl: string | undefined;
    /** Optional severity level, populated by the consuming app's logger or error source. */
    readonly severity?: TSeverity;
    /** Optional error code, populated by the consuming app's logger or error source. */
    readonly code?: TCode;
    /** Optional error category, populated by the consuming app's logger or error source. */
    readonly category?: TCategory;
}
