export interface CSEvent {
    id: string;
    name: string;
    description: string;
    start_date: Date; // TODO - string?
    category: string;
    image?: string;
    // TODO - MORE FIELDS!
}

export interface Comment {
    id: string;
    eventId: string;
    content: string;
    // TODO - MORE FIELDS!
}