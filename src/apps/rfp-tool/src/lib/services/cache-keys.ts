/**
 * SWR cache key for the proposals collection.
 */
export const PROPOSALS_SWR_KEY = 'rfp-tool/proposals'

/**
 * Builds the SWR cache key for a proposal's documents collection.
 */
export const getDocumentsSwrKey = (proposalId: string): string => `rfp-tool/proposals/${proposalId}/documents`
