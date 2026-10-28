import { Tabs } from "expo-router";
import {Navbar} from "@/app/component/navbar";


export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <Navbar {...props} />}
        >
            <Tabs.Screen name="Discover" />
            <Tabs.Screen name="Saved" />
            <Tabs.Screen name="Attending" />
            <Tabs.Screen name="Account" />
            <Tabs.Screen name="index" options={{ href: null }} />
        </Tabs>
    );
}