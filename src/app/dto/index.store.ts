import { ActionReducerMap } from '@ngrx/store'
import { CommonReducer } from './reducers'

export const IndexReducer: ActionReducerMap<any> = { 
    Commom: CommonReducer  
}
