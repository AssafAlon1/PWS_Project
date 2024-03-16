export interface CSEvent {
    id: string;
    name: string;
    description: string;
    // TODO - MORE FIELDS!
}

export interface Comment {
    id: string;
    eventId: string;
    content: string;
    // TODO - MORE FIELDS!
}