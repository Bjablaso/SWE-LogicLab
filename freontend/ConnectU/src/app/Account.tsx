import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Account() {
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <Text>Account</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, borderWidth: 3, borderColor: "green" },
});