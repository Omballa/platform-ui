import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import RfpToolPage from './RfpToolPage'

const mockTabsNavbarWithTimer = jest.fn()
const mockContentTabs = jest.fn()
const mockSidebar = jest.fn()
const mockBuildTab = jest.fn()
const mockReviewTab = jest.fn()

jest.mock('~/libs/ui', () => ({
    ContentLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}), { virtual: true })

jest.mock('../lib/components/tabs-navbar-timer', () => ({
    TabsNavbarWithTimer: (props: {
        defaultActive: string
        onChange: (tabId: string) => void
        tabs: ReadonlyArray<{ id: string, title: string }>
    }) => {
        mockTabsNavbarWithTimer(props)

        return (
            <div>
                {props.tabs.map(tab => (
                    <button key={tab.id} type='button' onClick={() => props.onChange(tab.id)}>
                        {tab.title}
                    </button>
                ))}
            </div>
        )
    },
}))

jest.mock('../lib/components/content-tabs', () => ({
    ContentTabs: (props: {
        activeTab: string
        onChange: (tabId: string) => void
        tabs: ReadonlyArray<{ id: string, title: string }>
    }) => {
        mockContentTabs(props)

        return (
            <div>
                <div>content-tab:{props.activeTab}</div>
                {props.tabs.map(tab => (
                    <button key={tab.id} type='button' onClick={() => props.onChange(tab.id)}>
                        {tab.title}
                    </button>
                ))}
            </div>
        )
    },
}))

jest.mock('../lib/components/sidebar', () => ({
    Sidebar: (props: {
        activeProposalId: string | undefined
        onSelectProposal: (proposalId: string) => void
    }) => {
        mockSidebar(props)

        return (
            <div>
                <div>active-proposal:{props.activeProposalId ?? 'none'}</div>
                <button type='button' onClick={() => props.onSelectProposal('proposal-1')}>
                    select-proposal-1
                </button>
                <button type='button' onClick={() => props.onSelectProposal('proposal-2')}>
                    select-proposal-2
                </button>
            </div>
        )
    },
}))

jest.mock('../lib/components/build-tab', () => ({
    BuildTab: (props: {
        proposalId: string | undefined
        onAnswerComplete?: () => void
    }) => {
        mockBuildTab(props)

        return (
            <div>
                <div>build-proposal:{props.proposalId ?? 'none'}</div>
                <button type='button' onClick={() => props.onAnswerComplete?.()}>
                    complete-answer
                </button>
            </div>
        )
    },
}))

jest.mock('../lib/components/review-tab', () => ({
    ReviewTab: (props: { proposalId: string | undefined }) => {
        mockReviewTab(props)

        return <div>review-proposal:{props.proposalId ?? 'none'}</div>
    },
}))

describe('RfpToolPage', () => {
    beforeEach(() => {
        mockTabsNavbarWithTimer.mockReset()
        mockContentTabs.mockReset()
        mockSidebar.mockReset()
        mockBuildTab.mockReset()
        mockReviewTab.mockReset()
    })

    it('renders proposal management by default and switches proposals through the sidebar', () => {
        render(<RfpToolPage />)

        expect(screen.getByText('content-tab:build'))
            .toBeInTheDocument()
        expect(screen.getByText('build-proposal:none'))
            .toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'select-proposal-1' }))

        expect(screen.getByText('build-proposal:proposal-1'))
            .toBeInTheDocument()
        expect(screen.getByText('active-proposal:proposal-1'))
            .toBeInTheDocument()
    })

    it('resets the build view when switching proposals', () => {
        render(<RfpToolPage />)

        fireEvent.click(screen.getByRole('button', { name: 'select-proposal-1' }))
        expect(screen.getByText('build-proposal:proposal-1'))
            .toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'select-proposal-2' }))

        expect(screen.getByText('build-proposal:proposal-2'))
            .toBeInTheDocument()
    })

    it('switches to review after answer completion and shows the admin placeholder page', () => {
        render(<RfpToolPage />)

        fireEvent.click(screen.getByRole('button', { name: 'select-proposal-1' }))
        fireEvent.click(screen.getByRole('button', { name: 'complete-answer' }))

        expect(screen.getByText('review-proposal:proposal-1'))
            .toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Admin Tab' }))

        expect(screen.getByText('Admin Tab - Coming in a future version'))
            .toBeInTheDocument()
    })
})
