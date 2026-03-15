import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { NewProposalModal } from './NewProposalModal'

const mockDispatch = jest.fn()
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()
const mockUseSelector = jest.fn()

jest.mock('react-toastify', () => ({
    toast: {
        POSITION: {
            BOTTOM_RIGHT: 'bottom-right',
        },
        error: (...args: unknown[]) => mockToastError(...args),
        success: (...args: unknown[]) => mockToastSuccess(...args),
    },
}))

jest.mock('../../../redux', () => ({
    createProposalThunk: (body: { name: string }) => ({ payload: body, type: 'createProposalThunk' }),
    useRfpToolDispatch: () => mockDispatch,
    useRfpToolSelector: (selector: (state: { mutations: { createProposal: boolean } }) => boolean) => (
        mockUseSelector(selector)
    ),
}))

jest.mock('~/libs/ui', () => ({
    ConfirmModal: ({
        action,
        canSave,
        children,
        onClose,
        onConfirm,
        open,
        title,
    }: {
        action: string
        canSave: boolean
        children: ReactNode
        onClose: () => void
        onConfirm: () => void
        open: boolean
        title: string
    }) => (
        open ? (
            <div>
                <h1>{title}</h1>
                {children}
                <button type='button' onClick={onClose}>close</button>
                <button type='button' onClick={onConfirm} disabled={!canSave}>{action}</button>
            </div>
        ) : null
    ),
    InputText: ({
        error,
        inputControl,
        label,
        placeholder,
    }: {
        error?: string
        inputControl: Record<string, unknown>
        label: string
        placeholder: string
    }) => (
        <label>
            {label}
            <input aria-label={label} placeholder={placeholder} {...inputControl} />
            {error && <span>{error}</span>}
        </label>
    ),
}), { virtual: true })

describe('NewProposalModal', () => {
    beforeEach(() => {
        mockDispatch.mockReset()
        mockToastError.mockReset()
        mockToastSuccess.mockReset()
        mockUseSelector.mockImplementation((selector: (state: { mutations: { createProposal: boolean } }) => boolean) => (
            selector({ mutations: { createProposal: false } })
        ))
    })

    it('validates proposal name before submit', async () => {
        render(
            <NewProposalModal
                open
                onClose={jest.fn()}
                onSuccess={jest.fn()}
            />,
        )

        expect(screen.getByRole('button', { name: 'Create' }))
            .toBeDisabled()
    })

    it('dispatches create proposal and calls onSuccess', async () => {
        const onSuccess = jest.fn()
        mockDispatch.mockResolvedValue({ id: 'new-proposal-id' })

        render(
            <NewProposalModal
                open
                onClose={jest.fn()}
                onSuccess={onSuccess}
            />,
        )

        fireEvent.change(screen.getByLabelText('Proposal Name'), {
            target: { value: 'My Test Proposal' },
        })
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Create' }))
                .not.toBeDisabled()
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        await waitFor(() => {
            expect(mockDispatch)
                .toHaveBeenCalledWith({
                    payload: { name: 'My Test Proposal' },
                    type: 'createProposalThunk',
                })
        })

        await waitFor(() => {
            expect(onSuccess)
                .toHaveBeenCalledWith('new-proposal-id')
            expect(mockToastSuccess)
                .toHaveBeenCalledWith(
                    'Proposal created successfully',
                    { position: 'bottom-right' },
                )
        })
    })
})
