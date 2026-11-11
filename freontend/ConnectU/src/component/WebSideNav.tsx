import {Pressable, StyleSheet, Text, View} from "react-native";
import {usePathname, useRouter} from "expo-router";
import {Feather} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useTheme} from "@/hooks/use-theme";

const NAV_ITEMS = ["Discover", "Saved", "Attending", "Account"] as const;
type NavItem = (typeof NAV_ITEMS)[number];

export const WEB_NAV_WIDTH = 280;

interface WebSideNavProps {
    pinned: boolean;
    onClose: () => void;
    onTogglePin: () => void;
    isDark?: boolean;
    onToggleTheme?: () => void;
    onLogout?: () => void;
    role?: string;
}

export function WebSideNav({
                               pinned,
                               onClose,
                               onTogglePin,
                               isDark = true,
                               onToggleTheme,
                               onLogout,
                               role = "Student",
                           }: WebSideNavProps) {
    const {colors} = useTheme();
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (name: NavItem) =>
        pathname === `/${name}` || (name === "Discover" && pathname === "/");

    function go(name: NavItem) {
        router.navigate(`/${name}` as never);
        if (!pinned) onClose();
    }

    return (
        <View style={[s.panel, {backgroundColor: colors.surface, borderRightColor: colors.border}]}>
            {/* Close */}
            <View style={s.closeRow}>
                <Pressable onPress={onClose} accessibilityLabel="Close navigation" style={s.iconBtn}>
                    <Feather name="x" size={22} color={colors.baseFont}/>
                </Pressable>
            </View>

            {/* Title + role */}
            <View style={s.header}>
                <View style={[s.titleWrap, {borderBottomColor: colors.accent}]}>
                    <Text style={[s.title, {color: colors.baseFont}]}>Campus Connect</Text>
                </View>
                <View style={[s.roleBadge, {backgroundColor: `${colors.accent}26`}]}>
                    <Text style={[s.roleText, {color: colors.accent}]}>{role}</Text>
                </View>
            </View>

            <View style={[s.divider, {backgroundColor: colors.border}]}/>

            {/* Links */}
            <View style={s.links}>
                {NAV_ITEMS.map(name => {
                    const active = isActive(name);
                    return (
                        <Pressable
                            key={name}
                            onPress={() => go(name)}
                            accessibilityRole="link"
                            accessibilityState={{selected: active}}
                            style={(state: any) => [
                                s.link,
                                {
                                    backgroundColor: active
                                        ? colors.accent
                                        : state.hovered ? `${colors.baseFont}12` : "transparent",
                                },
                                active && {
                                    shadowColor: colors.accent,
                                    shadowOpacity: 0.35,
                                    shadowRadius: 18,
                                    shadowOffset: {width: 0, height: 6},
                                },
                            ]}
                        >
                            <Text style={[s.linkText, {color: active ? colors.onAccent : colors.baseFont}]}>
                                {name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Spacer pushes the footer down */}
            <View style={{flex: 1}}/>

            {/* Theme + Pin */}
            <View style={s.footerRow}>
                <Pressable
                    onPress={onToggleTheme}
                    style={[s.chip, {borderColor: colors.border}]}
                >
                    <Feather name={isDark ? "sun" : "moon"} size={16} color={colors.baseFont}/>
                    <Text style={[s.chipText, {color: colors.baseFont}]}>
                        {isDark ? "Light mode" : "Dark mode"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onTogglePin}
                    accessibilityLabel={pinned ? "Unpin navigation" : "Pin navigation"}
                    style={[
                        s.chip,
                        {
                            borderColor: pinned ? colors.accent : colors.border,
                            backgroundColor: pinned ? `${colors.accent}1A` : "transparent",
                        },
                    ]}
                >
                    <Ionicons name={pinned ? "pin" : "pin-outline"} size={16}
                              color={pinned ? colors.accent : colors.baseFont}/>
                    <Text style={[s.chipText, {color: pinned ? colors.accent : colors.baseFont}]}>
                        {pinned ? "Pinned" : "Pin"}
                    </Text>
                </Pressable>
            </View>

            <View style={[s.divider, {backgroundColor: colors.border}]}/>

            {/* Log out */}
            <Pressable onPress={onLogout} style={s.logout}>
                <Text style={[s.linkText, {color: colors.baseFont}]}>Log out</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    panel: {
        width: WEB_NAV_WIDTH,
        height: "100%",
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        borderRightWidth: 1,
    },
    closeRow: {flexDirection: "row", justifyContent: "flex-end"},
    iconBtn: {padding: 8},
    header: {marginTop: 12, gap: 12},
    titleWrap: {alignSelf: "flex-start", paddingBottom: 4, borderBottomWidth: 3},
    title: {fontSize: 24, fontWeight: "800"},
    roleBadge: {alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6},
    roleText: {fontSize: 14, fontWeight: "700"},
    divider: {height: 1, marginVertical: 20},
    links: {gap: 8},
    link: {paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16},
    linkText: {fontSize: 18, fontWeight: "700"},
    footerRow: {flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    chipText: {fontWeight: "700"},
    logout: {paddingHorizontal: 20, paddingVertical: 8},
});