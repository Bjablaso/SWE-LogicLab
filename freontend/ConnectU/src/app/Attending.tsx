import {View, Text, TouchableOpacity, ScrollView} from "react-native";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import {useCallback, useState} from "react";
import EventDetail from "@/component/EventDetail";
import {useEventContext} from "@/context/useEventContext";
import {useFocusEffect} from "expo-router";
import {useTheme} from "@/hooks/use-theme";
import {directionIcon, directionLabel, filterBy, nextDirection} from "@/insterface/eventInterface";
import {ResponsiveGrid} from "@/component/ResponsiveGrid";

interface AttendingHeaderProp {
    filterDirection: filterBy;
    onToggleDirection: () => void;
}

// The header doesn't own the sort state. It shows the current direction
// and tells the parent when it's tapped.
const AttendingHeader = ({filterDirection, onToggleDirection}: AttendingHeaderProp) => {
    return (
        <View>
            <Text className="text-3xl font-extrabold text-baseFont">Attending</Text>
            <Text className="mt-1 text-sm text-muted">
                Upcoming events you RSVP’d to. Events drop off this list once they’re over.
            </Text>

            <Text className="mt-5 text-xs font-bold text-muted">Sort by</Text>
            <View className="mt-2 flex-row gap-3">
                <TouchableOpacity
                    onPress={() => {}}
                    className="flex-1 flex-row items-center justify-between rounded-xl border border-control px-4 py-3"
                >
                    <Text className="text-baseFont">Event date</Text>
                    <Feather name="chevron-down" size={18} color="#9E9A90"/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onToggleDirection}
                    className="flex-row items-center gap-1 rounded-xl border border-control px-4 py-3"
                >
                    <Text className="font-bold text-baseFont">
                        {directionLabel(filterDirection)}
                    </Text>
                    <Feather name={directionIcon(filterDirection)} size={16} color="#9E9A90"/>
                </TouchableOpacity>
            </View>
        </View>
    );
};


interface AttendingEventRowProp {
    title: string;
    eventDate: string;
    startTime: string;
    location: string;
    isClick: (clicked: boolean) => void;
    viewEventIDNow: (id: number) => void;
    eventID: number;
}

const AttendingEventRow = ({title, eventDate, startTime, location,
                               isClick, viewEventIDNow, eventID}: AttendingEventRowProp) => {
    const {colors} = useTheme();
    const {unattendEvent} = useEventContext();

    return (
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            {/* top: 2 rows */}
            <View className="gap-1">
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 text-base font-bold text-baseFont" numberOfLines={1}>
                        {title}
                    </Text>
                    <View
                        className="rounded-full bg-accent/30 px-3 py-1"
                        style={{backgroundColor: `${colors?.accent}20`}}
                    >
                        <Text className="text-xs font-bold text-accent ">RSVP’d</Text>
                    </View>
                </View>
                <Text className="text-sm text-muted" numberOfLines={1}>
                    {eventDate} · {startTime} · {location}
                </Text>
            </View>

            {/* bottom: 2 buttons side by side */}
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => {
                        isClick(true);
                        viewEventIDNow(eventID);
                    }}
                    className="flex-1 items-center rounded-full border border-control py-2.5"
                >
                    <Text className="font-bold text-baseFont">View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => unattendEvent(eventID)}
                    className="flex-1 items-center rounded-full bg-accent py-2.5"
                >
                    <Text className="font-bold text-baseFont"> Cancel RSVP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function Attending() {
    const {state, filterRSVPEventList} = useEventContext();
    const [isViewable, setViewable] = useState(false);
    const [eventID, setEventID] = useState<number>(0);
    const [filterDirection, setFilterDirection] = useState<filterBy>("None");

    // Reset to defaults every time this tab comes into focus
    useFocusEffect(
        useCallback(() => {
            setViewable(false);
            setEventID(0);
            setFilterDirection("None");
        }, [])
    );

    function currentID(id: number) {
        setEventID(id);
    }

    function viewable(view: boolean) {
        setViewable(view);
    }

    function goBack() {
        setViewable(false);
    }

    const rsvpEvents = filterRSVPEventList(filterDirection);

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
            {!isViewable ? (
                <View className="flex-1 p-2 bg-background">
                    <AttendingHeader
                        filterDirection={filterDirection}
                        onToggleDirection={() => setFilterDirection(prev => nextDirection(prev))}
                    />

                    {/* only the list scrolls */}
                    <ScrollView className="mt-6 flex-1" contentContainerClassName="pb-10">
                        <ResponsiveGrid
                            items={rsvpEvents}          // rsvpEvents in Attending
                            keyExtractor={event => event.eventId}
                            minItemWidth={300}
                            maxColumns={2}
                            gap={12}
                            renderItem={event => (
                                <AttendingEventRow
                                    title={event.title}
                                    eventDate={event.eventDate}
                                    startTime={event.startTime}
                                    location={event.location}
                                    isClick={viewable}
                                    viewEventIDNow={currentID}
                                    eventID={event.eventId}
                                />
                            )}
                        />
                    </ScrollView>
                </View>
            ) : (
                <EventDetail
                    eventStore={state}
                    eventID={eventID}
                    goBack={goBack}
                />
            )}
        </SafeAreaView>
    );
}

// import { View, Text, TouchableOpacity, ScrollView } from "react-native";
// import { Feather } from "@expo/vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {useCallback, useState} from "react";
// import EventDetail from "@/component/EventDetail";
// import {useEventContext} from "@/context/useEventContext";
// import {useFocusEffect} from "expo-router";
// import {useTheme} from "@/hooks/use-theme";
// import {directionIcon, directionLabel, filterBy, nextDirection} from "@/insterface/eventInterface";
// // import {nextDirection, directionLabel, directionIcon} from "@/utils/sortDirection";
//
// interface AttendingHeaderProp {
//     filterDirection: filterBy;
//     onToggleDirection: () => void;
// }
//
// // The header no longer owns the sort state. It shows the current direction
// // and tells the parent when it's tapped.
// const AttendingHeader = ({filterDirection, onToggleDirection}: AttendingHeaderProp) => {
//     return (
//         <View>
//             <Text className="text-3xl font-extrabold text-baseFont">Attending</Text>
//             <Text className="mt-1 text-sm text-muted">
//                 Upcoming events you RSVP’d to. Events drop off this list once they’re over.
//             </Text>
//
//             <Text className="mt-5 text-xs font-bold text-muted">Sort by</Text>
//             <View className="mt-2 flex-row gap-3">
//                 <TouchableOpacity onPress={() => {}} className="flex-1 flex-row items-center justify-between rounded-xl border border-control px-4 py-3">
//                     <Text className="text-baseFont">Event date</Text>
//                     <Feather name="chevron-down" size={18} color="#9E9A90" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     onPress={onToggleDirection}
//                     className="flex-row items-center gap-1 rounded-xl border border-control px-4 py-3"
//                 >
//                     <Text className="font-bold text-baseFont">
//                         {directionLabel(filterDirection)}
//                     </Text>
//                     <Feather
//                         name={directionIcon(filterDirection)}
//                         size={16}
//                         color="#9E9A90"
//                     />
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };
//
//
// interface AttendingEventRowProp{
//     title: string;
//     eventDate: string;
//     startTime: string;
//     location: string;
//     isClick: (clicked: boolean)=>void;
//     viewEventIDNow: (id: number)=>void;
//     eventID: number;
// }
//
// const AttendingEventRow = ({title, eventDate, startTime, location,
//                                isClick, viewEventIDNow, eventID}: AttendingEventRowProp) => {
//     const {colors} = useTheme();
//     const {unattendEvent} = useEventContext();
//
//     return (
//         <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
//             {/* top: 2 rows */}
//             <View className="gap-1">
//                 <View className="flex-row items-center justify-between gap-2">
//                     <Text className="flex-1 text-base font-bold text-baseFont" numberOfLines={1}>
//                         {title}
//                     </Text>
//                     <View className="rounded-full bg-accent/30 px-3 py-1"
//                           style={{
//                               backgroundColor: `${colors?.accent}20`,
//                           }}>
//                         <Text className="text-xs font-bold text-accent ">RSVP’d</Text>
//                     </View>
//                 </View>
//                 <Text className="text-sm text-muted" numberOfLines={1}>
//                     {eventDate} · {startTime} · {location}
//                 </Text>
//             </View>
//
//             {/* bottom: 2 buttons side by side */}
//             <View className="flex-row gap-3">
//                 <TouchableOpacity onPress={() => {
//                     isClick(true);
//                     viewEventIDNow(eventID);
//                 }} className="flex-1 items-center rounded-full border border-control py-2.5">
//
//                     <Text className="font-bold text-baseFont">View</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => {
//                     unattendEvent(eventID);
//                 }} className="flex-1 items-center rounded-full  bg-accent py-2.5">
//
//                     <Text className="font-bold text-baseFont"> Cancel RSVP</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };
//
// export default function Attending() {
//     const {state, filterRSVPEventList} = useEventContext();
//     const [isViewable, setViewable] = useState(false);
//     const [eventID, setEventID] = useState<number>(0);
//     const [filterDirection, setFilterDirection] = useState<filterBy>("None");
//
//     // Reset to defaults every time this tab comes into focus
//     useFocusEffect(
//         useCallback(() => {
//             setViewable(false);
//             setEventID(0);
//             setFilterDirection("None");
//         }, [])
//     );
//
//     function currentID(id: number) {
//         setEventID(id);
//     }
//     function viewable(view: boolean) {
//         setViewable(view);
//     }
//     function goBack() {
//         setViewable(false);
//     }
//
//     const rsvpEvents = filterRSVPEventList(filterDirection);
//
//     return (
//         <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
//
//             { !isViewable ?
//                 (
//                     <View className="flex-1  p-2 bg-background  ">
//                         <AttendingHeader
//                             filterDirection={filterDirection}
//                             onToggleDirection={() => setFilterDirection(prev => nextDirection(prev))}
//                         />
//
//                         <ScrollView className="mt-6 flex-1" contentContainerClassName="gap-3 pb-10">
//                             {rsvpEvents.map(event=>(
//                                 <AttendingEventRow
//                                     key={event.eventId}
//                                     title={event.title}
//                                     eventDate={event.eventDate}
//                                     startTime={event.startTime}
//                                     location={event.location}
//                                     isClick={viewable}
//                                     viewEventIDNow={currentID}
//                                     eventID={event.eventId}
//                                 />
//                             ))}
//                         </ScrollView>
//
//                     </View>
//                 )
//                 :
//                 (
//                     <EventDetail
//                         eventStore={state}
//                         eventID={eventID}
//                         goBack={goBack}/>
//                 )
//             }
//
//         </SafeAreaView>
//     );
// }

