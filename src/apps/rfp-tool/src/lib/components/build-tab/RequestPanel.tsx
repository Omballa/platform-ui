import * as Yup from 'yup'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { yupResolver } from '@hookform/resolvers/yup'
import { Button, InputTextarea, LoadingSpinner } from '~/libs/ui'

import { useProposal } from '../../hooks'
import { getWordCount } from '../../utils'
import { MAX_SUMMARY_WORDS } from '../../../config'
import { assessProposalThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'

import styles from './BuildTab.module.scss'

const toastOptions = {
    position: toast.POSITION.BOTTOM_RIGHT,
} as const

// Yup schema for RFP summary validation
const summarySchema = Yup.object()
    .shape({
        summary: Yup.string()
            .required('RFP summary is required')
            .test('word-count', `Summary must not exceed ${MAX_SUMMARY_WORDS} words`, value => {
                if (!value) return true
                const wordCount = getWordCount(value)
                return wordCount <= MAX_SUMMARY_WORDS
            }),
    })

export interface RequestPanelProps {
    proposalId: string | undefined
    onAssessSuccess: (timerStartedAt: string) => void
}

interface RequestPanelFormValues {
    summary: string
}

/**
 * RequestPanel renders the RFP summary section with word counter and Assess button
 */
export const RequestPanel: FC<RequestPanelProps> = props => {
    const proposalState = useProposal(props.proposalId)
    const proposal = proposalState.proposal
    const dispatch = useRfpToolDispatch()
    const isAssessing = useRfpToolSelector(state => state.mutations.assessProposal)
    const form = useForm<RequestPanelFormValues>({
        defaultValues: {
            summary: proposal?.summary ?? '',
        },
        mode: 'onChange',
        resolver: yupResolver(summarySchema),
    })

    const summaryValue = form.watch('summary') ?? ''
    const validationError = form.formState.errors.summary?.message
    const isValid = form.formState.isValid
    useEffect(() => {
        form.reset({
            summary: proposal?.summary ?? '',
        })
    }, [form, proposal?.id, proposal?.summary])

    const wordCount = getWordCount(summaryValue)
    const isOverWordLimit = wordCount > MAX_SUMMARY_WORDS
    const hasShownWordLimitToastRef = useRef(false)

    useEffect(() => {
        if (isOverWordLimit && !hasShownWordLimitToastRef.current) {
            hasShownWordLimitToastRef.current = true
            toast.error('Maximum word limit is 1000 words', toastOptions)
            return
        }

        if (!isOverWordLimit) {
            hasShownWordLimitToastRef.current = false
        }
    }, [isOverWordLimit])

    function handleSummaryChange(): void {
        // noop required by shared InputTextarea props
    }

    async function handleAssessValid(formValues: RequestPanelFormValues): Promise<void> {
        if (!props.proposalId) return

        try {
            const result = await dispatch(assessProposalThunk(props.proposalId, { summary: formValues.summary }))
            toast.success('Assessment completed successfully', toastOptions)
            props.onAssessSuccess(result.timerStartedAt)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Assessment failed'
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleAssessInvalid(errors: {
        summary?: {
            message?: string
        }
    }): void {
        const rawErrorMessage = errors.summary?.message
        const errorMessage = rawErrorMessage?.includes('1000 words')
            ? 'Maximum word limit is 1000 words'
            : rawErrorMessage

        if (errorMessage) {
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleAssess(): void {
        form.handleSubmit(handleAssessValid, handleAssessInvalid)()
            .catch(() => undefined)
    }

    if (!props.proposalId) {
        return (
            <div className={styles.panel}>
                <h3 className={styles.panelHeader}>RFP Summary</h3>
                <div className={styles.emptyState}>Select a proposal to enter RFP summary</div>
            </div>
        )
    }

    return (
        <div className={styles.panel}>
            <h3 className={styles.panelHeader}>Please provide a summary of the RFP (under 1000 words)</h3>
            <div className={styles.panelContent}>
                <div className={styles.summaryContainer}>
                    <InputTextarea
                        name='summary'
                        inputControl={form.register('summary')}
                        onChange={handleSummaryChange}
                        disabled={isAssessing}
                        placeholder='Enter RFP summary...'
                        error={validationError}
                        rows={6}
                    />

                    <div
                        className={`${styles.wordCounter} ${
                            wordCount > MAX_SUMMARY_WORDS ? styles.wordCounterError : ''
                        }`}
                    >
                        {wordCount}
                        {' '}
                        /
                        {MAX_SUMMARY_WORDS}
                        {' '}
                        words
                    </div>
                </div>

                <div className={styles.panelActions}>
                    {isAssessing && <LoadingSpinner inline message='Assessing...' />}

                    <Button
                        label='Assess'
                        onClick={handleAssess}
                        disabled={!isValid || wordCount === 0 || isAssessing}
                        loading={isAssessing}
                        primary
                        size='sm'
                    />
                </div>
            </div>
        </div>
    )
}
