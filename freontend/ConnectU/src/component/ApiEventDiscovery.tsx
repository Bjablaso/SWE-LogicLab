import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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
import { TitleCard } from "@/component/TitleCard";
import { useTheme } from "@/hooks/use-theme";
import type { ThemeColors } from "@/constants/theme";

type EventAction = "save" | "rsvp";
type DetailsSource = "recommendation" | "event";

interface ActionNotice {
  eventId: number;
  message: string;
  type: "error" | "success";
}

export default function ApiEventDiscovery() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
      <ScrollView contentContainerStyle={styles.events}>
      <TitleCard />
      <Text style={styles.heading}>Discover Events</Text>
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Search events"
          style={[styles.searchInput, styles.input]}
          placeholder="Search events"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          accessibilityLabel="Filter by category ID"
          style={[styles.categoryInput, styles.input]}
          placeholder="Category ID"
          placeholderTextColor={colors.placeholder}
          value={categoryId}
          onChangeText={setCategoryId}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <ActionButton
          title={searchLoading ? "Loading..." : "Apply"}
          disabled={searchLoading}
          onPress={handleSearch}
        />
        <ActionButton
          title="Clear"
          secondary
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
        <Text style={{ color: colors.muted }}>No events match your search.</Text>
      ) : null}

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
            <Text style={{ color: colors.muted }}>
              No recommendations available.
            </Text>
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
                <ActionButton
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

        <Text style={styles.sectionHeading}>All Events</Text>
        {events.map((event) => (
          <View key={event.event_id} style={styles.event}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={{ color: colors.baseFont }}>{event.description}</Text>
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
              <ActionButton
                title={
                  detailsLoadingId === event.event_id
                    ? "Loading..."
                    : "View Details"
                }
                disabled={detailsLoadingId !== null}
                onPress={() => handleViewDetails(event.event_id, "event")}
              />
              <ActionButton
                title={
                  savingEventId === event.event_id ? "Saving..." : "Save Event"
                }
                secondary
                disabled={
                  savingEventId === event.event_id ||
                  rsvpEventId === event.event_id
                }
                onPress={() => handleEventAction(event.event_id, "save")}
              />
              <ActionButton
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  heading: {
    marginBottom: 16,
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: colors.baseFont,
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
  },
  categoryInput: {
    width: 120,
    minHeight: 42,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.baseFont,
    backgroundColor: colors.input,
  },
  events: {
    gap: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  section: {
    gap: 12,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.baseFont,
  },
  recommendation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
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
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.baseFont,
  },
  details: {
    color: colors.muted,
  },
  buttons: {
    gap: 8,
    marginTop: 8,
  },
  error: {
    marginBottom: 12,
    color: "#ff6b6b",
  },
  success: {
    color: "#58c77a",
  },
  detailsPanel: {
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  });
}

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}

function ActionButton({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: ActionButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: secondary ? colors.surface : colors.accent },
        secondary && { borderColor: colors.border, borderWidth: 1 },
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={{ color: secondary ? colors.baseFont : colors.onAccent, fontWeight: "600" }}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
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
  const { colors } = useTheme();
  const themedStyles = createStyles(colors);
  if (loading) {
    return (
      <View style={themedStyles.detailsPanel}>
        <ActivityIndicator
          accessibilityLabel="Loading event details"
          color={colors.accent}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={themedStyles.detailsPanel}>
        <Text accessibilityRole="alert" style={themedStyles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <View style={themedStyles.detailsPanel}>
      <Text style={themedStyles.sectionHeading}>Event Details</Text>
      <Text style={themedStyles.title}>{event.title}</Text>
      <Text style={{ color: colors.baseFont }}>{event.description}</Text>
      {event.location ? (
        <Text style={themedStyles.details}>Location: {event.location}</Text>
      ) : null}
      <Text style={themedStyles.details}>
        Starts: {new Date(event.start_datetime).toLocaleString()}
      </Text>
      {event.end_datetime ? (
        <Text style={themedStyles.details}>
          Ends: {new Date(event.end_datetime).toLocaleString()}
        </Text>
      ) : null}
      {event.capacity !== null ? (
        <Text style={themedStyles.details}>Capacity: {event.capacity}</Text>
      ) : null}
      <Text style={themedStyles.details}>Status: {event.status}</Text>
      {viewNotice ? <Text style={themedStyles.success}>{viewNotice}</Text> : null}
    </View>
  );
}
