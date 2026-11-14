import {EventContext} from "@/context/EventContext";
import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {AppState} from "react-native";
import {userEvent, userEventReducer} from "@/reducers/UserEventReducer";
import {filterBy, Event, EventAction, EventSearchFilters} from "@/insterface/eventInterface";
import {
    getStudentFeed,
    searchStudentEvents,
    saveEvent as apiSaveEvent,
    unsaveEvent as apiUnsaveEvent,
    createRSVP as apiCreateRSVP,
    cancelRSVP as apiCancelRSVP,
    getSavedEvents as apiGetSavedEvents,
    getRSVPs as apiGetRSVPs,
    type EventResponseFront,
} from "@/services/api";
import {toEvent, toFeedPayload} from "@/services/feedAdapter";

// ---------------------------------------------------------------- sync rules
const STUDENT_ID = 1;                        // placeholder until login
const MIN_SYNC_GAP_MS = 60 * 1000;           // automatic pulls: at most 1 per minute
const SYNC_INTERVAL_MS = 10 * 60 * 1000;     // every 10 minutes while the app is open

interface EventContextProps {
    children?: React.ReactNode;
}

export const EventContextProvider = ({children}: EventContextProps) => {
    const [eventState, dispatch] = useReducer(userEventReducer, userEvent);

    // ------------------------------------------------------------ feed sync
    // Refs, not state: these are bookkeeping and shouldn't cause re-renders
    const syncTokenRef = useRef<string | undefined>(undefined);   // the cursor
    const lastSyncRef = useRef(0);                                 // time of last good sync
    const inFlightRef = useRef(false);                             // one request at a time

    const syncFeed = useCallback(async (force = false) => {
        if (inFlightRef.current) return;                                           // already pulling
        if (!force && Date.now() - lastSyncRef.current < MIN_SYNC_GAP_MS) return;  // throttled

        inFlightRef.current = true;
        try {
            const feed = await getStudentFeed(STUDENT_ID, syncTokenRef.current);
            dispatch({type: "SYNC_FEED", payload: toFeedPayload(feed)});
            syncTokenRef.current = feed.sync_token;     // only after a successful merge
            lastSyncRef.current = Date.now();
        } catch (err) {
            console.log("Feed sync failed:", err);       // keep the old cache and token
        } finally {
            inFlightRef.current = false;
        }
    }, []);

    useEffect(() => {
        syncFeed(true);                                                 // app opens: full sync

        const sub = AppState.addEventListener("change", status => {
            if (status === "active") syncFeed();                        // back in foreground
        });

        const timer = setInterval(() => {
            if (AppState.currentState === "active") syncFeed();         // while open
        }, SYNC_INTERVAL_MS);

        return () => {
            sub.remove();
            clearInterval(timer);
        };
    }, [syncFeed]);

    function refreshFeed() {
        return syncFeed(true);                                          // pull-to-refresh
    }

    // ------------------------------------------------------------ search
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [lastSearch, setLastSearch] = useState<EventSearchFilters | null>(null);
    const searchRequestRef = useRef(0);       // ignore responses from older searches

    async function searchEvents(filters: EventSearchFilters) {
        const requestId = ++searchRequestRef.current;
        setLastSearch(filters);
        setIsSearching(true);
        setSearchError(null);

        try {
            const result = await searchStudentEvents(STUDENT_ID, filters);
            if (requestId !== searchRequestRef.current) return;     // a newer search started
            dispatch({type: "SEARCH_RESULTS", payload: {events: result.events.map(toEvent)}});
        } catch (err) {
            if (requestId !== searchRequestRef.current) return;
            setSearchError(err instanceof Error ? err.message : "Search failed");
        } finally {
            if (requestId === searchRequestRef.current) setIsSearching(false);
        }
    }

    function clearSearch() {
        searchRequestRef.current++;           // cancels any search still in flight
        setLastSearch(null);
        setIsSearching(false);
        setSearchError(null);
        dispatch({type: "CLEAR_SEARCH"});
    }

    // Result IDs → events from the cache, so flags stay in sync everywhere
    const eventsById = new Map(eventState.events.map(e => [e.eventId, e]));
    const searchResults = (eventState.searchResultIds ?? [])
        .map(id => eventsById.get(id))
        .filter((e): e is Event => e !== undefined);

    // ------------------------------------------------------------ lists
    const sevedEventList = eventState.events.filter(event => event.isSaved);
    const rsvpEventList = eventState.events.filter(event => event.isRsvpd);

    function nowKey(): string {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function sortByDate(list: Event[], filt: filterBy): Event[] {
        const now = nowKey();
        const upcoming = list.filter(event => `${event.eventDate} ${event.endTime}` > now);

        if (filt === "None") {
            return upcoming;                    // keep the feed's order
        }

        return upcoming.sort((a, b) => {
            const aKey = `${a.eventDate} ${a.startTime}`;
            const bKey = `${b.eventDate} ${b.startTime}`;
            return filt === "Descending"
                ? aKey.localeCompare(bKey)      // today → future
                : bKey.localeCompare(aKey);     // future → today
        });
    }

    function filterSavedEventList(filt: filterBy): Event[] {
        return sortByDate(sevedEventList, filt);
    }

    function filterRSVPEventList(filt: filterBy): Event[] {
        return sortByDate(rsvpEventList, filt);
    }

    // ------------------------------------------------------------ actions (screen first, then backend)
    const [actionError, setActionError] = useState<string | null>(null);

    /**
     * 1. Remember the event as it is now (for undo)
     * 2. Update the screen right away (optimistic)
     * 3. Call the backend; its reply replaces the local copy (it's the truth:
     *    spots_left, saved/RSVP flags after "RSVP wins", etc.)
     * 4. If the call fails, put the event back and show an error
     */
    async function runAction(
        eventId: number,
        optimistic: EventAction,
        call: () => Promise<EventResponseFront>,
        failMessage: string,
    ) {
        const previous = eventState.events.find(e => e.eventId === eventId);
        setActionError(null);
        dispatch(optimistic);

        try {
            const updated = await call();
            dispatch({type: "UPSERT_EVENT", payload: {event: toEvent(updated)}});
        } catch (err) {
            if (previous) dispatch({type: "UPSERT_EVENT", payload: {event: previous}});   // undo
            setActionError(err instanceof Error ? err.message : failMessage);
        }
    }

    function saveEvent(eventId: number) {
        return runAction(
            eventId,
            {type: "SAVED", payload: {eventId}},
            () => apiSaveEvent(STUDENT_ID, eventId),
            "Couldn't save this event.",
        );
    }

    function unsaveEvent(eventId: number) {
        return runAction(
            eventId,
            {type: "UNSAVED", payload: {eventId}},
            () => apiUnsaveEvent(STUDENT_ID, eventId),
            "Couldn't remove this event.",
        );
    }

    function attendEvent(eventId: number) {
        return runAction(
            eventId,
            {type: "ATTEND", payload: {eventId}},          // also clears the save locally
            () => apiCreateRSVP(STUDENT_ID, eventId),      // backend also removes the save
            "Couldn't RSVP to this event.",
        );
    }

    function unattendEvent(eventId: number) {
        return runAction(
            eventId,
            {type: "UNATTEND", payload: {eventId}},
            () => apiCancelRSVP(STUDENT_ID, eventId),
            "Couldn't cancel your RSVP.",
        );
    }

    function clearActionError() {
        setActionError(null);
    }

    /**
     * Pull the student's saved + RSVP'd events straight from the backend and
     * write them into the cache. Use when opening Saved or Attending so they
     * reflect changes made on another device without waiting for a feed sync.
     */
    async function refreshMyEvents() {
        try {
            const [saved, rsvps] = await Promise.all([
                apiGetSavedEvents(STUDENT_ID),
                apiGetRSVPs(STUDENT_ID),
            ]);
            [...saved, ...rsvps].forEach(raw =>
                dispatch({type: "UPSERT_EVENT", payload: {event: toEvent(raw)}}),
            );
        } catch (err) {
            console.log("Refreshing saved/RSVP lists failed:", err);
        }
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
                actionError,
                clearActionError,
                refreshMyEvents,
                filterRSVPEventList,
                filterSavedEventList,
                sevedEventList,
                rsvpEventList,
                refreshFeed,
                searchResults,
                isSearching,
                searchError,
                lastSearch,
                searchEvents,
                clearSearch,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

// import {EventContext} from "@/context/EventContext";
// import {useCallback, useEffect, useReducer, useRef, useState} from "react";
// import {AppState} from "react-native";
// import {userEvent, userEventReducer} from "@/reducers/UserEventReducer";
// import {filterBy, Event, EventSearchFilters} from "@/insterface/eventInterface";
// import {getStudentFeed, searchStudentEvents} from "@/services/api";
// import {toEvent, toFeedPayload} from "@/services/feedAdapter";
//
// // ---------------------------------------------------------------- sync rules
// const STUDENT_ID = 1;                        // placeholder until login
// const MIN_SYNC_GAP_MS = 60 * 1000;           // automatic pulls: at most 1 per minute
// const SYNC_INTERVAL_MS = 10 * 60 * 1000;     // every 10 minutes while the app is open
//
// interface EventContextProps {
//     children?: React.ReactNode;
// }
//
// export const EventContextProvider = ({children}: EventContextProps) => {
//     const [eventState, dispatch] = useReducer(userEventReducer, userEvent);
//
//     // ------------------------------------------------------------ feed sync
//     // Refs, not state: these are bookkeeping and shouldn't cause re-renders
//     const syncTokenRef = useRef<string | undefined>(undefined);   // the cursor
//     const lastSyncRef = useRef(0);                                 // time of last good sync
//     const inFlightRef = useRef(false);                             // one request at a time
//
//     // ------------------------------------------------------------ search
//     const [isSearching, setIsSearching] = useState(false);
//     const [searchError, setSearchError] = useState<string | null>(null);
//     const searchRequestRef = useRef(0);       // ignore responses from older searches
//
//
//     async function searchEvents(filters: EventSearchFilters) {
//         const requestId = ++searchRequestRef.current;
//         setIsSearching(true);
//         setSearchError(null);
//
//         try {
//             const result = await searchStudentEvents(STUDENT_ID, filters);
//             if (requestId !== searchRequestRef.current) return;     // a newer search started
//             dispatch({type: "SEARCH_RESULTS", payload: {events: result.events.map(toEvent)}});
//         } catch (err) {
//             if (requestId !== searchRequestRef.current) return;
//             setSearchError(err instanceof Error ? err.message : "Search failed");
//         } finally {
//             if (requestId === searchRequestRef.current) setIsSearching(false);
//         }
//     }
//
//     function clearSearch() {
//         searchRequestRef.current++;           // cancels any search still in flight
//         setIsSearching(false);
//         setSearchError(null);
//         dispatch({type: "CLEAR_SEARCH"});
//     }
//
//     // Result IDs → events from the cache, so flags stay in sync everywhere
//     const eventsById = new Map(eventState.events.map(e => [e.eventId, e]));
//     const searchResults = (eventState.searchResultIds ?? [])
//         .map(id => eventsById.get(id))
//         .filter((e): e is Event => e !== undefined);
//
//     const syncFeed = useCallback(async (force = false) => {
//         if (inFlightRef.current) return;                                           // already pulling
//         if (!force && Date.now() - lastSyncRef.current < MIN_SYNC_GAP_MS) return;  // throttled
//
//         inFlightRef.current = true;
//         try {
//             const feed = await getStudentFeed(STUDENT_ID, syncTokenRef.current);
//             dispatch({type: "SYNC_FEED", payload: toFeedPayload(feed)});
//             syncTokenRef.current = feed.sync_token;     // only after a successful merge
//             lastSyncRef.current = Date.now();
//         } catch (err) {
//             console.log("Feed sync failed:", err);       // keep the old cache and token
//         } finally {
//             inFlightRef.current = false;
//         }
//     }, []);
//
//     useEffect(() => {
//         syncFeed(true);                                                 // app opens: full sync
//
//         const sub = AppState.addEventListener("change", status => {
//             if (status === "active") syncFeed();                        // back in foreground
//         });
//
//         const timer = setInterval(() => {
//             if (AppState.currentState === "active") syncFeed();         // while open
//         }, SYNC_INTERVAL_MS);
//
//         return () => {
//             sub.remove();
//             clearInterval(timer);
//         };
//     }, [syncFeed]);
//
//     function refreshFeed() {
//         return syncFeed(true);                                          // pull-to-refresh
//     }
//
//     // ------------------------------------------------------------ lists
//     const sevedEventList = eventState.events.filter(event => event.isSaved);
//     const rsvpEventList = eventState.events.filter(event => event.isRsvpd);
//
//     function nowKey(): string {
//         const d = new Date();
//         const pad = (n: number) => String(n).padStart(2, "0");
//         return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
//     }
//
//     function sortByDate(list: Event[], filt: filterBy): Event[] {
//         const now = nowKey();
//         const upcoming = list.filter(event => `${event.eventDate} ${event.endTime}` > now);
//
//         if (filt === "None") {
//             return upcoming;                    // keep the feed's order
//         }
//
//         return upcoming.sort((a, b) => {
//             const aKey = `${a.eventDate} ${a.startTime}`;
//             const bKey = `${b.eventDate} ${b.startTime}`;
//             return filt === "Descending"
//                 ? aKey.localeCompare(bKey)      // today → future
//                 : bKey.localeCompare(aKey);     // future → today
//         });
//     }
//
//     function filterSavedEventList(filt: filterBy): Event[] {
//         return sortByDate(sevedEventList, filt);
//     }
//
//     function filterRSVPEventList(filt: filterBy): Event[] {
//         return sortByDate(rsvpEventList, filt);
//     }
//
//     // ------------------------------------------------------------ actions (local only for now)
//     function saveEvent(currentEventID: number) {
//         dispatch({type: "SAVED", payload: {eventId: currentEventID}});
//     }
//
//     function unsaveEvent(currentEventID: number) {
//         dispatch({type: "UNSAVED", payload: {eventId: currentEventID}});
//     }
//
//     function attendEvent(currentEventID: number) {
//         dispatch({type: "ATTEND", payload: {eventId: currentEventID}});
//     }
//
//     function unattendEvent(currentEventID: number) {
//         dispatch({type: "UNATTEND", payload: {eventId: currentEventID}});
//     }
//
//     return (
//         <EventContext.Provider
//             value={{
//                 state: eventState,
//                 dispatch,
//                 saveEvent,
//                 unsaveEvent,
//                 attendEvent,
//                 unattendEvent,
//                 filterRSVPEventList,
//                 filterSavedEventList,
//                 sevedEventList,
//                 rsvpEventList,
//                 refreshFeed,
//                 searchResults,
//                 isSearching,
//                 searchError,
//                 searchEvents,
//                 clearSearch,
//             }}
//         >
//             {children}
//         </EventContext.Provider>
//     );
// };

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