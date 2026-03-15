/**
 * RfpToolPage - Main page component
 * Implements the split-view layout with sidebar and content area
 * Manages top-level tabs (Proposal Management / Admin) and content tabs (Build / Review)
 */

import type { FC } from 'react'
import { useEffect, useState } from 'react'

import { ContentLayout, type TabsNavItem } from '~/libs/ui'

import { CONTENT_TABS, TOP_LEVEL_TABS } from '../config'
import { Sidebar } from '../lib/components/sidebar'
import { BuildTab } from '../lib/components/build-tab'
import { ReviewTab } from '../lib/components/review-tab'
import { ContentTabs } from '../lib/components/content-tabs'
import { TabsNavbarWithTimer, type TabsNavbarWithTimerNavItem } from '../lib/components/tabs-navbar-timer'

import styles from './RfpToolPage.module.scss'

/**
 * RfpToolPage - The main page of the RFP Tool
 * Displays a split-view with:
 * - Left sidebar: list of proposals
 * - Right content area: Build/Review tabs for the selected proposal
 */
const RfpToolPage: FC = () => {
    // Top-level tab state
    const [activeTopTab, setActiveTopTab] = useState<string>(TOP_LEVEL_TABS.PROPOSAL_MANAGEMENT)

    // Content tab state (Build / Review)
    const [activeContentTab, setActiveContentTab] = useState<string>(CONTENT_TABS.BUILD)

    // Active proposal ID
    const [activeProposalId, setActiveProposalId] = useState<string | undefined>(undefined)

    // Mobile sidebar accordion state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Reset content tab when proposal changes
    useEffect(() => {
        setActiveContentTab(CONTENT_TABS.BUILD)
    }, [activeProposalId])

    // Define top-level tabs
    const topLevelTabs: ReadonlyArray<TabsNavbarWithTimerNavItem> = [
        {
            id: TOP_LEVEL_TABS.PROPOSAL_MANAGEMENT,
            title: 'Proposal Management',
        },
        {
            id: TOP_LEVEL_TABS.ADMIN,
            title: 'Admin Tab',
        },
    ]

    // Define content tabs (Build / Review)
    const contentTabs: ReadonlyArray<TabsNavItem<string>> = [
        {
            id: CONTENT_TABS.BUILD,
            title: 'Build',
        },
        {
            id: CONTENT_TABS.REVIEW,
            title: 'Review',
        },
    ]

    function handleProposalSelect(id: string): void {
        setActiveProposalId(id)
        setIsSidebarOpen(false)
    }

    function handleToggleAccordion(): void {
        setIsSidebarOpen(!isSidebarOpen)
    }

    function handleAnswerComplete(): void {
        setActiveContentTab(CONTENT_TABS.REVIEW)
    }

    return (
        <ContentLayout outerClass={styles.contentLayoutOuter}>
            {/* Top-level tabs */}
            <TabsNavbarWithTimer
                defaultActive={activeTopTab}
                onChange={setActiveTopTab}
                tabs={topLevelTabs}
            />

            {/* Only show Proposal Management content (Admin Tab is disabled for V1) */}
            {activeTopTab === TOP_LEVEL_TABS.PROPOSAL_MANAGEMENT && (
                <div className={styles.pageContainer}>
                    {/* Left sidebar - Proposals list */}
                    <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                        <Sidebar
                            activeProposalId={activeProposalId}
                            onSelectProposal={handleProposalSelect}
                            onToggleAccordion={handleToggleAccordion}
                            isAccordionOpen={isSidebarOpen}
                        />
                    </div>

                    {/* Right content area */}
                    <div className={styles.contentArea}>
                        {/* Content tabs - Build / Review (with timer wrapper) */}
                        <ContentTabs
                            tabs={contentTabs}
                            activeTab={activeContentTab}
                            onChange={setActiveContentTab}
                        />

                        {/* Content based on selected tab */}
                        <div className={styles.content}>
                            {activeContentTab === CONTENT_TABS.BUILD && (
                                <BuildTab
                                    proposalId={activeProposalId}
                                    onAnswerComplete={handleAnswerComplete}
                                />
                            )}

                            {activeContentTab === CONTENT_TABS.REVIEW && (
                                <ReviewTab proposalId={activeProposalId} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Tab content - disabled for V1 */}
            {activeTopTab === TOP_LEVEL_TABS.ADMIN && (
                <div style={{ padding: '24px' }}>
                    <p>Admin Tab - Coming in a future version</p>
                </div>
            )}
        </ContentLayout>
    )
}

export default RfpToolPage
