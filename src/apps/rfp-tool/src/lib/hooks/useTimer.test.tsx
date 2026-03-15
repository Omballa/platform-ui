import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'

import { TIMER_DURATION_MS } from '../../config'

import { useTimer } from './useTimer'

describe('useTimer', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2026-02-28T12:00:00.000Z'))
        window.localStorage.clear()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('starts a timer and persists it to localStorage', () => {
        const { result } = renderHook(() => useTimer('proposal-a'))
        const startedAt = new Date(Date.now()).toISOString()

        act(() => {
            result.current.startTimer(startedAt)
        })

        expect(result.current.isActive)
            .toBe(true)
        expect(result.current.isExpired)
            .toBe(false)
        expect(result.current.timeRemaining)
            .toBe(TIMER_DURATION_MS)
        expect(window.localStorage.getItem('rfp-tool-timer-proposal-a'))
            .toContain('proposal-a')
    })

    it('hydrates a running timer from localStorage for the active proposal only', () => {
        const startedAt = new Date(Date.now() - 60_000).toISOString()

        const { result: firstResult } = renderHook(() => useTimer('proposal-a'))
        act(() => {
            firstResult.current.startTimer(startedAt)
        })

        const { result: secondResult } = renderHook(() => useTimer('proposal-a'))
        const { result: otherProposalResult } = renderHook(() => useTimer('proposal-b'))

        expect(secondResult.current.isActive)
            .toBe(true)
        expect(secondResult.current.timeRemaining)
            .toBeGreaterThan(0)
        expect(secondResult.current.timeRemaining)
            .toBeLessThan(TIMER_DURATION_MS)
        expect(otherProposalResult.current.timeRemaining)
            .toBeUndefined()
    })

    it('expires timers based on the stored startedAt timestamp', () => {
        const startedAt = new Date(Date.now() - TIMER_DURATION_MS - 1_000).toISOString()
        const { result } = renderHook(() => useTimer('proposal-expired'))

        act(() => {
            result.current.startTimer(startedAt)
        })

        expect(result.current.isExpired)
            .toBe(true)
        expect(result.current.isActive)
            .toBe(false)
        expect(result.current.timeRemaining)
            .toBe(0)
    })

    it('updates the countdown over time and can be cancelled', () => {
        const startedAt = new Date(Date.now()).toISOString()
        const { result } = renderHook(() => useTimer('proposal-c'))

        act(() => {
            result.current.startTimer(startedAt)
        })

        act(() => {
            jest.advanceTimersByTime(5_000)
        })

        expect(result.current.timeRemaining)
            .toBe(TIMER_DURATION_MS - 5_000)

        act(() => {
            result.current.cancelTimer()
        })

        expect(result.current.timeRemaining)
            .toBeUndefined()
        expect(result.current.isActive)
            .toBe(false)
        expect(window.localStorage.getItem('rfp-tool-timer-proposal-c'))
            .toBeNull()
    })
})
