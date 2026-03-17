import { getFileExtension, getWordCount } from './validation'

describe('getFileExtension', () => {
    it('returns the extension with a leading dot', () => {
        expect(getFileExtension('document.pdf')).toBe('.pdf')
    })

    it('returns lowercase extension', () => {
        expect(getFileExtension('IMAGE.PNG')).toBe('.png')
    })

    it('returns the last extension for multiple dots', () => {
        expect(getFileExtension('file.tar.gz')).toBe('.gz')
    })

    it('returns empty string when there is no extension', () => {
        expect(getFileExtension('README')).toBe('')
    })

    it('returns empty string for an empty string input', () => {
        expect(getFileExtension('')).toBe('')
    })

    it('handles dots in directory-like path segments', () => {
        expect(getFileExtension('my.folder/file.txt')).toBe('.txt')
    })

    it('returns empty string for a filename that is only a dot', () => {
        expect(getFileExtension('.')).toBe('')
    })
})

describe('getWordCount', () => {
    it('counts words in a normal sentence', () => {
        expect(getWordCount('hello world')).toBe(2)
    })

    it('returns 0 for an empty string', () => {
        expect(getWordCount('')).toBe(0)
    })

    it('returns 0 for a whitespace-only string', () => {
        expect(getWordCount('   ')).toBe(0)
    })

    it('handles multiple spaces between words', () => {
        expect(getWordCount('one   two   three')).toBe(3)
    })

    it('handles newlines as whitespace', () => {
        expect(getWordCount('line one\nline two')).toBe(4)
    })

    it('handles tabs as whitespace', () => {
        expect(getWordCount('word1\tword2')).toBe(2)
    })

    it('counts a single word', () => {
        expect(getWordCount('hello')).toBe(1)
    })
})
