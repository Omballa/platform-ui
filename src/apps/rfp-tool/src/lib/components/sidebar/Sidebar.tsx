/**
 * Sidebar component
 * Displays list of proposals and "New Proposal" button
 */

import type { FC, MouseEvent } from 'react'
import { useState } from 'react'

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

    function handleNewProposalSuccess(newProposalId: string): void {
        setShowNewProposalModal(false)
        props.onSelectProposal(newProposalId)
        refresh()
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
                ) : proposals.length === 0 ? (
                    <div className={styles.emptyState}>No proposals yet. Create one to get started.</div>
                ) : (
                    proposals.map(proposal => (
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
