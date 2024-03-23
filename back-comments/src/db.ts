import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Comment, { ICSComment, commentSchema } from "./models/comment.js";
import { HTTPError } from "./const.js";

dotenv.config();

export const queryCommentsByEventId = async (eventId: string, skip: number, limit: number): Promise<ICSComment> => {
    const comments = await Comment.find({ eventId: eventId }).sort({ createdAt: 1 }).skip(skip).limit(limit).exec();
    console.log("comments", comments);
    return comments.map(comment => comment.toJSON() as ICSComment);
}

export const insertComment = async (commentData) => {
    const newComment = new Comment(commentData);
    try {
        await newComment.validate();
    }
    catch (err) {
        return HTTPError["ERROR_400"];
    }
    try {
        await newComment.save();
        return newComment._id.toString();
    }
    catch (err) {
        return HTTPError["ERROR_500"];
    }
}
