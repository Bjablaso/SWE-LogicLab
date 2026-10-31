import { useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    PanResponder,
} from "react-native";

import { EventStore } from "@/insterface/eventInterface";


interface EventDetailProps {
    eventStore: EventStore;

    saveEvent?: (currentEventID: number) => void;
    unsaveEvent?: (currentEventID: number) => void;

    attendEvent?: (currentEventID: number) => void;
    unattendEvent?: (currentEventID: number) => void;

    eventID: number;

    goBack: () => void;
}


export default function EventDetail({
                                        eventID,
                                        goBack,
                                        eventStore,
                                        attendEvent,
                                        unattendEvent,
                                        saveEvent,
                                        unsaveEvent,
                                    }: EventDetailProps) {

    const state = eventStore;

    const attendEventFunc = attendEvent;
    const saveEventFunc = saveEvent;
    const unsaveEventFunc = unsaveEvent;
    const unattendEventFunc = unattendEvent;


    // TODO: MOVE TO useEventContext()

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


    /*
     * Local UI state
     *
     * false = user has NOT saved/RSVP'd
     * true  = user HAS saved/RSVP'd
     */
    const [saved, setSaved] = useState(event.isSaved);
    const [rsvpd, setRsvpd] = useState(event.isRsvpd);


    /*
     * Event information
     */

    const attending =
        event.capacity - event.spotsLeft;


    const format = {
        in_person: "In person",
        online: "Online",
        hybrid: "Hybrid",
    }[event.format];


    /*
     * Swipe LEFT → RIGHT
     *
     * Positive dx means the user's finger
     * is moving toward the right.
     */

    const panResponder = useRef(
        PanResponder.create({

            onMoveShouldSetPanResponder: (_, gestureState) => {

                return gestureState.dx > 10;

            },


            onPanResponderRelease: (_, gestureState) => {

                if (gestureState.dx > 80) {

                    goBack();

                }

            },

        })
    ).current;


    /*
     * Small reusable information component
     */

    const Info = ({
                      label,
                      value,
                  }: {
        label: string;
        value: string;
    }) => (

        <View className="mb-4 w-1/2 pr-3">

            <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                {label}
            </Text>

            <Text className="mt-1 text-base text-baseFont">
                {value}
            </Text>

        </View>

    );


    return (

        <View
            className="flex-1 p-2 bg-background "
            {...panResponder.panHandlers}
        >


            {/* MAIN CONTENT */}

            <View className="flex-1 flex-col gap-5 p-2  w-full">


                {/* HEADER */}

                <Text className="text-xs font-bold uppercase tracking-widest text-muted">

                    {event.category}

                </Text>


                <Text className="mt-1 text-3xl font-extrabold text-baseFont">

                    {event.title}

                </Text>



                {/* STATS */}

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



                {/* DETAILS GRID */}

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



                {/* ABOUT */}

                <Text className="text-xs font-bold uppercase tracking-widest text-muted">

                    About

                </Text>


                <Text className="mt-1 text-base leading-6 text-baseFont">

                    {event.description}

                </Text>


            </View>



            {/* BOTTOM ACTIONS */}

            <View className="flex-row gap-3 border-t border-border pt-5">


                {/* SAVE BUTTON SLOT
                    The View always stays in the layout.
                    Only the button disappears.
                */}

                <View className="flex-1">


                    {!saved && (

                        <TouchableOpacity

                            onPress={() => {

                                /*
                                 * Mark event as saved locally.
                                 */

                                setSaved(true);


                                /*
                                 * Update global event state.
                                 */

                                if (saveEventFunc) {

                                    saveEventFunc(eventID);

                                }

                            }}

                            className="items-center rounded-full border border-control px-5 py-3"
                        >

                            <Text className="font-bold text-baseFont">

                                SAVE

                            </Text>

                        </TouchableOpacity>

                    )}


                </View>



                {/* RSVP BUTTON SLOT
                    Same idea:
                    slot stays, button disappears.
                */}

                <View className="flex-1">


                    {!rsvpd && (

                        <TouchableOpacity

                            onPress={() => {

                                /*
                                 * Mark event as RSVP'd locally.
                                 */

                                setRsvpd(true);


                                /*
                                 * Update global event state.
                                 */

                                if (attendEventFunc) {

                                    attendEventFunc(eventID);

                                }

                            }}

                            className="items-center rounded-full bg-accent px-6 py-3"
                        >

                            <Text className="font-bold text-black">

                                RSVP

                            </Text>

                        </TouchableOpacity>

                    )}


                </View>


            </View>


        </View>

    );

}