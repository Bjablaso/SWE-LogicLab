// define store interface for Event

interface Event {
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
}

export interface EventContextType {
    state: EventStore;
    dispatch: React.Dispatch<EventAction>;

    saveEvent: (eventID: number) => void;
    unsaveEvent: (eventId: number) => void;
    attendEvent: (eventId: number) => void;
    unattendEvent: (eventId: number) => void;
}

export interface saveEventInterface{
    eventId: number,
    isSaved: boolean,
}

// TODO: Add unthentication token ->

export type EventAction =
    | { type: "SAVED"; payload: { eventId: number } }
    | { type: "UNSAVED"; payload: { eventId: number } }
    | { type: "ATTEND"; payload: { eventId: number } }
    | { type: "UNATTEND"; payload: { eventId: number } };