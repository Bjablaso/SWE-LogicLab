import { useContext } from 'react';
import { AppThemeContext } from '@/hooks/app-theme-context';

export function useTheme() {
    const theme = useContext(AppThemeContext);
    if (!theme) throw new Error('useTheme must be used inside <AppThemeProvider>');
    return theme;   // { isDark, colors, setScheme }
}