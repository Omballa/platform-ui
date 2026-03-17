/**
 * Sidebar component
 * Displays list of proposals and "New Proposal" button
 */

import type { FC, MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button, LoadingSpinner } from '~/libs/ui'

import { useProposals } from '../..'
import { NewProposalModal } from '../new-proposal-modal'

import { ProposalListItem } from './ProposalListItem'
import styles from './Sidebar.module.scss'

export interface SidebarProps {
    activeProposalId: string | undefined
    onSelectProposal: (proposalId: string) => void
    onToggleAccordion?: () => void
    isAccordionOpen?: boolean
}

/**
 * Sidebar renders the left panel with proposals list and new proposal button
 */
export const Sidebar: FC<SidebarProps> = props => {
    const proposalsState = useProposals()
    const proposals = proposalsState.proposals
    const isLoading = proposalsState.isLoading
    const refresh = proposalsState.refresh
    const [showNewProposalModal, setShowNewProposalModal] = useState(false)

    // 9.1: Stable display order — sort only on initial load, prepend new proposals
    const stableOrderRef = useRef<string[]>([])
    const initialLoadDoneRef = useRef(false)

    useEffect(() => {
        if (!isLoading && !initialLoadDoneRef.current && proposals.length > 0) {
            stableOrderRef.current = proposals.map(p => p.id)
            initialLoadDoneRef.current = true
        }
    }, [isLoading, proposals])

    const displayedProposals = initialLoadDoneRef.current
        ? [
            ...proposals.filter(p => !stableOrderRef.current.includes(p.id)),
            ...stableOrderRef.current
                .map(id => proposals.find(p => p.id === id))
                .filter((p): p is NonNullable<typeof p> => p !== undefined),
        ]
        : proposals

    function handleNewProposalSuccess(newProposalId: string): void {
        setShowNewProposalModal(false)
        props.onSelectProposal(newProposalId)
        refresh().then(() => {
            // After refresh, prepend the new proposal id to stable order if not already tracked
            if (!stableOrderRef.current.includes(newProposalId)) {
                stableOrderRef.current = [newProposalId, ...stableOrderRef.current]
            }
        }).catch(() => undefined)
    }

    function handleHeaderClick(): void {
        // Only toggle accordion on mobile (max-width: 768px)
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            props.onToggleAccordion?.()
        }
    }

    function handleNewButtonClick(e: MouseEvent<HTMLButtonElement>): void {
        e.stopPropagation()
        setShowNewProposalModal(true)
    }

    function handleModalClose(): void {
        setShowNewProposalModal(false)
    }

    return (
        <div className={styles.sidebar}>
            {/* Header with "Proposals" title and "New" button */}
            <div className={styles.header} onClick={handleHeaderClick}>
                <h2 className={styles.title}>Proposals</h2>
                <Button
                    className={styles.newButton}
                    label='New'
                    onClick={handleNewButtonClick}
                    primary
                    size='sm'
                />
            </div>

            {/* Proposals list */}
            <div className={styles.proposalsList} data-accordion-open={props.isAccordionOpen}>
                {isLoading ? (
                    <LoadingSpinner />
                ) : displayedProposals.length === 0 ? (
                    <div className={styles.emptyState}>No proposals yet. Create one to get started.</div>
                ) : (
                    displayedProposals.map(proposal => (
                        <ProposalListItem
                            key={proposal.id}
                            proposal={proposal}
                            isActive={props.activeProposalId === proposal.id}
                            onClick={props.onSelectProposal}
                        />
                    ))
                )}
            </div>

            {/* New Proposal Modal */}
            <NewProposalModal
                open={showNewProposalModal}
                onClose={handleModalClose}
                onSuccess={handleNewProposalSuccess}
            />
        </div>
    )
}
