import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import  {useTheme} from "@/hooks/use-theme";


const SavedEventRow = () => {
    const {colors} = useTheme();

    return (
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
            {/* top: 2 rows */}
            <View className="gap-1">
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 text-base font-bold text-baseFont" numberOfLines={1}>
                        Tiger Tuesday @ Nite – Trivia
                    </Text>
                    <View className="rounded-full bg-accent/30 px-3 py-1"
                    style={{
                        backgroundColor: `${colors?.accent}20`,
                    }}>
                        <Text className="text-xs font-bold text-accent ">RSVP’d</Text>
                    </View>
                </View>
                <Text className="text-sm text-muted" numberOfLines={1}>
                    Tue, Oct 20, 2026 · 7:00 PM · University Union, PAWS
                </Text>
            </View>

            {/* bottom: 2 buttons side by side */}
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
export default function Saved() {
    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background px-4 pt-4">
            {/* title */}
            <Text className="text-3xl font-extrabold text-baseFont">Saved events</Text>

            {/* tabs */}
            {/*<View className="mt-4 flex-row gap-3">*/}
            {/*    <TouchableOpacity onPress={() => {}} className="flex-1 items-center rounded-full border border-control bg-surface py-3">*/}
            {/*        <Text className="font-bold text-baseFont">Saved</Text>*/}
            {/*    </TouchableOpacity>*/}
            {/*    <TouchableOpacity onPress={() => {}} className="flex-1 items-center rounded-full bg-accent py-3">*/}
            {/*        <Text className="font-bold text-black">RSVP’d</Text>*/}
            {/*    </TouchableOpacity>*/}
            {/*</View>*/}

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
                <SavedEventRow />
                <SavedEventRow />
                <SavedEventRow />
            </ScrollView>
        </SafeAreaView>
    );
}