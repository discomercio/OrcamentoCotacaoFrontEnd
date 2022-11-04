import { createAction, props } from "@ngrx/store"

export interface CommonStates {
    listAppSettings: any[]
   
  }
  
  export const common_states: CommonStates = {
    listAppSettings: []    
  }

  export const setAppSettings = createAction (
    "AppSettings",
    props<{ payload: any[] }>()
  )
  