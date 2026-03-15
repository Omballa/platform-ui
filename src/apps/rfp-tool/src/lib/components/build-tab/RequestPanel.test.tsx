import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { RequestPanel } from './RequestPanel'

const mockDispatch = jest.fn()
const mockNotify = jest.fn()
const mockUseSelector = jest.fn()

jest.mock('~/libs/shared', () => ({
    useNotification: () => ({
        notify: mockNotify,
    }),
}), { virtual: true })

jest.mock('../../../redux', () => ({
    assessProposalThunk: (proposalId: string, body: { summary: string }) => ({
        payload: { body, proposalId },
        type: 'assessProposalThunk',
    }),
    useRfpToolDispatch: () => mockDispatch,
    useRfpToolSelector: (selector: (state: { mutations: { assessProposal: boolean } }) => boolean) => (
        mockUseSelector(selector)
    ),
}))

jest.mock('../../hooks', () => ({
    useProposal: () => ({
        proposal: {
            answers: null,
            id: 'proposal-1',
            pdfUrl: null,
            questions: null,
            quoteRequestedAt: null,
            summary: '',
            stub: null,
            timerStartedAt: null,
        },
    }),
}))

jest.mock('~/libs/ui', () => ({
    Button: ({ disabled, label, onClick }: { disabled?: boolean, label: string, onClick: () => void }) => (
        <button type='button' disabled={disabled} onClick={onClick}>{label}</button>
    ),
    InputTextarea: ({
        error,
        inputControl,
        name,
        placeholder,
    }: {
        error?: string
        inputControl: Record<string, unknown>
        name: string
        placeholder: string
    }) => (
        <div>
            <textarea aria-label={name} placeholder={placeholder} {...inputControl} />
            {error && <span>{error}</span>}
        </div>
    ),
    LoadingSpinner: ({ message }: { message?: string }) => <span>{message ?? 'loading'}</span>,
}), { virtual: true })

describe('RequestPanel', () => {
    beforeEach(() => {
        mockDispatch.mockReset()
        mockNotify.mockReset()
        mockUseSelector.mockImplementation((selector: (state: { mutations: { assessProposal: boolean } }) => boolean) => (
            selector({ mutations: { assessProposal: false } })
        ))
    })

    it('renders summary input with word count', () => {
        render(
            <RequestPanel
                proposalId='proposal-1'
                onAssessSuccess={jest.fn()}
            />,
        )

        expect(screen.getByText('Please provide a summary of the RFP (under 1000 words)'))
            .toBeInTheDocument()
        expect(screen.getByText(/0\s*\/\s*1000\s*words/i))
            .toBeInTheDocument()
    })

    it('keeps the assess button disabled until the summary is valid', async () => {
        render(
            <RequestPanel
                proposalId='proposal-1'
                onAssessSuccess={jest.fn()}
            />,
        )

        expect(screen.getByRole('button', { name: 'Assess' }))
            .toBeDisabled()

        fireEvent.change(screen.getByLabelText('summary'), {
            target: { value: 'Valid summary text' },
        })

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Assess' }))
                .not.toBeDisabled()
        })
    })

    it('dispatches assess and returns timerStartedAt on success', async () => {
        const onAssessSuccess = jest.fn()
        mockDispatch.mockResolvedValue({ timerStartedAt: '2026-02-28T12:00:00.000Z' })

        render(
            <RequestPanel
                proposalId='proposal-1'
                onAssessSuccess={onAssessSuccess}
            />,
        )

        fireEvent.change(screen.getByLabelText('summary'), {
            target: { value: 'Valid summary text' },
        })
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Assess' }))
                .not.toBeDisabled()
        })
        fireEvent.click(screen.getByRole('button', { name: 'Assess' }))

        await waitFor(() => {
            expect(mockDispatch)
                .toHaveBeenCalledWith({
                    payload: {
                        body: { summary: 'Valid summary text' },
                        proposalId: 'proposal-1',
                    },
                    type: 'assessProposalThunk',
                })
        })

        await waitFor(() => {
            expect(onAssessSuccess)
                .toHaveBeenCalledWith('2026-02-28T12:00:00.000Z')
        })
    })
})
