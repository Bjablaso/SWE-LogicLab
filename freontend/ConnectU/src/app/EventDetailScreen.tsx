import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function  () {
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <View className="flex-1 bg-background p-4 pt-16">
                <Text className="text-baseFont text-2xl" onPress={() => router.back()}>
                    ← Back
                </Text>
                <Text className="text-baseFont text-2xl">Event details</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "#fff",
    },
    text: { fontSize: 18, fontWeight: "700" },
});