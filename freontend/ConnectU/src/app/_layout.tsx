import "../global.css"   // ← NativeWind/Tailwind: must be imported once at the root. Adjust the path to where global.css lives.

import {useEffect, useRef, useState} from "react";
import {Animated, Platform, Pressable, View} from "react-native";
import {Tabs} from "expo-router";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Feather} from "@expo/vector-icons";

import {Navbar} from "@/component/Navbar";
import {WEB_NAV_WIDTH, WebSideNav} from "@/component/WebSideNav";
import {AppThemeProvider} from "@constants/app-theme-provider";
import {EventContextProvider} from "@/context/EventContextProvider";
import {useTheme} from "@/hooks/use-theme";
import {Easing} from "react-native-reanimated";


function WebDrawerOverlay({
                              open,
                              onRequestClose,
                              navProps,
                          }: {
    open: boolean;
    onRequestClose: () => void;
    navProps: Omit<React.ComponentProps<typeof WebSideNav>, "pinned">;
}) {
    const [mounted, setMounted] = useState(open);           // stays true until the close animation ends
    const progress = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = fully open

    useEffect(() => {
        if (open) {
            setMounted(true);
            Animated.timing(progress, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,          // web has no native driver
            }).start();
        } else {
            Animated.timing(progress, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: false,
            }).start(({finished}) => {
                if (finished) setMounted(false); // unmount only after sliding out
            });
        }
    }, [open, progress]);

    if (!mounted) return null;

    // -280 (off-screen left) → 0 (in place)
    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-WEB_NAV_WIDTH, 0],
    });

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                pointerEvents: open ? "auto" : "none",   // no clicks during slide-out
            }}
        >
            {/* Backdrop fades in */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    opacity: progress,
                }}
            >
                <Pressable
                    style={{flex: 1}}
                    onPress={onRequestClose}
                    accessibilityLabel="Close navigation"
                />
            </Animated.View>

            {/* Drawer slides in from the left */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    transform: [{translateX}],
                }}
            >
                <WebSideNav pinned={false} {...navProps}/>
            </Animated.View>
        </View>
    );
}

function ThemedTabs() {
    const {colors, isDark, setScheme} = useTheme();
    const isWeb = Platform.OS === "web";

    const [navOpen, setNavOpen] = useState(false);       // web: drawer over the content
    const [navPinned, setNavPinned] = useState(false);   // web: drawer docked beside the content

    const tabs = (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: {backgroundColor: colors.background},
            }}
            // Web: no bottom bar (the side nav replaces it). Mobile: unchanged.
            tabBar={isWeb ? () => null : (props) => <Navbar {...props}/>}
        >
            <Tabs.Screen name="Discover"/>
            <Tabs.Screen name="Saved"/>
            <Tabs.Screen name="Attending"/>
            <Tabs.Screen name="Account"/>
            <Tabs.Screen name="index" options={{href: null}}/>
        </Tabs>
    );

    // Mobile: exactly as before
    if (!isWeb) return tabs;

    function togglePin() {
        setNavPinned(p => !p);
        setNavOpen(false);
    }

    function closeNav() {
        setNavOpen(false);
        setNavPinned(false);
    }

    const navProps = {
        onClose: closeNav,
        onTogglePin: togglePin,
        isDark,
        onToggleTheme: () => setScheme(isDark ? "light" : "dark"),   // pass the opposite mode
        onLogout: () => { /* TODO: auth */ },
    };

    const RAIL_WIDTH = 76;

    return (
        <View style={{flex: 1, flexDirection: "row", backgroundColor: colors.background}}>
            {/* Left side: full sidebar when pinned, otherwise a slim rail with the menu button */}
            {navPinned ? (
                <WebSideNav pinned {...navProps}/>
            ) : (
                <View
                    style={{
                        width: RAIL_WIDTH,
                        alignItems: "center",
                        paddingTop: 16,
                       // borderRightWidth: 1,
                       // borderRightColor: colors.border,
                    }}
                >
                    <Pressable
                        onPress={() => setNavOpen(true)}
                        accessibilityLabel="Open navigation"
                        style={(state: any) => ({
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: state.hovered ? colors.control : colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        })}
                    >
                        <Feather name="menu" size={20} color={colors.baseFont}/>
                    </Pressable>
                </View>
            )}

            {/* Content area: starts to the right of the rail / sidebar */}
            <View style={{flex: 1}}>
                {tabs}
            </View>

            {/* Overlay: drawer + dimmed backdrop over everything */}
            <WebDrawerOverlay
                open={navOpen && !navPinned}
                onRequestClose={() => setNavOpen(false)}
                navProps={navProps}
            />
        </View>
    );
}

export default function RootLayout() {
    // no useTheme() here: the provider below hasn't rendered yet
    return (
        <SafeAreaProvider style={{flex: 1}}>
            <AppThemeProvider>
                <EventContextProvider>
                    <ThemedTabs/>
                </EventContextProvider>
            </AppThemeProvider>
        </SafeAreaProvider>
    );
}

// import { Tabs } from "expo-router";
// //import { Navbar } from '@components/Navbar';
// import "../global.css"
// import { useTheme } from '@/hooks/use-theme';
//
// import {SafeAreaProvider} from "react-native-safe-area-context";
//
// import { AppThemeProvider } from '@/constants/app-theme-provider';
// import {Navbar} from "@/component/Navbar";
// import {EventContextProvider} from "@/context/EventContextProvider"
// import EventDetailScreen from "@/component/EventDetail";  // was '@constants/...'
//
//
//
// function ThemedTabs() {
//     const { colors } = useTheme();   // OK: this is inside the provider
//
//
//     return (
//         <>
//            {/*// <StatusBar style={isDark ? 'light' : 'dark'} />*/}
//             <Tabs
//                 screenOptions={{
//                     headerShown: false,
//                     sceneStyle: { backgroundColor: colors.background
//                     },
//
//                 }}
//                 tabBar={(props) => <Navbar
//                     {...props}
//                    // backgroundColor={colors.background}
//                     //fontBaseColor={colors.baseFont}
//                 />}
//             >
//
//                 <Tabs.Screen name="Discover" />
//                 <Tabs.Screen name="Saved" />
//                 <Tabs.Screen name="Attending" />
//                 <Tabs.Screen name="Account" />
//                 <Tabs.Screen name="index" options={{ href: null }} />
//             </Tabs>
//         </>
//     );
// }
//
// export default function RootLayout() {
//
//     // no useTheme() here: the provider below hasn't rendered yet
//     return (
//         <SafeAreaProvider className="p-3">
//             <AppThemeProvider>
//                 <EventContextProvider>
//                     <ThemedTabs />
//                 </EventContextProvider>
//             </AppThemeProvider>
//         </SafeAreaProvider>
//     );
// }
