/**
 * QAPanel component
 * Questions and Answers panel with countdown timer
 */

import * as Yup from 'yup'
import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { yupResolver } from '@hookform/resolvers/yup'
import { Button, InputTextarea, LoadingSpinner } from '~/libs/ui'

import { answerQuestionsThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'

import styles from './BuildTab.module.scss'

const toastOptions = {
    position: toast.POSITION.BOTTOM_RIGHT,
} as const

const getExpiredToastStorageKey = (proposalId: string, timerStartedAt: string): string => (
    `rfp-tool-expired-toast-${proposalId}-${timerStartedAt}`
)

const hasShownExpiredToast = (proposalId: string, timerStartedAt: string): boolean => {
    try {
        return window.localStorage.getItem(getExpiredToastStorageKey(proposalId, timerStartedAt)) === 'shown'
    } catch {
        return false
    }
}

const markExpiredToastShown = (proposalId: string, timerStartedAt: string): void => {
    try {
        window.localStorage.setItem(getExpiredToastStorageKey(proposalId, timerStartedAt), 'shown')
    } catch {
        // Ignore storage errors; toast behavior is non-critical.
    }
}

export interface QAPanelProps {
    cancelTimer: () => void
    isExpired: boolean
    proposalId: string | undefined
    questions: string[]
    initialAnswers?: string[]
    timerStartedAt: string | undefined
    isReadOnly?: boolean
    onAnswerSuccess: (switchToReviewTab: boolean) => void
}

interface QAPanelFormValues {
    answers: string[]
}

/**
 * QAPanel renders the questions and answers section with timer
 */
export const QAPanel: FC<QAPanelProps> = props => {
    const dispatch = useRfpToolDispatch()
    const isSubmitting = useRfpToolSelector(state => state.mutations.answerQuestions)
    const validationSchema = useMemo(() => Yup.object({
        answers: Yup.array()
            .of(Yup.string()
                .trim()
                .required('All answers must be filled in'))
            .min(props.questions.length, 'All answers must be filled in')
            .required('All answers must be filled in'),
    }), [props.questions.length])
    const form = useForm<QAPanelFormValues>({
        defaultValues: {
            answers: props.questions.map((_, index) => props.initialAnswers?.[index] ?? ''),
        },
        mode: 'onChange',
        resolver: yupResolver(validationSchema),
    })

    const answers = form.watch('answers') ?? []

    useEffect(() => {
        form.reset({
            answers: props.questions.map((_, index) => props.initialAnswers?.[index] ?? ''),
        })
    }, [form, props.initialAnswers, props.questions])

    // Notify when context expires
    useEffect(() => {
        const proposalId = props.proposalId
        const timerStartedAt = props.timerStartedAt

        if (props.isExpired && proposalId && timerStartedAt && !hasShownExpiredToast(proposalId, timerStartedAt)) {
            markExpiredToastShown(proposalId, timerStartedAt)
            toast.error('The assessment context has expired. Please re-assess the proposal.', toastOptions)
        }
    }, [props.isExpired, props.proposalId, props.timerStartedAt])

    function handleAnswerChange(): void {
        // noop required by shared InputTextarea props
    }

    async function handleSubmitValid(formValues: QAPanelFormValues): Promise<void> {
        if (!props.proposalId) return

        try {
            await dispatch(answerQuestionsThunk(props.proposalId, { answers: formValues.answers }))
            props.cancelTimer()
            toast.success('Answers submitted successfully', toastOptions)
            // Switch to Review Tab on success
            props.onAnswerSuccess(true)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit answers'
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleSubmitInvalid(errors: {
        answers?: Array<{ message?: string } | undefined> | { message?: string }
    }): void {
        const firstArrayError = Array.isArray(errors.answers) ? errors.answers.find(Boolean)?.message : undefined
        const objectErrorMessage = !Array.isArray(errors.answers) ? errors.answers?.message : undefined
        const errorMessage = firstArrayError || objectErrorMessage

        if (errorMessage) {
            toast.error(errorMessage, toastOptions)
        }
    }

    function handleSubmit(): void {
        form.handleSubmit(handleSubmitValid, handleSubmitInvalid)()
            .catch(() => undefined)
    }

    const allAnswersFilled = answers.length === props.questions.length
        && answers.every(answer => (answer ?? '').trim().length > 0)
    const isButtonDisabled = props.isReadOnly || props.isExpired || isSubmitting || !allAnswersFilled

    if (!props.proposalId || props.questions.length === 0) {
        return (
            <div className={styles.panel}>
                <h3 className={styles.panelHeader}>Q&A</h3>
                <div className={styles.emptyState}>
                    Complete the RFP summary and click Assess to see clarifying questions
                </div>
            </div>
        )
    }

    return (
        <div className={styles.panel}>
            <h3 className={styles.panelHeader}>
                Please provide answers to these clarifying questions
            </h3>

            <div className={styles.panelContent}>
                {props.questions.map((question, index) => (
                    <div key={question} className={styles.questionContainer}>
                        <label className={styles.questionText}>
                            {index + 1}
                            .
                            {question}
                        </label>
                        <InputTextarea
                            name='answer'
                            inputControl={form.register(`answers.${index}`)}
                            onChange={handleAnswerChange}
                            disabled={props.isReadOnly || isSubmitting || props.isExpired}
                            placeholder='Your answer...'
                            rows={4}
                            error={form.formState.errors.answers?.[index]?.message}
                        />
                    </div>
                ))}

                <div className={styles.panelActions}>
                    {isSubmitting && <LoadingSpinner inline message='Generating proposal...' />}

                    {!props.isReadOnly && (
                        <Button
                            label='Answer'
                            onClick={handleSubmit}
                            disabled={isButtonDisabled}
                            loading={isSubmitting}
                            primary
                            size='sm'
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
