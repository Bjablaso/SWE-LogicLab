import {createContext} from "react";
import type {ThemeColors} from "@constants/theme";

export type Scheme = 'light' | 'dark' | 'system';
type AppTheme = { isDark: boolean; colors: ThemeColors; setScheme: (s: Scheme) => void };
export const AppThemeContext = createContext<AppTheme | null>(null);