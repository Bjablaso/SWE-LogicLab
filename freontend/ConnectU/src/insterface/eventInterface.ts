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
    savedEventIds: number[];
    attendingEventIds: number[];

    recomendedTitle: string;
    uptodateTitle: string;
}


export interface EventContextType {
    state: EventStore;
    sevedEventList?: Event[]
    rsvpEventList?: Event[]
    dispatch: React.Dispatch<EventAction>;

    saveEvent: (eventID: number) => void;
    unsaveEvent: (eventId: number) => void;
    attendEvent: (eventId: number) => void;
    unattendEvent: (eventId: number) => void;
    filterRSVPEventList: (filt: filterBy ) => Event[];
    filterSavedEventList: (filt: filterBy )=> Event[];
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
    | { type: "UNATTEND"; payload: { eventId: number } };