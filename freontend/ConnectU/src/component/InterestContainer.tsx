import {View} from "react-native";

type InterestIcon = "book" | "palette" | "briefcase" | "flag" | "users" | "heart" | "trophy";

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

export default function InterestContainer() {
    return(
        <View className="flex-row w-full">

        </View>

    )
}