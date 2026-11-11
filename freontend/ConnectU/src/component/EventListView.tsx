import {ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import {Feather} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

import {useEventContext} from "@/context/useEventContext";
import {DiscoverSectionHeader} from "@/component/DiscoverSectionHeader";
import {EventCard} from "@/component/EventCard";
import {TitleCard} from "@/component/TitleCard";
import {Event, EventStore} from "@/insterface/eventInterface";
import {useTheme} from "@/hooks/use-theme";


// ---------------------------------------------------------------- Search bar

const Search = () => {
    const {colors} = useTheme();
    const {searchEvents, clearSearch, lastSearch} = useEventContext();

    // Refill from the last search, so text survives opening a detail and coming back
    const [text, setText] = useState(lastSearch?.q ?? "");

    function submit() {
        const q = text.trim();
        if (q) {
            searchEvents({q});
        } else {
            clearSearch();
        }
    }

    function onChange(value: string) {
        setText(value);
        if (value.trim() === "") {
            clearSearch();                      // box emptied → back to the feed
        }
    }

    function clear() {
        setText("");
        clearSearch();
    }

    return (
        <View
            className="w-[95%] h-[55%] flex-row items-center px-5 gap-4 shadow-lg rounded-[32px]"
            style={{backgroundColor: colors.surface, shadowColor: colors.baseGray100}}
        >
            {/* LEFT — search icon submits too */}
            <TouchableOpacity onPress={submit}>
                <Feather name="search" size={24} color={colors.baseFont}/>
            </TouchableOpacity>

            {/* CENTER */}
            <TextInput
                className="flex-1 text-xl p-0"
                style={{color: colors.baseFont}}
                placeholder="Search..."
                placeholderTextColor={colors.baseFont}
                selectionColor={colors.baseFont}
                value={text}
                onChangeText={onChange}
                onSubmitEditing={submit}
                returnKeyType="search"
                autoCorrect={false}
            />

            {/* Clear (only when there's text) */}
            {text.length > 0 && (
                <TouchableOpacity onPress={clear}>
                    <Feather name="x" size={20} color={colors.baseFont}/>
                </TouchableOpacity>
            )}

            {/* RIGHT — filters (category / location / date) come later */}
            <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{borderColor: colors.baseGray100}}
            >
                <TouchableOpacity onPress={() => { /* TODO: open filter panel */ }}>
                    <Ionicons name="filter" size={20} color={colors.baseFont}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};


// ---------------------------------------------------------------- Top container

interface TopContainerProps {
    childrenOne?: React.ReactNode;
}

const TopContainer = ({childrenOne}: TopContainerProps) => {
    return (
        <View className="w-full h-[13%]">
            <View className="w-full h-full items-center justify-center">
                {childrenOne}
            </View>
        </View>
    );
};


// ---------------------------------------------------------------- Feed

interface UserFeedProps {
    recommendedEvents: Event[];
    upcomingEvents: Event[];
    onSelectEvent: (eventId: number) => void;
}

const UserFeed = ({recommendedEvents, upcomingEvents, onSelectEvent}: UserFeedProps) => {
    const {refreshFeed} = useEventContext();
    const [refreshing, setRefreshing] = useState(false);

    async function onRefresh() {
        setRefreshing(true);
        await refreshFeed();          // forced sync, ignores the 1-minute throttle
        setRefreshing(false);
    }

    return (
        <View className="w-full h-[87%]">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-3 pb-10"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                //uncomment only when backend connected
                // refreshControl={
                //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                // }
            >
                <TitleCard/>

                <DiscoverSectionHeader text="Recommended for you" textSize="xxl"/>
                {recommendedEvents.map(event => (
                    <TouchableOpacity key={event.eventId} onPress={() => onSelectEvent(event.eventId)}>
                        <EventCard event={event}/>
                    </TouchableOpacity>
                ))}

                <DiscoverSectionHeader text="Upcoming events" textSize="xxl"/>
                {upcomingEvents.map(event => (
                    <TouchableOpacity key={event.eventId} onPress={() => onSelectEvent(event.eventId)}>
                        <EventCard event={event}/>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};


// ---------------------------------------------------------------- Search results

interface SearchResultsProps {
    results: Event[];
    isSearching: boolean;
    error: string | null;
    query?: string;
    onSelectEvent: (eventId: number) => void;
}

const SearchResults = ({results, isSearching, error, query, onSelectEvent}: SearchResultsProps) => {
    const {colors} = useTheme();

    if (isSearching) {
        return (
            <View className="w-full h-[87%] items-center pt-10">
                <ActivityIndicator color={colors.baseFont}/>
            </View>
        );
    }

    if (error) {
        return (
            <View className="w-full h-[87%] items-center pt-10">
                <Text className="text-base text-red-500">{error}</Text>
            </View>
        );
    }

    if (results.length === 0) {
        // UC-3 alternate path
        return (
            <View className="w-full h-[87%] items-center pt-10 gap-2">
                <Feather name="search" size={32} color={colors.baseFont}/>
                <Text className="text-lg font-bold text-baseFont">No results found</Text>
                {query ? <Text className="text-sm text-muted">Nothing matches "{query}"</Text> : null}
            </View>
        );
    }

    return (
        <View className="w-full h-[87%]">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-3 pb-10"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                {/*<DiscoverSectionHeader*/}
                {/*    text={`${results.length} ${results.length === 1 ? "result" : "results"}${query ? ` for "${query}"` : ""}`}*/}
                {/*    textSize="xxl"*/}
                {/*/>*/}
                {results.map(event => (
                    <TouchableOpacity key={event.eventId} onPress={() => onSelectEvent(event.eventId)}>
                        <EventCard event={event}/>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};


// ---------------------------------------------------------------- EventListView

interface EventListViewProps {
    eventState: EventStore;
    isLoadDetailScreen: (clicked: boolean, eventID: number) => void;
}

export const EventListView = ({eventState, isLoadDetailScreen}: EventListViewProps) => {
    // TODO: MOVE TO A BROADER CONTEXT FOR DEVICE AND DEVICE INFORMATION
    const [device, setDevice] = useState<string | null>(null);

    const {searchResults, isSearching, searchError, lastSearch} = useEventContext();
    const state = eventState;

    // Feed: the backend already filtered to upcoming and ordered state.events.
    // Recommended row follows the backend's ranking (best first).
    const byId = new Map(state.events.map(e => [e.eventId, e]));
    const recommendedEvents = (state.recommendedIds ?? [])
        .map(id => byId.get(id))
        .filter((e): e is Event => e !== undefined);
    const upcomingEvents = state.events.filter(event => !event.isRecommended);

    // Tapping any card (feed or search) opens EventDetail in Discover
    const openDetails = (eventId: number) => isLoadDetailScreen(true, eventId);

    const showSearch = state.searchResultIds !== null || isSearching;

    return (
        <View className="flex-1">
            <TopContainer childrenOne={<Search/>}/>

            {showSearch ? (
                <SearchResults
                    results={searchResults}
                    isSearching={isSearching}
                    error={searchError}
                    query={lastSearch?.q}
                    onSelectEvent={openDetails}
                />
            ) : (
                <UserFeed
                    recommendedEvents={recommendedEvents}
                    upcomingEvents={upcomingEvents}
                    onSelectEvent={openDetails}
                />
            )}
        </View>
    );
};


//import {ScrollView, TextInput, TouchableOpacity, View} from "react-native";
//import {useEventContext} from "@/context/useEventContext"
// import { DiscoverSectionHeader } from "@/component/DiscoverSectionHeader";
// import {useCallback, useEffect, useState} from "react";
// import {EventCard} from "@/component/EventCard";
// import {TitleCard} from "@/component/TitleCard";
// import { EventStore, Event} from "@/insterface/eventInterface";
// import {SafeAreaView} from "react-native-safe-area-context";
// import  {useTheme} from "@/hooks/use-theme";
// import {Feather} from "@expo/vector-icons";
// import Ionicons from "@expo/vector-icons/Ionicons";
//
//
//
// interface EventListViewProps {
//     eventState: EventStore;
//     isLoadDetailScreen: (clicked: boolean, evntID: number) => void;
// }
// interface TopContainerProps {
//     childrenOne?: React.ReactNode;
//
// }
//
//
//
//
// const Search = () =>{
//     const { colors } = useTheme();
//
//     return(
//         <View
//             className="
//         w-[95%] h-[55%]
//         flex-row items-center
//         px-5 gap-4
//         shadow-lg
//         rounded-[32px]
//     "
//             style={{
//                 backgroundColor: colors.surface,
//                 shadowColor: colors.baseGray100,
//             }}
//         >
//             {/* LEFT — Search Icon */}
//
//             <TouchableOpacity
//             >
//                 <Feather
//                     name="search"
//                     size={24}
//                     color={colors.baseFont}
//
//                 />
//             </TouchableOpacity>
//
//
//             {/* CENTER — Takes all remaining space */}
//             <TextInput
//                 className="flex-1 text-xl p-0"
//                 style={{
//                     color: colors.baseFont,
//                 }}
//                 placeholder="Search..."
//                 placeholderTextColor={colors.baseFont}
//                 selectionColor={colors.baseFont}
//             />
//
//             {/* RIGHT — Filter Circle */}
//             <View
//                 className="w-10 h-10 rounded-full items-center justify-center "
//                 style={{
//                     borderColor: colors.baseGray100,
//                 }}
//             >
//                 <TouchableOpacity
//                 >
//                     <Ionicons
//                         name="filter"
//                         size={20}
//                         color={colors.baseFont}
//                     />
//                 </TouchableOpacity>
//
//
//
//             </View>
//         </View>
//
//     )
// }
//
// const TopContainer = ({childrenOne}: TopContainerProps) =>{
//     return (
//         <View className="w-full h-[13%]">
//             <View className="w-full h-full items-center justify-center">
//                 {childrenOne}
//             </View>
//         </View>
//     )
// }
//
// export const EventListView = ({eventState, isLoadDetailScreen}:EventListViewProps)=>{
//     //TODO: IMPLEMENT SEARCH AND FILTER CRATERIA EVENT IN DYNAMIC ENEVNT FUNCTION
//     // TODO: MOVE TO A BROADER CONTEXT FOR DEVICE AND DEVICE INFORMATION
//     const [device, setDevice] = useState<string | null>(null);
//
//
//
//     //TODO: Keep Here
//     const state = eventState
//     const recommendedEvents = state.events.filter(
//         event => event.isRecommended
//     );
//     // Get current time as a number
//     const currentDateTime = new Date().getTime();
//
//
//     function dateTimeConverter(date: string, time: string): number {
//         // Combine the event's date and time
//         const dateTime = new Date(`${date} ${time}`);
//
//         // Convert Date → number
//         return dateTime.getTime();
//     }
//
//
// // 1. Remove recommended events
//     const notRecommended = state.events.filter(
//         event => !event.isRecommended
//     );
//
//
// // 2. Remove events that already happened
//     const upcomingEvents = notRecommended.filter(event => {
//
//         const eventDateTime = dateTimeConverter(
//             event.eventDate,
//             event.startTime
//         );
//
//         return eventDateTime >= currentDateTime;
//     });
//
//
// // 3. Sort upcoming events from soonest → latest
//     const sortedEvents = upcomingEvents.sort(
//         (eventA, eventB) => {
//
//             const dateTimeA = dateTimeConverter(
//                 eventA.eventDate,
//                 eventA.startTime
//             );
//
//             const dateTimeB = dateTimeConverter(
//                 eventB.eventDate,
//                 eventB.startTime
//             );
//
//             return dateTimeA - dateTimeB;
//         }
//     );
// function StaticEventListView(){
//         return (
//             <View className="flex-1">
//                 <TopContainer
//                     childrenOne={<Search />}
//
//                 />
//
//                 <View className="w-full h-[87%]">
//                     <ScrollView className="flex-1 " contentContainerClassName="gap-3 pb-10"
//                                 showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
//                         <TitleCard/>
//
//                         <DiscoverSectionHeader
//                             text="Recommended for you"
//                             textSize="xxl"
//                         />
//
//                         {recommendedEvents.map(event => (
//                             <TouchableOpacity
//                                 key={event.eventId}
//                                 onPress={() => {
//                                     isLoadDetailScreen(true, event.eventId)
//
//                                 }}
//                             >
//                                 <EventCard
//
//                                     event={event}
//                                 />
//                             </TouchableOpacity>
//
//                         ))}
//
//
//
//                         <DiscoverSectionHeader
//                             text="Upcoming events"
//                             textSize="xxl"
//                         />
//
//                         {sortedEvents.map(event => (
//                             <TouchableOpacity
//                                 key={event.eventId}
//                                 onPress={() => {
//                                     isLoadDetailScreen(true, event.eventId)
//
//                                 }}
//                             >
//                                 <EventCard
//
//                                     event={event}
//                                 />
//                             </TouchableOpacity>
//
//                         ))}
//                     </ScrollView>
//                 </View>
//             </View>
//
//
//         )
// }
//
//     function SearchResults(){
//             return (
//                 <View className="flex-1">
//                     <TopContainer
//                         childrenOne={<Search />}
//                     />
//                     <View className="w-full h-[87%]">
//
//                     </View>
//
//                 </View>
//
//             )
//
//     }
//
//     // here we display view according to users
//     return (
//         <View className="flex-1 " >
//
//           <StaticEventListView />
//         </View>
//     )
// }