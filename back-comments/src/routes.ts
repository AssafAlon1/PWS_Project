import { Request, Response } from "express";
import Comment, { ICSComment, commentSchema } from "./models/comment.js";
import { MAX_COMMENTS } from "./const.js";
import { insertComment, queryCommentsByEventId } from "./db.js";
import { StatusCodes } from "http-status-codes";


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
    console.log(err);
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
    const commentData = req.body as ICSComment;

    // Validate the event data
    const { value, error } = commentSchema.validate(commentData, { abortEarly: false, allowUnknown: true, presence: 'required' });

    if (error) {
      throw Error("Bad Request.");
    }

    const insertResult = await insertComment(value);

    if (insertResult == StatusCodes.BAD_REQUEST) {
      throw Error("Bad Request.")
    }

    if (insertResult == StatusCodes.INTERNAL_SERVER_ERROR) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
      return;
    }

    res.status(StatusCodes.CREATED).send({ _id: insertResult });
  }
  catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send("Bad Request");
    return;
  }
};

