/**
 * API error types and models
 */

/**
 * Error thrown by mock/service handlers
 * Matches backend error response format
 */
export interface ApiErrorResponse {
    statusCode: number
    message: string
    error?: string
    timestamp?: string
    path?: string
}

/**
 * Error with status code for easy HTTP error handling
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message)
        this.name = 'ApiError'
    }
}
