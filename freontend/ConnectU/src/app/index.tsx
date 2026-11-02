import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createRSVP,
  getEvent,
  getEvents,
  getRecommendations,
  recordEventView,
  saveEvent,
  type EventResponse,
  type RecommendationResponse,
} from "../services/api";

type EventAction = "save" | "rsvp";
type DetailsSource = "recommendation" | "event";

interface ActionNotice {
  eventId: number;
  message: string;
  type: "error" | "success";
}

export default function Index() {
  const studentId = 1;
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [recommendations, setRecommendations] = useState<
    RecommendationResponse[]
  >([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [savingEventId, setSavingEventId] = useState<number | null>(null);
  const [rsvpEventId, setRsvpEventId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null,
  );
  const [detailsEventId, setDetailsEventId] = useState<number | null>(null);
  const [detailsSource, setDetailsSource] = useState<DetailsSource>("event");
  const [detailsLoadingId, setDetailsLoadingId] = useState<number | null>(null);
  const [detailsError, setDetailsError] = useState("");
  const [viewNotice, setViewNotice] = useState("");

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load events",
        );
      })
      .finally(() => setLoading(false));

    getRecommendations(studentId)
      .then(setRecommendations)
      .catch((requestError: unknown) => {
        setRecommendationError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load recommendations",
        );
      })
      .finally(() => setRecommendationsLoading(false));
  }, []);

  async function handleSearch() {
    setSearchLoading(true);
    setError("");

    const trimmedCategoryId = categoryId.trim();
    const parsedCategoryId = trimmedCategoryId
      ? Number(trimmedCategoryId)
      : undefined;
    if (
      parsedCategoryId !== undefined &&
      (!Number.isInteger(parsedCategoryId) || parsedCategoryId < 1)
    ) {
      setError("Category ID must be a positive whole number.");
      setSearchLoading(false);
      return;
    }

    try {
      setEvents(
        await getEvents(search.trim() || undefined, parsedCategoryId),
      );
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to search events",
      );
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleClearFilters() {
    setSearch("");
    setCategoryId("");
    setSearchLoading(true);
    setError("");

    try {
      setEvents(await getEvents());
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load events",
      );
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleViewDetails(
    eventId: number,
    source: DetailsSource,
  ) {
    setDetailsEventId(eventId);
    setDetailsSource(source);
    setSelectedEvent(null);
    setDetailsLoadingId(eventId);
    setDetailsError("");
    setViewNotice("");

    try {
      const event = await getEvent(eventId);
      setSelectedEvent(event);

      try {
        const view = await recordEventView(studentId, eventId);
        setViewNotice(`View recorded (${view.view_count} total).`);
      } catch (requestError: unknown) {
        setDetailsError(
          `Details loaded, but the view could not be recorded: ${
            requestError instanceof Error
              ? requestError.message
              : "Request failed"
          }`,
        );
      }
    } catch (requestError: unknown) {
      setDetailsError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load event details",
      );
    } finally {
      setDetailsLoadingId(null);
    }
  }

  async function handleEventAction(eventId: number, action: EventAction) {
    setActionNotice(null);

    if (action === "save") {
      setSavingEventId(eventId);
    } else {
      setRsvpEventId(eventId);
    }

    try {
      if (action === "save") {
        const result = await saveEvent(studentId, eventId);
        setActionNotice({
          eventId,
          message: result.message || "Event saved successfully.",
          type: "success",
        });
      } else {
        const result = await createRSVP(studentId, eventId);
        setActionNotice({
          eventId,
          message: `RSVP status: ${result.status}`,
          type: "success",
        });
      }
    } catch (requestError: unknown) {
      setActionNotice({
        eventId,
        message:
          requestError instanceof Error
            ? requestError.message
            : action === "save"
              ? "Failed to save event."
              : "Failed to RSVP.",
        type: "error",
      });
    } finally {
      if (action === "save") {
        setSavingEventId(null);
      } else {
        setRsvpEventId(null);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Campus Connect</Text>
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Search events"
          style={styles.searchInput}
          placeholder="Search events"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          accessibilityLabel="Filter by category ID"
          style={styles.categoryInput}
          placeholder="Category ID"
          value={categoryId}
          onChangeText={setCategoryId}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <Button
          title={searchLoading ? "Loading..." : "Apply"}
          disabled={searchLoading}
          onPress={handleSearch}
        />
        <Button
          title="Clear"
          disabled={searchLoading}
          onPress={handleClearFilters}
        />
      </View>

      {loading || searchLoading ? (
        <ActivityIndicator accessibilityLabel="Loading events" />
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {!loading && !searchLoading && !error && events.length === 0 ? (
        <Text>No events match your search.</Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.events}>
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Recommended for You</Text>
          {recommendationsLoading ? (
            <ActivityIndicator accessibilityLabel="Loading recommendations" />
          ) : null}
          {recommendationError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {recommendationError}
            </Text>
          ) : null}
          {!recommendationsLoading &&
          !recommendationError &&
          recommendations.length === 0 ? (
            <Text>No recommendations available.</Text>
          ) : null}
          {recommendations.slice(0, 3).map((recommendation) => (
            <View
              key={recommendation.event_id}
              style={styles.recommendationGroup}
            >
              <View style={styles.recommendation}>
                <View style={styles.recommendationText}>
                  <Text style={styles.title}>{recommendation.title}</Text>
                  <Text style={styles.details}>
                    Relevance score: {recommendation.relevance_score}
                  </Text>
                </View>
                <Button
                  title={
                    detailsLoadingId === recommendation.event_id
                      ? "Loading..."
                      : "View Details"
                  }
                  disabled={detailsLoadingId !== null}
                  onPress={() =>
                    handleViewDetails(recommendation.event_id, "recommendation")
                  }
                />
              </View>
              {detailsSource === "recommendation" &&
              detailsEventId === recommendation.event_id ? (
                <EventDetails
                  event={selectedEvent}
                  loading={detailsLoadingId === recommendation.event_id}
                  error={detailsError}
                  viewNotice={viewNotice}
                />
              ) : null}
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Discover Events</Text>
        {events.map((event) => (
          <View key={event.event_id} style={styles.event}>
            <Text style={styles.title}>{event.title}</Text>
            <Text>{event.description}</Text>
            {event.location ? (
              <Text style={styles.details}>Location: {event.location}</Text>
            ) : null}
            <Text style={styles.details}>
              Starts: {new Date(event.start_datetime).toLocaleString()}
            </Text>
            {event.capacity !== null ? (
              <Text style={styles.details}>Capacity: {event.capacity}</Text>
            ) : null}
            <View style={styles.buttons}>
              <Button
                title={
                  detailsLoadingId === event.event_id
                    ? "Loading..."
                    : "View Details"
                }
                disabled={detailsLoadingId !== null}
                onPress={() => handleViewDetails(event.event_id, "event")}
              />
              <Button
                title={
                  savingEventId === event.event_id ? "Saving..." : "Save Event"
                }
                disabled={
                  savingEventId === event.event_id ||
                  rsvpEventId === event.event_id
                }
                onPress={() => handleEventAction(event.event_id, "save")}
              />
              <Button
                title={rsvpEventId === event.event_id ? "Submitting..." : "RSVP"}
                disabled={
                  savingEventId === event.event_id ||
                  rsvpEventId === event.event_id
                }
                onPress={() => handleEventAction(event.event_id, "rsvp")}
              />
            </View>
            {actionNotice?.eventId === event.event_id ? (
              <Text
                accessibilityRole={
                  actionNotice.type === "error" ? "alert" : "text"
                }
                style={
                  actionNotice.type === "error"
                    ? styles.error
                    : styles.success
                }
              >
                {actionNotice.message}
              </Text>
            ) : null}
            {detailsSource === "event" && detailsEventId === event.event_id ? (
              <EventDetails
                event={selectedEvent}
                loading={detailsLoadingId === event.event_id}
                error={detailsError}
                viewNotice={viewNotice}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  heading: {
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryInput: {
    width: 120,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  events: {
    gap: 12,
    paddingBottom: 24,
  },
  section: {
    gap: 12,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "700",
  },
  recommendation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  recommendationText: {
    flex: 1,
    gap: 4,
  },
  recommendationGroup: {
    gap: 8,
  },
  event: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    color: "#555",
  },
  buttons: {
    gap: 8,
    marginTop: 8,
  },
  error: {
    marginBottom: 12,
    color: "#b00020",
  },
  success: {
    color: "#176b35",
  },
  detailsPanel: {
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
  },
});

interface EventDetailsProps {
  event: EventResponse | null;
  loading: boolean;
  error: string;
  viewNotice: string;
}

function EventDetails({
  event,
  loading,
  error,
  viewNotice,
}: EventDetailsProps) {
  if (loading) {
    return (
      <View style={styles.detailsPanel}>
        <ActivityIndicator accessibilityLabel="Loading event details" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.detailsPanel}>
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <View style={styles.detailsPanel}>
      <Text style={styles.sectionHeading}>Event Details</Text>
      <Text style={styles.title}>{event.title}</Text>
      <Text>{event.description}</Text>
      {event.location ? (
        <Text style={styles.details}>Location: {event.location}</Text>
      ) : null}
      <Text style={styles.details}>
        Starts: {new Date(event.start_datetime).toLocaleString()}
      </Text>
      {event.end_datetime ? (
        <Text style={styles.details}>
          Ends: {new Date(event.end_datetime).toLocaleString()}
        </Text>
      ) : null}
      {event.capacity !== null ? (
        <Text style={styles.details}>Capacity: {event.capacity}</Text>
      ) : null}
      <Text style={styles.details}>Status: {event.status}</Text>
      {viewNotice ? <Text style={styles.success}>{viewNotice}</Text> : null}
    </View>
  );
}
