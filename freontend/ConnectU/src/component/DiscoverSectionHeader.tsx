import {Text} from 'react-native'

interface SectionHeaderProps {
    text: string
    textSize: FontSize
}

type FontSize = "sm" | "md" | "lg"| "xl"| "xxl"| "xxxl"| "xxxxl" | "xxxxxl"
const fontSize: Record<FontSize, string> = {
    sm: "text-sm",    // 14px
    md: "text-base",  // 16px
    lg: "text-lg",    // 18px
    xl: "text-xl",    // 20px
    xxl: "text-2xl", // 24px
    xxxl: "text-3xl", // 30px
    xxxxl: "text-4xl", // 36px
    xxxxxl: "text-5xl", // 48px
};
export const DiscoverSectionHeader = ({text, textSize}: SectionHeaderProps)=> {

    return (
        <>
            <Text className={`${fontSize[textSize]} font-bold tracking-normal text-baseFont my-3 mx-2`}>
                {text}
            </Text>
        </>
    )
}