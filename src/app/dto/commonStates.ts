import { createAction, props } from "@ngrx/store"

export interface CommonStates {
    AppSettings: any[]
   
  }
  
  export const common_states: CommonStates = {
    AppSettings: []    
  }

  export const setAppSettings = createAction (
    "AppSettings",
    props<{ payload: any[] }>()
  )
  