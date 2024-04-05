import axios from "axios";
import { API_GATEWAY_URL } from "../const";
import { Comment } from "../types";

const axiosInstance = axios.create({ withCredentials: true, baseURL: API_GATEWAY_URL });

const RealCommentApi = {
    postComment: async (username: string, eventId: string, comment: string) => {
        const actualComment = {
            eventId: eventId,
            author: username,
            content: comment,
            createdAt: new Date()
        }
        const result = await axiosInstance.post('/api/comment', actualComment);
        return result.data;
    },

    fetchComments: async (eventId: string, skip?: number, limit?: number): Promise<Comment[]> => {
        const response = await axiosInstance.get(`/api/comment/${eventId}`, {
            params: {
                skip,
                limit
            }
        });
        return response.data;
    }
}

// import { MockCommentApi } from "./mock";
// const CommentApi = MockCommentApi;
const CommentApi = RealCommentApi;


export default CommentApi;