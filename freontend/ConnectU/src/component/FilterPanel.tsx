import {useEffect, useRef, useState} from "react";
import {
    Animated,
    Easing,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useTheme} from "@/hooks/use-theme";

// ---------------------------------------------------------------- placeholder options (not connected yet)

export const OPTIONS = {
    category: ["All", "Career", "Technology", "Arts", "Sports", "Student Life", "Academic", "Wellness"],
    interest: ["All", "Cybersecurity", "Cloud Computing", "AI", "Music", "Basketball"],
    department: ["All", "Computer Science", "Business", "Arts", "Psychology"],
    organizer: ["All", "Career Center", "Student Affairs", "Campus Rec", "CS Club"],
    venue: ["All", "University Union", "Cook Library", "SECU Arena", "Online"],
    sortBy: ["Event date", "Title", "Published date", "Availability", "Recently viewed"],
};

export interface FilterValues {
    category: string;
    interest: string;
    department: string;
    organizer: string;
    venue: string;
    sortBy: string;
    ascending: boolean;
}

export const DEFAULT_FILTERS: FilterValues = {
    category: "All",
    interest: "All",
    department: "All",
    organizer: "All",
    venue: "All",
    sortBy: "Event date",
    ascending: true,
};

const USE_NATIVE_DRIVER = Platform.OS !== "web";  // web has no native animation driver


// ---------------------------------------------------------------- one row: name | dropdown

interface SelectFieldProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

function SelectField({label, value, options, onChange}: SelectFieldProps) {
    const {colors} = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <View>
            <View className="flex-row items-center gap-3">
                <Text className="w-[104px] text-[15px] font-bold text-baseFont" numberOfLines={1}>
                    {label}
                </Text>

                <Pressable
                    onPress={() => setOpen(o => !o)}
                    className={`flex-1 flex-row items-center justify-between rounded-2xl border bg-input px-4 py-3 ${
                        open ? "border-accent" : "border-control"
                    }`}
                >
                    <Text className="mr-2 flex-1 text-base text-baseFont" numberOfLines={1}>{value}</Text>
                    <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.baseFont}/>
                </Pressable>
            </View>

            {/* options open under the dropdown, lined up with it (104px label + 12px gap) */}
            {open && (
                <View className="ml-[116px] mt-2 overflow-hidden rounded-2xl border border-control bg-surface py-1.5">
                    {options.map(option => {
                        const selected = option === value;
                        return (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    onChange(option);
                                    setOpen(false);
                                }}
                                className="flex-row items-center justify-between px-[18px] py-3 hover:bg-control"
                            >
                                <Text className={selected ? "font-bold text-accent" : "text-baseFont"}>
                                    {option}
                                </Text>
                                {selected && <Feather name="check" size={16} color={colors.accent}/>}
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}


// ---------------------------------------------------------------- the panel

interface FilterPanelProps {
    visible: boolean;
    onClose: () => void;
}

export function FilterPanel({visible, onClose}: FilterPanelProps) {
    const {colors} = useTheme();
    const {width: screenWidth} = useWindowDimensions();
    const panelWidth = Math.min(380, screenWidth * 0.9);   // 90% of a phone, max 380 on web

    const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
    const set = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) =>
        setFilters(f => ({...f, [key]: value}));

    // Slide animation: stay mounted until the slide-out finishes
    const [mounted, setMounted] = useState(visible);
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {

        console.log("FilterPanel render", {visible, mounted});

        if (visible) {
            setMounted(true);
            Animated.timing(progress, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();
        } else {
            Animated.timing(progress, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start(({finished}) => {
                if (finished) setMounted(false);
            });
        }


    }, [visible, progress]);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [panelWidth, 0],          // starts off-screen to the right
    });

    return (
        <Modal
            visible={mounted}
            transparent
            animationType="none"
            statusBarTranslucent                 // Android: cover the status bar area too
            onRequestClose={onClose}
        >
            <View style={{flex: 1}}>
                {/* Backdrop: dims the whole screen, tap to close */}
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
                    <Pressable style={{flex: 1}} onPress={onClose} accessibilityLabel="Close filters"/>
                </Animated.View>

                {/* The sheet: pinned to the right edge, full height, its own background */}
                <Animated.View
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: panelWidth,
                        backgroundColor: colors.surface,
                        borderLeftWidth: 1,
                        borderLeftColor: colors.border,
                        transform: [{translateX}],
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pb-2 pt-6">
                        <Text className="text-[22px] font-extrabold text-baseFont">Filters</Text>
                        <Pressable onPress={onClose} accessibilityLabel="Close filters" className="p-2">
                            <Feather name="x" size={22} color={colors.baseFont}/>
                        </Pressable>
                    </View>

                    {/* Fields: one row each (name | dropdown) */}
                    <ScrollView
                        style={{flex: 1}}
                        contentContainerClassName="gap-3.5 px-6 py-3"
                        showsVerticalScrollIndicator={false}
                    >
                        <SelectField label="Category" value={filters.category} options={OPTIONS.category}
                                     onChange={v => set("category", v)}/>
                        <SelectField label="Interest" value={filters.interest} options={OPTIONS.interest}
                                     onChange={v => set("interest", v)}/>
                        <SelectField label="Department" value={filters.department} options={OPTIONS.department}
                                     onChange={v => set("department", v)}/>
                        <SelectField label="Organizer" value={filters.organizer} options={OPTIONS.organizer}
                                     onChange={v => set("organizer", v)}/>
                        <SelectField label="Venue" value={filters.venue} options={OPTIONS.venue}
                                     onChange={v => set("venue", v)}/>

                        <View className="my-1 h-px bg-border"/>

                        <SelectField label="Sort by" value={filters.sortBy} options={OPTIONS.sortBy}
                                     onChange={v => set("sortBy", v)}/>

                        <View className="flex-row items-center gap-3">
                            <Text className="w-[104px] text-[15px] font-bold text-baseFont">Order</Text>
                            <Pressable
                                onPress={() => set("ascending", !filters.ascending)}
                                className="flex-1 flex-row items-center justify-between rounded-2xl border border-control bg-input px-4 py-3"
                            >
                                <Text className="mr-2 flex-1 text-base text-baseFont">
                                    {filters.ascending ? "Ascending" : "Descending"}
                                </Text>
                                <Feather
                                    name={filters.ascending ? "arrow-up" : "arrow-down"}
                                    size={18}
                                    color={colors.baseFont}
                                />
                            </Pressable>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="flex-row gap-3 border-t border-border px-6 py-[18px]">
                        <Pressable
                            onPress={() => setFilters(DEFAULT_FILTERS)}
                            className="flex-1 items-center justify-center rounded-full border border-control py-3.5"
                        >
                            <Text className="text-base font-bold text-baseFont">Clear filters</Text>
                        </Pressable>
                        <Pressable
                            onPress={onClose}           // TODO: apply filters when connected
                            className="flex-1 items-center justify-center rounded-full bg-accent py-3.5"
                        >
                            <Text className="text-base font-bold text-onAccent">Done</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}