/**
 * Classifies an API error into a user-friendly message.
 * Reads the `status` property set by the axios interceptor.
 */
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const error = err as { status?: number; message?: string }
    const status = error?.status

    if (status === undefined) {
        return 'Unable to connect to the server. Please check your connection.'
    }

    if (status === 408) {
        return 'The assessment context has expired. Please re-assess the proposal.'
    }

    if (status >= 500) {
        return 'Something went wrong. Please try again later.'
    }

    return error.message ?? fallback
}
