import { Request, Response } from "express";
import Comment from "./models/comment.js";
import { MAX_COMMENTS } from "./const.js";
import { queryCommentsByEventId } from "./db.js";


export const getComment = async (req: Request, res: Response) => {
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
    res.status(500).send({message: "Internal Server Error"});
    return;
  }

  res.send(JSON.stringify(dbRes));
};

export const createComment = async (req: Request, res: Response) => {
  let comment;
  try {
    comment = new Comment(req.body);
    await comment.validate();
  } catch (err) {
    res.status(400).send({message: "Invalid Comment"});
    return;
  }

  try {
    await comment.save();
  } catch (err) {
    res.status(500).send({message: "Internal Server Error"});
    return;
  }

  res.status(201).send(JSON.stringify({ id: comment.id }));
};




// import { IncomingMessage, ServerResponse } from "http";

// import Comment from "./models/comment.js";

// export const createRoute = (url: string, method: string) => {
//   return `${method} ${url}`;
// };

// export const mainRoute = (req: IncomingMessage, res: ServerResponse) => {
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/html");
//   res.write("<h1>Hello Yedidi</h1>");
//   res.write(`<ul>
//       <li>Add new comment. POST /api/comment</li>
//       <li>Get single comment. GET /api/comment/{id}</li>
//       <li>Get multiple comments. GET /api/comment?skip={skip}&limit={limit}</li>
//   </ul>`);
//   res.end();
// };

// export const getComment = async (req: IncomingMessage, res: ServerResponse) => {
//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const pathArray = url.pathname.split("/");

//   if (pathArray.length > 4) {
//     res.statusCode = 404;
//     res.end("Invalid URL");
//     return;
//   }

//   if (pathArray.length === 4) {
//     let dbRes;
//     try {
//       dbRes = await Comment.findById(pathArray[3]);
//     }
//     catch (err) {
//       res.statusCode = 500;
//       res.end("Internal Server Error");
//       return;
//     }
//     if (!dbRes) {
//       res.statusCode = 404;
//       res.end("Comment not found");
//       return;
//     }
//     res.setHeader("Content-Type", "application/json");
//     res.write(JSON.stringify(dbRes));
//     res.end();
//     return;
//   }
//   else { // if (pathArray.length === 3)
//     let dbRes;

//     /* Implemented pagination with skip and limit query params */
//     let skip;
//     let limit;
//     try{
//       skip = Number(url.searchParams.get("skip") ?? "0");
//       limit = Number(url.searchParams.get("limit") ?? "20");
//       if(skip < 0 || limit < 1){
//         throw new Error();
//       }
//     }catch(err){
//       res.statusCode = 400;
//       res.end("Invalid query params");
//       return;
//     }
    
//     try {
//       dbRes = await Comment.find().skip(skip).limit(limit);
//     }
//     /* ========== */

//     catch (err) {
//       res.statusCode = 500;
//       res.end("Internal Server Error");
//       return;
//     }

//     res.statusCode = 200;
//     res.setHeader("Content-Type", "application/json");
//     res.write(JSON.stringify(dbRes));
//     res.end();
//   }
// };

// export const createComment = async (
//   req: IncomingMessage,
//   res: ServerResponse
// ) => {

//   let body = "";

//   req.on("data", (chunk) => {
//     body += chunk.toString();
//   });

//   req.on("end", async () => {
//     let comment;
//     try {
//       comment = new Comment(JSON.parse(body));
//       /* Added validation for comment properties */
//       await comment.validate();
//       /* ========== */
//     }
//     catch (err) {
//       res.statusCode = 400;
//       res.end("Invalid Comment");
//       return;
//     }

//     try {
//       await comment.save();
//     }
//     catch (err) {
//       res.statusCode = 500;
//       res.end("Internal Server Error");
//       return;
//     }

//     res.setHeader("Content-Type", "application/json");
//     res.statusCode = 201;
//     res.end(JSON.stringify({ id: comment.id }));
//   });
// };
