import { Tabs } from "expo-router";
//import { Navbar } from '@components/Navbar';
import "../global.css"
import { useTheme } from '@/hooks/use-theme';

import {SafeAreaProvider} from "react-native-safe-area-context";

import { AppThemeProvider } from '@/constants/app-theme-provider';
import {Navbar} from "@/component/Navbar";
import {EventContextProvider} from "@/context/EventContextProvider"
import EventDetailScreen from "@/component/EventDetail";  // was '@constants/...'



function ThemedTabs() {
    const { colors } = useTheme();   // OK: this is inside the provider


    return (
        <>
           {/*// <StatusBar style={isDark ? 'light' : 'dark'} />*/}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    sceneStyle: { backgroundColor: colors.background
                    },

                }}
                tabBar={(props) => <Navbar
                    {...props}
                   // backgroundColor={colors.background}
                    //fontBaseColor={colors.baseFont}
                />}
            >

                <Tabs.Screen name="Discover" />
                <Tabs.Screen name="Saved" />
                <Tabs.Screen name="Attending" />
                <Tabs.Screen name="Account" />
                <Tabs.Screen name="index" options={{ href: null }} />
            </Tabs>
        </>
    );
}

export default function RootLayout() {
    // no useTheme() here: the provider below hasn't rendered yet
    return (
        <SafeAreaProvider className="p-3">
            <AppThemeProvider>
                <EventContextProvider>
                    <ThemedTabs />
                </EventContextProvider>
            </AppThemeProvider>
        </SafeAreaProvider>
    );
}

// <Tabs
//     screenOptions={{ headerShown: false }}
//     tabBar={(props) => <Navbar {...props} />}
// >
//     <Tabs.Screen name="Discover" />
//     <Tabs.Screen name="Saved" />
//     <Tabs.Screen name="Attending" />
//     <Tabs.Screen name="Account" />
//     <Tabs.Screen name="index" options={{ href: null }} />
// </Tabs>