import { useCallback } from 'react'
import useSWR from 'swr'

import type { Proposal } from '../models'
import { getProposal } from '../services'
import { getProposalSwrKey } from '../services/cache-keys'

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
    const swr = useSWR(
        proposalId ? getProposalSwrKey(proposalId) : null,
        () => getProposal(proposalId as string),
    )

    const proposal = swr.data
    const error = swr.error instanceof Error ? swr.error.message : undefined
    const isLoading = !!proposalId && !swr.data && !swr.error

    const refresh = useCallback(async (): Promise<void> => {
        if (!proposalId) return
        await swr.mutate()
    }, [proposalId, swr])

    const updateProposal = useCallback((updates: Partial<Proposal>): void => {
        if (!proposalId) return
        swr.mutate(current => (current ? { ...current, ...updates } : current), false)
            .catch(() => undefined)
    }, [proposalId, swr])

    return {
        error,
        isLoading,
        proposal,
        refresh,
        updateProposal,
    }
}
