import {EventContext} from "@/context/EventContext";
import {useReducer, useState} from "react";
import {userEvent, userEventReducer} from "@/reducers/UserEventReducer";
import {saveEventInterface} from "@/insterface/eventInterface";

interface EventContextProps {
    children?: React.ReactNode;
}
export const EventContextProvider = ({children}:EventContextProps) => {
    const [eventState, dispatch] = useReducer(
        userEventReducer,
        userEvent
    );

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
                unattendEvent
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