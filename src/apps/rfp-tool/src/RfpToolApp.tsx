/**
 * RfpToolApp - Root component for the RFP Tool app
 * Provides routing context and renders child routes
 */

import type { FC } from 'react'
import { useContext } from 'react'
import { Provider } from 'react-redux'
import { Outlet, Routes } from 'react-router-dom'

import type { RouterContextData } from '~/libs/core'
import { routerContext } from '~/libs/core'

import { toolTitle } from './rfp-tool.routes'
import { store } from './redux'

/**
 * RfpToolApp is the root component that wraps all RFP Tool pages
 */
const RfpToolApp: FC = () => {
    const { getChildRoutes }: RouterContextData = useContext(routerContext)

    return (
        <Provider store={store}>
            <div>
                {/* Outlet renders child routes */}
                <Outlet />

                {/* Routes are defined for the router */}
                <Routes>{getChildRoutes(toolTitle)}</Routes>
            </div>
        </Provider>
    )
}

export default RfpToolApp
