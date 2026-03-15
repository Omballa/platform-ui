import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { Proposal } from '../../models'

import { ReviewTab } from './ReviewTab'

const mockDispatch = jest.fn()
const mockNotify = jest.fn()
const mockRefresh = jest.fn()
const mockUpdateProposal = jest.fn()
const mockUseProposal = jest.fn()
const mockUseSelector = jest.fn()

jest.mock('~/libs/shared', () => ({
    useNotification: () => ({
        notify: mockNotify,
    }),
}), { virtual: true })

jest.mock('../../../redux', () => ({
    requestQuoteThunk: (proposalId: string) => ({
        payload: { proposalId },
        type: 'requestQuoteThunk',
    }),
    useRfpToolDispatch: () => mockDispatch,
    useRfpToolSelector: (selector: (state: { mutations: { requestQuote: boolean } }) => boolean) => (
        mockUseSelector(selector)
    ),
}))

jest.mock('../../hooks', () => ({
    useProposal: (proposalId: string | undefined) => mockUseProposal(proposalId),
}))

jest.mock('~/libs/ui', () => ({
    Button: ({ disabled, label, onClick }: { disabled?: boolean, label: string, onClick: () => void }) => (
        <button type='button' disabled={disabled} onClick={onClick}>{label}</button>
    ),
}), { virtual: true })

const buildProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
    id: 'proposal-1',
    name: 'Completed Proposal',
    status: 'COMPLETED',
    stub: 'Assessment complete',
    questions: ['What is the project budget?'],
    answers: ['Approved'],
    summary: 'summary',
    timerStartedAt: null,
    pdfUrl: '/rfp-tool/mock-proposal.pdf',
    quoteRequestedAt: null,
    createdAt: '2026-02-28T12:00:00.000Z',
    updatedAt: '2026-02-28T12:00:00.000Z',
    ...overrides,
})

describe('ReviewTab', () => {
    beforeEach(() => {
        mockDispatch.mockReset()
        mockNotify.mockReset()
        mockRefresh.mockReset()
        mockUpdateProposal.mockReset()
        mockUseSelector.mockImplementation((selector: (state: { mutations: { requestQuote: boolean } }) => boolean) => (
            selector({ mutations: { requestQuote: false } })
        ))
        mockUseProposal.mockImplementation(() => ({
            proposal: buildProposal(),
            refresh: mockRefresh,
            updateProposal: mockUpdateProposal,
        }))
    })

    it('shows an informational message when the proposal is incomplete', () => {
        mockUseProposal.mockImplementation(() => ({
            proposal: buildProposal({
                pdfUrl: null,
                status: 'DRAFT',
            }),
            refresh: mockRefresh,
            updateProposal: mockUpdateProposal,
        }))

        render(<ReviewTab proposalId='proposal-1' />)

        expect(screen.getByText('Please complete the proposal in the Build tab before reviewing'))
            .toBeInTheDocument()
    })

    it('renders the PDF iframe for completed proposals', () => {
        render(<ReviewTab proposalId='proposal-1' />)

        expect(screen.getByTitle('Proposal PDF'))
            .toHaveAttribute('src', '/rfp-tool/mock-proposal.pdf')
        expect(screen.getByRole('button', { name: 'Request Quote' }))
            .toBeInTheDocument()
    })

    it('requests a quote and persists the quote requested state', async () => {
        mockDispatch.mockResolvedValue({
            id: 'proposal-1',
            quoteRequestedAt: '2026-02-28T13:00:00.000Z',
            status: 'QUOTE_REQUESTED',
        })

        render(<ReviewTab proposalId='proposal-1' />)

        fireEvent.click(screen.getByRole('button', { name: 'Request Quote' }))

        await waitFor(() => {
            expect(mockDispatch)
                .toHaveBeenCalledWith({
                    payload: { proposalId: 'proposal-1' },
                    type: 'requestQuoteThunk',
                })
        })

        await waitFor(() => {
            expect(mockUpdateProposal)
                .toHaveBeenCalledWith({
                    quoteRequestedAt: '2026-02-28T13:00:00.000Z',
                    status: 'QUOTE_REQUESTED',
                })
            expect(mockRefresh)
                .toHaveBeenCalled()
        })
    })
})
