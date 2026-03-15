import { useCallback } from 'react'
import useSWR from 'swr'

import type { ProposalDocument } from '../models'
import { getDocuments } from '../services'
import { getDocumentsSwrKey } from '../services/cache-keys'

interface UseDocumentsResult {
    addDocuments: (newDocuments: ProposalDocument[]) => void
    documents: ProposalDocument[]
    error: string | undefined
    isLoading: boolean
    isValidating: boolean
    refresh: () => Promise<void>
    setDocuments: (nextDocuments: ProposalDocument[]) => void
}

/**
 * Hook for fetching and managing documents for a proposal
 * @param proposalId - The ID of the proposal (undefined to disable fetching)
 */
export function useDocuments(proposalId: string | undefined): UseDocumentsResult {
    const swr = useSWR(
        proposalId ? getDocumentsSwrKey(proposalId) : undefined,
        () => getDocuments(proposalId as string),
    )

    const documents = swr.data ?? []
    const error = swr.error instanceof Error ? swr.error.message : undefined
    const isLoading = !!proposalId && !swr.data && !swr.error

    /**
     * Add newly uploaded documents to the local state
     */
    const addDocuments = useCallback((newDocuments: ProposalDocument[]): void => {
        swr.mutate(current => ([...(current ?? []), ...newDocuments]), false)
            .catch(() => undefined)
    }, [swr])

    /**
     * Replace the current document list with the latest server state
     */
    const setDocuments = useCallback((nextDocuments: ProposalDocument[]): void => {
        swr.mutate(nextDocuments, false)
            .catch(() => undefined)
    }, [swr])

    /**
     * Manually refresh documents
     */
    const refresh = useCallback(async (): Promise<void> => {
        if (!proposalId) {
            return
        }

        await swr.mutate()
    }, [proposalId, swr])

    return {
        addDocuments,
        documents,
        error,
        isLoading,
        isValidating: swr.isValidating,
        refresh,
        setDocuments,
    }
}
