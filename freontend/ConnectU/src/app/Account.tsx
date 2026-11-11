import {Text, StyleSheet, View, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {DiscoverSectionHeader} from "@/component/DiscoverSectionHeader";
import InterestContainer from "@/component/InterestContainer";


const accountProfileSettings = ["Profile", "Interest", "Notification", "Following", "Friends", 'Privacy',
"Cookies"]

interface TextOutlinerProps {
    titleSize: TextOutlinerSize
    bodySize: TextOutlinerSize
    titleColor: TextColor
    bodyColor: TextColor
    title: string
    body: string
    className?: string;
}
type TextOutlinerSize = "small" | "medium" | "large" | "xtraLarge" | "Bigger" | "Biggest"
type TextColor = "baseColor" | "grayScale"

const TextOutlinerMapper: Record<TextOutlinerSize, string>={
    small: "text-sm",    // 14px
    medium: "text-base",  // 16px
    large: "text-lg",    // 18px
    xtraLarge: "text-xl",    // 20px
    Bigger: "text-2xl", // 24px
    Biggest: "text-3xl", // 30px
}

const TextColorMapper: Record<TextColor, string> ={
    baseColor: "text-baseFont",
    grayScale: "text-muted",
}

//sample data
const fields = [
    { title: "First Name", body: "Alex" },
    { title: "Last Name", body: "Rivera" },
    { title: "University Email", body: "alex.rivera@students.towson.edu" },
    { title: "Secondary Email", body: "alex.rivera@gmail.com" },
    { title: "Date of Birth", body: "April 12, 2005" },
    { title: "Roles", body: "Student" },
    { title: "University", body: "Towson University" },
];
const TextOutliner = ({titleSize, bodySize,
                          titleColor, bodyColor, className = "",
                          title,body}:TextOutlinerProps) =>{

    return (
        <View className={`flex flex-col  
        ${className}`}>
            <Text className={`${TextOutlinerMapper[titleSize]}  ${TextColorMapper[titleColor]}
             
             `}> {title}</Text>
            <View className="pl-1">
                <Text
                    className={`
                        ${TextOutlinerMapper[bodySize]}
                        ${TextColorMapper[bodyColor]}
                    `}
                >
                    {body}
                </Text>
            </View>

        </View>
    )
}
const ProfileCard = () =>{
    return(
        <View className="flex w-full  rounded-3xl bg-surface py-2 px-4">
            <View className="flex flex-row w-full justify-between mb-2">
                <DiscoverSectionHeader
                    text="Profile"
                    textSize="xl"
                />

                <DiscoverSectionHeader
                    text="Profile"
                    textSize="xl"
                />
            </View>

            <View className="flex-row flex-wrap items-start gap-0">
                {fields.map((field) => (
                    <TextOutliner
                        key={field.title}
                        title={field.title}
                        body={field.body}
                        titleSize="large"
                        bodySize="medium"
                        titleColor="baseColor"
                        bodyColor="grayScale"
                        className="w-1/2 mb-1 pr-3 "
                    />
                ))}
            </View>




        </View>
    )
}
export default function Account() {
    return (
        <SafeAreaView edges={["top"]} className="flex-1">
            {/*<View className="flex-1 p-4">*/}


                <ScrollView
                    className="flex-1 px-4"
                    contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <DiscoverSectionHeader text="Account" textSize="xxxl" />
                    <ProfileCard />
                    <InterestContainer />
                </ScrollView>
            {/*</View>*/}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        //backgroundColor: "#fff",
    },
    text: { fontSize: 18, fontWeight: "700" },
});