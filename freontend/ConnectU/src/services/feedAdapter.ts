import { Event, FeedSyncPayload } from "@/insterface/eventInterface";
import { EventResponseFront, StudentFeedSyncResponse } from "@/services/api";

const pad = (n: number) => String(n).padStart(2, "0");

// ISO UTC → local "YYYY-MM-DD" and "HH:MM"
function splitDateTime(iso: string) {
    const d = new Date(iso);
    return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
}

export function toEvent(raw: EventResponseFront): Event {
    const start = splitDateTime(raw.start_datetime);
    const end = raw.end_datetime ? splitDateTime(raw.end_datetime) : start;
    return {
        eventId: raw.event_id,
        title: raw.title,
        description: raw.description,
        category: raw.category,
        eventDate: start.date,
        startTime: start.time,
        endTime: end.time,
        format: "in_person",                // not in the API yet
        location: raw.location ?? "TBA",
        imageUrl: "",                        // not in the API yet
        capacity: raw.capacity ?? 0,
        spotsLeft: raw.spots_left ?? 0,
        isSaved: raw.is_saved,
        isRsvpd: raw.is_rsvpd,
        isRecommended: raw.is_recommended ?? false,
    };
}

export function toFeedPayload(feed: StudentFeedSyncResponse): FeedSyncPayload {
    return {
        events: feed.events.map(toEvent),
        removedIds: feed.removed_ids,
        orderIds: feed.order_ids,
        recommendedIds: feed.recommended_ids,
        savedIds: feed.saved_ids,
        rsvpIds: feed.rsvp_ids,
        fullSync: feed.full_sync,
    };
}

//The type is () => Promise<void> because refreshFeed returns syncFeed(true), which is an async function.
// Returning the promise lets a screen wait for the refresh to finish, for example to hide a pull-to-refresh spinner:


// const {refreshFeed} = useEventContext();
// const [refreshing, setRefreshing] = useState(false);
//
// async function onRefresh() {
//     setRefreshing(true);
//     await refreshFeed();
//     setRefreshing(false);
// }
//
// <ScrollView
//     refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
// >