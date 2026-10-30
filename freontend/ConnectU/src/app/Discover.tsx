import {Text, StyleSheet, View, TextInput} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Feather from '@expo/vector-icons/Feather';
import {cssInterop} from "nativewind";
import  {useTheme} from "@/hooks/use-theme";


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
            <Feather
                name="search"
                size={24}
                color={colors.baseFont}
            />

            <TextInput
                className="flex-1 text-baseFont text-xl p-0 "
                placeholder="Search..."
                placeholderTextColor={colors.baseFont}
                selectionColor={colors.baseFont}
            />
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
        className="w-full h-[87%] ">

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