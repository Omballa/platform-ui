import { combineReducers } from 'redux'

import { ACTION_TYPES, type MutationOperation } from './action-types'

interface MutationState {
    answerQuestions: boolean
    assessProposal: boolean
    createProposal: boolean
    error: string | undefined
    requestQuote: boolean
    uploadDocuments: boolean
}

interface MutationStartAction {
    type: typeof ACTION_TYPES.MUTATION_START
    payload: MutationOperation
}

interface MutationSuccessAction {
    type: typeof ACTION_TYPES.MUTATION_SUCCESS
    payload: MutationOperation
}

interface MutationFailureAction {
    type: typeof ACTION_TYPES.MUTATION_FAILURE
    payload: {
        error: string
        operation: MutationOperation
    }
}

type MutationAction = MutationFailureAction | MutationStartAction | MutationSuccessAction

const initialMutationsState: MutationState = {
    answerQuestions: false,
    assessProposal: false,
    createProposal: false,
    error: undefined,
    requestQuote: false,
    uploadDocuments: false,
}

const mutationsReducer = (
    state: MutationState = initialMutationsState,
    action: MutationAction,
): MutationState => {
    switch (action.type) {
        case ACTION_TYPES.MUTATION_START:
            return {
                ...state,
                [action.payload]: true,
                error: undefined,
            }
        case ACTION_TYPES.MUTATION_SUCCESS:
            return {
                ...state,
                [action.payload]: false,
            }
        case ACTION_TYPES.MUTATION_FAILURE:
            return {
                ...state,
                [action.payload.operation]: false,
                error: action.payload.error,
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    mutations: mutationsReducer,
})

/**
 * Root Redux state shape for the RFP Tool module.
 */
export type RfpToolRootState = ReturnType<typeof rootReducer>

export default rootReducer
