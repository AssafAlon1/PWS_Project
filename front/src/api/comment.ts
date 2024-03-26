import axios, { isAxiosError } from "axios";
import { APIStatus } from "../types";
import { API_GATEWAY_URL } from "../const";
import { Comment } from "../types";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL }); // TODO - withCredentials?

const RealCommentApi = {
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
                throw new Error("Failed to add comment for event " + eventId + ": " + e.response?.data); // TODO - Better handling?
            }
            throw new Error("Failed to add comment"); // TODO - Better handling?
        }
    },

    fetchComments: async (eventId: string, skip?: number, limit?: number): Promise<Comment[]> => {
        try {
            const response = await axiosInstance.get(`/api/comment/${eventId}`, {
                params: {
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

// import { MockCommentApi } from "./mock";
// const CommentApi = MockCommentApi;
const CommentApi = RealCommentApi;


export default CommentApi;