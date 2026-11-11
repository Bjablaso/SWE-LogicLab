import {EventContext} from "@/context/EventContext";
import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {AppState} from "react-native";
import {userEvent, userEventReducer} from "@/reducers/UserEventReducer";
import {filterBy, Event, EventSearchFilters} from "@/insterface/eventInterface";
import {getStudentFeed, searchStudentEvents} from "@/services/api";
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

            console.log(feed);

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
    const [lastSearch, setLastSearch] = useState<EventSearchFilters | null>(null);   // NEW
    const searchRequestRef = useRef(0);       // ignore responses from older searches

    async function searchEvents(filters: EventSearchFilters) {
        const requestId = ++searchRequestRef.current;
        setLastSearch(filters);                                                      // NEW
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
        setLastSearch(null);                                                         // NEW
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

    // ------------------------------------------------------------ actions (local only for now)
    function saveEvent(currentEventID: number) {
        dispatch({type: "SAVED", payload: {eventId: currentEventID}});
    }

    function unsaveEvent(currentEventID: number) {
        dispatch({type: "UNSAVED", payload: {eventId: currentEventID}});
    }

    function attendEvent(currentEventID: number) {
        dispatch({type: "ATTEND", payload: {eventId: currentEventID}});
    }

    function unattendEvent(currentEventID: number) {
        dispatch({type: "UNATTEND", payload: {eventId: currentEventID}});
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
                rsvpEventList,
                refreshFeed,
                searchResults,
                isSearching,
                searchError,
                lastSearch,                                                          // NEW
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