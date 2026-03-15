import type { AnyAction } from 'redux'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { ThunkDispatch } from 'redux-thunk'

import type { RfpToolRootState } from './reducers'

/**
 * Typed Redux dispatch for thunk-based RFP Tool actions.
 */
export type RfpToolDispatch = ThunkDispatch<RfpToolRootState, unknown, AnyAction>

/**
 * Typed dispatch hook for RFP Tool Redux actions.
 */
export const useRfpToolDispatch = (): RfpToolDispatch => useDispatch<RfpToolDispatch>()

/**
 * Typed selector hook for reading RFP Tool Redux state.
 */
export const useRfpToolSelector: TypedUseSelectorHook<RfpToolRootState> = useSelector
