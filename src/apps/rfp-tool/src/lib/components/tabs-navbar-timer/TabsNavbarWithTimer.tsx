import type { FC } from 'react'

import { TabsNavbar, type TabsNavItem } from '~/libs/ui'

import styles from './TabsNavbarWithTimer.module.scss'

/**
 * Tab item shape used by the top-level tabs navbar wrapper.
 */
export interface TabsNavbarWithTimerNavItem {
    id: string
    title: string
}

/**
 * Props for the top-level tabs navbar wrapper.
 */
export interface TabsNavbarWithTimerProps {
    tabs: ReadonlyArray<TabsNavbarWithTimerNavItem>
    defaultActive: string
    onChange: (tabId: string) => void
}

/**
 * Wraps the shared TabsNavbar for the top-level Proposal Management/Admin tab set.
 */
const TabsNavbarWithTimer: FC<TabsNavbarWithTimerProps> = props => {
    function handleChange(tabId: string): void {
        props.onChange(tabId)
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <TabsNavbar
                    defaultActive={props.defaultActive}
                    onChange={handleChange}
                    tabs={props.tabs as ReadonlyArray<TabsNavItem<string>>}
                />
            </div>
        </div>
    )
}

export default TabsNavbarWithTimer
