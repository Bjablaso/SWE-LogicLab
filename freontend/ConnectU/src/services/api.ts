import {Event, EventSearchFilters} from "@/insterface/eventInterface";



// export interface Event {
//     eventId: number,
//     title: string,
//     description: string,
//     category: string,
//     eventDate: string,
//     startTime: string,
//     endTime: string,
//     format: string,
//     location: string,
//     imageUrl: string,
//     capacity: number,
//     spotsLeft: number,
//     isSaved: boolean, // front end only
//     isRsvpd: boolean, // front end only
//     isRecommended: boolean //
// }

export interface EventResponseFront {
    event_id: number;
    title: string;
    description: string;
    category: string;
    start_datetime: string;          // ISO from the backend, e.g. "2026-11-20T22:00:00Z"
    end_datetime: string | null;
    location: string | null;
    capacity: number | null;
    spots_left: number | null;       // null = no capacity limit
    is_saved: boolean;
    is_rsvpd: boolean;
    is_recommended: boolean | null;  // null when not ranked (search / get_events)
}

export interface StudentFeedSyncResponse {
    events: EventResponseFront[];    // full sync: everything; delta: only changed
    removed_ids: number[];
    order_ids: number[];
    recommended_ids: number[];
    saved_ids: number[];
    rsvp_ids: number[];
    sync_token: string;              // the cursor: send back as `since`
    full_sync: boolean;
}

export interface EventSearchResponse {
    events: EventResponseFront[];
    searched_at: string;          // freshness only, NOT a sync cursor
}

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, init);

    if (!response.ok) {
        const body = await response.text();
        let detail: string | undefined;

        if (body) {
            try {
                const error = JSON.parse(body) as { detail?: unknown };
                if (typeof error.detail === "string") {
                    detail = error.detail;
                }
            } catch {
                detail = undefined;
            }
        }

        throw new Error(
            detail ?? `Request failed (${response.status} ${response.statusText})`,
        );
    }

    return (await response.json()) as T;
}

export async function getEvents(
    search?: string,
    categoryId?: number,
    studentId?: number,
): Promise<EventResponseFront[]> {
    const params = new URLSearchParams();

    if (search) {
        params.append("search", search);
    }

    if (categoryId !== undefined) {
        params.append("category_id", categoryId.toString());
    }

    if (studentId !== undefined) {
        params.append("student_id", studentId.toString());   // fills is_saved / is_rsvpd
    }

    const query = params.toString();
    return request<EventResponseFront[]>(`/api/events${query ? `?${query}` : ""}`);
}

// GET /api/events/{event_id}?student_id=...
// One event, wrapped (same shape as feed and search), with this student's saved/RSVP flags
export async function getEvent(
    studentId: number,
    eventId: number,
): Promise<EventResponseFront> {
    const params = new URLSearchParams();
    params.append("student_id", studentId.toString());   // fills is_saved / is_rsvpd

    return request<EventResponseFront>(`/api/events/${eventId}?${params.toString()}`);
}
// get student feed
export async function getStudentFeed(
    studentId: number,
    since?: string,
): Promise<StudentFeedSyncResponse> {
    console.log("API_URL =", API_URL);
    const query = since ? `?since=${encodeURIComponent(since)}` : "";
    return request<StudentFeedSyncResponse>(`/api/students/${studentId}/feed${query}`);
}

// POST /api/students/{student_id}/events/{event_id}/view
// Records that the student opened this event and returns the latest version of it
export async function recordEventView(
    studentId: number,
    eventId: number,
): Promise<EventResponseFront> {
    return request<EventResponseFront>(
        `/api/students/${studentId}/events/${eventId}/view`,
        {method: "POST"},
    );
}

export async function saveEvent(studentId: number, eventId: number): Promise<EventResponseFront> {
    return request<EventResponseFront>(`/api/students/${studentId}/saved-events/${eventId}`, {method: "POST"});
}

export async function unsaveEvent(studentId: number, eventId: number): Promise<EventResponseFront> {
    return request<EventResponseFront>(`/api/students/${studentId}/saved-events/${eventId}`, {method: "DELETE"});
}

export async function getSavedEvents(studentId: number): Promise<EventResponseFront[]> {
    return request<EventResponseFront[]>(`/api/students/${studentId}/saved-events`);
}

export async function createRSVP(studentId: number, eventId: number): Promise<EventResponseFront> {
    return request<EventResponseFront>(`/api/students/${studentId}/rsvps/${eventId}`, {method: "POST"});
}

export async function cancelRSVP(studentId: number, eventId: number): Promise<EventResponseFront> {
    return request<EventResponseFront>(`/api/students/${studentId}/rsvps/${eventId}`, {method: "DELETE"});
}

export async function getRSVPs(studentId: number): Promise<EventResponseFront[]> {
    return request<EventResponseFront[]>(`/api/students/${studentId}/rsvps`);
}
// export async function searchStudentEvents(
//     studentId: number,
//     filters: EventSearchFilters,
// ): Promise<EventSearchResponse> {
//     const params = new URLSearchParams();
//     if (filters.q) params.append("q", filters.q);
//     if (filters.category) params.append("category", filters.category);
//     if (filters.location) params.append("location", filters.location);
//     if (filters.startAfter) params.append("start_after", filters.startAfter.toISOString());
//     if (filters.startBefore) params.append("start_before", filters.startBefore.toISOString());
//
//     const query = params.toString();
//     return request<EventSearchResponse>(
//         `/api/students/${studentId}/events/search${query ? `?${query}` : ""}`,
//     );
// }
export async function searchStudentEvents(
    studentId: number,
    filters: EventSearchFilters,
): Promise<EventSearchResponse> {
    const events = await getEvents(filters.q, undefined, studentId);   // GET /api/events?search=...&student_id=...
    return { events, searched_at: new Date().toISOString() };          // wrap to the shape the context expects
}