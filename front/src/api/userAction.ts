// TODO - implement!

const userActions = [
    {
        username: "Alice",
        actionType: "purchase",
        eventId: "1",
        purchaseId: "1",
        ticketName: "General Admission",
        amount: 3,
        timestamp: new Date("2024-03-17T11:32"),
    },

];

export const registerUserAction = (
    username: string,
    actionType: string,
    eventId: string,
    purchaseId: string,
    ticketName: string,
    amount: number,) => {
    const timestamp = new Date();
    userActions.push({
        username,
        actionType,
        eventId,
        purchaseId,
        ticketName,
        amount,
        timestamp,
    });
}

// TODO - This probably won't be here in the final version (the user Action microservice will do this, and send the data to the events service)
export const getUserEventIds = (username: string): string[] => {
    // TODO - Actually, this will be a database call. I think we agreed to keep the active events in an array or something..? For easier selection
    const userEvents = userActions.filter(action => action.username === username && action.actionType === "purchase");
    return userEvents.map(purchase => purchase.eventId);
}