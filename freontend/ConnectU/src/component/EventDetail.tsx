import { useMemo, useState } from "react";
import { PanResponder, Text, TouchableOpacity, View } from "react-native";
import type { EventStore } from "@/insterface/eventInterface";

interface EventDetailProps {
    eventStore: EventStore;
    eventID: number;
    goBack: () => void;
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <View className="mb-4 w-1/2 pr-3">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">{label}</Text>
            <Text className="mt-1 text-base text-baseFont">{value}</Text>
        </View>
    );
}

export default function EventDetail({eventID,  goBack, eventStore}: EventDetailProps) {
    const state = eventStore
    //TODO : MOVE TO useEventContext()

    const event = state.events.find(
        event => event.eventId === eventID
    );

    const [saved, setSaved] = useState(event?.isSaved ?? false);
    const [rsvpd, setRsvpd] = useState(event?.isRsvpd ?? false);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    gestureState.dx > 10,
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dx > 80) {
                        goBack();
                    }
                },
            }),
        [goBack],
    );

    if (!event) {
        return (
            <View>
                <Text>Event not found</Text>
            </View>
        );
    }
    const attending = event.capacity - event.spotsLeft;
    const format = { in_person: 'In person', online: 'Online', hybrid: 'Hybrid' }[event.format];

    return (
        <View className="flex-1  p-2 bg-background  border-2 border-blue-400 "
              {...panResponder.panHandlers}
        >

            {/* MAIN CONTENT */}
            <View className="flex-1 flex-col gap-5 p-2 border-2 border-orange-600 w-full hfull">

                {/* header */}
                <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                    {event.category}
                </Text>

                <Text className="mt-1 text-3xl font-extrabold text-baseFont">
                    {event.title}
                </Text>


                {/* stats */}
                <View className="mt-4 flex-row gap-3">

                    <View className="flex-row items-baseline gap-2 rounded-2xl border border-border px-4 py-3">
                        <Text className="text-3xl font-extrabold text-accent">
                            {attending}
                        </Text>

                        <Text className="text-sm text-muted">
                            attending
                        </Text>
                    </View>

                    <View className="flex-row items-baseline gap-2 rounded-2xl border border-border px-4 py-3">
                        <Text className="text-3xl font-extrabold text-accent">
                            {event.spotsLeft}
                        </Text>

                        <Text className="text-sm text-muted">
                            spots left
                        </Text>
                    </View>

                </View>


                {/* details grid */}
                <View className="mt-6 flex-row flex-wrap">

                    <Info
                        label="Date & time"
                        value={`${event.eventDate} · ${event.startTime}–${event.endTime}`}
                    />

                    <Info
                        label="Format"
                        value={format ?? event.format}
                    />

                    <Info
                        label="Venue"
                        value={event.location}
                    />

                    <Info
                        label="Availability"
                        value={`${event.spotsLeft} of ${event.capacity} spots open`}
                    />

                </View>


                {/* about */}
                <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                    About
                </Text>

                <Text className="mt-1 text-base leading-6 text-baseFont">
                    {event.description}
                </Text>

            </View>


            {/* BOTTOM ACTIONS */}
            {(saved || rsvpd) && (
                <View className="flex-row justify-between gap-3 border-t border-border pt-5">

                    {saved && (
                        <TouchableOpacity
                            onPress={() => setSaved(!saved)}
                            className="rounded-full border border-control px-5 py-3"
                        >
                            <Text className="font-bold text-baseFont">
                                Unsave
                            </Text>
                        </TouchableOpacity>
                    )}

                    {rsvpd && (
                        <TouchableOpacity
                            onPress={() => setRsvpd(!rsvpd)}
                            className="rounded-full bg-accent px-6 py-3"
                        >
                            <Text className="font-bold text-black">
                                RSVP
                            </Text>
                        </TouchableOpacity>
                    )}

                </View>
            )}

        </View>
    );
}