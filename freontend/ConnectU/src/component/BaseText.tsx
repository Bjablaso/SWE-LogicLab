import {Text} from "react-native";


interface CustomTextProps {
    text: string;
}

export const CustomText = ({text}:CustomTextProps) =>{
    return (
        <>
            <Text>
                {text}
            </Text>
        </>
    )
}