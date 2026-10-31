import { vars } from "nativewind";
import { palette } from "@constants/theme";

/**
 * NativeWind bridge
 *
 * theme.ts (palette)
 *       ↓
 * NativeWind vars()
 *       ↓
 * CSS/NativeWind variables
 */

// LIGHT THEME
export const lightNativeWindTheme = vars({
    "--color-background": palette.light.background,
    "--color-surface": palette.light.surface,
    "--color-surfaceShadow": palette.light.surfaceShadow,
    "--color-input": palette.light.input,
    "--color-nav": palette.light.nav,
    "--color-searchBarBg": palette.light.searchBarBg,

    "--color-border": palette.light.border,
    "--color-control": palette.light.control,
    "--color-outline": palette.light.outline,

    "--color-foreground": palette.light.foreground,
    "--color-muted": palette.light.muted,
    "--color-subtle": palette.light.subtle,
    "--color-placeholder": palette.light.placeholder,
    "--color-disabled": palette.light.disabled,

    "--color-accent": palette.light.accent,
    "--color-accentHover": palette.light.accentHover,
    "--color-link": palette.light.link,
    "--color-onAccent": palette.light.onAccent,

    "--color-warningBg": palette.light.warningBg,
    "--color-warningBorder": palette.light.warningBorder,
    "--color-warningText": palette.light.warningText,

    "--color-baseFont": palette.light.baseFont,

    "--color-baseGray100": palette.light.baseGray100,
    "--color-baseGray200": palette.light.baseGray200,
    "--color-baseGray300": palette.light.baseGray300,
    "--color-baseGray400": palette.light.baseGray400,
    "--color-baseGray500": palette.light.baseGray500,
    "--color-baseGray600": palette.light.baseGray600,
});


// DARK THEME
export const darkNativeWindTheme = vars({
    "--color-background": palette.dark.background,
    "--color-surface": palette.dark.surface,
    "--color-surfaceShadow": palette.dark.surfaceShadow,
    "--color-input": palette.dark.input,
    "--color-nav": palette.dark.nav,
    "--color-searchBarBg": palette.dark.searchBarBg,

    "--color-border": palette.dark.border,
    "--color-control": palette.dark.control,
    "--color-outline": palette.dark.outline,

    "--color-foreground": palette.dark.foreground,
    "--color-muted": palette.dark.muted,
    "--color-subtle": palette.dark.subtle,
    "--color-placeholder": palette.dark.placeholder,
    "--color-disabled": palette.dark.disabled,

    "--color-accent": palette.dark.accent,
    "--color-accentHover": palette.dark.accentHover,
    "--color-link": palette.dark.link,
    "--color-onAccent": palette.dark.onAccent,

    "--color-warningBg": palette.dark.warningBg,
    "--color-warningBorder": palette.dark.warningBorder,
    "--color-warningText": palette.dark.warningText,

    "--color-baseFont": palette.dark.baseFont,

    "--color-baseGray100": palette.dark.baseGray100,
    "--color-baseGray200": palette.dark.baseGray200,
    "--color-baseGray300": palette.dark.baseGray300,
    "--color-baseGray400": palette.dark.baseGray400,
    "--color-baseGray500": palette.dark.baseGray500,
    "--color-baseGray600": palette.dark.baseGray600,
});