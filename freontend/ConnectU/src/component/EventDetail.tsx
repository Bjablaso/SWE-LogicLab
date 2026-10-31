import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import data from '../../event.json';


export default function EventDetail() {
    const event = data.recommended[0];
    const [saved, setSaved] = useState(event.isSaved);
    const [rsvpd, setRsvpd] = useState(event.isRsvpd);

    const attending = event.capacity - event.spotsLeft;
    const format = { in_person: 'In person', online: 'Online', hybrid: 'Hybrid' }[event.format];

    const Info = ({ label, value }: { label: string; value: string }) => (
        <View className="mb-4 w-1/2 pr-3">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">{label}</Text>
            <Text className="mt-1 text-base text-baseFont">{value}</Text>
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-background" contentContainerClassName="px-4 pb-10">
            {/* back */}
            <TouchableOpacity onPress={() => router.back()} className="mb-4 h-11 w-11 items-center justify-center rounded-full border border-control">
                <Feather name="chevron-left" size={22} color="#9E9A90" />
            </TouchableOpacity>

            {/* header */}
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">{event.category}</Text>
            <Text className="mt-1 text-3xl font-extrabold text-baseFont">{event.title}</Text>

            {/* stats */}
            <View className="mt-4 flex-row gap-3">
                <View className="flex-row items-baseline gap-2 rounded-2xl border border-border px-4 py-3">
                    <Text className="text-3xl font-extrabold text-accent">{attending}</Text>
                    <Text className="text-sm text-muted">attending</Text>
                </View>
                <View className="flex-row items-baseline gap-2 rounded-2xl border border-border px-4 py-3">
                    <Text className="text-3xl font-extrabold text-accent">{event.spotsLeft}</Text>
                    <Text className="text-sm text-muted">spots left</Text>
                </View>
            </View>

            {/* details grid */}
            <View className="mt-6 flex-row flex-wrap">
                <Info label="Date & time" value={`${event.eventDate} · ${event.startTime}–${event.endTime}`} />
                <Info label="Format" value={format ?? event.format} />
                <Info label="Venue" value={event.location} />
                <Info label="Availability" value={`${event.spotsLeft} of ${event.capacity} spots open`} />
            </View>

            {/* about */}
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">About</Text>
            <Text className="mt-1 text-base leading-6 text-baseFont">{event.description}</Text>

            {/* actions */}
            <View className="mt-6 flex-row gap-3 border-t border-border pt-5">
                {saved && (<TouchableOpacity onPress={() => setSaved(!saved)} className="rounded-full border border-control px-5 py-3">
                    <Text className="font-bold text-baseFont">{'Unsave'}</Text>
                </TouchableOpacity>)}

                {rsvpd && (
                    <TouchableOpacity onPress={() => setRsvpd(!rsvpd)} className="rounded-full bg-accent px-6 py-3">
                        <Text className="font-bold text-black">{'RSVP'}</Text>
                    </TouchableOpacity>
                )}

            </View>
        </ScrollView>
    );
}