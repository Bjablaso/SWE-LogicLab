import data from "../../connectU.json"
import { View, Text } from 'react-native';
interface TitleCardProps {
    universityName: string
    welcomeInstruciton: string
    description: string
}
export const TitleCard = () => {
    const universityName = data.user.discover.titleCard.universityName
    const welcomeInstruciton = data.user.discover.titleCard.welcomeInstruciton
    const description = data.user.discover.titleCard.description
    return (
        <View className=" overflow-hidden rounded-3xl border border-border bg-surface p-5">
            {/* yellow circle, half off the top-right corner */}
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent" />

            <Text className="text-xs font-bold uppercase tracking-widest text-accent">
                {universityName}
            </Text>
            <Text className="mt-2 w-3/4 text-3xl font-extrabold text-baseFont">
                {welcomeInstruciton}
            </Text>
            <Text className="mt-3 w-4/5 text-base text-muted">
                {description}
            </Text>
        </View>
    )
}


