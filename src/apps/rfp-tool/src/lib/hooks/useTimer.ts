/**
 * useTimer - Hook for 15-minute countdown timer with localStorage persistence
 * Survives page refresh by storing timer start time in localStorage
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { TIMER_DURATION_MS } from '../../config'
import { getFromStorage, removeFromStorage, setToStorage } from '../utils'

interface TimerData {
    proposalId: string
    startedAt: string
    expiresAt: string
}

interface UseTimerResult {
    cancelTimer: () => void
    isActive: boolean
    isExpired: boolean
    resetTimer: () => void
    startTimer: (startedAtIso: string) => void
    timeRemaining: number | undefined
}

/**
 * Hook for managing a 15-minute countdown timer with localStorage persistence
 * @param proposalId - The ID of the proposal being assessed (used as localStorage key)
 * @returns Object with timer state and control methods
 */
export function useTimer(proposalId: string | undefined): UseTimerResult {
    const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined)
    const [isExpired, setIsExpired] = useState(false)
    const [isActive, setIsActive] = useState(false)

    // 9.3: Store expiresAt in a ref after initial read to avoid re-reading storage on every tick
    const expiresAtRef = useRef<number | undefined>(undefined)

    // Generate storage key
    const storageKey = proposalId ? `rfp-tool-timer-${proposalId}` : undefined

    // Load timer from storage on mount
    useEffect(() => {
        if (!storageKey) {
            setTimeRemaining(undefined)
            setIsExpired(false)
            setIsActive(false)
            return
        }

        const timerData = getFromStorage<TimerData>(storageKey)

        if (!timerData) {
            setTimeRemaining(undefined)
            setIsExpired(false)
            setIsActive(false)
            return
        }

        // Check if timer has already expired
        const expiresAt = new Date(timerData.expiresAt).getTime()
        expiresAtRef.current = expiresAt
        const now = Date.now()
        const remaining = expiresAt - now

        if (remaining <= 0) {
            setTimeRemaining(0)
            setIsExpired(true)
            setIsActive(false)
        } else {
            setTimeRemaining(remaining)
            setIsExpired(false)
            setIsActive(true)
        }
    }, [storageKey])

    // Update countdown every second
    useEffect(() => {
        if (!isActive || !storageKey) {
            return undefined
        }

        const updateTimer = (): void => {
            const expiresAt = expiresAtRef.current

            if (expiresAt === undefined) {
                setIsActive(false)
                setIsExpired(false)
                setTimeRemaining(undefined)
                return
            }

            const now = Date.now()
            const remaining = expiresAt - now

            if (remaining <= 0) {
                setTimeRemaining(0)
                setIsExpired(true)
                setIsActive(false)
            } else {
                setTimeRemaining(remaining)
            }
        }

        // Update immediately on first render
        updateTimer()

        // Then update every second
        const interval = setInterval(updateTimer, 1000)

        function cleanupCountdownTimerEffect(): void {
            clearInterval(interval)
        }

        return cleanupCountdownTimerEffect
    }, [isActive, storageKey])

    /**
     * Start the timer (called when Assess button is clicked)
     */
    const startTimer = useCallback(
        (startedAtIso: string) => {
            if (!storageKey || !proposalId) return

            const startedAt = new Date(startedAtIso)
            const expiresAt = new Date(startedAt.getTime() + TIMER_DURATION_MS)
            const remaining = expiresAt.getTime() - Date.now()
            const nextProposalId = proposalId

            const timerData: TimerData = {
                expiresAt: expiresAt.toISOString(),
                proposalId: nextProposalId,
                startedAt: startedAt.toISOString(),
            }

            if (remaining <= 0) {
                removeFromStorage(storageKey)
                setTimeRemaining(0)
                setIsExpired(true)
                setIsActive(false)
                return
            }

            setToStorage(storageKey, timerData)
            expiresAtRef.current = expiresAt.getTime()
            setTimeRemaining(remaining)
            setIsExpired(false)
            setIsActive(true)
        },
        [proposalId, storageKey],
    )

    /**
     * Cancel/stop the timer
     */
    const cancelTimer = useCallback(() => {
        if (storageKey) {
            removeFromStorage(storageKey)
        }

        expiresAtRef.current = undefined
        setTimeRemaining(undefined)
        setIsExpired(false)
        setIsActive(false)
    }, [storageKey])

    /**
     * Reset the timer for the same proposal
     */
    const resetTimer = useCallback(() => {
        if (storageKey) {
            removeFromStorage(storageKey)
        }

        expiresAtRef.current = undefined
        setTimeRemaining(undefined)
        setIsExpired(false)
        setIsActive(false)
    }, [storageKey])

    return {
        cancelTimer,
        isActive,
        isExpired,
        resetTimer,
        startTimer,
        timeRemaining,
    }
}
