import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { QAPanel } from './QAPanel'

const mockDispatch = jest.fn()
const mockNotify = jest.fn()
const mockCancelTimer = jest.fn()
const mockUseSelector = jest.fn()

jest.mock('~/libs/shared', () => ({
    useNotification: () => ({
        notify: mockNotify,
    }),
}), { virtual: true })

jest.mock('../../../redux', () => ({
    answerQuestionsThunk: (proposalId: string, body: { answers: string[] }) => ({
        payload: { body, proposalId },
        type: 'answerQuestionsThunk',
    }),
    useRfpToolDispatch: () => mockDispatch,
    useRfpToolSelector: (selector: (state: { mutations: { answerQuestions: boolean } }) => boolean) => (
        mockUseSelector(selector)
    ),
}))

jest.mock('~/libs/ui', () => ({
    Button: ({ disabled, label, onClick }: { disabled?: boolean, label: string, onClick: () => void }) => (
        <button type='button' disabled={disabled} onClick={onClick}>{label}</button>
    ),
    InputTextarea: ({
        inputControl,
        name,
        placeholder,
    }: {
        inputControl: Record<string, unknown>
        name: string
        placeholder: string
    }) => (
        <textarea aria-label={name} placeholder={placeholder} {...inputControl} />
    ),
    LoadingSpinner: ({ message }: { message?: string }) => <span>{message ?? 'loading'}</span>,
}), { virtual: true })

describe('QAPanel', () => {
    const questions = [
        'What is the project budget?',
        'What is the timeline?',
    ]

    beforeEach(() => {
        mockDispatch.mockReset()
        mockNotify.mockReset()
        mockCancelTimer.mockReset()
        mockUseSelector.mockImplementation((selector: (state: { mutations: { answerQuestions: boolean } }) => boolean) => (
            selector({ mutations: { answerQuestions: false } })
        ))
    })

    it('renders questions and answer inputs after assessment', () => {
        render(
            <QAPanel
                cancelTimer={jest.fn()}
                isExpired={false}
                proposalId='proposal-1'
                questions={questions}
                timerStartedAt='2026-02-28T12:00:00.000Z'
                onAnswerSuccess={jest.fn()}
            />,
        )

        expect(screen.getByText('Please provide answers to these clarifying questions'))
            .toBeInTheDocument()
        expect(screen.getByText(/What is the project budget/i))
            .toBeInTheDocument()
        expect(screen.getByText(/What is the timeline/i))
            .toBeInTheDocument()
    })

    it('keeps the answer button disabled until all answers are present', async () => {
        render(
            <QAPanel
                cancelTimer={jest.fn()}
                isExpired={false}
                proposalId='proposal-1'
                questions={questions}
                timerStartedAt='2026-02-28T12:00:00.000Z'
                onAnswerSuccess={jest.fn()}
            />,
        )

        const answerInputs = screen.getAllByLabelText('answer')

        fireEvent.change(answerInputs[0], {
            target: { value: 'Budget answer' },
        })

        expect(screen.getByRole('button', { name: 'Answer' }))
            .toBeDisabled()
    })

    it('submits answers and redirects to review on success', async () => {
        const onAnswerSuccess = jest.fn()
        mockDispatch.mockResolvedValue({ pdfUrl: '/rfp-tool/mock-proposal.pdf' })

        render(
            <QAPanel
                cancelTimer={mockCancelTimer}
                isExpired={false}
                proposalId='proposal-1'
                questions={questions}
                timerStartedAt='2026-02-28T12:00:00.000Z'
                onAnswerSuccess={onAnswerSuccess}
            />,
        )

        const answerInputs = screen.getAllByLabelText('answer')

        fireEvent.change(answerInputs[0], {
            target: { value: 'Budget answer' },
        })
        fireEvent.change(answerInputs[1], {
            target: { value: 'Timeline answer' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Answer' }))

        await waitFor(() => {
            expect(mockDispatch)
                .toHaveBeenCalledWith({
                    payload: {
                        body: { answers: ['Budget answer', 'Timeline answer'] },
                        proposalId: 'proposal-1',
                    },
                    type: 'answerQuestionsThunk',
                })
        })

        expect(mockCancelTimer)
            .toHaveBeenCalled()
        expect(onAnswerSuccess)
            .toHaveBeenCalledWith(true)
    })
})
