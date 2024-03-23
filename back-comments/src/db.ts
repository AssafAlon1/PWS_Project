import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Comment, { ICSComment, commentSchema } from "./models/comment.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

export const queryCommentsByEventId = async (eventId: string, skip: number, limit: number): Promise<ICSComment> => {
    const comments = await Comment.find({ eventId: eventId }).sort({ createdAt: 1 }).skip(skip).limit(limit).exec();
    return comments.map(comment => comment.toJSON() as ICSComment);
}

export const insertComment = async (commentData) => {
    const newComment = new Comment(commentData);
    try {
        await newComment.validate();
    }
    catch (err) {
        return StatusCodes.BAD_REQUEST;
    }
    try {
        await newComment.save();
        return newComment._id.toString();
    }
    catch (err) {
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
