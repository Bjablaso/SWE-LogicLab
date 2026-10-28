import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Attending() {
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <Text>Attending</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, borderWidth: 3, borderColor: "green" },
});