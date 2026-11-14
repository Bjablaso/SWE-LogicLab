import {createContext} from "react";
import {EventContextType} from "@/insterface/eventInterface";

export const EventContext = createContext< EventContextType| null>(null)