import {Event, EventAction, EventStore} from "@/insterface/eventInterface";
import {DiscoverSectionHeader} from "@/component/DiscoverSectionHeader";


export const userEvent : EventStore = {

    events: [],
    orderIds: [],
    recommendedIds: [],
    // events:[
    //     {
    //         eventId: 101, title: "Art of Networking | CBE",
    //         description: "Practice introductions, elevator pitches and follow-up emails with College of Business & Economics career coaches.",
    //         category: "Career", eventDate: "2026-11-12", startTime: "17:00", endTime: "18:30",
    //         format: "in_person", location: "Stephens Hall 310", imageUrl: "",
    //         capacity: 40, spotsLeft: 22, isSaved: false, isRsvpd: false, isRecommended: true,
    //     },
    //     {
    //         eventId: 102, title: "Fall Student Art Showcase",
    //         description: "Paintings, sculpture and digital work from Towson art students, with a short artist talk at 2 PM.",
    //         category: "Arts", eventDate: "2026-11-13", startTime: "13:00", endTime: "16:00",
    //         format: "in_person", location: "Center for the Arts Gallery", imageUrl: "",
    //         capacity: 150, spotsLeft: 120, isSaved: false, isRsvpd: false, isRecommended: false,
    //     },
    //     {
    //         eventId: 103, title: "Tiger Tuesday @ Nite: Trivia",
    //         description: "Team trivia night with prizes for the top three teams. Teams of up to five; solo players welcome.",
    //         category: "Student Life", eventDate: "2026-11-17", startTime: "19:00", endTime: "21:00",
    //         format: "in_person", location: "University Union, PAWS", imageUrl: "",
    //         capacity: 100, spotsLeft: 75, isSaved: false, isRsvpd: false, isRecommended: false,
    //     },
    //     {
    //         eventId: 104, title: "Resume Review Drop-In",
    //         description: "Bring a printed or digital resume for quick feedback from Career Center advisors. No appointment needed.",
    //         category: "Career", eventDate: "2026-11-11", startTime: "13:00", endTime: "17:00",
    //         format: "in_person", location: "Career Center, 7800 York Rd", imageUrl: "",
    //         capacity: 30, spotsLeft: 12, isSaved: false, isRsvpd: false, isRecommended: true,
    //     },
    //     {
    //         eventId: 105, title: "Intro to Python Workshop",
    //         description: "A beginner-friendly, hands-on session covering variables, loops and functions. Laptops recommended.",
    //         category: "Academic", eventDate: "2026-11-11", startTime: "18:30", endTime: "20:00",
    //         format: "online", location: "Zoom (link sent after RSVP)", imageUrl: "",
    //         capacity: 80, spotsLeft: 54, isSaved: false, isRsvpd: false, isRecommended: false,
    //     },
    //     {
    //         eventId: 106, title: "Mindful Mornings: Guided Yoga",
    //         description: "A relaxed all-levels yoga class to start the day. Mats provided.",
    //         category: "Wellness", eventDate: "2026-11-14", startTime: "08:00", endTime: "09:00",
    //         format: "in_person", location: "Burdick Hall, Studio B", imageUrl: "",
    //         capacity: 25, spotsLeft: 9, isSaved: false, isRsvpd: false, isRecommended: false,
    //     },
    //     {
    //         eventId: 107, title: "Tigers Basketball Home Opener",
    //         description: "Cheer on the Tigers in the season home opener. Free entry with student ID; first 500 fans get a T-shirt.",
    //         category: "Athletics", eventDate: "2026-11-14", startTime: "19:00", endTime: "21:30",
    //         format: "in_person", location: "SECU Arena", imageUrl: "",
    //         capacity: 5000, spotsLeft: 3200, isSaved: false, isRsvpd: false, isRecommended: true,
    //     },
    //     {
    //         eventId: 108, title: "Finals Week Study Jam",
    //         description: "Late-night study space with free snacks, coffee and peer tutors for math, science and writing.",
    //         category: "Academic", eventDate: "2026-12-08", startTime: "20:00", endTime: "23:59",
    //         format: "in_person", location: "Cook Library, 2nd Floor", imageUrl: "",
    //         capacity: 200, spotsLeft: 160, isSaved: false, isRsvpd: false, isRecommended: false,
    //     },
    // ],
    // orderIds:[104, 105, 101, 107, 102, 106, 103, 108],
    // recommendedIds: [107, 101, 104],


    savedEventIds: [],
    attendingEventIds: [],
    searchResultIds: null,
    recomendedTitle: "Recommended for you",
    uptodateTitle: "Recommended for you"
}

const addId = (ids: number[], id: number) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: number[], id: number) => ids.filter(x => x !== id);


export function userEventReducer(
    state: EventStore,
    action: EventAction
): EventStore {
    switch (action.type) {

        case "SAVED": {
            const id = action.payload.eventId;
            const targetEvent = state.events.find(event => event.eventId === id);

            // Event doesn't exist, is already saved, or is RSVP'd (can't save an RSVP'd event)
            if (!targetEvent || targetEvent.isSaved || targetEvent.isRsvpd) {
                return state;
            }

            return {
                ...state,
                events: state.events.map(event =>
                    event.eventId === id ? { ...event, isSaved: true } : event
                ),
                savedEventIds: addId(state.savedEventIds, id),
            };
        }

        case "UNSAVED": {
            const id = action.payload.eventId;
            const targetEvent = state.events.find(event => event.eventId === id);

            // Event doesn't exist or isn't saved
            if (!targetEvent || !targetEvent.isSaved) {
                return state;
            }

            return {
                ...state,
                events: state.events.map(event =>
                    event.eventId === id ? { ...event, isSaved: false } : event
                ),
                savedEventIds: removeId(state.savedEventIds, id),
            };
        }

        case "ATTEND": {
            const id = action.payload.eventId;
            const targetEvent = state.events.find(event => event.eventId === id);

            // Event doesn't exist or user is already attending
            if (!targetEvent || targetEvent.isRsvpd) {
                return state;
            }

            // RSVP, and if the event was saved, unsave it
            return {
                ...state,
                events: state.events.map(event =>
                    event.eventId === id ? { ...event, isRsvpd: true, isSaved: false } : event
                ),
                attendingEventIds: addId(state.attendingEventIds, id),
                savedEventIds: removeId(state.savedEventIds, id),
            };
        }

        case "UNATTEND": {
            const id = action.payload.eventId;
            const targetEvent = state.events.find(event => event.eventId === id);

            // Event doesn't exist or user isn't attending
            if (!targetEvent || !targetEvent.isRsvpd) {
                return state;
            }

            return {
                ...state,
                events: state.events.map(event =>
                    event.eventId === id ? { ...event, isRsvpd: false } : event
                ),
                attendingEventIds: removeId(state.attendingEventIds, id),
            };
        }

        case "SYNC_FEED": {
            const p = action.payload;

            // 1. Start from nothing (full sync) or the current cache (delta)
            const byId = new Map<number, Event>(
                p.fullSync ? [] : state.events.map(e => [e.eventId, e])
            );

            // 2. Add or replace changed events; drop cancelled ones
            p.events.forEach(e => byId.set(e.eventId, e));
            p.removedIds.forEach(id => byId.delete(id));

            // 3. The backend's order decides what's shown. Anything not in
            //    orderIds has ended, so it's dropped.
            const position = new Map(p.orderIds.map((id, i) => [id, i]));
            const saved = new Set(p.savedIds);
            const rsvpd = new Set(p.rsvpIds);
            const recommended = new Set(p.recommendedIds);

            const events = [...byId.values()]
                .filter(e => position.has(e.eventId))
                .map(e => ({
                    ...e,
                    // the student's own state comes in full every time, so apply it to all
                    isRsvpd: rsvpd.has(e.eventId),
                    isSaved: saved.has(e.eventId) && !rsvpd.has(e.eventId),
                    isRecommended: recommended.has(e.eventId),
                }))
                .sort((a, b) => position.get(a.eventId)! - position.get(b.eventId)!);

            return {
                ...state,
                events,
                orderIds: p.orderIds,
                recommendedIds: p.recommendedIds,
                // the backend's lists are the truth; RSVP wins over saved
                savedEventIds: p.savedIds.filter(id => !rsvpd.has(id)),
                attendingEventIds: p.rsvpIds,
            };
        }

        case "SEARCH_RESULTS": {
            const incoming = action.payload.events;
            const byId = new Map<number, Event>(state.events.map(e => [e.eventId, e]));

            // Merge into the cache by ID. Search doesn't rank, so keep the
            // cached isRecommended (the feed's recommended_ids is the truth).
            incoming.forEach(e => {
                const cached = byId.get(e.eventId);
                byId.set(e.eventId, {
                    ...e,
                    isRecommended: cached?.isRecommended ?? false,
                });
            });

            // Keep the feed's order for the cache; anything new goes at the end
            const position = new Map((state.orderIds ?? []).map((id, i) => [id, i]));
            const events = [...byId.values()].sort(
                (a, b) => (position.get(a.eventId) ?? Infinity) - (position.get(b.eventId) ?? Infinity)
            );

            return {
                ...state,
                events,
                // results keep the order the backend sent (by date)
                searchResultIds: incoming.map(e => e.eventId),
            };
        }

        case "CLEAR_SEARCH": {
            return { ...state, searchResultIds: null };
        }

        default:
            return state;
    }
}

// export function userEventReducer(
//     state: EventStore,
//     action: EventAction
// ): EventStore {
//     switch (action.type) {
//
//         case "SAVED": {
//
//             const targetEvent = state.events.find(
//                 event => event.eventId === action.payload.eventId
//             );
//
//             // Event doesn't exist
//             if (!targetEvent) {
//                 return state;
//             }
//
//             // Event is already saved
//             if (targetEvent.isSaved) {
//                 return state;
//             }
//
//             // Change isSaved from false → true
//             const updatedEvents = state.events.map(event =>
//                 event.eventId === action.payload.eventId
//                     ? { ...event, isSaved: true }
//                     : event
//             );
//
//             return {
//                 ...state,
//                 events: updatedEvents
//             };
//         }
//         case "UNSAVED": {
//             // Find the event we are looking for
//             const targetEvent = state.events.find(
//                 event => event.eventId === action.payload.eventId
//             );
//
//             // Event doesn't exist
//             if (!targetEvent) {
//                 return state;
//             }
//
//             // Event is already NOT saved
//             if (!targetEvent.isSaved) {
//                 return state;
//             }
//
//             // Change isSaved from true → false
//             const updatedEvents = state.events.map(event =>
//                 event.eventId === action.payload.eventId
//                     ? { ...event, isSaved: false }
//                     : event
//             );
//
//             // Update current state and return
//             return {
//                 ...state,
//                 events: updatedEvents
//             };
//         }
//         case "ATTEND": {
//             const targetEvent = state.events.find(
//                 event => event.eventId === action.payload.eventId
//             );
//
//             // Event does not exist
//             if (!targetEvent) {
//                 return state;
//             }
//
//             // User is already attending
//             if (targetEvent.isRsvpd) {
//                 return state;
//             }
//
//             // RSVP, and if the event was saved, unsave it
//             const updatedEvents = state.events.map(event =>
//                 event.eventId === action.payload.eventId
//                     ? { ...event, isRsvpd: true, isSaved: false }
//                     : event
//             );
//
//             return {
//                 ...state,
//                 events: updatedEvents
//             };
//         }
//         case "UNATTEND": {
//             // Find the event we are looking for
//             const targetEvent = state.events.find(
//                 event => event.eventId === action.payload.eventId
//             );
//
//             // Event doesn't exist
//             if (!targetEvent) {
//                 return state;
//             }
//
//             // Event is already NOT attending
//             if (!targetEvent.isRsvpd) {
//                 return state;
//             }
//
//             // Change isRsvpd from true → false
//             const updatedEvents = state.events.map(event =>
//                 event.eventId === action.payload.eventId
//                     ? { ...event, isRsvpd: false }
//                     : event
//             );
//
//             // Update current state and return
//             return {
//                 ...state,
//                 events: updatedEvents
//             };
//         }
//
//         case "SYNC_FEED": {
//             const p = action.payload;
//
//             // 1. Start from nothing (full sync) or the current cache (delta)
//             const byId = new Map<number, Event>(
//                 p.fullSync ? [] : state.events.map(e => [e.eventId, e])
//             );
//
//             // 2. Add or replace changed events; drop cancelled ones
//             p.events.forEach(e => byId.set(e.eventId, e));
//             p.removedIds.forEach(id => byId.delete(id));
//
//             // 3. Order comes from the backend. Anything not in orderIds has ended,
//             //    so it's dropped here (no date math needed on the phone).
//             const position = new Map(p.orderIds.map((id, i) => [id, i]));
//             const saved = new Set(p.savedIds);
//             const rsvpd = new Set(p.rsvpIds);
//             const recommended = new Set(p.recommendedIds);
//
//             const events = [...byId.values()]
//                 .filter(e => position.has(e.eventId))
//                 .map(e => ({
//                     ...e,
//                     // the student's own state is sent in full every time: apply it to all
//                     isRsvpd: rsvpd.has(e.eventId),
//                     isSaved: saved.has(e.eventId) && !rsvpd.has(e.eventId),
//                     isRecommended: recommended.has(e.eventId),
//                 }))
//                 .sort((a, b) => position.get(a.eventId)! - position.get(b.eventId)!);
//
//             return {
//                 ...state,
//                 events,
//                 orderIds: p.orderIds,
//                 recommendedIds: p.recommendedIds,
//             };
//         }
//         default:
//             return state;
//     }
//
// }