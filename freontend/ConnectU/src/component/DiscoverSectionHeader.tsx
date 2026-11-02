import {Text} from 'react-native'

interface SectionHeaderProps {
    text: string
}
export const DiscoverSectionHeader = ({text}: SectionHeaderProps)=> {
    return (
        <>
            <Text className="text-2xl font-bold tracking-normal text-baseFont my-3 mx-2">
                {text}
            </Text>
        </>
    )
}