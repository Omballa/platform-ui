/**
 * ContentTabs - Wrapper around TabsNavbar for the Build/Review tab set
 */

import type { FC } from 'react'

import { TabsNavbar, type TabsNavItem } from '~/libs/ui'

import styles from './ContentTabs.module.scss'

export interface ContentTabsProps {
    tabs: ReadonlyArray<TabsNavItem<string>>
    activeTab: string
    onChange: (tabId: string) => void
}

const ContentTabs: FC<ContentTabsProps> = props => (
    <div className={styles.container}>
        <TabsNavbar
            defaultActive={props.activeTab}
            onChange={props.onChange}
            tabs={props.tabs}
        />
    </div>
)

export default ContentTabs
