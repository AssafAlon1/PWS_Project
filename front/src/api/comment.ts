import axios, { isAxiosError } from "axios";
import { APIStatus } from "../types";
import { API_GATEWAY_URL } from "../const";
import { Comment } from "../types";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

const CommentApi = {
    postComment: async (username: string, eventId: string, comment: string) => {
        try {
            const actualComment = {
                eventId: eventId,
                author: username,
                content: comment,
                createdAt: new Date()
            }
            await axiosInstance.post('/api/comment', actualComment);
            return APIStatus.Success;
        } catch (e) {
            console.error(e);
            if (isAxiosError(e)) {
                throw new Error("Failed to add comment for event " + eventId + ": " + e.response.data); // TODO - Better handling?
            }
            throw new Error("Failed to add comment"); // TODO - Better handling?
        }
    },

    fetchComments: async (eventId: string, skip?: number, limit?: number): Promise<Comment[]> => {
        try {
            const response = await axiosInstance.get(`/api/comment/${eventId}`, {
                params: {
                    // eventId, // TODO - event ID id not a param.... its part of the path!
                    skip,
                    limit
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(error);
            if (isAxiosError(error)) {
                throw new Error("Failed to fetch comments: " + error.response?.data.message); // TODO - Better handling?
            }
            throw new Error("Failed to fetch comments"); // TODO - Better handling?
        }
    }
}

// // Mock API
// const CommentApi = {
//     allComments: [
//         {
//             eventId: "1",
//             content: "This event seems fun!",
//             createdAt: new Date("2024-03-17T11:32"),
//             author: "Alice",
//         },
//         {
//             eventId: "1",
//             content: "Jeffrey Epstein didn't kill himself",
//             createdAt: new Date("2024-03-17T11:54"),
//             author: "A person who knows...",
//         },
//         {
//             eventId: "1",
//             content: "Haha, I like fun events :)",
//             createdAt: new Date("2024-03-18T01:05"),
//             author: "Bob",
//         },
//         {
//             eventId: "2",
//             content: "Boooo-RING!",
//             createdAt: new Date("2024-03-18T01:07"),
//             author: "Bob"
//         },
//     ],

//     postComment: async (username: string, eventId: string, comment: string) => {
//         // TODO - implement this
//         await new Promise(resolve => setTimeout(resolve, 500));
//         if (getRandomInt(2) === 0) {
//             throw new Error("Force error for testing purposes.");
//         }
//         const newComment: Comment = {
//             eventId,
//             content: comment,
//             createdAt: new Date(),
//             author: username,
//         };
//         CommentApi.allComments.push(newComment);
//         return newComment;
//     },

//     fetchComments: async (eventId: string): Promise<Comment[]> => {
//         // TODO - implement
//         await new Promise(resolve => setTimeout(resolve, 500));
//         if (getRandomInt(10) === 0) {
//             throw new Error("Force error for testing purposes.");
//         }

//         return CommentApi.allComments.filter(comment => comment.eventId === eventId).reverse();
//     }
// }

export default CommentApi;