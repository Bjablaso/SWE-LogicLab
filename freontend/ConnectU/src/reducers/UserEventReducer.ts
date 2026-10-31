import {EventAction, EventStore} from "@/insterface/eventInterface";

export const userEvent : EventStore = {
    events: [],
    savedEventIds: [],
    attendingEventIds: [],
}

export function userEventReducer(
    state: EventStore,
    action: EventAction
): EventStore {
    switch (action.type) {

        case "SAVED":{


            // find the the item we are looking for
            const targetEvent = state.events.find( event => event.eventId === action.payload.eventId)

            if(!targetEvent || !targetEvent.isSaved){
                return  state
            }
            // saved it
            const updatedEvents = state.events.map(event =>
                event.eventId === action.payload.eventId
                    ? { ...event, isSaved: true }
                    : event
            );


            return {
                ...state,
                events: updatedEvents
            }
        }
        case "UNSAVED":{
            // find what we are look for
            const targetEvent = state.events.find( event => event.eventId === action.payload.eventId)

            // if not exist return current state
            if(!targetEvent){
                return  state
            }
            // unsave event
            const updateEvents = state.events.map(event =>
            event.eventId === action.payload.eventId
            ? { ...event, isSaved: false }
            : event)


            // update current state and return
            return {
                ...state,
                events: updateEvents
            }
        }
        default:
            return state;
    }

}