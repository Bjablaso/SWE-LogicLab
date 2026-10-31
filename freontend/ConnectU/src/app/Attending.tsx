import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const AttendingHeader = () => {
    return (
        <View>
            <Text className="text-3xl font-extrabold text-baseFont">Attending</Text>
            <Text className="mt-1 text-sm text-muted">
                Upcoming events you RSVP’d to. Events drop off this list once they’re over.
            </Text>

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
        </View>
    );
};
const AttendingEventRow = () => {
    return (
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            {/* top: 2 rows */}
            <View className="gap-1">
                <Text className="text-base font-bold text-baseFont" numberOfLines={1}>
                    Tiger Tuesday @ Nite – Trivia
                </Text>
                <Text className="text-sm text-muted" numberOfLines={1}>
                    Tue, Oct 20, 2026 · 7:00 PM · University Union, PAWS
                </Text>
            </View>

            {/* bottom: 2 buttons */}
            <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => {}} className="flex-1 items-center rounded-full border border-control py-2.5">
                    <Text className="font-bold text-baseFont">View</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}} className="flex-1 items-center rounded-full border border-control py-2.5">
                    <Text className="font-bold text-baseFont">Cancel RSVP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default function Attending() {
    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
            <AttendingHeader />

            <ScrollView className="mt-6 flex-1" contentContainerClassName="gap-3 pb-10">
                <AttendingEventRow />
                <AttendingEventRow />
                <AttendingEventRow />
            </ScrollView>
        </SafeAreaView>
    );
}
// <SafeAreaView edges={["top"]} className="flex-1 bg-background">
//     <ScrollView contentContainerClassName="px-4 pt-4 pb-10">
//         <AttendingHeader />
//
//         <View className="mt-6 gap-3">
//             <AttendingEventRow />
//             <AttendingEventRow />
//             <AttendingEventRow />
//         </View>
//     </ScrollView>
// </SafeAreaView>