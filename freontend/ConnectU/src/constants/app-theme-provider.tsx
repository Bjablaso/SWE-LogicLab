import { createContext, useMemo, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { palette, type ThemeColors } from '@/constants/theme';
import {Scheme, AppThemeContext} from '@/hooks/app-theme-context'

// type Scheme = 'light' | 'dark' | 'system';
// type AppTheme = { isDark: boolean; colors: ThemeColors; setScheme: (s: Scheme) => void };
//
// export const AppThemeContext = createContext<AppTheme | null>(null);

// Manual override. 'system' hands control back to the phone.
// Recent React Native versions use 'unspecified' for this; older ones use null.
const setScheme = (s: Scheme) =>
    Appearance.setColorScheme(s === 'system' ? 'unspecified' : s);

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const scheme = useColorScheme();   // the phone's setting; re-renders when the user switches
    const isDark = scheme === 'dark';

    const value = useMemo(
        () => ({ isDark, colors: isDark ? palette.dark : palette.light, setScheme }),
        [isDark],
    );

    return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}