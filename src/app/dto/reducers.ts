import { createReducer, on } from "@ngrx/store";
import {
    common_states,
    setAppSettings   
} from "./commonStates";


export const _commonReducer = createReducer(
    common_states,
    on(setAppSettings, (state, action) => {
        return {
            ...state,
            listAppSettings: action.payload,
        };
    })
);

export function CommonReducer(state: any, action: any) {
    return _commonReducer(state, action);
}
