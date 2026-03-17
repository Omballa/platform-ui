import { getFromStorage, removeFromStorage, setToStorage } from './storage'

describe('getFromStorage', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('returns the stored value when the key exists', () => {
        window.localStorage.setItem('test-key', JSON.stringify({ value: 42 }))
        expect(getFromStorage<{ value: number }>('test-key')).toEqual({ value: 42 })
    })

    it('returns undefined for a missing key', () => {
        expect(getFromStorage('missing-key')).toBeUndefined()
    })

    it('returns undefined for a null value', () => {
        window.localStorage.setItem('null-key', 'null')
        // JSON.parse('null') === null, which is falsy — treated as undefined
        expect(getFromStorage('null-key')).toBeUndefined()
    })

    it('returns undefined for corrupted/invalid JSON', () => {
        window.localStorage.setItem('bad-json', '{not valid json}')
        expect(getFromStorage('bad-json')).toBeUndefined()
    })

    it('returns a stored string value', () => {
        window.localStorage.setItem('str-key', JSON.stringify('hello'))
        expect(getFromStorage<string>('str-key')).toBe('hello')
    })
})

describe('setToStorage', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('stores a value and returns true', () => {
        const result = setToStorage('my-key', { foo: 'bar' })
        expect(result).toBe(true)
        expect(window.localStorage.getItem('my-key')).toBe(JSON.stringify({ foo: 'bar' }))
    })

    it('overwrites an existing value', () => {
        setToStorage('my-key', 'first')
        setToStorage('my-key', 'second')
        expect(getFromStorage<string>('my-key')).toBe('second')
    })
})

describe('removeFromStorage', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('removes an existing key', () => {
        window.localStorage.setItem('remove-me', '"value"')
        removeFromStorage('remove-me')
        expect(window.localStorage.getItem('remove-me')).toBeNull()
    })

    it('does not throw when removing a non-existent key', () => {
        expect(() => removeFromStorage('does-not-exist')).not.toThrow()
    })
})
