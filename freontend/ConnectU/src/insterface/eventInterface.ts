// define store interface for Event

export interface Event {
    eventId: number,
    title: string,
    description: string,
    category: string,
    eventDate: string,
    startTime: string,
    endTime: string,
    format: string,
    location: string,
    imageUrl: string,
    capacity: number,
    spotsLeft: number,
    isSaved: boolean,
    isRsvpd: boolean,
    isRecommended: boolean
}

export interface EventStore {
    events: Event[];
    savedEventIds: number[]; // keep for trakcing saved event
    attendingEventIds: number[]; // keep for tracking rsvp event
    orderIds?: number[];          // feed order from the backend
    recommendedIds?: number[];    // ranked best-first
    searchResultIds: number[] | null;    // null = not searching (show the feed)
    recomendedTitle: string;
    uptodateTitle: string;


}

export interface EventSearchFilters {
    q?: string;              // title or description
    category?: string;       // category name, e.g. "Career"
    location?: string;
    startAfter?: Date;       // local dates; converted to UTC when sent
    startBefore?: Date;
}
export interface FeedSyncPayload {
    events: Event[];
    removedIds: number[];
    orderIds: number[];
    recommendedIds: number[];
    savedIds: number[];
    rsvpIds: number[];
    fullSync: boolean;
}

export interface EventContextType {
    state: EventStore;
    sevedEventList?: Event[]
    rsvpEventList?: Event[]
    dispatch: React.Dispatch<EventAction>;

    searchResults: Event[];
    isSearching: boolean;
    searchError: string | null;


    lastSearch: EventSearchFilters | null;


    saveEvent: (eventID: number) => void;
    unsaveEvent: (eventId: number) => void;
    attendEvent: (eventId: number) => void;
    unattendEvent: (eventId: number) => void;
    filterRSVPEventList: (filt: filterBy ) => Event[];
    filterSavedEventList: (filt: filterBy )=> Event[];
    refreshFeed: () => Promise<void>;

    searchEvents: (filters: EventSearchFilters) => Promise<void>;
    clearSearch: () => void;
}

export function nextDirection(current: filterBy): filterBy {
    switch (current) {
        case "None":       return "Descending";
        case "Descending": return "Ascending";
        case "Ascending":  return "Descending";
    }
}

export function directionLabel(dir: filterBy): string {
    switch (dir) {
        case "None":       return "Descending";
        case "Ascending":  return "Ascending";
        case "Descending": return "Descending";
    }
}

export function directionIcon(dir: filterBy): "arrow-up" | "arrow-down" | "minus" {
    switch (dir) {
        case "None":       return "arrow-down";
        case "Ascending":  return "arrow-up";
        case "Descending": return "arrow-down";
    }
}
export interface saveEventInterface{
    eventId: number,
    isSaved: boolean,
}
export type filterBy = "Ascending" | "Descending" | "None";
// TODO: WRITE TEST CASES FOR EVENTACTION ->
export type EventAction =
    | { type: "SAVED"; payload: { eventId: number } }
    | { type: "UNSAVED"; payload: { eventId: number } }
    | { type: "ATTEND"; payload: { eventId: number } }
    | { type: "UNATTEND"; payload: { eventId: number } }
    | { type: "SYNC_FEED"; payload: FeedSyncPayload }
    | { type: "SEARCH_RESULTS"; payload: { events: Event[] } }
    | { type: "CLEAR_SEARCH" };