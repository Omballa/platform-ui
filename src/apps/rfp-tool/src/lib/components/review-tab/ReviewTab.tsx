/**
 * ReviewTab component
 * Displays the generated proposal PDF and Request Quote button
 */

import type { FC } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { Button } from '~/libs/ui'

import { useProposal } from '../../hooks'
import { requestQuoteThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'
import { getApiErrorMessage } from '../../utils'
import { getStoredPdfUrl } from '../../utils/storage'

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
    const isLoading = proposalState.isLoading
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
            toast.error(getApiErrorMessage(err, 'Failed to request quote'), toastOptions)
        }
    }

    const status = proposal?.status
    const isProposalComplete = status === 'COMPLETED' || status === 'QUOTE_REQUESTED'
    const isQuoteRequested = status === 'QUOTE_REQUESTED'
    const [pdfError, setPdfError] = useState(false)
    const pdfUrl = proposal?.pdfUrl ?? (props.proposalId ? getStoredPdfUrl(props.proposalId) ?? null : null)

    if (!props.proposalId || isLoading) {
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
            ) : pdfUrl && !pdfError ? (
                <div className={styles.pdfContainer}>
                    <object
                        data={pdfUrl}
                        type='application/pdf'
                        className={styles.pdfObject}
                        onError={() => setPdfError(true)}
                    >
                        {/* Fallback for browsers that don't support inline PDF rendering */}
                        <div className={styles.pdfFallback}>
                            <p>Your browser cannot display the PDF inline.</p>
                            <a href={pdfUrl} target='_blank' rel='noopener noreferrer'>
                                Download Proposal PDF
                            </a>
                        </div>
                    </object>
                </div>
            ) : pdfUrl && pdfError ? (
                <div className={styles.message}>
                    The proposal PDF could not be loaded. It may have been moved or deleted.
                    {' '}
                    <a href={pdfUrl} target='_blank' rel='noopener noreferrer'>
                        Try downloading it directly.
                    </a>
                </div>
            ) : (
                <div className={styles.message}>
                    The proposal PDF is not available. It may have expired or was generated in a previous session.
                </div>
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
