import {
    userEvent,
    userEventReducer
} from "@/reducers/UserEventReducer";


describe("UserEventReducer - Save Event", () => {

    /*
     * TEST 1
     *
     * Scenario:
     * User is on Discover and selects an event.
     * User clicks the heart/save button.
     *
     * Expected:
     * The selected event should now have isSaved = true.
     */
    test("should save an event when the user clicks save", () => {

        // ARRANGE
        const eventId = 101;

        // ACT
        const updatedState = userEventReducer(
            userEvent,
            {
                type: "SAVED",
                payload: {
                    eventId: eventId
                }
            }
        );

        // ASSERT
        const savedEvent = updatedState.events.find(
            event => event.eventId === eventId
        );

        expect(savedEvent).toBeDefined();
        expect(savedEvent?.isSaved).toBe(true);
    });


    /*
     * TEST 2
     *
     * Scenario:
     * User saved an event from Discover.
     * Saved screen filters the event state for saved events.
     *
     * Expected:
     * The saved event should exist in the collection
     * of events displayed by Saved.
     */
    test("should make the saved event available to the Saved event list", () => {

        // ARRANGE
        const eventId = 101;

        // ACT
        const updatedState = userEventReducer(
            userEvent,
            {
                type: "SAVED",
                payload: {
                    eventId: eventId
                }
            }
        );

        // Simulates what the Saved screen would do
        const savedEvents = updatedState.events.filter(
            event => event.isSaved
        );

        // ASSERT
        const eventExistsInSaved = savedEvents.some(
            event => event.eventId === eventId
        );

        expect(eventExistsInSaved).toBe(true);
    });

});