import { useState, type ComponentProps } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DiscoverSectionHeader } from "./DiscoverSectionHeader";

/* ---------- Types ---------- */
type InterestIcon = "book" | "palette" | "briefcase" | "flag" | "users" | "heart" | "trophy";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface Interest {
    id: string;
    label: string;
    selected: boolean;
}

interface InterestCategory {
    id: string;
    name: string;
    icon: InterestIcon;
    interests: Interest[];
}

/* ---------- Icon map ---------- */
const iconMap: Record<InterestIcon, IoniconName> = {
    book: "book-outline",
    palette: "color-palette-outline",
    briefcase: "briefcase-outline",
    flag: "flag-outline",
    users: "people-outline",
    heart: "heart-outline",
    trophy: "trophy-outline",
};

/* ---------- Data ---------- */
export const interestsData = {
    title: "Interests",
    description:
        "Tap an interest to add or remove it. Keep at least one in each category. We use these to recommend events to you.",
    categories: [
        {
            id: "academics",
            name: "Academics",
            icon: "book",
            interests: [
                { id: "research-skills", label: "Research Skills", selected: true },
                { id: "tutoring", label: "Tutoring", selected: false },
                { id: "study-abroad", label: "Study Abroad", selected: false },
            ],
        },
        {
            id: "arts-culture",
            name: "Arts & Culture",
            icon: "palette",
            interests: [
                { id: "art-exhibits", label: "Art Exhibits", selected: true },
                { id: "music-performance", label: "Music & Performance", selected: false },
                { id: "film-screenings", label: "Film Screenings", selected: false },
            ],
        },
        {
            id: "career",
            name: "Career/Professional Development",
            icon: "briefcase",
            interests: [
                { id: "networking", label: "Networking", selected: true },
                { id: "entrepreneurship", label: "Entrepreneurship", selected: false },
                { id: "resumes-interviews", label: "Resumes & Interviews", selected: false },
            ],
        },
        {
            id: "leadership",
            name: "Leadership & Civic Engagement",
            icon: "flag",
            interests: [
                { id: "volunteering", label: "Volunteering", selected: true },
                { id: "student-government", label: "Student Government", selected: false },
                { id: "advocacy", label: "Advocacy", selected: false },
            ],
        },
        {
            id: "student-life",
            name: "Student Life",
            icon: "users",
            interests: [
                { id: "trivia-games", label: "Trivia & Games", selected: true },
                { id: "school-pride", label: "School Pride", selected: false },
                { id: "clubs-socials", label: "Clubs & Socials", selected: false },
            ],
        },
        {
            id: "wellbeing",
            name: "Wellbeing",
            icon: "heart",
            interests: [
                { id: "mental-health", label: "Mental Health", selected: true },
                { id: "fitness-nutrition", label: "Fitness & Nutrition", selected: false },
                { id: "mindfulness", label: "Mindfulness", selected: false },
            ],
        },
        {
            id: "athletics",
            name: "Athletics & Recreation",
            icon: "trophy",
            interests: [
                { id: "intramural-sports", label: "Intramural Sports", selected: true },
                { id: "tiger-athletics", label: "Tiger Athletics", selected: false },
                { id: "outdoor-adventures", label: "Outdoor Adventures", selected: false },
            ],
        },
    ] satisfies InterestCategory[],
};

/* ---------- 1. InterestChip: one tappable pill ---------- */
interface InterestChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
}

const InterestChip = ({ label, selected, onPress }: InterestChipProps) => (
    <Pressable
        onPress={onPress}
        className={`rounded-full px-4 py-2 border ${
            selected ? "bg-yellow-400 border-yellow-400" : "bg-transparent border-neutral-700"
        }`}
    >
        <Text className={`text-base font-bold ${selected ? "text-black" : "text-baseFont"}`}>
            {label}
        </Text>
    </Pressable>
);

/* ---------- 2. CategoryHeader: icon + category name ---------- */
interface CategoryHeaderProps {
    name: string;
    icon: InterestIcon;
}

const CategoryHeader = ({ name, icon }: CategoryHeaderProps) => (
    <View className="flex-row items-center gap-2">
        <Ionicons name={iconMap[icon]} size={16} color="#ffffff" />
        <Text className="text-base font-bold text-baseFont">{name}</Text>
    </View>
);

/* ---------- 3. CategorySection: divider, header, and chips ---------- */
interface CategorySectionProps {
    category: InterestCategory;
    onToggle: (interestId: string) => void;
}

const CategorySection = ({ category, onToggle }: CategorySectionProps) => (
    <View className="py-4 mx-2 border-t border-neutral-800 gap-3">
        <CategoryHeader name={category.name} icon={category.icon} />

        <View className="flex-row flex-wrap gap-2">
            {category.interests.map((interest) => (
                <InterestChip
                    key={interest.id}
                    label={interest.label}
                    selected={interest.selected}
                    onPress={() => onToggle(interest.id)}
                />
            ))}
        </View>
    </View>
);

/* ---------- 4. InterestContainer: the card, holds state ---------- */
export default function InterestContainer() {
    const [categories, setCategories] = useState<InterestCategory[]>(interestsData.categories);

    const toggleInterest = (categoryId: string, interestId: string) => {
        setCategories((prev) =>
            prev.map((category) => {
                if (category.id !== categoryId) return category;

                const target = category.interests.find((i) => i.id === interestId);
                const selectedCount = category.interests.filter((i) => i.selected).length;

                // Keep at least one selected per category
                if (target?.selected && selectedCount === 1) return category;

                return {
                    ...category,
                    interests: category.interests.map((i) =>
                        i.id === interestId ? { ...i, selected: !i.selected } : i
                    ),
                };
            })
        );
    };

    return (
        <View className="w-full rounded-3xl bg-surface py-2 px-4 my-2 ">
            {/* Title + description */}
            <View className="pb-4">
                <DiscoverSectionHeader text={interestsData.title} textSize="xxl" />
                <Text className="text-sm text-muted mx-2">{interestsData.description}</Text>
            </View>

            {/* Categories */}
            {categories.map((category) => (
                <CategorySection
                    key={category.id}
                    category={category}
                    onToggle={(interestId) => toggleInterest(category.id, interestId)}
                />
            ))}
        </View>
    );
}