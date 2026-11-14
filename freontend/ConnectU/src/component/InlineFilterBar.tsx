import {useState} from "react";
import {Pressable, Text, View} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useTheme} from "@/hooks/use-theme";
import {ICON, rem} from "@constants/rem";
import {DEFAULT_FILTERS, FilterValues, OPTIONS} from "@/component/FilterPanel";

//TODO : IMPLEMENT FULL LATER :   JUST STYLISH RIGHT NOW
// Fields that are dropdowns (everything except the ascending/descending toggle)
type DropdownKey = Exclude<keyof FilterValues, "ascending">;

// ---------------------------------------------------------------- one field: label on top, dropdown below

interface DropdownProps {
    label: string;
    value: string;
    options: string[];
    open: boolean;                          // controlled by the bar
    onToggle: () => void;                   // ask the bar to open/close this one
    onChange: (value: string) => void;
}

function Dropdown({label, value, options, open, onToggle, onChange}: DropdownProps) {
    const {colors} = useTheme();
    const iconInline = rem(ICON.inline);

    return (
        // open field is raised above its neighbours so its list floats over them
        <View className={`min-w-48 flex-1 gap-2 ${open ? "z-50" : "z-0"}`}>
            <Text className="font-sans-semibold text-nav-web text-baseFont">{label}</Text>

            <View>
                <Pressable
                    onPress={onToggle}
                    className={`flex-row items-center justify-between rounded-2xl border bg-input px-5 py-3.5 ${
                        open ? "border-accent" : "border-control"
                    }`}
                >
                    <Text className="mr-2 flex-1 font-sans text-title-web text-baseFont" numberOfLines={1}>
                        {value}
                    </Text>
                    <Feather name={open ? "chevron-up" : "chevron-down"} size={iconInline} color={colors.baseFont}/>
                </Pressable>

                {/* list floats under the dropdown, in front of everything below the bar */}
                {open && (
                    <View className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-control bg-surface py-1.5 shadow-lg">
                        {options.map(option => {
                            const selected = option === value;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => {
                                        onChange(option);
                                        onToggle();                 // close after picking
                                    }}
                                    className="flex-row items-center justify-between px-5 py-3 hover:bg-control"
                                >
                                    <Text
                                        className={`text-body-web ${
                                            selected ? "font-sans-bold text-accent" : "font-sans text-baseFont"
                                        }`}
                                    >
                                        {option}
                                    </Text>
                                    {selected && <Feather name="check" size={iconInline} color={colors.accent}/>}
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}


// ---------------------------------------------------------------- the bar (web)

export function InlineFilterBar() {
    const {colors} = useTheme();
    const iconInline = rem(ICON.inline);

    const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);   // not connected yet
    const set = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) =>
        setFilters(f => ({...f, [key]: value}));

    // Only one dropdown open at a time: null = all closed
    const [openField, setOpenField] = useState<DropdownKey | null>(null);

    // Everything a Dropdown needs for one field
    const dropdownProps = (key: DropdownKey) => ({
        value: filters[key],
        options: OPTIONS[key],
        open: openField === key,
        onToggle: () => setOpenField(current => (current === key ? null : key)),
        onChange: (v: string) => set(key, v),
    });

    function clearFilters() {
        setFilters(DEFAULT_FILTERS);
        setOpenField(null);
    }

    return (
        // z-10: the whole bar stacks above the Welcome Back card and event cards below it
        <View className="z-10 gap-5 rounded-3xl border border-border bg-surface p-6">
            {/* Row 1: the five filters (above row 2, so its lists cover row 2) */}
            <View className="z-20 flex-row flex-wrap gap-4">
                <Dropdown label="Category" {...dropdownProps("category")}/>
                <Dropdown label="Interest" {...dropdownProps("interest")}/>
                <Dropdown label="Department" {...dropdownProps("department")}/>
                <Dropdown label="Organizer" {...dropdownProps("organizer")}/>
                <Dropdown label="Venue" {...dropdownProps("venue")}/>
            </View>

            {/* Row 2: sort by, order, clear (lined up with the columns above) */}
            <View className="z-10 flex-row flex-wrap items-end gap-4">
                <Dropdown label="Sort by" {...dropdownProps("sortBy")}/>

                <Pressable
                    onPress={() => set("ascending", !filters.ascending)}
                    className="min-w-48 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-control py-3.5 hover:bg-control"
                >
                    <Text className="font-sans-bold text-button-web text-baseFont">
                        {filters.ascending ? "Ascending" : "Descending"}
                    </Text>
                    <Feather name={filters.ascending ? "arrow-up" : "arrow-down"} size={iconInline}
                             color={colors.baseFont}/>
                </Pressable>

                <Pressable
                    onPress={clearFilters}
                    className="min-w-48 flex-1 items-center justify-center rounded-full border border-control py-3.5 hover:bg-control"
                >
                    <Text className="font-sans-bold text-button-web text-baseFont">Clear filters</Text>
                </Pressable>

                {/* two empty slots so the row uses the same 5 columns as row 1 */}
                <View className="min-w-48 flex-1"/>
                <View className="min-w-48 flex-1"/>
            </View>
        </View>
    );
}