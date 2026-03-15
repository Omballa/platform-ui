/**
 * useLocalStorage - Generic hook for localStorage synchronization
 */

import { useCallback, useEffect, useState } from 'react'

import { getFromStorage, removeFromStorage, setToStorage } from '../utils'

export interface UseLocalStorageOptions {
    /**
     * If true, logs debug info to console
     */
    debug?: boolean
    /**
     * If true, removes item from storage when component unmounts
     */
    removeOnUnmount?: boolean
    /**
     * Sync across browser tabs
     */
    syncData?: boolean
}

/**
 * Hook for reading/writing to localStorage with React state
 * Automatically syncs between component state and localStorage
 */
export function useLocalStorage<T>(
    key: string,
    initialValue?: T,
    options: UseLocalStorageOptions = {},
): [T | undefined, (value: T | undefined) => void, { remove: () => void }] {
    const removeOnUnmount = options.removeOnUnmount ?? false
    const syncData = options.syncData ?? true

    // State to store our value
    const [storedValue, setStoredValue] = useState<T | undefined>(() => {
        try {
            const item = getFromStorage<T>(key)
            if (item !== undefined) {
                return item
            }

            if (initialValue !== undefined) {
                setToStorage(key, initialValue)
                return initialValue
            }

            return undefined
        } catch {
            return initialValue ?? undefined
        }
    })

    // Update localStorage when state changes
    const setValue = useCallback(
        (value: T | undefined) => {
            try {
                if (value === undefined) {
                    removeFromStorage(key)
                } else {
                    setToStorage(key, value)
                }

                setStoredValue(value)
            } catch {
                // Ignore storage write failures and keep local state unchanged.
            }
        },
        [key],
    )

    // Handle storage events from other tabs
    useEffect(() => {
        if (!syncData) {
            return undefined
        }

        const handleStorageChange = (e: StorageEvent): void => {
            if (e.key === key) {
                if (e.newValue === null) {
                    setStoredValue(undefined)
                } else {
                    try {
                        const parsed = JSON.parse(e.newValue)
                        setStoredValue(parsed)
                    } catch {
                        // Ignore invalid storage payloads from other tabs.
                    }
                }
            }
        }

        function cleanupStorageSyncEffect(): void {
            window.removeEventListener('storage', handleStorageChange)
        }

        window.addEventListener('storage', handleStorageChange)
        return cleanupStorageSyncEffect
    }, [key, syncData])

    // Cleanup on unmount
    useEffect(() => {
        function cleanupRemoveOnUnmountEffect(): void {
            if (removeOnUnmount) {
                removeFromStorage(key)
            }
        }

        return cleanupRemoveOnUnmountEffect
    }, [key, removeOnUnmount])

    return [storedValue, setValue, { remove: () => setValue(undefined) }]
}
