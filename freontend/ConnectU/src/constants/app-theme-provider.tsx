import {useCallback, useMemo, useState, type ReactNode} from "react";
import {Appearance, Platform, useColorScheme, View} from "react-native";

import {palette} from "@/constants/theme";
import {lightNativeWindTheme, darkNativeWindTheme} from "@/constants/nativewind-theme";
import {Scheme, AppThemeContext} from "@/hooks/app-theme-context";

export function AppThemeProvider({children}: { children: ReactNode }) {
    const systemScheme = useColorScheme();                       // what the device/browser prefers
    const [override, setOverride] = useState<Scheme>("system");  // what the user picked

    // "system" follows the device; "light"/"dark" are the user's choice
    const isDark = override === "system" ? systemScheme === "dark" : override === "dark";

    const setScheme = useCallback((s: Scheme) => {
        setOverride(s);
        // Native also updates the OS-level appearance; web has no setColorScheme
        if (Platform.OS !== "web" && typeof Appearance.setColorScheme === "function") {
            Appearance.setColorScheme(s === "system" ? "unspecified" : s);
        }
    }, []);

    const colors = isDark ? palette.dark : palette.light;
    const nativeWindTheme = isDark ? darkNativeWindTheme : lightNativeWindTheme;

    const value = useMemo(
        () => ({isDark, colors, setScheme}),
        [isDark, colors, setScheme],
    );

    return (
        <AppThemeContext.Provider value={value}>
            <View style={[{flex: 1}, nativeWindTheme]}>
                {children}
            </View>
        </AppThemeContext.Provider>
    );
}


// import { useMemo, type ReactNode } from "react";
// import { Appearance, useColorScheme, View } from "react-native";
//
// import { palette } from "@/constants/theme";
// import {
//     lightNativeWindTheme,
//     darkNativeWindTheme,
// } from "@/constants/nativewind-theme";
//
// import {
//     Scheme,
//     AppThemeContext,
// } from "@/hooks/app-theme-context";
//
// const setScheme = (s: Scheme) =>
//     Appearance.setColorScheme(
//         s === "system" ? "unspecified" : s
//     );
//
// export function AppThemeProvider({
//                                      children,
//                                  }: {
//     children: ReactNode;
// }) {
//     const scheme = useColorScheme();
//     const isDark = scheme === "dark";
//
//     const colors = isDark
//         ? palette.dark
//         : palette.light;
//
//     const nativeWindTheme = isDark
//         ? darkNativeWindTheme
//         : lightNativeWindTheme;
//
//     const value = useMemo(
//         () => ({
//             isDark,
//             colors,
//             setScheme,
//         }),
//         [isDark, colors]
//     );
//
//     return (
//         <AppThemeContext.Provider value={value}>
//             <View
//                 style={[
//                     { flex: 1 },
//                     nativeWindTheme,
//                 ]}
//             >
//                 {children}
//             </View>
//         </AppThemeContext.Provider>
//     );
// }

// import { createContext, useMemo, type ReactNode } from 'react';
// import { Appearance, useColorScheme } from 'react-native';
//
// import { palette, type ThemeColors } from '@/constants/theme';
// import {Scheme, AppThemeContext} from '@/hooks/app-theme-context'
//
// // type Scheme = 'light' | 'dark' | 'system';
// // type AppTheme = { isDark: boolean; colors: ThemeColors; setScheme: (s: Scheme) => void };
// //
// // export const AppThemeContext = createContext<AppTheme | null>(null);
//
// // Manual override. 'system' hands control back to the phone.
// // Recent React Native versions use 'unspecified' for this; older ones use null.
// const setScheme = (s: Scheme) =>
//     Appearance.setColorScheme(s === 'system' ? 'unspecified' : s);
//
// export function AppThemeProvider({ children }: { children: ReactNode }) {
//     const scheme = useColorScheme();   // the phone's setting; re-renders when the user switches
//     const isDark = scheme === 'dark';
//
//     const value = useMemo(
//         () => ({ isDark, colors: isDark ? palette.dark : palette.light, setScheme }),
//         [isDark],
//     );
//
//     return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
// }