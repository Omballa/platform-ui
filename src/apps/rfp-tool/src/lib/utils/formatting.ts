/**
 * Formatting utilities for RFP Tool
 */

/**
 * Format milliseconds as Xm YYs countdown timer display
 */
export const formatCountdownTimer = (milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}m ${seconds.toString()
        .padStart(2, '0')}s`
}

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Math.round((bytes / (k ** i)) * 100) / 100} ${sizes[i]}`
}

/**
 * Format ISO timestamp to readable date string
 */
export const formatDate = (isoString: string): string => {
    try {
        const date = new Date(isoString)
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return 'Invalid date'
    }
}

/**
 * Format ISO timestamp to readable datetime string
 */
export const formatDateTime = (isoString: string): string => {
    try {
        const date = new Date(isoString)
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return 'Invalid date'
    }
}

/**
 * Format word count display (e.g., "245 / 1000 words")
 */
export const formatWordCount = (currentWords: number, maxWords: number): string => `${currentWords} / ${maxWords} words`

/**
 * Truncate filename if too long
 */
export const truncateFileName = (fileName: string, maxLength: number = 30): string => {
    if (fileName.length <= maxLength) {
        return fileName
    }

    const lastDot = fileName.lastIndexOf('.')
    if (lastDot === -1) {
        return `${fileName.substring(0, maxLength - 3)}...`
    }

    const name = fileName.substring(0, lastDot)
    const ext = fileName.substring(lastDot)

    const availableLength = maxLength - ext.length - 3
    return `${name.substring(0, availableLength)}...${ext}`
}
