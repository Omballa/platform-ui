/**
 * Proposals API Service
 *
 * This service layer abstracts the API calls and allows easy switching between
 * mock implementation and real backend calls.
 *
 * For the mock implementation (this challenge), all calls delegate to mockHandlers.
 * For real integration (Integration challenge), replace these implementations with
 * actual XHR calls to the backend API.
 */

import {
    mockHandlers,
} from '../mock'
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
} from '../models'

/**
 * Toggle between mock and real API
 * Set to false in production to use real backend
 */
const USE_MOCK = true

/**
 * GET /proposals
 * Fetch all proposals for the current user
 */
export const getProposals = async (): Promise<ProposalsListResponse> => {
    if (USE_MOCK) {
        return mockHandlers.getProposals()
    }

    // Future: return xhrGetAsync<ProposalsListResponse>('/proposals')
    throw new Error('Real API not implemented yet')
}

/**
 * POST /proposals
 * Create a new proposal
 */
export const createProposal = async (body: CreateProposalRequest): Promise<Proposal> => {
    if (USE_MOCK) {
        return mockHandlers.createProposal(body)
    }

    // Future: return xhrPostAsync<Proposal>('/proposals', body)
    throw new Error('Real API not implemented yet')
}

/**
 * GET /proposals/{id}/documents
 * Fetch documents for a specific proposal
 */
export const getDocuments = async (proposalId: string): Promise<ProposalDocument[]> => {
    if (USE_MOCK) {
        return mockHandlers.getDocuments(proposalId)
    }

    // Future: return xhrGetAsync<ProposalDocument[]>(`/proposals/${proposalId}/documents`)
    throw new Error('Real API not implemented yet')
}

/**
 * POST /proposals/{id}/documents
 * Upload documents to a proposal
 */
export const uploadDocuments = async (
    proposalId: string,
    files: File[],
): Promise<ProposalDocument[]> => {
    if (USE_MOCK) {
        return mockHandlers.uploadDocuments(proposalId, files)
    }

    // Future: Use FormData for multipart upload
    // const formData = new FormData()
    // files.forEach(file => formData.append('files', file))
    // return xhrPostAsync<ProposalDocument[]>(`/proposals/${proposalId}/documents`, formData)
    throw new Error('Real API not implemented yet')
}

/**
 * POST /proposals/{id}/assess
 * Assess proposal after uploading documents and summary
 */
export const assessProposal = async (
    proposalId: string,
    body: AssessProposalRequest,
): Promise<AssessProposalResponse> => {
    if (USE_MOCK) {
        return mockHandlers.assessProposal(proposalId, body)
    }

    // Future: return xhrPostAsync<AssessProposalResponse>(`/proposals/${proposalId}/assess`, body)
    throw new Error('Real API not implemented yet')
}

/**
 * POST /proposals/{id}/answer
 * Answer clarifying questions and generate proposal
 */
export const answerQuestions = async (
    proposalId: string,
    body: AnswerQuestionsRequest,
): Promise<AnswerQuestionsResponse> => {
    if (USE_MOCK) {
        return mockHandlers.answerQuestions(proposalId, body)
    }

    // Future: return xhrPostAsync<AnswerQuestionsResponse>(`/proposals/${proposalId}/answer`, body)
    throw new Error('Real API not implemented yet')
}

/**
 * POST /proposals/{id}/quote
 * Request a quote for the proposal
 */
export const requestQuote = async (proposalId: string): Promise<RequestQuoteResponse> => {
    if (USE_MOCK) {
        return mockHandlers.requestQuote(proposalId)
    }

    // Future: return xhrPostAsync<RequestQuoteResponse>(`/proposals/${proposalId}/quote`, {})
    throw new Error('Real API not implemented yet')
}
