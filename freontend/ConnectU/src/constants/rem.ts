import {PixelRatio, Platform} from "react-native";

/**
 * Converts rem to the number that icon fonts need.
 * Web: uses the page's real root font size (follows browser zoom / font settings).
 * Mobile: uses 16 × the phone's text-size setting (follows accessibility settings).
 */
export function rem(value: number): number {
    if (Platform.OS === "web" && typeof document !== "undefined") {
        const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return value * root;
    }
    return value * 16 * PixelRatio.getFontScale();
}

/** Icon sizes in rem; matches the icon classes in global.css. */
export const ICON = {
    nav: 1.5,       // .icon-nav       (mobile tab bar)
    navWeb: 1.25,   // .icon-nav-web   (web side bar)
    inline: 1,      // .icon-inline    (beside text)
    button: 1.25,   // .icon-button    (inside a round button)
} as const;