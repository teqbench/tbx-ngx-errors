/**
 * Structured context attached to every error passed through the error handling pipeline
 *
 * @remarks
 * Both the {@link tbxNgxHttpErrorInterceptor} and the {@link TbxNgxGlobalErrorHandlerService}
 * produce this same shape, ensuring a consistent contract for any logging backend.
 *
 * The generic type parameters allow consuming apps to narrow the classification fields
 * to application-specific enums or literal unions while defaulting to plain strings for
 * simple use cases.
 *
 * @typeParam TSeverity - Type for the severity field (e.g., a string enum).
 * @typeParam TCode - Type for the error code field (e.g., a string enum or number).
 * @typeParam TCategory - Type for the category field (e.g., a string enum).
 *
 * @usage
 * Use this interface when building custom error loggers that need to inspect or
 * transform error metadata before forwarding to a remote service.
 *
 * @category Models
 * @category Interface
 * @displayName Error Context Model
 * @order 1
 * @since 1.0.0
 * @related TbxNgxErrorLoggerService
 * @related TbxNgxGlobalErrorHandlerService
 * @related tbxNgxHttpErrorInterceptor
 *
 * @public
 */
export interface TbxNgxErrorContextModel<TSeverity = string, TCode = string, TCategory = string> {
    /**
     * {@link https://www.iso.org/iso-8601-date-and-time-format.html | ISO 8601} timestamp when the error was captured
     *
     * @order 1
     *
     * @public
     */
    readonly timestamp: string;

    /**
     * Browser URL at the time of the error
     *
     * @order 2
     *
     * @public
     */
    readonly url: string;

    /**
     * Extracted error message, or stringified value for non-Error types
     *
     * @order 3
     *
     * @public
     */
    readonly message: string;

    /**
     * Stack trace when available (Error instances only)
     *
     * @order 4
     *
     * @public
     */
    readonly stack: string | undefined;

    /**
     * True when the error originated from an HTTP response
     *
     * @order 5
     *
     * @public
     */
    readonly isHttpError: boolean;

    /**
     * HTTP status code (populated by {@link tbxNgxHttpErrorInterceptor}, undefined for app errors)
     *
     * @order 6
     *
     * @public
     */
    readonly httpStatus: number | undefined;

    /**
     * HTTP request URL (populated by {@link tbxNgxHttpErrorInterceptor}, undefined for app errors)
     *
     * @order 7
     *
     * @public
     */
    readonly httpUrl: string | undefined;

    /**
     * Optional severity level for consumer use — the pipeline never sets this field; set it when constructing a context manually
     *
     * @order 1
     *
     * @public
     */
    readonly severity?: TSeverity;

    /**
     * Optional error code for consumer use — the pipeline never sets this field; set it when constructing a context manually
     *
     * @order 2
     *
     * @public
     */
    readonly code?: TCode;

    /**
     * Optional error category for consumer use — the pipeline never sets this field; set it when constructing a context manually
     *
     * @order 3
     *
     * @public
     */
    readonly category?: TCategory;
}
