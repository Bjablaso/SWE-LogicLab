import {Text, StyleSheet, View, TextInput} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { DiscoverSectionHeader } from "@/component/DiscoverSectionHeader";
import Feather from '@expo/vector-icons/Feather';
import {cssInterop} from "nativewind";
import  {useTheme} from "@/hooks/use-theme";
import {TitleCard} from "@/component/TitleCard";
import {EventCard} from "@/component/EventCard";



cssInterop(Feather, {
    className: {
        target: "style",
        nativeStyleToProp: {
            color: true,
        },
    },
});

interface TopContainerProps {
    childrenOne?: React.ReactNode;

}

const Search = () =>{
    const { colors } = useTheme();

    return(
        <View
            className="
        w-[95%] h-[75%]
        flex-row items-center
        px-5 gap-4
        shadow-lg
        rounded-[32px]
    "
            style={{
                backgroundColor: colors.surface,
                shadowColor: colors.baseGray100,
            }}
        >
            {/* LEFT — Search Icon */}

            <TouchableOpacity
            >
                <Feather
                    name="search"
                    size={24}
                    color={colors.baseFont}

                />
            </TouchableOpacity>


            {/* CENTER — Takes all remaining space */}
            <TextInput
                className="flex-1 text-xl p-0"
                style={{
                    color: colors.baseFont,
                }}
                placeholder="Search..."
                placeholderTextColor={colors.baseFont}
                selectionColor={colors.baseFont}
            />

            {/* RIGHT — Filter Circle */}
            <View
                className="w-10 h-10 rounded-full items-center justify-center "
                style={{
                    borderColor: colors.baseGray100,
                }}
            >
                <TouchableOpacity
                >
                    <Ionicons
                        name="filter"
                        size={20}
                        color={colors.baseFont}
                    />
                </TouchableOpacity>



            </View>
        </View>

    )
}
const TopContainer = ({childrenOne}: TopContainerProps) =>{
    return (
        <View className="w-full h-[13%]">
            <View className="w-full h-full items-center justify-center">
                {childrenOne}
            </View>
        </View>
    )
}
const BottomContainer = () =>{
    return (
        <View
        className="w-full h-[87%] pt-5 px-4 ">

            <TitleCard/>
            <DiscoverSectionHeader
                text="Recommended for you"
            />

            <EventCard/>
            {/*//scroll view*/}
            {/*<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4">*/}

            {/*</ScrollView>*/}
        </View>
    )
}

export default function Discover() {

    return (
        <SafeAreaView edges={["top"]}
                      className="flex-1 flex-col "
        >
            <TopContainer
                childrenOne={<Search />}

            />
            <BottomContainer>


            </BottomContainer>

        </SafeAreaView>
    );
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//         //backgroundColor: "#fff",
//     },
//     text: { fontSize: 18, fontWeight: "700" },
// });