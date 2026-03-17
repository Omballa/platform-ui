import { useCallback, useRef } from 'react'
import useSWR, { mutate } from 'swr'

import type { Proposal, ProposalsListResponse } from '../models'
import { getProposals } from '../services'
import { PROPOSALS_SWR_KEY } from '../services/cache-keys'

interface UseProposalResult {
    error: string | undefined
    isLoading: boolean
    proposal: Proposal | undefined
    refresh: () => Promise<void>
    updateProposal: (updates: Partial<Proposal>) => void
}

/**
 * Derives a single proposal from the shared list SWR cache.
 * Uses a ref-based comparison so this consumer only re-renders when
 * its specific proposal changes, not when any other proposal changes.
 */
export function useProposal(proposalId: string | undefined): UseProposalResult {
    const proposalRef = useRef<Proposal | undefined>(undefined)

    const swr = useSWR<ProposalsListResponse>(
        PROPOSALS_SWR_KEY,
        getProposals,
        {
            compare(a, b) {
                // Find the relevant proposal in both snapshots
                const prev = a?.proposals.find(p => p.id === proposalId)
                const next = b?.proposals.find(p => p.id === proposalId)
                // If the specific proposal hasn't changed, tell SWR the data is equal
                // so this hook does not trigger a re-render
                if (prev === next) return true
                if (!prev || !next) return false
                return JSON.stringify(prev) === JSON.stringify(next)
            },
        },
    )

    const found = swr.data?.proposals.find(p => p.id === proposalId)
    // Keep the ref in sync so we always return the latest value
    if (found !== undefined) {
        proposalRef.current = found
    }
    const proposal = found ?? proposalRef.current

    const error = swr.error instanceof Error ? swr.error.message : undefined
    const isLoading = !swr.data && !swr.error

    const refresh = useCallback(async (): Promise<void> => {
        await mutate(PROPOSALS_SWR_KEY)
    }, [])

    const updateProposal = useCallback((updates: Partial<Proposal>): void => {
        if (!proposalId) return
        mutate(
            PROPOSALS_SWR_KEY,
            (current?: ProposalsListResponse) => {
                if (!current) return current
                return {
                    proposals: current.proposals.map(p =>
                        p.id === proposalId ? { ...p, ...updates } : p,
                    ),
                }
            },
            false,
        ).catch(err => console.error('[useProposal] updateProposal mutate failed:', err))
    }, [proposalId])

    return {
        error,
        isLoading,
        proposal,
        refresh,
        updateProposal,
    }
}
