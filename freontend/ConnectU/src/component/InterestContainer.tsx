import {Pressable, Text, View} from "react-native";
import {DiscoverSectionHeader} from "./DiscoverSectionHeader";
import {useTheme} from "@/hooks/use-theme";
import type {InterestResponse} from "@/services/api";

interface InterestContainerProps {
    interests: InterestResponse[];
    selectedInterestIds: number[];
    onToggle: (interestId: number) => void;
    disabled?: boolean;
}

export default function InterestContainer({
    interests,
    selectedInterestIds,
    onToggle,
    disabled = false,
}: InterestContainerProps) {
    const {colors} = useTheme();
    const selectedIds = new Set(selectedInterestIds);

    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 24,
                padding: 16,
            }}
        >
            <DiscoverSectionHeader text="Interests" textSize="xxl"/>
            <Text style={{color: colors.muted, marginHorizontal: 8, marginBottom: 16}}>
                Select interests to personalize your event recommendations.
            </Text>

            {interests.length === 0 ? (
                <Text style={{color: colors.muted, marginHorizontal: 8}}>
                    No interests are currently available.
                </Text>
            ) : (
                <View style={{flexDirection: "row", flexWrap: "wrap", gap: 8}}>
                    {interests.map((interest) => {
                        const selected = selectedIds.has(interest.interest_id);

                        return (
                            <Pressable
                                key={interest.interest_id}
                                accessibilityRole="checkbox"
                                accessibilityState={{checked: selected, disabled}}
                                disabled={disabled}
                                onPress={() => onToggle(interest.interest_id)}
                                style={{
                                    backgroundColor: selected ? colors.accent : "transparent",
                                    borderColor: selected ? colors.accent : colors.border,
                                    borderWidth: 1,
                                    borderRadius: 999,
                                    opacity: disabled ? 0.6 : 1,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: selected ? colors.onAccent : colors.baseFont,
                                        fontWeight: "700",
                                    }}
                                >
                                    {interest.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
