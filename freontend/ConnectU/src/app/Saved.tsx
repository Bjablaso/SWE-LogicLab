import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import  {useTheme} from "@/hooks/use-theme";
import {useEventContext} from "@/context/useEventContext";
import {useCallback, useEffect, useState} from "react";
import bold from "expo-symbols/androidWeights/bold";
import EventDetail from "@/component/EventDetail";
import {useFocusEffect} from "expo-router";

interface SavedEventRowProp{
    title: string;
    eventDate: string;
    startTime: string;
    location: string;
    isClick: (clicked: boolean)=>void;
    viewEventIDNow: (id: number)=>void;
    eventID: number;
}

const SavedEventRow = ({title, eventDate, startTime, location,
                           isClick, viewEventIDNow, eventID}: SavedEventRowProp) => {
    const {colors} = useTheme();
    const eventid = eventID
    const {state, attendEvent} = useEventContext()
    const currentEvent = state.events.find(event => event.eventId === eventid)
    function clikacble(){
        isClick(true)
    }


    return (
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            {/* top: 2 rows */}
            <View className="gap-1">
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 text-base font-bold text-baseFont" numberOfLines={1}>
                        {title}
                    </Text>
                    <View className="rounded-full bg-accent/30 px-3 py-1"
                    style={{
                        backgroundColor: `${colors?.accent}20`,
                    }}>
                        <Text className="text-xs font-bold text-accent ">RSVP’d</Text>
                    </View>
                </View>
                <Text className="text-sm text-muted" numberOfLines={1}>
                    {eventDate} · {startTime} · {location}
                </Text>
            </View>

            {/* bottom: 2 buttons side by side */}
            <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => {
                    clikacble();
                    viewEventIDNow(eventid);
                }} className="flex-1 items-center rounded-full border border-control py-2.5">

                    <Text className="font-bold text-baseFont">View</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                   attendEvent(eventid);
                }} className="flex-1 items-center rounded-full  bg-accent py-2.5">

                    <Text className="font-bold text-baseFont"> RSVP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default function Saved() {
    const {state} = useEventContext();
    const [isViewable, setViewable] = useState(false);
    const [eventID, setEventID] = useState<number>(0);

    const defult = {
        isViewable: false,
        eventID: 0
    }
    useFocusEffect(
        useCallback(() => {
            setViewable(defult.isViewable);
            setEventID(defult.eventID)
        }, [])
    );

    function viewDetials(view: boolean) {
        setViewable(view);
    }
    function viewDetialID(num: number) {
       setEventID(num);
    }

    function goBack() {
        setViewable(false);
    }


    const savedEvent = state.events.filter(event => event.isSaved && !event.isRsvpd);
    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
            {
                !isViewable ? (
                    <View className="flex-1  p-2 bg-background  ">
                    {/* title */}
                    <Text className="text-3xl font-extrabold text-baseFont">Saved events</Text>

                    {/* sort */}
                    <Text className="mt-5 text-xs font-bold text-muted">Sort by</Text>
                    <View className="mt-2 flex-row gap-3">
                        <TouchableOpacity onPress={() => {}} className="flex-1 flex-row items-center justify-between rounded-xl border border-control px-4 py-3">
                            <Text className="text-baseFont">Event date</Text>
                            <Feather name="chevron-down" size={18} color="#9E9A90" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {}} className="flex-row items-center gap-1 rounded-xl border border-control px-4 py-3">
                            <Text className="font-bold text-baseFont">Ascending</Text>
                            <Feather name="arrow-up" size={16} color="#9E9A90" />
                        </TouchableOpacity>
                    </View>

                    {/* only the list scrolls */}
                    <ScrollView className="mt-6 flex-1" contentContainerClassName="gap-3 pb-10">
                        {savedEvent.map(event => (
                            <SavedEventRow
                                key={event.eventId}
                                title={event.title}
                                eventDate={event.eventDate}
                                startTime={event.startTime}
                                location={event.location}
                                isClick={viewDetials}
                                viewEventIDNow={viewDetialID}
                                eventID={event.eventId}
                            />
                        ))}
                    </ScrollView>
                </View>) :
                    (
                        <EventDetail
                            eventStore={state}
                            eventID={eventID}
                            goBack={goBack}/>
                    )
            }


        </SafeAreaView>
    );
}