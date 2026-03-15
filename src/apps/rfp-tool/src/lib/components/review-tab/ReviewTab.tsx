/**
 * ReviewTab component
 * Displays the generated proposal PDF and Request Quote button
 */

import type { FC } from 'react'
import { toast } from 'react-toastify'

import { Button } from '~/libs/ui'

import { useProposal } from '../../hooks'
import { requestQuoteThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'

import styles from './ReviewTab.module.scss'

const toastOptions = {
    position: toast.POSITION.BOTTOM_RIGHT,
} as const

export interface ReviewTabProps {
    proposalId: string | undefined
}

/**
 * ReviewTab renders the review section with PDF and quote request button
 */
export const ReviewTab: FC<ReviewTabProps> = props => {
    const proposalState = useProposal(props.proposalId)
    const proposal = proposalState.proposal
    const refresh = proposalState.refresh
    const updateProposal = proposalState.updateProposal
    const dispatch = useRfpToolDispatch()
    const isRequestingQuote = useRfpToolSelector(state => state.mutations.requestQuote)

    async function handleRequestQuote(): Promise<void> {
        if (!props.proposalId) return

        try {
            const response = await dispatch(requestQuoteThunk(props.proposalId))
            updateProposal({
                quoteRequestedAt: response.quoteRequestedAt,
                status: response.status,
            })
            await refresh()
            toast.success('Quote requested successfully. You will be contacted shortly.', toastOptions)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to request quote'
            toast.error(errorMessage, toastOptions)
        }
    }

    const isProposalComplete = proposal?.status === 'COMPLETED' || proposal?.status === 'QUOTE_REQUESTED'
    const isQuoteRequested = proposal?.status === 'QUOTE_REQUESTED'

    if (!props.proposalId) {
        return (
            <div className={styles.reviewTab}>
                <div className={styles.emptyState}>
                    Select a proposal from the sidebar to review
                </div>
            </div>
        )
    }

    return (
        <div className={styles.reviewTab}>
            {/* Incomplete message or PDF */}
            {!isProposalComplete ? (
                <div className={styles.message}>
                    Please complete the proposal in the Build tab before reviewing
                </div>
            ) : (
                proposal?.pdfUrl && (
                    <div className={styles.pdfContainer}>
                        <iframe
                            src={proposal.pdfUrl}
                            title='Proposal PDF'
                        />
                    </div>
                )
            )}

            {/* Request Quote button */}
            {isProposalComplete && (
                <div className={styles.buttonContainer}>
                    <Button
                        label={isQuoteRequested ? 'Quote Requested' : 'Request Quote'}
                        onClick={handleRequestQuote}
                        disabled={isQuoteRequested || isRequestingQuote}
                        loading={isRequestingQuote}
                        primary={!isQuoteRequested}
                        secondary={isQuoteRequested}
                    />
                </div>
            )}
        </div>
    )
}
