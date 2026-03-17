import { mutate } from 'swr'

import type {
    AnswerQuestionsRequest,
    AnswerQuestionsResponse,
    AssessProposalRequest,
    AssessProposalResponse,
    CreateProposalRequest,
    Proposal,
    ProposalDocument,
    ProposalsListResponse,
    RequestQuoteResponse,
} from '../lib/models'
import {
    answerQuestions,
    assessProposal,
    createProposal,
    getProposals,
    requestQuote,
    uploadDocuments,
} from '../lib/services'
import { getDocumentsSwrKey, getProposalSwrKey, PROPOSALS_SWR_KEY } from '../lib/services/cache-keys'
import { storePdfUrl } from '../lib/utils/storage'

import { ACTION_TYPES, type MutationOperation } from './action-types'

type RfpToolDispatch = (action: unknown) => unknown

type MutationStartAction = {
    payload: MutationOperation;
    type: typeof ACTION_TYPES.MUTATION_START;
}

type MutationSuccessAction = {
    payload: MutationOperation;
    type: typeof ACTION_TYPES.MUTATION_SUCCESS;
}

type MutationFailureAction = {
    payload: {
        error: string;
        operation: MutationOperation;
    };
    type: typeof ACTION_TYPES.MUTATION_FAILURE;
}

const startMutation = (operation: MutationOperation): MutationStartAction => ({
    payload: operation,
    type: ACTION_TYPES.MUTATION_START,
})

const mutationSucceeded = (operation: MutationOperation): MutationSuccessAction => ({
    payload: operation,
    type: ACTION_TYPES.MUTATION_SUCCESS,
})

const mutationFailed = (operation: MutationOperation, error: string): MutationFailureAction => ({
    payload: {
        error,
        operation,
    },
    type: ACTION_TYPES.MUTATION_FAILURE,
})

const getErrorMessage = (error: unknown, fallback: string): string => (
    error instanceof Error ? error.message : fallback
)

const refreshProposals = async (): Promise<void> => {
    await mutate(PROPOSALS_SWR_KEY)
}

/**
 * Creates a new proposal and updates the proposals cache.
 */
export const createProposalThunk = (body: CreateProposalRequest) => async (
    dispatch: RfpToolDispatch,
): Promise<Proposal> => {
    dispatch(startMutation('createProposal'))

    try {
        const proposal = await createProposal(body)

        await mutate(
            PROPOSALS_SWR_KEY,
            (current?: ProposalsListResponse) => ({
                proposals: current ? [proposal, ...current.proposals] : [proposal],
            }),
            false,
        )

        dispatch(mutationSucceeded('createProposal'))
        return proposal
    } catch (error) {
        const message = getErrorMessage(error, 'Failed to create proposal')
        dispatch(mutationFailed('createProposal', message))
        throw error
    }
}

/**
 * Uploads proposal documents and refreshes related caches.
 */
export const uploadDocumentsThunk = (proposalId: string, files: File[]) => async (
    dispatch: RfpToolDispatch,
): Promise<ProposalDocument[]> => {
    dispatch(startMutation('uploadDocuments'))

    try {
        const documents = await uploadDocuments(proposalId, files)

        await mutate(
            getDocumentsSwrKey(proposalId),
            documents,
            false,
        )
        await refreshProposals()

        dispatch(mutationSucceeded('uploadDocuments'))
        return documents
    } catch (error) {
        const message = getErrorMessage(error, 'Upload failed')
        console.error('Document upload error:', error)
        dispatch(mutationFailed('uploadDocuments', message))
        throw error
    }
}

/**
 * Assesses a proposal and refreshes proposal state after success.
 */
export const assessProposalThunk = (proposalId: string, body: AssessProposalRequest) => async (
    dispatch: RfpToolDispatch,
): Promise<AssessProposalResponse> => {
    dispatch(startMutation('assessProposal'))

    try {
        const response = await assessProposal(proposalId, body)

        // Optimistically apply assess response to the single-proposal cache so
        // BuildTab sees status/questions/timerStartedAt immediately, then
        // revalidate in the background to sync any other server-side changes.
        await mutate(
            getProposalSwrKey(proposalId),
            (current: Proposal | undefined) => (
                current
                    ? {
                        ...current,
                        questions: response.questions,
                        stub: response.stub,
                        timerStartedAt: response.timerStartedAt,
                        status: 'ASSESSED' as const,
                    }
                    : current
            ),
            false,
        )
        await refreshProposals()

        dispatch(mutationSucceeded('assessProposal'))
        return response
    } catch (error) {
        const message = getErrorMessage(error, 'Assessment failed')
        dispatch(mutationFailed('assessProposal', message))
        throw error
    }
}

/**
 * Submits clarifying-question answers and refreshes proposal state.
 */
export const answerQuestionsThunk = (proposalId: string, body: AnswerQuestionsRequest) => async (
    dispatch: RfpToolDispatch,
): Promise<AnswerQuestionsResponse> => {
    dispatch(startMutation('answerQuestions'))

    try {
        const response = await answerQuestions(proposalId, body)
        storePdfUrl(proposalId, response.pdfUrl)
        await mutate(
            getProposalSwrKey(proposalId),
            (current: Proposal | undefined) => (
                current
                    ? { ...current, pdfUrl: response.pdfUrl, status: 'COMPLETED' as const }
                    : current
            ),
            false,
        )
        await refreshProposals()
        dispatch(mutationSucceeded('answerQuestions'))
        return response
    } catch (error) {
        const message = getErrorMessage(error, 'Failed to submit answers')
        dispatch(mutationFailed('answerQuestions', message))
        throw error
    }
}

/**
 * Requests a quote for a completed proposal and refreshes proposal state.
 */
export const requestQuoteThunk = (proposalId: string) => async (
    dispatch: RfpToolDispatch,
): Promise<RequestQuoteResponse> => {
    dispatch(startMutation('requestQuote'))

    try {
        const response = await requestQuote(proposalId)
        await refreshProposals()

        dispatch(mutationSucceeded('requestQuote'))
        return response
    } catch (error) {
        const message = getErrorMessage(error, 'Failed to request quote')
        dispatch(mutationFailed('requestQuote', message))
        throw error
    }
}
