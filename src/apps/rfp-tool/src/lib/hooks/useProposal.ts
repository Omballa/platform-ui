import { useCallback, useMemo } from 'react'
import { mutate } from 'swr'

import type { Proposal, ProposalsListResponse } from '../models'
import { PROPOSALS_SWR_KEY } from '../services/cache-keys'

import { useProposals } from './useProposals'

interface UseProposalResult {
    error: string | undefined
    isLoading: boolean
    proposal: Proposal | undefined
    refresh: () => Promise<void>
    updateProposal: (updates: Partial<Proposal>) => void
}

/**
 * Hook for fetching and managing a single proposal
 * @param proposalId - The ID of the proposal to fetch
 */
export function useProposal(proposalId: string | undefined): UseProposalResult {
    const proposalsState = useProposals()
    const proposals = proposalsState.proposals
    const isLoading = proposalsState.isLoading
    const error = proposalsState.error
    const refresh = proposalsState.refresh
    const proposal = useMemo(
        () => proposals.find(item => item.id === proposalId),
        [proposalId, proposals],
    )
    const resolvedError = proposalId && !isLoading && !proposal && !error ? 'Proposal not found' : error

    /**
     * Update the proposal in local state
     */
    const updateProposal = useCallback((updates: Partial<Proposal>): void => {
        if (!proposalId) {
            return
        }

        mutate(PROPOSALS_SWR_KEY, (current: ProposalsListResponse | undefined) => {
            if (!current) {
                return current
            }

            return {
                proposals: current.proposals.map((item: Proposal) => (
                    item.id === proposalId
                        ? { ...item, ...updates }
                        : item
                )),
            }
        }, false)
            .catch(() => undefined)
    }, [proposalId])

    return {
        error: resolvedError,
        isLoading: proposalId ? isLoading : false,
        proposal,
        refresh,
        updateProposal,
    }
}
