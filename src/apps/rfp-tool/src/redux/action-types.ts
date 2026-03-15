/**
 * Supported async mutation operations for the RFP Tool workflow.
 */
export type MutationOperation =
    | 'answerQuestions'
    | 'assessProposal'
    | 'createProposal'
    | 'requestQuote'
    | 'uploadDocuments'

/**
 * Redux action type constants for mutation lifecycle events.
 */
export const ACTION_TYPES = {
    MUTATION_FAILURE: 'rfp-tool/MUTATION_FAILURE',
    MUTATION_START: 'rfp-tool/MUTATION_START',
    MUTATION_SUCCESS: 'rfp-tool/MUTATION_SUCCESS',
} as const
