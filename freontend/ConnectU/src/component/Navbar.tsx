import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname, type Href } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from '@/hooks/use-theme';

//import { cssInterop } from 'nativewind';

type Tab = {
    href: string;
    label: string;
    icon: (color: string) => ReactNode;
};

// cssInterop(AntDesign, {
//     className: { target: 'style', nativeStyleToProp: { fontSize: 'size', color: true } },
// });
// href must match your file names exactly (capital letters)
const TABS: Tab[] = [
    {
        href: "/Discover",
        label: "Discover",
        icon: (c) => <AntDesign name="compass" size={24} color={c} />,
    },
    {
        href: "/Saved",
        label: "Saved",
        icon: (c) => <MaterialIcons name="bookmark-outline" size={24} color={c} />,
    },
    {
        href: "/Attending",
        label: "Attending",
        icon: (c) => <FontAwesome6 name="calendar-check" size={22} color={c} />,
    },
    {
        href: "/Account",
        label: "Account",
        icon: (c) => <Ionicons name="person-outline" size={24} color={c} />,
    },
];
// interface NavbarProps {
//     backgroundColor: string;
//     fontBaseColor: string;
//
// }

export function Navbar() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useTheme();
    const fontColor = colors.baseFont
    // OK: this is inside the provider



    return (
        <View
            style={[
                styles.bar,
                { height: 74 + insets.bottom, paddingBottom: insets.bottom,
                backgroundColor: colors.background},

            ]}
        >
            {TABS.map((tab) => {
                const focused = pathname.toLowerCase() === tab.href.toLowerCase();

                //const color = focused ? "#000" : "#999";
                const color = focused
                    ? colors.baseFont
                    : colors.baseGray100;




                // @ts-ignore
                return (
                    <Pressable
                        key={tab.href}
                        style={styles.item}
                        onPress={() => {
                            if (!focused) router.navigate(tab.href as Href);
                        }}
                        accessibilityRole="button"
                        accessibilityState={focused ? { selected: true } : {}}
                        accessibilityLabel={tab.label}
                    >
                        {tab.icon(color)}
                        <Text style={[styles.label, { color }]}>{tab.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        //color: colors.baseFont
      //  borderTopWidth: 1,
       // borderColor: "#ddd",
       // backgroundColor: "green",
    },
    item: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    label: { fontSize: 12 },

});