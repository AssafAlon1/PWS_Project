import { Request, Response } from "express";
import Comment, { ICSComment, commentSchema } from "./models/comment.js";
import { MAX_COMMENTS } from "./const.js";
import { insertComment, queryCommentsByEventId } from "./db.js";
import { StatusCodes } from "http-status-codes";
import { PublisherChannel } from "./publisher-channel.js";

export const getComment = async (req: Request, res: Response) => {
  console.log("GET /api/comments/:eventId");
  const event_id = req.params.eventId;

  let dbRes;

  /* Implemented pagination with skip and limit query params */
  let skip;
  let limit;
  try {
    skip = Number(req.query.skip ?? "0");
    limit = Number(req.query.limit ?? MAX_COMMENTS);
    if (skip < 0 || limit < 1) {
      throw new Error("Invalid query params");
    }
  } catch (err) {
    skip = 0;
    limit = Number(MAX_COMMENTS);
  }

  try {
    dbRes = await queryCommentsByEventId(event_id, skip, limit);
  }

  catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    return;
  }

  res.send(JSON.stringify(dbRes));
};

export const createComment = async (req: Request, res: Response) => {
  try {
    console.log("POST /api/comments");
    const publisherChannel: PublisherChannel = req.publisherChannel;
    const commentData = req.body as ICSComment;

    // Validate the event data
    const { value, error } = commentSchema.validate(commentData, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (error) {
      console.error("Comment schema validation failed");
      throw Error("Bad Request.");
    }

    const insertResult = await insertComment(value);

    if (insertResult == StatusCodes.BAD_REQUEST) {
      console.error("Failed inserting comment to DB");
      throw Error("Bad Request.")
    }

    if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
      console.error("Failed inserting comment to DB");
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
      return;
    }

    await publisherChannel.sendEvent(commentData.eventId);

    res.status(StatusCodes.CREATED).send({ _id: insertResult });
  }
  catch (error) {
    console.error("Encountered error while creating comment: ", error);
    res.status(StatusCodes.BAD_REQUEST).send("Bad Request");
    return;
  }
};
