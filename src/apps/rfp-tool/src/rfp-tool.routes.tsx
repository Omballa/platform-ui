/**
 * RFP Tool route definitions
 * Follows the pattern from existing apps like engagements and talent-search
 */

import { AppSubdomain, EnvironmentConfig, ToolTitle } from '~/config'
import { lazyLoad, type LazyLoadedComponent, type PlatformRoute } from '~/libs/core'

// Lazy load the app root component
const RfpToolApp: LazyLoadedComponent = lazyLoad(() => import('./RfpToolApp'))

// Lazy load the main page
const RfpToolPage: LazyLoadedComponent = lazyLoad(
    () => import('./pages'),
    'RfpToolPage',
)

const isOnAppSubdomain = EnvironmentConfig.SUBDOMAIN === AppSubdomain.rfpTool

/**
 * Root route for the RFP Tool module.
 * Resolves to the subdomain root when hosted directly on the app subdomain.
 */
export const rootRoute: string = (
    isOnAppSubdomain ? '' : `/${AppSubdomain.rfpTool}`
)

/**
 * Human-readable tool title used by the route configuration.
 */
export const toolTitle: string = ToolTitle.rfpTool

/**
 * RFP Tool routes configuration
 * Top-level route wraps the app with children containing the main page
 */
export const rfpToolRoutes: ReadonlyArray<PlatformRoute> = [
    {
        authRequired: false,
        children: [
            {
                element: <RfpToolPage />,
                id: 'RFP Tool Page',
                route: '',
            },
        ],
        domain: AppSubdomain.rfpTool,
        element: <RfpToolApp />,
        id: toolTitle,
        route: rootRoute,
        title: toolTitle,
    },
]
