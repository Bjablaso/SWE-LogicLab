import AsyncStorage from "@react-native-async-storage/async-storage"
// TODO: Persistent Event State
// Store the previous event state locally so the app can restore existing event data
// after the app is closed or the process is killed.
//
// On app startup:
// 1. Load the previous event state from persistent local storage.
// 2. Use the stored state to populate the app immediately instead of requesting
//    the complete event dataset from the backend every time.
// 3. Keep backend synchronization as a separate function/process.
// 4. The backend synchronization should check whether the backend event data has
//    changed compared with the locally stored previous state.
// 5. If changes exist (new, updated, or removed events), update the current state
//    and replace the locally stored previous state with the newest state.
// 6. If nothing has changed, continue using the locally stored previous state.
//
// Goal: Avoid unnecessary full backend requests/reloads while still allowing
// the local event state to be synchronized when backend event data changes.
interface PresistedEventState{
    previousState: Event[]
    savedEventIds: number[],
    attemptedEventIds:number[]
}
// TODO: Local storage key for the previous persisted event state
const EVENT_STORAGE_KEY = "event-storage" // REPLACE WITH BACK END ENCRIPTED SESSION KEY