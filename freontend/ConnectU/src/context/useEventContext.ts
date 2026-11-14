import {useContext} from "react";
import {EventContext} from "@/context/EventContext";

export function useEventContext (){
    const  context = useContext(EventContext)
    if(!context){
        throw new Error("useEventContext must be defined")
    }

    return context;
}