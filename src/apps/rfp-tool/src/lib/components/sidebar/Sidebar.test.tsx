import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import type { Proposal } from '../../models'

import { Sidebar } from './Sidebar'

const mockRefresh = jest.fn()
const mockUseProposals = jest.fn()

jest.mock('~/libs/ui', () => ({
    Button: ({ label, onClick }: { label: string, onClick?: () => void }) => (
        <button type='button' onClick={onClick}>{label}</button>
    ),
}), { virtual: true })

jest.mock('../new-proposal-modal', () => ({
    NewProposalModal: ({ open, onSuccess }: { open: boolean, onSuccess: (proposalId: string) => void }) => (
        open ? (
            <div>
                <span>new-proposal-modal</span>
                <button type='button' onClick={() => onSuccess('created-proposal-id')}>confirm-create</button>
            </div>
        ) : null
    ),
}))

jest.mock('../..', () => ({
    useProposals: () => mockUseProposals(),
}))

const proposals: Proposal[] = [
    {
        id: 'proposal-1',
        name: 'Benchmarking Util',
        status: 'DRAFT',
        stub: null,
        questions: null,
        answers: null,
        summary: null,
        timerStartedAt: null,
        pdfUrl: null,
        quoteRequestedAt: null,
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T12:00:00.000Z',
    },
    {
        id: 'proposal-2',
        name: 'My Test Proposal',
        status: 'ASSESSED',
        stub: 'Assessment complete',
        questions: ['What is the project budget?'],
        answers: null,
        summary: 'summary',
        timerStartedAt: '2026-02-28T12:00:00.000Z',
        pdfUrl: null,
        quoteRequestedAt: null,
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T12:00:00.000Z',
    },
]

describe('Sidebar', () => {
    beforeEach(() => {
        mockRefresh.mockReset()
        mockUseProposals.mockReturnValue({
            error: undefined,
            isLoading: false,
            proposals,
            refresh: mockRefresh,
        })
    })

    it('renders the proposals header and proposal list', () => {
        render(
            <Sidebar
                activeProposalId='proposal-2'
                onSelectProposal={jest.fn()}
            />,
        )

        expect(screen.getByText('Proposals'))
            .toBeInTheDocument()
        expect(screen.getByText('Benchmarking Util'))
            .toBeInTheDocument()
        expect(screen.getByText('My Test Proposal'))
            .toBeInTheDocument()
    })

    it('selects a proposal when clicked', () => {
        const onSelectProposal = jest.fn()

        render(
            <Sidebar
                activeProposalId={undefined}
                onSelectProposal={onSelectProposal}
            />,
        )

        fireEvent.click(screen.getByText('Benchmarking Util'))

        expect(onSelectProposal)
            .toHaveBeenCalledWith('proposal-1')
    })

    it('opens the new proposal modal and refreshes after success', () => {
        const onSelectProposal = jest.fn()

        render(
            <Sidebar
                activeProposalId={undefined}
                onSelectProposal={onSelectProposal}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'New' }))

        expect(screen.getByText('new-proposal-modal'))
            .toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'confirm-create' }))

        expect(onSelectProposal)
            .toHaveBeenCalledWith('created-proposal-id')
        expect(mockRefresh)
            .toHaveBeenCalled()
    })
})
