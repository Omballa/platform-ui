/**
 * BuildTab component
 * Container for Documents, Request, and Q&A panels
 */

import type { FC } from 'react'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

import { ASSESSMENT_QUESTIONS } from '../../../config'
import { useProposal, useTimer } from '../../hooks'
import { formatCountdownTimer } from '../../utils'
import type { AssessProposalResponse } from '../../models'

import { DocumentsPanel } from './DocumentsPanel'
import { RequestPanel } from './RequestPanel'
import { QAPanel } from './QAPanel'
import styles from './BuildTab.module.scss'

export interface BuildTabProps {
    proposalId: string | undefined
    onAnswerComplete?: () => void
}

interface AssessmentViewState {
    answers: string[]
    proposalId: string | undefined
    questions: string[]
    timerStartedAt: string | undefined
}

/**
 * BuildTab renders the build workflow with three panels
 */
export const BuildTab: FC<BuildTabProps> = props => {
    const proposalState = useProposal(props.proposalId)
    const proposal = proposalState.proposal
    const updateProposal = proposalState.updateProposal
    const timerState = useTimer(props.proposalId)
    const cancelTimer = timerState.cancelTimer
    const isExpired = timerState.isExpired
    const timeRemaining = timerState.timeRemaining
    const startTimer = timerState.startTimer
    const [assessmentViewState, setAssessmentViewState] = useState<AssessmentViewState>({
        answers: [],
        proposalId: undefined,
        questions: [],
        timerStartedAt: undefined,
    })
    const hasAssessmentState = assessmentViewState.proposalId === props.proposalId
        && assessmentViewState.questions.length > 0
    const isCurrentAssessmentState = assessmentViewState.proposalId === props.proposalId
    const showTimer = proposal?.status === 'ASSESSED' && isCurrentAssessmentState && timeRemaining !== undefined
    const timerValue = timeRemaining ?? 0

    // Load assessment state from proposal when it changes.
    // For ASSESSED status, only sync from server if we don't already have
    // local state set (i.e. handleAssessSuccess hasn't run yet for this proposal).
    useEffect(() => {
        if (!proposal) {
            setAssessmentViewState({
                answers: [],
                proposalId: props.proposalId,
                questions: [],
                timerStartedAt: undefined,
            })
            return
        }

        const proposalQuestions = proposal.questions ?? [...ASSESSMENT_QUESTIONS]
        const proposalAnswers = proposal.answers ?? []

        if (proposal.status === 'ASSESSED') {
            setAssessmentViewState(current => {
                // handleAssessSuccess already populated state for this proposal — don't overwrite
                if (current.proposalId === props.proposalId && current.questions.length > 0) {
                    return current
                }

                if (proposal.timerStartedAt) {
                    startTimer(proposal.timerStartedAt)
                }

                return {
                    answers: [],
                    proposalId: props.proposalId,
                    questions: [...proposalQuestions],
                    timerStartedAt: proposal.timerStartedAt ?? undefined,
                }
            })
        } else if (proposal.status === 'COMPLETED' || proposal.status === 'QUOTE_REQUESTED') {
            setAssessmentViewState({
                answers: [...proposalAnswers],
                proposalId: props.proposalId,
                questions: [...proposalQuestions],
                timerStartedAt: undefined,
            })
        } else {
            setAssessmentViewState({
                answers: [],
                proposalId: props.proposalId,
                questions: [],
                timerStartedAt: undefined,
            })
        }
    }, [proposal, props.proposalId, startTimer])

    function handleAssessSuccess(response: AssessProposalResponse): void {
        setAssessmentViewState({
            answers: [],
            proposalId: props.proposalId,
            questions: response.questions.length > 0 ? [...response.questions] : [...ASSESSMENT_QUESTIONS],
            timerStartedAt: response.timerStartedAt,
        })
        startTimer(response.timerStartedAt)
    }

    function handleAnswerSuccess(pdfUrl: string): void {
        updateProposal({ pdfUrl, status: 'COMPLETED' })
        setAssessmentViewState(currentState => ({
            ...currentState,
            answers: [],
            timerStartedAt: undefined,
        }))
        props.onAnswerComplete?.()
    }

    if (!props.proposalId) {
        return (
            <div className={styles.emptyState}>
                Select a proposal from the sidebar to begin building
            </div>
        )
    }

    return (
        <div className={styles.buildTab}>
            {showTimer && (
                <div className={styles.timerRow}>
                    <div
                        className={classNames(
                            styles.timer,
                            isExpired && styles.timerExpired,
                            !isExpired && timerValue < 2 * 60 * 1000 && styles.timerWarning,
                        )}
                    >
                        {isExpired ? 'Context: expired' : `Context: ${formatCountdownTimer(timerValue)}`}
                    </div>
                </div>
            )}
            <DocumentsPanel proposalId={props.proposalId} />
            <RequestPanel proposalId={props.proposalId} onAssessSuccess={handleAssessSuccess} />
            {hasAssessmentState && isCurrentAssessmentState && (
                <QAPanel
                    cancelTimer={cancelTimer}
                    isExpired={isExpired}
                    proposalId={props.proposalId}
                    questions={assessmentViewState.questions}
                    initialAnswers={assessmentViewState.answers}
                    timerStartedAt={assessmentViewState.timerStartedAt}
                    isReadOnly={proposal?.status === 'COMPLETED' || proposal?.status === 'QUOTE_REQUESTED'}
                    onAnswerSuccess={handleAnswerSuccess}
                />
            )}
        </div>
    )
}
