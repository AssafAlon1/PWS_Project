
import { Comment } from "../types";

// TODO - remove this function (only for testing)
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

const allComments = [
    {
        eventId: "1",
        content: "This event seems fun!",
        createdAt: new Date("2024-03-17T11:32"),
        author: "Alice",
    },
    {
        eventId: "1",
        content: "Jeffrey Epstein didn't kill himself",
        createdAt: new Date("2024-03-17T11:54"),
        author: "A person who knows...",
    },
    {
        eventId: "1",
        content: "Haha, I like fun events :)",
        createdAt: new Date("2024-03-18T01:05"),
        author: "Bob",
    },
    {
        eventId: "2",
        content: "Boooo-RING!",
        createdAt: new Date("2024-03-18T01:07"),
        author: "Bob"
    },
];


export const postComment = async (username: string, eventId: string, comment: string) => {
    // TODO - implement this
    await new Promise(resolve => setTimeout(resolve, 500));
    if (getRandomInt(10) === 0) {
        throw new Error("Force error for testing purposes.");
    }
    const newComment: Comment = {
        eventId,
        content: comment,
        createdAt: new Date(),
        author: username,
    };
    allComments.push(newComment);
    return newComment;
}


export async function fetchComments(eventId: string): Promise<Comment[]> {
    // TODO - implement
    await new Promise(resolve => setTimeout(resolve, 500));
    if (getRandomInt(10) === 0) {
        throw new Error("Force error for testing purposes.");
    }

    return allComments.filter(comment => comment.eventId === eventId).reverse();
}