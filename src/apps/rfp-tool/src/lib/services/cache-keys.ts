/**
 * SWR cache key for the proposals collection.
 */
export const PROPOSALS_SWR_KEY = 'rfp-tool/proposals'

/**
 * Builds the SWR cache key for a single proposal.
 */
export const getProposalSwrKey = (proposalId: string): string => `rfp-tool/proposals/${proposalId}`

/**
 * Builds the SWR cache key for a proposal's documents collection.
 */
export const getDocumentsSwrKey = (proposalId: string): string => `rfp-tool/proposals/${proposalId}/documents`
