import {EventAction, EventStore} from "@/insterface/eventInterface";
import {DiscoverSectionHeader} from "@/component/DiscoverSectionHeader";


export const userEvent : EventStore = {
    events: [
        //sample data to see if information works
        {
            "eventId": 101,
            "title": "Art of Networking | CBE",
            "description": "Practice introductions, elevator pitches and follow-up emails with College of Business & Economics career coaches.",
            "category": "Career",
            "eventDate": "2026-11-02",
            "startTime": "17:00",
            "endTime": "18:30",
            "format": "in_person",
            "location": "Stephens Hall 310",
            "imageUrl": "",
            "capacity": 40,
            "spotsLeft": 22,
            "isSaved": false,
            "isRsvpd": false,
            "isRecommended": true
        },
        {
            "eventId": 102,
            "title": "Fall Student Art Showcase",
            "description": "Paintings, sculpture and digital work from Towson art students, with a short artist talk at 2 PM.",
            "category": "Arts",
            "eventDate": "2026-11-03",
            "startTime": "13:00",
            "endTime": "16:00",
            "format": "in_person",
            "location": "Center for the Arts Gallery",
            "imageUrl": "",
            "capacity": 150,
            "spotsLeft": 120,
            "isSaved": true,
            "isRsvpd": false,
            "isRecommended": false
        },
        {
            "eventId": 103,
            "title": "Tiger Tuesday @ Nite: Trivia",
            "description": "Team trivia night with prizes for the top three teams. Teams of up to five; solo players welcome.",
            "category": "Student Life",
            "eventDate": "2026-11-03",
            "startTime": "19:00",
            "endTime": "21:00",
            "format": "in_person",
            "location": "University Union, PAWS",
            "imageUrl": "",
            "capacity": 100,
            "spotsLeft": 75,
            "isSaved": true,
            "isRsvpd": true,
            "isRecommended": false
        },
    ],
    savedEventIds: [],
    attendingEventIds: [],
    recomendedTitle: "Recommended for you",
    uptodateTitle: "Recommended for you"
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