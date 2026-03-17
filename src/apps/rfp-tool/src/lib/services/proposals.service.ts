import type {
    AnswerQuestionsRequest,
    AnswerQuestionsResponse,
    AssessProposalRequest,
    AssessProposalResponse,
    CreateProposalRequest,
    Proposal,
    ProposalsListResponse,
    RequestQuoteResponse,
} from '../models'
import { EnvironmentConfig } from '~/config'
import {
    xhrGetAsync,
    xhrPostAsync,
} from '~/libs/core'
import { getStoredPdfUrl } from '../utils/storage'

const RFP_TOOL_API_BASE: string =
    process.env.REACT_APP_RFP_TOOL_API
    || (EnvironmentConfig.ENV === 'local' ? 'http://localhost:3000' : EnvironmentConfig.API.URL)

const normalizeProposal = (proposal: Proposal): Proposal => ({
    ...proposal,
    summary: proposal.summary ?? null,
    stub: proposal.stub ?? null,
    questions: proposal.questions ?? null,
    answers: proposal.answers ?? null,
    timerStartedAt: proposal.timerStartedAt ?? null,
    pdfUrl: proposal.pdfUrl ?? getStoredPdfUrl(proposal.id) ?? null,
    quoteRequestedAt: proposal.quoteRequestedAt ?? null,
})

const normalizeProposalsListResponse = (
    response: ProposalsListResponse,
): ProposalsListResponse => ({
    proposals: response.proposals?.map(normalizeProposal) ?? [],
})

export const getProposals = async (): Promise<ProposalsListResponse> => {
    const response = await xhrGetAsync<ProposalsListResponse>(
        `${RFP_TOOL_API_BASE}/proposals`,
    )

    return normalizeProposalsListResponse(response)
}

export const getProposal = async (proposalId: string): Promise<Proposal> => {
    const response = await xhrGetAsync<Proposal>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}`,
    )

    return normalizeProposal(response)
}

export const createProposal = async (
    body: CreateProposalRequest,
): Promise<Proposal> => {
    const response = await xhrPostAsync<CreateProposalRequest, Proposal>(
        `${RFP_TOOL_API_BASE}/proposals`,
        body,
    )

    return normalizeProposal(response)
}

export const assessProposal = async (
    proposalId: string,
    body: AssessProposalRequest,
): Promise<AssessProposalResponse> => {
    const response = await xhrPostAsync<AssessProposalRequest, AssessProposalResponse>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}/assess`,
        body,
    )

    return response
}

export const answerQuestions = async (
    proposalId: string,
    body: AnswerQuestionsRequest,
): Promise<AnswerQuestionsResponse> => {
    const response = await xhrPostAsync<AnswerQuestionsRequest, AnswerQuestionsResponse>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}/answer`,
        body,
    )

    return response
}

export const requestQuote = async (
    proposalId: string,
): Promise<RequestQuoteResponse> => {
    const response = await xhrPostAsync<{}, RequestQuoteResponse>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}/quote`,
        {},
    )

    return response
}
