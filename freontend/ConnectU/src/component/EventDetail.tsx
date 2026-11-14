import {useRef, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    PanResponder,
    ScrollView,
    Animated,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import {FontAwesome, Feather} from "@expo/vector-icons";

import {EventStore} from "@/insterface/eventInterface";
import {useEventContext} from "@/context/useEventContext";

interface EventDetailProps {
    eventStore: EventStore;
    eventID: number;
    goBack: () => void;
}

const BAR_HEIGHT = 96;
const IS_WEB = Platform.OS === "web";

export default function EventDetail({eventID, goBack, eventStore}: EventDetailProps) {
    const state = eventStore;

    const {attendEvent, unattendEvent, saveEvent, unsaveEvent} = useEventContext();

    const event = state.events.find(e => e.eventId === eventID);

    /*
     * Hooks must run before any early return
     */
    const [saved, setSaved] = useState(event?.isSaved ?? false);
    const [rsvpd, setRsvpd] = useState(event?.isRsvpd ?? false);

    /*
     * Bottom bar: hides when scrolling down, shows when scrolling up or at the top
     */
    const barOffset = useRef(new Animated.Value(0)).current;
    const lastY = useRef(0);
    const barHidden = useRef(false);

    const showBar = (show: boolean) => {
        if (barHidden.current === !show) return;
        barHidden.current = !show;
        Animated.timing(barOffset, {
            toValue: show ? 0 : BAR_HEIGHT + 20,
            duration: 200,
            useNativeDriver: !IS_WEB,          // web has no native driver
        }).start();
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y <= 0) showBar(true);
        else if (y > lastY.current + 4) showBar(false);   // scrolling down
        else if (y < lastY.current - 4) showBar(true);    // scrolling up
        lastY.current = y;
    };

    /*
     * Mobile only: swipe LEFT → RIGHT to go back
     */
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => g.dx > 10 && Math.abs(g.dy) < 10,
            onPanResponderRelease: (_, g) => {
                if (g.dx > 80) goBack();
            },
        })
    ).current;

    if (!event) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-baseFont">Event not found</Text>
            </View>
        );
    }

    /*
     * Event information
     */
    const attending = event.capacity - event.spotsLeft;
    const format = {in_person: "In person", online: "Online", hybrid: "Hybrid"}[event.format];

    const toggleSave = () => {
        if (saved) unsaveEvent(eventID);
        else saveEvent(eventID);
        setSaved(!saved);
    };

    const toggleRsvp = () => {
        if (rsvpd) unattendEvent(eventID);
        else attendEvent(eventID);
        setRsvpd(!rsvpd);
        goBack();
    };

    const Info = ({label, value}: { label: string; value: string }) => (
        <View className="mb-4 w-1/2 pr-3">
            <Text className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</Text>
            <Text className="mt-1 text-[15px] text-baseFont">{value}</Text>
        </View>
    );

    /*
     * RSVP button: full width on mobile, sized to content on web
     */
    const RsvpButton = (
        <TouchableOpacity
            onPress={toggleRsvp}
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
                IS_WEB ? "px-8" : ""
            } ${rsvpd ? "border border-accent" : "bg-accent"}`}
        >
            <Feather name={rsvpd ? "check" : "calendar"} size={18} color={rsvpd ? "#FFC800" : "#121212"}/>
            <Text className={`text-base font-bold ${rsvpd ? "text-accent" : "text-black"}`}>
                {rsvpd ? "Going · tap to cancel" : "RSVP"}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View
            className="flex-1 bg-background"
            {...(IS_WEB ? {} : panResponder.panHandlers)}   // swipe back on mobile only
        >
            <ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{paddingBottom: BAR_HEIGHT + 24}}
                contentContainerClassName="px-5 pt-4"
            >
                {/* HEADER: category + heart */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                        {event.category}
                    </Text>
                    <TouchableOpacity
                        onPress={toggleSave}
                        className="h-11 w-11 items-center justify-center rounded-full border border-control"
                    >
                        <FontAwesome
                            name={saved ? "heart" : "heart-o"}
                            size={20}
                            color={saved ? "#FF4D6D" : "#9E9A90"}
                        />
                    </TouchableOpacity>
                </View>

                <Text className="mt-1 text-3xl font-extrabold text-baseFont">{event.title}</Text>

                {/* STATS */}
                <View className="mt-4 flex-row gap-3">
                    <View className="flex-1 flex-row items-baseline gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
                        <Text className="text-3xl font-extrabold text-accent">{attending}</Text>
                        <Text className="text-sm text-muted">attending</Text>
                    </View>
                    <View className="flex-1 flex-row items-baseline gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
                        <Text className="text-3xl font-extrabold text-accent">{event.spotsLeft}</Text>
                        <Text className="text-sm text-muted">spots left</Text>
                    </View>
                </View>

                <View className="my-5 h-px bg-border"/>

                {/* DETAILS GRID */}
                <View className="flex-row flex-wrap">
                    <Info label="Date & time" value={`${event.eventDate} · ${event.startTime}–${event.endTime}`}/>
                    <Info label="Format" value={format ?? event.format}/>
                    <Info label="Venue" value={event.location}/>
                    <Info label="Availability" value={`${event.capacity - event.spotsLeft} of ${event.capacity} spots taken`}/>
                </View>

                <View className="h-px bg-border"/>

                {/* ABOUT */}
                <Text className="mt-5 text-[11px] font-bold uppercase tracking-widest text-muted">About</Text>
                <Text className="mt-1 text-[15px] leading-6 text-baseFont">{event.description}</Text>
            </ScrollView>

            {/* BOTTOM BAR (slides away on scroll down) */}
            <Animated.View
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: BAR_HEIGHT,
                    justifyContent: "center",
                    paddingHorizontal: 20,
                    zIndex: 10,
                    elevation: 10,
                    transform: [{translateY: barOffset}],
                }}
            >
                <View className="absolute inset-0 border-t border-border bg-background"/>

                {IS_WEB ? (
                    /* Web: Back on the left, RSVP on the right, each sized to content */
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={goBack}
                            accessibilityLabel="Back to events"
                            className="flex-row items-center gap-2 rounded-full border border-control px-6 py-4"
                        >
                            <Feather name="arrow-left" size={18} color="#9E9A90"/>
                            <Text className="text-base font-bold text-baseFont">Back</Text>
                        </TouchableOpacity>

                        {RsvpButton}
                    </View>
                ) : (
                    /* Mobile: RSVP takes the full width; swipe right to go back */
                    RsvpButton
                )}
            </Animated.View>
        </View>
    );
}