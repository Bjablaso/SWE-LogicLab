export interface EventResponse {
  event_id: number;
  organizer_id: number | null;
  category_id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  capacity: number | null;
  status: string;
}

export interface RecommendationResponse {
  event_id: number;
  title: string;
  description: string;
  location: string | null;
  start_datetime: string;
  relevance_score: number;
}

export interface EventViewResponse {
  student_id: number;
  event_id: number;
  view_count: number;
  last_viewed_at: string;
}

export interface SavedEventResponse {
  event_id: number;
  title: string;
  location: string | null;
  start_datetime: string;
  saved_at: string;
}

export interface RSVPResponse {
  rsvp_id: number;
  student_id: number;
  event_id: number;
  status: string;
  attended: boolean;
  created_at: string;
}

export interface StudentRSVPEventResponse {
  event_id: number;
  title: string;
  location: string | null;
  start_datetime: string;
}

export interface OperationResponse {
  message: string;
  student_id: number | null;
  event_id: number | null;
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
): Promise<EventResponse[]> {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (categoryId !== undefined) {
    params.append("category_id", categoryId.toString());
  }

  const query = params.toString();
  return request<EventResponse[]>(`/api/events${query ? `?${query}` : ""}`);
}

export async function getEvent(eventId: number): Promise<EventResponse> {
  return request<EventResponse>(`/api/events/${eventId}`);
}

export async function getRecommendations(
  studentId: number,
): Promise<RecommendationResponse[]> {
  return request<RecommendationResponse[]>(
    `/api/students/${studentId}/recommendations`,
  );
}

export async function recordEventView(
  studentId: number,
  eventId: number,
): Promise<EventViewResponse> {
  return request<EventViewResponse>(
    `/api/students/${studentId}/events/${eventId}/view`,
    { method: "POST" },
  );
}

export async function saveEvent(
  studentId: number,
  eventId: number,
): Promise<OperationResponse> {
  return request<OperationResponse>(
    `/api/students/${studentId}/saved-events/${eventId}`,
    { method: "POST" },
  );
}

export async function unsaveEvent(
  studentId: number,
  eventId: number,
): Promise<OperationResponse> {
  return request<OperationResponse>(
    `/api/students/${studentId}/saved-events/${eventId}`,
    { method: "DELETE" },
  );
}

export async function getSavedEvents(
  studentId: number,
): Promise<SavedEventResponse[]> {
  return request<SavedEventResponse[]>(
    `/api/students/${studentId}/saved-events`,
  );
}

export async function createRSVP(
  studentId: number,
  eventId: number,
): Promise<RSVPResponse> {
  return request<RSVPResponse>(
    `/api/students/${studentId}/rsvps/${eventId}`,
    { method: "POST" },
  );
}

export async function cancelRSVP(
  studentId: number,
  eventId: number,
): Promise<OperationResponse> {
  return request<OperationResponse>(
    `/api/students/${studentId}/rsvps/${eventId}`,
    { method: "DELETE" },
  );
}

export async function getRSVPs(
  studentId: number,
): Promise<StudentRSVPEventResponse[]> {
  return request<StudentRSVPEventResponse[]>(
    `/api/students/${studentId}/rsvps`,
  );
}
