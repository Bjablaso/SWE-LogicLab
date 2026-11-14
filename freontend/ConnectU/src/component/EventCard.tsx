import {Platform, View, Text} from "react-native";
import {Feather} from "@expo/vector-icons";
import {Event} from "@/insterface/eventInterface";
import {useTheme} from "@/hooks/use-theme";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// "2026-12-01" → { month: "DEC", day: "1" }
function dateTile(eventDate: string) {
    const [, month, day] = eventDate.split("-").map(Number);
    return {
        month: MONTHS[month - 1] ?? "",
        day: String(day ?? ""),
    };
}

interface EventCardProps {
    event: Event;
    highlighted?: boolean;   // mouse over (web)
    pressed?: boolean;       // being tapped/clicked
}

export const EventCard = ({event, highlighted = false, pressed = false}: EventCardProps) => {
    const {colors} = useTheme();
    const {month, day} = dateTile(event.eventDate);

    return (
        <View
            className="w-full overflow-hidden rounded-3xl border bg-surface"
            style={[
                {borderColor: highlighted ? colors.accent : colors.border},
                highlighted && {
                    shadowColor: colors.accent,
                    shadowOpacity: 0.45,
                    shadowRadius: 22,
                    shadowOffset: {width: 0, height: 8},
                    transform: [{translateY: -2}],          // slight lift
                },
                pressed && {opacity: 0.85},
                Platform.OS === "web" && ({
                    transitionProperty: "border-color, box-shadow, transform",
                    transitionDuration: "150ms",
                } as any),
            ]}
        >
            {/* top: image placeholder + date badge */}
            <View className="h-32 items-center justify-center border-b border-border bg-input">
                <Feather name="image" size={22} color="#9E9A90"/>
                <Text className="mt-1 text-xs font-bold text-muted">Image goes here</Text>

                {/*TODO: ON SEARCH FOCUS CHNAGE DATE BOX SIZE MAKE SMALLER  */}
                <View
                    className="absolute left-3 top-3 items-center
                    rounded-xl bg-accent px-2 py-3 h-[45%] w-[22%]
                    justify-center"
                >
                    <Text className="text-sm font-bold text-black">{month}</Text>
                    <Text className="text-2xl font-extrabold text-black">{day}</Text>
                </View>
            </View>

            {/* bottom: event info */}
            <View className="gap-1 p-4">
                <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                    {event.category} · {event.startTime} · {event.location}
                </Text>
                <Text className="text-base font-bold text-baseFont">{event.title}</Text>
                <Text className="text-sm text-baseFont">
                    {event.capacity - event.spotsLeft} of {event.capacity} spots taken
                </Text>
            </View>
        </View>
    );
};

// import { View, Text, Image, Pressable } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import data from '../../connectU.json';
//
// type Event = (typeof data.upcoming)[number];
//
// export const EventCard = ({ event, onPress }: { event: Event; onPress?: () => void }) => {
//     const date = new Date(`${event.eventDate}T${event.startTime}`);
//     const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(); // OCT
//     const day = date.getDate();                                                       // 14
//     const fullDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
//     const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
//
//     return (
//         <Pressable
//             onPress={onPress}
//             style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
//             className="w-60 overflow-hidden rounded-3xl border border-border bg-surface"
//         >
//             {/* top: image + date badge */}
//             <View className="h-32 items-center justify-center border-b border-border bg-input">
//                 {event.imageUrl ? (
//                     <Image source={{ uri: event.imageUrl }} className="absolute inset-0" resizeMode="cover" />
//                 ) : (
//                     <>
//                         <Feather name="image" size={22} color="#9E9A90" />
//                         <Text className="mt-1 text-xs font-bold text-muted">Image goes here</Text>
//                     </>
//                 )}
//                 <View className="absolute left-3 top-3 items-center rounded-xl bg-accent px-2 py-1">
//                     <Text className="text-[10px] font-extrabold text-onAccent">{month}</Text>
//                     <Text className="text-xl font-extrabold leading-6 text-onAccent">{day}</Text>
//                 </View>
//             </View>
//
//             {/* bottom: event info */}
//             <View className="gap-1 p-4">
//                 <Text className="text-xs font-bold uppercase tracking-widest text-muted">{event.category}</Text>
//                 <Text className="text-base font-bold text-baseFont" numberOfLines={2}>{event.title}</Text>
//                 <Text className="text-sm text-muted">{fullDate} · {time}</Text>
//                 <Text className="text-sm text-muted" numberOfLines={2}>{event.location}</Text>
//                 <Text className="text-sm text-baseFont">
//                     {event.spotsLeft === 0 ? 'Event is full' : `${event.spotsLeft} of ${event.capacity} spots open`}
//                 </Text>
//             </View>
//         </Pressable>
//     );
// };