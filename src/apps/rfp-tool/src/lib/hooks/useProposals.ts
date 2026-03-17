import { useCallback } from 'react'
import useSWR from 'swr'

import type { Proposal } from '../models'
import { getProposals } from '../services'
import { PROPOSALS_SWR_KEY } from '../services/cache-keys'

interface UseProposalsResult {
    error: string | undefined
    isLoading: boolean
    isValidating: boolean
    proposals: Proposal[]
    refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing the list of all proposals
 */
export function useProposals(): UseProposalsResult {
    const swr = useSWR(
        PROPOSALS_SWR_KEY,
        getProposals,
    )

    const proposals = swr.data?.proposals ?? []
    const error = swr.error instanceof Error ? swr.error.message : undefined
    const isLoading = !swr.data && !swr.error

    const refresh = useCallback(async (): Promise<void> => {
        await swr.mutate()
    }, [swr])

    return {
        error,
        isLoading,
        isValidating: swr.isValidating,
        proposals,
        refresh,
    }
}
