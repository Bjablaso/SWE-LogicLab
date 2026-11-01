import {useCallback, useRef, useState} from 'react';
import { ScrollView, View, Text, TouchableOpacity,PanResponder } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import data from '../../event.json';
import {Event} from "@/insterface/eventInterface";
import {useEventContext} from "@/context/useEventContext";
import {EventStore} from "@/insterface/eventInterface";

interface EventDetailProps {
    eventStore: EventStore;
    eventID: number;
    goBack: () => void;
}
export default function EventDetail({eventID,  goBack, eventStore}: EventDetailProps) {
    const state = eventStore
    //TODO : MOVE TO useEventContext()

    const event = state.events.find(
        event => event.eventId === eventID
    );

    if (!event) {
        return (
            <View>
                <Text>Event not found</Text>
            </View>
        );
    }
    const [saved, setSaved] = useState(event.isSaved);
    const [rsvpd, setRsvpd] = useState(event.isRsvpd);

    const attending = event.capacity - event.spotsLeft;
    const format = { in_person: 'In person', online: 'Online', hybrid: 'Hybrid' }[event.format];

    const panResponder = useRef(
        PanResponder.create({

            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Capture LEFT → RIGHT movement
                return gestureState.dx > 10;
            },

            onPanResponderRelease: (_, gestureState) => {
                // Go back after swiping at least 80px to the right
                if (gestureState.dx > 80) {
                    goBack();
                }
            },

        })
    ).current;

    //const event = data.recommended[0];


    const Info = ({ label, value }: { label: string; value: string }) => (
        <View className="mb-4 w-1/2 pr-3">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">{label}</Text>
            <Text className="mt-1 text-base text-baseFont">{value}</Text>
        </View>
    );

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