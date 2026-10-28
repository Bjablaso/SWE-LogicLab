import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Saved() {
    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <Text style={styles.text}>Saved</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
       // backgroundColor: "#fff",
        //borderWidth: 1,
        //borderColor: "#000",
    },
    text: { fontSize: 18, fontWeight: "700" },
});