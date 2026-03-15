/**
 * NewProposalModal component
 * Modal dialog for creating a new proposal
 * Uses the ConfirmModal component from the UI library
 */

import * as Yup from 'yup'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { yupResolver } from '@hookform/resolvers/yup'
import { ConfirmModal, InputText } from '~/libs/ui'

import { createProposalThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'

const toastOptions = {
    position: toast.POSITION.BOTTOM_RIGHT,
} as const

export interface NewProposalModalProps {
    open: boolean
    onClose: () => void
    onSuccess: (proposalId: string) => void
}

interface NewProposalFormValues {
    proposalName: string
}

const proposalNameSchema = Yup.object({
    proposalName: Yup.string()
        .trim()
        .required('Proposal name is required')
        .max(255, 'Proposal name must be 255 characters or less'),
})

/**
 * NewProposalModal renders a modal for creating a new proposal
 * Uses ConfirmModal component with a text input for the proposal name
 */
export const NewProposalModal: FC<NewProposalModalProps> = props => {
    const dispatch = useRfpToolDispatch()
    const isLoading = useRfpToolSelector(state => state.mutations.createProposal)
    const form = useForm<NewProposalFormValues>({
        defaultValues: {
            proposalName: '',
        },
        mode: 'onChange',
        resolver: yupResolver(proposalNameSchema),
    })

    useEffect(() => {
        if (props.open) {
            form.reset({
                proposalName: '',
            })
        }
    }, [form, props.open])

    function handleClose(): void {
        form.reset({
            proposalName: '',
        })
        props.onClose()
    }

    function handleInputChange(): void {
        // noop required by shared InputText props
    }

    async function handleCreateProposalValid(formValues: NewProposalFormValues): Promise<void> {
        try {
            const newProposal = await dispatch(createProposalThunk({ name: formValues.proposalName.trim() }))
            form.reset({
                proposalName: '',
            })
            toast.success('Proposal created successfully', toastOptions)
            props.onSuccess(newProposal.id)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create proposal'
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleCreateProposalInvalid(errors: {
        proposalName?: {
            message?: string
        }
    }): void {
        const errorMessage = errors.proposalName?.message

        if (errorMessage) {
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleCreateProposal(): void {
        form.handleSubmit(handleCreateProposalValid, handleCreateProposalInvalid)()
            .catch(() => undefined)
    }

    return (
        <ConfirmModal
            open={props.open}
            title='Create New Proposal'
            onClose={handleClose}
            onConfirm={handleCreateProposal}
            action='Create'
            isLoading={isLoading}
            canSave={form.formState.isValid && !isLoading}
        >
            <InputText
                name='proposal-name'
                type='text'
                label='Proposal Name'
                placeholder='Enter proposal name'
                forceUpdateValue
                value={form.watch('proposalName') ?? ''}
                onChange={handleInputChange}
                inputControl={form.register('proposalName')}
                disabled={isLoading}
                autoFocus
                error={form.formState.errors.proposalName?.message}
            />
        </ConfirmModal>
    )
}
