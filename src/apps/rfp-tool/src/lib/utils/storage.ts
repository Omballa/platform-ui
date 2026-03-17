/**
 * LocalStorage utilities for RFP Tool
 */

/**
 * Safely get value from localStorage
 * Returns undefined if key doesn't exist or JSON parsing fails
 */
export const getFromStorage = <T>(key: string): T | undefined => {
    try {
        const item = window.localStorage.getItem(key)
        if (!item) return undefined
        return JSON.parse(item) as T
    } catch {
        return undefined
    }
}

/**
 * Safely set value in localStorage
 * Returns false if it fails
 */
export const setToStorage = <T>(key: string, value: T): boolean => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch {
        return false
    }
}

/**
 * Remove value from localStorage
 */
export const removeFromStorage = (key: string): void => {
    try {
        window.localStorage.removeItem(key)
    } catch {
        // Ignore storage removal failures.
    }
}

/**
 * Clear all localStorage (dangerous, use carefully)
 */
export const clearStorage = (): void => {
    try {
        window.localStorage.clear()
    } catch {
        // Ignore storage clear failures.
    }
}

const pdfUrlKey = (proposalId: string): string => `rfp-tool-pdf-${proposalId}`

export const storePdfUrl = (proposalId: string, pdfUrl: string): void => {
    setToStorage(pdfUrlKey(proposalId), pdfUrl)
}

export const getStoredPdfUrl = (proposalId: string): string | undefined => (
    getFromStorage<string>(pdfUrlKey(proposalId))
)
