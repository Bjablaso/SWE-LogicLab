import {Text, StyleSheet, View, TextInput} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import {cssInterop} from "nativewind";

import {TitleCard} from "@/component/TitleCard";
import {EventCard} from "@/component/EventCard";
import EventDetail from "@/component/EventDetail";
import {EventListView} from "@/component/EventListView";
import {useEventContext} from "@/context/useEventContext";
import {useCallback, useState} from "react";
import {useFocusEffect} from "expo-router";




cssInterop(Feather, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

interface BottomContainerState {
    eventID: number;
    isClick: boolean;
}

const BottomContainer = () =>{
    const defaultDetailState: BottomContainerState = {
        eventID: 0,
        isClick: false
    };
    const [seeDetails, setDetails] = useState<BottomContainerState>({
        eventID: 0,
        isClick: false
    });
    const {state} = useEventContext()

    useFocusEffect(
        useCallback(() => {
            setDetails(defaultDetailState);
        }, [])
    );
    function detailScreenRequest(
        isClick: boolean,
        eventID: number
    ) {
        setDetails({
            isClick,
            eventID
        });
    }

    function goBack() {
        setDetails(prev => ({
            ...prev,
            isClick: false
        }));
    }
    return (
        <View
            className="flex-1 pt-2 px-4 ">
            {!seeDetails.isClick && (
                <EventListView
                    eventState={state}
                    isLoadDetailScreen={detailScreenRequest}
                />
            )}

            {seeDetails.isClick && (
                <EventDetail
                    eventStore={state}
                    eventID={seeDetails.eventID}
                    goBack={goBack}
                />
            )}


        </View>
    )
}

export default function Discover() {

    return (
        <SafeAreaView edges={["top"]}
                      className="flex-1 flex-col "
        >
            <BottomContainer/>

        </SafeAreaView>
    );
}
//