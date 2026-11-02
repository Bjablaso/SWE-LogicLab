import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { getEvents, type EventResponse } from "../services/api";

export default function Index() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Campus Connect</Text>
      {loading ? <ActivityIndicator accessibilityLabel="Loading events" /> : null}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      {!loading && !error && events.length === 0 ? (
        <Text>No events found.</Text>
      ) : null}
      <ScrollView contentContainerStyle={styles.events}>
        {events.map((event) => (
          <View key={event.event_id} style={styles.event}>
            <Text style={styles.title}>{event.title}</Text>
            <Text>{event.description}</Text>
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
  events: {
    gap: 12,
    paddingBottom: 24,
  },
  event: {
    gap: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
