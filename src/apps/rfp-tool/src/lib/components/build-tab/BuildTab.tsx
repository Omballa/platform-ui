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
    const hasAssessmentState = proposal?.status === 'ASSESSED'
        || proposal?.status === 'COMPLETED'
        || proposal?.status === 'QUOTE_REQUESTED'
    const isCurrentAssessmentState = assessmentViewState.proposalId === props.proposalId
    const showTimer = proposal?.status === 'ASSESSED' && isCurrentAssessmentState && timeRemaining !== undefined
    const timerValue = timeRemaining ?? 0

    // Load assessment state from proposal when it changes
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
            setAssessmentViewState({
                answers: [],
                proposalId: props.proposalId,
                questions: [...proposalQuestions],
                timerStartedAt: proposal.timerStartedAt ?? undefined,
            })
            if (proposal.timerStartedAt) {
                startTimer(proposal.timerStartedAt)
            }
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

    function handleAssessSuccess(startedAt: string): void {
        setAssessmentViewState({
            answers: [],
            proposalId: props.proposalId,
            questions: proposal?.questions ? [...proposal.questions] : [...ASSESSMENT_QUESTIONS],
            timerStartedAt: startedAt,
        })
        startTimer(startedAt)
    }

    function handleAnswerSuccess(switchToReviewTab: boolean): void {
        setAssessmentViewState(currentState => ({
            ...currentState,
            answers: [],
            timerStartedAt: undefined,
        }))

        if (switchToReviewTab) {
            props.onAnswerComplete?.()
        }
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
