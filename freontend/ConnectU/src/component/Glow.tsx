import {ReactNode, useState} from "react";
import {Platform, Pressable, StyleProp, View, ViewStyle} from "react-native";
import {useTheme} from "@/hooks/use-theme";

type GlowMode = "hover" | "always" | "off";

interface GlowProps {
    children: ReactNode;
    mode?: GlowMode;          // "hover" (default, web) | "always" | "off"
    ring?: boolean;           // yellow ring drawn over the child's edge (default true)
    ringWidth?: number;       // default 2
    color?: string;           // defaults to the theme accent (yellow)
    radius?: number;          // match the child's corners (999 = circle/pill)
    intensity?: number;       // 0–1, glow strength (default 0.45)
    spread?: number;          // glow reach in px (default 18)
    onPress?: () => void;     // optional: make the whole wrapper clickable
    style?: StyleProp<ViewStyle>;
}

/**
 * Adds a yellow ring + glow to any component WITHOUT changing its size or spacing.
 * The ring is an overlay on the child's edge; the glow is a shadow (neither takes layout space).
 *
 *   <Glow radius={999}><MenuButton/></Glow>
 *   <Glow mode="always" radius={24}><Card/></Glow>
 */
export function Glow({
                         children,
                         mode = "hover",
                         ring = true,
                         ringWidth = 2,
                         color,
                         radius = 16,
                         intensity = 0.45,
                         spread = 18,
                         onPress,
                         style,
                     }: GlowProps) {
    const {colors} = useTheme();
    const [hovered, setHovered] = useState(false);

    const glowColor = color ?? colors.accent;
    const lit = mode === "always" || (mode === "hover" && hovered);
    const fade = Platform.OS === "web"
        ? ({transitionProperty: "border-color, box-shadow, opacity", transitionDuration: "150ms"} as any)
        : null;

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => setHovered(true)}       // web only; ignored on mobile
            onHoverOut={() => setHovered(false)}
            accessible={!!onPress}
            style={[{alignSelf: "flex-start", borderRadius: radius}, style]}
        >
            {children}

            {/* Ring + glow overlay: sits on the child's edge, takes no space, ignores touches */}
            <View
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: radius,
                        borderWidth: ring ? ringWidth : 0,
                        borderColor: lit ? glowColor : "transparent",
                        pointerEvents: "none",
                    },
                    lit && {
                        shadowColor: glowColor,
                        shadowOpacity: intensity,
                        shadowRadius: spread,
                        shadowOffset: {width: 0, height: 0},
                    },
                    fade,
                ]}
            />
        </Pressable>
    );
}