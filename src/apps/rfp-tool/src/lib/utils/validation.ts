/**
 * Validation utilities for RFP Tool
 */

import {
    ALLOWED_FILE_TYPES,
    MAX_FILES_PER_PROPOSAL,
    MAX_FILE_SIZE,
    MAX_SUMMARY_WORDS,
} from '../../config'

/**
 * Get the file extension from a filename
 */
export const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : ''
}

/**
 * Validate a single file against size and type constraints
 * @returns Array of error messages (empty if valid)
 */
export const validateFile = (file: File): string[] => {
    const errors: string[] = []

    // Check file type
    const ext = getFileExtension(file.name)
    if (!ALLOWED_FILE_TYPES.includes(ext)) {
        errors.push('File type not allowed. Accepted types: .pdf, .doc, .docx, .txt')
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        errors.push('File exceeds maximum size of 5MB')
    }

    return errors
}

/**
 * Validate a batch of files for upload
 * Checks file type, size, and total count
 * @returns Array of error messages (empty if all valid)
 */
export const validateFiles = (
    files: File[],
    existingCount: number = 0,
): string[] => {
    const errors: string[] = []

    // Check total count
    if (existingCount + files.length > MAX_FILES_PER_PROPOSAL) {
        errors.push('Maximum of 10 documents per proposal exceeded')
        return errors
    }

    // Validate each file
    for (const file of files) {
        const fileErrors = validateFile(file)
        if (fileErrors.length > 0) {
            errors.push(...fileErrors)
            break // Stop on first error for clearer messaging
        }
    }

    return errors
}

/**
 * Get word count from text
 * Splits by whitespace and filters empty strings
 */
export const getWordCount = (text: string): number => text.trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length

/**
 * Validate RFP summary text
 * Checks for required content and word limit
 * @returns Error message or null if valid
 */
export const validateSummary = (text: string): string | undefined => {
    if (!text || text.trim().length === 0) {
        return 'RFP summary is required'
    }

    const wordCount = getWordCount(text)
    if (wordCount > MAX_SUMMARY_WORDS) {
        return `Summary must not exceed ${MAX_SUMMARY_WORDS} words (current: ${wordCount})`
    }

    return undefined
}

/**
 * Validate proposal name
 */
export const validateProposalName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
        return 'Proposal name is required'
    }

    if (name.length > 255) {
        return 'Proposal name must be 255 characters or less'
    }

    return undefined
}

/**
 * Validate that all answers are provided
 */
export const validateAnswers = (answers: string[]): string | undefined => {
    if (!answers || answers.length === 0) {
        return 'All answers are required'
    }

    // Check that all answers have content
    const emptyAnswers = answers.filter(a => !a || a.trim().length === 0)
    if (emptyAnswers.length > 0) {
        return 'All answers must be filled in'
    }

    return undefined
}
