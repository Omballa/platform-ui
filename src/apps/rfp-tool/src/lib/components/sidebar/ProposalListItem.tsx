/**
 * ProposalListItem component
 * Displays a single proposal in the sidebar list
 */

import type { FC } from 'react'

import type { Proposal } from '../..'

import styles from './Sidebar.module.scss'

export interface ProposalListItemProps {
    proposal: Proposal
    isActive: boolean
    onClick: (proposalId: string) => void
}

/**
 * ProposalListItem renders a single proposal item with highlight when active
 */
export const ProposalListItem: FC<ProposalListItemProps> = props => {
    function handleClick(): void {
        props.onClick(props.proposal.id)
    }

    return (
        <div
            className={`${styles.listItem} ${props.isActive ? styles.active : ''}`}
            onClick={handleClick}
            title={props.proposal.name}
        >
            <div className={styles.listItemContent}>
                <div className={styles.listItemName}>
                    {props.proposal.name}
                </div>
                <div className={styles.listItemStatus}>
                    {props.proposal.status}
                </div>
            </div>
        </div>
    )
}
