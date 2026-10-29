import { Tabs } from "expo-router";
//import { Navbar } from '@components/Navbar';
import "../global.css"
import { useTheme } from '@/hooks/use-theme';
import {StatusBar} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
//import {AppThemeProvider} from "@constants/app-theme-provider";
//import { Navbar } from '@/components/Navbar';                 // was '@components/Navbar'
import { AppThemeProvider } from '@/constants/app-theme-provider';
import {Navbar} from "@/component/Navbar";  // was '@constants/...'


// import '../global.css';
// import { Tabs } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Navbar } from '@/components/navbar';
// import { AppThemeProvider } from '@/theme/app-theme-provider';


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
        <SafeAreaProvider>
            <AppThemeProvider>
                <ThemedTabs />
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