import {ScrollView, TouchableOpacity, View} from "react-native";
import {useEventContext} from "@/context/useEventContext"
import { DiscoverSectionHeader } from "@/component/DiscoverSectionHeader";
import {useEffect, useState} from "react";
import {EventCard} from "@/component/EventCard";
import DeviceCountry, { TYPE_TELEPHONY, TYPE_CONFIGURATION } from 'react-native-device-country';
import {TitleCard} from "@/component/TitleCard";
import { EventStore} from "@/insterface/eventInterface";

interface EventListViewProps {
    eventState: EventStore;
    isLoadDetailScreen: (clicked: boolean, evntID: number) => void;
}
export const EventListView = ({eventState, isLoadDetailScreen}:EventListViewProps)=>{
    //TODO: IMPLEMENT SEARCH AND FILTER CRATERIA EVENT IN DYNAMIC ENEVNT FUNCTION
    // TODO: MOVE TO A BROADER CONTEXT FOR DEVICE AND DEVICE INFORMATION
    const [device, setDevice] = useState<string | null>(null);



    //TODO: Keep Here
    const state = eventState
    const recommendedEvents = state.events.filter(
        event => event.isRecommended
    );
    // Get current time as a number
    const currentDateTime = new Date().getTime();


    function dateTimeConverter(date: string, time: string): number {
        // Combine the event's date and time
        const dateTime = new Date(`${date} ${time}`);

        // Convert Date → number
        return dateTime.getTime();
    }


// 1. Remove recommended events
    const notRecommended = state.events.filter(
        event => !event.isRecommended
    );


// 2. Remove events that already happened
    const upcomingEvents = notRecommended.filter(event => {

        const eventDateTime = dateTimeConverter(
            event.eventDate,
            event.startTime
        );

        return eventDateTime >= currentDateTime;
    });


// 3. Sort upcoming events from soonest → latest
    const sortedEvents = upcomingEvents.sort(
        (eventA, eventB) => {

            const dateTimeA = dateTimeConverter(
                eventA.eventDate,
                eventA.startTime
            );

            const dateTimeB = dateTimeConverter(
                eventB.eventDate,
                eventB.startTime
            );

            return dateTimeA - dateTimeB;
        }
    );
    function StaticEventListView(){
        return (
            <ScrollView className="flex-1 " contentContainerClassName="gap-3 pb-10"
            showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <TitleCard/>

                <DiscoverSectionHeader
                    text="Recommended for you"
                />

                {recommendedEvents.map(event => (
                    <TouchableOpacity
                        onPress={() => {
                            isLoadDetailScreen(true, event.eventId)

                        }}
                    >
                        <EventCard
                            key={event.eventId}
                            event={event}
                        />
                    </TouchableOpacity>

                ))}



                <DiscoverSectionHeader
                    text="Upcoming events"
                />

                {sortedEvents.map(event => (
                    <TouchableOpacity
                        onPress={() => {
                            isLoadDetailScreen(true, event.eventId)

                        }}
                    >
                        <EventCard
                            key={event.eventId}
                            event={event}
                        />
                    </TouchableOpacity>

                ))}
            </ScrollView>
        )
    }

    function DynanicEventListView(){
        return (
            <ScrollView className="flex-1" contentContainerClassName="gap-3 pb-10">

                <DiscoverSectionHeader
                    text="Recommended for you"
                />

                <DiscoverSectionHeader
                    text="Recommended for you"
                />
            </ScrollView>
        )

    }

    // here we display view according to users
    return (
        <View className="flex-1 " >

          <StaticEventListView />
        </View>
    )
}