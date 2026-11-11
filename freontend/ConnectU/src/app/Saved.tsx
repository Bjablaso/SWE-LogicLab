import {View, Text, TouchableOpacity, ScrollView, useWindowDimensions} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from "@expo/vector-icons";
import {useTheme} from "@/hooks/use-theme";
import {useEventContext} from "@/context/useEventContext";
import {useCallback, useState} from "react";
import EventDetail from "@/component/EventDetail";
import {useFocusEffect} from "expo-router";
import {Event, filterBy} from "@/insterface/eventInterface";
import colors from "tailwindcss/colors";

const WIDE_BREAKPOINT = 768;   // at or above this width, buttons sit on the right

// "2026-10-14" + "11:00" → "Wed, Oct 14, 2026 · 11:00 AM"
function formatWhen(eventDate: string, startTime: string): string {
    const [y, m, d] = eventDate.split("-").map(Number);
    const [hh, mm] = startTime.split(":").map(Number);
    const date = new Date(y, m - 1, d, hh, mm);      // local time, no UTC shift

    const day = date.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
    const time = date.toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"});
    return `${day} · ${time}`;
}


// ---------------------------------------------------------------- one saved event

interface SavedEventRowProps {
    event: Event;
    wide: boolean;
    onView: (eventId: number) => void;
}

const SavedEventRow = ({event, wide, onView}: SavedEventRowProps) => {
    const {colors} = useTheme();
    const {attendEvent, unsaveEvent} = useEventContext();

    const buttons = (
        <View className={`flex-row gap-3 ${wide ? "" : "mt-4"}`}>
            <TouchableOpacity
                onPress={() => onView(event.eventId)}
                className={`items-center justify-center rounded-full border border-control px-6 py-3 ${wide ? "" : "flex-1"}`}
            >
                <Text className="font-bold text-baseFont">View</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => attendEvent(event.eventId)}
                className={`items-center justify-center rounded-full bg-accent px-6 py-3 ${wide ? "" : "flex-1"}`}
                style={{
                    shadowColor: colors.accent,
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    shadowOffset: {width: 0, height: 4},
                }}
            >
                <Text className="font-bold" style={{color: colors.onAccent}}>RSVP</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => unsaveEvent(event.eventId)}
                accessibilityLabel={`Remove ${event.title} from saved`}
                className={`items-center justify-center rounded-full px-6 py-3 ${wide ? "" : "flex-1"}`}
                style={{backgroundColor: "#E5484D"}}
            >
                <Text className="font-bold" style={{color: "#FFFFFF"}}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View
            className={`rounded-3xl border border-border bg-surface px-6 py-5 ${
                wide ? "flex-row items-center justify-between gap-6" : ""
            }`}
        >
            {/* left: title + when · where */}
            <View className={wide ? "flex-1" : ""}>
                <Text className="text-lg font-bold text-baseFont" numberOfLines={1}>
                    {event.title}
                </Text>
                <Text className="mt-1 text-sm text-muted" numberOfLines={wide ? 1 : 2}>
                    {formatWhen(event.eventDate, event.startTime)} · {event.location}
                </Text>
            </View>

            {/* right (web) or below (mobile): actions */}
            {buttons}
        </View>
    );
};


// ---------------------------------------------------------------- sort helpers

function directionLabel(dir: filterBy): string {
    switch (dir) {
        case "Ascending":  return "Ascending";
        case "Descending": return "Descending";
        case "None":       return "Ascending";
    }
}

function directionIcon(dir: filterBy): "arrow-up" | "arrow-down" | "minus" {
    switch (dir) {
        case "Ascending":  return "arrow-up";
        case "Descending": return "arrow-down";
        case "None":       return "arrow-up";
    }
}

function nextDirection(current: filterBy): filterBy {
    switch (current) {
        case "None":       return "Descending";   // first click
        case "Descending": return "Ascending";    // second click
        case "Ascending":  return "Descending";   // keeps switching
    }
}


// ---------------------------------------------------------------- screen

export default function Saved() {
    const {state, filterSavedEventList, refreshMyEvents, actionError, clearActionError} = useEventContext();
    const {width} = useWindowDimensions();
    const wide = width >= WIDE_BREAKPOINT;

    const [isViewable, setViewable] = useState(false);
    const [eventID, setEventID] = useState<number>(0);
    const [filterDirection, setFilterDirection] = useState<filterBy>("None");

    const savedEvent = filterSavedEventList(filterDirection);

    useFocusEffect(
        useCallback(() => {
            setViewable(false);
            setEventID(0);
            refreshMyEvents();
        }, [])
    );

    function openDetails(id: number) {
        setEventID(id);
        setViewable(true);
    }

    function goBack() {
        setViewable(false);
    }

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
            {!isViewable ? (
                <View className="flex-1 p-2 bg-background">
                    {/* title */}
                    <Text className="text-3xl font-extrabold text-baseFont">Saved events</Text>

                    {/* sort */}
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
                            onPress={() => setFilterDirection(prev => nextDirection(prev))}
                            className="flex-row items-center gap-1 rounded-xl border border-control px-4 py-3"
                        >
                            <Text className="font-bold text-baseFont">
                                {directionLabel(filterDirection)}
                            </Text>
                            <Feather name={directionIcon(filterDirection)} size={16} color="#9E9A90"/>
                        </TouchableOpacity>
                    </View>

                    {/* only the list scrolls */}
                    <ScrollView className="mt-6 flex-1" contentContainerClassName="gap-4 pb-10">
                        {savedEvent.length === 0 ? (
                            <View className="items-center pt-10 gap-2">
                                <Feather name="heart" size={28} color="#9E9A90"/>
                                <Text className="text-base font-bold text-baseFont">No saved events</Text>
                                <Text className="text-sm text-muted">
                                    Tap the heart on an event to save it for later.
                                </Text>
                            </View>
                        ) : (
                            savedEvent.map(event => (
                                <SavedEventRow
                                    key={event.eventId}
                                    event={event}
                                    wide={wide}
                                    onView={openDetails}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>
            ) : (
                <EventDetail
                    eventStore={state}
                    eventID={eventID}
                    goBack={goBack}
                />
            )}
            {actionError && (
                <TouchableOpacity
                    onPress={clearActionError}
                    className="mt-4 flex-row items-center justify-between rounded-2xl bg-warningBg px-4 py-3"
                >
                    <Text className="flex-1 font-sans text-body text-warningText">{actionError}</Text>
                    {/*<Feather name="x" size={16} color={colors.red}/>*/}
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

// import { View, Text, TouchableOpacity, ScrollView } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Feather } from "@expo/vector-icons";
// import  {useTheme} from "@/hooks/use-theme";
// import {useEventContext} from "@/context/useEventContext";
// import {useCallback, useEffect, useState} from "react";
// import bold from "expo-symbols/androidWeights/bold";
// import EventDetail from "@/component/EventDetail";
// import {useFocusEffect} from "expo-router";
// import {filterBy} from "@/insterface/eventInterface";
//
//
// interface SavedEventRowProp{
//     title: string;
//     eventDate: string;
//     startTime: string;
//     location: string;
//     isClick: (clicked: boolean)=>void;
//     viewEventIDNow: (id: number)=>void;
//     eventID: number;
//    // filter: filterSaved;
// }
//
// const SavedEventRow = ({title, eventDate, startTime, location,
//                            isClick, viewEventIDNow, eventID}: SavedEventRowProp) => {
//     const {colors} = useTheme();
//     const eventid = eventID
//     const {state, attendEvent} = useEventContext()
//     const currentEvent = state.events.find(event => event.eventId === eventid)
//     function clikacble(){
//         isClick(true)
//     }
//
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
//                     style={{
//                         backgroundColor: `${colors?.accent}20`,
//                     }}>
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
//                     clikacble();
//                     viewEventIDNow(eventid);
//                 }} className="flex-1 items-center rounded-full border border-control py-2.5">
//
//                     <Text className="font-bold text-baseFont">View</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => {
//                    attendEvent(eventid);
//                 }} className="flex-1 items-center rounded-full  bg-accent py-2.5">
//
//                     <Text className="font-bold text-baseFont"> RSVP</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };
//
//
// export default function Saved() {
//     const {state, filterSavedEventList, filterRSVPEventList, sevedEventList} = useEventContext();
//     const [isViewable, setViewable] = useState(false);
//     const [eventID, setEventID] = useState<number>(0);
//     const [filterDirection, setFilterDirection] = useState<filterBy>("None");
//     //onst [filterAsceding, setFilterAsceding] = useState<boolean>(false);
//
//     const savedEvent = filterSavedEventList(filterDirection)
//
//     //const savedEvent = state.events.filter(event => event.isSaved && !event.isRsvpd);
//
//
//
//     const defult = {
//         isViewable: false,
//         eventID: 0
//     }
//
//     // const defualt ={
//     //     noFilter: state.events.filter(event => event.isSaved && !event.isRsvpd)
//     // }
//     //
//
//     useFocusEffect(
//         useCallback(() => {
//             setViewable(defult.isViewable);
//             setEventID(defult.eventID)
//         }, [])
//     );
//
//     function viewDetials(view: boolean) {
//         setViewable(view);
//     }
//     function viewDetialID(num: number) {
//        setEventID(num);
//     }
//
//     function goBack() {
//         setViewable(false);
//     }
//
//
//     function directionLabel(dir: filterBy): string {
//         switch (dir) {
//             case "Ascending":  return "Ascending";
//             case "Descending": return "Descending";
//             case "None":       return "Ascending";
//         }
//     }
//
//     function directionIcon(dir: filterBy): "arrow-up" | "arrow-down" | "minus" {
//         switch (dir) {
//             case "Ascending":  return "arrow-up";
//             case "Descending": return "arrow-down";
//             case "None":       return "arrow-up";
//         }
//     }
//      function nextDirection(current: filterBy): filterBy {
//         switch (current) {
//             case "None":       return "Descending";   // first click
//             case "Descending": return "Ascending";    // second click
//             case "Ascending":  return "Descending";   // keeps switching
//         }
//     }
//
//     return (
//         <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
//             {
//                 !isViewable ? (
//                     <View className="flex-1  p-2 bg-background  ">
//                     {/* title */}
//                     <Text className="text-3xl font-extrabold text-baseFont">Saved events</Text>
//
//                     {/* sort */}
//                     <Text className="mt-5 text-xs font-bold text-muted">Sort by</Text>
//                     <View className="mt-2 flex-row gap-3">
//                         <TouchableOpacity onPress={() => {}} className="flex-1 flex-row items-center justify-between rounded-xl border border-control px-4 py-3">
//                             <Text className="text-baseFont">Event date</Text>
//                             <Feather name="chevron-down" size={18} color="#9E9A90" />
//                         </TouchableOpacity>
//
//                         <TouchableOpacity
//                             onPress={() => setFilterDirection(prev => nextDirection(prev))}
//                             className="flex-row items-center gap-1 rounded-xl border border-control px-4 py-3"
//                         >
//                             <Text className="font-bold text-baseFont">
//                                 {directionLabel(filterDirection)}
//                             </Text>
//                             <Feather
//                                 name={directionIcon(filterDirection)}
//                                 size={16}
//                                 color="#9E9A90"
//                             />
//                         </TouchableOpacity>
//
//
//                     </View>
//
//                     {/* only the list scrolls */}
//                     <ScrollView className="mt-6 flex-1" contentContainerClassName="gap-3 pb-10">
//                         {savedEvent.map(event => (
//                             <SavedEventRow
//                                 key={event.eventId}
//                                 title={event.title}
//                                 eventDate={event.eventDate}
//                                 startTime={event.startTime}
//                                 location={event.location}
//                                 isClick={viewDetials}
//                                 viewEventIDNow={viewDetialID}
//                                 eventID={event.eventId}
//                             />
//                         ))}
//                     </ScrollView>
//                 </View>) :
//                     (
//                         <EventDetail
//                             eventStore={state}
//                             eventID={eventID}
//                             goBack={goBack}/>
//                     )
//             }
//
//         </SafeAreaView>
//     );
// }