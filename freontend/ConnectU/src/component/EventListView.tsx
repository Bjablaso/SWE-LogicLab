import {ScrollView, TouchableOpacity, View} from "react-native";
import { DiscoverSectionHeader } from "@/component/DiscoverSectionHeader";
import {EventCard} from "@/component/EventCard";
import {TitleCard} from "@/component/TitleCard";
import { EventStore} from "@/insterface/eventInterface";

interface EventListViewProps {
    eventState: EventStore;
    isLoadDetailScreen: (clicked: boolean, evntID: number) => void;
}
export const EventListView = ({eventState, isLoadDetailScreen}:EventListViewProps)=>{
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
    return (
        <View className="flex-1">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-3 pb-10"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                <TitleCard />
                <DiscoverSectionHeader text="Recommended for you" textSize="xxl" />
                {recommendedEvents.map(event => (
                    <TouchableOpacity
                        key={event.eventId}
                        onPress={() => isLoadDetailScreen(true, event.eventId)}
                    >
                        <EventCard event={event} />
                    </TouchableOpacity>
                ))}
                <DiscoverSectionHeader text="Upcoming events" textSize="xxl" />
                {sortedEvents.map(event => (
                    <TouchableOpacity
                        key={event.eventId}
                        onPress={() => isLoadDetailScreen(true, event.eventId)}
                    >
                        <EventCard event={event} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}