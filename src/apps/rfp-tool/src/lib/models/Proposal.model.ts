/**
 * Proposal data models
 * These match the backend API contract for easy integration in the Integration challenge
 */

export type ProposalStatus = 'DRAFT' | 'ASSESSED' | 'COMPLETED' | 'QUOTE_REQUESTED'

/**
 * Proposal domain model
 */
export interface Proposal {
    id: string // UUID
    name: string
    status: ProposalStatus
    summary: string | null
    stub: string | null
    questions: string[] | null
    answers: string[] | null
    timerStartedAt: string | null // ISO timestamp - when Assess was clicked
    pdfUrl: string | null // URL to generated proposal PDF
    quoteRequestedAt: string | null // ISO timestamp
    createdAt: string // ISO timestamp
    updatedAt: string // ISO timestamp
}

/**
 * Request body for creating a new proposal
 */
export interface CreateProposalRequest {
    name: string
}

/**
 * Request body for assessing a proposal (after uploading docs and summary)
 */
export interface AssessProposalRequest {
    summary: string
}

/**
 * Response from assessing a proposal
 * Contains clarifying questions and timer info
 */
export interface AssessProposalResponse {
    questions: string[] // Array of clarifying questions (usually 5)
    stub: string // Assessment context identifier
    timerStartedAt: string // ISO timestamp - used to calculate 15 minute window
}

/**
 * Request body for answering clarifying questions
 */
export interface AnswerQuestionsRequest {
    answers: string[] // Array of answers matching the questions
}

/**
 * Response from answering questions
 * Contains the generated proposal PDF
 */
export interface AnswerQuestionsResponse {
    pdfUrl: string // URL to the generated proposal PDF
}

/**
 * Request body for requesting a quote
 */
export type RequestQuoteRequest = Record<string, never>

/**
 * Response from requesting a quote
 */
export interface RequestQuoteResponse {
    id: string
    status: 'QUOTE_REQUESTED'
    quoteRequestedAt: string // ISO timestamp
}

/**
 * Generic API success response wrapper
 */
export interface ApiSuccessResponse<T> {
    data?: T
    message?: string
}

/**
 * API list response for proposals
 */
export interface ProposalsListResponse {
    proposals: Proposal[]
}
