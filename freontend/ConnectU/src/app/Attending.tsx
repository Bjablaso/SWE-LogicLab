import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Attending() {
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <Text style={styles.text}>Attending</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    text: { fontSize: 18, fontWeight: "700" },
});