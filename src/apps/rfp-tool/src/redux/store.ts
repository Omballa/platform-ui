import { applyMiddleware, compose, createStore, type Store } from 'redux'
import thunk from 'redux-thunk'

import rootReducer, { type RfpToolRootState } from './reducers'

/**
 * Redux store for the RFP Tool module.
 */
export const store: Store<RfpToolRootState> = createStore(
    rootReducer,
    compose(applyMiddleware(thunk)),
)

export default store
