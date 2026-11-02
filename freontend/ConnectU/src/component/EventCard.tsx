import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link , useRouter} from 'expo-router';
import data from '../../event.json';
import {Event} from "@/insterface/eventInterface";

interface EventDetailProps {
    event: Event;
}
export const EventCard = ({event}: EventDetailProps) => {
    //const event = data.recommended[0];
    const router = useRouter();

    return (

                <View className="w-full overflow-hidden rounded-3xl border border-border bg-surface">
                    {/* top: image placeholder + date badge */}
                    <View className="h-32 items-center justify-center border-b border-border bg-input">
                        <Feather name="image" size={22} color="#9E9A90" />
                        <Text className="mt-1 text-xs font-bold text-muted">Image goes here</Text>

                        <View className="absolute left-3 top-3 items-center
                        rounded-xl bg-accent px-2 py-3 h-[45%] w-[13%]
                        justify-center
                        ">
                            <Text className="text-sm font-bold text-black">OCT</Text>
                            <Text className="text-2xl font-extrabold text-black">14</Text>
                        </View>
                    </View>

                    {/* bottom: event info */}
                    <View className="gap-1 p-4">
                        <Text className="text-xs font-bold uppercase tracking-widest text-muted">
                            {event.category} · {event.startTime} · {event.location}
                        </Text>
                        <Text className="text-base font-bold text-baseFont">{event.title}</Text>
                        <Text className="text-sm text-baseFont">{event.spotsLeft} of {event.capacity} spots open</Text>
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