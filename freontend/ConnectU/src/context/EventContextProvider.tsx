import {EventContext} from "@/context/EventContext";
import {useReducer, useState} from "react";
import {userEvent, userEventReducer} from "@/reducers/UserEventReducer";
import {filterBy, saveEventInterface, Event} from "@/insterface/eventInterface";


interface EventContextProps {
    children?: React.ReactNode;
}
export const EventContextProvider = ({children}:EventContextProps) => {
    const [eventState, dispatch] = useReducer(
        userEventReducer,
        userEvent
    );
    // const savedEvent = state.events.filter(event => event.isSaved && !event.isRsvpd);
   // const rsvpEvents = state.events.filter(event => event.isRsvpd)
    const sevedEventList = eventState.events.filter(event => event.isSaved);
    const rsvpEventList = eventState.events.filter(event => event.isRsvpd);


    function nowKey(): string {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function filterSavedEventList(filt: filterBy ): Event[]{
        const now = nowKey();

        return sevedEventList.filter(event => event.isSaved)
            .filter(event => `${event.eventDate} ${event.endTime}` > now)
            .sort((a, b) => {
                const aKey = `${a.eventDate} ${a.startTime}`;
                const bKey = `${b.eventDate} ${b.startTime}`;
                return filt === "Descending"
                    ? aKey.localeCompare(bKey)
                    : bKey.localeCompare(aKey);
            });

    }

    function filterRSVPEventList(filt: filterBy ): Event[]{
        const now = nowKey();

        return rsvpEventList.filter(event => event.isSaved)
            .filter(event => `${event.eventDate} ${event.endTime}` > now)
            .sort((a, b) => {
                const aKey = `${a.eventDate} ${a.startTime}`;
                const bKey = `${b.eventDate} ${b.startTime}`;
                return filt === "Descending"
                    ? aKey.localeCompare(bKey)
                    : bKey.localeCompare(aKey);
            });

    }
    function saveEvent(currentEventID: number) {
        dispatch({
            type: "SAVED",
            payload: {
                eventId: currentEventID
            }
        });
    }

    function unsaveEvent(currentEventID: number) {
        dispatch({
            type: "UNSAVED",
            payload: {
                eventId: currentEventID
            }
        });
    }

    function attendEvent(currentEventID: number) {
        dispatch({
            type: "ATTEND",
            payload: {
                eventId: currentEventID
            }
        });
    }

    function unattendEvent(currentEventID: number) {
        dispatch({
            type: "UNATTEND",
            payload: {
                eventId: currentEventID
            }
        });
    }
    return (
        <EventContext.Provider
            value={{
                state: eventState,
                dispatch,
                saveEvent,
                unsaveEvent,
                attendEvent,
                unattendEvent,
                filterRSVPEventList,
                filterSavedEventList,
                sevedEventList,
                rsvpEventList
            }}
        >
            {children}
        </EventContext.Provider>
    );
}

// export const EventContextProvider = ({ children }: EventContextProps) => {
//     const [eventState, dispatch] = useReducer(
//         userEventReducer,
//         userEvent
//     );
//
//     return (
//         <EventContext.Provider
//             value={{
//                 state: eventState,
//                 dispatch
//             }}
//         >
//             {children}
//         </EventContext.Provider>
//     );
// };