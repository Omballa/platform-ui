import { ASSESSMENT_QUESTIONS } from '../../config'

import { mockHandlers, proposalsStore, resetMockStores } from './proposals.mock'

const flushTimers = async (ms: number): Promise<void> => {
    jest.advanceTimersByTime(ms)
    await Promise.resolve()
}

describe('proposals.mock', () => {
    beforeEach(() => {
        resetMockStores()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns proposals sorted by updatedAt descending', async () => {
        const promise = mockHandlers.getProposals()

        await flushTimers(500)

        const response = await promise
        const updatedTimes = response.proposals.map(proposal => new Date(proposal.updatedAt).getTime())

        expect(response.proposals.length)
            .toBeGreaterThanOrEqual(3)
        expect(updatedTimes)
            .toEqual([...updatedTimes].sort((a, b) => b - a))
    })

    it('creates a draft proposal with generated timestamps', async () => {
        const promise = mockHandlers.createProposal({ name: 'My Test Proposal' })

        await flushTimers(500)

        const proposal = await promise

        expect(proposal.name)
            .toBe('My Test Proposal')
        expect(proposal.status)
            .toBe('DRAFT')
        expect(proposal.summary)
            .toBeNull()
        expect(proposal.id)
            .toBeTruthy()
        expect(proposalsStore.some(item => item.id === proposal.id))
            .toBe(true)
    })

    it('returns the full updated document list after upload', async () => {
        const proposalId = proposalsStore.find(proposal => proposal.name === 'Draft With Docs')!.id
        const existingDocuments = await mockHandlers.getDocuments(proposalId)
        const file = new File(['proposal'], 'AdditionalNotes.txt', { type: 'text/plain' })

        const promise = mockHandlers.uploadDocuments(proposalId, [file])

        await flushTimers(500)

        const documents = await promise

        expect(documents)
            .toHaveLength(existingDocuments.length + 1)
        expect(documents.map(document => document.fileName))
            .toContain('AdditionalNotes.txt')
    })

    it('rejects uploads with unsupported file types', async () => {
        const proposalId = proposalsStore[0].id
        const file = new File(['spreadsheet'], 'Budget.xls', { type: 'application/vnd.ms-excel' })

        await expect(mockHandlers.uploadDocuments(proposalId, [file]))
            .rejects
            .toMatchObject({
                message: 'File type not allowed. Accepted types: .pdf, .doc, .docx, .txt',
                status: 400,
            })
    })

    it('returns the expected questions and timerStartedAt when assessing', async () => {
        const proposalId = proposalsStore.find(proposal => proposal.status === 'DRAFT')!.id
        const promise = mockHandlers.assessProposal(proposalId, { summary: 'Valid summary content' })

        await flushTimers(1500)

        const response = await promise

        expect(response.questions)
            .toEqual([...ASSESSMENT_QUESTIONS])
        expect(response.stub)
            .toBe('Assessment complete')
        expect(response.timerStartedAt)
            .toBeTruthy()
        expect(proposalsStore.find(proposal => proposal.id === proposalId)?.status)
            .toBe('ASSESSED')
    })

    it('rejects summaries that exceed 1000 words', async () => {
        const proposalId = proposalsStore[0].id
        const summary = Array.from({ length: 1001 }, (_, index) => `word${index}`)
            .join(' ')

        await expect(mockHandlers.assessProposal(proposalId, { summary }))
            .rejects
            .toMatchObject({
                message: 'Summary must not exceed 1000 words',
                status: 400,
            })
    })

    it('rejects answers when the assessment timer has expired', async () => {
        const proposalId = proposalsStore.find(proposal => proposal.name === 'Assessed Expired')!.id

        await expect(mockHandlers.answerQuestions(proposalId, { answers: ['a', 'b', 'c', 'd', 'e'] }))
            .rejects
            .toMatchObject({
                message: 'The assessment context has expired. Please re-assess the proposal.',
                status: 408,
            })
    })

    it('completes a proposal after valid answers', async () => {
        const proposalId = proposalsStore.find(proposal => proposal.name === 'Assessed Warning')!.id
        const promise = mockHandlers.answerQuestions(proposalId, {
            answers: ['1', '2', '3', '4', '5'],
        })

        await flushTimers(2000)

        const response = await promise
        const updatedProposal = proposalsStore.find(proposal => proposal.id === proposalId)

        expect(response.pdfUrl)
            .toContain('/rfp-tool/mock-proposal.pdf')
        expect(updatedProposal?.status)
            .toBe('COMPLETED')
        expect(updatedProposal?.timerStartedAt)
            .toBeNull()
    })

    it('requests a quote only for completed proposals', async () => {
        const completedProposalId = proposalsStore.find(proposal => proposal.name === 'Completed Proposal')!.id
        const promise = mockHandlers.requestQuote(completedProposalId)

        await flushTimers(500)

        const response = await promise

        expect(response.status)
            .toBe('QUOTE_REQUESTED')
        expect(response.quoteRequestedAt)
            .toBeTruthy()
        expect(proposalsStore.find(proposal => proposal.id === completedProposalId)?.status)
            .toBe('QUOTE_REQUESTED')
    })

    it('rejects quote requests for proposals not in completed status', async () => {
        const proposalId = proposalsStore.find(proposal => proposal.status === 'DRAFT')!.id

        await expect(mockHandlers.requestQuote(proposalId))
            .rejects
            .toMatchObject({
                message: 'Proposal must be in COMPLETED status',
                status: 400,
            })
    })
})
