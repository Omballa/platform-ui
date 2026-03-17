import { formatCountdownTimer } from './formatting'

describe('formatCountdownTimer', () => {
    it('formats a standard duration correctly', () => {
        expect(formatCountdownTimer(5 * 60 * 1000)).toBe('5m 00s')
    })

    it('formats exactly 60 seconds', () => {
        expect(formatCountdownTimer(60 * 1000)).toBe('1m 00s')
    })

    it('formats exactly 15 minutes', () => {
        expect(formatCountdownTimer(15 * 60 * 1000)).toBe('15m 00s')
    })

    it('formats mixed minutes and seconds', () => {
        expect(formatCountdownTimer(2 * 60 * 1000 + 35 * 1000)).toBe('2m 35s')
    })

    it('pads single-digit seconds with a leading zero', () => {
        expect(formatCountdownTimer(61 * 1000)).toBe('1m 01s')
    })

    it('returns 0m 00s for zero milliseconds', () => {
        expect(formatCountdownTimer(0)).toBe('0m 00s')
    })

    it('returns 0m 00s for negative values', () => {
        expect(formatCountdownTimer(-5000)).toBe('0m 00s')
    })

    it('formats sub-minute durations', () => {
        expect(formatCountdownTimer(45 * 1000)).toBe('0m 45s')
    })
})
